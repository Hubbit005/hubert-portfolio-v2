import { addInertia } from './inertia.js?v=20261206';
// Tor poziomy strony projektu (desktop): pionowy scroll przez Lenis przesuwa panele w lewo,
// obraz w panelu jedzie wolniej (parallax), panel spoza ekranu wchodzi raz przy pierwszym pojawieniu.
// Wszystko w tickerze GSAP, tylko transform. GSAP i Lenis pobierane dopiero tutaj: telefon ich nie ładuje.
const load = (f) => new Promise((ok, err) => document.head.append(Object.assign(document.createElement('script'),
  { src: new URL(`../vendor/js/${f}`, import.meta.url).href, onload: ok, onerror: err })));

export async function initTrack(strip) {
  const libs = Promise.all([load('gsap.min.js'), load('lenis.min.js')]);
  const project = strip.parentElement;
  const boxes = [...strip.querySelectorAll('.card:not(.card--s, .card--static), .card--s:not(.card--static) > div')]
    .map((el) => ({ el, m: [...el.querySelectorAll('img, video')] }));
  let top = 0, L = 0, x = -1;

  const measure = () => {
    L = Math.max(0, strip.offsetWidth - innerWidth); // ostatni panel kończy się 63 px przed krawędzią (padding)
    project.style.height = L + innerHeight + 'px';
    top = project.offsetTop;
    for (const b of boxes) { b.left = b.el.offsetLeft; b.w = b.el.offsetWidth; } // offsetLeft pomija transformy
    x = -1;
  };
  measure();
  addEventListener('resize', measure);

  // Wejście: tylko panele, które startują za prawą krawędzią ekranu.
  const io = new IntersectionObserver((es) => es.forEach(({ target, isIntersecting }) => {
    if (isIntersecting) { target.classList.remove('pre'); io.unobserve(target); }
  }));
  const x0 = scrollY - top;
  for (const c of strip.children) if (c.offsetLeft - x0 >= innerWidth) { c.classList.add('pre'); io.observe(c); }

  await libs;
  const lenis = new Lenis({ autoRaf: false, lerp: .08, wheelMultiplier: 1, gestureOrientation: 'both' });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  addInertia(lenis, () => innerWidth); // tor: 1 px scrolla = 1 px przesuwu w poziomie
  gsap.ticker.add(() => {
    const nx = Math.min(Math.max(lenis.scroll - top, 0), L);
    if (nx === x) return;
    x = nx;
    strip.style.transform = `translate3d(${-x}px, 0, 0)`;
    const h = innerWidth / 2;
    for (const b of boxes) {
      // -1 (panel wychodzi z lewej) … 1 (wchodzi z prawej)
      const r = Math.min(1, Math.max(-1, (b.left - x + b.w / 2 - h) / (h + b.w / 2)));
      for (const m of b.m) m.style.transform = `translate3d(${-r * .06 * b.w}px, 0, 0)`;
    }
  });
}
