/* Hero with two panels (task 11): panel 1 is the hero, panel 2 the guitar scene (#guitar).
   A big arrow at the hero's right edge (label: guitar.1, "Play something") slides the whole track to
   the left (transform: translateX, 0.85 s, --ease-out) and the guitar panel comes in from the right;
   the smoke behind it moves a little slower (parallax). Back: the arrow button at panel 2's left edge
   (label: roulette-back.1, "Back") or Esc. Phones: a clear horizontal swipe (≥ 60 px, much more
   sideways than up or down) does the same; vertical scrolling stays normal.
   While panel 2 shows, the 3D word, the icons and the roulette stop rendering (hero.dataset.panel =
   'guitar', read in their GSAP ticker callbacks). Going back stops the guitar.
   The hidden panel is inert; focus goes to panel 2's heading and back to the arrow. #guitar in the
   address opens panel 2 at once. The arrow has aria-controls and aria-expanded.
   Nothing of panel 2 loads at start: its pictures, the smoke film, js/guitar.js and js/guitar-audio.js
   are loaded on the first hover, focus, touch or click of the arrow (or a swipe, or #guitar).
   No JS: panel 2 is a normal block under the hero and the arrows are hidden (CSS).
   Reduced motion: the panels swap without sliding (a short cross-fade). */

const V = '?v=20261108';

export function initHeroPanel({ reduced, gsap }) {
  const hero = document.getElementById('home');
  const track = document.getElementById('hero-track');
  const main = document.getElementById('hero-main');
  const panel = document.getElementById('guitar');
  const arrow = document.getElementById('hero-arrow');
  const back = document.getElementById('guitar-back');
  const heading = document.getElementById('guitar-title');
  if (!hero || !track || !main || !panel || !arrow || !back) return;
  hero.classList.add('has-track');
  panel.inert = true;

  /* ---------- Loading panel 2 on demand ---------- */
  let ready = null, guitar = null;
  function prepare() {
    if (ready) return ready;
    panel.querySelectorAll('img[loading="lazy"]').forEach((img) => { img.loading = 'eager'; });
    panel.classList.add('is-prepared');
    const video = panel.querySelector('video[data-film]');
    if (video) {
      video.poster = video.dataset.poster;
      if (!reduced && !navigator.connection?.saveData) {
        const small = matchMedia('(max-width: 700px), (pointer: coarse)').matches;
        const canWebm = !!video.canPlayType('video/webm; codecs="vp9"');
        const base = video.dataset.film;
        const list = small ? [[`${base}-640.mp4`, 'video/mp4']] : [...(canWebm ? [[`${base}-1280.webm`, 'video/webm']] : []), [`${base}-1280.mp4`, 'video/mp4']];
        list.forEach(([src, type]) => { const s = document.createElement('source'); s.src = src; s.type = type; video.appendChild(s); });
        video.muted = true;
        video.preload = 'auto';
        video.load();
      }
    }
    ready = Promise.all([import(`./guitar.js${V}`), import(`./guitar-audio.js${V}`)])
      .then(([m]) => { guitar = m.initGuitar({ reduced, gsap }); return guitar; })
      .catch(() => null);
    return ready;
  }
  ['pointerenter', 'focus', 'touchstart'].forEach((ev) => arrow.addEventListener(ev, prepare, { passive: true, once: true }));

  /* ---------- Film: plays only while panel 2 shows ---------- */
  const film = () => panel.querySelector('video[data-film]');
  function playFilm(on) {
    const v = film();
    if (!v || reduced || !v.querySelector('source')) return;
    if (on && !window.__motionPaused && !document.hidden) { const p = v.play(); p?.catch?.(() => {}); } else v.pause();
  }
  document.addEventListener('motionpause', () => playFilm(open));
  document.addEventListener('visibilitychange', () => playFilm(open && !document.hidden));

  /* ---------- Switching ---------- */
  let open = false, timer = 0;
  const DUR = reduced ? 260 : 850;
  function settle() {
    clearTimeout(timer);
    hero.classList.remove('is-sliding');
    if (open) hero.dataset.panel = 'guitar';
  }
  function show(on, { instant = false, focus = true } = {}) {
    if (on === open) return;
    open = on;
    if (on) prepare();
    hero.classList.toggle('is-guitar', on);
    hero.classList.toggle('is-instant', instant);
    if (!instant) hero.classList.add('is-sliding');
    delete hero.dataset.panel; // both panels render while the track moves
    main.inert = on;
    panel.inert = !on;
    arrow.setAttribute('aria-expanded', String(on));
    if (!on) guitar?.stop?.();
    playFilm(on);
    try { history.replaceState(null, '', on ? '#guitar' : location.pathname + location.search); } catch (e) { /* ignore */ }
    clearTimeout(timer);
    if (instant) settle(); else timer = setTimeout(settle, DUR + 60);
    if (instant) requestAnimationFrame(() => hero.classList.remove('is-instant'));
    if (focus) (on ? heading : arrow).focus({ preventScroll: true });
    document.dispatchEvent(new CustomEvent('heropanel', { detail: { guitar: on } }));
  }
  track.addEventListener('transitionend', (e) => { if (e.target === track) settle(); });
  arrow.addEventListener('click', () => show(true));
  back.addEventListener('click', () => show(false));
  document.addEventListener('keydown', (e) => {
    // only while the panel is in use: focus inside it, or the hero on screen; never over the open menu
    if (e.key !== 'Escape' || !open || e.defaultPrevented) return;
    if (document.getElementById('nav')?.classList.contains('is-open')) return;
    const r = hero.getBoundingClientRect();
    if (!panel.contains(document.activeElement) && (r.bottom < 80 || r.top > innerHeight * 0.5)) return;
    e.preventDefault(); show(false);
  });

  /* ---------- Swipe (touch): clearly horizontal, at least 60 px ---------- */
  let sw = null;
  hero.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1 || hero.classList.contains('is-roulette')) { sw = null; return; }
    const t = e.touches[0];
    sw = { x: t.clientX, y: t.clientY };
  }, { passive: true });
  hero.addEventListener('touchend', (e) => {
    if (!sw) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - sw.x, dy = t.clientY - sw.y;
    sw = null;
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) * 1.8) return;
    if (dx < 0 && !open) show(true);
    else if (dx > 0 && open) show(false);
  }, { passive: true });
  hero.addEventListener('touchcancel', () => { sw = null; }, { passive: true });

  /* ---------- #guitar in the address ---------- */
  const fromHash = () => {
    if (location.hash === '#guitar') show(true, { instant: true, focus: false });
    else if (open) show(false, { focus: false });
  };
  fromHash();
  window.addEventListener('hashchange', fromHash);
  // a link to #guitar elsewhere on the page opens the panel (main.js scrolls to the hero)
  document.addEventListener('click', (e) => {
    const a = e.target.closest?.('a[href="#guitar"]');
    if (a) setTimeout(() => show(true), 0);
  });
}
