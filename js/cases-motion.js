/* Case studies (#cases): the motion layer. The content, its order and the anchors stay as they are;
   this module only changes how they are shown.
     1. case index: large names with a line that fills with the accent on hover, and a cover that
        floats next to the pointer and cross-fades between projects (fine pointer only);
     2. case titles: letters rise from a mask one after another (screen readers get the whole text);
        facts and "What I did" come in as a cascade;
     3. browser shots: start tilted back in 3D and straighten towards the middle of the screen (scrub);
     4. galleries: images uncover from the bottom (clip-path), cascade;
     5. KSK Pretor: the page around the dark case dims, the 3D state shots come in one by one,
        the film frames run as an endless strip (paused on hover and focus);
     6. psychologist: the line joining steps 1→4 is drawn with the scroll, steps light up, the
        booking branch comes in at the end;
     7. training plans: the two phones float with opposite parallax and straighten in the middle.
   Anything already on screen when the page loads is never hidden. Reduced motion or no JS: all of it
   is simply visible, without motion (the film strip stays a grid). */

const COVERS = {
  'basko-clean': 'assets/cards/basko',
  'ksk-pretor': 'assets/cards/ksk',
  livingroom: 'assets/cards/living',
  'psychologist-site': 'type',
  'smaller-projects': 'assets/cards/training',
};

export function initCasesMotion({ reduced, gsap, ScrollTrigger }) {
  const root = document.getElementById('cases');
  if (!root) return;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!reduced && fine && gsap) initIndexCover(root, gsap);
  if (reduced || !gsap || !ScrollTrigger) return;

  const small = matchMedia('(max-width: 700px)').matches || matchMedia('(pointer: coarse)').matches;
  const ease = 'expo.out';
  const belowFold = (el) => el.getBoundingClientRect().top > window.innerHeight * 0.92;

  /* ---------- 2. titles: letters from a mask ---------- */
  const titles = [...root.querySelectorAll('.case__title .mask > span')];
  function split(span) {
    if (span.querySelector('.split')) return;
    const text = span.textContent;
    const words = text.trim().split(/\s+/);
    span.innerHTML = `<span class="sr-only">${escapeHtml(text)}</span><span class="split" aria-hidden="true">${
      words.map((w) => `<span class="split__w">${[...w].map((c) => `<span class="split__c">${escapeHtml(c)}</span>`).join('')}</span>`).join(' ')
    }</span>`;
  }
  titles.forEach((span) => {
    split(span);
    const chars = span.querySelectorAll('.split__c');
    if (!belowFold(span)) return;
    gsap.set(chars, { yPercent: 115 });
    ScrollTrigger.create({
      trigger: span.closest('.case__title'), start: 'top 90%', once: true,
      onEnter: () => gsap.to(span.querySelectorAll('.split__c'), { yPercent: 0, duration: 1, ease, stagger: 0.035 }),
    });
  });
  // The language switch rewrites two titles (they carry data-i18n): split them again, fully shown.
  document.addEventListener('langchange', () => {
    titles.forEach(split);
  });

  // Facts and "What I did": a short cascade
  root.querySelectorAll('.case').forEach((c) => {
    const items = [...c.querySelectorAll(':scope > .container > .case__head .case__sub, :scope > .container > .case__head .facts > div, :scope > .container > .case__did .block__title, :scope > .container > .case__did .list > li')]
      .filter(belowFold);
    if (!items.length) return;
    gsap.set(items, { y: 22, opacity: 0 });
    ScrollTrigger.batch(items, {
      start: 'top 92%', once: true,
      onEnter: (batch) => gsap.to(batch, { y: 0, opacity: 1, duration: 0.8, ease, stagger: 0.07, overwrite: true }),
    });
  });

  /* ---------- 3. browser shots: tilted back, straightening in the middle ---------- */
  root.querySelectorAll('.shot--browser').forEach((shot) => {
    const from = small ? { scale: 0.94 } : { rotateX: 14, scale: 0.9, transformPerspective: 1400, transformOrigin: '50% 100%' };
    gsap.fromTo(shot, from, {
      rotateX: 0, scale: 1, ease: 'none', immediateRender: belowFold(shot),
      scrollTrigger: { trigger: shot, start: 'top bottom', end: 'center center', scrub: 0.6 },
    });
  });

  /* ---------- 4. galleries: clip-path from the bottom, cascade ---------- */
  root.querySelectorAll('.gallery').forEach((g) => {
    const frames = [...g.querySelectorAll(':scope > .shot > .shot__frame, :scope > .shot > .phone')].filter(belowFold);
    if (!frames.length) return;
    gsap.set(frames, { clipPath: 'inset(100% 0% 0% 0% round 12px)' });
    ScrollTrigger.batch(frames, {
      start: 'top 90%', once: true,
      onEnter: (batch) => gsap.to(batch, {
        clipPath: 'inset(0% 0% 0% 0% round 12px)', duration: 1.1, ease: 'power3.out', stagger: 0.12,
        onComplete() { gsap.set(this.targets(), { clearProps: 'clipPath' }); },
      }),
    });
  });

  /* ---------- 5. KSK Pretor ---------- */
  const ksk = document.getElementById('ksk-pretor');
  if (ksk) {
    // Dim the page around the dark case (one element, opacity only).
    const dim = document.createElement('div');
    dim.className = 'case-dim';
    dim.setAttribute('aria-hidden', 'true');
    ksk.prepend(dim);
    gsap.timeline({ scrollTrigger: { trigger: ksk, start: 'top 85%', end: 'bottom 15%', scrub: true } })
      .fromTo(dim, { opacity: 0 }, { opacity: 1, ease: 'power1.out', duration: 0.18 })
      .to(dim, { opacity: 1, duration: 0.64 })
      .to(dim, { opacity: 0, ease: 'power1.in', duration: 0.18 });

    // 3D state shots, one by one, with a slight turn
    const shots = [...ksk.querySelectorAll('.state-shots > li')];
    if (shots.length && belowFold(shots[0])) {
      gsap.set(shots, { y: 40, opacity: 0, rotate: (i) => (i % 2 ? 3 : -3) });
      ScrollTrigger.create({
        trigger: shots[0].parentElement, start: 'top 88%', once: true,
        onEnter: () => gsap.to(shots, { y: 0, opacity: 1, rotate: 0, duration: 0.9, ease, stagger: 0.14 }),
      });
    }

    // Film frames: an endless strip. The copies needed for the loop are hidden from screen readers.
    const strip = ksk.querySelector('.film-strip');
    if (strip) {
      const track = document.createElement('div');
      track.className = 'film-strip__track';
      const pics = [...strip.querySelectorAll(':scope > picture')];
      pics.forEach((p) => track.appendChild(p));
      pics.forEach((p) => {
        const c = p.cloneNode(true);
        c.setAttribute('aria-hidden', 'true');
        c.querySelectorAll('img').forEach((img) => { img.alt = ''; img.removeAttribute('data-i18n-attr'); });
        track.appendChild(c);
      });
      strip.prepend(track);
      strip.classList.add('is-marquee');
      const io = new IntersectionObserver(([en]) => strip.classList.toggle('is-running', en.isIntersecting));
      io.observe(strip);
    }
  }

  /* ---------- 6. psychologist: purchase path drawn with the scroll ---------- */
  const flow = root.querySelector('.flow');
  if (flow) {
    const stepsEl = flow.querySelector('.flow__steps');
    const steps = [...flow.querySelectorAll('.flow__step')];
    const branch = flow.querySelector('.flow__branch');
    const rail = document.createElement('span');
    rail.className = 'flow__rail';
    rail.setAttribute('aria-hidden', 'true');
    rail.innerHTML = '<span class="flow__fill"></span>';
    stepsEl.appendChild(rail);
    const fill = rail.firstChild;
    flow.classList.add('is-drawn');
    let vertical = false;
    function place() {
      const nums = steps.map((s) => s.querySelector('.flow__n'));
      const base = stepsEl.getBoundingClientRect();
      const c = nums.map((n) => { const r = n.getBoundingClientRect(); return { x: r.left - base.left + r.width / 2, y: r.top - base.top + r.height / 2 }; });
      vertical = Math.abs(c[c.length - 1].y - c[0].y) > Math.abs(c[c.length - 1].x - c[0].x);
      rail.classList.toggle('is-vertical', vertical);
      if (vertical) Object.assign(rail.style, { left: '-11px', top: `${c[0].y}px`, width: '2px', height: `${c[c.length - 1].y - c[0].y}px` });
      else Object.assign(rail.style, { left: `${c[0].x}px`, top: `${c[0].y - 1}px`, width: `${c[c.length - 1].x - c[0].x}px`, height: '2px' });
    }
    place();
    ScrollTrigger.addEventListener('refreshInit', place);
    const shown = !belowFold(flow);
    if (!shown && branch) gsap.set(branch, { opacity: 0, y: 16 });
    let branchIn = shown;
    const light = (p) => {
      steps.forEach((s, i) => s.classList.toggle('is-lit', p >= i / (steps.length - 1) - 0.001));
      if (!branchIn && p > 0.97 && branch) { branchIn = true; gsap.to(branch, { opacity: 1, y: 0, duration: 0.8, ease }); }
    };
    gsap.fromTo(fill, { scaleX: shown ? 1 : 0, scaleY: shown ? 1 : 0 }, {
      scaleX: 1, scaleY: 1, ease: 'none',
      scrollTrigger: {
        trigger: stepsEl, start: 'top 78%', end: 'bottom 45%', scrub: 0.4,
        onUpdate: (self) => light(self.progress),
      },
    });
    light(shown ? 1 : 0);
  }

  /* ---------- 7. training plans: two phones, opposite parallax ---------- */
  const phones = [...root.querySelectorAll('.phones > .shot')];
  if (phones.length === 2) {
    const [a, b] = phones;
    const d = small ? 0.5 : 1;
    gsap.timeline({ scrollTrigger: { trigger: a.parentElement, start: 'top bottom', end: 'bottom top', scrub: 0.6 } })
      .fromTo(a, { y: 70 * d, rotate: -6 * d }, { y: 0, rotate: 0, ease: 'power1.out', duration: 0.5 }, 0)
      .fromTo(b, { y: -50 * d, rotate: 5 * d }, { y: 0, rotate: 0, ease: 'power1.out', duration: 0.5 }, 0)
      .to(a, { y: -40 * d, ease: 'none', duration: 0.5 }, 0.5)
      .to(b, { y: 40 * d, ease: 'none', duration: 0.5 }, 0.5);
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());
}

/* ---------- 1. index: large list + floating cover ---------- */
function initIndexCover(root, gsap) {
  const index = root.querySelector('.case-index');
  if (!index) return;
  const links = [...index.querySelectorAll('a[href^="#"]')];
  let floater = null;
  const covers = new Map();
  let x = 0, y = 0, tx = 0, ty = 0, rot = 0, on = false, active = null;

  function build() {
    floater = document.createElement('div');
    floater.className = 'case-cover';
    floater.setAttribute('aria-hidden', 'true');
    links.forEach((a) => {
      const id = a.getAttribute('href').slice(1);
      const src = COVERS[id];
      if (!src) return;
      const slot = document.createElement('div');
      slot.className = 'case-cover__img';
      if (src === 'type') {
        const tc = document.querySelector('.card--psy .type-cover');
        if (tc) slot.appendChild(tc.cloneNode(true));
      } else {
        slot.innerHTML = `<picture><source type="image/webp" srcset="${src}.webp"><img src="${src}.jpg" alt="" width="600" height="800" decoding="async"></picture>`;
      }
      floater.appendChild(slot);
      covers.set(a, slot);
    });
    document.body.appendChild(floater);
    gsap.ticker.add(follow);
  }

  function follow(_, deltaMs) {
    if (!floater) return;
    // The cover keeps to the right part of the list (never over the names), only following the
    // pointer up and down.
    const ir = index.getBoundingClientRect();
    tx = ir.right - floater.offsetWidth - 28; // right edge of the list (28 px is the CSS margin)
    const k = 1 - Math.pow(1 - 0.14, Math.min(deltaMs || 16, 50) / 16.67);
    const py = y;
    x += (tx - x) * k;
    y += (ty - y) * k;
    rot += (Math.max(-6, Math.min(6, (y - py) * 0.35)) - rot) * k;
    floater.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg)`;
  }

  function setActive(a) {
    if (active === a || !floater) return;
    if (active && covers.get(active)) covers.get(active).classList.remove('is-on');
    active = a;
    const slot = a && covers.get(a);
    if (slot) slot.classList.add('is-on');
    floater.classList.toggle('is-on', !!slot);
  }

  index.addEventListener('pointermove', (e) => {
    if (e.pointerType !== 'mouse') return;
    tx = e.clientX; ty = e.clientY;
    const a = e.target.closest('a');
    if (!a) { setActive(null); return; }
    if (!floater) build();
    if (!on) { on = true; const ir = index.getBoundingClientRect(); x = ir.right - floater.offsetWidth - 28; y = ty; }
    setActive(a);
  }, { passive: true });
  index.addEventListener('pointerleave', () => { on = false; if (floater) setActive(null); });
  window.addEventListener('scroll', () => { if (on && floater) setActive(null); on = false; }, { passive: true });
}

function escapeHtml(s) {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}
