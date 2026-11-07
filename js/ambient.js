/* Ambient film shots (Higgsfield) behind the case study headers and the footer wordmark.
   Decoration only: aria-hidden, muted, no controls, no facts. The HTML holds just the poster's
   address (data-poster): it is set when the film comes near the screen, so the first view never
   downloads stills from far down the page (task 09, phone performance). With reduced motion or
   Save-Data only the still frame shows; without JS the decorative band stays empty. Otherwise the video
   file is attached when it comes near the screen, plays only while it is on screen and pauses
   outside it. Phones get the 640 px file. A slight parallax (yPercent ±6) follows the scroll. */

export function initAmbient({ reduced, gsap, ScrollTrigger }) {
  const vids = [...document.querySelectorAll('video[data-ambient]')];
  if (!vids.length) return;
  const poster = (v) => { if (v.dataset.poster && !v.getAttribute('poster')) v.setAttribute('poster', v.dataset.poster); };
  if (reduced || navigator.connection?.saveData) {
    // posters only, set near the screen
    const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { poster(en.target); io.unobserve(en.target); } }), { rootMargin: '100% 0px' });
    vids.forEach((v) => io.observe(v));
    return;
  }

  const small = matchMedia('(max-width: 700px)').matches || matchMedia('(pointer: coarse)').matches;
  const canWebm = !!document.createElement('video').canPlayType('video/webm; codecs="vp9"');

  function attach(v) {
    if (v.dataset.loaded) return;
    v.dataset.loaded = '1';
    poster(v);
    const base = v.dataset.ambient;
    const list = small ? [[`${base}-640.mp4`, 'video/mp4']] : [...(canWebm ? [[`${base}-1280.webm`, 'video/webm']] : []), [`${base}-1280.mp4`, 'video/mp4']];
    list.forEach(([src, type]) => { const s = document.createElement('source'); s.src = src; s.type = type; v.appendChild(s); });
    v.muted = true;
    v.load();
  }
  const play = (v) => { if (window.__motionPaused) return; const p = v.play(); if (p && p.catch) p.catch(() => { /* autoplay refused: the poster stays */ }); };

  // Near the screen (one screen ahead): attach the file.
  const near = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { attach(en.target); near.unobserve(en.target); } });
  }, { rootMargin: '100% 0px' });
  // On screen: play; off screen: pause.
  const onScreen = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      const v = en.target;
      if (en.isIntersecting) { visible.add(v); attach(v); play(v); } else { visible.delete(v); if (!v.paused) v.pause(); }
    });
  }, { threshold: 0.01 });
  vids.forEach((v) => { near.observe(v); onScreen.observe(v); });
  // Pause button (js/pause.js): stop every film; on play, start the ones on screen again.
  const visible = new Set();
  document.addEventListener('motionpause', ({ detail }) => {
    vids.forEach((v) => { if (detail.paused) v.pause(); else if (visible.has(v)) play(v); });
  });
  document.addEventListener('visibilitychange', () => {
    vids.forEach((v) => { if (document.hidden) v.pause(); });
  });

  if (gsap && ScrollTrigger) {
    vids.forEach((v) => {
      gsap.fromTo(v, { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: v.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  }
}
