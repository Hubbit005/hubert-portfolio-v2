// Jedna scena WebGL dla całej strony (brief 16, sekcja 4):
// tło „budyń” wgniatane kursorem, imię z hero w tej samej powierzchni (rozmycie + rozszczepienie
// w kolorach kryształu), światło za kursorem. Jednostki świata = px CSS, środek ekranu = (0, 0).
import * as THREE from '../vendor/three/three.module.min.js';

const GX = 60, GY = 35;          // rzadka siatka fizyki
const DEPTH = 30, RADIUS = 140;  // wgniecenie łyżeczki, px
const K = 56, C = 5.2;           // sprężyna: powrót ok. 1,5 s z lekkim przeregulowaniem
const BG_Z = -600;               // tło za płaszczyzną napisu, żeby kryształ mógł chować się za literami

const css = getComputedStyle(document.documentElement);
const col = (n) => new THREE.Color(css.getPropertyValue(n).trim());
const touch = matchMedia('(hover: none), (pointer: coarse)').matches;

const VERT = /* glsl */`
  uniform sampler2D uDisp; uniform float uDepth;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    p.z += (texture2D(uDisp, uv).r * 255. - 128.) / 100. * uDepth;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
  }`;

const LIGHT = /* glsl */`
  uniform vec3 uViolet, uBlue, uAmber, uIce;
  uniform float uTime, uWarm;
  // Światło jak przez kryształ: fiolet -> błękit, ciepła bursztynowa plama od dołu.
  vec3 crystalLight(vec2 d, float sig) {
    float t = uTime * 6.2832 / 12.;
    vec2 dir = vec2(cos(t), sin(t));
    float k = smoothstep(-sig, sig, dot(d, dir)) * (1. - .45 * uWarm);
    vec3 c = mix(uViolet, uBlue, k);
    float warm = smoothstep(.1 * sig, -1.3 * sig, d.y) * (.35 + .65 * uWarm);
    return mix(c, uAmber, warm * .55);
  }`;

const BG_FRAG = /* glsl */`
  uniform sampler2D uDisp; uniform vec2 uRes, uLight, uGlow; uniform float uGlowA, uDepth; uniform vec3 uBg;
  varying vec2 vUv;
  ${LIGHT}
  float h(vec2 uv) { return (texture2D(uDisp, uv).r * 255. - 128.) / 100. * uDepth; }
  void main() {
    vec2 px = vUv * uRes;
    vec2 e = vec2(1. / ${GX}., 1. / ${GY}.);
    vec2 cell = uRes * e;
    vec3 n = normalize(vec3((h(vUv - vec2(e.x, 0.)) - h(vUv + vec2(e.x, 0.))) / (2. * cell.x),
                            (h(vUv - vec2(0., e.y)) - h(vUv + vec2(0., e.y))) / (2. * cell.y), .35));
    float sig = 120.;
    vec2 d = px - uLight;
    float g = exp(-dot(d, d) / (2. * sig * sig)) * smoothstep(280., 120., length(d)); // średnica ok. 560 px
    float shade = clamp(.8 + 1.4 * dot(n.xy, -normalize(d + .001)) * smoothstep(0., 60., length(d)), .45, 1.6);
    vec3 c = crystalLight(d, sig) * g * .28 * shade;
    vec2 d2 = px - uGlow;
    float s2 = 150.;
    c += crystalLight(d2, s2) * exp(-dot(d2, d2) / (2. * s2 * s2)) * smoothstep(300., 120., length(d2)) * .2 * uGlowA;
    gl_FragColor = vec4(uBg + c, 1.);
    #include <colorspace_fragment>
  }`;

const TEXT_FRAG = /* glsl */`
  uniform sampler2D uText; uniform vec2 uRes, uMouse; uniform float uAlpha, uShift, uHover;
  uniform vec3 uInk, uRose, uBlue, uAmber;
  varying vec2 vUv;
  float tx(vec2 px) { return texture2D(uText, (px - vec2(0., uShift)) / uRes).a; }
  float blur(vec2 px, vec2 dir, float r) { return (tx(px) * 2. + tx(px + dir * r) + tx(px - dir * r) + tx(px + vec2(-dir.y, dir.x) * r) + tx(px - vec2(-dir.y, dir.x) * r)) / 6.; }
  void main() {
    vec2 px = vUv * uRes;
    vec2 m = px - uMouse;
    float a = smoothstep(180., 20., length(m)) * uHover;
    vec2 dir = normalize(m + .001);
    vec2 o = dir * 12. * a;
    float r = 6. * a;
    float t0 = tx(px);
    float tr = blur(px + o, dir, r), ta = blur(px, dir, r), tb = blur(px - o, dir, r);
    vec3 split = (uRose * tr + uAmber * ta + uBlue * tb) / (uRose + uAmber + uBlue) * uInk;
    vec3 c = mix(uInk * t0, split, a);
    float al = mix(t0, max(max(tr, ta), tb), a) * uAlpha;
    if (al < .02) discard;
    gl_FragColor = vec4(c / max(mix(t0, max(max(tr, ta), tb), a), .001), al);
    #include <colorspace_fragment>
  }`;

export function createScene({ textEls = [], crystal = true } = {}) {
  const canvas = document.createElement('canvas');
  canvas.className = 'stage';
  canvas.setAttribute('aria-hidden', 'true');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  // WebGL liczony programowo (bez karty graficznej) = słabe urządzenie: zostaje tło CSS. ?gl=1 wymusza scenę (testy).
  const ctx = renderer.getContext(), info = ctx.getExtension('WEBGL_debug_renderer_info');
  if (/swiftshader|llvmpipe|software/i.test(info ? ctx.getParameter(info.UNMASKED_RENDERER_WEBGL) : '') && !location.search.includes('gl=1')) {
    renderer.dispose();
    throw new Error('programowy WebGL');
  }
  document.body.prepend(canvas);
  renderer.setPixelRatio(Math.min(devicePixelRatio, touch ? 1 : 1.5));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 10, 6000);

  // Fizyka budyniu na CPU, wynik jako tekstura przemieszczeń (128 = spoczynek).
  const hgt = new Float32Array(GX * GY), vel = new Float32Array(GX * GY);
  const dispData = new Uint8Array(GX * GY).fill(128);
  const disp = new THREE.DataTexture(dispData, GX, GY, THREE.RedFormat);
  disp.magFilter = disp.minFilter = THREE.LinearFilter;
  disp.needsUpdate = true;

  const shared = {
    uDisp: { value: disp }, uDepth: { value: DEPTH }, uRes: { value: new THREE.Vector2() },
    uViolet: { value: col('--light-violet') }, uBlue: { value: col('--light-blue') },
    uAmber: { value: col('--light-amber') }, uIce: { value: col('--light-ice') },
    uTime: { value: 0 }, uWarm: { value: .5 },
  };
  const grid = new THREE.PlaneGeometry(1, 1, 120, 70);

  const bg = new THREE.Mesh(grid, new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: BG_FRAG,
    uniforms: { ...shared, uBg: { value: col('--bg') }, uLight: { value: new THREE.Vector2(-999, -999) }, uGlow: { value: new THREE.Vector2() }, uGlowA: { value: 0 } },
  }));
  bg.position.z = BG_Z;
  scene.add(bg);

  // Napis z hero jako tekstura na płaszczyźnie z = 0 (ugina się razem z budyniem).
  const textCanvas = document.createElement('canvas');
  const textTex = new THREE.CanvasTexture(textCanvas);
  const text = new THREE.Mesh(grid, new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: TEXT_FRAG,
    blending: THREE.CustomBlending, // zostaje w kolejce nieprzezroczystej, więc widać go też przez szkło
    uniforms: {
      ...shared, uText: { value: textTex }, uMouse: { value: new THREE.Vector2(-999, -999) },
      uAlpha: { value: 1 }, uShift: { value: 0 }, uHover: { value: touch ? 0 : 1 },
      uInk: { value: col('--ink') }, uRose: { value: col('--light-rose') },
    },
  }));
  text.renderOrder = 1;
  text.visible = textEls.length > 0;
  scene.add(text);

  let W = 0, H = 0, textTop0 = 0;
  async function drawText() {
    const r = Math.min(devicePixelRatio, 1.5); // jak renderer; większa tekstura przekracza limit części kart
    textCanvas.width = W * r; textCanvas.height = H * r;
    const ctx = textCanvas.getContext('2d');
    ctx.fillStyle = '#fff';
    textTop0 = textEls[0]?.getBoundingClientRect().top ?? 0;
    for (const svg of textEls) {
      const b = svg.getBoundingClientRect();
      const s = b.height / svg.viewBox.baseVal.height;
      for (const p of svg.querySelectorAll('path')) {
        const x = p.transform.baseVal[0]?.matrix.e ?? 0;
        ctx.setTransform(r * s, 0, 0, -r * s, r * (b.left + x * s), r * (H - b.top));
        ctx.fill(new Path2D(p.getAttribute('d')));
      }
    }
    textTex.flipY = false;
    textTex.needsUpdate = true;
  }

  function resize() {
    W = innerWidth; H = innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.position.z = H / 2 / Math.tan(THREE.MathUtils.degToRad(15));
    camera.far = camera.position.z - BG_Z + 100;
    camera.updateProjectionMatrix();
    text.scale.set(W, H, 1);
    const k = (camera.position.z - BG_Z) / camera.position.z * 1.15; // zapas, żeby wgniecenie przy krawędzi nie odsłaniało brzegu
    bg.scale.set(W * k, H * k, 1);
    shared.uRes.value.set(W, H);
    if (text.visible) drawText();
  }
  resize();
  addEventListener('resize', resize);

  // Wskaźnik: px od lewego dolnego rogu (jak gl_FragCoord).
  const ptr = { x: -999, y: -999, active: false }, light = new THREE.Vector2(-999, -999);
  const at = (e, on) => { ptr.x = e.clientX; ptr.y = H - e.clientY; ptr.active = on; };
  if (touch) { // palec wgniata tylko w ruchu (także podczas przewijania)
    addEventListener('touchmove', (e) => at(e.touches[0], true), { passive: true });
    addEventListener('touchend', () => { ptr.active = false; }, { passive: true });
  } else {
    addEventListener('pointermove', (e) => at(e, true), { passive: true });
    document.documentElement.addEventListener('pointerleave', () => { ptr.active = false; });
  }

  const api = {
    THREE, scene, camera, renderer, shared,
    textUniforms: text.material.uniforms, bgUniforms: bg.material.uniforms,
    lightAt: null,          // touch: punkt światła (px, y w górę), ustawia main.js
    size: () => ({ W, H }),
    update(dt, time) {
      shared.uTime.value = time;
      // sprężyny
      const R2 = RADIUS * RADIUS;
      for (let j = 0, i = 0; j < GY; j++) {
        const cy = (j + .5) / GY * H;
        for (let k = 0; k < GX; k++, i++) {
          let target = 0;
          if (ptr.active) {
            const dx = (k + .5) / GX * W - ptr.x, dy = cy - ptr.y, d2 = dx * dx + dy * dy;
            if (d2 < R2) { const f = 1 - d2 / R2; target = -f * f; }
          }
          vel[i] += (K * (target - hgt[i]) - C * vel[i]) * dt;
          hgt[i] += vel[i] * dt;
          dispData[i] = Math.max(0, Math.min(255, 128 + hgt[i] * 100));
        }
      }
      disp.needsUpdate = true;
      // światło za kursorem z opóźnieniem ok. 0,15 s; na dotyku stoi w miejscu kryształu
      const target = touch ? api.lightAt : ptr.x > -999 ? ptr : null;
      if (target) {
        if (light.x === -999) light.set(target.x, target.y);
        light.lerp(target, 1 - Math.exp(-dt / .15));
      }
      bg.material.uniforms.uLight.value.copy(light);
      shared.uWarm.value += ((W ? light.x / W : .5) - shared.uWarm.value) * Math.min(1, dt * 2);
      text.material.uniforms.uMouse.value.set(ptr.x, ptr.y);
      if (text.visible) {
        const top = textEls[0].getBoundingClientRect().top;
        text.material.uniforms.uShift.value = textTop0 - top;
      }
      api.beforeRender?.(dt, time);
      renderer.render(scene, camera);
    },
  };
  return api;
}
