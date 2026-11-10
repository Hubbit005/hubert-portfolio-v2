/* Stations (task 15): each project in #cases is a stop on the flight.
     Cover: a full-screen decorative cover (.station, aria-hidden; the real heading follows it) with the
       station's number, the project's name in the display face and its own chrome object. The cover
       is pinned (CSS sticky) for half a screen while the object turns with the scroll.
     Arrival: one pull of the wheel (or a key) near the end of a station carries the page to the next
       cover (Lenis, about 1 s). Inside a station the scroll is free; touch scrolling is never taken over.
     Objects: desktop renders the station's GLB (assets/space/<name>.glb, chrome with violet-blue
       iridescence) in one small fixed canvas that follows the cover's picture; each model loads when
       its station comes near. Phones, reduced motion, no WebGL: the picture, turning with the scroll
       (still with reduced motion).
   Also here, for the light (beige) parts of the page (.is-light):
     Waves: a beige wave where a light part meets a dark one; it stretches a little with the scroll speed.
     Stickers: big letters of HUBERT with a white outline float at the sides with parallax (aria-hidden). */

const WORD = 'HUBERT';

export function initStations({ reduced, gsap, ScrollTrigger, lenis }) {
  const stations = [...document.querySelectorAll('.station')];
  const lights = [...document.querySelectorAll('.is-light')];
  if (!gsap) return;

  /* ---------- Waves ---------- */
  const isLight = (el) => !!el?.classList.contains('is-light');
  const before = (el) => el.previousElementSibling || el.parentElement?.previousElementSibling;
  const after = (el) => el.nextElementSibling || el.parentElement?.nextElementSibling;
  const waves = [];
  const wave = (el, edge) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', `wave wave--${edge}`);
    svg.setAttribute('viewBox', '0 0 1440 60');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.innerHTML = '<path d="M0 60V34C160 6 320 4 480 22s320 40 480 26 320-40 480-34V60z"/>';
    el.prepend(svg);
    waves.push(svg);
  };
  lights.forEach((el) => {
    if (!isLight(before(el))) wave(el, 'top');
    // the CV has its own rounded edge over the contact (curtain)
    if (!isLight(after(el)) && el.id !== 'cv') wave(el, 'bottom');
  });

  /* ---------- Stickers: letters of HUBERT at the sides of the light parts ---------- */
  let n = 0;
  lights.forEach((el) => {
    if (el.id === 'cv') return; // the CV is dense; it keeps a clean page
    ['l', 'r'].forEach((side) => {
      const s = document.createElement('span');
      s.className = `sticker sticker--${side}`;
      s.setAttribute('aria-hidden', 'true');
      s.textContent = WORD[n % WORD.length];
      s.style.setProperty('--rot', `${(n % 2 ? 7 : -9) + (n % 3) * 3}deg`);
      s.style.setProperty('--travel', `${140 + (n % 3) * 60}px`);
      el.appendChild(s);
      n++;
    });
    // one scroll value per light part moves its stickers (css: translate by --lp)
    if (!reduced && ScrollTrigger) ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'bottom top', onUpdate: (t) => el.style.setProperty('--lp', t.progress.toFixed(4)) });
  });

  if (reduced || !ScrollTrigger || !stations.length) return;

  /* ---------- One trigger per cover: its progress turns the object, and on the way down, once its
     top passes 82 % of the screen, a wheel or key scroll is carried to it (touch is never taken over) ---------- */
  let lastInput = 0;
  const mark = () => { lastInput = performance.now(); };
  window.addEventListener('wheel', mark, { passive: true });
  window.addEventListener('keydown', (e) => { if (['ArrowDown', 'PageDown', ' ', 'Spacebar'].includes(e.key)) mark(); });
  stations.forEach((st) => {
    let prev = 0;
    ScrollTrigger.create({
      trigger: st, start: 'top bottom', end: 'bottom top',
      onUpdate: (t) => {
        st.style.setProperty('--sp', t.progress.toFixed(4));
        const at = (window.innerHeight * 0.18) / (window.innerHeight + st.offsetHeight); // top at 82 %
        if (lenis && t.direction > 0 && prev < at && t.progress >= at && performance.now() - lastInput < 1200) lenis.scrollTo(st, { duration: 1, lock: true });
        prev = t.progress;
      },
    });
  });

  /* ---------- Waves follow the scroll speed ---------- */
  let lastY = window.scrollY, v = 0;
  gsap.ticker.add((_, deltaMs) => {
    const dt = Math.max(0.001, (deltaMs || 16) / 1000);
    const y = window.scrollY;
    v += (Math.abs(y - lastY) / dt - v) * Math.min(1, dt * 8);
    lastY = y;
    if (v < 1 && waves.k === 1) return;
    const k = 1 + Math.min(0.9, v / 2600);
    waves.k = Math.abs(k - 1) < 0.01 ? 1 : k;
    waves.forEach((w) => { w.style.transform = `scaleY(${waves.k.toFixed(3)})`; });
  });

  /* ---------- Desktop: the 3D objects ---------- */
  const desk = matchMedia('(min-width: 900px) and (hover: hover) and (pointer: fine)').matches;
  if (desk && hasWebGL()) objects(stations, gsap).catch(() => { /* the pictures stay */ });
}

function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}

async function objects(stations, gsap) {
  const base = new URL('../vendor/', import.meta.url);
  const [THREE, { GLTFLoader }, { MeshoptDecoder }] = await Promise.all([
    import(new URL('three/three.module.min.js', base).href),
    import(new URL('three/addons/loaders/GLTFLoader.js', base).href),
    import(new URL('three/addons/libs/meshopt_decoder.module.js', base).href),
  ]);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.className = 'station-gl';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
  camera.position.set(0, 0, 3.6);
  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(-1, 1.2, 2);
  scene.add(key);
  const env = await new THREE.TextureLoader().loadAsync(new URL('../assets/space/env-nebula.jpg', import.meta.url).href);
  env.mapping = THREE.EquirectangularReflectionMapping;
  env.colorSpace = THREE.SRGBColorSpace;
  scene.environment = env;
  const mat = new THREE.MeshPhysicalMaterial({
    color: '#ece8f6', metalness: 1, roughness: 0.14, envMapIntensity: 1.7,
    iridescence: 1, iridescenceIOR: 1.7, iridescenceThicknessRange: [160, 640],
  });
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const models = new Map(); // name -> Promise<Group>
  const load = (name) => {
    if (!models.has(name)) {
      models.set(name, loader.loadAsync(new URL(`../assets/space/${name}.glb`, import.meta.url).href).then((g) => {
        const obj = g.scene;
        obj.traverse((m) => { if (m.isMesh) m.material = mat; });
        const box = new THREE.Box3().setFromObject(obj);
        const size = box.getSize(new THREE.Vector3());
        obj.position.sub(box.getCenter(new THREE.Vector3()));
        const fit = new THREE.Group();
        fit.add(obj);
        fit.scale.setScalar(1.25 / Math.max(size.x, size.y, size.z));
        fit.userData.ready = true;
        return fit;
      }));
    }
    return models.get(name);
  };
  const items = stations.map((st) => ({ st, img: st.querySelector('.station__obj'), name: st.querySelector('.station__obj')?.dataset.model, group: null }));
  let current = null, time = 0, cs = 0;

  gsap.ticker.add((_, deltaMs) => {
    if (document.hidden) return;
    const H = window.innerHeight;
    let active = null;
    for (const it of items) {
      if (!it.img) continue;
      const r = it.img.getBoundingClientRect();
      if (r.top < H * 2 && r.bottom > -H) { // near: load its model
        if (!it.group && it.name) { it.group = 'loading'; load(it.name).then((g) => { it.group = g; it.st.classList.add('is-3d'); }).catch(() => { it.group = null; }); }
      }
      if (r.bottom > 0 && r.top < H && it.group?.userData) { active = it; it.rect = r; }
    }
    if (!active) { canvas.style.opacity = '0'; return; }
    if (current !== active) {
      if (current?.group?.userData) scene.remove(current.group);
      scene.add(active.group);
      current = active;
    }
    const r = active.rect;
    const s = Math.round(r.width);
    if (s !== cs) { cs = s; renderer.setSize(s, s, false); canvas.style.width = canvas.style.height = `${s}px`; }
    canvas.style.opacity = '1';
    canvas.style.transform = `translate3d(${r.left.toFixed(1)}px, ${r.top.toFixed(1)}px, 0)`;
    if (!window.__motionPaused) time += Math.min((deltaMs || 16) / 1000, 0.05);
    const sp = parseFloat(active.st.style.getPropertyValue('--sp')) || 0;
    active.group.rotation.set(0.25 + sp * 0.6, time * 0.15 + sp * Math.PI * 1.5, 0.08);
    renderer.render(scene, camera);
  });
}
