/* Hero and the guitar scene (tasks 11, 12): panel 1 is the hero, panel 2 the guitar scene (#guitar),
   both in one grid cell. A small lit guitar + amp at the hero's bottom right (#guitar-mini, label
   guitar.1, "Play something") zooms into the full scene: panel 2 grows from the small scene's box to
   the whole hero (FLIP: transform from its centre + clip-path, 0.9 s, --ease-out; the values are set
   here as --gz-*), while panel 1 shrinks a little and fades. Back ("Back" button or Esc) zooms back.
   While panel 2 shows, the 3D word, the icons and the roulette stop rendering (hero.dataset.panel =
   'guitar', read in their GSAP ticker callbacks). The song keeps playing after going back (task 13).
   The hidden panel is inert; focus goes to panel 2's heading and back to the small scene. #guitar in
   the address opens panel 2 at once. The button has aria-controls and aria-expanded.
   Task 13: while panel 2 shows, the page is locked (see lock()) and scrolling in it plays the song.
   Nothing of panel 2 loads at start: its pictures, the smoke film, js/guitar.js and js/guitar-audio.js
   are loaded on the first hover, focus, touch or click of the small scene (or #guitar).
   No JS: panel 2 is a normal block under the hero and the small scene is hidden (CSS).
   Reduced motion: the panels swap without zooming (a short cross-fade). */

const V = '?v=20261110';

export function initHeroPanel({ reduced, gsap }) {
  const hero = document.getElementById('home');
  const track = document.getElementById('hero-track');
  const main = document.getElementById('hero-main');
  const panel = document.getElementById('guitar');
  const arrow = document.getElementById('guitar-mini');
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
  const DUR = reduced ? 260 : 900;
  function settle() {
    clearTimeout(timer);
    hero.classList.remove('is-sliding');
    if (open) hero.dataset.panel = 'guitar';
  }
  function show(on, { instant = false, focus = true } = {}) {
    if (on === open) return;
    open = on;
    if (on) zoomFrom(); // closing reuses these values (panel 1 is scaled while open)
    if (on) prepare();
    hero.classList.toggle('is-guitar', on);
    hero.classList.toggle('is-instant', instant);
    if (!instant) hero.classList.add('is-sliding');
    delete hero.dataset.panel; // both panels render while the track moves
    main.inert = on;
    panel.inert = !on;
    lock(on);
    arrow.setAttribute('aria-expanded', String(on));
    playFilm(on);
    try { history.replaceState(null, '', on ? '#guitar' : location.pathname + location.search); } catch (e) { /* ignore */ }
    clearTimeout(timer);
    if (instant) settle(); else timer = setTimeout(settle, DUR + 60);
    if (instant) requestAnimationFrame(() => hero.classList.remove('is-instant'));
    if (focus) (on ? heading : arrow).focus({ preventScroll: true });
    document.dispatchEvent(new CustomEvent('heropanel', { detail: { guitar: on } }));
  }
  // FLIP: scale panel 2 about the small scene's centre so the hero's height maps onto the scene's,
  // and clip it to the scene's box (in panel 2's own, unscaled coordinates)
  function zoomFrom() {
    const h = hero.getBoundingClientRect(), m = arrow.getBoundingClientRect();
    if (!m.width) return;
    const sc = m.height / h.height, cx = m.left - h.left + m.width / 2, cy = m.top - h.top + m.height / 2;
    const hw = m.width / sc / 2, hh = m.height / sc / 2;
    hero.style.setProperty('--gz-s', sc.toFixed(4));
    hero.style.setProperty('--gz-o', `${cx.toFixed(1)}px ${cy.toFixed(1)}px`);
    hero.style.setProperty('--gz-clip', `${Math.max(0, cy - hh).toFixed(1)}px ${Math.max(0, h.width - cx - hw).toFixed(1)}px ${Math.max(0, h.height - cy - hh).toFixed(1)}px ${Math.max(0, cx - hw).toFixed(1)}px`);
  }
  // Task 13: a closed card. The page does not scroll and everything outside the scene is inert;
  // scrolling inside the scene starts the song and plucks the strings; Tab stays on Back and Play.
  let locked = [];
  function lock(on) {
    document.documentElement.style.overflow = on ? 'hidden' : '';
    window.__lenis?.[on ? 'stop' : 'start']();
    locked.forEach((el) => { el.inert = false; });
    locked = [];
    if (!on) return;
    for (let n = hero; n.parentElement && n !== document.body; n = n.parentElement) {
      for (const el of n.parentElement.children) if (el !== n && !el.inert && el.tagName !== 'SCRIPT') { el.inert = true; locked.push(el); }
    }
  }
  const nudge = (e) => { if (!open) return; e.preventDefault(); ready?.then((g) => g?.nudge?.()); };
  panel.addEventListener('wheel', nudge, { passive: false });
  panel.addEventListener('touchmove', nudge, { passive: false });
  panel.addEventListener('keydown', (e) => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) nudge(e);
    const play = document.getElementById('guitar-play');
    if (e.key === 'Tab' && (e.shiftKey ? document.activeElement !== play : document.activeElement === play)) {
      e.preventDefault(); (e.shiftKey ? play : back).focus();
    }
  });
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
