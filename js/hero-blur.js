// Telefon, hero: dotknięcie napisu rozmywa cały napis naraz. Wygląd jak rozmycie desktopu przy pełnej sile
// (TEXT_FRAG w js/scene.js, a = 1): kierunkowy blur, beż w środku, czerwona podszewka z przodu, błękit z tyłu.
// Rozmyty obraz liczony raz do canvasu nad ostrym SVG (ponownie po resize, obrocie i zmianie języka).
// Animacja tylko opacity (css/main.css): wejście 0,6 s, trzymanie 3 s, powrót 4 s.
const html = document.documentElement;
const HOLD = 3000;
const O = 18, R = 9, PAD = 32;          // przesunięcie kolorów i promień rozmycia jak w shaderze (px CSS)
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
  title.classList.add('has-blur');
  let svgs = [], timer = 0, stale = true;

  function render() {
    svgs = [...title.querySelectorAll('svg')];
    const r = Math.min(devicePixelRatio || 1, 2), t = title.getBoundingClientRect();
    const w = Math.ceil((t.width + 2 * PAD) * r), h = Math.ceil((t.height + 2 * PAD) * r);
    cv.width = w; cv.height = h;
    Object.assign(cv.style, { left: -PAD + 'px', top: -PAD + 'px', width: w / r + 'px', height: h / r + 'px' });
    const ctx = cv.getContext('2d');
    ctx.fillStyle = '#fff';
    for (const svg of svgs) { // ostry napis jako maska, tak jak tekstura w js/scene.js
      const b = svg.getBoundingClientRect(), s = b.height / svg.viewBox.baseVal.height;
      for (const p of svg.querySelectorAll('path')) {
        const x = p.transform.baseVal[0]?.matrix.e ?? 0;
        ctx.setTransform(r * s, 0, 0, r * s, r * (b.left - t.left + PAD + x * s), r * (b.top - t.top + PAD));
        ctx.fill(new Path2D(p.getAttribute('d')));
      }
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    const img = ctx.getImageData(0, 0, w, h), d = img.data, A = new Float32Array(w * h);
    for (let i = 0; i < A.length; i++) A[i] = d[i * 4 + 3] / 255;
    // próbka dwuliniowa, jak filtr liniowy tekstury
    const S = (M, x, y) => {
      const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
      const g = (i, j) => (i < 0 || j < 0 || i >= w || j >= h ? 0 : M[j * w + i]);
      return (g(x0, y0) * (1 - fx) + g(x0 + 1, y0) * fx) * (1 - fy) + (g(x0, y0 + 1) * (1 - fx) + g(x0 + 1, y0 + 1) * fx) * fy;
    };
    // blur() z shadera: 2 x środek + 4 próbki w promieniu R wzdłuż kierunku i w poprzek
    const rx = DX * R * r, ry = DY * R * r, B = new Float32Array(w * h);
    for (let y = 0, i = 0; y < h; y++) for (let x = 0; x < w; x++, i++) {
      B[i] = (2 * A[i] + S(A, x + rx, y + ry) + S(A, x - rx, y - ry) + S(A, x - ry, y + rx) + S(A, x + ry, y - rx)) / 6;
    }
    const ox = DX * O * r, oy = DY * O * r, ink = color('--ink'), red = color('--light-red'), blue = color('--light-blue');
    for (let y = 0, i = 0; y < h; y++) for (let x = 0; x < w; x++, i++) {
      const ta = B[i], tr = S(B, x + ox, y + oy), tb = S(B, x - ox, y - oy);
      const sa = Math.max(tr, ta, tb), k = i * 4;
      if (sa < .02) { d[k + 3] = 0; continue; }
      const er = Math.max(tr - ta, 0) * 1.1, eb = Math.max(tb - ta, 0) * .7;
      for (let c = 0; c < 3; c++) d[k + c] = srgb(Math.min(1, (ink[c] * ta + red[c] * er + blue[c] * eb) / sa));
      d[k + 3] = sa * 255;
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
    if (title.classList.contains('is-blur')) render();
  }); // także obrót ekranu

  title.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' || !phone.matches) return;
    if (stale || !svgs[0]?.isConnected) render(); // isConnected: inny język = nowe SVG
    title.classList.add('is-blur');
    clearTimeout(timer); // kolejne dotknięcie: trzymanie od nowa
    timer = setTimeout(() => title.classList.remove('is-blur'), 600 + HOLD);
  }, { passive: true });
}
