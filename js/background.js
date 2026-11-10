/* Living background: one fixed full-screen WebGL layer under the content (three.js, the same module
   the hero loads, so the library is fetched and parsed once).
   One quad, one fragment shader, three layers of depth that scroll at different speeds:
     1. far:  soft violet light fields (--glow-rgb on --bg). At the top of the page they are drawn
              exactly like the CSS .glow (same ellipses, stops and strength), only slowly breathing;
     2. mid:  a fine dot grid, at most ~7 % of --ink, breathing in patches;
     3. near: a few dozen small, slightly blurred specks in --accent and --ink.
   Plus fine grain against banding. Reactions: scroll position (parallax), Lenis scroll velocity
   (grid and specks stretch and brighten, then settle in ~0.6 s), a soft accent light following a fine
   pointer, section moods set by ScrollTrigger, and a calmer, dimmer state while the hero roulette is open.
   Rendered at half resolution (pixel ratio ≤ 1.5 × 0.5), paused while the tab is hidden, driven by the
   GSAP ticker. Reduced motion, no WebGL, a shader error or a weak touch device: nothing starts and
   the CSS .glow stays exactly as it was. */

const MOODS = {
  //        focus light: x, y (viewport fractions), radius (px, × min(vw, vh)), strength
  //        low: soft side lights, dark: darken, red: redder glow, calm: fewer dots and specks
  hero: { fx: 0.5, fy: 0.5, fr: 0.6, fs: 0, low: 0, dark: 0, red: 0, calm: 0 },
  work: { fx: 0.5, fy: 0.78, fr: 0.62, fs: 0.75, low: 0.55, dark: 0, red: 0, calm: 0 },
  cases: { fx: 0.12, fy: 0.85, fr: 0.5, fs: 0.15, low: 1, dark: 0, red: 0, calm: 0.1 },
  dark: { fx: 0.5, fy: 1.08, fr: 0.75, fs: 0.95, low: 0.35, dark: 0.55, red: 1, calm: 0.25 },
  calm: { fx: 0.85, fy: 0.15, fr: 0.45, fs: 0.12, low: 0.45, dark: 0, red: 0, calm: 0.7 },
  contact: { fx: 0.5, fy: 1.22, fr: 0.95, fs: 1.25, low: 0.3, dark: 0, red: 0, calm: 0.35 },
};
const MOOD_SECTIONS = [
  ['work', 'work'], ['cases', 'cases'], ['ksk-pretor', 'dark'],
  ['ai', 'calm'], ['about', 'calm'], ['cv', 'calm'], ['contact', 'contact'],
];

const VERT = /* glsl */`
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const FRAG = /* glsl */`
  precision highp float;
  uniform vec2 uRes;        // drawing buffer size in pixels
  uniform float uPx;        // drawing buffer pixels per CSS pixel
  uniform vec2 uView;       // viewport in CSS pixels
  uniform float uTime;
  uniform float uScroll;    // scrollY in CSS pixels
  uniform float uVel;       // 0..1 smoothed scroll speed
  uniform vec3 uMouse;      // x, y in CSS pixels, z = strength 0..1
  uniform float uHero;      // hero light opacity (1 at the top, 0.18 once the hero has scrolled away)
  uniform float uLow;       // side lights opacity
  uniform vec4 uFocus;      // mood light: x, y (fractions), radius (px), strength
  uniform float uDark;
  uniform float uRed;
  uniform float uCalm;
  uniform float uDim;       // roulette open
  uniform float uDetail;    // 1 desktop, 0 phone (no specks)
  uniform vec3 uBg;
  uniform vec3 uInk;
  uniform vec3 uGlow;
  uniform vec3 uAccent;
  uniform float uGlowA;

  float hash21(vec2 p) { p = fract(p * vec2(234.34, 435.345)); p += dot(p, p + 34.23); return fract(p.x * p.y); }
  vec2 hash22(vec2 p) { float n = hash21(p); return vec2(n, hash21(p + n + 17.17)); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash21(i), hash21(i + vec2(1, 0)), u.x), mix(hash21(i + vec2(0, 1)), hash21(i + vec2(1, 1)), u.x), u.y);
  }

  // The CSS radial-gradient of .glow: alpha a at the centre, 0.42a at 48 %, 0 at the edge.
  float cssGlow(vec2 p, vec2 c, vec2 r, float a, float mid) {
    float d = length((p - c) / r);
    float inner = mix(a, a * mid, clamp(d / 0.48, 0.0, 1.0));
    float outer = mix(a * mid, 0.0, clamp((d - 0.48) / 0.52, 0.0, 1.0));
    return d < 0.48 ? inner : outer;
  }

  void main() {
    vec2 p = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uPx;   // CSS pixels, y down
    float vw = uView.x, vh = uView.y;
    float t = uTime;
    vec3 glow = mix(uGlow, vec3(1.0, 0.16, 0.08), uRed * 0.55);
    float life = 1.0 - uDim * 0.6;

    /* ---------- 1. far layer: light fields (slowest parallax) ---------- */
    // Hero light: the exact .glow__hero ellipse, breathing a few pixels, drifting up slowly with scroll.
    vec2 hr = vec2(min(750.0, vw * 0.75), min(600.0, vw * 0.6));
    vec2 hc = vec2(vw + min(520.0, vw * 0.4) - hr.x, hr.y - vh * 0.34);
    hc += vec2(sin(t * 0.21) * 14.0, cos(t * 0.17) * 10.0) * life;
    hc.y -= uScroll * 0.12;
    hr *= 1.0 + 0.025 * sin(t * 0.33);
    float a = cssGlow(p, hc, hr, uGlowA, 0.42) * uHero;

    // Side lights: the two .glow__low ellipses, with a slow parallax swing.
    float sw = sin(uScroll * 0.0011 + t * 0.05);
    vec2 l1r = vec2(min(550.0, vw * 0.65));
    vec2 l1c = vec2(-0.01 * vw + 30.0 * sw, 0.8 * vh - 50.0 * sw);
    vec2 l2r = vec2(min(600.0, vw * 0.7), min(500.0, vw * 0.58));
    vec2 l2c = vec2(1.01 * vw - 30.0 * sw, 0.18 * vh + 60.0 * sw);
    float low = 1.0 - (1.0 - cssGlow(p, l1c, l1r, uGlowA * 0.6, 0.42)) * (1.0 - cssGlow(p, l2c, l2r, uGlowA * 0.36, 0.42));
    a = 1.0 - (1.0 - a) * (1.0 - low * uLow);

    // Flowing field: soft noise clouds, scrolled at 0.15 of the page, only once the hero is behind.
    vec2 q = vec2(p.x, p.y + uScroll * 0.15) / 520.0;
    q += vec2(t * 0.012, -t * 0.02) * life;
    float n = noise(q + noise(q * 1.7 + t * 0.03) * 0.8);
    a = 1.0 - (1.0 - a) * (1.0 - smoothstep(0.45, 0.95, n) * uGlowA * 0.35 * (1.0 - uHero * 0.8) * (1.0 - uCalm * 0.5));

    // Mood light (under the carousel, low and red in the dark case, rising from the bottom at contact).
    vec2 fc = vec2(uFocus.x * vw, uFocus.y * vh);
    float fr = uFocus.z;
    float fa = cssGlow(p, fc, vec2(fr * 1.25, fr), uGlowA * 0.85, 0.45) * uFocus.w;
    a = 1.0 - (1.0 - a) * (1.0 - clamp(fa, 0.0, 0.6));

    a *= 1.0 - uDim * 0.45;
    vec3 col = mix(uBg, glow, a);

    // Pointer light in the accent colour (fine pointers only).
    float md = length(p - uMouse.xy);
    col = mix(col, uAccent, exp(-md * md / (300.0 * 300.0)) * 0.085 * uMouse.z * (1.0 - uDim));

    /* ---------- 2. mid layer: dot grid (medium parallax) ---------- */
    float vel = uVel;
    float stretch = 1.0 + vel * 1.3;
    const float G = 30.0;
    vec2 gp = vec2(p.x - vw * 0.5, p.y + uScroll * 0.45);
    vec2 cell = floor(gp / G);
    vec2 gd = gp - (cell + 0.5) * G;
    gd.y /= stretch;
    float aa = 1.0 / uPx;   // one drawing-buffer pixel, in CSS pixels
    float dotA = 1.0 - smoothstep(1.0 - aa * 0.5, 1.0 + aa, length(gd));
    // breathing patches, so the grid is never a flat pattern
    float breath = smoothstep(0.25, 0.85, noise(cell * 0.09 + vec2(t * 0.05, -t * 0.035)));
    float gridA = (0.022 + 0.05 * breath) * (1.0 - uCalm * 0.55) * (1.0 + vel * 0.9) * (1.0 - uDim * 0.5);
    col = mix(col, uInk, dotA * gridA);

    /* ---------- 3. near layer: specks (fastest parallax) ---------- */
    if (uDetail > 0.5) {
      const float C = 150.0;
      vec2 sp = vec2(p.x, p.y + uScroll * 0.9 + t * 9.0 * life);
      vec2 sc = floor(sp / C);
      vec2 h = hash22(sc);
      if (h.x < 0.34 * (1.0 - uCalm * 0.5)) {
        vec2 h2 = hash22(sc + 7.31);
        vec2 sway = vec2(sin(t * (0.3 + h2.y) + h.y * 6.28), cos(t * (0.25 + h2.x) + h.x * 6.28)) * 9.0 * life;
        vec2 c = (sc + 0.18 + 0.64 * h2) * C + sway;
        vec2 d = sp - c;
        d.y /= 1.0 + vel * 2.2;
        float r = 1.0 + 2.0 * h.y;
        float blur = 1.4 + 1.6 * h2.x;
        float s = 1.0 - smoothstep(r - blur * 0.5, r + blur, length(d));
        float tw = 0.65 + 0.35 * sin(t * (0.8 + h2.y) + h.x * 20.0);
        bool accent = h2.y > 0.45;
        float sa = s * tw * (accent ? 0.42 : 0.2) * (1.0 + vel * 0.8) * (1.0 - uDim * 0.6);
        col = mix(col, accent ? uAccent : uInk, clamp(sa, 0.0, 0.6));
      }
    }

    // Darken for the dark case study.
    col = mix(col, col * 0.62, uDark);

    // Grain: about ±1.4/255, changes every frame.
    float g = hash21(gl_FragCoord.xy + fract(t * 7.13) * 91.7) - 0.5;
    col += g * (2.8 / 255.0);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

function cssColor(v, fallback) {
  const el = document.createElement('i');
  el.style.color = v || fallback;
  document.body.appendChild(el);
  const m = getComputedStyle(el).color.match(/[\d.]+/g) || [0, 0, 0];
  el.remove();
  return m.slice(0, 3).map((x) => +x / 255);
}

export function initBackground({ reduced, gsap, ScrollTrigger, lenis }) {
  const api = { active: false, destroy() {} };
  if (reduced || !gsap || !hasWebGL()) return api;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const touch = coarse || navigator.maxTouchPoints > 0 && matchMedia('(hover: none)').matches;
  if (touch && (navigator.hardwareConcurrency || 8) <= 4) return api; // weak touch device: CSS glow stays
  if (navigator.connection?.saveData) return api;

  // Start on the first interaction (or a few seconds after load), when the page is idle: the
  // background never competes with the first paint or the hero's own 3D start-up. At the top it looks
  // like the CSS glow it replaces, so the switch itself is invisible; the grid and specks fade in.
  let started = false;
  const EVENTS = ['pointermove', 'pointerdown', 'wheel', 'touchstart', 'keydown', 'scroll'];
  const go = () => {
    if (started) return;
    started = true;
    EVENTS.forEach((ev) => window.removeEventListener(ev, kick, true));
    clearTimeout(timer);
    start({ api, gsap, ScrollTrigger, lenis, touch }).catch(() => { api.destroy(); });
  };
  const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));
  const kick = () => idle(go, { timeout: 1200 });
  let timer = 0;
  const arm = () => {
    EVENTS.forEach((ev) => window.addEventListener(ev, kick, { capture: true, passive: true, once: true }));
    timer = setTimeout(kick, 6000);
  };
  if (document.readyState === 'complete') arm(); else window.addEventListener('load', arm, { once: true });
  return api;
}

async function start({ api, gsap, ScrollTrigger, lenis, touch }) {
  const THREE = await import(new URL('../vendor/three/three.module.min.js', import.meta.url).href);
  const doc = document.documentElement;

  let failed = false;
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, depth: false, stencil: false, powerPreference: touch ? 'low-power' : 'default' });
  renderer.debug.onShaderError = () => { failed = true; };
  const canvas = renderer.domElement;
  canvas.className = 'bg-gl';
  canvas.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  const camera = new THREE.Camera();
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
  const u = {
    uRes: { value: new THREE.Vector2(1, 1) }, uPx: { value: 1 }, uView: { value: new THREE.Vector2(1, 1) },
    uTime: { value: 0 }, uScroll: { value: 0 }, uVel: { value: 0 }, uMouse: { value: new THREE.Vector3(-999, -999, 0) },
    uHero: { value: 1 }, uLow: { value: 0 }, uFocus: { value: new THREE.Vector4(0.5, 0.5, 400, 0) },
    uDark: { value: 0 }, uRed: { value: 0 }, uCalm: { value: 0 }, uDim: { value: 0 }, uDetail: { value: touch ? 0 : 1 },
    uBg: { value: new THREE.Vector3() }, uInk: { value: new THREE.Vector3() }, uGlow: { value: new THREE.Vector3() },
    uAccent: { value: new THREE.Vector3() }, uGlowA: { value: 0.3 },
  };
  const mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, uniforms: u, depthTest: false, depthWrite: false });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  scene.add(mesh);

  function readTheme() {
    const cs = getComputedStyle(doc);
    u.uBg.value.fromArray(cssColor(cs.getPropertyValue('--bg').trim(), '#0f0f10'));
    u.uInk.value.fromArray(cssColor(cs.getPropertyValue('--ink').trim(), '#eeeeea'));
    u.uAccent.value.fromArray(cssColor(cs.getPropertyValue('--accent').trim(), '#7b3cff'));
    const g = cs.getPropertyValue('--glow-rgb').trim().split(/[\s,]+/).map(Number);
    u.uGlow.value.set((g[0] || 123) / 255, (g[1] || 60) / 255, (g[2] || 255) / 255);
    u.uGlowA.value = parseFloat(cs.getPropertyValue('--glow-a')) || 0.3;
  }
  readTheme();

  /* ---------- Size: half resolution, pixel ratio at most 1.5 ---------- */
  const hero = document.getElementById('home');
  let heroH = 1;
  let scale = 0.5;
  function resize() {
    const w = window.innerWidth, h = window.innerHeight;
    const pr = Math.min(window.devicePixelRatio || 1, 1.5) * scale;
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    u.uRes.value.set(Math.round(w * pr), Math.round(h * pr));
    u.uPx.value = pr;
    u.uView.value.set(w, h);
    heroH = hero ? hero.offsetHeight : h;
  }
  resize();
  let rt = 0;
  const onResize = () => { clearTimeout(rt); rt = setTimeout(resize, 150); };
  window.addEventListener('resize', onResize);

  // Compile now: a shader error keeps the CSS glow.
  renderer.compile(scene, camera);
  renderer.render(scene, camera);
  if (failed) throw new Error('background shader');

  /* ---------- Inputs ---------- */
  let velT = 0;
  const onLenis = ({ velocity }) => { velT = Math.max(velT, 1 - Math.exp(-Math.abs(velocity || 0) / 45)); };
  lenis?.on('scroll', onLenis);
  let lastY = window.scrollY;

  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const mouse = { x: -999, y: -999, tx: -999, ty: -999, on: 0, onT: 0 };
  const onMove = (e) => {
    if (e.pointerType !== 'mouse') return;
    mouse.tx = e.clientX; mouse.ty = e.clientY; mouse.onT = 1;
    if (mouse.x < -900) { mouse.x = mouse.tx; mouse.y = mouse.ty; }
  };
  const onOut = (e) => { if (!e.relatedTarget) mouse.onT = 0; };
  if (fine) {
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerout', onOut);
  }

  // Roulette open in the hero: the background slows down and dims (the hero's own class, read only).
  let dimT = 0;
  const mo = hero ? new MutationObserver(() => { dimT = hero.classList.contains('is-roulette') ? 1 : 0; }) : null;
  mo?.observe(hero, { attributes: true, attributeFilter: ['class'] });

  /* ---------- Section moods ---------- */
  const cur = { ...MOODS.hero };
  let target = MOODS.hero;
  const active = new Set();
  const triggers = [];
  function pickMood() {
    if (active.has('ksk-pretor')) { target = MOODS.dark; return; }
    let m = 'hero';
    MOOD_SECTIONS.forEach(([id, mood]) => { if (active.has(id)) m = mood; });
    target = MOODS[m];
  }
  if (ScrollTrigger) {
    MOOD_SECTIONS.forEach(([id]) => {
      const el = document.getElementById(id);
      if (!el) return;
      triggers.push(ScrollTrigger.create({
        trigger: el, start: 'top 60%', end: 'bottom 60%',
        onToggle: (self) => { if (self.isActive) active.add(id); else active.delete(id); pickMood(); },
      }));
    });
  }

  /* ---------- Loop (GSAP ticker) ---------- */
  let time = 0;
  let vel = 0;
  let shown = false;
  let slowFrames = 0;
  const adapt = !/[?&]bgfull\b/.test(location.search); // ?bgfull: no quality drop (for screenshots on software GL)
  function tick(_, deltaMs) {
    if (document.hidden) return;
    const dt = Math.min((deltaMs || 16) / 1000, 0.05);
    const k = (rate) => 1 - Math.exp(-dt * rate);
    const sy = window.scrollY;
    // Paused (js/pause.js): no new frames while nothing the user does changes the picture.
    if (window.__motionPaused && shown && Math.abs(sy - lastY) < 0.5 && Math.abs(mouse.tx - mouse.x) < 0.5 && Math.abs(mouse.ty - mouse.y) < 0.5 && vel < 0.002 && Math.abs(dimT - u.uDim.value) < 0.01) { lastY = sy; return; }
    // velocity from Lenis, or from the scroll position when Lenis is off
    if (!lenis) velT = Math.max(velT, Math.min(1, Math.abs(sy - lastY) / dt / 2400));
    lastY = sy;
    vel += (velT - vel) * (velT > vel ? k(14) : k(5)); // fast attack, ~0.6 s release
    velT *= Math.exp(-dt * 9);

    const dim = (u.uDim.value += (dimT - u.uDim.value) * k(3));
    if (!window.__motionPaused) time += dt * (1 - dim * 0.7);

    for (const key in cur) cur[key] += (target[key] - cur[key]) * k(1.6);
    const hp = Math.min(1, Math.max(0, sy / Math.max(1, heroH)));
    const vmin = Math.min(window.innerWidth, window.innerHeight);

    mouse.on += (mouse.onT - mouse.on) * k(4);
    const lm = 1 - Math.pow(1 - 0.06, dt * 60); // lerp 0.06 per 60 Hz frame
    mouse.x += (mouse.tx - mouse.x) * lm;
    mouse.y += (mouse.ty - mouse.y) * lm;

    u.uTime.value = time;
    u.uScroll.value = sy;
    u.uVel.value = vel;
    u.uMouse.value.set(mouse.x, mouse.y, mouse.on);
    u.uHero.value = 1 - 0.82 * hp;
    u.uLow.value = hp * (0.35 + 0.65 * cur.low);
    u.uFocus.value.set(cur.fx, cur.fy, cur.fr * vmin * 1.1, cur.fs * hp);
    u.uDark.value = cur.dark;
    u.uRed.value = cur.red;
    u.uCalm.value = cur.calm;
    renderer.render(scene, camera);

    if (!shown) { shown = true; doc.classList.add('has-bg'); }
    // Too slow (sustained < 30 fps after warm-up): first drop the specks, then lower the resolution.
    if (adapt && time > 2 && deltaMs > 34) {
      if (++slowFrames > 60) {
        slowFrames = 0;
        if (u.uDetail.value) u.uDetail.value = 0;
        else if (scale > 0.3) { scale = 0.3; resize(); }
      }
    } else if (slowFrames > 0) slowFrames--;
  }

  const onLang = () => { heroH = hero ? hero.offsetHeight : window.innerHeight; };
  document.addEventListener('langchange', onLang);

  document.body.prepend(canvas);
  gsap.ticker.add(tick);
  api.active = true;

  api.destroy = () => {
    gsap.ticker.remove(tick);
    window.removeEventListener('resize', onResize);
    window.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerout', onOut);
    document.removeEventListener('langchange', onLang);
    lenis?.off?.('scroll', onLenis);
    mo?.disconnect();
    triggers.forEach((tr) => tr.kill());
    doc.classList.remove('has-bg');
    geo.dispose(); mat.dispose(); renderer.dispose();
    canvas.remove();
    api.active = false;
  };
}
