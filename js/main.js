// Wejście strony głównej (wersja 3): glify, przewijanie sekcja po sekcji, scena z kryształem.
import { renderGlyphs, afterFirstPaint } from './glyphs.js?v=20261111';

const html = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const weak = navigator.hardwareConcurrency <= 2 || navigator.deviceMemory <= 2;
const touch = matchMedia('(hover: none), (pointer: coarse)').matches;
const phone = matchMedia('(max-width: 767px)');

await renderGlyphs();

// Powrót ze strony projektu (?w=): ten projekt „pod kursorem”, dopóki kursor się nie ruszy.
const back = document.querySelector(`.works__list a[href="work/${new URLSearchParams(location.search).get('w')}.html"]`);
back?.classList.add('is-active');
const moved = (fn) => addEventListener('pointermove', function h(e) {
  if (!e.movementX && !e.movementY) return; // przeglądarka wysyła też sztuczne ruchy po zmianie układu
  removeEventListener('pointermove', h); fn(e);
});
if (back) moved((e) => { if (!back.contains(e.target)) back.classList.remove('is-active'); });

if (!reduce && !weak) startMotion();

function startMotion() {
  html.classList.add('motion');
  const secs = [...document.querySelectorAll('.sec')];
  const links = [...document.querySelectorAll('.works__list a')];
  const HOLD = .4, STEP = 1 + HOLD, END = (secs.length - 1) * STEP + HOLD; // w ekranach przewijania

  const lenis = new Lenis({ autoRaf: false });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  const maxScroll = () => document.documentElement.scrollHeight - innerHeight;
  const progress = () => lenis.scroll / Math.max(1, maxScroll()) * END;
  const goTo = (k, immediate = true) => lenis.scrollTo(k * STEP / END * maxScroll(), { immediate, force: true });

  // Skala projektu: 1440 x 900 albo 390 x 844, ramka wyśrodkowana w pionie.
  const frame = () => {
    const m = phone.matches, u = innerWidth / (m ? 390 : 1440), fh = (m ? 844 : 900) * u;
    return { m, u, top: (innerHeight - fh) / 2 };
  };

  // Przejście: 0–40% sekcja gaśnie w górę, 40–60% sam kryształ, 60–100% następna wchodzi z dołu.
  let active = 0;
  function sections(p, f) {
    const k = Math.min(Math.floor(p / STEP), secs.length - 1), t = Math.max(0, p - k * STEP - HOLD);
    secs.forEach((s, i) => {
      let o = 0, y = 0;
      if (i === k) { o = t < .4 ? 1 - t / .4 : 0; y = -40 * Math.min(1, t / .4); }
      if (i === k + 1 && t > .6) { o = (t - .6) / .4; y = 40 * (1 - o); }
      s.style.opacity = o;
      s.style.transform = `translate3d(0, ${y * f.u}px, 0)`;
      s.style.pointerEvents = o > .5 ? '' : 'none';
    });
    active = t > .5 ? k + 1 : k;
    return { k, t: Math.min(1, t) };
  }

  // Klawiatura: fokus w ukrytej sekcji przewija do niej (kolejność tabulacji bez zmian).
  secs.forEach((s, i) => s.addEventListener('focusin', () => { if (active !== i) goTo(i); }));
  const hashIndex = secs.findIndex((s) => '#' + s.id === location.hash);
  if (hashIndex > 0) requestAnimationFrame(() => goTo(hashIndex));
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    const i = a ? secs.findIndex((s) => '#' + s.id === a.getAttribute('href')) : -1;
    if (i >= 0) { e.preventDefault(); goTo(i, false); }
  });

  // Bez sceny sekcje i tak przechodzą jedna w drugą.
  let gl = null, crystal = null;
  gsap.ticker.add(() => { if (!gl) sections(progress(), frame()); });

  const start = async () => {
    const { createScene } = await import('./scene.js?v=20261111');
    try { gl = createScene({ textEls: [...document.querySelectorAll('.hero__title svg')] }); }
    catch (e) { console.warn('WebGL niedostępny, zostaje tło CSS', e); return; }
    html.classList.add('gl');
    const titleSvgs = [...document.querySelectorAll('.hero__title svg')];
    // Ramka napisu w hero w px projektu (mierzona na postoju hero, potem z pamięci).
    let tb = null;
    const titleBox = (f, live) => {
      if ((live || !tb) && titleSvgs.length === 2) {
        const a = titleSvgs[0].getBoundingClientRect(), b = titleSvgs[1].getBoundingClientRect();
        tb = { x: b.left / f.u, w: b.width / f.u, y: (a.top - f.top) / f.u, h: (b.bottom - a.top) / f.u };
      }
      return tb;
    };
    const pose = crystalPath(STEP, HOLD, titleBox);
    gl.beforeRender = (dt) => {
      const f = frame(), p = progress(), st = sections(p, f);
      const c = pose(p, st, dt, f);
      const x = c.x * f.u, y = c.y * f.u + f.top, s = c.s * f.u;
      crystal?.set(x, y, s, c.z * f.u);
      crystal?.update(dt);
      const { H } = gl.size();
      gl.lightAt = { x, y: H - y };
      const hero = +secs[0].style.opacity;
      gl.textUniforms.uAlpha.value = hero;
      // poświata sekcji: w hero stała plama (780–1340, 260–820), dalej przy krysztale
      const hx = 1060 * f.u, hy = 540 * f.u + f.top, a = Math.min(1, p / STEP);
      gl.bgUniforms.uGlow.value.set(hx + (x - hx) * a, H - (hy + (y - hy) * a));
      gl.bgUniforms.uGlowA.value = f.m ? .5 : 1;
    };
    gsap.ticker.add((t, dt) => gl.update(Math.min(dt, 50) / 1000, t));

    const { addCrystal } = await import('./crystal.js?v=20261111');
    crystal = await addCrystal(gl);
    html.classList.add('crystal');
    if (!touch) addEventListener('pointermove', (e) => crystal.tilt(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1), { passive: true });
    bindWorks();
  };
  afterFirstPaint(start);

  // Hover na projekcie: kryształ obraca się ścianą projektu, zdjęcie widać tylko przez szkło.
  function bindWorks() {
    let current = null;
    const show = (a) => {
      if (current === a) return;
      current?.classList.remove('is-active');
      current = a;
      if (!a) return crystal.face(-1);
      if (touch) a.classList.add('is-active');
      crystal.face(+a.dataset.face, a.dataset.img);
    };
    for (const a of links) {
      if (!touch) {
        a.addEventListener('pointerenter', () => show(a));
        a.addEventListener('pointerleave', () => show(null));
        a.addEventListener('focus', () => show(a));
        a.addEventListener('blur', () => show(null));
      }
      // Telefon: pierwsze tapnięcie obraca kryształ, drugie otwiera stronę projektu.
      a.addEventListener('click', (e) => { if (touch && !a.classList.contains('is-active')) { e.preventDefault(); show(null); show(a); } });
    }
    if (touch) document.addEventListener('click', (e) => { if (!e.target.closest('.works__list a')) show(null); });
    if (back?.classList.contains('is-active')) {
      show(back); back.classList.add('is-active');
      moved((e) => { if (current === back && !back.contains(e.target)) show(null); });
    }
  }
}

// Tor kryształu (brief 16, sekcja 6) we współrzędnych projektu: środek x, y, rozmiar s, głębokość z.
// Hero (zmiana 11.11): kryształ jeździ w pętli po trasie narysowanej przez Huberta, zawsze przed napisem.
// Punkty: u = 0–1 wzdłuż szerokości SKONIECZNY, v = 0 góra HUBERT, 1 dół SKONIECZNY.
const ROUTE = [
  [.76, .24], [.80, .16], [.76, .12], [.66, .15], [.527, .39], [.44, .48], [.35, .59], [.217, .70],
  [.137, .71], [.124, .76], [.15, .80], [.26, .80], [.394, .78], [.48, .59], [.57, .44], [.686, .31],
];
const LOOP = 14; // s na jedno okrążenie

// Zamknięty Catmull-Rom, próbkowany równo po długości (stała prędkość) dla danej ramki napisu.
function routeSampler() {
  let key = '', pts = [];
  const cr = (a, b, c, d, t) => .5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);
  return (box, phase) => {
    const k = [box.x, box.y, box.w, box.h].map(Math.round).join();
    if (k !== key) {
      key = k;
      const P = ROUTE.map(([u, v]) => [box.x + u * box.w, box.y + v * box.h]), N = P.length, raw = [];
      for (let i = 0; i < N; i++) for (let s = 0; s < 40; s++) {
        const [a, b, c, d] = [-1, 0, 1, 2].map((o) => P[(i + o + N) % N]), t = s / 40;
        raw.push([cr(a[0], b[0], c[0], d[0], t), cr(a[1], b[1], c[1], d[1], t)]);
      }
      let L = 0; pts = raw.map((q, i) => { if (i) L += Math.hypot(q[0] - raw[i - 1][0], q[1] - raw[i - 1][1]); return [q[0], q[1], L]; });
      const total = L + Math.hypot(raw[0][0] - raw.at(-1)[0], raw[0][1] - raw.at(-1)[1]);
      pts.total = total;
    }
    const d = (phase % 1) * pts.total;
    let lo = 0, hi = pts.length - 1;
    while (lo < hi) { const m = (lo + hi + 1) >> 1; if (pts[m][2] <= d) lo = m; else hi = m - 1; }
    const a = pts[lo], b = pts[(lo + 1) % pts.length], seg = (b[2] || pts.total) - a[2], t = seg > 0 ? (d - a[2]) / seg : 0;
    return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t };
  };
}

function crystalPath(STEP, HOLD, titleBox) {
  const D = [null, { x: 950, y: 430, s: 300 }, { x: 720, y: 230, s: 120 }, { x: 720, y: 325, s: 90 }];
  const M = [null, { x: 435, y: 360, s: 420 }, { x: 390, y: 270, s: 300 }, { x: 370, y: 310, s: 260 }];
  const MID = { x: 1090, y: 450 };
  const ease = (t) => t * t * (3 - 2 * t);
  const route = routeSampler();
  let orbit = 0;
  const hero = (m, f, live) => {
    const box = titleBox(f, live) ?? (m ? { x: 40, y: 300, w: 310, h: 120 } : { x: 284, y: 250, w: 873, h: 322 });
    const q = route(box, orbit / LOOP);
    return { x: q.x, y: q.y, s: m ? 64 : 140, z: 60 }; // zawsze przed literami (decyzja Huberta 11.11)
  };
  return (p, { k, t }, dt, f) => {
    if (p <= HOLD) orbit += dt;
    const P = f.m ? M : D;
    const from = k === 0 ? hero(f.m, f, p <= HOLD && t === 0) : { ...P[k], z: 0 };
    if (t === 0 || k >= 3) return from;
    const to = { ...P[k + 1], z: 0 }, e = ease(t);
    const lerp = (a, b) => a + (b - a) * e;
    if (k === 0 && !f.m) {
      // łuk przez (1090, 450) w połowie przejścia (krzywa Béziera przez punkt środkowy)
      const cx = 2 * MID.x - (from.x + to.x) / 2, cy = 2 * MID.y - (from.y + to.y) / 2;
      const b = (a, c, d) => (1 - e) * (1 - e) * a + 2 * (1 - e) * e * c + e * e * d;
      return { x: b(from.x, cx, to.x), y: b(from.y, cy, to.y), s: lerp(from.s, to.s), z: lerp(from.z, 0) };
    }
    return { x: lerp(from.x, to.x), y: lerp(from.y, to.y), s: lerp(from.s, to.s), z: lerp(from.z, 0) };
  };
}
