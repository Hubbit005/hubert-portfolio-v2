/* Hero: the word HUBERT as extruded 3D letters on a cylinder, rotating around the Y axis (three.js).
   Outside the orange bar the letters are drawn as outlines: background-coloured faces, shaded sides, edges.
   Inside the bar the colours invert: solid dark letters. Two render passes; the second one is limited
   to the bar's screen rectangle with a scissor, so the bar works as a sharp mask.
   The word can be grabbed: a horizontal drag spins the cylinder (with inertia, then the normal spin
   comes back), a vertical drag (mouse) tilts it and moves it a little, and it springs back on release.
   On touch only horizontal drags spin; vertical swipes scroll the page (touch-action: pan-y).
   Roulette: inside the cylinder stands a wheel with the projects. Opening it moves the camera up and
   tilts it down onto the wheel; the word stays around it as a ring. Same scene, same renderer.
   Since task 09 the wheel is chrome (standard materials with a studio reflection map, assets/hf/
   env-studio.jpg through PMREMGenerator) and a real chrome ball decides the result: it runs along
   the rim against the wheel's turn, slows down, spirals in, bounces off the frets between the fields
   and stops in a pocket. That pocket is the result (card and aria-live). Sound: js/roulette-sound.js.
   The canvas covers the whole hero; a camera view offset keeps the word centred on the stage.
   No WebGL, reduced motion or a load error: the static word stays (facing front). */
import { PROJECTS } from './roulette.js?v=20261107';
import { createRouletteSound } from './roulette-sound.js?v=20261107';

const WORD = 'HUBERT';
const SEP = '+';
const TRACK = 0.035;     // gap between glyphs, in em
const GAP = 2.3;         // empty arc on each side of the separator, in em
const ENTER_MS = 1700;
const ENTER_TURN = Math.PI * 1.5; // radians spun during the entrance
const BASE_PERIOD = 11;  // seconds per full turn at rest (before dwell)
const DEPTH = 0.2;       // extrusion depth, in em
const PERSP = 13;        // camera distance, in em (same as the old CSS perspective)
const FILL_DARK = '#111111';
const TAU = Math.PI * 2;
const ELEV = THREE_DEG(58);   // camera elevation in the roulette view
const TURN_MS = 1250;         // camera move between the views
function THREE_DEG(d) { return (d * Math.PI) / 180; }

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

export function initHero({ reduced, lenis, onRoulette }) {
  const stage = document.getElementById('hero-stage');
  const hero = stage?.closest('.hero');
  if (!stage || !hero) return { destroy() {} };
  if (reduced || !hasWebGL()) return { destroy() {} }; // static word stays

  const ctl = { destroy() {} };
  const run = () => start({ stage, hero, lenis, ctl, onRoulette }).catch(() => {
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

async function start({ stage, hero, lenis, ctl, onRoulette }) {
  const base = new URL('../vendor/', import.meta.url);
  const [THREE, { FontLoader }, fontJson] = await Promise.all([
    import(new URL('three/three.module.min.js', base).href),
    import(new URL('three/addons/loaders/FontLoader.js', base).href),
    fetch(new URL('fonts/typeface/archivo-900-125-hubert.json', base)).then((r) => r.json()),
  ]);
  const font = new FontLoader().parse(fontJson);
  const upm = fontJson.resolution;
  const capH = (fontJson.capHeight || 686) / upm;
  const bar = stage.querySelector('.hero__bar');
  const title = stage.querySelector('.hero__title');

  /* ---------- Renderer and canvas ---------- */
  const small = Math.min(window.innerWidth, window.innerHeight) < 700 || matchMedia('(pointer: coarse)').matches;
  // Pixel ratio: at most 1.5 on desktop, 1 on phones. At 1.5 and up the edges are smooth enough
  // without multisampling, so antialiasing is only switched on below that (phones and 1x screens).
  const PR_MAX = small ? 1 : 1.5;
  const pr0 = Math.min(window.devicePixelRatio || 1, PR_MAX);
  const renderer = new THREE.WebGLRenderer({ antialias: pr0 < 1.5, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(pr0);
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = false;
  const canvas = renderer.domElement;
  canvas.className = 'hero__gl';
  canvas.setAttribute('aria-hidden', 'true');
  hero.appendChild(canvas);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  camera.position.set(0, 0, PERSP);

  const amb = new THREE.AmbientLight(0xffffff, 1.1);
  scene.add(amb);
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-0.6, 0.9, 0.7);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffffff, 0.5);
  rim.position.set(0.8, -0.4, 0.3);
  scene.add(rim);
  [amb, key, rim].forEach((l) => l.layers.enableAll()); // lights must reach both render layers

  /* ---------- Materials (layer 1: outline look, layer 2: solid look inside the bar) ---------- */
  const mat = {
    oCap: new THREE.MeshBasicMaterial(),
    oSide: new THREE.MeshLambertMaterial(),
    sCap: new THREE.MeshBasicMaterial(),
    sSide: new THREE.MeshLambertMaterial(),
    fCap: new THREE.MeshBasicMaterial({ color: FILL_DARK }),
    fSide: new THREE.MeshLambertMaterial({ color: '#3a3a3a' }),
  };
  const edgeMats = []; // per letter, so back letters can fade
  function applyTheme() {
    const cs = getComputedStyle(document.documentElement);
    const bg = new THREE.Color(cs.getPropertyValue('--bg').trim() || '#ecece9');
    const ink = new THREE.Color(cs.getPropertyValue('--ink').trim() || '#0d0d0d');
    const acc = new THREE.Color(cs.getPropertyValue('--accent').trim() || '#ff4f12');
    const dark = bg.getHSL({}).l < 0.5;
    mat.oCap.color.copy(bg);
    mat.oSide.color.copy(bg).lerp(ink, dark ? 0.32 : 0.2);
    mat.sCap.color.copy(acc);
    mat.sSide.color.copy(acc).multiplyScalar(0.7);
    edgeMats.forEach((m) => m.color.copy(m.userData.fill ? new THREE.Color(FILL_DARK) : (m.userData.sep ? acc : ink)));
  }

  /* ---------- Glyph geometry ---------- */
  const geoCache = new Map();
  function glyph(ch) {
    if (geoCache.has(ch)) return geoCache.get(ch);
    const shapes = font.generateShapes(ch, 1);
    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth: DEPTH, curveSegments: small ? 4 : 6,
      bevelEnabled: true, bevelThickness: 0.014, bevelSize: 0.007, bevelSegments: 1,
    });
    const ha = (fontJson.glyphs[ch]?.ha || upm) / upm;
    geo.translate(-ha / 2, -capH / 2, -DEPTH / 2);
    const edges = new THREE.EdgesGeometry(geo, 35);
    const g = { geo, edges, ha };
    geoCache.set(ch, g);
    return g;
  }

  /* ---------- Layout on the cylinder (same maths as the old CSS version) ---------- */
  const seq = [...WORD, 'GAP', SEP, 'GAP', ...WORD, 'GAP', SEP, 'GAP'];
  const widths = seq.map((ch) => (ch === 'GAP' ? GAP : glyph(ch).ha));
  const arcs = widths.map((w, i) => (seq[i] === 'GAP' ? w : w + TRACK));
  const total = arcs.reduce((a, b) => a + b, 0);
  const R = total / (Math.PI * 2);

  const tilt = new THREE.Group();
  const cyl = new THREE.Group();
  tilt.add(cyl);
  scene.add(tilt);

  const letters = [];
  let cum = 0;
  const angles = [];
  seq.forEach((ch, i) => {
    const mid = cum + arcs[i] / 2;
    const a = mid / R;
    angles.push(a);
    cum += arcs[i];
    if (ch === 'GAP') return;
    const { geo, edges } = glyph(ch);
    const sep = ch === SEP;
    const holder = new THREE.Group();
    holder.position.set(R * Math.sin(a), 0, R * Math.cos(a));
    holder.rotation.y = a;

    const outline = new THREE.Mesh(geo, sep ? [mat.sCap, mat.sSide] : [mat.oCap, mat.oSide]);
    outline.layers.set(1);
    const eo = new THREE.LineBasicMaterial({ transparent: true, opacity: 0.9 });
    eo.userData.sep = sep;
    const lo = new THREE.LineSegments(edges, eo);
    lo.layers.set(1);

    const solid = new THREE.Mesh(geo, [mat.fCap, mat.fSide]);
    solid.layers.set(2);
    const ef = new THREE.LineBasicMaterial({ transparent: true, opacity: 0 });
    ef.userData.fill = true;
    const lf = new THREE.LineSegments(edges, ef);
    lf.layers.set(2);

    edgeMats.push(eo, ef);
    holder.add(outline, lo, solid, lf);
    cyl.add(holder);
    letters.push({ a, outline, solid, eo, ef, lf });
  });
  applyTheme();

  const firstMid = (angles[0] + angles[WORD.length - 1]) / 2;
  const theta0 = -firstMid;
  const halfSpan = (angles[WORD.length - 1] - angles[0]) / 2 + (widths[0] / 2) / R;

  /* ---------- Roulette wheel (hidden until opened) ---------- */
  const N = PROJECTS.length;
  const SECTOR = TAU / N;
  const RW = R * 0.78;               // wheel radius, inside the ring of letters
  const WY = -capH / 2 - 0.02;       // wheel face height: at the foot of the letters
  const rou = new THREE.Group();
  rou.visible = false;
  tilt.add(rou);
  const wheelGroup = new THREE.Group();
  rou.add(wheelGroup);
  try { await document.fonts.load('800 40px Archivo'); } catch (e) { /* draw with the fallback font */ }
  const faceTex = new THREE.CanvasTexture(wheelCanvas(small ? 768 : 1024));
  // Field labels follow the page language: redraw the face when it changes.
  document.addEventListener('langchange', () => {
    faceTex.image = wheelCanvas(small ? 768 : 1024);
    faceTex.needsUpdate = true;
  });
  faceTex.colorSpace = THREE.SRGBColorSpace;
  faceTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  // Chrome: standard materials; the reflection map is loaded when the roulette first opens (envReady).
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
  const envMats = [faceMat, baseMat, rimMat, fretMat, ballMesh.material];
  let envState = 0; // 0 none, 1 loading, 2 ready
  function loadEnv() {
    if (envState) return;
    envState = 1;
    new THREE.TextureLoader().load(new URL('../assets/hf/env-studio.jpg', import.meta.url).href, (tex) => {
      tex.mapping = THREE.EquirectangularReflectionMapping;
      tex.colorSpace = THREE.SRGBColorSpace;
      const pm = new THREE.PMREMGenerator(renderer);
      const env = pm.fromEquirectangular(tex).texture;
      tex.dispose(); pm.dispose();
      envMats.forEach((m) => { m.envMap = env; m.needsUpdate = true; });
      envState = 2;
    }, undefined, () => { envState = 0; });
  }
  rou.traverse((o) => o.layers.set(1));

  function wheelCanvas(size) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const r = size / 2;
    const k = size / 1024;
    const fills = [['#ff4f12', '#0d0d0d'], ['#1d1d21', '#f2f2ee']]; // accent and dark chrome
    g.translate(r, r);
    // Canvas direction (sin a, cos a) is local wheel angle a (see the texture mapping of the face).
    const th = (a) => Math.PI / 2 - a;
    for (let i = 0; i < N; i++) {
      const [bg, fg] = fills[i % 2];
      const a0 = i * SECTOR - SECTOR / 2, a1 = i * SECTOR + SECTOR / 2;
      g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, r, th(a1), th(a0)); g.closePath();
      g.fillStyle = bg; g.fill();
      // label along the radius, from the hub outwards
      g.save();
      g.rotate(th(i * SECTOR));
      g.fillStyle = fg;
      g.textBaseline = 'middle';
      if ('fontStretch' in g) g.fontStretch = 'expanded';
      let fs = 46 * k;
      g.font = `800 ${fs}px Archivo, "Arial Black", sans-serif`;
      const room = 222 * k; // the pocket ring (outer 20%) stays free for the ball
      const w = g.measureText(PROJECTS[i].label).width;
      if (w > room) { fs *= room / w; g.font = `800 ${fs}px Archivo, "Arial Black", sans-serif`; }
      g.fillText(PROJECTS[i].label, 172 * k, 0);
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

  /* ---------- Size and bar mask ---------- */
  // The camera renders a window (view offset) of a taller virtual frame whose centre sits on the
  // stage centre, so the word looks exactly as on a stage-sized canvas. In the normal view the canvas
  // is only the band around the word; it grows to the whole hero only while the roulette is open.
  // (A full-hero canvas is composited in every frame even where nothing is drawn.)
  let W = 1, Hc = 1, Hv = 2, fsPx = 100, yOffN = 0, yOffR = 0, xShiftR = 0, rD = PERSP;
  let bandY = 0, bandH = 1;          // band in hero pixels, measured from the bottom (GL convention)
  let full = false, cTop = 0, cH = 1; // canvas mode, its top in the hero and its height
  let rT = 0, rE = 0, rEase = 0; // roulette: target 0/1, linear progress, eased progress
  const gsapRef = window.gsap;
  let barBox = null, barMeasuredTy = 0, stageH = 1; // bar rectangle, see measureBar()
  function resize() {
    fsPx = parseFloat(getComputedStyle(title).fontSize) || 100;
    W = Math.max(1, Math.round(hero.clientWidth));
    Hc = Math.max(1, Math.round(hero.clientHeight));
    Hv = Hc * 2;
    const pr = Math.min(window.devicePixelRatio || 1, PR_MAX, Math.sqrt(4.2e6 / (W * Hc)));
    renderer.setPixelRatio(Math.max(1, pr));
    camera.aspect = (W * 3) / Hv; // virtual frame is 3 canvases wide so the view can slide sideways
    // Vertical field so that 1 world unit = 1 em at the cylinder axis plane.
    camera.fov = (2 * Math.atan((Hv / fsPx) / 2 / PERSP) * 180) / Math.PI;
    // Fit: on narrow screens the front word (enlarged by perspective) must stay inside the viewport.
    const phi = halfSpan;
    const xEm = (R * Math.sin(phi) * PERSP) / (PERSP - R * Math.cos(phi));
    const wordPx = 2 * xEm * fsPx;
    const sc = Math.min(1, (W * 0.84) / wordPx);
    tilt.scale.setScalar(sc);
    const stageMid = stage.offsetTop + stage.offsetHeight / 2;
    yOffN = Hv / 2 - stageMid;
    const half = stage.offsetHeight / 2 + fsPx * 0.75; // room for the tilt and the vertical drag
    bandY = Math.max(0, Math.floor(Hc - (stageMid + half)));
    bandH = Math.min(Hc - bandY, Math.ceil(half * 2));
    // Roulette view: wheel centre on screen and camera distance so the ring fits.
    const narrow = W < 700;
    yOffR = Hv / 2 - Hc * (narrow ? 0.37 : 0.45);
    xShiftR = W >= 1100 ? W * 0.11 : 0; // wide screens: wheel left of centre, result card on the right
    const rho = (R + DEPTH) * sc;
    const fitW = W * (narrow ? 0.92 : 0.58), fitH = Hc * (narrow ? 0.56 : 0.76);
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
    measureBar();
  }
  function setFull(on) { if (full !== on) { full = on; applySize(); } }

  function setCamera(e) {
    const el = e * ELEV;
    const dist = PERSP + (rD - PERSP) * e;
    const wy = WY * tilt.scale.y * e;
    camera.position.set(0, wy + dist * Math.sin(el), dist * Math.cos(el));
    camera.lookAt(0, wy, 0);
    camera.setViewOffset(W * 3, Hv, W + xShiftR * e, yOffN + (yOffR - yOffN) * e + cTop, W, cH);
  }

  resize();
  window.addEventListener('resize', resize);

  // Bar rectangle for the inverted pass. Measured on resize (and every frame only during the bar's
  // 1.1 s entrance, while it grows), not in every frame: the only thing that moves it afterwards is
  // the stage's scroll parallax (GSAP yPercent), read from GSAP's own cache without touching layout.
  function stageShift() {
    if (!gsapRef) return 0;
    return ((+gsapRef.getProperty(stage, 'yPercent') || 0) / 100) * stageH + (+gsapRef.getProperty(stage, 'y') || 0);
  }
  function measureBar() {
    if (!bar) { barBox = null; return; }
    stageH = stage.offsetHeight || 1;
    const cr = canvas.getBoundingClientRect();
    const br = bar.getBoundingClientRect();
    barMeasuredTy = stageShift();
    barBox = br.width < 1 || br.height < 1 ? null : { x: br.left - cr.left, y: br.top - cr.top, w: br.width, h: br.height };
  }
  function barRect() {
    if (!barBox) return null;
    const y = barBox.y + (stageShift() - barMeasuredTy);
    return { x: barBox.x, y: cH - (y + barBox.h), w: barBox.w, h: barBox.h };
  }

  function render() {
    renderer.setScissorTest(false);
    renderer.clear(true, true, true);
    camera.layers.set(1);
    renderer.render(scene, camera);
    const r = rE < 0.02 ? barRect() : null; // no inverted pass while the roulette is open
    if (r) {
      renderer.setScissorTest(true);
      renderer.setScissor(r.x, r.y, r.w, r.h);
      renderer.clear(true, true, true);
      camera.layers.set(2);
      renderer.render(scene, camera);
      renderer.setScissorTest(false);
    }
  }

  /* ---------- Motion (ported from the CSS version) ---------- */
  let theta = theta0;
  let omega = 0;
  const omegaBase = (Math.PI * 2) / BASE_PERIOD;
  let hover = 0, hoverT = 0;
  let scrollV = 0;
  let tiltX = 0, tiltXT = 0, tiltY = 0, tiltYT = 0;
  let running = true;
  let last = performance.now();
  let raf = 0;
  let bo = 1;
  // grab and spin
  let entered = false;
  let fling = 0;                        // rad/s left over from a release, decays
  const drag = { on: false, id: null, x: 0, y: 0, x0: 0, y0: 0, t: 0, v: 0, touch: false };
  const spr = { tilt: 0, tiltV: 0, tiltT: 0, y: 0, yV: 0, yT: 0 }; // tilt in degrees, y in em

  function place() {
    cyl.rotation.y = theta;
    tilt.rotation.x = THREE.MathUtils.degToRad(tiltX + spr.tilt);
    tilt.position.y = spr.y;
    tilt.rotation.z = THREE.MathUtils.degToRad(-tiltY * 0.2);
    for (const L of letters) {
      const facing = Math.cos(L.a + theta);         // 1 = facing the viewer, -1 = back of the cylinder
      const back = facing < -0.3;
      L.outline.visible = !back;
      L.solid.visible = facing > 0;
      L.eo.opacity = back ? 0.42 * bo : 0.9;
      L.ef.opacity = facing > 0 ? 0 : 0.5 * bo;
      L.lf.visible = facing <= 0;
    }
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
    rT = 1; entered = true; bo = 1;
    setFull(true);
    tiltXT = 0; tiltYT = 0; hoverT = 0; fling = 0; drag.on = false;
    spr.tiltT = 0; spr.yT = 0;
    stage.classList.add('is-locked');
    hero.classList.add('is-wheel');
    loadEnv();
    resume();
  };
  api.close = () => {
    rT = 0; wheel.drag = null;
    if (ball.phase !== 'rest') { ball.phase = 'rest'; ball.r = R_POCKET; }
    ball.reported = true;
    api.sound.silence();
    hero.classList.remove('is-wheel');
    canvas.classList.remove('is-grabbing');
    resume();
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
    rE += Math.sign(rT - rE) * Math.min(Math.abs(rT - rE), (dt * 1000) / TURN_MS);
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

  const enterStart = performance.now();
  if (bar) {
    bar.style.transform = 'translateZ(0) scaleY(0)';
    requestAnimationFrame(() => {
      bar.style.transition = 'transform 1100ms cubic-bezier(.16,1,.3,1)';
      bar.style.transform = 'translateZ(0) scaleY(1)';
    });
  }

  const onEnter = () => { hoverT = 1; };
  const onLeave = () => { hoverT = 0; tiltXT = 0; tiltYT = 0; };
  const onMove = (e) => {
    if (e.pointerType !== 'mouse' || rT) return;
    const r = stage.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    tiltXT = ny * 10;
    tiltYT = nx * 6;
  };
  stage.addEventListener('pointerenter', onEnter);
  stage.addEventListener('pointerleave', onLeave);
  stage.addEventListener('pointermove', onMove);

  /* ---------- Grab and spin ---------- */
  const pxPerRad = () => Math.max(1, R * fsPx * tilt.scale.x);
  const onDown = (e) => {
    if (e.button !== 0 || stage.classList.contains('is-locked')) return;
    drag.on = true; drag.id = e.pointerId; drag.touch = e.pointerType !== 'mouse';
    drag.x = drag.x0 = e.clientX; drag.y = drag.y0 = e.clientY; drag.t = performance.now(); drag.v = 0;
    fling = 0;
    if (!entered) { entered = true; bo = 1; }
    try { stage.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    stage.classList.add('is-grabbing');
    if (!drag.touch) e.preventDefault(); // no text selection while dragging with a mouse
  };
  const onDrag = (e) => {
    if (!drag.on || e.pointerId !== drag.id) return;
    const now = performance.now();
    const dt = Math.max(1, now - drag.t) / 1000;
    const dx = e.clientX - drag.x;
    drag.x = e.clientX; drag.y = e.clientY; drag.t = now;
    const dTheta = dx / pxPerRad();
    theta += dTheta;
    drag.v = drag.v * 0.55 + (dTheta / dt) * 0.45;
    if (!drag.touch) {
      const dy = e.clientY - drag.y0;
      spr.tiltT = Math.max(-16, Math.min(16, dy * 0.1));
      spr.yT = Math.max(-0.32, Math.min(0.32, -dy / fsPx * 0.3));
    }
  };
  const onUp = (e) => {
    if (!drag.on || (e && e.pointerId !== drag.id)) return;
    drag.on = false;
    stage.classList.remove('is-grabbing');
    // a release after the pointer stopped carries no inertia
    const still = performance.now() - drag.t > 90;
    fling = still ? 0 : Math.max(-9, Math.min(9, drag.v));
    omega = 0;          // the normal spin eases back in as the fling dies down
    spr.tiltT = 0; spr.yT = 0;
  };
  stage.addEventListener('pointerdown', onDown);
  stage.addEventListener('pointermove', onDrag);
  stage.addEventListener('pointerup', onUp);
  stage.addEventListener('pointercancel', onUp);
  stage.addEventListener('lostpointercapture', onUp);
  if (lenis) lenis.on('scroll', ({ velocity }) => { scrollV = Math.min(Math.abs(velocity || 0), 60); });

  const resume = () => { if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(tick); } };
  const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) resume(); else running = false; });
  io.observe(stage);
  const onVis = () => { if (document.hidden) running = false; else resume(); };
  document.addEventListener('visibilitychange', onVis);
  document.addEventListener('langchange', () => requestAnimationFrame(measureBar));

  const mo = new MutationObserver(applyTheme);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const mqDark = matchMedia('(prefers-color-scheme: dark)');
  mqDark.addEventListener?.('change', applyTheme);

  function tick(now) {
    if (!running) return;
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const k = 1 - Math.exp(-dt * 3);
    const te = (now - enterStart) / ENTER_MS;
    if (te >= 1) entered = true;
    if (!entered) {
      // Entrance: one fast turn that eases out exactly on the front-facing angle.
      const e = 1 - Math.pow(1 - te, 4);
      theta = theta0 + ENTER_TURN * (1 - e);
      bo = 0; // no back outlines during the entrance
      omega = 0;
    } else {
      hover += (hoverT - hover) * k;
      scrollV *= Math.exp(-dt * 4);
      // Dwell: slow down while a full copy of the word faces the viewer (twice per turn).
      const rel = ((theta - theta0) % Math.PI + Math.PI) % Math.PI;
      const dist = Math.min(rel, Math.PI - rel) / (Math.PI / 2);
      const dwell = 0.05 + 0.95 * Math.min(1, Math.pow(dist / 0.62, 2));
      // Back outlines fade while the word faces front, so they never cross it.
      bo = Math.min(1, Math.max(0, (dist - 0.18) / 0.5));
      if (rEase > 0) bo = Math.max(bo, rEase);
      const target = omegaBase * dwell * (1 + hover * 1.4 + scrollV * 0.06) * (1 - 0.6 * rEase);
      if (drag.on) {
        omega = 0; // the pointer drives theta
      } else {
        fling *= Math.exp(-dt * 1.5);
        if (Math.abs(fling) < 0.01) fling = 0;
        const back = 1 - Math.min(1, Math.abs(fling) / 1.5); // auto spin returns as the fling fades
        omega += (target * back - omega) * (1 - Math.exp(-dt * (fling ? 2 : 6)));
        theta += fling * dt - omega * dt;
      }
      tiltX += (tiltXT - tiltX) * k;
      tiltY += (tiltYT - tiltY) * k;
      // springy tilt and vertical offset: follows the drag, overshoots a little on release
      const kS = drag.on ? 260 : 120, cS = drag.on ? 30 : 9;
      spr.tiltV += (-(spr.tilt - spr.tiltT) * kS - spr.tiltV * cS) * dt;
      spr.tilt += spr.tiltV * dt;
      spr.yV += (-(spr.y - spr.yT) * kS - spr.yV * cS) * dt;
      spr.y += spr.yV * dt;
    }
    if (now - enterStart < 1500) measureBar(); // the bar is still growing (CSS transition)
    updateRoulette(dt, now);
    place();
    render();
    raf = requestAnimationFrame(tick);
  }

  theta = theta0 + ENTER_TURN;
  place();
  render();
  stage.classList.add('is-3d');
  raf = requestAnimationFrame(tick);
  onRoulette?.(api);

  ctl.destroy = () => {
    running = false;
    cancelAnimationFrame(raf);
    io.disconnect(); mo.disconnect();
    stage.removeEventListener('pointerdown', onDown);
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', onVis);
    renderer.dispose();
    canvas.remove();
  };
}
