// Telefon: rozmycie liter tytułu pod palcem, bez WebGL (litery to osobne <svg class="gl">, js/glyphs.js).
// Litera w promieniu ok. 1,5 jej szerokości dostaje .is-blur (wejście 0,4 s, powrót 4 s: css/main.css).
// Prostokąty liter mierzone raz: po zmianie sekcji, rozmiaru i języka. W pętli tylko arytmetyka.
const html = document.documentElement;
const phone = matchMedia('(max-width: 899px)');
const ty = (s) => +(s.style.transform.match(/,\s*(-?[\d.]+)px/)?.[1] ?? 0); // przesunięcie sekcji (js/main.js)

export function initTouchBlur() {
  if (!matchMedia('(hover: none), (pointer: coarse)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const secs = [...document.querySelectorAll('.sec')];
  let sec = null, items = [], dirty = true, x = 0, y = 0, down = false, up = false, raf = 0;

  // motion: sekcje fixed, jedna widoczna (opacity > .5); bez motion: zwykłe przewijanie, wszystkie tytuły
  const visible = () => html.classList.contains('motion') ? secs.find((s) => +s.style.opacity > .5) ?? null : document.body;
  // współrzędne liter bez przesunięcia sekcji (albo względem strony, gdy sekcje się przewijają)
  const offset = () => sec === document.body ? scrollY : -ty(sec);
  const measure = () => {
    for (const it of items) if (it.on) it.el.classList.remove('is-blur');
    const off = offset();
    items = [...sec.querySelectorAll('h1 .gl, h2 .gl')].map((el) => {
      const r = el.getBoundingClientRect();
      return { el, x: r.left + r.width / 2, y: r.top + r.height / 2 + off, r2: (1.5 * r.width) ** 2, on: false };
    });
    dirty = false;
  };

  const frame = () => {
    raf = 0;
    const s = visible();
    if (s !== sec) {
      for (const it of items) if (it.on) { it.on = false; it.el.classList.remove('is-blur'); }
      sec = s; dirty = true;
    }
    if (!sec) return;
    if (dirty || !items[0]?.el.isConnected) measure(); // isConnected: inny język = nowe litery
    const off = offset();
    for (const it of items) {
      const dx = x - it.x, dy = y + off - it.y;
      const on = down && dx * dx + dy * dy < it.r2;
      if (on === it.on) continue;
      it.on = on;
      it.el.classList.toggle('is-blur', on);
      if (on) it.el.classList.add('is-on'); // will-change tylko w trakcie efektu
    }
    if (up) { up = false; down = false; raf = requestAnimationFrame(frame); } // krótkie stuknięcie: najpierw rozmycie, potem powrót
  };

  const onTouch = (e) => {
    if (!phone.matches) return;
    if (e.touches.length) { down = true; up = false; x = e.touches[0].clientX; y = e.touches[0].clientY; }
    else if (raf) up = true; // palec zszedł przed klatką: stuknięcie i tak rozmywa literę
    else down = false;
    raf ||= requestAnimationFrame(frame);
  };
  for (const ev of ['touchstart', 'touchmove', 'touchend', 'touchcancel']) addEventListener(ev, onTouch, { passive: true });
  addEventListener('resize', () => { dirty = true; });
  // po powrocie litery (koniec przejścia filter bez .is-blur) zdejmujemy will-change
  addEventListener('transitionend', (e) => {
    const c = e.target.classList;
    if (c?.contains('gl') && !c.contains('is-blur')) c.remove('is-on');
  });
}
