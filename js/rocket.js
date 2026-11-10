/* Rocket guide (task 15, the signature move): the chrome rocket from the launch intro flies down the
   whole page beside the content and lands in the footer. It keeps to the side margins and changes
   side between the stations (the case studies), turns its nose the way the page scrolls (down or up)
   and spins a little with the scroll speed. Behind it a violet trail is drawn by the scroll: one SVG
   path along the whole route in #main, revealed with stroke-dashoffset up to the rocket.
   Desktop: the rocket is the GLB model (assets/space/rocket.glb, three.js) in a small fixed canvas,
   above the content, loaded once the page has been scrolled. Phones and narrow screens: its picture
   (rocket-480.webp), smaller, behind the content (only the dark sections show it), so it never covers
   text; the trail is a simpler line along the edge. Decorative (aria-hidden).
   Reduced motion: the whole trail is drawn and the rocket stands landed in the footer. No JS: nothing. */

const HEAD = 0.55;   // the rocket's height on the screen (share of the viewport)
const ROUTE = ['#work', '#cases', '#basko-clean', '#ksk-pretor', '#livingroom', '#psychologist-site', '#smaller-projects', '#ai', '#about', '#cv', '#contact'];
const SVGNS = 'http://www.w3.org/2000/svg';

export function initRocket({ reduced, gsap }) {
  const main = document.getElementById('main');
  const hero = document.getElementById('home');
  const contact = document.getElementById('contact');
  if (!main || !hero || !contact || !gsap) return;
  const doc = document.documentElement;

  /* ---------- Trail ---------- */
  const svg = document.createElementNS(SVGNS, 'svg');
  svg.setAttribute('class', 'trail');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('focusable', 'false');
  const path = document.createElementNS(SVGNS, 'path');
  svg.appendChild(path);
  main.prepend(svg);

  // Rocket element: the picture first; desktop swaps in the 3D model when it is ready
  const pic = new Image();
  pic.className = 'rocket';
  pic.alt = '';
  pic.setAttribute('aria-hidden', 'true');
  pic.decoding = 'async';
  pic.src = 'assets/space/rocket-480.webp';
  document.body.appendChild(pic);

  let W = 1, H = 1, maxScroll = 1, wide = true, xL = 30, xR = 30, size = 110, gl = null;
  let pts = [], lens = [], total = 1, y0 = 0, yEnd = 1, landX = 0;

  // x of the route at a page height y (sides alternate per section, smooth turn at each boundary)
  let tops = [], sides = [];
  function xAt(y) {
    if (y <= tops[0]) {
      const t = smooth((y - y0) / Math.max(1, tops[0] - y0));
      return W / 2 + (sides[0] - W / 2) * t;
    }
    let i = tops.length - 1;
    while (i > 0 && y < tops[i]) i--;
    const next = i + 1 < tops.length ? tops[i + 1] : Infinity;
    let x = sides[i];
    // cross to the next side just before the next section starts (through the gap between sections)
    if (next < Infinity && y > next - H * 0.3) x += (sides[i + 1] - x) * smooth((y - (next - H * 0.3)) / (H * 0.3));
    // landing: glide to the landing spot over the last screen
    if (y > yEnd - H) x += (landX - x) * smooth((y - (yEnd - H)) / H);
    return x;
  }

  function build() {
    W = window.innerWidth; H = window.innerHeight;
    maxScroll = Math.max(1, doc.scrollHeight - H);
    const c = document.querySelector('#cases .container') || main;
    const cr = c.getBoundingClientRect();
    const left = cr.left + parseFloat(getComputedStyle(c).paddingLeft || 0);
    wide = W >= 900 && left >= 44;
    size = wide ? Math.min(130, Math.max(96, left * 2)) : 64;
    xL = wide ? left / 2 : 18; xR = W - xL;
    doc.classList.toggle('rocket-wide', wide);
    const sy = window.scrollY;
    tops = []; sides = [];
    ROUTE.forEach((s, i) => {
      const el = document.querySelector(s);
      if (!el) return;
      // the contact sticks under the CV (curtain): its place in the page is right after the CV
      const top = (el.id === 'contact' ? document.getElementById('cv') || el : el).getBoundingClientRect()[el.id === 'contact' ? 'bottom' : 'top'] + sy;
      tops.push(Math.max(top, (tops[tops.length - 1] || 0) + 1));
      // phones: one edge only (the simple trail); desktop: alternate
      sides.push(!wide ? xR : i % 2 ? xL : xR);
    });
    y0 = hero.offsetTop + hero.offsetHeight * 0.72;
    yEnd = maxScroll + H * HEAD;             // where the rocket is at the very bottom of the page
    landX = wide ? W * 0.8 : xR;
    // the route as a polyline every 24 px, with its running length
    pts = []; lens = []; total = 0;
    let px = null, py = null;
    for (let y = y0; y <= yEnd + 0.5; y += 24) {
      const x = xAt(y);
      if (px !== null) total += Math.hypot(x - px, y - py);
      pts.push(x, y); lens.push(total);
      px = x; py = y;
    }
    total = Math.max(1, total);
    const mainTop = main.getBoundingClientRect().top + sy;
    let d = '';
    for (let i = 0; i < pts.length; i += 2) d += `${i ? 'L' : 'M'}${pts[i].toFixed(1)} ${(pts[i + 1] - mainTop).toFixed(1)}`;
    path.setAttribute('d', d);
    svg.setAttribute('height', String(Math.ceil(yEnd - mainTop + 40)));
    svg.setAttribute('width', String(W));
    path.style.strokeDasharray = `${total} ${total}`;
    pic.style.width = `${size}px`;
    if (gl) gl.size(size);
  }

  if (reduced) {
    // Static: the whole trail, the rocket landed in the footer
    const place = () => {
      build();
      path.style.strokeDashoffset = '0';
      pic.style.transform = `translate3d(${(landX - size / 2).toFixed(1)}px, ${(yEnd - size / 2).toFixed(1)}px, 0)`;
    };
    doc.classList.add('rocket-static');
    place();
    window.addEventListener('resize', place);
    return;
  }

  /* ---------- Desktop: the 3D model ---------- */
  const loadModel = () => {
    if (gl || !wide) return;
    gl = { size() {} };
    createModel().then((m) => { gl = m; gl.size(size); dirty = true; }).catch(() => { gl = null; });
  };

  /* ---------- Loop ---------- */
  let dir = 1, heading = Math.PI, spin = 0, vel = 0, lastY = window.scrollY, dirty = true;
  function tick(_, deltaMs) {
    if (document.hidden) return;
    const dt = Math.min((deltaMs || 16) / 1000, 0.05);
    const sy = window.scrollY;
    const dy = sy - lastY;
    lastY = sy;
    vel += (dy / Math.max(dt, 0.001) - vel) * (1 - Math.exp(-dt * 6));
    if (Math.abs(vel) > 30) dir = Math.sign(vel);
    if (!dirty && Math.abs(dy) < 0.1 && Math.abs(vel) < 2) return;
    dirty = false;

    const y = sy + H * HEAD;
    const t = Math.min(1, Math.max(0, (y - y0) / (H * 0.25)));          // fades in below the hero
    const land = Math.min(1, Math.max(0, (y - (yEnd - H * 0.6)) / (H * 0.6))); // the landing at the end
    // drawn length up to the rocket
    const k = Math.min(lens.length - 1, Math.max(0, Math.floor((y - y0) / 24)));
    path.style.strokeDashoffset = String(y <= y0 ? total : Math.max(0, total - lens[k]));
    const x = xAt(Math.max(y0, y));
    const slope = (xAt(Math.max(y0, y) + 12) - xAt(Math.max(y0, y) - 12)) / 24;
    // heading: clockwise screen angle of the nose (0 up). Down while scrolling down, up while scrolling
    // up, leaning with the route; upright when landed
    const target = (dir > 0 ? Math.PI - Math.atan(slope) : -Math.atan(slope)) * (1 - land);
    let dh = target - heading;
    dh = Math.atan2(Math.sin(dh), Math.cos(dh));
    heading += dh * (1 - Math.exp(-dt * 5));
    spin += vel * dt * 0.004;
    const sx = x - size / 2, syy = H * HEAD - size / 2 + land * H * 0.04;
    const op = t;
    if (gl && gl.ready) {
      gl.place(sx, syy, heading, spin, op);
      pic.style.opacity = '0';
    } else {
      pic.style.opacity = String(op);
      pic.style.transform = `translate3d(${sx.toFixed(1)}px, ${syy.toFixed(1)}px, 0) rotate(${heading.toFixed(3)}rad)`;
    }
    if (y > y0 && wide) loadModel();
  }

  build();
  let rt = 0;
  const rebuild = () => { clearTimeout(rt); rt = setTimeout(() => { build(); dirty = true; }, 150); };
  window.addEventListener('resize', rebuild);
  new ResizeObserver(rebuild).observe(main);
  document.addEventListener('langchange', rebuild);
  gsap.ticker.add(tick);
}

function smooth(t) { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); }

// The GLB rocket in its own small fixed canvas (only the rocket is drawn, so it stays cheap)
async function createModel() {
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
  canvas.className = 'rocket-gl';
  canvas.setAttribute('aria-hidden', 'true');
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-0.5, 0.5, 0.5, -0.5, -10, 10);
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const key = new THREE.DirectionalLight(0xffffff, 2);
  key.position.set(-1, 1, 2);
  const rim = new THREE.DirectionalLight(0xb89cff, 2.4);
  rim.position.set(1.5, -0.5, 1);
  scene.add(key, rim);
  const [gltf, env] = await Promise.all([
    new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(new URL('../assets/space/rocket.glb', import.meta.url).href),
    new THREE.TextureLoader().loadAsync(new URL('../assets/space/env-nebula.jpg', import.meta.url).href),
  ]);
  env.mapping = THREE.EquirectangularReflectionMapping;
  env.colorSpace = THREE.SRGBColorSpace;
  scene.environment = env;
  const obj = gltf.scene;
  const box = new THREE.Box3().setFromObject(obj);
  const dim = box.getSize(new THREE.Vector3());
  obj.position.sub(box.getCenter(new THREE.Vector3()));
  const fit = new THREE.Group();
  fit.add(obj);
  fit.scale.setScalar(0.92 / Math.max(dim.x, dim.y, dim.z));
  const head = new THREE.Group();   // heading (around the view axis)
  const roll = new THREE.Group();   // spin around its own long axis
  roll.add(fit); head.add(roll); scene.add(head);
  document.body.appendChild(canvas);
  return {
    ready: true,
    size(s) { renderer.setSize(s, s, false); canvas.style.width = canvas.style.height = `${s}px`; },
    place(x, y, h, sp, op) {
      canvas.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      canvas.style.opacity = String(op);
      head.rotation.z = -h; // three.js turns counter-clockwise
      roll.rotation.y = sp;
      if (op > 0.01) renderer.render(scene, camera);
    },
  };
}
