// Strona projektu: kolumna z opisem, panele (na desktopie tor poziomy z js/work-track.js), wideo, CLOSE i Esc.
import { renderGlyphs } from './glyphs.js?v=20261211';
import { initLang } from './i18n.js?v=20261211';
import { initTrack } from './work-track.js?v=20261211';
import { hideLoader } from './loader.js?v=20261211';

const html = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const strip = document.querySelector('.strip');
const close = document.querySelector('.close');

addEventListener('keydown', (e) => { if (e.key === 'Escape') close.click(); });

// Klasę .track ustawia skrypt w <head> (ten sam warunek). Przejście przez próg = nowy układ.
// shortcut: przeładowanie strony zamiast przebudowy układu w locie; wystarczy, bo próg mija się rzadko.
matchMedia('(min-width: 900px) and (pointer: fine) and (prefers-reduced-motion: no-preference)').onchange = () => location.reload();
// GSAP albo Lenis się nie wczytał: zostaje układ pionowy.
if (html.classList.contains('track')) initTrack(strip).catch(() => { html.classList.remove('track'); strip.parentElement.style.height = ''; });

// Wideo: plik wybierany przed ustawieniem src. Mały: telefon, oszczędzanie danych, wolne łącze
// albo gdy panel na ekranie nie potrzebuje więcej pikseli niż mały plik (np. pionowe rolki na torze).
const conn = navigator.connection;
const small = matchMedia('(max-width: 899px), (pointer: coarse)').matches || conn?.saveData || /2g|3g/.test(conn?.effectiveType ?? '');
// data-sizes="mały duży" (szerokość pliku), domyślnie 960 i 1850. src dopiero przy pierwszym wejściu na ekran.
const load = (v) => {
  if (v.src || !v.dataset.src) return;
  const [lo, hi] = (v.dataset.sizes ?? '960 1850').split(' ');
  v.src = `${v.dataset.src}-${small || v.clientWidth * devicePixelRatio <= +lo ? lo : hi}.mp4`;
};

// Gra bez dźwięku tylko na ekranie i przy widocznej karcie; przy reduced motion stoi na plakacie z kontrolkami.
const seen = new Set();
const play = (v) => document.hidden || (load(v), v.play().catch(() => {}));
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
// Wideo startuje po zejściu loadera: nie konkuruje o łącze z obrazami i fontami pierwszego ekranu.
const videos = strip.querySelectorAll('video');
if (reduce) videos.forEach((v) => { load(v); v.controls = true; poster(v); });
else Promise.resolve(window.loader?.ready).then(() => videos.forEach((v) => io.observe(v)));
document.addEventListener('visibilitychange', () => seen.forEach((v) => (document.hidden ? v.pause() : play(v))));

initLang('../');
await renderGlyphs(document, '../');
hideLoader({ enter: [[document.querySelector('.panel'), -40], [strip, 80]] });
