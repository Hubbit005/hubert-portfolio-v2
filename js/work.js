// Strona projektu: kolumna z opisem, panele (na desktopie tor poziomy z js/work-track.js), wideo, CLOSE i Esc.
import { renderGlyphs } from './glyphs.js?v=20261124';
import { initLang } from './i18n.js?v=20261124';
import { initTrack } from './work-track.js?v=20261124';

const html = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const strip = document.querySelector('.strip');
const close = document.querySelector('.close');

// Klasę .track ustawia skrypt w <head> (ten sam warunek). Przejście przez próg = nowy układ.
// shortcut: przeładowanie strony zamiast przebudowy układu w locie; wystarczy, bo próg mija się rzadko.
matchMedia('(min-width: 900px) and (pointer: fine) and (prefers-reduced-motion: no-preference)').onchange = () => location.reload();
if (html.classList.contains('track')) initTrack(strip);

// Wideo: lżejszy plik na telefonie i przy oszczędzaniu danych / wolnym łączu; plik wybierany przed ustawieniem src.
const conn = navigator.connection;
const small = matchMedia('(max-width: 899px), (pointer: coarse)').matches || conn?.saveData || /2g|3g/.test(conn?.effectiveType ?? '');
for (const v of strip.querySelectorAll('video[data-src]')) v.src = `${v.dataset.src}-${small ? 960 : 1850}.mp4`;

// Gra bez dźwięku tylko na ekranie i przy widocznej karcie; przy reduced motion stoi na plakacie z kontrolkami.
const seen = new Set();
const play = (v) => document.hidden || v.play().catch(() => {});
const io = new IntersectionObserver((es) => es.forEach(({ target: v, isIntersecting }) => {
  if (isIntersecting) { seen.add(v); play(v); } else { seen.delete(v); v.pause(); }
}), { threshold: .35 });
for (const v of strip.querySelectorAll('video')) reduce ? (v.controls = true) : io.observe(v);
document.addEventListener('visibilitychange', () => seen.forEach((v) => (document.hidden ? v.pause() : play(v))));

initLang('../');
await renderGlyphs(document, '../');

addEventListener('keydown', (e) => { if (e.key === 'Escape') location.href = close.href; });
