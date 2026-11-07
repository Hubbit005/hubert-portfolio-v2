/* "Play roulette" (task 12): a European roulette inside the 3D word in the hero.
   The wheel lives in the hero's three.js scene (hero.js calls attach() with its controls); this module
   owns the bet form, the coins, the small chart, the result card and the announcements.
   Bet: one number (pays 35:1) or a colour (red/black, 1:1), stake 10, 50 or 100 coins. The result is
   the pocket where the chrome ball really stopped (hero.js). Coins start at 1000 and are kept in
   localStorage with the win/loss count; at 0 coins "Get 1000 coins" starts again.
   Without WebGL or with reduced motion there is no wheel: Spin shows a random pocket at once.
   A small "Sound on/off" toggle (aria-pressed) mutes the ball's sound. */

const tr = (k, v) => (window.i18n ? window.i18n.t(k, v) : k);
// pockets in the order of the European wheel, and the red numbers
export const ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
export const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const colour = (n) => (n === 0 ? 'green' : RED.has(n) ? 'red' : 'black');
const KEY = 'roulette', START = 1000;

export function initRoulette({ gsap } = {}) {
  const hero = document.getElementById('home');
  const trigger = document.getElementById('roulette-open');
  const ui = document.getElementById('roulette');
  if (!hero || !trigger || !ui) return { attach() {} };
  const $ = (id) => document.getElementById(id);
  const bar = $('roulette-bar'), spinBtn = $('roulette-spin'), status = $('roulette-status');
  const card = $('roulette-card'), numEl = $('roulette-num'), outEl = $('roulette-outcome');
  const form = $('roulette-bet'), grid = $('roulette-grid'), coinsEl = $('roulette-coins'), resetBtn = $('roulette-reset');
  const bars = { wins: $('roulette-wins'), losses: $('roulette-losses') };

  // the table: 0 on the left over three rows, then 12 columns (3 on top … 1 at the bottom)
  for (let n = 0; n <= 36; n++) {
    const l = document.createElement('label');
    l.className = `roulette__cell is-${colour(n)}`;
    l.style.gridArea = n ? `${3 - ((n - 1) % 3)} / ${Math.ceil(n / 3) + 1}` : '1 / 1 / 4 / 2';
    l.innerHTML = `<input type="radio" name="pick" value="${n}"><span>${n}</span>`;
    grid.appendChild(l);
  }

  let s = { coins: START, wins: 0, losses: 0 };
  try { s = { ...s, ...JSON.parse(localStorage.getItem(KEY)) }; } catch (e) { /* none or blocked */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* blocked */ } };
  const shown = { v: s.coins };
  const showCoins = () => {
    const set = () => { coinsEl.textContent = Math.round(shown.v); };
    if (gsap && !reduced()) gsap.to(shown, { v: s.coins, duration: 0.8, ease: 'power2.out', onUpdate: set, overwrite: true });
    else { shown.v = s.coins; set(); }
  };
  const reduced = () => !wheel || matchMedia('(prefers-reduced-motion: reduce)').matches;
  function showStats() {
    showCoins();
    const max = Math.max(1, s.wins, s.losses);
    for (const k of ['wins', 'losses']) {
      bars[k].style.setProperty('--h', (s[k] / max).toFixed(3));
      bars[k].querySelector('.roulette__tip').textContent = s[k];
    }
    resetBtn.hidden = s.coins > 0;
    // stakes above the balance cannot be chosen
    let ok = null;
    form.querySelectorAll('input[name="stake"]').forEach((r) => { r.disabled = +r.value > s.coins; if (!r.disabled) ok = r; });
    const cur = form.querySelector('input[name="stake"]:checked');
    if ((!cur || cur.disabled) && ok) ok.checked = true;
    spinBtn.setAttribute('aria-disabled', String(spinning || s.coins <= 0));
  }

  let wheel = null, isOpen = false, fallback = false, spinning = false, bet = null, last = null;
  const say = (t) => { status.textContent = ''; requestAnimationFrame(() => { status.textContent = t; }); };
  const readBet = () => {
    const pick = form.elements.pick.value, stake = +form.elements.stake.value;
    return { pick, stake: Math.min(stake, s.coins) };
  };

  function setSpinning(on) {
    spinning = on;
    ui.classList.toggle('is-spinning', on);
    form.querySelectorAll('fieldset').forEach((f) => { f.disabled = on; });
    showStats();
  }
  const resultText = (n, win, amount) => `${n}${n ? ` ${tr(`roulette.${colour(n)}`)}` : ''}. ${tr(win ? 'roulette.win' : 'roulette.lose')} ${win ? '+' : '−'}${amount}`;

  function showResult(n) {
    const b = bet || readBet();
    bet = null;
    const win = b.pick === String(n) || b.pick === colour(n);
    const amount = win ? b.stake * (/^\d+$/.test(b.pick) ? 35 : 1) : b.stake;
    s.coins = Math.max(0, s.coins + (win ? amount : -amount));
    s[win ? 'wins' : 'losses']++;
    save();
    last = { n, win, amount };
    setSpinning(false);
    renderCard();
    bar.hidden = true; card.hidden = false;
    card.classList.remove('is-in'); void card.offsetWidth; card.classList.add('is-in');
    say(resultText(n, win, amount));
    $('roulette-again').focus({ preventScroll: true });
  }
  function renderCard() {
    if (!last) return;
    const { n, win, amount } = last;
    numEl.innerHTML = `<span class="roulette__dot is-${colour(n)}" aria-hidden="true"></span>${n}${n ? ` · ${tr(`roulette.${colour(n)}`)}` : ''}`;
    outEl.textContent = `${tr(win ? 'roulette.win' : 'roulette.lose')} ${win ? '+' : '−'}${amount}`;
    card.classList.toggle('is-win', win);
  }
  function hideResult() {
    if (!card.hidden && card.contains(document.activeElement)) spinBtn.focus({ preventScroll: true });
    card.hidden = true; bar.hidden = false;
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
    hideResult(); showStats();
    if (!fallback) wheel.open();
    say(tr('roulette.hint'));
    spinBtn.focus({ preventScroll: true });
  }
  function close() {
    if (!isOpen) return;
    isOpen = false;
    bet = null;
    setSpinning(false);
    hero.classList.remove('is-roulette', 'is-roulette-fb');
    trigger.setAttribute('aria-expanded', 'false');
    ui.hidden = true; card.hidden = true;
    if (wheel && !fallback) wheel.close();
    trigger.focus({ preventScroll: true });
  }
  function spin() {
    if (spinning || s.coins <= 0) return;
    if (fallback) { showResult(Math.floor(Math.random() * 37)); return; }
    hideResult();
    bet = readBet();
    wheel.spin();
  }

  trigger.addEventListener('click', () => (isOpen ? close() : open()));
  spinBtn.addEventListener('click', spin);
  $('roulette-again').addEventListener('click', () => { hideResult(); spin(); });
  $('roulette-back').addEventListener('click', close);
  $('roulette-back2').addEventListener('click', close);
  resetBtn.addEventListener('click', () => { s = { coins: START, wins: 0, losses: 0 }; save(); showStats(); spinBtn.focus({ preventScroll: true }); });
  // tap on a bar shows its number (hover and focus do it in CSS)
  Object.values(bars).forEach((b) => b.addEventListener('click', () => b.classList.toggle('is-tip')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen) { e.preventDefault(); close(); } });
  document.addEventListener('langchange', renderCard);
  shown.v = s.coins; coinsEl.textContent = s.coins; showStats();

  // Sound on/off (only with the 3D wheel, which makes the sound): a real toggle button
  let soundBtn = null;
  function soundButton(sound) {
    soundBtn = document.createElement('button');
    soundBtn.type = 'button';
    soundBtn.className = 'roulette__sound mono';
    const label = () => { soundBtn.textContent = tr('roulette.sound'); soundBtn.setAttribute('aria-pressed', String(!sound.muted)); };
    label();
    soundBtn.addEventListener('click', () => { sound.muted = !sound.muted; if (!sound.muted) sound.wake(); label(); });
    document.addEventListener('langchange', label);
    ui.appendChild(soundBtn);
  }

  return {
    attach(api) {
      wheel = api;
      if (api.sound && !soundBtn) soundButton(api.sound);
      // a fling of the wheel starts a spin too: the bet is taken then
      api.onSpinStart = () => { hideResult(); if (!bet) bet = readBet(); setSpinning(true); say(tr('roulette.spinning')); };
      api.onResult = (i) => { if (isOpen) showResult(ORDER[i]); };
    },
  };
}
