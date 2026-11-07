/* Guitar scene (#guitar, panel 2 of the hero since task 11; loaded on demand by js/hero-panel.js):
   an electric guitar, a drive pedal and an amp over smoke, joined by a cable.
     Floating: the guitar and the amp drift up and down (±12 px) and turn a little (±2°) with different
     periods; the soft shadow on the "floor" shrinks when the object is higher. Driven here in the GSAP
     ticker (transforms only), because the cable's ends follow the exact same motion. The pedal stands
     on the floor between them.
     Cable: SVG drawn in code, two runs: guitar jack → pedal input, pedal output → amp input. It hangs
     in an arc (cubic Bézier sagging down) with small jack plugs at the ends; recomputed every frame
     while the panel is on screen. While the song plays it shakes a little on loud hits.
     Hover (fine pointer): the glow gets stronger, the guitar leans towards the pointer and a "▶ Play"
     pill follows the pointer.
     Click on the guitar or the button: it plays Hubert's song from the start (js/guitar-audio.js, task 12);
     a thin bar on the button shows the progress. While it plays, six SVG lines lie exactly on the strings
     (nut to bridge) and vibrate with their frequency band (low E = bass … high E = treble); the
     pedal's LED glows in the accent and pulses with the volume; the whole amp shakes (±1–2 px, ±0.4°,
     stronger on hard chords) and its speakers pulse with the bass (scale up to about 1.05, the centre
     darkens on a hit); the amp's lamp pulses. On stop everything eases back to rest.
     It stops when the panel leaves the screen, when the tab is hidden, on "Stop" and on going back.
   Accessibility: a real <button> with aria-pressed and a visible focus; the pictures are aria-hidden.
   Reduced motion: no floating, shaking, pulsing or vibrating; the LED simply lights; the sound plays. */

const t = (k) => (window.i18n ? window.i18n.t(k) : k);
// Strings on the 609×1600 picture: x at the nut (y 280) and at the bridge (y 1268), low E first
const NUT_Y = 280, BRIDGE_Y = 1268;
const NUT_X = [274.5, 288, 301.5, 315, 328.5, 342];
const BRIDGE_X = [265, 282.6, 300.2, 317.8, 335.4, 353];
// Jacks, as shares of each picture: guitar output (lower body edge), pedal in (left) and out (right),
// amp input (front panel of the head, first jack)
const JACK_GUITAR = [0.885, 0.94];
const JACK_PEDAL_IN = [0.06, 0.535], JACK_PEDAL_OUT = [0.962, 0.51];
const JACK_AMP = [0.148, 0.271];
const PEDAL_SHIFT = -0.62; // the pedal's own translateX (share of its width), see css .pedal

export function initGuitar({ reduced, gsap }) {
  const sec = document.getElementById('guitar');
  if (!sec || !gsap) return { stop() {} };
  const stage = sec.querySelector('.guitar__stage');
  const btn = sec.querySelector('#guitar-play');
  const label = btn.querySelector('.guitar__play-label');
  const icon = btn.querySelector('.guitar__play-icon');
  const bar = btn.querySelector('.guitar__progress');
  const guitarItem = sec.querySelector('.guitar__item--guitar');
  const ampItem = sec.querySelector('.guitar__item--amp');
  const gFloat = guitarItem.querySelector('.guitar__float');
  const aFloat = ampItem.querySelector('.guitar__float');
  const gShadow = guitarItem.querySelector('.guitar__shadow');
  const aShadow = ampItem.querySelector('.guitar__shadow');
  const tiltEl = sec.querySelector('.guitar__tilt');
  const svg = sec.querySelector('.guitar__strings');
  const lamp = sec.querySelector('.amp__lamp');
  const cones = [...sec.querySelectorAll('.amp__cone')];
  const cores = [...sec.querySelectorAll('.amp__core')];
  const pedal = sec.querySelector('.pedal');
  const led = sec.querySelector('.pedal__led');
  const cable = sec.querySelector('.cable');
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  sec.classList.add('is-ready');

  /* ---------- Strings: six paths, drawn straight until they sound ---------- */
  const NS = 'http://www.w3.org/2000/svg';
  const paths = NUT_X.map((nx, i) => {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('class', 'guitar__string');
    p.setAttribute('d', `M${nx} ${NUT_Y} L${BRIDGE_X[i]} ${BRIDGE_Y}`);
    p.style.strokeWidth = String(1.6 + (5 - i) * 0.35); // thicker low strings
    svg.appendChild(p);
    return p;
  });
  const SEG = 28;
  function drawStrings(energy, time) {
    for (let i = 0; i < 6; i++) {
      const e = reduced ? 0 : Math.max(energy[i], kick * (1 - i * 0.08));
      const x0 = NUT_X[i], x1 = BRIDGE_X[i];
      if (e < 0.004) { paths[i].setAttribute('d', `M${x0} ${NUT_Y} L${x1} ${BRIDGE_Y}`); paths[i].style.opacity = '0.0'; continue; }
      // standing wave: fundamental plus a little second harmonic; the phase flips fast (a blur of motion)
      const dx = x1 - x0, dy = BRIDGE_Y - NUT_Y, len = Math.hypot(dx, dy);
      const nx = -dy / len, ny = dx / len;
      const A = e * (20 - i * 1.6); // in viewBox units (the picture is 609 wide), visible at any size
      const ph = time * (22 + i * 3.1) * Math.PI * 2;
      let d = `M${x0} ${NUT_Y}`;
      for (let k = 1; k <= SEG; k++) {
        const u = k / SEG;
        const off = A * (Math.sin(Math.PI * u) * Math.sin(ph) + 0.25 * Math.sin(2 * Math.PI * u) * Math.sin(ph * 1.9));
        d += ` L${(x0 + dx * u + nx * off).toFixed(1)} ${(NUT_Y + dy * u + ny * off).toFixed(1)}`;
      }
      paths[i].setAttribute('d', d);
      paths[i].style.opacity = String(Math.min(1, 0.45 + e));
    }
  }

  /* ---------- Cable: two runs, each a wire, a shine and two plugs ---------- */
  const mk = (cls) => { const p = document.createElementNS(NS, cls === 'path' ? 'path' : 'line'); return p; };
  function run() {
    const g = { rim: mk('path'), wire: mk('path'), shine: mk('path'), plugs: [mk('line'), mk('line')], tips: [mk('line'), mk('line')] };
    g.rim.setAttribute('class', 'cable__rim');
    g.wire.setAttribute('class', 'cable__wire');
    g.shine.setAttribute('class', 'cable__shine');
    g.plugs.forEach((l) => l.setAttribute('class', 'cable__plug'));
    g.tips.forEach((l) => l.setAttribute('class', 'cable__tip'));
    cable.append(g.rim, g.wire, g.shine, ...g.plugs, ...g.tips);
    return g;
  }
  const runs = [run(), run()];

  /* ---------- Layout (measured on resize, transforms excluded) ---------- */
  let L = null;
  function box(el) {
    // position of el inside the stage: offsets up to the stage
    let x = 0, y = 0, n = el;
    while (n && n !== stage) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
    return { x, y, w: el.offsetWidth, h: el.offsetHeight };
  }
  function measure() {
    L = { g: box(gFloat), a: box(aFloat), p: box(pedal), k: Math.max(0.55, Math.min(1.2, stage.offsetWidth / 1000)) };
    L.p.x += PEDAL_SHIFT * L.p.w;
    const img = pedal.querySelector('.pedal__img');
    L.p.h = img ? img.offsetHeight : L.p.h;
  }
  // a point (share u, v of the box) after the inner tilt (deg, about 50% 60%), the float's turn
  // (deg, about the centre) and its shift (px)
  const rot = (x, y, cx, cy, deg) => {
    const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
    return [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c];
  };
  function point(b, [u, v], st, tilt = 0) {
    let [x, y] = [u * b.w, v * b.h];
    if (tilt) [x, y] = rot(x, y, b.w * 0.5, b.h * 0.6, tilt);
    [x, y] = rot(x, y, b.w * 0.5, b.h * 0.5, st.r);
    return [b.x + x + st.x, b.y + y + st.y];
  }

  function drawRun(g, A, dirA, B, dirB, sag, k) {
    const plug = 15 * k, tip = 4 * k;
    // the plugs stick out of the jacks along the given directions; the wire starts behind them
    const a1 = [A[0] + dirA[0] * plug, A[1] + dirA[1] * plug];
    const b1 = [B[0] + dirB[0] * plug, B[1] + dirB[1] * plug];
    const dist = Math.hypot(b1[0] - a1[0], b1[1] - a1[1]);
    const reach = Math.max(30 * k, dist * 0.32);
    const c1 = [a1[0] + dirA[0] * reach, a1[1] + dirA[1] * reach + sag];
    const c2 = [b1[0] + dirB[0] * reach, b1[1] + dirB[1] * reach + sag];
    const d = `M${a1[0].toFixed(1)} ${a1[1].toFixed(1)} C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${b1[0].toFixed(1)} ${b1[1].toFixed(1)}`;
    g.rim.setAttribute('d', d);
    g.wire.setAttribute('d', d);
    g.shine.setAttribute('d', d);
    g.shine.style.transform = `translate(${(-0.8 * k).toFixed(2)}px, ${(-1.4 * k).toFixed(2)}px)`;
    g.wire.style.strokeWidth = (5 * k).toFixed(2);
    g.rim.style.strokeWidth = (7.5 * k).toFixed(2);
    [[A, a1, dirA, 0], [B, b1, dirB, 1]].forEach(([p, q, dir, i]) => {
      const l = g.plugs[i];
      l.setAttribute('x1', (p[0] + dir[0] * tip).toFixed(1)); l.setAttribute('y1', (p[1] + dir[1] * tip).toFixed(1));
      l.setAttribute('x2', q[0].toFixed(1)); l.setAttribute('y2', q[1].toFixed(1));
      l.style.strokeWidth = (9 * k).toFixed(2);
      const tp = g.tips[i];
      tp.setAttribute('x1', p[0].toFixed(1)); tp.setAttribute('y1', p[1].toFixed(1));
      tp.setAttribute('x2', (p[0] + dir[0] * tip).toFixed(1)); tp.setAttribute('y2', (p[1] + dir[1] * tip).toFixed(1));
      tp.style.strokeWidth = (4 * k).toFixed(2);
    });
  }

  /* ---------- Sound ---------- */
  let guitar = null, loading = null, playing = false;
  async function engine() {
    if (guitar) return guitar;
    if (!loading) loading = import('./guitar-audio.js?v=20261109').then((m) => { guitar = m.createGuitar(); return guitar; });
    return loading;
  }
  function setUI(on) {
    playing = on;
    btn.setAttribute('aria-pressed', String(on));
    label.textContent = t(on ? 'guitar.stop' : 'guitar.play');
    icon.textContent = on ? '■' : '▶';
    sec.classList.toggle('is-playing', on);
    if (!on && bar) bar.style.transform = 'scaleX(0)';
    sec.dispatchEvent(new CustomEvent('guitarstate'));
  }
  async function start() {
    const g = await engine();
    if (!g) return;
    g.play(() => { setUI(false); });
    setUI(true);
    wake();
  }
  function stop() { if (guitar && guitar.playing) guitar.stop(); if (playing) setUI(false); }
  const toggle = () => (playing ? stop() : start());
  btn.addEventListener('click', toggle);
  guitarItem.addEventListener('click', toggle);
  document.addEventListener('langchange', () => { label.textContent = t(playing ? 'guitar.stop' : 'guitar.play'); });

  /* ---------- One frame: floating, cable, and the playing visuals (GSAP ticker) ---------- */
  let ticking = false, onScreen = false, time = 0;
  let tilt = 0, tiltT = 0, kick = 0; // kick: a pluck from scrolling in the scene (task 13)
  let lvlS = 0, hit = 0, bassS = 0; // smoothed level, hit envelope, smoothed bass
  const zero = new Float32Array(6);
  const TAU = Math.PI * 2;
  function float(per, phase, r0, amp) {
    if (reduced) return { x: 0, y: 0, r: r0, s: 0 };
    const s = -Math.cos((TAU * (time + phase)) / per);
    return { x: 0, y: (-1 - 11 * s) * amp, r: r0 + 0.2 + 1.8 * s, s };
  }
  function frame(_, deltaMs) {
    const dt = Math.min((deltaMs || 16.7) / 1000, 0.05);
    if (!window.__motionPaused) time += dt;
    kick *= Math.exp(-dt * 4);
    if (!L) measure();
    const g = guitar;
    const energy = g ? g.update() : zero;
    const lvl = g && playing ? g.level() : 0;
    const bass = g && playing && g.bass ? g.bass() : 0;
    if (playing && bar) bar.style.transform = `scaleX(${g.progress().toFixed(4)})`;
    // a hit: the level jumps above its own recent average
    hit = Math.max(hit * Math.exp(-dt * 9), Math.max(0, lvl - lvlS) * 2.6);
    lvlS += (lvl - lvlS) * (1 - Math.exp(-dt * 5));
    bassS += (bass - bassS) * (1 - Math.exp(-dt * (bass > bassS ? 30 : 8)));
    const live = !reduced && !window.__motionPaused;
    // paused motion and silence: the scene stands still, nothing to write (the cable is already drawn)
    if (!live && !playing && kick < 0.01 && L.drawn && lvlS < 0.004 && hit < 0.01 && energy.every((e) => e < 0.004)) {
      if (!onScreen) { gsap.ticker.remove(frame); ticking = false; }
      return;
    }
    L.drawn = true;

    // floating and the floor shadows
    const sg = float(5.4, 0, -14, 1);
    const sa = float(6.8, 2.1, 0, 1);
    tilt += (tiltT - tilt) * (1 - Math.exp(-dt * 8));
    if (live && (playing || lvlS > 0.01)) {
      // the amp shakes with the volume, faster and harder on hits
      const f = Math.min(1, lvlS * 1.4 + hit);
      sa.x += (Math.random() - 0.5) * 2 * (0.6 + 1.4 * f) * f * 1.2;
      sa.y += (Math.random() - 0.5) * 2 * (0.5 + 1.2 * f) * f;
      sa.r += (Math.random() - 0.5) * 0.8 * f;
    }
    gFloat.style.transform = `translate3d(0, ${sg.y.toFixed(2)}px, 0) rotate(${sg.r.toFixed(3)}deg)`;
    aFloat.style.transform = `translate3d(${sa.x.toFixed(2)}px, ${sa.y.toFixed(2)}px, 0) rotate(${sa.r.toFixed(3)}deg)`;
    gShadow.style.transform = `scale(${(0.89 - 0.11 * sg.s).toFixed(3)})`; gShadow.style.opacity = (0.8 - 0.2 * sg.s).toFixed(3);
    aShadow.style.transform = `scale(${(0.89 - 0.11 * sa.s).toFixed(3)})`; aShadow.style.opacity = (0.8 - 0.2 * sa.s).toFixed(3);
    if (fine && !reduced) tiltEl.style.transform = Math.abs(tilt) > 0.01 ? `rotate(${tilt.toFixed(2)}deg)` : '';

    // the cable follows the jacks; a little shake on the hits
    const k = L.k;
    const G = point(L.g, JACK_GUITAR, sg, fine && !reduced ? tilt : 0);
    const P0 = point(L.p, JACK_PEDAL_IN, { x: 0, y: 0, r: 0 });
    const P1 = point(L.p, JACK_PEDAL_OUT, { x: 0, y: 0, r: 0 });
    const A = point(L.a, JACK_AMP, sa);
    const wob = live ? hit * 7 * k * Math.sin(time * 44) : 0;
    drawRun(runs[0], G, [0.35, 0.94], P0, [-1, 0.1], 46 * k + wob, k);
    drawRun(runs[1], P1, [1, 0.1], A, [-0.15, 0.99], 70 * k - wob * 0.8, k);

    // strings, lamp, LED, speakers
    drawStrings(energy, performance.now() / 1000);
    if (!reduced) {
      lamp.style.opacity = String(0.35 + lvl * 0.65);
      led.style.opacity = playing ? (0.55 + Math.min(1, lvlS * 1.6) * 0.45).toFixed(3) : '0';
      led.style.transform = `scale(${(1 + Math.min(1, lvlS + hit) * 0.35).toFixed(3)})`;
      const sc = 1 + Math.min(1, bassS) * 0.05;
      cones.forEach((c) => { c.style.transform = `scale(${sc.toFixed(4)})`; });
      cores.forEach((c) => { c.style.opacity = Math.min(1, hit * 1.6).toFixed(3); });
    } else {
      lamp.style.opacity = playing ? '0.9' : '0.35';
      led.style.opacity = playing ? '0.9' : '0';
    }
    sec.style.setProperty('--lvl', lvl.toFixed(3));

    // rest: off screen and silent (or reduced motion and silent) → stop the loop
    const quiet = !playing && kick < 0.01 && energy.every((e) => e < 0.004) && lvlS < 0.004 && hit < 0.01;
    if (quiet && (!onScreen || reduced)) {
      drawStrings(zero, 0);
      lamp.style.opacity = ''; led.style.opacity = ''; led.style.transform = '';
      cones.forEach((c) => { c.style.transform = ''; }); cores.forEach((c) => { c.style.opacity = ''; });
      gsap.ticker.remove(frame); ticking = false;
    }
  }
  function wake() { if (!ticking) { ticking = true; gsap.ticker.add(frame); } }

  // Runs while the panel is on screen; stops the song when it leaves or the tab is hidden
  new IntersectionObserver(([en]) => {
    onScreen = en.isIntersecting;
    if (onScreen) { L = null; wake(); } else if (playing) stop();
  }, { threshold: 0 }).observe(sec);
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) stop(); });
  let rt = 0;
  window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { L = null; if (reduced) wake(); }, 120); });
  // pictures arriving change the boxes
  stage.querySelectorAll('img').forEach((im) => { if (!im.complete) im.addEventListener('load', () => { L = null; wake(); }, { once: true }); });
  document.addEventListener('heropanel', () => { L = null; wake(); });

  /* ---------- Hover (fine pointer): glow, lean towards the pointer, "▶ Play" pill ---------- */
  if (fine && !reduced) {
    const pill = document.createElement('span');
    pill.className = 'guitar__pill mono';
    pill.setAttribute('aria-hidden', 'true');
    sec.appendChild(pill);
    const pillText = () => { pill.textContent = playing ? `■ ${t('guitar.stop')}` : `▶ ${t('guitar.play')}`; };
    pillText();
    document.addEventListener('langchange', pillText);
    sec.addEventListener('guitarstate', pillText);
    guitarItem.addEventListener('pointermove', (e) => {
      const r = guitarItem.getBoundingClientRect(), sr = sec.getBoundingClientRect();
      tiltT = ((e.clientX - r.left) / r.width - 0.5) * 6;
      pill.style.transform = `translate3d(${(e.clientX - sr.left + 18).toFixed(0)}px, ${(e.clientY - sr.top + 18).toFixed(0)}px, 0)`;
      sec.classList.add('is-hover');
      wake();
    });
    guitarItem.addEventListener('pointerleave', () => { tiltT = 0; sec.classList.remove('is-hover'); });
  }

  wake();
  function nudge() { kick = 1; if (!playing) start(); wake(); }
  return { stop, nudge };
}
