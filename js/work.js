// Strona projektu: przypięty panel, taśma zdjęć przesuwana scrollem w bok, CLOSE i Esc.
import { renderGlyphs } from './glyphs.js?v=20261111';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const weak = navigator.hardwareConcurrency <= 2 || navigator.deviceMemory <= 2;
const desktop = matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)').matches;
const strip = document.querySelector('.strip');
const close = document.querySelector('.close');

await renderGlyphs(document, '../');

addEventListener('keydown', (e) => { if (e.key === 'Escape') location.href = close.href; });

// Desktop: kółko, gładzik i strzałki przesuwają taśmę; na końcu taśmy strona stoi.
let lenis;
if (desktop) {
  lenis = new Lenis({ wrapper: strip, content: strip, eventsTarget: window, orientation: 'horizontal', gestureOrientation: 'both', autoRaf: false, lerp: reduce ? 1 : .1 });
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  const step = { ArrowDown: 1, ArrowRight: 1, PageDown: 3, ArrowUp: -1, ArrowLeft: -1, PageUp: -3 };
  addEventListener('keydown', (e) => {
    if (!(e.key in step) || e.altKey || e.ctrlKey || e.metaKey) return;
    e.preventDefault();
    lenis.scrollTo(lenis.targetScroll + step[e.key] * 260 * innerWidth / 1440);
  });
}

// Wideo w karcie gra bez dźwięku tylko na ekranie; przy reduced motion stoi z kontrolkami.
const io = new IntersectionObserver((es) => es.forEach(({ target: v, isIntersecting }) => {
  if (isIntersecting) v.play().catch(() => {}); else v.pause();
}), { threshold: .35 });
for (const v of strip.querySelectorAll('video')) reduce ? (v.controls = true) : io.observe(v);

// Scena (budyń i światło, bez kryształu) po pierwszym malowaniu.
if (!reduce && !weak) {
  document.documentElement.classList.add('motion');
  const start = async () => {
    const { createScene } = await import('./scene.js?v=20261111');
    try {
      const gl = createScene();
      document.documentElement.classList.add('gl');
      gsap.ticker.add((t, dt) => gl.update(Math.min(dt, 50) / 1000, t));
    } catch (e) { console.warn('WebGL niedostępny, zostaje tło CSS', e); }
  };
  if (document.readyState === 'complete') setTimeout(start, 0);
  else addEventListener('load', () => setTimeout(start, 0), { once: true });
}
