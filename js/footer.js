/* Footer: the end of the page.
     Curtain: the contact section (with the footer) is sticky at the bottom of the CV + contact
       wrapper, under the CV, which has its own background and rounded bottom corners. At the end of
       the page the CV moves up like a curtain and uncovers it. Only when the whole contact section
       fits on the screen (otherwise its top could never be seen) and without reduced motion.
     Wordmark: a huge HUBERT across the screen (decorative, aria-hidden). Its letters rise from below
       one after another as the footer is uncovered; first only the outline, and at the very end of
       the page the accent fill wipes in (clip-path). Then it fires 'wordmarkready' and the letters
       can be thrown (js/letters.js).
     E-mail and phone: the text leans a little towards the pointer (fine pointer only).
     Back to top: a round button with a thin ring around it that shows the scroll progress (two
       rotating half rings: transforms only, no number). The click scrolls through Lenis (main.js).
   No JS or reduced motion: a normal footer, the word filled at once, everything visible. */

export function initFooter({ reduced, gsap }) {
  const curtain = document.getElementById('curtain');
  const contact = document.getElementById('contact');
  if (!contact) return;
  const doc = document.documentElement;
  const word = contact.querySelector('.wordmark');
  const fillLine = word?.querySelector('.wordmark__line--fill');
  const letters = word ? [...word.querySelectorAll('.wordmark__line > span')] : [];
  const halves = [...contact.querySelectorAll('.top-ring__arc')];

  /* ---------- Wordmark size: the word fills the width exactly ---------- */
  function fitWord() {
    if (!word) return;
    const line = word.querySelector('.wordmark__line--stroke');
    word.style.fontSize = '100px';
    const w = line.getBoundingClientRect().width;
    const cs = getComputedStyle(word);
    const target = word.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 2;
    if (w > 0 && target > 0) word.style.fontSize = `${Math.floor((100 * target) / w * 1000) / 1000}px`;
  }

  /* ---------- Curtain on/off: only when the contact section fits on the screen ---------- */
  let maxScroll = 1, contactH = 1;
  function measure() {
    fitWord();
    if (curtain && !reduced) {
      doc.classList.remove('has-curtain');
      const fits = contact.offsetHeight <= window.innerHeight - 8;
      doc.classList.toggle('has-curtain', fits);
    }
    maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
    contactH = Math.max(1, contact.offsetHeight);
  }
  measure();
  let rt = 0;
  const onResize = () => { clearTimeout(rt); rt = setTimeout(() => { measure(); update(true); }, 150); };
  window.addEventListener('resize', onResize);
  document.addEventListener('langchange', () => requestAnimationFrame(() => { measure(); update(true); }));
  window.addEventListener('load', () => { measure(); update(true); });
  if (window.ResizeObserver) new ResizeObserver(() => { maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight); }).observe(document.body);

  /* ---------- Letters and fill ---------- */
  const motion = !reduced && gsap && word;
  let lettersIn = !motion, lettersDone = false;
  if (motion) {
    gsap.set(letters, { yPercent: 105 });
    gsap.set(fillLine, { clipPath: 'inset(100% 0% 0% 0%)' });
    word.classList.add('is-animated');
  }

  /* ---------- Progress ring ---------- */
  let lastP = -1;
  function ring(p) {
    if (!halves.length || Math.abs(p - lastP) < 0.001) return;
    lastP = p;
    halves[0].style.transform = `rotate(${(Math.min(p, 0.5) * 360).toFixed(2)}deg)`;
    halves[1].style.transform = `rotate(${(Math.max(0, p - 0.5) * 360).toFixed(2)}deg)`;
  }

  let lastFill = -1;
  function update(force) {
    const y = window.scrollY;
    ring(Math.min(1, Math.max(0, y / maxScroll)));
    if (!motion) return;
    // How much of the contact section is uncovered: 0 when it starts to show, 1 at the very end.
    const shown = Math.min(1, Math.max(0, (y - (maxScroll - contactH)) / contactH));
    if (!lettersIn && shown > 0.3) {
      lettersIn = true;
      gsap.to(letters, { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: (i) => (i % 6) * 0.07, onComplete: () => { lettersDone = true; } });
    }
    const f = Math.min(1, Math.max(0, (y - (maxScroll - Math.min(contactH * 0.22, 160))) / Math.min(contactH * 0.22, 160)));
    if (word.dataset.ready) return; // the letters are physical now (js/letters.js): no more clipping
    if (force || Math.abs(f - lastFill) > 0.002) {
      lastFill = f;
      fillLine.style.clipPath = `inset(${((1 - f) * 100).toFixed(2)}% 0% 0% 0%)`;
    }
    // Fill done and letters up: the word may become physical (js/letters.js)
    if (f >= 1 && lettersDone) {
      word.dataset.ready = '1';
      fillLine.style.clipPath = 'none';
      document.dispatchEvent(new CustomEvent('wordmarkready'));
    }
  }
  if (gsap) gsap.ticker.add(() => update(false));
  else window.addEventListener('scroll', () => update(false), { passive: true });
  update(true);

  /* ---------- E-mail and phone lean towards the pointer ---------- */
  if (!reduced && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    contact.querySelectorAll('.contact__mail').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2 - (parseFloat(el.style.translate) || 0);
        const cy = r.top + r.height / 2 - (parseFloat((el.style.translate || '').split(' ')[1]) || 0);
        const dx = Math.max(-14, Math.min(14, (e.clientX - cx) * 0.06));
        const dy = Math.max(-8, Math.min(8, (e.clientY - cy) * 0.2));
        el.style.translate = `${dx.toFixed(1)}px ${dy.toFixed(1)}px`;
      });
      el.addEventListener('pointerleave', () => { el.style.translate = ''; });
    });
  }
}
