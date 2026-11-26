// Bezwładny scroll kółkiem myszy („popchnięcie w wodzie”) na istniejącym Lenisie (animacja w jego tickerze GSAP).
// Szybkie kręcenie: po puszczeniu kółka strona płynie dalej i zwalnia wykładniczo (tarcie), bez odbicia.
// Delikatny ruch kółkiem i touchpad (ma własną bezwładność): bez zmian. Dotyk i reduced motion: natywny scroll.

// Parametry do strojenia:
const FRICTION = 2.5;  // tarcie [1/s]: większe = krótszy, szybciej gasnący dojazd; 2,5 ≈ 1,2–2 s zwalniania
const LIMIT = 1.2;     // maks. dojazd: wysokości okna (strona główna) albo szerokości okna (tor projektu)
const MIN_SPEED = 2;   // próg prędkości kółka [px/ms]; poniżej brak impulsu (wolne kręcenie ≈ 1)
const WINDOW_MS = 100; // z ilu ostatnich ms liczona średnia prędkość kółka
const STOP_MS = 60;    // przerwa w zdarzeniach kółka, po której uznajemy je za puszczone

// size(): wielkość okna w osi toru (px); snap(to, from, dir): opcjonalna korekta końca dojazdu.
export function addInertia(lenis, size, snap = (to) => to) {
  if (matchMedia('(prefers-reduced-motion: reduce), (hover: none), (pointer: coarse)').matches) return;
  let log = [], last = 0, pad = false, timer = 0, coast = null;

  // Przerwanie dojazdu: zatrzymanie w miejscu, w którym strona jest teraz.
  const stop = () => {
    if (coast !== null && lenis.targetScroll === coast) lenis.scrollTo(lenis.animatedScroll, { immediate: true, force: true });
    coast = null;
  };

  addEventListener('wheel', (e) => {
    stop();
    if (e.ctrlKey) return; // zoom
    const now = performance.now(), gap = now - last;
    last = now;
    if (gap > STOP_MS) { log = []; pad = false; } // nowy gest
    const raw = lenis.options.gestureOrientation === 'both' && Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    // Touchpad: delty w pikselach, ułamkowe, w dwóch osiach naraz albo małe i gęste. Rozpoznany zostaje do końca gestu.
    pad ||= e.deltaMode === 0 && ((!Number.isInteger(raw) && Math.abs(raw) < 50) || (!!e.deltaX && !!e.deltaY) || (Math.abs(raw) < 4 && gap < 20));
    log = log.filter((l) => now - l.t < WINDOW_MS);
    log.push({ t: now, d: raw * (e.deltaMode === 1 ? 100 / 6 : e.deltaMode === 2 ? innerHeight : 1) * lenis.options.wheelMultiplier });

    clearTimeout(timer);
    timer = setTimeout(() => {
      const v = log.reduce((s, l) => s + l.d, 0) / WINDOW_MS; // px/ms, ze znakiem
      if (pad || Math.abs(v) < MIN_SPEED) return;
      const dir = Math.sign(v), from = lenis.targetScroll;
      const dist = Math.min((Math.abs(v) - MIN_SPEED) * 1000 / FRICTION, LIMIT * size());
      // lerp w Lenisie to wykładnicze dociąganie z szybkością lerp * 60 [1/s], czyli tarcie.
      lenis.scrollTo(snap(from + dir * dist, from, dir), { lerp: FRICTION / 60 });
      if (lenis.targetScroll !== from) coast = lenis.targetScroll;
    }, STOP_MS);
  }, { capture: true, passive: true });

  for (const ev of ['pointerdown', 'keydown', 'touchstart']) addEventListener(ev, stop, { capture: true, passive: true });
}
