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
import { World, circle, box, run, hand } from './physics.js?v=20261106';

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
      <svg class="jar__glass jar__glass--back" focusable="false"></svg>
      <div class="jar__balls"></div>
      <svg class="jar__glass jar__glass--front" focusable="false"></svg>
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
  shakeBtn.textContent = t('jar.shake');
  document.addEventListener('langchange', () => { shakeBtn.textContent = t('jar.shake'); });

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

  function geometry() {
    const W = stage.clientWidth, H = stage.clientHeight;
    const small = W < 480;
    const jw = Math.min(W * (small ? 0.84 : 0.78), small ? 300 : 360);
    const jh = Math.min(H - (small ? 56 : 70), jw * 1.08);
    const bottom = H - 6;
    Object.assign(G, {
      W, H, jw, jh, bottom, top: bottom - jh, left: (W - jw) / 2, right: (W + jw) / 2,
      t: small ? 10 : 12, r: Math.round(Math.max(18, Math.min(30, jw / 10.5))),
    });
  }
  function buildWalls() {
    walls.forEach((w) => world.remove(w)); jarWalls = [];
    const { W, H, top, bottom, left, right, t: th, jw } = G;
    const st = { isStatic: true, friction: 0.5, restitution: 0.2 };
    walls = [
      box(W / 2, H + 40, W + 400, 80, st),            // stage floor
      box(-40, H / 2 - 100, 80, H + 400, st),         // stage sides
      box(W + 40, H / 2 - 100, 80, H + 400, st),
      box(W / 2, -140, W + 400, 80, st),              // ceiling, a little above the stage
    ];
    jarWalls = [
      box(left + th / 2, (top + bottom) / 2, th, bottom - top, st),
      box(right - th / 2, (top + bottom) / 2, th, bottom - top, st),
      box((left + right) / 2, bottom - th / 2, jw, th, st),
    ];
    jarWalls.forEach((w) => { w.baseX = w.x; });
    walls.push(...jarWalls);
    walls.forEach((w) => world.add(w));
    // walls first in the list: picks and drawing go over the balls only
    world.bodies.sort((a, b) => (b.isStatic ? 1 : 0) - (a.isStatic ? 1 : 0));
  }

  /* Glass, drawn for the measured size: back (body tint, far rim) and front (highlights, near rim,
     a warm reflection of the accent on the right). */
  function drawGlass() {
    const { jw, jh, t: th } = G;
    const w = jw, h = jh + 10, rx = Math.min(46, w * 0.16), lip = 16;
    const outline = `M ${th * 0.2} ${lip} L ${th * 0.2} ${h - rx - 6} Q ${th * 0.2} ${h - 4} ${rx} ${h - 4} L ${w - rx} ${h - 4} Q ${w - th * 0.2} ${h - 4} ${w - th * 0.2} ${h - rx - 6} L ${w - th * 0.2} ${lip}`;
    const vb = `0 -6 ${w} ${h + 8}`;
    backSvg.setAttribute('viewBox', vb);
    frontSvg.setAttribute('viewBox', vb);
    backSvg.innerHTML = `
      <defs>
        <linearGradient id="jg-body" x1="0" x2="1">
          <stop offset="0" stop-color="var(--jar-glass)" stop-opacity="0.26"/>
          <stop offset="0.18" stop-color="var(--jar-glass)" stop-opacity="0.07"/>
          <stop offset="0.8" stop-color="var(--jar-glass)" stop-opacity="0.05"/>
          <stop offset="1" stop-color="var(--jar-glass)" stop-opacity="0.22"/>
        </linearGradient>
      </defs>
      <path d="${outline} Z" fill="url(#jg-body)"/>
      <ellipse cx="${w / 2}" cy="${lip}" rx="${w / 2 - 2}" ry="9" fill="none" stroke="var(--jar-edge)" stroke-opacity="0.35" stroke-width="1.5"/>`;
    frontSvg.innerHTML = `
      <defs>
        <linearGradient id="jg-hi" x1="0" x2="1">
          <stop offset="0" stop-color="#fff" stop-opacity="0"/>
          <stop offset="0.45" stop-color="#fff" stop-opacity="0.32"/>
          <stop offset="1" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="jg-warm" x1="0" x2="1">
          <stop offset="0" stop-color="rgb(var(--glow-rgb))" stop-opacity="0"/>
          <stop offset="0.7" stop-color="rgb(var(--glow-rgb))" stop-opacity="0.42"/>
          <stop offset="1" stop-color="rgb(var(--glow-rgb))" stop-opacity="0.12"/>
        </linearGradient>
        <linearGradient id="jg-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff" stop-opacity="0.9"/>
          <stop offset="0.75" stop-color="#fff" stop-opacity="0.5"/>
          <stop offset="1" stop-color="#fff" stop-opacity="0"/>
        </linearGradient>
        <mask id="jg-m"><rect x="0" y="0" width="${w}" height="${h}" fill="url(#jg-fade)"/></mask>
      </defs>
      <path d="${outline}" fill="none" stroke="var(--jar-edge)" stroke-opacity="0.55" stroke-width="1.6"/>
      <g mask="url(#jg-m)">
        <rect x="${w * 0.07}" y="${lip + 14}" width="${w * 0.07}" height="${h - lip - rx - 30}" rx="${w * 0.035}" fill="url(#jg-hi)"/>
        <rect x="${w * 0.17}" y="${lip + 30}" width="${w * 0.018}" height="${(h - lip) * 0.45}" rx="${w * 0.009}" fill="#fff" fill-opacity="0.22"/>
      </g>
      <rect x="${w * 0.8}" y="${lip + 10}" width="${w * 0.17}" height="${h - lip - rx - 10}" rx="${w * 0.06}" fill="url(#jg-warm)"/>
      <path d="M ${rx * 0.7} ${h - 7} Q ${w / 2} ${h + 2} ${w - rx * 0.7} ${h - 7}" fill="none" stroke="var(--jar-edge)" stroke-opacity="0.4" stroke-width="3" stroke-linecap="round"/>
      <path d="M 3 ${lip} A ${w / 2 - 3} 9 0 0 0 ${w - 3} ${lip}" fill="none" stroke="var(--jar-edge)" stroke-opacity="0.7" stroke-width="2"/>
      <path d="M ${w * 0.12} ${lip + 5} A ${w / 2 - 3} 9 0 0 0 ${w * 0.42} ${lip + 8.5}" fill="none" stroke="#fff" stroke-opacity="0.55" stroke-width="1.5" stroke-linecap="round"/>`;
    const vbH = h + 8;
    [backSvg, frontSvg].forEach((s) => Object.assign(s.style, { left: `${G.left}px`, top: `${G.top - lip - 6}px`, width: `${w}px`, height: `${vbH}px` }));
  }

  function sizeBalls() {
    tools2.forEach((tl) => { tl.el.style.width = tl.el.style.height = `${G.r * 2}px`; });
  }

  /* ---------- Balls in and out ---------- */
  // drop point: the middle of the mouth, away from the rim (a ball hitting the rim bounces out)
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
    b.x = mouthX(); b.y = Math.max(-40, G.top - G.r * 2.2); b.vx = 0; b.vy = 120; b.w = 0;
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
    const y = Math.max(-40, G.top - G.r * 2.2);
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
  const loop = run({ world, el: stage, gsap, render, before });

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
      tl.b.vy -= 700 + Math.random() * 700;
      tl.b.vx += (Math.random() - 0.5) * 500;
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
