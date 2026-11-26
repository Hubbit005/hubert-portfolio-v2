// Strona projektu: przypięty panel, siatka obrazów przewijana zwykłym scrollem, CLOSE i Esc.
import { renderGlyphs } from './glyphs.js?v=20261126';
import { initLang } from './i18n.js?v=20261126';

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const strip = document.querySelector('.strip');
const close = document.querySelector('.close');

initLang('../');
await renderGlyphs(document, '../');

addEventListener('keydown', (e) => { if (e.key === 'Escape') location.href = close.href; });

// Wideo w karcie gra bez dźwięku tylko na ekranie; przy reduced motion stoi z kontrolkami.
const io = new IntersectionObserver((es) => es.forEach(({ target: v, isIntersecting }) => {
  if (isIntersecting) v.play().catch(() => {}); else v.pause();
}), { threshold: .35 });
for (const v of strip.querySelectorAll('video')) reduce ? (v.controls = true) : io.observe(v);
