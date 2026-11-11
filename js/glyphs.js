// Napisy ekspozycyjne z glifów odrysowanych z próbki fontu Huberta (assets/font/glyphs.json).
// Słowo -> jeden inline <svg> (fill: currentColor), wysokość ustawia CSS (--gh).

let font;
export const loadGlyphs = (base = '') =>
  font ??= fetch(base + 'assets/font/glyphs.json').then((r) => r.json());

// Zwraca { d: [{ d, x }], w, h } dla tekstu; znaki spoza A–Z i spacji pomija z ostrzeżeniem.
export function layout(f, text) {
  const out = [];
  let x = 0;
  for (const ch of text) {
    if (ch === ' ') { x += f.space; continue; }
    const g = f.glyphs[ch];
    if (!g) { console.warn(`glyphs: brak znaku "${ch}" w "${text}"`); continue; }
    out.push({ d: g.d, x });
    x += g.w + f.tracking;
  }
  return { paths: out, w: Math.max(0, x - f.tracking), h: f.height };
}

export function glyphSVG(f, text) {
  const { paths, w, h } = layout(f, text);
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', text);
  for (const p of paths) {
    const el = document.createElementNS(ns, 'path');
    el.setAttribute('d', p.d);
    el.setAttribute('transform', `translate(${p.x} 0)`);
    svg.append(el);
  }
  return svg;
}

// Podmienia tekst każdego [data-glyph] na SVG (tekst zostaje w aria-label).
export async function renderGlyphs(root = document, base = '') {
  const f = await loadGlyphs(base);
  for (const el of root.querySelectorAll('[data-glyph]')) {
    el.replaceChildren(glyphSVG(f, el.textContent.trim().toUpperCase()));
  }
  document.documentElement.classList.add('glyphs');
}

// Ciężkie rzeczy (scena WebGL) po pierwszym malowaniu: pierwszy ruch użytkownika albo 1,5 s po load.
export function afterFirstPaint(fn) {
  let done = false;
  const go = () => { if (!done) { done = true; fn(); } };
  for (const ev of ['pointermove', 'pointerdown', 'wheel', 'keydown', 'touchstart']) addEventListener(ev, go, { once: true, passive: true });
  if (document.readyState === 'complete') setTimeout(go, 1500);
  else addEventListener('load', () => setTimeout(go, 1500), { once: true });
}
