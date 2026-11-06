/* Selected work: cards fanned on the arc of a large wheel.
   The wheel turns slowly on its own, can be dragged with inertia,
   pauses on hover, and steps with arrow keys or buttons.
   The card nearest the centre lifts and glows from below (centrality 0..1 drives the opacity of its
   glow and lit edge, which are separate elements).
   Performance: each frame only writes transform / opacity (and z-index or visibility when they change);
   nothing is measured in the loop (sizes come from ResizeObserver). The loop sleeps while the wheel
   stands still or is off screen, and wakes on drag, hover end, keys, buttons or resize.
   A click (or Enter) on a card scrolls to its case study; a drag never counts as a click. */

const BASE_SPEED = 0.09;   // cards per second at rest
const OVERLAP = 0.8;       // distance between card centres, in card widths

export function initArc({ reduced }) {
  const viewport = document.getElementById('arc-viewport');
  const track = document.getElementById('arc-track');
  if (!viewport || !track) return null;
  const status = document.getElementById('arc-status');
  const prev = document.getElementById('arc-prev');
  const next = document.getElementById('arc-next');

  const originals = [...track.children];
  const N0 = originals.length;
  const readTitles = () => originals.map((li) => li.querySelector('.card__title')?.textContent.trim() || '');
  let titles = readTitles();

  // Duplicate the set so the wheel looks full on wide screens. Clones are hidden from AT and tab order,
  // but stay clickable: their links point at the same case study.
  originals.forEach((li) => {
    const c = li.cloneNode(true);
    c.setAttribute('aria-hidden', 'true');
    c.querySelectorAll('a').forEach((a) => a.setAttribute('tabindex', '-1'));
    c.dataset.clone = '1';
    track.appendChild(c);
  });
  const items = [...track.children];
  const N = items.length;
  items.forEach((li, i) => { li.dataset.idx = String(i % N0); });
  // Glow under the card and lit bottom edge: own elements, so a frame changes only their opacity.
  const fx = items.map((li) => {
    const glow = document.createElement('i');
    glow.className = 'arc__glow';
    li.prepend(glow);
    const edge = document.createElement('i');
    edge.className = 'card__edge';
    li.querySelector('.card')?.appendChild(edge);
    return { glow, edge };
  });

  let cw = 0, ch = 0, R = 1200, step = 0.15, pxPerCard = 200;
  let offset = 0;            // in cards; card k is centred when offset === k
  let vel = reduced ? 0 : BASE_SPEED;
  let hoverCount = 0;
  let dragging = false, pointerId = null, startX = 0, lastX = 0, lastT = 0, moved = 0, dragVel = 0;
  let tween = null;
  let touched = false;   // after the first user interaction the wheel stays where the user left it
  let idleUntil = 0;
  let visible = true;     // viewport on screen (IntersectionObserver)
  let looping = false;    // a frame is scheduled
  let last = performance.now();
  let lastNearest = -1;
  const zCache = new Array(N).fill(-1);
  const cCache = new Array(N).fill(-1);
  const oCache = new Array(N).fill(-1);
  const LIFT = 14; // px the centre card rises

  function layout() {
    const first = items[0];
    cw = first.offsetWidth; ch = first.offsetHeight;
    const vw = viewport.clientWidth;
    R = Math.max(vw < 600 ? 620 : 900, Math.min(vw * 1.05, 1700));
    step = (cw * (vw >= 1200 ? 1.08 : 0.94)) / R;
    pxPerCard = R * step;
    const top = 44 + ch / 2 + R;   // wheel centre, below the visible area
    track.style.top = `${top}px`;
    items.forEach((li) => { li.style.marginTop = `${-ch / 2}px`; });
    render();
  }

  function wrap(p) {
    const h = N / 2;
    return ((((p + h) % N) + N) % N) - h;
  }

  function render() {
    let nearest = 0, best = 1e9;
    for (let i = 0; i < N; i++) {
      const p = wrap(i - offset);
      const a = p * step;
      const ap = Math.abs(p);
      // fade near the wrap point so the jump is never seen
      const fadeStart = N / 2 - 1.6;
      const op = ap <= fadeStart ? 1 : Math.max(0, 1 - (ap - fadeStart) / 1.2);
      const li = items[i];
      // centrality: 1 on the centre, 0 one card away, smooth in between
      const t = Math.max(0, 1 - ap);
      const c = t * t * (3 - 2 * t);
      li.style.transform = `rotate(${a.toFixed(5)}rad) translate3d(0, ${(-R - c * LIFT).toFixed(2)}px, 0)`;
      const cq = Math.round(c * 200) / 200;
      if (cCache[i] !== cq) { fx[i].glow.style.opacity = fx[i].edge.style.opacity = String(cq); cCache[i] = cq; }
      const oq = Math.round(op * 500) / 500;
      if (oCache[i] !== oq) {
        li.style.opacity = String(oq);
        li.style.visibility = oq < 0.01 ? 'hidden' : 'visible';
        oCache[i] = oq;
      }
      const z = Math.round(200 - ap * 20);
      if (zCache[i] !== z) { li.style.zIndex = String(z); zCache[i] = z; }
      if (ap < best) { best = ap; nearest = i; }
    }
    const idx = nearest % N0;
    if (idx !== lastNearest) {
      lastNearest = idx;
      if (status) status.textContent = titles[idx];
    }
  }

  function goTo(target, dur = 650) {
    touched = true;
    if (reduced) { offset = target; tween = null; render(); return; }
    tween = { from: offset, to: target, t0: performance.now(), dur };
    vel = 0;
    idleUntil = performance.now() + dur + 2600;
    wake();
  }
  function nearestCard() { return Math.round(offset); }
  function stepBy(d) {
    const base = tween ? tween.to : nearestCard();
    goTo(base + d);
  }
  // centre a given original index, taking the shortest way round
  function centreIndex(idx) {
    const cur = tween ? tween.to : offset;
    let best = idx, bd = 1e9;
    for (let k = -3; k <= 3; k++) {
      const cand = idx + k * N0;
      const d = Math.abs(cand - cur);
      if (d < bd) { bd = d; best = cand; }
    }
    goTo(best);
  }

  function wake() {
    if (looping || !visible) return;
    looping = true;
    last = performance.now();
    requestAnimationFrame(tick);
  }
  // Nothing moves: no drag, no tween, no inertia, and either the user has left the wheel on a card
  // or the slow auto-spin is paused by hover.
  function still() {
    if (dragging || tween || Math.abs(vel) > 0.0005) return false;
    if (touched) return Math.abs(offset - Math.round(offset)) <= 0.002;
    return hoverCount > 0 || reduced;
  }

  function tick(now) {
    if (!visible) { looping = false; return; }
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (tween) {
      const t = Math.min(1, (now - tween.t0) / tween.dur);
      const e = 1 - Math.pow(1 - t, 4);
      offset = tween.from + (tween.to - tween.from) * e;
      if (t >= 1) tween = null;
    } else if (!dragging) {
      const paused = hoverCount > 0 || now < idleUntil || reduced || touched;
      const target = paused ? 0 : BASE_SPEED;
      // inertia: release velocity decays towards the base speed
      vel += (target - vel) * (1 - Math.exp(-dt * (Math.abs(vel) > 0.6 ? 1.6 : 2.4)));
      if (reduced) vel = 0;
      offset += vel * dt;
      // once the user has moved the wheel, let it settle with a card exactly in the centre
      if (touched && Math.abs(vel) < 0.12 && Math.abs(offset - Math.round(offset)) > 0.002) goTo(Math.round(offset), 520);
    }
    render();
    if (still()) { looping = false; return; }
    requestAnimationFrame(tick);
  }

  // ----- pointer drag
  viewport.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    dragging = true; pointerId = e.pointerId; touched = true;
    startX = lastX = e.clientX; lastT = performance.now(); moved = 0; dragVel = 0;
    tween = null;
    wake();
  });
  viewport.addEventListener('pointermove', (e) => {
    if (!dragging || e.pointerId !== pointerId) return;
    const dx = e.clientX - lastX;
    const now = performance.now();
    const dtt = Math.max(1, now - lastT);
    lastX = e.clientX; lastT = now;
    moved += Math.abs(dx);
    if (moved > 6 && !viewport.classList.contains('is-dragging')) {
      viewport.classList.add('is-dragging');
      try { viewport.setPointerCapture(pointerId); } catch (_) { /* ignore */ }
    }
    const dCards = -dx / pxPerCard;
    offset += dCards;
    const v = (dCards / dtt) * 1000;
    dragVel = dragVel * 0.6 + v * 0.4;
    // drawn by the running loop in the next frame (one render per frame, not per pointer event)
  });
  const endDrag = (e) => {
    if (!dragging || (e && e.pointerId !== pointerId)) return;
    dragging = false;
    viewport.classList.remove('is-dragging');
    if (moved > 6) {
      if (reduced) { goTo(nearestCard()); }
      else {
        vel = Math.max(-4, Math.min(4, dragVel));
        idleUntil = performance.now() + 1800;
      }
    }
    wake();
  };
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  // Suppress the click that ends a drag
  viewport.addEventListener('click', (e) => {
    if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; }
  }, true);
  viewport.addEventListener('dragstart', (e) => e.preventDefault());

  // ----- hover: pause and lift
  items.forEach((li) => {
    li.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { hoverCount++; li.classList.add('is-hover'); } });
    li.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') { hoverCount = Math.max(0, hoverCount - 1); li.classList.remove('is-hover'); wake(); } });
  });

  // ----- keyboard
  viewport.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      stepBy(e.key === 'ArrowRight' ? 1 : -1);
      if (document.activeElement && document.activeElement.classList.contains('card')) {
        const target = ((Math.round(tween ? tween.to : offset) % N0) + N0) % N0;
        originals[target].querySelector('a').focus({ preventScroll: true });
      }
    } else if (e.key === 'Home') { e.preventDefault(); centreIndex(0); }
    else if (e.key === 'End') { e.preventDefault(); centreIndex(N0 - 1); }
  });
  originals.forEach((li, i) => {
    li.querySelector('a').addEventListener('focus', () => { if (!dragging) centreIndex(i); });
  });
  prev?.addEventListener('click', () => stepBy(-1));
  next?.addEventListener('click', () => stepBy(1));

  // ----- lifecycle
  const ro = new ResizeObserver(() => layout());
  ro.observe(viewport);
  const io = new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    if (visible) wake();
  });
  io.observe(viewport);

  // Language switch: card titles changed, so the status line must be rebuilt.
  document.addEventListener('langchange', () => { titles = readTitles(); lastNearest = -1; render(); });

  layout();
  wake();
  return { goTo, centreIndex };
}
