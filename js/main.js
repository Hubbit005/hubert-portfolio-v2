/* Main entry: nav, smooth scroll, motion, hero, carousel. */
import { initHero } from './hero.js?v=20261108';
import { initArc } from './carousel.js?v=20261108';
import { initMotion } from './motion.js?v=20261108';
import { initRoulette } from './roulette.js?v=20261108';
import { initBackground } from './background.js?v=20261108';
import { initCasesMotion } from './cases-motion.js?v=20261108';
import { initFooter } from './footer.js?v=20261108';
import { initAmbient } from './ambient.js?v=20261108';
import { initPause } from './pause.js?v=20261108';
import { initJar } from './jar.js?v=20261108';
import { initLetters } from './letters.js?v=20261108';
import { initPlanDemo } from './plan-demo.js?v=20261108';
import { initStamp } from './stamp.js?v=20261108';
import { initHeroIcons } from './hero-icons.js?v=20261108';
import { initHeroPanel } from './hero-panel.js?v=20261108';

const doc = document.documentElement;
const t = (k, v) => (window.i18n ? window.i18n.t(k, v) : k);
const mqReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const reduced = mqReduced.matches;
if (!reduced) doc.classList.add('motion-ok');

/* ---------- AI tools: logo files dropped into assets/logos/ (svg first, then png) ---------- */
document.querySelectorAll('[data-logo-file]').forEach((slot) => {
  const slug = slot.dataset.logoFile;
  const tryLoad = (exts) => {
    if (!exts.length) return;
    const img = new Image();
    img.className = 'tool__file';
    img.alt = '';
    img.decoding = 'async';
    img.onload = () => { slot.appendChild(img); slot.classList.add('has-file'); };
    img.onerror = () => tryLoad(exts.slice(1));
    img.src = `assets/logos/${slug}.${exts[0]}`;
  };
  tryLoad(['svg', 'png']);
});

/* ---------- Smooth scroll (Lenis) ---------- */
let lenis = null;
const gsap = window.gsap;
const ScrollTrigger = window.ScrollTrigger;
if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

if (!reduced && window.Lenis) {
  lenis = new window.Lenis({ duration: 1.1, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.4 });
  if (gsap && ScrollTrigger) {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }
}
window.__lenis = lenis;

function navOffset() { return (document.getElementById('nav')?.offsetHeight || 64) + 8; }
function scrollToTarget(el, immediate = false) {
  if (!el) return;
  // Absolute target; Lenis would otherwise add CSS scroll-padding and scroll-margin on top of the offset.
  let y = Math.max(0, el.getBoundingClientRect().top + window.scrollY - navOffset());
  // The contact section is sticky under the CV (curtain, js/footer.js): its box is not where it ends
  // up, and it is the end of the page, so its place is the bottom of the page.
  if (getComputedStyle(el).position === 'sticky') y = document.documentElement.scrollHeight - window.innerHeight;
  if (lenis) lenis.scrollTo(y, { immediate, duration: 1.2 });
  else window.scrollTo({ top: y, behavior: immediate || reduced ? 'auto' : 'smooth' });
}

document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
  const id = a.getAttribute('href').slice(1);
  if (!id) return;
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  closeMenu();
  // open a closed <details> ancestor if the target sits inside one
  const det = el.closest('details');
  if (det && !det.open) det.open = true;
  scrollToTarget(el);
  history.pushState(null, '', `#${id}`);
  // move focus for keyboard and screen reader users
  const focusable = el.matches('a, button, [tabindex]') ? el : el;
  if (!focusable.hasAttribute('tabindex') && !focusable.matches('a, button, input, select, textarea')) focusable.setAttribute('tabindex', '-1');
  focusable.focus({ preventScroll: true });
});
window.addEventListener('popstate', () => {
  const el = location.hash ? document.getElementById(location.hash.slice(1)) : document.getElementById('home');
  scrollToTarget(el, true);
});

/* ---------- Mobile menu ---------- */
const nav = document.getElementById('nav');
const menuBtn = document.getElementById('menu-btn');
function closeMenu() {
  if (!nav?.classList.contains('is-open')) return;
  nav.classList.remove('is-open');
  menuBtn?.setAttribute('aria-expanded', 'false');
}
menuBtn?.addEventListener('click', () => {
  const open = !nav.classList.contains('is-open');
  nav.classList.toggle('is-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  if (open) nav.querySelector('#nav-list a')?.focus();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav?.classList.contains('is-open')) { closeMenu(); menuBtn?.focus(); }
});

/* ---------- Active section indicator + progress ---------- */
const navLinks = [...document.querySelectorAll('[data-nav]')];
const indicator = document.querySelector('.nav__indicator');
const linkFor = (id) => navLinks.find((l) => l.dataset.nav === id);
function setActive(id) {
  navLinks.forEach((l) => l.removeAttribute('aria-current'));
  const link = linkFor(id);
  if (!link || !indicator) { if (indicator) indicator.style.setProperty('--iw', '0'); return; }
  link.setAttribute('aria-current', 'true');
  const ul = link.closest('ul');
  const lr = link.getBoundingClientRect();
  const ur = ul.getBoundingClientRect();
  indicator.style.setProperty('--ix', `${lr.left - ur.left + 12}px`);
  indicator.style.setProperty('--iw', `${Math.max(0, lr.width - 24)}`);
}
const sectionIds = ['work', 'cases', 'ai', 'about', 'cv', 'contact'];
const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);
let activeId = null;
// Active section: the one crossing a thin band at 35% of the viewport height. An IntersectionObserver
// reports it, so scrolling never measures the sections.
const inBand = new Set();
function pickActive(force) {
  const current = sectionIds.find((id) => inBand.has(id)) || null;
  if (force || current !== activeId) { activeId = current; setActive(current); }
}
const bandIO = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) inBand.add(en.target.id); else inBand.delete(en.target.id); });
  pickActive(false);
}, { rootMargin: '-35% 0px -64% 0px' });
sections.forEach((s) => bandIO.observe(s));

// Scroll progress bar: the scroll event only sets a flag; one rAF writes one custom property.
// The page height is read when it changes (ResizeObserver), not while scrolling.
const progress = document.querySelector('.nav__progress span');
let maxScroll = 1;
function measurePage() { maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight); }
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    if (progress) progress.style.setProperty('--p', Math.min(1, window.scrollY / maxScroll).toFixed(4));
  });
}
window.addEventListener('scroll', onScroll, { passive: true });
new ResizeObserver(() => { measurePage(); onScroll(); }).observe(document.getElementById('main') || document.body);
window.addEventListener('resize', () => { measurePage(); pickActive(true); onScroll(); });
window.addEventListener('load', () => { measurePage(); onScroll(); });

/* ---------- Copy e-mail ---------- */
document.getElementById('copy-mail')?.addEventListener('click', async (e) => {
  const text = e.currentTarget.dataset.copy;
  const out = document.getElementById('copy-status');
  try {
    await navigator.clipboard.writeText(text);
    out.textContent = t('copy.ok');
  } catch (err) {
    out.textContent = t('copy.fail');
  }
  setTimeout(() => { out.textContent = ''; }, 3000);
});

/* ---------- 3D model: load on demand ---------- */
document.getElementById('model-load')?.addEventListener('click', () => {
  const wrap = document.getElementById('model-embed');
  if (!wrap || wrap.classList.contains('is-loaded')) return;
  const iframe = document.createElement('iframe');
  iframe.src = 'proto/ak47/';
  iframe.title = t('model.title');
  iframe.setAttribute('allow', 'fullscreen');
  iframe.setAttribute('loading', 'eager');
  wrap.appendChild(iframe);
  wrap.classList.add('is-loaded');
  iframe.addEventListener('load', () => iframe.focus());
});

/* ---------- Magnetic buttons ---------- */
function initMagnetic() {
  if (reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    // Uses the `translate` property, not `transform`: nothing else writes it, so leaving always
    // returns the button exactly to its place (CSS transition on `translate` makes the return smooth).
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2 - (parseFloat(el.style.translate) || 0);
      const cy = r.top + r.height / 2 - (parseFloat((el.style.translate || '').split(' ')[1]) || 0);
      const dx = (e.clientX - cx) * 0.18;
      const dy = (e.clientY - cy) * 0.28;
      el.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
    });
    el.addEventListener('pointerleave', () => { el.style.translate = ''; });
  });
}

/* ---------- Language switch: refresh what scripts wrote and what depends on text width ---------- */
document.addEventListener('langchange', () => {
  const frame = document.querySelector('#model-embed iframe');
  if (frame) frame.title = t('model.title');
  pickActive(true);
  onScroll();
  if (ScrollTrigger) ScrollTrigger.refresh();
});

/* ---------- Boot ---------- */
async function boot() {
  try { await document.fonts.ready; } catch (e) { /* ignore */ }
  const roulette = initRoulette();
  initHero({ reduced, lenis, gsap, onRoulette: (api) => roulette.attach(api) });
  initArc({ reduced });
  initPause({ reduced });
  initMotion({ reduced, gsap, ScrollTrigger, lenis });
  initCasesMotion({ reduced, gsap, ScrollTrigger });
  initFooter({ reduced, gsap });
  initJar({ reduced, gsap });
  initLetters({ reduced, gsap });
  initPlanDemo({ reduced, gsap });
  initStamp({ reduced });
  initHeroIcons({ reduced, gsap });
  initHeroPanel({ reduced, gsap });
  initAmbient({ reduced, gsap, ScrollTrigger });
  initBackground({ reduced, gsap, ScrollTrigger, lenis });
  initMagnetic();

  measurePage();
  onScroll();
  if (location.hash) {
    const el = document.getElementById(location.hash.slice(1));
    if (el) {
      const det = el.closest('details');
      if (det) det.open = true;
      requestAnimationFrame(() => scrollToTarget(el, true));
    }
  }
}
boot();
