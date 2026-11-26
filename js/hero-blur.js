// Telefon, hero: dotknięcie napisu w punkcie X puszcza od X dwa pasma rozmycia, w lewo i w prawo.
// Wygląd jak lekkie muśnięcie kursorem na desktopie (TEXT_FRAG w js/scene.js przy sile A = 0,4).
// Rozmyty obraz liczony raz do canvasu (ponownie po zmianie szerokości, obrocie i zmianie języka).
// Pasma odsłania maska CSS (css/main.css): w rAF zmieniają się tylko zmienne --l, --r, --a. Bez layoutu w pętli.
const html = document.documentElement;
const A = .4;                           // siła rozmycia (shader: a po smoothstep), ok. 40% pełnej
const O = 18 * A, R = 9 * A, PAD = 32;  // przesunięcie kolorów i promień rozmycia jak w shaderze (px CSS)
const T = 1200, PASS = 800;             // cały efekt, przejście pasma przez szerokość napisu (ms)
const DX = 1 / Math.hypot(1, .16), DY = -.16 / Math.hypot(1, .16); // kierunek shadera (y w górę) w osiach ekranu

const lin = (c) => (c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4);
const srgb = (c) => 255 * (c <= .0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - .055);
const color = (n) => {
  const h = getComputedStyle(html).getPropertyValue(n).trim().slice(1);
  return [0, 2, 4].map((i) => lin(parseInt(h.slice(i, i + 2), 16) / 255));
};

export function initHeroBlur() {
  if (!matchMedia('(hover: none), (pointer: coarse)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const phone = matchMedia('(max-width: 899px)');
  const title = document.querySelector('.hero__title');
  if (!title) return;
  const cv = document.createElement('canvas');
  cv.className = 'hero__blur';
  cv.setAttribute('aria-hidden', 'true');
  title.append(cv);
  let svgs = [], stale = true, left = 0, width = 0, band = 0, t0 = 0, X = 0, raf = 0;

  function render() {
    svgs = [...title.querySelectorAll('svg')];
    const r = Math.min(devicePixelRatio || 1, 2), t = title.getBoundingClientRect();
    // canvas na siatce pikseli urządzenia: bez przeskalowania o ułamek piksela (kopie się nie rozjeżdżają)
    const fx = ((t.left - PAD) * r) % 1, fy = ((t.top - PAD) * r) % 1;
    const w = Math.ceil((t.width + 2 * PAD) * r + fx), h = Math.ceil((t.height + 2 * PAD) * r + fy);
    cv.width = w; cv.height = h;
    Object.assign(cv.style, { left: -PAD - fx / r + 'px', top: -PAD - fy / r + 'px', width: w / r + 'px', height: h / r + 'px' });
    cv.style.setProperty('--ox', -PAD - fx / r + 'px');
    left = t.left; width = t.width;
    let n = 0, sw = 0;
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#fff';
    for (const svg of svgs) { // ostry napis jako maska, tak jak tekstura w js/scene.js
      const b = svg.getBoundingClientRect(), s = b.height / svg.viewBox.baseVal.height;
      svg.style.setProperty('--ox', b.left - t.left + 'px'); // maska SVG w osiach napisu
      sw += b.width;
      for (const p of svg.querySelectorAll('path')) {
        const x = p.transform.baseVal[0]?.matrix.e ?? 0;
        n++;
        ctx.setTransform(r * s, 0, 0, r * s, fx + r * (b.left - t.left + PAD + x * s), fy + r * (b.top - t.top + PAD));
        ctx.fill(new Path2D(p.getAttribute('d')));
      }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    band = 2 * sw / Math.max(1, n); // szerokość pasma: ok. 2 litery
    title.style.setProperty('--b', band + 'px');
    const img = ctx.getImageData(0, 0, w, h), d = img.data, A_ = new Float32Array(w * h);
    for (let i = 0; i < A_.length; i++) A_[i] = d[i * 4 + 3] / 255;
    // próbka dwuliniowa, jak filtr liniowy tekstury
    const S = (M, x, y) => {
      const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
      const g = (i, j) => (i < 0 || j < 0 || i >= w || j >= h ? 0 : M[j * w + i]);
      return (g(x0, y0) * (1 - fx) + g(x0 + 1, y0) * fx) * (1 - fy) + (g(x0, y0 + 1) * (1 - fx) + g(x0 + 1, y0 + 1) * fx) * fy;
    };
    // blur() z shadera: 2 x środek + 4 próbki w promieniu R wzdłuż kierunku i w poprzek
    const rx = DX * R * r, ry = DY * R * r, B = new Float32Array(w * h);
    for (let y = 0, i = 0; y < h; y++) for (let x = 0; x < w; x++, i++) {
      B[i] = (2 * A_[i] + S(A_, x + rx, y + ry) + S(A_, x - rx, y - ry) + S(A_, x - ry, y + rx) + S(A_, x + ry, y - rx)) / 6;
    }
    const ox = DX * O * r, oy = DY * O * r, ink = color('--ink'), red = color('--light-red'), blue = color('--light-blue');
    for (let y = 0, i = 0; y < h; y++) for (let x = 0; x < w; x++, i++) {
      const ta = B[i], tr = S(B, x + ox, y + oy), tb = S(B, x - ox, y - oy);
      const sa = Math.max(tr, ta, tb), k = i * 4;
      const er = Math.max(tr - ta, 0) * 1.1, eb = Math.max(tb - ta, 0) * .7;
      // a = A: mieszanka ostrego (s0) i rozmytego, jak c = mix(uInk * t0, pm, a) w shaderze
      const s0 = A_[i], al = s0 + (sa - s0) * A;
      if (al < .02) { d[k + 3] = 0; continue; }
      for (let c = 0; c < 3; c++) d[k + c] = srgb(Math.min(1, (ink[c] * s0 * (1 - A) + (ink[c] * ta + red[c] * er + blue[c] * eb) * A) / al));
      d[k + 3] = al * 255;
    }
    ctx.putImageData(img, 0, 0);
    stale = false;
  }

  const idle = (fn) => (window.requestIdleCallback ? requestIdleCallback(fn, { timeout: 2000 }) : setTimeout(fn, 300));
  idle(() => phone.matches && stale && render());
  let lastW = innerWidth; // pasek adresu zmienia tylko wysokość: bez przeliczania
  addEventListener('resize', () => {
    if (innerWidth === lastW) return;
    lastW = innerWidth; stale = true;
  }); // także obrót ekranu

  // Fala: pasma biegną ease-out, przez całą szerokość napisu w ok. 0,8 s; pod koniec gasną, po 1,2 s nic nie zostaje.
  const st = title.style;
  const step = (now) => {
    const u = Math.min(1, (now - t0) / T), D = (width + .6 * band) / (1 - (1 - PASS / T) ** 3);
    const d = D * (1 - (1 - u) ** 3);
    st.setProperty('--l', X - d + 'px');
    st.setProperty('--r', X + d + 'px');
    st.setProperty('--a', Math.min(1, (1 - u) / .3));
    if (u < 1) raf = requestAnimationFrame(step);
    else { raf = 0; title.classList.remove('is-wave'); }
  };
  title.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' || !phone.matches) return;
    if (stale || !svgs[0]?.isConnected) render(); // isConnected: inny język = nowe SVG
    X = e.clientX - left; // kolejne dotknięcie: nowa fala od nowego punktu
    t0 = performance.now();
    title.classList.add('is-wave');
    cancelAnimationFrame(raf);
    step(t0);
  }, { passive: true });
}
