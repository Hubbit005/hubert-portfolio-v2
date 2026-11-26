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

const ns = 'http://www.w3.org/2000/svg';
const pathEl = (p) => {
  const el = document.createElementNS(ns, 'path');
  el.setAttribute('d', p.d);
  el.setAttribute('transform', `translate(${p.x} 0)`);
  return el;
};

export function glyphSVG(f, text) {
  const { paths, w, h } = layout(f, text);
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('role', 'img');
  svg.setAttribute('aria-label', text);
  for (const p of paths) svg.append(pathEl(p));
  return svg;
}

// Dotyk: tytuły sekcji litera po literze (osobne <svg class="gl">), bo Safari nie nakłada CSS filter
// na elementy wewnątrz SVG. Wygląd ten sam: szerokość litery = odstęp do następnej. Rozmycie: js/touch-blur.js.
const split = matchMedia('(hover: none), (pointer: coarse)').matches;
export function glyphNode(f, text, el) {
  if (!split || !el.closest('.sec')) return glyphSVG(f, text);
  const { paths, w, h } = layout(f, text);
  const box = document.createElement('span');
  box.className = 'gw';
  box.setAttribute('role', 'img');
  box.setAttribute('aria-label', text);
  paths.forEach((p, i) => {
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'gl');
    svg.setAttribute('viewBox', `${p.x} 0 ${(paths[i + 1]?.x ?? w) - p.x} ${h}`);
    svg.setAttribute('aria-hidden', 'true');
    svg.append(pathEl(p));
    box.append(svg);
  });
  return box;
}

// Podmienia tekst każdego [data-glyph] na SVG (tekst zostaje w aria-label).
export async function renderGlyphs(root = document, base = '') {
  const f = await loadGlyphs(base);
  for (const el of root.querySelectorAll('[data-glyph]')) {
    el.replaceChildren(glyphNode(f, el.textContent.trim().toUpperCase(), el));
  }
  document.documentElement.classList.add('glyphs');
  window.loader?.done('glyphs');
}

// Ciężkie rzeczy (scena WebGL) po pierwszym malowaniu: pierwszy ruch użytkownika albo 1,5 s po load.
export function afterFirstPaint(fn) {
  let done = false;
  const go = () => { if (!done) { done = true; fn(); } };
  for (const ev of ['pointermove', 'pointerdown', 'wheel', 'keydown', 'touchstart']) addEventListener(ev, go, { once: true, passive: true });
  if (document.readyState === 'complete') setTimeout(go, 1500);
  else addEventListener('load', () => setTimeout(go, 1500), { once: true });
}
