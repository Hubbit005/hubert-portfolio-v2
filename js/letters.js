/* Footer letters to throw (the HUBERT wordmark, .wordmark).
   When the footer is uncovered and the fill from js/footer.js has finished ('wordmarkready'), each
   letter H-U-B-E-R-T becomes a box in js/physics.js. A letter stays in its place (asleep) until it
   is touched or hit by another letter; then it falls and lands on the footer's top line, the "shelf".
   Mouse / pen: grab, throw, knock the others over. Touch: a tap tosses the letter up (no dragging,
   so the page always scrolls). The e-mail, phone, the copy button, the lead and the title lie above
   the letters (z-index) and are walls for them; the footer row lies below the shelf.
   After about 6 s without touching, the letters glide back into the word; the small "Reset" button
   does it at once. Both lines of the word (outline and fill) move together. Decorative: aria-hidden.
   Reduced motion: never starts. Paused motion: the word goes back and stays still. */
import { World, box, run, hand } from './physics.js?v=20261109';

const t = (k) => (window.i18n ? window.i18n.t(k) : k);
const IDLE = 6;

export function initLetters({ reduced, gsap }) {
  const contact = document.getElementById('contact');
  const word = contact?.querySelector('.wordmark');
  const inner = contact?.querySelector('.footer__inner');
  if (reduced || !gsap || !word || !inner) return;
  const fill = [...word.querySelectorAll('.wordmark__line--fill > span')];
  const stroke = [...word.querySelectorAll('.wordmark__line--stroke > span')];
  if (fill.length !== stroke.length || !fill.length) return;

  // Reset button: only there while the letters are out of place
  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'btn btn--ghost letters-reset';
  resetBtn.hidden = true;
  // next to "Copy e-mail", in the same row: appearing never moves the layout
  const copy = contact.querySelector('#copy-mail');
  if (copy) copy.after(resetBtn); else inner.appendChild(resetBtn);
  const label = () => { resetBtn.textContent = t('letters.reset'); };
  label();
  document.addEventListener('langchange', label);

  const world = new World({ gravity: 2800, iterations: 10 });
  let letters = [];   // { b, home: {x, y}, i }
  let walls = [];
  let active = false, lastTouch = 0, returning = false, loop = null;

  const rel = (r, c) => ({ x: r.left - c.left, y: r.top - c.top, w: r.width, h: r.height });
  function build() {
    walls.forEach((w) => world.remove(w)); letters.forEach((l) => world.remove(l.b));
    walls = []; letters = [];
    const c = contact.getBoundingClientRect();
    const W = c.width, H = c.height;
    // the letters' layout boxes (without the transform the physics wrote)
    const rects = fill.map((el, i) => {
      const sx = el.style.transform; el.style.transform = 'none'; stroke[i].style.transform = 'none';
      const r = rel(el.getBoundingClientRect(), c);
      el.style.transform = sx; stroke[i].style.transform = sx;
      return r;
    });
    const HH = 0.46; // half height of a letter body, as a share of its line box
    // The shelf is exactly under the letters at home: a letter that wakes up does not drop.
    const shelf = Math.max(...rects.map((r) => r.y + r.h / 2 + r.h * HH));
    const st = { isStatic: true, friction: 0.6, restitution: 0.15 };
    walls.push(box(W / 2, shelf + 100, W + 400, 200, st));   // the shelf
    // side walls inside the edges: the glyphs overhang their boxes when they turn
    walls.push(box(-46, H / 2, 120, H * 3, st), box(W + 46, H / 2, 120, H * 3, st));
    walls.push(box(W / 2, -60, W + 400, 120, st));            // top of the contact section
    // Narrow screens: the button row sits right above the word, so the letters fly behind it (it lies
    // above them and gets a solid background); the e-mail and phone stay walls. Text walls are group 2:
    // a letter held by the pointer passes them (it follows the hand), and bounces off them once let go.
    const sel = W < 700 ? '.sec-head__title, .contact__lead, .contact__mail' : '.sec-head__title, .contact__lead, .contact__mail, .contact__actions .btn:not([hidden])';
    contact.querySelectorAll(sel).forEach((el) => {
      const r = rel(el.getBoundingClientRect(), c);
      if (r.w && r.h) walls.push(box(r.x + r.w / 2, r.y + r.h / 2, r.w + 8, r.h + 8, { ...st, group: 2 }));
    });
    walls.forEach((w) => world.add(w));
    rects.forEach((r, i) => {
      // as wide as the letter (the word's tight spacing makes neighbours touch, not overlap)
      const b = box(r.x + r.w / 2, r.y + r.h / 2, r.w * 0.97, r.h * HH * 2, { restitution: 0.25, friction: 0.55, density: 0.0008, angularDamping: 0.4 });
      world.add(b);
      world.sleep(b);
      b.data = { i };
      letters.push({ b, home: { x: b.x, y: b.y }, i });
    });
  }

  function render() {
    for (const l of letters) {
      const { b, home, i } = l;
      const dx = b.x - home.x, dy = b.y - home.y;
      const tr = Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05 && Math.abs(b.a) < 0.0005 ? '' : `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, 0) rotate(${b.a.toFixed(4)}rad)`;
      fill[i].style.transform = tr; stroke[i].style.transform = tr;
    }
  }
  const displaced = () => letters.some(({ b, home }) => Math.abs(b.x - home.x) > 1 || Math.abs(b.y - home.y) > 1 || Math.abs(b.a) > 0.01);

  function home(instant) {
    if (!letters.length) return;
    world.release();
    returning = !instant;
    letters.forEach((l, k) => {
      const { b } = l;
      world.sleep(b);
      gsap.killTweensOf(b);
      // shortest way back to upright
      b.a = Math.atan2(Math.sin(b.a), Math.cos(b.a));
      if (instant) { b.x = l.home.x; b.y = l.home.y; b.a = 0; return; }
      gsap.to(b, {
        x: l.home.x, y: l.home.y, a: 0, duration: 0.9, ease: 'power3.inOut', delay: k * 0.05,
        onUpdate: render,
        onComplete: () => { if (k === letters.length - 1) { returning = false; resetBtn.hidden = true; } },
      });
    });
    if (instant) { render(); resetBtn.hidden = true; }
  }

  function activate() {
    if (active || window.__motionPaused) return;
    active = true;
    word.classList.add('is-physical');
    build();
    loop = loop || run({
      world, el: contact, gsap, render,
      before: () => {
        if (!returning && world.hand) lastTouch = performance.now();
      },
    });
  }
  function deactivate() {
    if (!active) return;
    home(true);
    active = false;
    word.classList.remove('is-physical');
  }

  // Idle check: once a second is enough
  setInterval(() => {
    if (!active || returning || world.hand) return;
    const out = displaced();
    if (out && resetBtn.hidden) resetBtn.hidden = false;
    if (out && performance.now() - lastTouch > IDLE * 1000) home(false);
  }, 1000);

  const toWorld = (cx, cy) => { const r = contact.getBoundingClientRect(); return { x: cx - r.left, y: cy - r.top }; };
  hand({
    world, el: contact, toWorld,
    pick: (x, y, e) => (active && !returning && e.target.closest?.('.wordmark') ? world.pick(x, y, (b) => b.data && 'i' in b.data, e.pointerType === 'touch' ? 10 : 0) : null),
    canDrag: (e) => e.pointerType !== 'touch',
    onGrab: (b) => { b.mask = 0xffff & ~2; lastTouch = performance.now(); contact.classList.add('is-holding'); resetBtn.hidden = false; loop?.keep(0.5); },
    onDrop: (b) => { b.mask = 0xffff; lastTouch = performance.now(); contact.classList.remove('is-holding'); loop?.keep(0.5); },
    onTap: (b, e) => {
      if (e.pointerType !== 'touch') return;
      world.wake(b);
      // up and towards the middle, away from the walls above the left letters
      const W = contact.clientWidth;
      // narrow screens: a low hop with a spin, so the peak stays in sight under the button row
      const narrow = W < 700;
      b.vy = narrow ? -820 - Math.random() * 200 : -1500 - Math.random() * 400;
      b.vx = Math.max(-700, Math.min(700, (W / 2 - b.x) * (narrow ? 1.2 : 2.2))) + (Math.random() - 0.5) * 300;
      b.w = (Math.random() < 0.5 ? -1 : 1) * (8 + Math.random() * 10);
      lastTouch = performance.now();
      resetBtn.hidden = false;
      loop?.keep(0.5);
    },
  });
  resetBtn.addEventListener('click', () => { home(false); });

  document.addEventListener('wordmarkready', activate);
  document.addEventListener('motionpause', (e) => { if (e.detail.paused) deactivate(); else if (word.dataset.ready) activate(); });
  let rt = 0;
  window.addEventListener('resize', () => {
    if (!active) return;
    clearTimeout(rt);
    rt = setTimeout(() => { home(true); build(); }, 200);
  });
  document.addEventListener('langchange', () => { if (active) requestAnimationFrame(() => { home(true); build(); }); });
  if (word.dataset.ready) activate();
}
