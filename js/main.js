// Wejście strony głównej (wersja 3).
import { renderGlyphs } from './glyphs.js?v=20261111';

const html = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const weak = navigator.hardwareConcurrency <= 2 || navigator.deviceMemory <= 2;

await renderGlyphs();

if (!reduce && !weak) {
  html.classList.add('motion');
  const start = async () => {
    const { createScene } = await import('./scene.js?v=20261111');
    let gl;
    try { gl = createScene({ textEls: [...document.querySelectorAll('.hero__title svg')] }); }
    catch (e) { console.warn('WebGL niedostępny, zostaje tło CSS', e); return; }
    html.classList.add('gl');
    gsap.ticker.add((time, dt) => gl.update(Math.min(dt, 50) / 1000, time));
  };
  // Scena po pierwszym malowaniu, nigdy przy starcie.
  if (document.readyState === 'complete') setTimeout(start, 0);
  else addEventListener('load', () => setTimeout(start, 0), { once: true });
}
