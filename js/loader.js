// Loader: zejście po gotowości (postęp i gotowość liczy skrypt inline na początku <body>) i przejścia między stronami.
const html = document.documentElement;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const el = document.querySelector('.loader');
const TILT = 'rotateX(-.18rad) rotateZ(-.08rad)'; // jak base0 w js/crystal.js (w CSS oś Y w dół, więc znaki odwrotne)

// Wyjście ze strony: zaciemnienie 0,3 s, potem nawigacja. Powrót „wstecz” z bfcache: bez zaciemnienia i bez loadera.
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]');
  if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target || a.hasAttribute('download')) return;
  const u = new URL(a.href);
  if (u.origin !== location.origin || (u.pathname === location.pathname && u.search === location.search)) return;
  e.preventDefault();
  html.classList.add('leaving');
  setTimeout(() => location.assign(u.href), 300);
});
addEventListener('pageshow', (e) => { if (e.persisted) { html.classList.remove('leaving'); el?.remove(); } });

const fade = (node, ms) => node.animate({ opacity: [1, 0] }, { duration: ms, easing: 'ease-out', fill: 'forwards' }).finished;

// Strona główna: target() = środek i wysokość kryształu w hero (px ekranu, opcjonalnie angle w rad z js/crystal.js).
// Podstrona: enter = [[element, przesunięcie x w px], ...] wjeżdża, a kopia kryształu maleje i znika.
export async function hideLoader({ target, onFly, onLand, enter = [] } = {}) {
  if (!el) return;
  el.dataset.out = 1; // skrypt inline nie usuwa loadera sam
  await window.loader?.ready;
  el.style.pointerEvents = 'none';
  onFly?.();
  if (reduce) return fade(el, 200).then(() => el.remove());

  const gem = el.querySelector('.loader__gem'), spin = gem.firstElementChild;
  fade(el.querySelector('.loader__bar'), 300);

  if (!target) {
    gem.animate({ transform: ['scale(1)', 'scale(.4)'] }, { duration: 600, easing: 'cubic-bezier(.4, 0, .2, 1)', fill: 'forwards' });
    enter.forEach(([n, x], i) => n?.animate({ opacity: [0, 1], translate: [`${x}px 0`, '0 0'] },
      { duration: 900, delay: 150 + 100 * i, easing: 'cubic-bezier(.2, .7, .2, 1)', fill: 'backwards' }));
    return fade(el, 600).then(() => el.remove());
  }

  // Zjazd 0,9 s na miejsce kryształu z hero (cel śledzony co klatkę, bo kryształ krąży), tło znika w tym czasie.
  fade(el.querySelector('.loader__bg'), 900);
  const W = innerWidth, H = innerHeight, g = gem.offsetHeight, p = { t: 0 };
  const anim = spin.getAnimations()[0];
  let a = 45 + (anim?.currentTime ?? 0) * .03, last = performance.now(); // CSS: 30°/s, start 45°
  if (target().angle != null) anim?.cancel(); // obrót przejmuje JS i dogania kąt kryształu WebGL
  const tick = () => {
    const c = target(), e = p.t;
    gem.style.transform = `translate3d(${(c.x - W / 2) * e}px, ${(c.y - H / 2) * e}px, 0) scale(${1 + (c.s / g - 1) * e})`;
    if (c.angle == null) return;
    const now = performance.now();
    a += (now - last) * .03; last = now;
    const d = ((c.angle * 180 / Math.PI + 45 - a) % 90 + 135) % 90 - 45; // ośmiościan powtarza się co 90°
    spin.style.transform = `${TILT} rotateY(${a + d * e}deg)`;
  };
  gsap.ticker.add(tick);
  gsap.to(p, {
    t: 1, duration: .9, ease: 'power3.out',
    onComplete: () => { onLand?.(); fade(gem, 300).then(() => { gsap.ticker.remove(tick); el.remove(); }); }, // crossfade w kryształ WebGL
  });
}
