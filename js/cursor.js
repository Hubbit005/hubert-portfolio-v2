/* Custom cursor (fine pointer with hover only): a dot that sits exactly on the pointer and a thin
   ring that follows it with a little delay. States (one class on #cursor at a time):
     is-link  links and buttons: the ring grows and fills with the accent, the dot hides;
              on [data-magnetic] buttons the ring also leans towards the button's centre;
     is-big   cards with [data-cursor]: the large accent circle with the label ("Open" / i18n);
     is-drag  the 3D word, the roulette wheel and the carousel: the ring shows ← → arrows;
     is-text  paragraphs and list text: the ring turns into a thin vertical bar;
     is-off   the loaded 3D model (iframe) and videos with controls: the system cursor comes back.
   Pressing the button shrinks the ring for a moment. Leaving the window hides the cursor; coming back
   shows it at the pointer, without a jump. Moves are transforms only, written in the GSAP ticker.
   Reduced motion: no delay and no scale animation, only the state changes. Touch and no JS: nothing
   changes and the system cursor stays (html.has-cursor is only added once this module runs). */

const LINK = 'a[href], button, [role="button"], label[for], summary, select, input, textarea, .lang-switch__btn, .jar__ball';
const TEXT = 'p, dd, figcaption, .list li, .bg-list li, .timeline h4, .flow__note';
const DRAG = '.hero__stage.is-3d:not(.is-locked), .hero.is-wheel .hero__gl, #arc-viewport, .jar__stage, .wordmark.is-physical .wordmark__line--fill > span';
const OFF = 'video[controls], #model-embed.is-loaded, #model-embed.is-loaded *';

export function initCursor({ reduced, gsap }) {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const cursor = document.getElementById('cursor');
  if (!cursor || !gsap) return;
  const doc = document.documentElement;

  // Parts are built here, so the page without JS has only the empty, hidden element.
  cursor.innerHTML = `
    <span class="cursor__ring"></span>
    <span class="cursor__bar"></span>
    <svg class="cursor__arrows" viewBox="0 0 40 16" focusable="false"><path d="M7 3 2 8l5 5M2 8h9M33 3l5 5-5 5M38 8h-9"/></svg>
    <span class="cursor__big"><span class="cursor__label"></span></span>`;
  const label = cursor.querySelector('.cursor__label');
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  dot.setAttribute('aria-hidden', 'true');
  cursor.after(dot);

  const LERP = reduced ? 1 : 0.15; // per 60 Hz frame
  let mx = -100, my = -100;   // pointer
  let rx = -100, ry = -100;   // ring
  let tx = 0, ty = 0;         // ring target offset (magnetic pull)
  let visible = false;
  let state = '';
  let lastTarget = null;
  let magnet = null;

  function setState(s) {
    if (s === state) return;
    cursor.classList.remove(`is-${state}`);
    dot.classList.remove(`is-${state}`);
    state = s;
    if (s) { cursor.classList.add(`is-${s}`); dot.classList.add(`is-${s}`); }
  }

  function classify(el) {
    magnet = null;
    if (!el || el.nodeType !== 1) return '';
    if (el.closest(OFF)) return 'off';
    const card = el.closest('[data-cursor]');
    if (card && !document.getElementById('arc-viewport')?.classList.contains('is-dragging')) {
      label.textContent = card.dataset.cursor;
      return 'big';
    }
    const link = el.closest(LINK);
    if (link) {
      if (link.hasAttribute('data-magnetic')) magnet = link;
      return 'link';
    }
    if (el.closest(DRAG)) return 'drag';
    const txt = el.closest(TEXT);
    if (txt && !el.closest('picture, img, video, svg')) return 'text';
    return '';
  }

  function show() {
    if (visible) return;
    visible = true;
    rx = mx; ry = my; // appear at the pointer, no jump
    cursor.classList.add('is-visible');
    dot.classList.add('is-visible');
  }
  function hide() {
    visible = false;
    cursor.classList.remove('is-visible');
    dot.classList.remove('is-visible');
  }

  document.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    mx = e.clientX; my = e.clientY;
    if (e.target !== lastTarget || state === 'drag' || state === 'big') {
      lastTarget = e.target;
      setState(classify(e.target));
    }
    if (magnet) {
      const r = magnet.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      tx = (cx - mx) * 0.35; ty = (cy - my) * 0.35;
    } else { tx = 0; ty = 0; }
    show();
  }, { passive: true });
  // Leaving the window (or entering the 3D model iframe, which takes the pointer events)
  document.addEventListener('pointerout', (e) => {
    if (!e.relatedTarget) hide();
    else if (e.relatedTarget.tagName === 'IFRAME') setState('off');
  });
  document.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') cursor.classList.add('is-down'); });
  document.addEventListener('pointerup', () => {
    cursor.classList.remove('is-down');
    // after a drag (a ball, a letter) the pointer may be over something else: look again
    requestAnimationFrame(() => { const el = document.elementFromPoint(mx, my); lastTarget = el; setState(classify(el)); });
  });
  window.addEventListener('blur', () => cursor.classList.remove('is-down'));
  // The page scrolls under a still pointer: the element under it changes.
  window.addEventListener('scroll', () => {
    if (!visible) return;
    const el = document.elementFromPoint(mx, my);
    if (el !== lastTarget) { lastTarget = el; setState(classify(el)); }
  }, { passive: true });

  let lx = 1e9, ly = 1e9, ldx = 1e9, ldy = 1e9;
  gsap.ticker.add((_, deltaMs) => {
    if (!visible) return;
    const k = LERP === 1 ? 1 : 1 - Math.pow(1 - LERP, Math.min(deltaMs || 16, 50) / 16.67);
    rx += (mx + tx - rx) * k;
    ry += (my + ty - ry) * k;
    if (Math.abs(rx - lx) > 0.05 || Math.abs(ry - ly) > 0.05) {
      lx = rx; ly = ry;
      cursor.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`;
    }
    if (mx !== ldx || my !== ldy) {
      ldx = mx; ldy = my;
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0)`;
    }
  });

  doc.classList.add('has-cursor');
}
