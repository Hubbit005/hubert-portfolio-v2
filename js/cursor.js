/* Cursor (task 15): on desktop only (hover: hover and pointer: fine), a small violet ring follows the
   mouse and grows over things that can be clicked. The system cursor stays as well, so text
   selection, grabbing and every hint the browser shows keep working. Decorative (aria-hidden).
   Touch screens and reduced motion: nothing. */
const HOT = 'a, button, [role="button"], label, select, summary, input, textarea, .hero-icon, .hero__stage.is-3d';

export function initCursor({ reduced, gsap }) {
  if (reduced || !gsap || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const ring = document.createElement('div');
  ring.className = 'cursor';
  ring.setAttribute('aria-hidden', 'true');
  document.body.appendChild(ring);
  const x = gsap.quickTo(ring, 'x', { duration: 0.18, ease: 'power3' });
  const y = gsap.quickTo(ring, 'y', { duration: 0.18, ease: 'power3' });
  window.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    x(e.clientX); y(e.clientY);
    ring.classList.add('is-on');
    ring.classList.toggle('is-hot', !!e.target.closest?.(HOT));
  }, { passive: true });
  document.addEventListener('pointerleave', () => ring.classList.remove('is-on'));
  window.addEventListener('blur', () => ring.classList.remove('is-on'));
}
