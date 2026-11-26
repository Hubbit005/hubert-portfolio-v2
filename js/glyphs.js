// Napisy ekspozycyjne z glifów fontu Dirtyline 36daysoftype 2022 (assets/font/glyphs.json, generator: tools/font-to-glyphs.py).
// Słowo -> jeden inline <svg> (fill: currentColor), wysokość ustawia CSS (--gh).

let font;
export const loadGlyphs = (base = '') =>
  font ??= fetch(base + 'assets/font/glyphs.json?v=20261211').then((r) => r.json());

// Font nie ma polskich znaków poza Ó: brakujący znak rysuje litera bazowa (Ł -> L, Ą -> A ...).
const fallback = (ch) => ({ Ł: 'L' })[ch] ?? ch.normalize('NFD')[0];

// Zwraca { d: [{ d, x }], w, h } dla tekstu; z kerningiem (f.kern). Znaki bez glifu i bez litery bazowej pomija z ostrzeżeniem.
export function layout(f, text) {
  const out = [];
  let x = 0, prev = '';
  for (let ch of text) {
    if (ch === ' ') { x += f.space; prev = ''; continue; }
    if (!f.glyphs[ch]) {
      const b = fallback(ch);
      console.warn(`glyphs: brak znaku "${ch}" w "${text}"` + (f.glyphs[b] ? `, rysuję "${b}"` : ''));
      ch = b;
    }
    const g = f.glyphs[ch];
    if (!g) continue;
    x += f.kern?.[prev + ch] ?? 0;
    out.push({ d: g.d, x });
    x += g.w + f.tracking;
    prev = ch;
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

// data-glyph="wrap": lista po przecinkach, jeden <svg> na pozycję, żeby nagłówek łamał się na linie.
export function glyphNodes(f, text, el) {
  if (el.dataset.glyph !== 'wrap') return [glyphSVG(f, text)];
  const items = text.split(', ');
  return items.map((t, i) => glyphSVG(f, i < items.length - 1 ? t + ',' : t));
}

// Podmienia tekst każdego [data-glyph] na SVG (tekst zostaje w aria-label).
export async function renderGlyphs(root = document, base = '') {
  const f = await loadGlyphs(base);
  for (const el of root.querySelectorAll('[data-glyph]')) {
    el.replaceChildren(...glyphNodes(f, el.textContent.trim().toUpperCase(), el));
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
