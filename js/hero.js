/* Hero: the word HUBERT as extruded 3D letters on a cylinder, rotating around the Y axis (three.js).
   Outside the orange bar the letters are drawn as outlines: background-coloured faces, shaded sides, edges.
   Inside the bar the colours invert: solid dark letters. Two render passes; the second one is limited
   to the bar's screen rectangle with a scissor, so the bar works as a sharp mask.
   The word can be grabbed: a horizontal drag spins the cylinder (with inertia, then the normal spin
   comes back), a vertical drag (mouse) tilts it and moves it a little, and it springs back on release.
   On touch only horizontal drags spin; vertical swipes scroll the page (touch-action: pan-y).
   Roulette: inside the cylinder stands a wheel with the projects. Opening it moves the camera up and
   tilts it down onto the wheel; the word stays around it as a ring. Same scene, same renderer.
   The canvas covers the whole hero; a camera view offset keeps the word centred on the stage.
   No WebGL, reduced motion or a load error: the static word stays (facing front). */
import { PROJECTS } from './roulette.js';

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
  start({ stage, hero, lenis, ctl, onRoulette }).catch(() => {
    stage.classList.remove('is-3d'); // keep the static word
  });
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
  const face = new THREE.Mesh(new THREE.CircleGeometry(RW, 128).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: faceTex }));
  face.position.y = WY;
  const wheelBase = new THREE.Mesh(new THREE.CylinderGeometry(RW * 1.04, RW * 1.07, 0.16, 96), new THREE.MeshLambertMaterial({ color: '#1b1b1c' }));
  wheelBase.position.y = WY - 0.085;
  const wheelRim = new THREE.Mesh(new THREE.TorusGeometry(RW * 1.005, 0.05, 10, 128).rotateX(Math.PI / 2), new THREE.MeshLambertMaterial({ color: '#0d0d0d' }));
  wheelRim.position.y = WY + 0.012;
  wheelGroup.add(face, wheelBase, wheelRim);
  const pegGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.09, 12);
  const pegMat = new THREE.MeshLambertMaterial({ color: '#ff5a1f' });
  for (let i = 0; i < N; i++) {
    const a2 = i * SECTOR + SECTOR / 2; // pegs sit on the borders between fields
    const peg = new THREE.Mesh(pegGeo, pegMat);
    peg.position.set(Math.sin(a2) * RW * 0.955, WY + 0.045, Math.cos(a2) * RW * 0.955);
    wheelGroup.add(peg);
  }
  // fixed pointer on the far edge, pointing at the centre
  const pointer = new THREE.Group();
  const tip = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.34, 4).rotateX(Math.PI / 2).translate(0, 0, 0.17), new THREE.MeshLambertMaterial({ color: '#ff4f12', emissive: '#5a1600' }));
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), new THREE.MeshLambertMaterial({ color: '#0d0d0d' }));
  pointer.add(tip, knob);
  pointer.position.set(0, WY + 0.13, -(RW + 0.1));
  rou.add(pointer);
  rou.traverse((o) => o.layers.set(1));

  function wheelCanvas(size) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    const g = c.getContext('2d');
    const r = size / 2;
    const k = size / 1024;
    const fills = [['#ff4f12', '#0d0d0d'], ['#161617', '#f2f2ee'], ['#ecece9', '#0d0d0d']];
    g.translate(r, r);
    // Canvas direction (sin a, cos a) is local wheel angle a (see the texture mapping of the face).
    const th = (a) => Math.PI / 2 - a;
    for (let i = 0; i < N; i++) {
      const [bg, fg] = fills[i % 3];
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
      const room = 300 * k;
      const w = g.measureText(PROJECTS[i].label).width;
      if (w > room) { fs *= room / w; g.font = `800 ${fs}px Archivo, "Arial Black", sans-serif`; }
      g.fillText(PROJECTS[i].label, 168 * k, 0);
      g.restore();
    }
    // separators
    g.strokeStyle = 'rgba(13,13,13,0.85)'; g.lineWidth = 3 * k;
    for (let i = 0; i < N; i++) {
      const a = i * SECTOR + SECTOR / 2;
      g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.sin(a) * r, Math.cos(a) * r); g.stroke();
    }
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

  /* ---------- Roulette: wheel state, spin physics, pointer drag ---------- */
  const wheel = { phi: 0, vel: 0, anim: null, drag: null };
  const wrapPi = (x) => ((((x + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
  const sectorAt = (ph) => Math.round((((Math.PI - ph) % TAU + TAU) % TAU) / SECTOR) % N; // pointer at the far edge
  const api = { onResult: null, onSpinStart: null };

  function startSpin(delta, dur) {
    const from = wheel.phi;
    // land inside a field, never on a peg
    const fa = Math.PI - (from + delta);
    const target = Math.round(fa / SECTOR) * SECTOR + (Math.random() - 0.5) * 0.56 * SECTOR;
    wheel.anim = { from, delta: delta + (fa - target), t0: performance.now(), dur };
    api.onSpinStart?.();
  }
  function settle() {
    const fa = Math.PI - wheel.phi;
    wheel.anim = { from: wheel.phi, delta: fa - Math.round(fa / SECTOR) * SECTOR, t0: performance.now(), dur: 650 };
  }
  api.open = () => {
    rT = 1; entered = true; bo = 1;
    setFull(true);
    tiltXT = 0; tiltYT = 0; hoverT = 0; fling = 0; drag.on = false;
    spr.tiltT = 0; spr.yT = 0;
    stage.classList.add('is-locked');
    hero.classList.add('is-wheel');
    resume();
  };
  api.close = () => {
    rT = 0; wheel.anim = null; wheel.drag = null;
    hero.classList.remove('is-wheel');
    canvas.classList.remove('is-grabbing');
    resume();
  };
  api.spin = () => {
    if (rT !== 1 || wheel.anim || wheel.drag) return;
    startSpin(TAU * (4 + Math.random() * 2), 5200);
  };

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
    wheel.anim = null; wheel.vel = 0;
    wheel.drag = { id: e.pointerId, a: w.a, t: performance.now() };
    try { canvas.setPointerCapture(e.pointerId); } catch (_) { /* ignore */ }
    canvas.classList.add('is-grabbing');
    api.onSpinStart?.();
    e.preventDefault();
  });
  canvas.addEventListener('pointermove', (e) => {
    const d = wheel.drag;
    if (!d || e.pointerId !== d.id) return;
    const w = wheelPoint(e);
    if (!w) return;
    const now = performance.now();
    const da = wrapPi(w.a - d.a);
    const dt = Math.max(1, now - d.t) / 1000;
    d.a = w.a; d.t = now;
    wheel.phi += da;
    wheel.vel = wheel.vel * 0.5 + (da / dt) * 0.5;
  });
  const endWheelDrag = (e) => {
    const d = wheel.drag;
    if (!d || (e && e.pointerId !== d.id)) return;
    wheel.drag = null;
    canvas.classList.remove('is-grabbing');
    const v = performance.now() - d.t > 110 ? 0 : Math.max(-30, Math.min(30, wheel.vel));
    if (Math.abs(v) < 0.8) { settle(); return; }
    // ease-out cubic starts at 3·delta/T, so delta = v·T/3 keeps the release speed
    const T = Math.max(1.8, Math.min(6, 1.4 + Math.abs(v) * 0.3));
    startSpin((v * T) / 3, T * 1000);
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
    if (wheel.anim) {
      const a = wheel.anim;
      const t = Math.min(1, (now - a.t0) / a.dur);
      const ph = a.from + a.delta * (1 - Math.pow(1 - t, 3));
      wheel.vel = (ph - wheel.phi) / Math.max(dt, 1e-3);
      wheel.phi = ph;
      if (t >= 1) { wheel.anim = null; wheel.vel = 0; if (rT === 1) api.onResult?.(sectorAt(wheel.phi)); }
    } else if (!wheel.drag) {
      wheel.vel *= Math.exp(-dt * 8);
    }
    wheelGroup.rotation.y = wheel.phi;
    // the pointer flicks as each peg passes under it
    const fr = ((((Math.PI - wheel.phi + SECTOR / 2) / SECTOR) % 1) + 1) % 1;
    const near = Math.min(fr, 1 - fr);
    pointer.rotation.y = Math.exp(-near * 14) * Math.min(1, Math.abs(wheel.vel) / 5) * 0.55 * Math.sign(wheel.vel || 1);
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
