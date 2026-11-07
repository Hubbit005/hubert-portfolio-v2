/* Hero: the word HUBERT as one extruded, bevelled chrome solid, twisted around its long (horizontal)
   axis like a twisted ice lolly (three.js, task 10). The twist is a vertex deformation in the shader:
   the cross-section turns more and more along X (about 96° over the whole word), so the middle reads
   straight on and the ends show the twist. Positions and normals are turned together, so the light
   and the reflections follow the twist. Font: vendor/fonts/typeface/archivo-900-125-hubert.json
   (Archivo, widest width, black weight; converted once offline).
   Motion: the twist slowly "waves" (its angle changes over time), the word turns a little around the
   vertical axis (±15°) and floats up and down. It can be grabbed with a mouse and spun (horizontal drag
   turns it around the vertical axis, vertical drag rolls it around its long axis); the spin has inertia,
   dies down and then the word glides back to the middle and to the calm motion. The icons
   (js/hero-icons.js) bounce off it: hero.js publishes the word's size on the stage (data-ww, data-wh).
   Material: chrome like the icons and the roulette (metalness 1, low roughness, the studio reflection
   map assets/hf/env-studio.jpg through PMREMGenerator), with accent and pink lights in the reflections.
   Roulette ("Play roulette", task 12: 37 pockets of the European wheel, js/roulette.js). Opening it unwinds the twist; the word floats up and away
   and fades while the camera tilts down onto the chrome wheel. A real chrome ball decides the result:
   it runs along the rim against the wheel's turn, slows down, spirals in, bounces off the frets between
   the fields and stops in a pocket. That pocket is the result (card and aria-live). Sound:
   js/roulette-sound.js.
   Phones: fewer segments, no dragging (the page scrolls), a tap gives a short roll; the 3D word starts
   only after the first touch, scroll or key (or after a while), so it never slows the first view.
   Reduced motion: the solid stands still with a fixed twist (one frame, redrawn on resize); the
   roulette uses the simple panel (js/roulette.js). No WebGL or a load error: the static word stays.
   One loop: the GSAP ticker, only while the hero is on screen, the tab is visible and the guitar panel
   (js/hero-panel.js, hero.dataset.panel) does not cover it. */
import { ORDER, RED } from './roulette.js?v=20261110';
import { createRouletteSound } from './roulette-sound.js?v=20261110';

const WORD = 'HUBERT';
const TRACK = 0.06;       // gap between glyphs, in em
const DEPTH = 0.3;        // extrusion depth, in em
const PERSP = 13;         // camera distance, in em
const TAU = Math.PI * 2;
const DEG = Math.PI / 180;
const TWIST = 96 * DEG;   // twist over the whole word (ends ±48°)
const WAVE = 10 * DEG;    // the travelling wave on top of the twist
const YAW = 15 * DEG;     // calm turn around the vertical axis
const ENTER_MS = 1800;
const ELEV = 58 * DEG;    // camera elevation in the roulette view
const TURN_MS = 1250;     // camera move between the views
const WHEEL_R = 2.5;      // roulette wheel radius, in em

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

export function initHero({ reduced, lenis, gsap, onRoulette }) {
  const stage = document.getElementById('hero-stage');
  const hero = stage?.closest('.hero');
  if (!stage || !hero || !gsap) return { destroy() {} };
  if (!hasWebGL()) return { destroy() {} }; // static word stays

  const ctl = { destroy() {} };
  const run = () => start({ stage, hero, lenis, gsap, ctl, reduced, onRoulette }).catch(() => {
    stage.classList.remove('is-3d'); // keep the static word
  });
  // Phones: the static word shows first; the 3D word (and with it the icons and the roulette wheel)
  // starts on the first touch, scroll or key, or after a while, so it never slows the first view.
  const phone = Math.min(window.innerWidth, window.innerHeight) < 700 || matchMedia('(pointer: coarse)').matches;
  if (!phone) run();
  else {
    const EV = ['pointerdown', 'touchstart', 'wheel', 'scroll', 'keydown'];
    let done = false, timer = 0;
    const go = () => {
      if (done) return; done = true;
      clearTimeout(timer);
      EV.forEach((ev) => window.removeEventListener(ev, go, true));
      (window.requestIdleCallback || ((cb) => setTimeout(cb, 60)))(run, { timeout: 600 });
    };
    EV.forEach((ev) => window.addEventListener(ev, go, { capture: true, passive: true }));
    timer = setTimeout(go, 12000);
  }
  return { destroy() { ctl.destroy(); } };
}

async function start({ stage, hero, lenis, gsap, ctl, reduced, onRoulette }) {
  const base = new URL('../vendor/', import.meta.url);
  const [THREE, { FontLoader }, fontJson] = await Promise.all([
    import(new URL('three/three.module.min.js', base).href),
    import(new URL('three/addons/loaders/FontLoader.js', base).href),
    fetch(new URL('fonts/typeface/archivo-900-125-hubert.json', base)).then((r) => r.json()),
  ]);
  const font = new FontLoader().parse(fontJson);
  const upm = fontJson.resolution;
  const capH = (fontJson.capHeight || 686) / upm;
  const title = stage.querySelector('.hero__title');
  // The canvas lives in panel 1 (it slides away with it); classes stay on the hero (#home).
  const host = stage.closest('.hero__panel') || hero;

  /* ---------- Renderer and canvas ---------- */
  const small = Math.min(window.innerWidth, window.innerHeight) < 700 || matchMedia('(pointer: coarse)').matches;
  // Pixel ratio: at most 1.5 on desktop, 1 on phones. At 1.5 and up the edges are smooth enough
  // without multisampling, so antialiasing is only switched on below that (phones and 1x screens).
  const PR_MAX = small ? 1 : 1.5;
  const pr0 = Math.min(window.devicePixelRatio || 1, PR_MAX);
  const renderer = new THREE.WebGLRenderer({ antialias: pr0 < 1.5, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(pr0);
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.className = 'hero__gl';
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, PERSP);

  // Lights: the reflection map does most of the work on chrome; these add the warm highlights.
  const amb = new THREE.AmbientLight(0xffffff, 0.35);
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(-0.4, 0.9, 0.8);
  const warm = new THREE.DirectionalLight(0xff5a1f, 1.9);
  warm.position.set(0.9, -0.5, 0.5);
  const pink = new THREE.DirectionalLight(0xffffff, 1.8);
  pink.position.set(-0.9, -0.3, 0.6);
  scene.add(amb, key, warm, pink);
  function applyTheme() {
    const cs = getComputedStyle(document.documentElement);
    warm.color.set(cs.getPropertyValue('--accent').trim() || '#ff5a1f');
    pink.color.set(cs.getPropertyValue('--chrome-pink').trim() || '#ffffff'); // tokens.css
  }

  /* ---------- The word: one solid, glyphs merged into one geometry ---------- */
  const parts = [];
  let x = 0;
  for (const ch of WORD) {
    const g = new THREE.ExtrudeGeometry(font.generateShapes(ch, 1), {
      depth: DEPTH, curveSegments: small ? 3 : 8,
      bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.018, bevelSegments: small ? 1 : 3,
    });
    g.translate(x, 0, 0);
    parts.push(g);
    x += (fontJson.glyphs[ch]?.ha || upm) / upm + TRACK;
  }
  const wordGeo = mergeGeometries(THREE, parts);
  wordGeo.computeBoundingBox();
  const bb = wordGeo.boundingBox;
  const LEN = bb.max.x - bb.min.x;
  wordGeo.translate(-(bb.min.x + bb.max.x) / 2, -capH / 2, -DEPTH / 2);

  // Twist in the vertex shader: angle(x) = twist · x / LEN + wave · sin(2π · x / LEN − time)
  const twistU = { uTwist: { value: TWIST }, uWave: { value: WAVE }, uPhase: { value: 0 }, uLen: { value: LEN } };
  const wordMat = new THREE.MeshStandardMaterial({ color: '#f4eaee', metalness: 1, roughness: 0.14, envMapIntensity: 1.75, transparent: true });
  wordMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, twistU);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
uniform float uTwist; uniform float uWave; uniform float uPhase; uniform float uLen;
mat3 twistAt(float x) {
  float u = x / uLen;
  float a = uTwist * u + uWave * sin(6.2831853 * u - uPhase);
  float c = cos(a), s = sin(a);
  return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c);
}`)
      .replace('#include <beginnormal_vertex>', 'vec3 objectNormal = twistAt(position.x) * vec3(normal);')
      .replace('#include <begin_vertex>', 'vec3 transformed = twistAt(position.x) * vec3(position);');
  };
  const word = new THREE.Mesh(wordGeo, wordMat);
  word.frustumCulled = false; // the shader moves the vertices outside the stored bounds

  const tilt = new THREE.Group();   // fit to the screen (scale) and the hover tilt
  const wordG = new THREE.Group();  // the word's own motion
  wordG.add(word);
  tilt.add(wordG);
  scene.add(tilt);
  applyTheme();

  /* ---------- Roulette wheel (hidden until opened) ---------- */
  const N = ORDER.length;
  const SECTOR = TAU / N;
  const RW = WHEEL_R;                // wheel radius, in em
  const WY = -capH / 2 - 0.02;       // wheel face height: at the foot of the letters
  const rou = new THREE.Group();
  rou.visible = false;
  tilt.add(rou);
  const wheelGroup = new THREE.Group();
  rou.add(wheelGroup);
  try { await document.fonts.load('800 40px Archivo'); } catch (e) { /* draw with the fallback font */ }
  const faceTex = new THREE.CanvasTexture(wheelCanvas(small ? 768 : 1024));
  faceTex.colorSpace = THREE.SRGBColorSpace;
  faceTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  // Chrome: standard materials with the studio reflection map (loadEnv below, shared with the word).
  const chrome = (color, rough, extra = {}) => new THREE.MeshStandardMaterial({ color, metalness: 1, roughness: rough, ...extra });
  const faceMat = new THREE.MeshStandardMaterial({
    map: faceTex, emissiveMap: faceTex, emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.5,
    metalness: 0.6, roughness: 0.24,
  });
  const face = new THREE.Mesh(new THREE.CircleGeometry(RW, 128).rotateX(-Math.PI / 2), faceMat);
  face.position.y = WY;
  const baseMat = chrome('#cfd0d6', 0.16);
  const wheelBase = new THREE.Mesh(new THREE.CylinderGeometry(RW * 1.04, RW * 1.07, 0.16, 96), baseMat);
  wheelBase.position.y = WY - 0.085;
  const rimMat = chrome('#e6e6ea', 0.08);
  const wheelRim = new THREE.Mesh(new THREE.TorusGeometry(RW * 1.005, 0.05, 12, 128).rotateX(Math.PI / 2), rimMat);
  wheelRim.position.y = WY + 0.012;
  wheelGroup.add(face, wheelBase, wheelRim);
  // Frets: chrome bars on the borders between the fields, around the pocket ring
  const FRET_IN = 0.8, FRET_OUT = 0.985;
  const fretMat = chrome('#f0f0f4', 0.1);
  const fretGeo = new THREE.BoxGeometry(0.03, 0.08, RW * (FRET_OUT - FRET_IN));
  for (let i = 0; i < N; i++) {
    const a2 = i * SECTOR + SECTOR / 2;
    const fret = new THREE.Mesh(fretGeo, fretMat);
    const rm = RW * (FRET_IN + FRET_OUT) / 2;
    fret.position.set(Math.sin(a2) * rm, WY + 0.04, Math.cos(a2) * rm);
    fret.rotation.y = a2;
    wheelGroup.add(fret);
  }
  // chrome hub dome over the H mark's ring
  const hub = new THREE.Mesh(new THREE.TorusGeometry(RW * 0.17, 0.022, 10, 64).rotateX(Math.PI / 2), rimMat);
  hub.position.y = WY + 0.012;
  wheelGroup.add(hub);
  // the old pointer: the ball decides now, so there is no pointer
  const pointer = new THREE.Group();
  pointer.visible = false;
  rou.add(pointer);
  // The ball (in the wheel's frame of reference: rou, not wheelGroup)
  const RB = RW * 0.064;
  const ballMesh = new THREE.Mesh(new THREE.SphereGeometry(RB, 32, 24), chrome('#f4f4f6', 0.06));
  rou.add(ballMesh);
  const envMats = [wordMat, faceMat, baseMat, rimMat, fretMat, ballMesh.material];
  // The studio reflection map (chrome for the word, the wheel and the ball): loaded once, at start.
  let envReady = null;
  function loadEnv() {
    if (envReady) return envReady;
    envReady = new Promise((res) => {
      new THREE.TextureLoader().load(new URL('../assets/hf/env-studio.jpg', import.meta.url).href, (tex) => {
        tex.mapping = THREE.EquirectangularReflectionMapping;
        tex.colorSpace = THREE.SRGBColorSpace;
        const pm = new THREE.PMREMGenerator(renderer);
        const env = pm.fromEquirectangular(tex).texture;
        tex.dispose(); pm.dispose();
        envMats.forEach((m) => { m.envMap = env; m.needsUpdate = true; });
        res(true);
      }, undefined, () => res(false));
    });
    return envReady;
  }

  function wheelCanvas(size) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const r = size / 2;
    const k = size / 1024;
    // red pockets in the accent, black in dark chrome, 0 in a muted green (the only extra colour)
    const fill = (n) => (n === 0 ? ['#2e5b45', '#f2f2ee'] : RED.has(n) ? ['#ff4f12', '#0d0d0d'] : ['#1d1d21', '#f2f2ee']);
    g.translate(r, r);
    // Canvas direction (sin a, cos a) is local wheel angle a (see the texture mapping of the face).
    const th = (a) => Math.PI / 2 - a;
    for (let i = 0; i < N; i++) {
      const [bg, fg] = fill(ORDER[i]);
      const a0 = i * SECTOR - SECTOR / 2, a1 = i * SECTOR + SECTOR / 2;
      g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r, th(a1), th(a0)); g.closePath();
      g.fillStyle = bg; g.fill();
      // label along the radius, from the hub outwards
      g.save();
      g.rotate(th(i * SECTOR));
      g.fillStyle = fg;
      g.textBaseline = 'middle';
      if ('fontStretch' in g) g.fontStretch = 'expanded';
      g.font = `800 ${50 * k}px Archivo, "Arial Black", sans-serif`;
      g.fillText(String(ORDER[i]), 318 * k, 0); // in the outer field, inside the pocket ring
      g.restore();
    }
    // separators
    g.strokeStyle = 'rgba(13,13,13,0.85)'; g.lineWidth = 3 * k;
    for (let i = 0; i < N; i++) {
      const a = i * SECTOR + SECTOR / 2;
      g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(a) * r, Math.cos(a) * r); g.stroke();
    }
    // the pocket ring: a thin dark line where the frets start
    g.lineWidth = 3 * k; g.strokeStyle = 'rgba(0,0,0,0.55)';
    g.beginPath(); g.arc(0, 0, r * 0.8, 0, TAU); g.stroke();
    // outer band and hub with the H mark
    g.lineWidth = 22 * k; g.strokeStyle = '#0d0d0d';
    g.beginPath(); g.arc(0, 0, r - 11 * k, 0, TAU); g.stroke();
    g.fillStyle = '#0d0d0d'; g.beginPath(); g.arc(0, 0, 92 * k, 0, TAU); g.fill();
    g.fillStyle = '#ff4f12'; g.beginPath(); g.arc(0, 0, 80 * k, 0, TAU); g.fill();
    g.fillStyle = '#0d0d0d'; g.beginPath(); g.arc(0, 0, 72 * k, 0, TAU); g.fill();
    g.save();
    g.scale(1.6 * k, 1.6 * k); g.translate(-32, -32);
    g.fillStyle = '#ff4f12';
    g.fill(new Path2D('M23 12h6v40h-6z'));
    g.fillStyle = '#ecece9';
    g.fill(new Path2D('M13 12h10v40H13zM41 12h10v40H41zM23 31l18-9v10l-18 9z'));
    g.restore();
    return c;
  }

  /* ---------- Size ---------- */
  // The camera renders a window (view offset) of a taller virtual frame whose centre sits on the
  // stage centre, so the word looks exactly as on a stage-sized canvas. In the normal view the canvas
  // is only the band around the word; it grows to the whole hero only while the roulette is open.
  // (A full-hero canvas is composited in every frame even where nothing is drawn.)
  let W = 1, Hc = 1, Hv = 2, fsPx = 100, yOffN = 0, yOffR = 0, rD = PERSP;
  let bandY = 0, bandH = 1;          // band in hero pixels, measured from the bottom (GL convention)
  let full = false, cTop = 0, cH = 1; // canvas mode, its top in the hero and its height
  let rT = 0, rE = 0, rEase = 0;      // roulette: target 0/1, linear progress, eased progress
  function resize() {
    fsPx = parseFloat(getComputedStyle(title).fontSize) || 100;
    W = Math.max(1, Math.round(host.clientWidth));
    Hc = Math.max(1, Math.round(host.clientHeight));
    Hv = Hc * 2;
    const pr = Math.min(window.devicePixelRatio || 1, PR_MAX, Math.sqrt(4.2e6 / (W * Hc)));
    renderer.setPixelRatio(Math.max(1, pr));
    camera.aspect = (W * 3) / Hv; // virtual frame is 3 canvases wide so the view can slide sideways
    // Vertical field so that 1 world unit = 1 em at the word's plane.
    camera.fov = (2 * Math.atan((Hv / fsPx) / 2 / PERSP) * 180) / Math.PI;
    // Fit: the word stays clear of the hero's right edge, where the big "to the guitar" arrow
    // stands (--hero-side: its width plus margins, on both sides so the word stays centred).
    const side = parseFloat(getComputedStyle(hero).getPropertyValue('--hero-side')) || 24;
    const wordPx = LEN * 1.06 * fsPx;  // a little extra for the turn and the twisted ends
    const sc = Math.min(1, Math.max(0.3, (W - 2 * side) / wordPx));
    tilt.scale.setScalar(sc);
    stage.dataset.ww = String(Math.round(LEN * 1.04 * fsPx * sc));
    stage.dataset.wh = String(Math.round(capH * 1.5 * fsPx * sc));
    const stageMid = stage.offsetTop + stage.offsetHeight / 2;
    yOffN = Hv / 2 - stageMid;
    const half = Math.max(stage.offsetHeight / 2, fsPx * sc * 1.1) + fsPx * 0.3; // room for the spin
    bandY = Math.max(0, Math.floor(Hc - (stageMid + half)));
    bandH = Math.min(Hc - bandY, Math.ceil(half * 2));
    // Roulette view: wheel centre on screen and camera distance so the wheel fits.
    const narrow = W < 700;
    const wide = W >= 1100; // task 13: the wheel stays centred; wide screens: table and coins on its sides
    yOffR = Hv / 2 - Hc * (narrow ? 0.3 : wide ? 0.5 : 0.45); // phones: the bet table sits under the wheel
    const rho = WHEEL_R * 1.25 * sc;
    const fitW = narrow ? W * 0.92 : wide ? W - 640 : W * 0.58, fitH = Hc * (narrow ? 0.56 : 0.76);
    rD = Math.max(PERSP * 0.7, (2 * rho * fsPx * PERSP) / fitW, (1.8 * rho * fsPx * PERSP) / fitH);
    applySize();
  }
  function applySize() {
    cTop = full ? 0 : Hc - bandY - bandH;
    cH = full ? Hc : bandH;
    canvas.style.top = `${cTop}px`;
    canvas.style.width = `${W}px`;
    canvas.style.height = `${cH}px`;
    renderer.setSize(W, cH, false);
    setCamera(rEase);
  }
  function setFull(on) { if (full !== on) { full = on; applySize(); } }

  function setCamera(e) {
    const el = e * ELEV;
    const dist = PERSP + (rD - PERSP) * e;
    const wy = WY * tilt.scale.y * e;
    camera.position.set(0, wy + dist * Math.sin(el), dist * Math.cos(el));
    camera.lookAt(0, wy, 0);
    camera.setViewOffset(W * 3, Hv, W, yOffN + (yOffR - yOffN) * e + cTop, W, cH);
  }

  const render = () => renderer.render(scene, camera);
  let time = 0;
  const pose = { yaw: 0, roll: 0 }; // the grabbed spin, on top of the calm motion
  const vel = { yaw: 0, roll: 0 };
  const spr = { x: 0, xV: 0, xT: 0, y: 0, yV: 0, yT: 0 }; // the word follows the hand a little (em)
  let tiltX = 0, tiltXT = 0, tiltY = 0, tiltYT = 0;
  let entered = reduced;

  // Places the word for time t. e: entrance progress (0 … 1), r: roulette progress (eased).
  function place(e, r) {
    const calm = reduced ? 0 : 1;
    const enter = 1 - e;                       // the entrance: a fast unwinding roll
    twistU.uTwist.value = (TWIST * (1 + 0.06 * Math.sin(time * 0.5) * calm) + enter * TAU * 1.2) * (1 - r);
    twistU.uWave.value = WAVE * calm * (1 - r);
    twistU.uPhase.value = time * 0.9;
    wordG.rotation.order = 'YXZ';
    wordG.rotation.y = YAW * Math.sin(time * 0.42) * calm + pose.yaw - enter * 0.6;
    wordG.rotation.x = 0.05 * Math.sin(time * 0.31) * calm + pose.roll - enter * TAU * 0.5;
    wordG.position.set(spr.x, 0.06 * Math.sin(time * 0.9) * calm + spr.y + r * 2.6, -r * 4);
    wordG.scale.setScalar(1 - 0.45 * r);
    wordMat.opacity = Math.max(0, Math.min(1, 1 - (r - 0.25) / 0.55));
    wordG.visible = wordMat.opacity > 0.01;
    tilt.rotation.x = tiltX * DEG;
    tilt.rotation.z = -tiltY * 0.2 * DEG;
  }

  /* ---------- Roulette: wheel, ball physics, pointer drag ---------- */
  // Wheel: angle phi, angular speed omega (rad/s), slowed by friction. Ball: polar coordinates in the
  // rou frame (world angle A, radius r), on the rim track first, then in the pocket ring, where it
  // moves with the wheel plus its own local speed (wl). The pocket it stops in is the result.
  const wheel = { phi: 0, vel: 0, omega: 0, drag: null };
  const wrapPi = (x) => ((((x + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
  const api = { onResult: null, onSpinStart: null, sound: createRouletteSound() };
  const R_TRACK = RW * 0.955, R_POCKET = RW * 0.89, R_IN = RW * 0.82, R_OUT = RW * 0.955;
  const ball = { phase: 'rest', A: Math.PI, r: R_POCKET, w: 0, vr: 0, wl: 0, y: 0, vy: 0, still: 0, reported: true, lastFret: 0 };
  const local = () => ((((ball.A - wheel.phi) % TAU) + TAU) % TAU);      // ball angle on the wheel
  const pocketAt = (al) => Math.round(al / SECTOR) % N;                  // fields centred at i·SECTOR
  ball.A = wheel.phi + Math.floor(Math.random() * N) * SECTOR;           // starts resting in a pocket

  function launch(dir, strength = 1) {
    // ball onto the rim track, against the wheel's turn
    ball.phase = 'track'; ball.r = R_TRACK; ball.vr = 0; ball.y = 0; ball.vy = 0; ball.still = 0;
    ball.w = -dir * (13 + Math.random() * 3.5) * strength;
    ball.reported = false;
    api.sound.wake();
    api.onSpinStart?.();
  }
  function startSpin(dir = Math.random() < 0.5 ? -1 : 1, speed = 5.5 + Math.random() * 1.6) {
    wheel.omega = dir * speed;
    launch(Math.sign(wheel.omega) || 1);
  }
  const spinning = () => ball.phase !== 'rest' || !ball.reported;
  api.open = () => {
    rT = 1;
    setFull(true);
    tiltXT = 0; tiltYT = 0; drag.on = false;
    spr.xT = 0; spr.yT = 0;
    stage.classList.add('is-locked');
    hero.classList.add('is-wheel');
    loadEnv();
  };
  api.close = () => {
    rT = 0; wheel.drag = null;
    if (ball.phase !== 'rest') { ball.phase = 'rest'; ball.r = R_POCKET; }
    ball.reported = true;
    api.sound.silence();
    hero.classList.remove('is-wheel');
    canvas.classList.remove('is-grabbing');
  };
  api.spin = () => {
    if (rT !== 1 || wheel.drag || spinning()) return;
    startSpin();
  };

  // One physics step for the wheel and the ball
  function stepWheel(h) {
    if (!wheel.drag) {
      const w0 = wheel.omega;
      wheel.omega -= (0.42 * w0 + 0.32 * Math.sign(w0)) * h;
      if (Math.sign(wheel.omega) !== Math.sign(w0) || Math.abs(wheel.omega) < 0.01) wheel.omega = 0;
      wheel.phi += wheel.omega * h;
    } else wheel.omega = wheel.vel;
    if (ball.phase === 'track') {
      // rolling on the rim: drag slows it; below a speed it leaves the rim and falls inwards
      ball.w -= (0.36 * ball.w + 1.5 * Math.sign(ball.w)) * h;
      ball.A += ball.w * h;
      if (Math.abs(ball.w) < 4.6) { ball.phase = 'fall'; ball.vr = -0.15 * RW; ball.wl = ball.w - wheel.omega; }
    } else if (ball.phase === 'fall' || ball.phase === 'pocket') {
      // in the ring: its own speed on the wheel (wl) dies down, the bowl pulls it to the pocket radius
      ball.wl -= (1.6 * ball.wl + 0.8 * Math.sign(ball.wl)) * h;
      if (Math.abs(ball.wl) < 0.02) ball.wl = 0;
      ball.vr += (-(ball.r - R_POCKET) * 60 - ball.vr * 5) * h;
      if (ball.phase === 'fall') ball.vr -= RW * 1.6 * h;
      ball.r += ball.vr * h;
      if (ball.r < R_IN) { ball.r = R_IN; ball.vr = Math.abs(ball.vr) * 0.35; }
      if (ball.r > R_OUT) { ball.r = R_OUT; ball.vr = -Math.abs(ball.vr) * 0.35; }
      if (ball.phase === 'fall' && ball.r < R_TRACK - RB) ball.phase = 'pocket';
      const before = local();
      ball.A += (wheel.omega + ball.wl) * h;
      // frets on the field borders: bounce back with a small random kick
      if (ball.phase === 'pocket') {
        const after = local();
        const fb = Math.floor((before + SECTOR / 2) / SECTOR), fa = Math.floor((after + SECTOR / 2) / SECTOR);
        const crossed = fb !== fa && Math.abs(after - before) < Math.PI;
        if (crossed && Math.abs(ball.wl) > 0.35) {
          const k = Math.min(1, Math.abs(ball.wl) / 6);
          ball.A -= (ball.wl) * h * 1.5;                       // back out of the fret
          ball.wl = -ball.wl * (0.32 + Math.random() * 0.12) + (Math.random() - 0.5) * 0.6;
          ball.vr += (Math.random() - 0.5) * RW * 0.6 * k;
          ball.vy = 0.9 * k; ball.lastFret = performance.now();
          api.sound.tick(k);
        } else if (crossed) {
          // too slow to jump the fret: it rolls back into the pocket it came from
          ball.A -= ball.wl * h * 1.5; ball.wl = -ball.wl * 0.2;
        }
      }
      // settled?
      if (ball.phase === 'pocket' && Math.abs(ball.wl) < 0.05 && Math.abs(ball.vr) < RW * 0.02) ball.still += h; else ball.still = 0;
      if (ball.still > 0.35) { ball.phase = 'rest'; ball.wl = 0; ball.vr = 0; api.sound.click(); }
    } else {
      ball.A += wheel.omega * h; // resting: turns with the wheel
    }
    // a little hop after a fret hit
    ball.vy -= 9 * h; ball.y += ball.vy * h; if (ball.y < 0) { ball.y = 0; ball.vy = 0; }
  }

  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hit = new THREE.Vector3();
  function wheelPoint(e) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    plane.constant = -(WY * tilt.scale.y + tilt.position.y);
    if (!ray.ray.intersectPlane(plane, hit)) return null;
    return { a: Math.atan2(hit.x, hit.z), d: Math.hypot(hit.x, hit.z) / tilt.scale.x };
  }
  canvas.addEventListener('pointerdown', (e) => {
    if (rT !== 1 || rE < 0.9 || e.button !== 0) return;
    const w = wheelPoint(e);
    if (!w || w.d > RW * 1.25) return;
    wheel.vel = 0; wheel.omega = 0;
    wheel.drag = { id: e.pointerId, a: w.a, t: e.timeStamp || performance.now() };
    try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    canvas.classList.add('is-grabbing');
    e.preventDefault();
  });
  canvas.addEventListener('pointermove', (e) => {
    const d = wheel.drag;
    if (!d || e.pointerId !== d.id) return;
    const w = wheelPoint(e);
    if (!w) return;
    // event time, not handler time: with slow frames the handlers run late, the events do not
    const now = e.timeStamp || performance.now();
    const da = wrapPi(w.a - d.a);
    const dt = Math.max(1, now - d.t) / 1000;
    d.a = w.a; d.t = now;
    (d.samples ||= []).push([now, wheel.phi + da]);
    while (d.samples.length > 2 && now - d.samples[0][0] > 200) d.samples.shift();
    wheel.phi += da;
    if (ball.phase === 'rest') ball.A += da;
    wheel.vel = wheel.vel * 0.5 + (da / dt) * 0.5;
  });
  const endWheelDrag = (e) => {
    const d = wheel.drag;
    if (!d || (e && e.pointerId !== d.id)) return;
    wheel.drag = null;
    canvas.classList.remove('is-grabbing');
    // release speed from the last ~200 ms of the drag (works at low frame rates too); a hand that
    // stopped before letting go gives no speed
    const now = (e && e.timeStamp) || performance.now(), sm = d.samples || [];
    let v = 0;
    if (sm.length >= 2 && now - d.t < 260) {
      const [ta, pa] = sm[0], [tb, pb] = sm[sm.length - 1];
      v = Math.max(-12, Math.min(12, (pb - pa) / Math.max(0.016, (tb - ta) / 1000)));
    }
    wheel.omega = v;
    // a real fling sends the ball round the rim; a slow release just lets the wheel coast
    if (Math.abs(v) > 1.6 && !spinning()) launch(Math.sign(v), Math.min(1.15, 0.8 + Math.abs(v) / 20));
  };
  canvas.addEventListener('pointerup', endWheelDrag);
  canvas.addEventListener('pointercancel', endWheelDrag);

  function updateRoulette(dt, now) {
    const prev = rE;
    rE += Math.sign(rT - rE) * Math.min(Math.abs(rT - rE), rT ? (dt * 1000) / TURN_MS : 1); // closing: a jump, hidden by the fade
    rEase = rE < 0.5 ? 4 * rE * rE * rE : 1 - Math.pow(-2 * rE + 2, 3) / 2;
    if (rE !== prev) setCamera(rEase);
    if (prev > 0 && rE === 0) { stage.classList.remove('is-locked'); setFull(false); }
    rou.visible = rEase > 0.004;
    if (!rou.visible) return;
    rou.scale.setScalar(0.8 + 0.2 * rEase);
    // physics in small fixed steps
    let left = Math.min(dt, 0.05);
    while (left > 1e-5) { const h = Math.min(left, 1 / 240); stepWheel(h); left -= h; }
    wheelGroup.rotation.y = wheel.phi;
    const lift = ball.phase === 'track' ? 0.04 : 0;
    ballMesh.position.set(Math.sin(ball.A) * ball.r, WY + RB + 0.012 + lift + ball.y * 0.12, Math.cos(ball.A) * ball.r);
    // sound: rolling speed relative to the surface under the ball
    const rel = ball.phase === 'track' ? Math.abs(ball.w) / 16 : ball.phase === 'rest' ? 0 : Math.abs(ball.wl) / 6 + Math.abs(ball.vr) / (RW * 2);
    api.sound.roll(rT === 1 ? rel : 0);
    // result: once the ball rests in a pocket and the wheel has nearly stopped
    if (!ball.reported && ball.phase === 'rest' && Math.abs(wheel.omega) < 0.4) {
      ball.reported = true;
      const i = pocketAt(local());
      hero.dataset.ballPocket = String(i);
      if (rT === 1) api.onResult?.(i);
    }
  }

  /* ---------- Grab and spin (mouse); a tap or click gives a short roll ---------- */
  const fineDrag = !small && !reduced;
  const drag = { on: false, id: null, x: 0, y: 0, x0: 0, y0: 0, t: 0, vx: 0, vy: 0, moved: false, touch: false };
  const pxPerRad = () => Math.max(60, fsPx * tilt.scale.x * 1.6);
  const onEnter = () => {};
  const onLeave = () => { tiltXT = 0; tiltYT = 0; };
  const onMove = (e) => {
    if (e.pointerType !== 'mouse' || rT || reduced) return;
    const r = stage.getBoundingClientRect();
    tiltXT = ((e.clientY - r.top) / r.height - 0.5) * 8;
    tiltYT = ((e.clientX - r.left) / r.width - 0.5) * 6;
  };
  const onDown = (e) => {
    if (reduced || e.button !== 0 || stage.classList.contains('is-locked')) return;
    drag.on = true; drag.id = e.pointerId; drag.touch = e.pointerType !== 'mouse' || !fineDrag;
    drag.x = drag.x0 = e.clientX; drag.y = drag.y0 = e.clientY; drag.t = performance.now();
    drag.vx = drag.vy = 0; drag.moved = false;
    if (!drag.touch) {
      try { stage.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
      stage.classList.add('is-grabbing');
      e.preventDefault(); // no text selection while dragging
    }
  };
  const onDrag = (e) => {
    if (!drag.on || e.pointerId !== drag.id) return;
    if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 6) drag.moved = true;
    if (drag.touch) return; // touch: the page scrolls, no dragging
    const now = performance.now();
    const dt = Math.max(1, now - drag.t) / 1000;
    const dYaw = (e.clientX - drag.x) / pxPerRad(), dRoll = (e.clientY - drag.y) / pxPerRad();
    drag.x = e.clientX; drag.y = e.clientY; drag.t = now;
    pose.yaw += dYaw; pose.roll += dRoll;
    drag.vx = drag.vx * 0.5 + (dYaw / dt) * 0.5;
    drag.vy = drag.vy * 0.5 + (dRoll / dt) * 0.5;
    spr.xT = Math.max(-0.35, Math.min(0.35, (e.clientX - drag.x0) / fsPx * 0.25));
    spr.yT = Math.max(-0.25, Math.min(0.25, -(e.clientY - drag.y0) / fsPx * 0.25));
  };
  const onUp = (e) => {
    if (!drag.on || (e && e.pointerId !== drag.id)) return;
    drag.on = false;
    stage.classList.remove('is-grabbing');
    spr.xT = 0; spr.yT = 0;
    if (!drag.moved) {
      // a tap or a click: a short roll around the long axis
      vel.roll += (Math.random() < 0.5 ? -1 : 1) * (7 + Math.random() * 3);
      return;
    }
    if (drag.touch) return;
    // a release after the pointer stopped carries no inertia
    const still = performance.now() - drag.t > 90;
    vel.yaw = still ? 0 : Math.max(-14, Math.min(14, drag.vx));
    vel.roll = still ? 0 : Math.max(-14, Math.min(14, drag.vy));
  };
  stage.addEventListener('pointerenter', onEnter);
  stage.addEventListener('pointerleave', onLeave);
  stage.addEventListener('pointermove', onMove);
  stage.addEventListener('pointerdown', onDown);
  stage.addEventListener('pointermove', onDrag);
  stage.addEventListener('pointerup', onUp);
  stage.addEventListener('pointercancel', onUp);
  stage.addEventListener('lostpointercapture', onUp);
  void lenis;

  // Free spin dies down; below a speed a spring brings the angle back to the nearest full turn.
  function settle(k, dt) {
    if (drag.on && !drag.touch) { vel[k] = 0; return; }
    const v = vel[k];
    if (Math.abs(v) > 1.4) {
      vel[k] = v * Math.exp(-dt * 1.3);
      pose[k] += vel[k] * dt;
    } else {
      const target = Math.round(pose[k] / TAU) * TAU;
      vel[k] += (-(pose[k] - target) * 22 - v * 7.5) * dt;
      pose[k] += vel[k] * dt;
      if (Math.abs(pose[k] - target) < 1e-4 && Math.abs(vel[k]) < 1e-3) { pose[k] = 0; vel[k] = 0; }
    }
  }

  /* ---------- Loop (GSAP ticker) ---------- */
  let visible = true;
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; });
  io.observe(stage);
  const enterStart = performance.now();
  function tick(_, deltaMs) {
    // off screen, hidden tab, or the guitar panel shows (js/hero-panel.js): no rendering
    if (!visible || document.hidden || hero.dataset.panel === 'guitar') return;
    const dt = Math.min((deltaMs || 16.7) / 1000, 0.05);
    if (!window.__motionPaused) time += dt;
    const k = 1 - Math.exp(-dt * 3);
    const te = Math.min(1, (performance.now() - enterStart) / ENTER_MS);
    if (te >= 1) entered = true;
    const e = entered ? 1 : 1 - Math.pow(1 - te, 4);
    settle('yaw', dt); settle('roll', dt);
    tiltX += (tiltXT - tiltX) * k;
    tiltY += (tiltYT - tiltY) * k;
    // springy offset: follows the hand, overshoots a little on release
    const kS = drag.on ? 260 : 120, cS = drag.on ? 30 : 10;
    spr.xV += (-(spr.x - spr.xT) * kS - spr.xV * cS) * dt; spr.x += spr.xV * dt;
    spr.yV += (-(spr.y - spr.yT) * kS - spr.yV * cS) * dt; spr.y += spr.yV * dt;
    updateRoulette(dt, performance.now());
    place(e, rEase);
    render();
  }

  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('langchange', () => requestAnimationFrame(resize));
  const mo = new MutationObserver(() => { applyTheme(); if (reduced) render(); });
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  await loadEnv();
  if (reduced) {
    // still: a fixed twist, no motion; drawn once and again on resize
    place(1, 0);
    render();
    window.addEventListener('resize', () => { place(1, 0); render(); });
    stage.classList.add('is-3d');
    ctl.destroy = () => { io.disconnect(); mo.disconnect(); renderer.dispose(); canvas.remove(); };
    return;
  }
  place(0, 0);
  render();
  stage.classList.add('is-3d');
  gsap.ticker.add(tick);
  onRoulette?.(api);

  ctl.destroy = () => {
    gsap.ticker.remove(tick);
    io.disconnect(); mo.disconnect();
    stage.removeEventListener('pointerdown', onDown);
    window.removeEventListener('resize', resize);
    renderer.dispose();
    canvas.remove();
  };
}

// Glyph geometries (ExtrudeGeometry has no index) joined into one: positions, normals, uvs.
function mergeGeometries(THREE, list) {
  const out = new THREE.BufferGeometry();
  ['position', 'normal', 'uv'].forEach((name) => {
    const size = list[0].getAttribute(name).itemSize;
    const total = list.reduce((n, g) => n + g.getAttribute(name).array.length, 0);
    const arr = new Float32Array(total);
    let o = 0;
    list.forEach((g) => { arr.set(g.getAttribute(name).array, o); o += g.getAttribute(name).array.length; });
    out.setAttribute(name, new THREE.BufferAttribute(arr, size));
  });
  list.forEach((g) => g.dispose());
  return out;
}
