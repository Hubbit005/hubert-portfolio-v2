/* Logo stamp (whole page, fine pointer only): a click on empty space (the background, margins, the
   room between blocks, with room for the whole stamp) leaves the H logo from the nav as an ink stamp. It lands with a short press
   (scale 1.4 → 1, a random turn of up to ±12°, a soft shadow) and fades after about 10 s.
   Not on text, links, buttons, images, video, forms, the hero (3D word and roulette), the
   carousel, the tools jar, the plan demo, the footer letters or the 3D model. At most 12 at once
   (the oldest goes). Stamps sit in the document (they scroll with the page), are aria-hidden and
   never take the pointer. Reduced motion or touch: off. */

const NO = [
  'a', 'button', 'input', 'select', 'textarea', 'label', 'summary', 'img', 'picture', 'video', 'svg', 'canvas',
  'iframe', 'figure', 'table', '[role="button"]', '[contenteditable]', '[tabindex]:not([tabindex="-1"])',
  '#home', '#work', '.nav', '.jar', '.pd', '.wordmark', '#model-embed', '.tool', '.cursor', '.pd__phone',
].join(',');
const MAX = 12;

// Is the point over a character of text? (the caret API finds the nearest text, the glyph box decides)
function overText(x, y) {
  let node = null, offset = 0;
  if (document.caretPositionFromPoint) {
    const p = document.caretPositionFromPoint(x, y);
    node = p?.offsetNode; offset = p?.offset || 0;
  } else if (document.caretRangeFromPoint) {
    const r = document.caretRangeFromPoint(x, y);
    node = r?.startContainer; offset = r?.startOffset || 0;
  }
  if (!node || node.nodeType !== 3 || !node.textContent.trim()) return false;
  const range = document.createRange();
  for (const o of [offset - 1, offset]) {
    if (o < 0 || o >= node.length) continue;
    range.setStart(node, o); range.setEnd(node, o + 1);
    for (const r of range.getClientRects()) {
      if (x >= r.left - 6 && x <= r.right + 6 && y >= r.top - 4 && y <= r.bottom + 4) return true;
    }
  }
  return false;
}

export function initStamp({ reduced }) {
  if (reduced || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const layer = document.createElement('div');
  layer.className = 'stamps';
  layer.setAttribute('aria-hidden', 'true');
  // One ink filter for every stamp: rough edges and paper grain (SVG, no image file)
  layer.innerHTML = `
    <svg width="0" height="0" focusable="false" style="position:absolute">
      <filter id="stamp-ink" x="-10%" y="-10%" width="120%" height="120%">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="7" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="2.6" xChannelSelector="R" yChannelSelector="G" result="d"/>
        <feTurbulence type="fractalNoise" baseFrequency="1.6" numOctaves="1" seed="2" result="g"/>
        <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 1.75" result="holes"/>
        <feComposite in="d" in2="holes" operator="in"/>
      </filter>
    </svg>`;
  document.body.appendChild(layer);
  const mark = document.querySelector('.nav__mark');
  const shapes = mark ? [...mark.querySelectorAll('path')].map((p) => p.getAttribute('d')).join(' ') : 'M13 12h10v40H13zM41 12h10v40H41zM23 12h6v40h-6zM23 31l18-9v10l-18 9z';

  // A click after the pointer travelled (a drag, a throw) is not a stamp
  let down = null;
  document.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; }, { passive: true, capture: true });
  // The whole stamp (not only the click point) must land on empty space: the centre and a ring of
  // points around it are tested, so a stamp never covers a heading or a button next to the click.
  const RING = [...Array(8)].map((_, i) => [Math.cos((i * Math.PI) / 4) * 30, Math.sin((i * Math.PI) / 4) * 30]);
  function clear(x, y) {
    for (const [dx, dy] of [[0, 0], ...RING]) {
      const px = x + dx, py = y + dy;
      if (px < 0 || py < 0 || px >= innerWidth || py >= innerHeight) continue;
      const el = document.elementFromPoint(px, py);
      if (!el || el.closest(NO) || overText(px, py)) return false;
    }
    return true;
  }

  document.addEventListener('click', (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.defaultPrevented) return;
    if (e.pointerType && e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
    if (e.detail === 0) return; // keyboard "click"
    const target = e.target;
    if (!(target instanceof Element) || target.closest(NO)) return;
    if (!window.getSelection()?.isCollapsed) return;
    if (down && Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
    if (!clear(e.clientX, e.clientY)) return;
    const s = document.createElement('div');
    s.className = 'stamp';
    s.style.left = `${e.pageX}px`;
    s.style.top = `${e.pageY}px`;
    s.style.setProperty('--r', `${(Math.random() * 24 - 12).toFixed(1)}deg`);
    s.innerHTML = `<svg viewBox="0 0 64 64" focusable="false"><g filter="url(#stamp-ink)"><rect x="3" y="3" width="58" height="58" rx="13" fill="none" stroke="currentColor" stroke-width="4"/><path d="${shapes}" fill="currentColor"/></g></svg>`;
    s.addEventListener('animationend', (ev) => { if (ev.animationName === 'stamp-out') s.remove(); });
    layer.appendChild(s);
    const all = layer.querySelectorAll('.stamp');
    if (all.length > MAX) all[0].remove();
  });
}
