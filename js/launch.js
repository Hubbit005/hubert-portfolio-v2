/* Launch intro (task 15): a full-screen overlay (#launch) over the page, once per session.
   The head script in index.html adds html.intro (motion allowed, no anchor in the address, not seen
   in this session); without it, or without JS, there is no overlay. While it shows, the page under it
   is inert and Lenis is stopped. Only the LAUNCH button starts it (click, tap, Enter, Space): a 3-2-1
   count on the button over the ignition, the launch clip with its sound, a crossfade into the arrival
   clip through the nebula, then the overlay fades into the hero, whose background is the arrival's
   last frame. "Skip intro" and Esc go straight to the hero. The clips start loading after the first
   paint (the poster is the first image); portrait screens get the 9:16 files. */
const KEY = 'launched';
const XF = 0.35;     // crossfade between the clips, s (the clips share that frame)
const OUT = 0.7;     // the overlay fades into the hero over the arrival's last part, s

export function initLaunch({ lenis, gsap }) {
  const doc = document.documentElement;
  const root = document.getElementById('launch');
  if (!root) return;
  if (!doc.classList.contains('intro')) { root.remove(); return; }

  const t = (k) => (window.i18n ? window.i18n.t(k) : k);
  const btn = document.getElementById('launch-btn');
  const skip = document.getElementById('launch-skip');
  const mute = document.getElementById('launch-mute');
  const count = btn.querySelector('.launch__count');
  const go = document.getElementById('launch-go');
  const arrive = document.getElementById('launch-arrive');

  const others = [...document.body.children].filter((el) => el !== root && el.tagName !== 'SCRIPT');
  others.forEach((el) => { el.inert = true; });
  lenis?.stop();
  btn.focus({ preventScroll: true });

  /* ---------- Clips: loaded after the first paint ---------- */
  const portrait = matchMedia('(max-aspect-ratio: 1/1)').matches;
  // WebM only where the browser is sure (Safari gets the MP4)
  const ext = go.canPlayType('video/webm; codecs="vp9, opus"') === 'probably' ? 'webm' : 'mp4';
  let loaded = false;
  const load = () => {
    if (loaded) return; loaded = true;
    [go, arrive].forEach((v) => { v.src = `${v.dataset.src}${portrait ? '-m' : ''}.${ext}`; v.preload = 'auto'; v.load(); });
  };
  if (document.readyState === 'complete') setTimeout(load, 0);
  else window.addEventListener('load', () => setTimeout(load, 0), { once: true });
  [go, arrive].forEach((v) => {
    v.addEventListener('playing', () => { if (v === go || arriving) v.classList.add('is-on'); });
    v.addEventListener('error', () => { if (started) finish(); });
  });

  /* ---------- Sound ---------- */
  let muted = false;
  const setMute = (m) => {
    muted = m;
    go.muted = arrive.muted = m;
    mute.setAttribute('aria-label', t(m ? 'launch.unmute' : 'launch.mute'));
    mute.classList.toggle('is-muted', m);
  };
  setMute(false);
  mute.addEventListener('click', () => setMute(!muted));
  const onLang = () => setMute(muted);
  document.addEventListener('langchange', onLang);

  /* ---------- Start (the button only) ---------- */
  let started = false, done = false, arriving = false, iv = 0, guard = 0;
  // A clip started outside the click may be refused with sound (iOS): then it plays muted.
  const play = (v) => v.play().catch(() => { v.muted = true; return v.play(); });
  btn.addEventListener('click', () => {
    if (started) return;
    started = true;
    load();
    root.classList.add('is-go');
    play(go).catch(() => finish());
    // unlock the second clip inside the click as well, so it may start with sound later
    arrive.play().then(() => { if (!arriving) { arrive.pause(); arrive.currentTime = 0; } }).catch(() => {});
    let n = 3;
    count.textContent = String(n);
    iv = setInterval(() => {
      n -= 1;
      if (n > 0) { count.textContent = String(n); return; }
      clearInterval(iv);
      root.classList.add('is-flying');
      skip.focus({ preventScroll: true });
    }, 400);
    gsap.ticker.add(tick);
    guard = setTimeout(() => finish(), 16000); // stuck on a slow network: go to the hero anyway
  });

  function tick() {
    if (!arriving && go.duration && (go.ended || go.currentTime >= go.duration - XF)) {
      arriving = true;
      arrive.currentTime = 0;
      arrive.muted = muted;
      play(arrive).catch(() => finish());
    }
    if (arriving && arrive.duration && arrive.currentTime >= arrive.duration - OUT) finish();
  }

  /* ---------- End: into the hero ---------- */
  function finish(fast = false) {
    if (done) return;
    done = true;
    clearInterval(iv); clearTimeout(guard);
    gsap.ticker.remove(tick);
    document.removeEventListener('keydown', onKey);
    document.removeEventListener('langchange', onLang);
    try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* storage blocked: the intro shows again next time */ }
    others.forEach((el) => { el.inert = false; });
    doc.classList.add('launched'); // the hero comes out of the nebula (css/main.css, js/hero.js)
    root.classList.add('is-out');
    root.style.setProperty('--out', `${fast ? 0.3 : OUT}s`);
    const title = document.getElementById('hero-title');
    if (title) { title.tabIndex = -1; title.focus({ preventScroll: true }); }
    setTimeout(() => {
      [go, arrive].forEach((v) => { v.pause(); v.removeAttribute('src'); v.load(); });
      root.remove();
      doc.classList.remove('intro');
      lenis?.start();
    }, (fast ? 0.3 : OUT) * 1000 + 50);
  }
  skip.addEventListener('click', () => finish(true));
  const onKey = (e) => { if (e.key === 'Escape') finish(true); };
  document.addEventListener('keydown', onKey);
}
