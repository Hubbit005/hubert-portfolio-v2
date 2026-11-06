/* Pause / play for the page's continuous decorative motion (WCAG 2.2.2): the living background's
   time, the ambient film shots and the film-frame tape. Scroll-driven effects still follow the user.
   The choice is kept in localStorage. The button only exists when there is motion to stop
   (JS on, no reduced motion). Others read window.__motionPaused and listen for 'motionpause'. */

export function initPause({ reduced }) {
  const btn = document.getElementById('motion-toggle');
  const doc = document.documentElement;
  const t = (k) => (window.i18n ? window.i18n.t(k) : k);
  let paused = false;
  try { paused = localStorage.getItem('motion') === 'paused'; } catch (e) { /* storage blocked */ }
  if (reduced) paused = false;
  function apply(fire) {
    window.__motionPaused = paused;
    doc.classList.toggle('motion-paused', paused);
    if (btn) btn.textContent = t(paused ? 'motion.play' : 'motion.pause');
    if (fire) document.dispatchEvent(new CustomEvent('motionpause', { detail: { paused } }));
  }
  apply(false);
  if (!btn || reduced) return;
  btn.hidden = false;
  btn.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem('motion', paused ? 'paused' : 'on'); } catch (e) { /* storage blocked */ }
    apply(true);
  });
  document.addEventListener('langchange', () => apply(false));
}
