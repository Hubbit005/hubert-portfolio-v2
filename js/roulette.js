/* "Spin my work": a project roulette inside the 3D word in the hero.
   This module owns the buttons, the result card and the announcements.
   The wheel itself lives in the hero's three.js scene (hero.js calls attach() with its controls).
   Without WebGL or with reduced motion the same button opens a simple panel that draws a project
   at random, without the wheel animation, and shows the same result card.
   With the 3D wheel the result is the pocket where the chrome ball stopped (hero.js); a small
   "Sound on/off" toggle (aria-pressed) mutes the ball's sound. */

// Names, wheel labels and categories follow the page language (js/i18n.js, keys p.<id>.*).
const tr = (k, v) => (window.i18n ? window.i18n.t(k, v) : k);
const project = (id, img, href) => ({
  id, img, href,
  get name() { return tr(`p.${id}.name`); },
  get label() { return tr(`p.${id}.label`); },
  get cat() { return tr(`p.${id}.cat`); },
});
export const PROJECTS = [
  project('basko', 'assets/cards/basko', '#basko-clean'),
  project('ksk', 'assets/cards/ksk', '#ksk-pretor'),
  project('ak', 'assets/cards/ak', '#ksk-3d-model'),
  project('living', 'assets/cards/living', '#livingroom'),
  project('psy', null, '#psychologist-site'),
  project('training', 'assets/cards/training', '#training-plans'),
];

export function initRoulette() {
  const hero = document.getElementById('home');
  const trigger = document.getElementById('roulette-open');
  const ui = document.getElementById('roulette');
  if (!hero || !trigger || !ui) return { attach() {} };
  const bar = document.getElementById('roulette-bar');
  const spinBtn = document.getElementById('roulette-spin');
  const backBtn = document.getElementById('roulette-back');
  const status = document.getElementById('roulette-status');
  const card = document.getElementById('roulette-card');
  const cover = document.getElementById('roulette-cover');
  const nameEl = document.getElementById('roulette-name');
  const catEl = document.getElementById('roulette-cat');
  const goBtn = document.getElementById('roulette-go');
  const againBtn = document.getElementById('roulette-again');
  const back2Btn = document.getElementById('roulette-back2');
  const hint = ui.querySelector('.roulette__hint');

  let wheel = null;      // 3D controls from hero.js, when WebGL runs
  let isOpen = false;
  let fallback = false;
  let spinning = false;
  let lastPick = -1;

  const say = (t) => { status.textContent = ''; requestAnimationFrame(() => { status.textContent = t; }); };

  function setSpinning(on) {
    spinning = on;
    spinBtn.setAttribute('aria-disabled', String(on));
    ui.classList.toggle('is-spinning', on);
  }

  function showResult(i) {
    const p = PROJECTS[i];
    if (!p) return;
    lastPick = i;
    setSpinning(false);
    cover.innerHTML = p.img
      ? `<picture><source type="image/webp" srcset="${p.img}.webp"><img src="${p.img}.jpg" alt="" width="600" height="800" decoding="async"></picture>`
      : `<span class="roulette__type" aria-hidden="true">${tr('roulette.typeCover')}</span>`;
    cover.classList.toggle('is-type', !p.img);
    nameEl.textContent = p.name;
    catEl.textContent = p.cat;
    goBtn.setAttribute('href', p.href);
    bar.hidden = true;
    card.hidden = false;
    card.classList.remove('is-in'); void card.offsetWidth; card.classList.add('is-in');
    say(tr('roulette.result', { name: p.name, cat: p.cat }));
    goBtn.focus({ preventScroll: true });
  }

  function hideResult() {
    if (!card.hidden && card.contains(document.activeElement)) spinBtn.focus({ preventScroll: true });
    card.hidden = true;
    bar.hidden = false;
  }

  function open() {
    if (isOpen) return;
    isOpen = true;
    fallback = !wheel;
    ui.hidden = false;
    ui.classList.toggle('is-fallback', fallback);
    hero.classList.add('is-roulette');
    hero.classList.toggle('is-roulette-fb', fallback);
    trigger.setAttribute('aria-expanded', 'true');
    hideResult();
    if (fallback) {
      hint.textContent = tr('roulette.hintRandom');
      draw();
    } else {
      hint.textContent = tr('roulette.hintWheel');
      wheel.open();
      say(tr('roulette.opened'));
      spinBtn.focus({ preventScroll: true });
    }
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    setSpinning(false);
    hero.classList.remove('is-roulette', 'is-roulette-fb');
    trigger.setAttribute('aria-expanded', 'false');
    ui.hidden = true;
    card.hidden = true;
    if (wheel && !fallback) wheel.close();
    trigger.focus({ preventScroll: true });
  }

  // Fallback: draw a project at once, never the same one twice in a row.
  function draw() {
    let i = Math.floor(Math.random() * PROJECTS.length);
    if (i === lastPick) i = (i + 1 + Math.floor(Math.random() * (PROJECTS.length - 1))) % PROJECTS.length;
    showResult(i);
  }

  function spin() {
    if (spinning) return;
    if (fallback) { draw(); return; }
    hideResult();
    wheel.spin();
  }

  trigger.addEventListener('click', () => (isOpen ? close() : open()));
  spinBtn.addEventListener('click', spin);
  againBtn.addEventListener('click', spin);
  backBtn.addEventListener('click', close);
  back2Btn.addEventListener('click', close);
  // Opening a project leaves the roulette; main.js scrolls to the case study.
  goBtn.addEventListener('click', () => {
    isOpen = false;
    hero.classList.remove('is-roulette', 'is-roulette-fb');
    trigger.setAttribute('aria-expanded', 'false');
    ui.hidden = true;
    card.hidden = true;
    if (wheel && !fallback) wheel.close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) { e.preventDefault(); close(); }
  });
  // Language switch while the roulette is open: rewrite the hint and the result card.
  hint.textContent = tr('roulette.hintWheel');
  document.addEventListener('langchange', () => {
    hint.textContent = tr(fallback && isOpen ? 'roulette.hintRandom' : 'roulette.hintWheel');
    const p = PROJECTS[lastPick];
    if (p && !card.hidden) {
      nameEl.textContent = p.name;
      catEl.textContent = p.cat;
      if (!p.img) cover.innerHTML = `<span class="roulette__type" aria-hidden="true">${tr('roulette.typeCover')}</span>`;
    }
  });

  // Sound on/off (only with the 3D wheel, which makes the sound): a real toggle button
  let soundBtn = null;
  function soundButton(sound) {
    soundBtn = document.createElement('button');
    soundBtn.type = 'button';
    soundBtn.className = 'roulette__sound mono';
    const label = () => {
      soundBtn.textContent = tr('roulette.sound');
      soundBtn.setAttribute('aria-pressed', String(!sound.muted));
    };
    label();
    soundBtn.addEventListener('click', () => { sound.muted = !sound.muted; if (!sound.muted) sound.wake(); label(); });
    document.addEventListener('langchange', label);
    ui.appendChild(soundBtn);
  }

  return {
    attach(api) {
      wheel = api;
      if (api.sound && !soundBtn) soundButton(api.sound);
      api.onSpinStart = () => { hideResult(); setSpinning(true); say(tr('roulette.spinning')); };
      api.onResult = (i) => { if (isOpen) showResult(i); };
    },
  };
}
