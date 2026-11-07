/* AI tools jar (section #ai, list .tool-grid): a glass jar with one ball per tool from the list.
     The balls drop into the jar one by one when the section comes into view.
     Balls can be grabbed, thrown and thrown out over the rim; a ball left outside the jar comes back
     after a few seconds. Dragging the jar itself sideways shakes the balls (mouse); the "Shake"
     button does the same for everyone. A tap on a ball (no drag) opens a bubble with the tool's
     name and one sentence that is already on the page (ai.6, ai.12, ai.15, ai.25, ksk-pretor.8).
   The list stays in the HTML and on screen: it is the version for screen readers, the keyboard,
   no JS and reduced motion (then there is no jar at all). The jar is decoration (aria-hidden).
   Touch: only a finger that lands on a ball moves it (balls have touch-action: none, the rest of
   the jar lets the page scroll). Physics: js/physics.js, in the GSAP ticker, only while on screen. */
import { World, circle, box, run, hand } from './physics.js?v=20261110';

const SENTENCE = [
  ['claude', 'jar.claude'], ['chatgpt', 'jar.chatgpt'], ['gemini', 'jar.gemini'], ['perplexity', 'jar.perplexity'],
  ['higgsfield', 'jar.visuals'], ['leonardo', 'jar.visuals'], ['manifold', 'jar.manifold'], ['botpress', 'jar.botpress'],
  ['canva', 'jar.canva'], ['wispr', 'jar.wispr'], ['gsap', 'jar.motion'], ['hyperframes', 'jar.motion'],
  ['playwright', 'jar.playwright'], ['three', 'jar.three'],
];
const t = (k) => (window.i18n ? window.i18n.t(k) : k);

export function initJar({ reduced, gsap }) {
  const tools = document.querySelector('#ai .tools');
  const items = tools ? [...tools.querySelectorAll('.tool-grid .tool')] : [];
  if (reduced || !gsap || !items.length || !window.IntersectionObserver) return;

  /* ---------- DOM ---------- */
  const wrap = document.createElement('div');
  wrap.className = 'jar';
  wrap.innerHTML = `
    <div class="jar__stage" aria-hidden="true">
      <div class="jar__glass jar__glass--back"></div>
      <div class="jar__balls"></div>
      <div class="jar__glass jar__glass--front"></div>
      <div class="jar__bubble" hidden><b class="jar__bubble-name"></b><span class="jar__bubble-text"></span></div>
    </div>
    <button class="btn btn--ghost jar__shake" type="button"></button>`;
  tools.querySelector('.tool-grid').before(wrap);
  tools.classList.add('has-jar');
  const stage = wrap.querySelector('.jar__stage');
  const backSvg = wrap.querySelector('.jar__glass--back');
  const frontSvg = wrap.querySelector('.jar__glass--front');
  const ballsEl = wrap.querySelector('.jar__balls');
  const bubble = wrap.querySelector('.jar__bubble');
  const shakeBtn = wrap.querySelector('.jar__shake');
  const shakeLabel = () => { shakeBtn.textContent = t('jar.shake'); shakeBtn.setAttribute('aria-label', t('jar.shakeLabel')); };
  shakeLabel();
  document.addEventListener('langchange', shakeLabel);

  // The jar's space is there from the start (fixed height, no layout shift); the balls, the glass and
  // the physics are only built when the section comes near the screen (keeps the page start light).
  const nearIO = new IntersectionObserver(([en]) => {
    if (!en.isIntersecting) return;
    nearIO.disconnect();
    setup();
  }, { rootMargin: '600px 0px' });
  nearIO.observe(stage);

  function setup() {
  const tools2 = items.map((li) => {
    const name = li.querySelector('.tool__name')?.textContent.trim() || '';
    const low = name.toLowerCase();
    const key = (SENTENCE.find(([k]) => low.includes(k)) || [])[1];
    const el = document.createElement('span');
    el.className = 'jar__ball';
    const img = li.querySelector('.tool__color');
    if (img) {
      const i = document.createElement('img');
      i.src = img.getAttribute('src'); i.alt = ''; i.decoding = 'async'; i.draggable = false;
      el.appendChild(i);
    } else {
      const mono = li.querySelector('.tool__mono');
      if (mono) el.appendChild(mono.cloneNode(true));
    }
    ballsEl.appendChild(el);
    return { name, key, el, b: null, out: 0 };
  });

  /* ---------- World and geometry ---------- */
  const world = new World({ gravity: 2600, iterations: 8 });
  const G = {}; // stage W/H, jar left/right/top/bottom, wall thickness, ball radius
  let walls = [], jarWalls = [], jx = 0, jv = 0, jPrev = 0, jDrag = null, shake = 0, shakeT = 0;

  /* The glass is a Higgsfield render (assets/higgsfield/jar.webp, cropped to the jar), shown a little
     wider than the photo. Back layer: the jar; front layer: the same picture, faint and screen-blended
     over the balls (glass reflections in front of them), plus a warm accent reflection on the right.
     The physics walls follow the glass: sides 6% of the width, the thick base 11% of the height. */
  const RATIO = 1.25, SIDE = 0.06, BASE = 0.11, RIM = 0.02;
  function geometry() {
    const W = stage.clientWidth, H = stage.clientHeight;
    const small = W < 480;
    let jw = Math.min(W * (small ? 0.8 : 0.78), small ? 300 : 340);
    let jh = jw * RATIO;
    if (jh > H - 24) { jh = H - 24; jw = jh / RATIO; }
    const bottom = H - 4;
    Object.assign(G, {
      W, H, jw, jh, bottom, top: bottom - jh, left: (W - jw) / 2, right: (W + jw) / 2,
      t: jw * SIDE, base: jh * BASE, r: Math.round(Math.max(18, Math.min(30, jw / 10.5))),
    });
  }
  function buildWalls() {
    walls.forEach((w) => world.remove(w)); jarWalls = [];
    const { W, H, top, bottom, left, right, t: th, base, jw, jh } = G;
    const st = { isStatic: true, friction: 0.5, restitution: 0.2 };
    walls = [
      box(W / 2, H + 40, W + 400, 80, st),            // stage floor
      box(-40, H / 2 - 100, 80, H + 400, st),         // stage sides
      box(W + 40, H / 2 - 100, 80, H + 400, st),
      box(W / 2, -40, W + 400, 80, st),               // ceiling: the top of the stage (balls never cover the title)
    ];
    const wallTop = top + jh * RIM;
    jarWalls = [
      box(left + th / 2, (wallTop + bottom) / 2, th, bottom - wallTop, st),
      box(right - th / 2, (wallTop + bottom) / 2, th, bottom - wallTop, st),
      box((left + right) / 2, bottom - base / 2, jw, base, st),
    ];
    jarWalls.forEach((w) => { w.baseX = w.x; });
    walls.push(...jarWalls);
    walls.forEach((w) => world.add(w));
    // walls first in the list: picks and drawing go over the balls only
    world.bodies.sort((a, b) => (b.isStatic ? 1 : 0) - (a.isStatic ? 1 : 0));
  }
  function drawGlass() {
    [backSvg, frontSvg].forEach((el) => Object.assign(el.style, { left: `${G.left}px`, top: `${G.top}px`, width: `${G.jw}px`, height: `${G.jh}px` }));
  }

  function sizeBalls() {
    tools2.forEach((tl) => { tl.el.style.width = tl.el.style.height = `${G.r * 2}px`; });
  }

  /* ---------- Balls in and out ---------- */
  // drop point: the middle of the mouth, away from the rim (a ball hitting the rim bounces out)
  const dropY = () => Math.max(G.r + 4, G.top - G.r * 2.2);
  const mouthX = () => (G.left + G.right) / 2 + (Math.random() - 0.5) * Math.max(0, G.jw - 2 * G.t - 4.4 * G.r) + jx;
  function addBall(tl, x, y) {
    tl.b = world.add(circle(x, y, G.r, { restitution: 0.32, friction: 0.35, data: tl, angularDamping: 0.9 }));
    tl.b.a = (Math.random() - 0.5) * 1.2;
    tl.out = 0;
    tl.el.classList.add('is-in');
  }
  function dropAll(instant) {
    const order = tools2.slice().sort(() => Math.random() - 0.5);
    if (instant) {
      // already settled (paused motion, resize): stacked above the floor, then fast-forwarded
      order.forEach((tl, i) => addBall(tl, mouthX(), G.top + (i % 3) * G.r - Math.floor(i / 3) * G.r * 2.1));
      loop.settle(6);
      return;
    }
    // one by one, each only when the drop point is free (two balls born overlapping fly apart)
    queue = order; queueT = 0;
    loop.keep(0.5);
  }
  function respawn(tl) {
    const b = tl.b;
    b.x = mouthX(); b.y = dropY(); b.vx = 0; b.vy = 120; b.w = 0;
    world.wake(b); tl.out = 0;
    tl.el.classList.remove('is-back'); void tl.el.offsetWidth; tl.el.classList.add('is-back');
    loop.keep(0.3);
  }

  /* ---------- Bubble ---------- */
  let open = null, bubbleTimer = 0;
  function fillBubble(tl) {
    bubble.querySelector('.jar__bubble-name').textContent = tl.name;
    bubble.querySelector('.jar__bubble-text').textContent = tl.key ? t(tl.key) : '';
  }
  function showBubble(tl) {
    if (open === tl) { hideBubble(); return; }
    open = tl; fillBubble(tl);
    bubble.hidden = false;
    bubble.classList.remove('is-in'); void bubble.offsetWidth; bubble.classList.add('is-in');
    tools2.forEach((x) => x.el.classList.toggle('is-picked', x === tl));
    placeBubble();
    clearTimeout(bubbleTimer);
    bubbleTimer = setTimeout(hideBubble, 6000);
  }
  function hideBubble() {
    open = null; bubble.hidden = true; clearTimeout(bubbleTimer);
    tools2.forEach((x) => x.el.classList.remove('is-picked'));
  }
  function placeBubble() {
    if (!open?.b) return;
    const bw = bubble.offsetWidth, bh = bubble.offsetHeight;
    const x = Math.max(bw / 2 + 4, Math.min(G.W - bw / 2 - 4, open.b.x));
    const above = open.b.y - G.r - 10 - bh > -60;
    const y = above ? open.b.y - G.r - 10 : open.b.y + G.r + 10 + bh;
    bubble.style.transform = `translate3d(${(x - bw / 2).toFixed(1)}px, ${(y - bh).toFixed(1)}px, 0)`;
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && open) hideBubble(); });
  document.addEventListener('pointerdown', (e) => { if (open && !e.target.closest?.('.jar__ball')) hideBubble(); }, { passive: true });

  /* ---------- Loop ---------- */
  let queue = [], queueT = 0;
  function feed(h) {
    if (!queue.length || (queueT -= h) > 0) return;
    const y = dropY();
    for (let k = 0; k < 4; k++) {
      const x = mouthX();
      const free = tools2.every((o) => !o.b || (o.b.x - x) ** 2 + (o.b.y - y) ** 2 > (G.r * 2.3) ** 2);
      if (free) { addBall(queue.shift(), x, y); queueT = 0.1; loop.keep(0.4); return; }
    }
  }
  function before(h) {
    feed(h);
    // jar: follows the hand while dragged, springs back when let go, wobbles on "Shake"
    if (shakeT > 0) {
      shakeT = Math.max(0, shakeT - h); shake += h;
      jx = Math.sin(shake * 34) * 22 * (shakeT / 0.9);
      jv = 0;
    } else if (jDrag) {
      jx += (jDrag.target - jx) * Math.min(1, h * 28);
      jv = 0;
    } else if (jx || jv) {
      jv += (-260 * jx - 18 * jv) * h; jx += jv * h;
      if (Math.abs(jx) < 0.05 && Math.abs(jv) < 1) { jx = 0; jv = 0; }
    }
    const vel = (jx - jPrev) / h; jPrev = jx;
    jarWalls.forEach((w) => { w.x = w.baseX + jx; w.vx = vel; });
    if (vel) loop.keep(0.2);
    // balls left outside the jar come back
    const held = world.hand?.b;
    for (const tl of tools2) {
      const b = tl.b;
      if (!b) continue;
      const inside = b.x > G.left + jx && b.x < G.right + jx && b.y > G.top - G.r * 1.5;
      if (inside || b === held) tl.out = 0; else if ((tl.out += h) > 3) respawn(tl);
      if (!inside && b !== held) tl.out = Math.max(tl.out, 1e-3);
    }
  }
  function render() {
    const jt = jx ? `translate3d(${jx.toFixed(2)}px, 0, 0)` : '';
    backSvg.style.transform = frontSvg.style.transform = jt;
    for (const tl of tools2) {
      const b = tl.b;
      if (!b) continue;
      tl.el.style.transform = `translate3d(${(b.x - G.r).toFixed(1)}px, ${(b.y - G.r).toFixed(1)}px, 0) rotate(${b.a.toFixed(3)}rad)`;
    }
    if (open) placeBubble();
  }
  // keep stepping while a ball waits outside the jar (it must come back even if everything sleeps)
  const loop = run({ world, el: stage, gsap, render, before, busy: () => queue.length > 0 || tools2.some((tl) => tl.out > 0) });

  /* ---------- Pointer ---------- */
  const toWorld = (cx, cy) => { const r = stage.getBoundingClientRect(); return { x: cx - r.left, y: cy - r.top }; };
  hand({
    world, el: stage, toWorld,
    pick: (x, y, e) => world.pick(x, y, (b) => !!b.data?.el, e.pointerType === 'touch' ? 6 : 2),
    onGrab: (b) => { stage.classList.add('is-holding'); if (open && open !== b.data) hideBubble(); loop.keep(0.5); },
    onDrop: () => { stage.classList.remove('is-holding'); loop.keep(0.5); },
    onTap: (b) => showBubble(b.data),
  });
  // The jar itself: a mouse drag sideways (the touch version is the Shake button, so the page scrolls)
  stage.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch' || e.defaultPrevented || e.button !== 0 || world.hand) return;
    const p = toWorld(e.clientX, e.clientY);
    if (p.x < G.left + jx || p.x > G.right + jx || p.y < G.top - 24 || p.y > G.bottom) return;
    e.preventDefault();
    jDrag = { id: e.pointerId, x0: e.clientX, target: jx };
    try { stage.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    stage.classList.add('is-shaking');
    world.wake(); loop.keep(1);
  });
  stage.addEventListener('pointermove', (e) => {
    if (!jDrag || e.pointerId !== jDrag.id) return;
    const d = e.clientX - jDrag.x0;
    jDrag.target = Math.max(-80, Math.min(80, d * 0.7));
    loop.keep(0.5);
  });
  const endJar = (e) => { if (jDrag && e.pointerId === jDrag.id) { jDrag = null; stage.classList.remove('is-shaking'); loop.keep(1.5); } };
  stage.addEventListener('pointerup', endJar);
  stage.addEventListener('pointercancel', endJar);

  shakeBtn.addEventListener('click', () => {
    if (window.__motionPaused) return;
    hideBubble();
    shake = 0; shakeT = 0.9;
    world.wake();
    for (const tl of tools2) {
      if (!tl.b) continue;
      tl.b.vy -= 380 + Math.random() * 320;
      tl.b.vx += (Math.random() - 0.5) * 360;
      tl.b.w += (Math.random() - 0.5) * 14;
    }
    loop.keep(1.5);
  });

  /* ---------- Start, resize ---------- */
  geometry(); buildWalls(); drawGlass(); sizeBalls();
  document.addEventListener('langchange', () => { if (open) fillBubble(open); });
  let dropped = false;
  const startIO = new IntersectionObserver(([en]) => {
    if (!en.isIntersecting || dropped) return;
    dropped = true; startIO.disconnect();
    dropAll(!!window.__motionPaused);
  }, { threshold: 0.35 });
  startIO.observe(stage);

  let lastW = G.W, rt = 0;
  new ResizeObserver(() => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      if (Math.abs(stage.clientWidth - lastW) < 2) return;
      lastW = stage.clientWidth;
      geometry(); buildWalls(); drawGlass(); sizeBalls();
      if (!dropped) return;
      hideBubble();
      tools2.forEach((tl) => { if (tl.b) world.remove(tl.b); tl.b = null; });
      dropAll(true);
    }, 160);
  }).observe(stage);
  }
}
