/* Worldflight background (task 15): one fixed WebGL layer under the whole page (three.js, the module
   the hero already loads). The page is one flight through space:
     - stars and dust: points at many depths. Scrolling moves them at different speeds (far slow, near
       fast); the Lenis scroll velocity stretches the near dust into short streaks and brightens it;
     - four far planes (assets/space/far-*.webp): a star field with the galaxy band behind the whole
       page, a spiral galaxy, violet and beige gas clouds and a chrome ringed planet, each anchored to a
       part of the page and moving at a fraction of the scroll speed (additive, so their black is space).
   Light (beige) sections are opaque, so the world shows in the dark ones.
   Rendered below full resolution (pixel ratio ≤ 1.5 × 0.75), paused while the tab is hidden, driven
   by the GSAP ticker. Reduced motion, no WebGL, a shader error, save-data or a weak touch device:
   nothing starts and the CSS .glow stays. */

const PLATES = [
  // anchor: the element whose top the plate is tied to ('page': the whole page); x: centre (viewport
  // widths), w: width (viewport widths), speed: share of the scroll speed, a: strength
  { src: 'far-starfield', anchor: 'page', x: 0.5, w: 1.25, speed: 0.03, a: 0.55 },
  { src: 'far-galaxy', anchor: '#work', x: 0.74, w: 0.6, speed: 0.32, a: 0.8 },
  { src: 'far-clouds', anchor: '#livingroom', x: 0.32, w: 1.1, speed: 0.26, a: 0.75 },
  { src: 'far-ringworld', anchor: '#contact', x: 0.76, w: 0.5, speed: 0.34, a: 0.85 },
];

const STAR_VERT = /* glsl */`
  uniform vec2 uView;
  uniform float uScroll, uVel, uTime, uPx;
  attribute vec3 aStar;   // x (0…1), y (0…1), depth (0 far … 1 near)
  attribute float aSeed;
  varying float vA, vD, vS, vSeed;
  void main() {
    float d = aStar.z;
    float H = uView.y * 1.3;
    float y = mod(aStar.y * H - uScroll * mix(0.03, 0.85, d * d), H) - uView.y * 0.15;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(aStar.x * uView.x, -y, 0.0, 1.0);
    vS = d * d * uVel * 5.0;                       // streak length (near dust, fast scroll)
    gl_PointSize = (mix(1.2, 3.4, d) + vS * 4.0) * uPx;
    vA = mix(0.3, 0.95, d) * (0.72 + 0.28 * sin(uTime * (0.5 + aSeed * 1.6) + aSeed * 40.0));
    vD = d; vSeed = aSeed;
  }
`;
const STAR_FRAG = /* glsl */`
  precision mediump float;
  uniform vec3 uViolet, uLight, uWhite;
  uniform float uVel;
  varying float vA, vD, vS, vSeed;
  void main() {
    vec2 p = gl_PointCoord - 0.5;
    p.x *= 1.0 + vS * 4.0;                          // narrow and long while streaking
    float a = smoothstep(0.5, 0.0, length(p)) * vA * (1.0 + vD * uVel * 1.5);
    vec3 c = vD > 0.82 ? mix(uViolet, uLight, vSeed) : mix(uWhite, uLight, vSeed * 0.6);
    gl_FragColor = vec4(c * a, a);
  }
`;
const PLATE_VERT = /* glsl */`
  varying vec2 vUv;
  void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;
const PLATE_FRAG = /* glsl */`
  precision mediump float;
  uniform sampler2D uMap;
  uniform float uA;
  varying vec2 vUv;
  void main() {
    vec2 e = smoothstep(0.0, 0.18, vUv) * smoothstep(0.0, 0.18, 1.0 - vUv); // soft edges
    gl_FragColor = vec4(texture2D(uMap, vUv).rgb * uA * e.x * e.y, 1.0);
  }
`;

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch (e) { return false; }
}

export function initBackground({ reduced, gsap, lenis }) {
  const api = { active: false, destroy() {} };
  if (reduced || !gsap || !hasWebGL()) return api;
  const coarse = matchMedia('(pointer: coarse)').matches;
  const touch = coarse || navigator.maxTouchPoints > 0 && matchMedia('(hover: none)').matches;
  if (touch && (navigator.hardwareConcurrency || 8) <= 4) return api; // weak touch device: CSS glow stays
  if (navigator.connection?.saveData) return api;

  // Start on the first interaction (or a few seconds after load), when the page is idle: the
  // background never competes with the first paint, the launch intro or the hero's own 3D start-up.
  let started = false;
  const EVENTS = ['pointermove', 'pointerdown', 'wheel', 'touchstart', 'keydown', 'scroll'];
  const go = () => {
    if (started) return;
    started = true;
    EVENTS.forEach((ev) => window.removeEventListener(ev, kick, true));
    clearTimeout(timer);
    start({ api, gsap, lenis, touch }).catch(() => { api.destroy(); });
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

async function start({ api, gsap, lenis, touch }) {
  const THREE = await import(new URL('../vendor/three/three.module.min.js', import.meta.url).href);
  const doc = document.documentElement;
  const css = (n) => getComputedStyle(doc).getPropertyValue(n).trim();

  let failed = false;
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, depth: false, stencil: false, powerPreference: touch ? 'low-power' : 'default' });
  renderer.debug.onShaderError = () => { failed = true; };
  renderer.setClearColor(css('--space') || '#07060b', 1);
  const canvas = renderer.domElement;
  canvas.className = 'bg-gl';
  canvas.setAttribute('aria-hidden', 'true');
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1, 0, -1, -10, 10);

  /* ---------- Stars and dust ---------- */
  const N = touch ? 650 : 1300;
  const star = new Float32Array(N * 3), seed = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    star[i * 3] = Math.random(); star[i * 3 + 1] = Math.random();
    star[i * 3 + 2] = Math.pow(Math.random(), 2.2); // most far away, a few near
    seed[i] = Math.random();
  }
  const sGeo = new THREE.BufferGeometry();
  sGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  sGeo.setAttribute('aStar', new THREE.BufferAttribute(star, 3));
  sGeo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const u = {
    uView: { value: new THREE.Vector2(1, 1) }, uScroll: { value: 0 }, uVel: { value: 0 }, uTime: { value: 0 }, uPx: { value: 1 },
    uViolet: { value: new THREE.Color(css('--violet') || '#7b3cff') }, uLight: { value: new THREE.Color(css('--violet-light') || '#b89cff') },
    uWhite: { value: new THREE.Color(css('--white') || '#f7f5f0') },
  };
  const sMat = new THREE.ShaderMaterial({ vertexShader: STAR_VERT, fragmentShader: STAR_FRAG, uniforms: u, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending });
  const stars = new THREE.Points(sGeo, sMat);
  stars.frustumCulled = false;
  stars.renderOrder = 2;
  scene.add(stars);

  /* ---------- Far planes (textures load in the background, each fades in when ready) ---------- */
  const quad = new THREE.PlaneGeometry(1, 1);
  const loader = new THREE.TextureLoader();
  const plates = PLATES.map((p) => {
    const m = new THREE.ShaderMaterial({ vertexShader: PLATE_VERT, fragmentShader: PLATE_FRAG, uniforms: { uMap: { value: null }, uA: { value: 0 } }, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, transparent: true });
    const mesh = new THREE.Mesh(quad, m);
    mesh.visible = false;
    scene.add(mesh);
    const plate = { ...p, mesh, m, ready: false, fade: 0, top: 0, ar: 16 / 9 };
    loader.load(new URL(`../assets/space/${p.src}.webp`, import.meta.url).href, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      m.uniforms.uMap.value = tex;
      plate.ar = tex.image.width / tex.image.height;
      plate.ready = true;
    });
    return plate;
  });

  /* ---------- Size ---------- */
  let W = 1, H = 1, scale = 0.75, maxScroll = 1;
  function measure() {
    maxScroll = Math.max(1, doc.scrollHeight - H);
    plates.forEach((p) => {
      const el = p.anchor === 'page' ? null : document.querySelector(p.anchor);
      p.top = el ? el.getBoundingClientRect().top + window.scrollY : 0;
    });
  }
  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    const pr = Math.min(window.devicePixelRatio || 1, 1.5) * scale;
    renderer.setPixelRatio(pr);
    renderer.setSize(W, H, false);
    camera.right = W; camera.bottom = -H; camera.updateProjectionMatrix();
    u.uView.value.set(W, H);
    u.uPx.value = pr;
    measure();
  }
  resize();
  let rt = 0;
  const onResize = () => { clearTimeout(rt); rt = setTimeout(resize, 150); };
  window.addEventListener('resize', onResize);
  const ro = new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(measure, 200); });
  ro.observe(document.getElementById('main') || document.body);

  renderer.compile(scene, camera);
  renderer.render(scene, camera);
  if (failed) throw new Error('background shader');

  /* ---------- Velocity ---------- */
  let velT = 0, vel = 0, lastY = window.scrollY;
  const onLenis = ({ velocity }) => { velT = Math.max(velT, 1 - Math.exp(-Math.abs(velocity || 0) / 40)); };
  lenis?.on('scroll', onLenis);

  /* ---------- Loop (GSAP ticker) ---------- */
  let time = 0, shown = false, slowFrames = 0;
  function tick(_, deltaMs) {
    if (document.hidden) return;
    const dt = Math.min((deltaMs || 16) / 1000, 0.05);
    const sy = window.scrollY;
    // Paused (js/pause.js): no new frames while the page stands still
    if (window.__motionPaused && shown && Math.abs(sy - lastY) < 0.5 && vel < 0.002) return;
    if (!lenis) velT = Math.max(velT, Math.min(1, Math.abs(sy - lastY) / dt / 2400));
    lastY = sy;
    vel += (velT - vel) * (1 - Math.exp(-dt * (velT > vel ? 14 : 5))); // fast attack, ~0.6 s release
    velT *= Math.exp(-dt * 9);
    if (!window.__motionPaused) time += dt;
    u.uTime.value = time; u.uScroll.value = sy; u.uVel.value = vel;

    plates.forEach((p) => {
      if (!p.ready) return;
      let w = W * p.w, h = w / p.ar, cy;
      if (p.anchor === 'page') {
        h = Math.max(h, H * 1.25); w = h * p.ar;
        cy = H / 2 + (h - H) / 2 - (h - H) * Math.min(1, sy / maxScroll); // slides through its spare height
      } else cy = H / 2 + (p.top - sy - H / 2) * p.speed;
      const on = Math.abs(cy - H / 2) < (H + h) / 2;
      p.mesh.visible = on;
      if (!on) return;
      p.fade = Math.min(1, p.fade + dt * 0.8);
      p.m.uniforms.uA.value = p.a * p.fade;
      p.mesh.position.set(W * p.x, -cy, 0);
      p.mesh.scale.set(w, h, 1);
    });
    renderer.render(scene, camera);

    if (!shown) { shown = true; doc.classList.add('has-bg'); }
    // Too slow (sustained < 30 fps after warm-up): lower the resolution once
    if (time > 2 && deltaMs > 34) {
      if (++slowFrames > 60 && scale > 0.5) { slowFrames = 0; scale = 0.5; resize(); }
    } else if (slowFrames > 0) slowFrames--;
  }

  document.body.prepend(canvas);
  gsap.ticker.add(tick);
  api.active = true;

  api.destroy = () => {
    gsap.ticker.remove(tick);
    window.removeEventListener('resize', onResize);
    ro.disconnect();
    lenis?.off?.('scroll', onLenis);
    doc.classList.remove('has-bg');
    sGeo.dispose(); sMat.dispose(); quad.dispose();
    plates.forEach((p) => { p.m.dispose(); p.m.uniforms.uMap.value?.dispose(); });
    renderer.dispose();
    canvas.remove();
    api.active = false;
  };
}
