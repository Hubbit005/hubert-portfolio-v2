/* Physics: a small 2D engine for the page's toys (the AI tools jar, the footer letters).
   Circles and boxes (boxes can turn), impulse-based contacts with friction and bounce, a pointer
   "hand" that grabs a body at the point under the pointer and throws it with the hand's speed.
   Units: pixels and seconds, y grows downwards. No libraries.

     const world = new World({ gravity: 2400 });
     const ball = world.add(circle(x, y, r, { restitution: 0.4 }));
     const wall = world.add(box(x, y, w, h, { isStatic: true }));   // static (it may still move: set x / vx)
     run({ world, el, gsap, render })                                // steps only while el is on screen

   Bodies at rest fall asleep (no gravity, no work); a moving body that touches them wakes them up.
   run() steps the world in the GSAP ticker with fixed sub-steps, only while the container is on the
   screen, the tab is visible, motion is not paused (window.__motionPaused) and something is awake. */

const SLOP = 0.6;          // px of overlap allowed before position correction pushes
const BETA = 0.22;         // share of the overlap removed per step
const REST_MIN = 70;       // px/s: slower impacts do not bounce
const SLEEP_V = 14;        // px/s
const SLEEP_W = 0.22;      // rad/s
const SLEEP_T = 0.5;       // s at rest before sleeping
const V_MAX = 3200;        // px/s cap (also keeps fast throws from tunnelling through thin walls)

let uid = 0;

function makeBody(kind, x, y, o, dims) {
  const b = {
    id: ++uid, kind, x, y, a: o.angle || 0, vx: 0, vy: 0, w: 0, ...dims,
    e: o.restitution ?? 0.3, f: o.friction ?? 0.45,
    isStatic: !!o.isStatic, sleeping: false, still: 0,
    group: o.group ?? 1, mask: o.mask ?? 0xffff,
    linDamp: o.linearDamping ?? 0.02, angDamp: o.angularDamping ?? 0.6,
    data: o.data || {},
    v: null, n: null,
  };
  if (kind === 'b') {
    b.v = [[0, 0], [0, 0], [0, 0], [0, 0]];
    b.n = [[0, 0], [0, 0], [0, 0], [0, 0]];
  }
  if (b.isStatic) { b.invM = 0; b.invI = 0; } else {
    const density = o.density ?? 0.001;
    const m = kind === 'c' ? Math.PI * b.r * b.r * density : 4 * b.hw * b.hh * density;
    const I = kind === 'c' ? 0.5 * m * b.r * b.r : (m * (4 * b.hw * b.hw + 4 * b.hh * b.hh)) / 12;
    b.invM = 1 / m;
    b.invI = o.fixedRotation ? 0 : 1 / I;
  }
  return b;
}
export const circle = (x, y, r, o = {}) => makeBody('c', x, y, o, { r });
export const box = (x, y, w, h, o = {}) => makeBody('b', x, y, o, { hw: w / 2, hh: h / 2 });

const LOCAL_N = [[0, -1], [1, 0], [0, 1], [-1, 0]];
function updatePoly(b) {
  const c = Math.cos(b.a), s = Math.sin(b.a), hw = b.hw, hh = b.hh;
  const lv = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]];
  for (let i = 0; i < 4; i++) {
    const [x, y] = lv[i];
    b.v[i][0] = b.x + c * x - s * y; b.v[i][1] = b.y + s * x + c * y;
    const [nx, ny] = LOCAL_N[i];
    b.n[i][0] = c * nx - s * ny; b.n[i][1] = s * nx + c * ny;
  }
}

/* ---------- Collision tests: each pushes contacts { A, B, nx, ny (A→B), depth, px, py } ---------- */
function contact(out, A, B, nx, ny, depth, px, py) {
  out.push({ A, B, nx, ny, depth, px, py, Pn: 0, Pt: 0 });
}

function circleCircle(A, B, out) {
  const dx = B.x - A.x, dy = B.y - A.y, r = A.r + B.r, d2 = dx * dx + dy * dy;
  if (d2 >= r * r) return;
  const d = Math.sqrt(d2);
  const nx = d > 1e-6 ? dx / d : 0, ny = d > 1e-6 ? dy / d : 1;
  contact(out, A, B, nx, ny, r - d, A.x + nx * A.r, A.y + ny * A.r);
}

// Circle C against box X. Normal from C to X unless `flip` (then the pair is (X, C)).
function circleBox(C, X, out, flip) {
  const c = Math.cos(X.a), s = Math.sin(X.a);
  const dx = C.x - X.x, dy = C.y - X.y;
  const lx = c * dx + s * dy, ly = -s * dx + c * dy;
  let qx = Math.max(-X.hw, Math.min(X.hw, lx));
  let qy = Math.max(-X.hh, Math.min(X.hh, ly));
  let nlx, nly, depth;
  if (qx !== lx || qy !== ly) {
    const ex = lx - qx, ey = ly - qy, d2 = ex * ex + ey * ey;
    if (d2 >= C.r * C.r) return;
    const d = Math.sqrt(d2);
    nlx = ex / d; nly = ey / d; depth = C.r - d;
  } else {
    // centre inside the box: out through the nearest face
    const px = X.hw - Math.abs(lx), py = X.hh - Math.abs(ly);
    if (px < py) { nlx = lx < 0 ? -1 : 1; nly = 0; qx = nlx * X.hw; depth = px + C.r; } else { nlx = 0; nly = ly < 0 ? -1 : 1; qy = nly * X.hh; depth = py + C.r; }
  }
  // box → circle normal in world space, and the contact point on the box surface
  const wx = c * nlx - s * nly, wy = s * nlx + c * nly;
  const px = X.x + c * qx - s * qy, py = X.y + s * qx + c * qy;
  if (flip) contact(out, X, C, wx, wy, depth, px, py);
  else contact(out, C, X, -wx, -wy, depth, px, py);
}

function maxSeparation(A, B) {
  let best = -Infinity, idx = 0;
  for (let i = 0; i < 4; i++) {
    const n = A.n[i], v = A.v[i];
    let min = Infinity;
    for (let j = 0; j < 4; j++) {
      const d = n[0] * (B.v[j][0] - v[0]) + n[1] * (B.v[j][1] - v[1]);
      if (d < min) min = d;
    }
    if (min > best) { best = min; idx = i; }
  }
  return [best, idx];
}
function clip(p1, p2, nx, ny, o) {
  const d1 = nx * p1[0] + ny * p1[1] - o, d2 = nx * p2[0] + ny * p2[1] - o;
  const r = [];
  if (d1 <= 0) r.push(p1);
  if (d2 <= 0) r.push(p2);
  if (d1 * d2 < 0) { const t = d1 / (d1 - d2); r.push([p1[0] + t * (p2[0] - p1[0]), p1[1] + t * (p2[1] - p1[1])]); }
  return r;
}
// Box against box: separating axes, then the incident edge clipped against the reference face.
function boxBox(A, B, out) {
  const [sa, ia] = maxSeparation(A, B); if (sa > 0) return;
  const [sb, ib] = maxSeparation(B, A); if (sb > 0) return;
  let ref = A, inc = B, idx = ia, flip = false;
  if (sb > 0.95 * sa + 0.5) { ref = B; inc = A; idx = ib; flip = true; }
  const rn = ref.n[idx], v1 = ref.v[idx], v2 = ref.v[(idx + 1) % 4];
  let j = 0, minD = Infinity;
  for (let k = 0; k < 4; k++) { const d = inc.n[k][0] * rn[0] + inc.n[k][1] * rn[1]; if (d < minD) { minD = d; j = k; } }
  let tx = v2[0] - v1[0], ty = v2[1] - v1[1];
  const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
  let pts = clip(inc.v[j], inc.v[(j + 1) % 4], -tx, -ty, -(tx * v1[0] + ty * v1[1]));
  if (pts.length < 2) return;
  pts = clip(pts[0], pts[1], tx, ty, tx * v2[0] + ty * v2[1]);
  if (pts.length < 2) return;
  const nx = flip ? -rn[0] : rn[0], ny = flip ? -rn[1] : rn[1];
  for (const p of pts) {
    const sep = rn[0] * (p[0] - v1[0]) + rn[1] * (p[1] - v1[1]);
    if (sep <= 0) contact(out, A, B, nx, ny, -sep, p[0], p[1]);
  }
}

function collide(A, B, out) {
  if (A.kind === 'c' && B.kind === 'c') circleCircle(A, B, out);
  else if (A.kind === 'c') circleBox(A, B, out, false);
  else if (B.kind === 'c') circleBox(B, A, out, true);
  else boxBox(A, B, out);
}

function applyImpulse(b, px, py, rx, ry) {
  if (b.sleeping) return; // a sleeper is a wall until it wakes
  b.vx += px * b.invM; b.vy += py * b.invM;
  b.w += b.invI * (rx * py - ry * px);
}
const speed2 = (b) => b.vx * b.vx + b.vy * b.vy;

export class World {
  constructor({ gravity = 2400, iterations = 8 } = {}) {
    this.g = gravity;
    this.iterations = iterations;
    this.bodies = [];
    this.hand = null;
    this.contacts = [];
  }
  add(b) { this.bodies.push(b); return b; }
  remove(b) { const i = this.bodies.indexOf(b); if (i >= 0) this.bodies.splice(i, 1); if (this.hand?.b === b) this.hand = null; }
  wake(b) { if (b) { b.sleeping = false; b.still = 0; } else this.bodies.forEach((x) => { x.sleeping = false; x.still = 0; }); }
  sleep(b) { b.sleeping = true; b.vx = b.vy = b.w = 0; }
  /** true when no dynamic body moves and nothing is held */
  get asleep() { return !this.hand && this.bodies.every((b) => b.isStatic || b.sleeping); }

  /** topmost dynamic body under a point (`pad` widens the test, for fingers) */
  pick(x, y, filter, pad = 0) {
    for (let i = this.bodies.length - 1; i >= 0; i--) {
      const b = this.bodies[i];
      if (b.isStatic || (filter && !filter(b))) continue;
      if (b.kind === 'c') { if ((x - b.x) ** 2 + (y - b.y) ** 2 <= (b.r + pad) ** 2) return b; } else {
        const c = Math.cos(b.a), s = Math.sin(b.a), dx = x - b.x, dy = y - b.y;
        if (Math.abs(c * dx + s * dy) <= b.hw + pad && Math.abs(-s * dx + c * dy) <= b.hh + pad) return b;
      }
    }
    return null;
  }
  /** the hand: hold body b at world point (x, y); move() moves the hand; let go keeps the speed */
  grab(b, x, y) {
    const c = Math.cos(b.a), s = Math.sin(b.a), dx = x - b.x, dy = y - b.y;
    this.hand = { b, lx: c * dx + s * dy, ly: -s * dx + c * dy, tx: x, ty: y };
    this.wake(b);
  }
  move(x, y) { if (this.hand) { this.hand.tx = x; this.hand.ty = y; } }
  release() { this.hand = null; }

  step(h) {
    const bodies = this.bodies;
    // 1. forces
    for (const b of bodies) {
      if (b.isStatic || b.sleeping) continue;
      b.vy += this.g * h;
      const ld = 1 / (1 + h * b.linDamp), ad = 1 / (1 + h * b.angDamp);
      b.vx *= ld; b.vy *= ld; b.w *= ad;
    }
    // 2. the hand: the held point gets the velocity that brings it to the pointer
    const hand = this.hand;
    if (hand) {
      const b = hand.b;
      b.sleeping = false; b.still = 0;
      const c = Math.cos(b.a), s = Math.sin(b.a);
      const rx = c * hand.lx - s * hand.ly, ry = s * hand.lx + c * hand.ly;
      let dvx = (hand.tx - (b.x + rx)) * 22, dvy = (hand.ty - (b.y + ry)) * 22;
      const m = Math.hypot(dvx, dvy);
      if (m > V_MAX) { dvx *= V_MAX / m; dvy *= V_MAX / m; }
      const ex = dvx - (b.vx - b.w * ry), ey = dvy - (b.vy + b.w * rx);
      const k11 = b.invM + b.invI * ry * ry, k12 = -b.invI * rx * ry, k22 = b.invM + b.invI * rx * rx;
      const det = k11 * k22 - k12 * k12 || 1e-9;
      applyImpulse(b, (k22 * ex - k12 * ey) / det, (k11 * ey - k12 * ex) / det, rx, ry);
      b.w *= 0.97;
    }
    // 3. contacts
    for (const b of bodies) if (b.kind === 'b' && (!b.sleeping || b.isStatic)) updatePoly(b);
    const cs = this.contacts; cs.length = 0;
    for (let i = 0; i < bodies.length; i++) {
      const A = bodies[i];
      for (let j = i + 1; j < bodies.length; j++) {
        const B = bodies[j];
        if (A.invM === 0 && B.invM === 0) continue;
        if (!(A.mask & B.group) || !(B.mask & A.group)) continue;
        const aIdle = A.isStatic || A.sleeping, bIdle = B.isStatic || B.sleeping;
        if (aIdle && bIdle) {
          // a sleeping body next to a moving wall must still be pushed
          const moving = (A.isStatic && (A.vx || A.vy)) || (B.isStatic && (B.vx || B.vy));
          if (!moving) continue;
        }
        if (A.kind === 'b' && A.sleeping) updatePoly(A);
        if (B.kind === 'b' && B.sleeping) updatePoly(B);
        const n0 = cs.length;
        collide(A, B, cs);
        if (cs.length > n0) {
          // wake a sleeper hit by something that moves
          if (A.sleeping && !A.isStatic && (B.isStatic ? (B.vx || B.vy) : speed2(B) > 400)) this.wake(A);
          if (B.sleeping && !B.isStatic && (A.isStatic ? (A.vx || A.vy) : speed2(A) > 400)) this.wake(B);
        }
      }
    }
    // 4. prepare
    for (const k of cs) {
      const { A, B, nx, ny } = k;
      k.rax = k.px - A.x; k.ray = k.py - A.y; k.rbx = k.px - B.x; k.rby = k.py - B.y;
      const rnA = k.rax * ny - k.ray * nx, rnB = k.rbx * ny - k.rby * nx;
      const mA = A.sleeping ? 0 : A.invM, mB = B.sleeping ? 0 : B.invM;
      const iA = A.sleeping ? 0 : A.invI, iB = B.sleeping ? 0 : B.invI;
      k.mN = 1 / (mA + mB + iA * rnA * rnA + iB * rnB * rnB);
      const tx = -ny, ty = nx;
      const rtA = k.rax * ty - k.ray * tx, rtB = k.rbx * ty - k.rby * tx;
      k.mT = 1 / (mA + mB + iA * rtA * rtA + iB * rtB * rtB);
      const rvx = B.vx - B.w * k.rby - A.vx + A.w * k.ray, rvy = B.vy + B.w * k.rbx - A.vy - A.w * k.rax;
      const vn = rvx * nx + rvy * ny;
      k.bias = (BETA / h) * Math.max(0, k.depth - SLOP);
      if (vn < -REST_MIN) k.bias = Math.max(k.bias, -Math.max(A.e, B.e) * vn);
      k.fr = Math.sqrt(A.f * B.f);
    }
    // 5. solve
    for (let it = 0; it < this.iterations; it++) {
      for (const k of cs) {
        const { A, B, nx, ny } = k;
        let rvx = B.vx - B.w * k.rby - A.vx + A.w * k.ray, rvy = B.vy + B.w * k.rbx - A.vy - A.w * k.rax;
        let d = k.mN * (-(rvx * nx + rvy * ny) + k.bias);
        const p0 = k.Pn; k.Pn = Math.max(p0 + d, 0); d = k.Pn - p0;
        applyImpulse(A, -nx * d, -ny * d, k.rax, k.ray);
        applyImpulse(B, nx * d, ny * d, k.rbx, k.rby);
        rvx = B.vx - B.w * k.rby - A.vx + A.w * k.ray; rvy = B.vy + B.w * k.rbx - A.vy - A.w * k.rax;
        const tx = -ny, ty = nx;
        let dt = k.mT * -(rvx * tx + rvy * ty);
        const max = k.fr * k.Pn, t0 = k.Pt;
        k.Pt = Math.max(-max, Math.min(max, t0 + dt)); dt = k.Pt - t0;
        applyImpulse(A, -tx * dt, -ty * dt, k.rax, k.ray);
        applyImpulse(B, tx * dt, ty * dt, k.rbx, k.rby);
      }
    }
    // 6. move, cap the speed, fall asleep when still
    for (const b of bodies) {
      if (b.isStatic || b.sleeping) continue;
      const v2 = speed2(b);
      if (v2 > V_MAX * V_MAX) { const f = V_MAX / Math.sqrt(v2); b.vx *= f; b.vy *= f; }
      b.x += b.vx * h; b.y += b.vy * h; b.a += b.w * h;
      if (hand?.b !== b && v2 < SLEEP_V * SLEEP_V && Math.abs(b.w) < SLEEP_W) {
        b.still += h;
        if (b.still > SLEEP_T) this.sleep(b);
      } else b.still = 0;
    }
  }
}

/* ---------- Loop: the world steps in the GSAP ticker only while it is useful ---------- */
export function run({ world, el, gsap, render, before, busy, hz = 240, margin = '120px' }) {
  const h = 1 / hz;
  let visible = false, acc = 0, kick = 0;
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { rootMargin: margin });
  io.observe(el);
  const tick = (_, deltaMs) => {
    if (!visible || document.hidden || window.__motionPaused) { acc = 0; return; }
    if (world.asleep && kick <= 0 && !busy?.()) { acc = 0; return; }
    acc += Math.min(deltaMs || 16.7, 50) / 1000;
    let n = 0;
    while (acc >= h && n < 12) { before?.(h); world.step(h); acc -= h; n++; }
    if (kick > 0) kick -= n * h;
    if (n) render();
  };
  gsap.ticker.add(tick);
  return {
    /** keep stepping for `s` seconds even if everything sleeps (e.g. a moving jar) */
    keep(s = 0.5) { kick = Math.max(kick, s); },
    get visible() { return visible; },
    /** run the world without drawing (fast-forward), then draw once */
    settle(seconds) { for (let t = 0; t < seconds; t += h) { before?.(h); world.step(h); if (world.asleep) break; } render(); },
    stop() { gsap.ticker.remove(tick); io.disconnect(); },
  };
}

/* ---------- Pointer: grab, drag and throw; a short press without movement is a tap ---------- */
export function hand({ world, el, toWorld, pick, onTap, onGrab, onDrop, canDrag = () => true }) {
  let active = null; // { id, b, x0, y0, t0, moved }
  el.addEventListener('pointerdown', (e) => {
    if (active || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const p = toWorld(e.clientX, e.clientY);
    const b = pick(p.x, p.y, e);
    if (!b) return;
    active = { id: e.pointerId, b, x0: e.clientX, y0: e.clientY, t0: performance.now(), moved: false, drag: canDrag(e, b) };
    if (active.drag) {
      e.preventDefault();
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      world.grab(b, p.x, p.y);
      onGrab?.(b, e);
    }
  });
  el.addEventListener('pointermove', (e) => {
    if (!active || e.pointerId !== active.id) return;
    if (!active.moved && Math.hypot(e.clientX - active.x0, e.clientY - active.y0) > 6) active.moved = true;
    if (active.drag) { const p = toWorld(e.clientX, e.clientY); world.move(p.x, p.y); }
  });
  const end = (e, cancelled) => {
    if (!active || e.pointerId !== active.id) return;
    const a = active; active = null;
    if (a.drag) { world.release(); onDrop?.(a.b, e); }
    if (a.drag && a.moved) {
      // the click that follows a drag is not a click (no stamp, no link)
      const stop = (ev) => { ev.stopPropagation(); ev.preventDefault(); };
      window.addEventListener('click', stop, { capture: true, once: true });
      setTimeout(() => window.removeEventListener('click', stop, { capture: true }), 60);
    }
    if (!cancelled && !a.moved && performance.now() - a.t0 < 450) onTap?.(a.b, e);
  };
  el.addEventListener('pointerup', (e) => end(e, false));
  el.addEventListener('pointercancel', (e) => end(e, true));
  el.addEventListener('lostpointercapture', (e) => { if (active?.drag && e.pointerId === active.id) end(e, true); });
  return { get holding() { return active?.b || null; } };
}
