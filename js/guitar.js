/* Guitar section (#guitar, task 09): an electric guitar and an amp float over smoke.
     Floating: both drift up and down (±12 px) and turn a little (±2°) with different periods (CSS,
     transforms only); the soft shadow on the "floor" shrinks when the object is higher.
     Hover (fine pointer): the glow gets stronger, the guitar leans towards the pointer and a "▶ Play"
     pill follows the pointer; the cursor ring shows a play icon (cursor.js, [data-cursor-play]).
     Click on the guitar or the button: it plays an original riff (js/guitar-audio.js, loaded on the
     first play). While it plays, six SVG lines lie exactly on the strings (nut to bridge) and vibrate
     when their string sounds, as strong as the sound; the amp's lamp pulses and its speakers breathe.
     It stops when the section leaves the screen, when the tab is hidden and on "Stop". No autoplay.
   Accessibility: a real <button> with aria-pressed and a visible focus; the pictures are aria-hidden.
   Reduced motion: no floating and no vibrating, the sound still plays. */

const t = (k) => (window.i18n ? window.i18n.t(k) : k);
// Strings on the 609×1600 picture: x at the nut (y 280) and at the bridge (y 1268), low E first
const NUT_Y = 280, BRIDGE_Y = 1268;
const NUT_X = [274.5, 288, 301.5, 315, 328.5, 342];
const BRIDGE_X = [265, 282.6, 300.2, 317.8, 335.4, 353];

export function initGuitar({ reduced, gsap }) {
  const sec = document.getElementById('guitar');
  if (!sec) return;
  const btn = sec.querySelector('#guitar-play');
  const label = btn.querySelector('.guitar__play-label');
  const icon = btn.querySelector('.guitar__play-icon');
  const guitarItem = sec.querySelector('.guitar__item--guitar');
  const tiltEl = sec.querySelector('.guitar__tilt');
  const svg = sec.querySelector('.guitar__strings');
  const lamp = sec.querySelector('.amp__lamp');
  const cones = [...sec.querySelectorAll('.amp__cone')];
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  sec.classList.add('is-ready');

  // Strings: six paths, drawn straight until they sound
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
      const e = reduced ? 0 : energy[i];
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

  /* ---------- Sound ---------- */
  let guitar = null, loading = null, playing = false;
  async function engine() {
    if (guitar) return guitar;
    if (!loading) loading = import('./guitar-audio.js?v=20261107').then((m) => { guitar = m.createGuitar(); return guitar; });
    return loading;
  }
  function setUI(on) {
    playing = on;
    btn.setAttribute('aria-pressed', String(on));
    label.textContent = t(on ? 'guitar.stop' : 'guitar.play');
    icon.textContent = on ? '■' : '▶';
    sec.classList.toggle('is-playing', on);
    document.getElementById('cursor')?.classList.toggle('is-stop', on); // the play cursor shows stop at once
    sec.dispatchEvent(new CustomEvent('guitarstate'));
  }
  async function start() {
    const g = await engine();
    if (!g) return;
    g.play(() => { setUI(false); });
    setUI(true);
    loop();
  }
  function stop() { if (guitar && guitar.playing) guitar.stop(); setUI(false); }
  const toggle = () => (playing ? stop() : start());
  btn.addEventListener('click', toggle);
  guitarItem.addEventListener('click', toggle);
  document.addEventListener('langchange', () => { label.textContent = t(playing ? 'guitar.stop' : 'guitar.play'); });

  // Visuals while playing (GSAP ticker, only then)
  let ticking = false;
  const zero = new Float32Array(6);
  function frame() {
    const g = guitar;
    const energy = g ? g.update() : zero;
    const lvl = g && playing ? g.level() : 0;
    drawStrings(energy, performance.now() / 1000);
    if (!reduced) {
      lamp.style.opacity = String(0.35 + lvl * 0.65);
      cones.forEach((c) => { c.style.transform = `scale(${(1 + lvl * 0.035).toFixed(4)})`; });
    } else lamp.style.opacity = playing ? '0.9' : '0.35';
    sec.style.setProperty('--lvl', lvl.toFixed(3));
    if (!playing && energy.every((e) => e < 0.004)) {
      drawStrings(zero, 0);
      lamp.style.opacity = ''; cones.forEach((c) => { c.style.transform = ''; });
      gsap?.ticker.remove(frame); ticking = false;
    }
  }
  function loop() { if (!ticking && gsap) { ticking = true; gsap.ticker.add(frame); } }

  // Stop when the section leaves the screen or the tab is hidden
  new IntersectionObserver(([en]) => { if (!en.isIntersecting && playing) stop(); }, { threshold: 0 }).observe(sec);
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) stop(); });

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
      const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
      tiltEl.style.transform = `rotate(${(nx * 6).toFixed(2)}deg) rotateX(${(-ny * 6).toFixed(2)}deg)`;
      pill.style.transform = `translate3d(${(e.clientX - sr.left + 18).toFixed(0)}px, ${(e.clientY - sr.top + 18).toFixed(0)}px, 0)`;
      sec.classList.add('is-hover');
    });
    guitarItem.addEventListener('pointerleave', () => { tiltEl.style.transform = ''; sec.classList.remove('is-hover'); });
  }
}
