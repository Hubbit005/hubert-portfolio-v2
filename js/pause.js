/* Pause / play for the page's continuous decorative motion (WCAG 2.2.2): the living background's
   time, the ambient film shots and the film-frame tape. Scroll-driven effects still follow the user.
   The choice is kept in localStorage. The button only exists when there is motion to stop
   (JS on, no reduced motion). Others read window.__motionPaused and listen for 'motionpause'. */

export function initPause({ reduced }) {
  const btns = ['motion-toggle', 'motion-skip'].map((id) => document.getElementById(id)).filter(Boolean);
  const doc = document.documentElement;
  const t = (k) => (window.i18n ? window.i18n.t(k) : k);
  let paused = false;
  try { paused = localStorage.getItem('motion') === 'paused'; } catch (e) { /* storage blocked */ }
  if (reduced) paused = false;
  function apply(fire) {
    window.__motionPaused = paused;
    doc.classList.toggle('motion-paused', paused);
    btns.forEach((b) => { b.textContent = t(paused ? 'motion.play' : 'motion.pause'); });
    if (fire) document.dispatchEvent(new CustomEvent('motionpause', { detail: { paused } }));
  }
  apply(false);
  if (!btns.length || reduced) return;
  btns.forEach((b) => {
    b.hidden = false;
    b.addEventListener('click', () => {
      paused = !paused;
      try { localStorage.setItem('motion', paused ? 'paused' : 'on'); } catch (e) { /* storage blocked */ }
      apply(true);
    });
  });
  document.addEventListener('langchange', () => apply(false));
}
