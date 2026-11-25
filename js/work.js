// Strona projektu: kolumna z opisem, panele (na desktopie tor poziomy z js/work-track.js), wideo, CLOSE i Esc.
import { renderGlyphs } from './glyphs.js?v=20261125';
import { initLang } from './i18n.js?v=20261125';
import { initTrack } from './work-track.js?v=20261125';

const html = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const strip = document.querySelector('.strip');
const close = document.querySelector('.close');

addEventListener('keydown', (e) => { if (e.key === 'Escape') location.href = close.href; });

// Klasę .track ustawia skrypt w <head> (ten sam warunek). Przejście przez próg = nowy układ.
// shortcut: przeładowanie strony zamiast przebudowy układu w locie; wystarczy, bo próg mija się rzadko.
matchMedia('(min-width: 900px) and (pointer: fine) and (prefers-reduced-motion: no-preference)').onchange = () => location.reload();
// GSAP albo Lenis się nie wczytał: zostaje układ pionowy.
if (html.classList.contains('track')) initTrack(strip).catch(() => { html.classList.remove('track'); strip.parentElement.style.height = ''; });

// Wideo: lżejszy plik na telefonie i przy oszczędzaniu danych / wolnym łączu; plik wybierany przed ustawieniem src.
const conn = navigator.connection;
const small = matchMedia('(max-width: 899px), (pointer: coarse)').matches || conn?.saveData || /2g|3g/.test(conn?.effectiveType ?? '');
// data-sizes="mały duży" (szerokość pliku), domyślnie 960 i 1850.
for (const v of strip.querySelectorAll('video[data-src]')) {
  const [lo, hi] = (v.dataset.sizes ?? '960 1850').split(' ');
  v.src = `${v.dataset.src}-${small ? lo : hi}.mp4`;
}

// Gra bez dźwięku tylko na ekranie i przy widocznej karcie; przy reduced motion stoi na plakacie z kontrolkami.
const seen = new Set();
const play = (v) => document.hidden || v.play().catch(() => {});
const io = new IntersectionObserver((es) => es.forEach(({ target: v, isIntersecting }) => {
  if (isIntersecting) { seen.add(v); play(v); } else { seen.delete(v); v.pause(); }
}), { threshold: .35 });
// Plakat leży pod wideo jako leniwy <img>; z kontrolkami wideo zasłania go, więc dostaje go jako poster po wczytaniu.
const poster = (v) => {
  const p = v.previousElementSibling;
  if (p?.tagName !== 'IMG') return;
  const set = () => (v.poster = p.currentSrc);
  p.complete && p.naturalWidth ? set() : p.addEventListener('load', set, { once: true });
};
for (const v of strip.querySelectorAll('video')) reduce ? ((v.controls = true), poster(v)) : io.observe(v);
document.addEventListener('visibilitychange', () => seen.forEach((v) => (document.hidden ? v.pause() : play(v))));

initLang('../');
await renderGlyphs(document, '../');
