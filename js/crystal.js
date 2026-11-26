// Szklany kryształ (brief 16, sekcja 5). Z modelu bierzemy tylko kształt, materiał robi kod.
import { GLTFLoader } from '../vendor/three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from '../vendor/three/addons/libs/meshopt_decoder.module.js';

const TURN = 12;                       // s na jeden obrót
const TILT = 6 * Math.PI / 180;        // reakcja na kursor
const EXT = [0.9101, 0.9495, 0.9097];  // półosie modelu (assets/crystal/crystal.glb)

export async function addCrystal(gl, base = '') {
  const { THREE, scene, renderer } = gl;
  const css = getComputedStyle(document.documentElement);
  const col = (n, k = 1) => new THREE.Color(css.getPropertyValue(n).trim()).multiplyScalar(k);

  let geo;
  try {
    const glb = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(base + 'assets/crystal/crystal.glb');
    glb.scene.traverse((o) => { if (o.isMesh) geo = o.geometry; });
  } catch (e) { console.warn('crystal.glb: używam OctahedronGeometry', e); }
  geo ??= new THREE.OctahedronGeometry(1).scale(...EXT);

  // Mapa otoczenia: plamy światła w kolorach kryształu (fiolet, błękit, bursztyn od dołu, lód).
  const env = new THREE.Scene();
  env.background = col('--bg');
  const spot = (c, x, y, z, s) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(s, 16, 8), new THREE.MeshBasicMaterial({ color: c }));
    m.position.set(x, y, z); env.add(m);
  };
  spot(col('--light-violet', 6), -4, 2, 3, 1.6);
  spot(col('--light-blue', 5), 4, 3, 1, 1.3);
  spot(col('--light-amber', 10), 0, -5, 2, 1.8);
  spot(col('--light-ice', 4), 2, 5, -3, .8);
  spot(col('--light-rose', 4), -3, -1, -4, .9);
  spot(col('--light-violet', 3), 0, 0, -6, 2);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromScene(env, .04).texture;
  pmrem.dispose();

  const mat = new THREE.MeshPhysicalMaterial({
    transmission: 1, thickness: 1.2, ior: 1.5, roughness: .05, dispersion: 5,
    iridescence: .7, iridescenceIOR: 1.3, metalness: 0, envMap, envMapIntensity: 2.6,
    specularIntensity: 1, specularColor: col('--light-ice'), flatShading: true, side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  // Jasne krawędzie jak na renderze. W kolejce nieprzezroczystej, więc trafiają też do obrazu
  // za szkłem (krawędzie wewnętrzne widać przez ściany, załamane i rozszczepione).
  const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geo), new THREE.LineBasicMaterial({
    color: col('--light-ice', .8), blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, depthWrite: false,
  }));
  edges.renderOrder = 2;
  mesh.add(edges);
  const group = new THREE.Group();
  group.add(mesh);
  // Sygnał dla loadera: scena wyrenderowała kryształ pierwszy raz.
  const ready = new Promise((r) => { mesh.onAfterRender = () => { mesh.onAfterRender = () => {}; r(); }; });
  scene.add(group);

  // Zdjęcie projektu za kryształem: rysowane tylko w przebiegu transmisji, więc widać je wyłącznie przez szkło.
  // Dwie płaszczyzny: przy zmianie pracy stare zdjęcie gaśnie, a nowe narasta (bez przeskoku).
  const plane = new THREE.PlaneGeometry(1, 1);
  const imgs = [0, 1].map(() => {
    const m = new THREE.Mesh(plane, new THREE.MeshBasicMaterial({ blending: THREE.CustomBlending, depthWrite: false, opacity: 0 }));
    m.renderOrder = .5;
    m.visible = false;
    m.onBeforeRender = (r) => { m.material.colorWrite = r.getRenderTarget() !== null; };
    scene.add(m);
    return m;
  });
  let cur = 0;
  const tex = new Map(), loader = new THREE.TextureLoader();
  const texture = (url) => {
    if (!tex.has(url)) tex.set(url, loader.loadAsync(url).then((t) => { t.colorSpace = THREE.SRGBColorSpace; return t; }));
    return tex.get(url);
  };

  // Ściany 1–4 = projekty: normalne ośmiościanu w górnej połowie.
  const faceQ = [[1, 1, 1], [-1, 1, 1], [-1, 1, -1], [1, 1, -1]].map(([x, y, z]) => {
    const n = new THREE.Vector3(x / EXT[0], y / EXT[1], z / EXT[2]).normalize();
    return new THREE.Quaternion().setFromUnitVectors(n, new THREE.Vector3(0, 0, 1));
  });

  const state = { angle: 0, mix: 0, face: 0, url: null, tiltX: 0, tiltY: 0, leaving: false, from: null };
  const spinQ = new THREE.Quaternion(), q = new THREE.Quaternion(), tiltQ = new THREE.Quaternion();
  const base0 = new THREE.Quaternion().setFromEuler(new THREE.Euler(.18, 0, .08));
  const e = new THREE.Euler();
  let tween, size = 140, pose = { x: 0, y: 0, s: 0 };
  const FADE = .6; // s: wejście i wyjście trybu projektu, także zmiana pracy

  return {
    group,
    ready,
    // Dla loadera: środek i wysokość kryształu na ekranie (px, z perspektywą kamery) oraz kąt obrotu.
    screen: () => ({ ...pose, angle: state.angle }),
    // Pozycja w px ekranu (y w dół), rozmiar w px, z w px (dodatnie = bliżej widza).
    set(x, y, s, z = 0) {
      const { W, H } = gl.size();
      size = s;
      group.position.set(x - W / 2, H / 2 - y, z);
      group.scale.setScalar(s / (2 * EXT[1]));
      const k = 1 / (1 - z * 2 * Math.tan(Math.PI / 12) / H); // kamera z fov 30° w odległości H/2/tan(15°) (js/scene.js)
      pose = { x: W / 2 + (x - W / 2) * k, y: H / 2 + (y - H / 2) * k, s: s * k };
      for (const m of imgs) {
        m.position.set(group.position.x, group.position.y, z - s * 1.2);
        m.scale.set(s * 1.5 * (m.userData.aspect ?? 1), s * 1.5, 1);
      }
    },
    // Hover na projekcie: i = 0..3, albo -1 (powrót obrotu).
    async face(i, url) {
      tween?.kill();
      const fade = (m, v) => gsap.to(m.material, { opacity: v, duration: FADE, ease: 'power2.out', overwrite: true });
      if (i < 0) {
        state.leaving = true;
        tween = gsap.to(state, { mix: 0, duration: FADE, ease: 'power2.out' });
        imgs.forEach((m) => fade(m, 0));
        return;
      }
      state.leaving = false;
      state.from = mesh.quaternion.clone();
      state.face = i;
      state.url = url;
      tween = gsap.fromTo(state, { mix: 0 }, { mix: 1, duration: FADE, ease: 'power2.out' });
      const t = await texture(url);
      if (state.url !== url || state.leaving) return;
      if (imgs[cur].material.map !== t) {
        cur ^= 1; // nowe zdjęcie na drugą płaszczyznę, rysowaną na wierzchu
        const m = imgs[cur];
        m.material.map = t; m.material.needsUpdate = true;
        m.userData.aspect = t.image.width / t.image.height;
        m.renderOrder = .6; imgs[cur ^ 1].renderOrder = .5;
      }
      fade(imgs[cur], 1);
      fade(imgs[cur ^ 1], 0);
    },
    tilt(nx, ny) { state.tiltX = ny * TILT; state.tiltY = nx * TILT; },
    update(dt, speed = 1) { // speed: mnożnik obrotu (telefon w hero: wolniej)
      if (state.mix === 0) state.angle += dt * Math.PI * 2 / TURN * speed;
      spinQ.setFromAxisAngle(new THREE.Vector3(0, 1, 0), state.angle).premultiply(base0);
      if (state.mix === 0) q.copy(spinQ);
      else q.copy(state.leaving ? spinQ : state.from).slerp(faceQ[state.face], state.mix);
      mesh.quaternion.copy(q);
      e.set(state.tiltX, state.tiltY, 0);
      group.quaternion.slerp(tiltQ.setFromEuler(e), Math.min(1, dt * 6));
      for (const m of imgs) m.visible = m.material.opacity > 0;
    },
  };
}
