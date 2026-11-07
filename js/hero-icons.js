/* Chrome icons around the 3D word in the hero (decision of 7.11.2026, task 09).
   Eight chrome objects (Higgsfield renders) float around HUBERT: guitar, dumbbell, car, mustache,
   cards, dollar, diamond, galaxy. Physics from js/physics.js without gravity: each icon drifts on a
   small orbit around its home and sways a little. They can be grabbed, thrown, knocked into each other
   and they bounce off the hero's edges. The word, the role line, the lead, the buttons and the roulette
   button are walls, so the icons never cover them. About 5 s after the last touch the icons glide
   back onto their orbits. Sizes 90–150 px (desktop); the small ones are softer and darker, as if
   further back. A soft shadow in --glow-rgb.
   Roulette open: the icons drift to the sides and dim. Phones: 4 icons, smaller; a tap tosses one
   (no dragging, the page always scrolls). Loaded after the hero's 3D word has started (or after
   the page load without WebGL), so they never slow the first view.
   Decorative (aria-hidden). Reduced motion or paused motion: the icons stand still at home. */
import { World, circle, box, run, hand } from './physics.js?v=20261107';

// home: share of the hero's width / height; s: size in px (desktop); z: depth 0 (near) … 1 (far)
const DESK = [
  { id: 'guitar', x: 0.08, y: 0.20, s: 150, z: 0 },
  { id: 'dumbbell', x: 0.30, y: 0.13, s: 104, z: 0.7 },
  { id: 'car', x: 0.72, y: 0.14, s: 128, z: 0.3 },
  { id: 'mustache', x: 0.93, y: 0.24, s: 96, z: 0.9 },
  { id: 'galaxy', x: 0.50, y: 0.84, s: 92, z: 1 },
  { id: 'dollar', x: 0.80, y: 0.68, s: 112, z: 0.5 },
  { id: 'cards', x: 0.94, y: 0.80, s: 132, z: 0.2 },
  { id: 'diamond', x: 0.67, y: 0.88, s: 120, z: 0.4 },
];
const PHONE = [
  { id: 'guitar', x: 0.13, y: 0.20, s: 74, z: 0 },
  { id: 'car', x: 0.86, y: 0.21, s: 70, z: 0.3 },
  { id: 'diamond', x: 0.88, y: 0.49, s: 58, z: 0.5 },
  { id: 'dollar', x: 0.10, y: 0.49, s: 56, z: 0.6 },
];
const IDLE = 5; // s without touching before the icons go home

export function initHeroIcons({ reduced, gsap }) {
  const hero = document.getElementById('home');
  const stage = document.getElementById('hero-stage');
  if (!hero || !stage || !gsap) return;
  const phone = matchMedia('(max-width: 700px), (pointer: coarse)').matches;
  const LIST = phone ? PHONE : DESK;

  // Start after the 3D word (class is-3d) or, without it, after load + idle time.
  let started = false;
  const go = () => { if (!started) { started = true; (window.requestIdleCallback || setTimeout)(() => build(), { timeout: 1500 }); } };
  if (stage.classList.contains('is-3d')) go();
  else {
    const mo = new MutationObserver(() => { if (stage.classList.contains('is-3d')) { mo.disconnect(); go(); } });
    mo.observe(stage, { attributes: true, attributeFilter: ['class'] });
    // without the 3D word (no WebGL): after load on desktop; on phones only after a first touch/scroll
    const later = () => {
      if (!phone) { setTimeout(go, 1200); return; }
      const ev = ['pointerdown', 'touchstart', 'wheel', 'scroll', 'keydown'];
      const once = () => { ev.forEach((e) => window.removeEventListener(e, once, true)); setTimeout(go, 400); };
      ev.forEach((e) => window.addEventListener(e, once, { capture: true, passive: true }));
    };
    if (document.readyState === 'complete') later(); else window.addEventListener('load', later, { once: true });
  }

  function build() {
    const layer = document.createElement('div');
    layer.className = 'hero-icons';
    layer.setAttribute('aria-hidden', 'true');
    const size = phone ? 256 : 512;
    const icons = LIST.map((d, i) => {
      const el = document.createElement('img');
      el.className = 'hero-icon';
      el.src = `assets/hf/icons/${d.id}-${size}.webp`;
      el.alt = '';
      el.decoding = 'async';
      el.draggable = false;
      el.style.setProperty('--z', d.z);
      el.style.width = `${d.s}px`;
      layer.appendChild(el);
      return { ...d, el, i, b: null, home: { x: 0, y: 0 }, phase: Math.random() * Math.PI * 2, per: 7 + Math.random() * 6, orbit: 10 + Math.random() * 12 };
    });
    hero.appendChild(layer);

    const world = new World({ gravity: 0, iterations: 6 });
    let walls = [];
    let W = 1, H = 1, t = 0, lastTouch = -1e9, roulette = hero.classList.contains('is-roulette');

    function measure() {
      const hr = hero.getBoundingClientRect();
      W = hr.width; H = hr.height;
      walls.forEach((w) => world.remove(w)); walls = [];
      const st = { isStatic: true, restitution: 0.5, friction: 0.2 };
      // top wall under the fixed nav
      const navH = (document.getElementById('nav')?.offsetHeight || 64) + 6;
      walls.push(box(W / 2, navH - 40, W + 200, 80, st), box(W / 2, H + 40, W + 200, 80, st), box(-40, H / 2, 80, H + 200, st), box(W + 40, H / 2, 80, H + 200, st));
      // Things the icons must never cover: the word (the bar and the word's band), text and buttons
      const word = wordBox(hr);
      const parts = [word, ...['.hero__role', '.hero__lead', '.hero__cta .btn', '#roulette-open'].flatMap((s) => [...hero.querySelectorAll(s)]).map((el) => el.getBoundingClientRect())];
      parts.forEach((r) => {
        if (!r || !r.width) return;
        const x = r.left - hr.left, y = r.top - hr.top;
        // group 2: the hero's text walls; they stop counting while the roulette is open (text hidden)
        walls.push(box(x + r.width / 2, y + r.height / 2, r.width + 16, r.height + 16, { ...st, group: 2 }));
      });
      walls.forEach((w) => world.add(w));
      world.bodies.sort((a, b) => (b.isStatic ? 1 : 0) - (a.isStatic ? 1 : 0));
      icons.forEach((ic) => {
        // the circle covers the longer side, so tall icons (dollar, guitar) never reach the text
        const r = Math.max(ic.el.offsetWidth || ic.s, ic.el.offsetHeight || ic.s) * 0.44;
        ic.home = { x: ic.x * W, y: ic.y * H };
        if (!ic.b) {
          ic.b = world.add(circle(ic.home.x, ic.home.y, r, { restitution: 0.6, friction: 0.1, linearDamping: 0.9, angularDamping: 1.2, data: ic }));
        } else {
          ic.b.r = r; ic.b.x = ic.home.x; ic.b.y = ic.home.y; ic.b.vx = ic.b.vy = 0;
        }
      });
    }
    // The word's visible extent: the stage's font size gives the 3D word's height; its width is the
    // word on the front of the cylinder (about 6 em, never wider than 84% of the hero, see hero.js).
    function wordBox(hr) {
      const sr = stage.getBoundingClientRect();
      const fs = parseFloat(getComputedStyle(stage.querySelector('.hero__title') || stage).fontSize) || 100;
      const w = Math.min(hr.width * 0.86, fs * 6.4), h = fs * 1.95;
      return { left: sr.left + sr.width / 2 - w / 2, top: sr.top + sr.height / 2 - h / 2, width: w, height: h };
    }

    // Where an icon wants to be now: its orbit, or the hero's sides while the roulette is open
    function target(ic) {
      if (roulette) {
        // half on each side (alternating in the order of their homes), below the sound button
        const order = icons.slice().sort((a, b) => a.home.x - b.home.x || a.home.y - b.home.y);
        const left = order.indexOf(ic) < Math.ceil(icons.length / 2);
        const side = order.filter((o, j) => (j < Math.ceil(icons.length / 2)) === left).sort((a, b) => a.home.y - b.home.y);
        const k = side.indexOf(ic), n = Math.max(1, side.length - 1);
        const top = Math.max(150, H * 0.2), bottom = H * 0.88;
        const m = Math.max(W * 0.05, ic.b.r + 8); // fully on screen
        return { x: left ? m : W - m, y: side.length > 1 ? top + (bottom - top) * (k / n) : (top + bottom) / 2 };
      }
      const a = (t / ic.per) * Math.PI * 2 + ic.phase;
      return { x: ic.home.x + Math.cos(a) * ic.orbit, y: ic.home.y + Math.sin(a * 1.3) * ic.orbit * 0.7 };
    }

    function before(h) {
      t += h;
      const free = !roulette && (t - lastTouch < IDLE || world.hand);
      for (const ic of icons) {
        const b = ic.b;
        if (world.hand?.b === b) continue;
        if (free) continue; // thrown: free flight, slowed by damping, bouncing off walls
        const p = target(ic);
        const k = roulette ? 10 : 6, c = roulette ? 6 : 4.5;
        b.vx += ((p.x - b.x) * k - b.vx * c) * h;
        b.vy += ((p.y - b.y) * k - b.vy * c) * h;
        const sway = Math.sin(t * (6.28 / ic.per) * 0.8 + ic.phase) * 0.12;
        b.w += ((sway - wrapA(b.a)) * 5 - b.w * 3) * h;
        b.sleeping = false; b.still = 0;
      }
    }
    const wrapA = (a) => Math.atan2(Math.sin(a), Math.cos(a));
    function render() {
      for (const ic of icons) {
        const b = ic.b;
        const w = ic.el.offsetWidth || ic.s, hh = ic.el.offsetHeight || ic.s;
        ic.el.style.transform = `translate3d(${(b.x - w / 2).toFixed(1)}px, ${(b.y - hh / 2).toFixed(1)}px, 0) rotate(${b.a.toFixed(3)}rad)`;
      }
    }

    // Wait for the images (their height) before placing them
    Promise.all(icons.map((ic) => (ic.el.complete ? 1 : new Promise((r) => { ic.el.onload = ic.el.onerror = r; })))).then(() => {
      measure(); render();
      layer.classList.add('is-in');
      if (reduced) {
        // static: they stay at home, and only dim while the roulette is open
        new MutationObserver(() => layer.classList.toggle('is-away', hero.classList.contains('is-roulette'))).observe(hero, { attributes: true, attributeFilter: ['class'] });
        return;
      }
      const loop = run({ world, el: hero, gsap, render, before, busy: () => true, hz: phone ? 60 : 120, margin: '0px' });
      hand({
        world, el: layer,
        toWorld: (cx, cy) => { const r = hero.getBoundingClientRect(); return { x: cx - r.left, y: cy - r.top }; },
        pick: (x, y, e) => (e.target.classList?.contains('hero-icon') && !roulette ? world.pick(x, y, (b) => !!b.data?.el, e.pointerType === 'touch' ? 8 : 4) : null),
        canDrag: (e) => e.pointerType !== 'touch',
        onGrab: () => { lastTouch = t; layer.classList.add('is-holding'); },
        onDrop: () => { lastTouch = t; layer.classList.remove('is-holding'); },
        onTap: (b, e) => {
          lastTouch = t;
          if (e.pointerType !== 'touch') { b.w += (Math.random() < 0.5 ? -1 : 1) * 6; return; }
          // up and towards the middle (the nav sits right above the top icons)
          b.vy -= 380 + Math.random() * 200;
          b.vx += Math.max(-420, Math.min(420, (W / 2 - b.x) * 1.4)) + (Math.random() - 0.5) * 160;
          b.w += (Math.random() < 0.5 ? -1 : 1) * (6 + Math.random() * 6);
        },
      });
      // the held icon keeps the touch clock running
      gsap.ticker.add(() => { if (world.hand) lastTouch = t; });
      const ro = new MutationObserver(() => {
        const on = hero.classList.contains('is-roulette');
        if (on === roulette) return;
        roulette = on; lastTouch = -1e9;
        layer.classList.toggle('is-away', on);
        icons.forEach((ic) => { ic.b.mask = on ? 0xffff & ~2 : 0xffff; world.wake(ic.b); });
      });
      ro.observe(hero, { attributes: true, attributeFilter: ['class'] });
      // paused motion: back home and still
      const pause = () => { if (window.__motionPaused) { icons.forEach((ic) => { ic.b.x = ic.home.x; ic.b.y = ic.home.y; ic.b.vx = ic.b.vy = ic.b.w = 0; ic.b.a = 0; }); render(); } };
      document.addEventListener('motionpause', pause);
      pause();
      let rt = 0;
      window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { measure(); render(); }, 200); });
      document.addEventListener('langchange', () => requestAnimationFrame(() => { measure(); render(); }));
      void loop;
    });
  }
}
