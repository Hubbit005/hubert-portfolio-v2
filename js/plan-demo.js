/* Training plan demo (section #training-plans): a working mini phone next to the text, built after
   the two screenshots (which stay as they are). Everything inside is sample data and labelled so
   ("Demo · sample data"); the numbers in it are only interface state.
     1. plan overview: Client A, sample goal, level, duration, progress ring, day cards;
     2. a day → this month's calendar, pick a date;
     3. the date → the day's exercises with checkboxes;
     4. ticking fills the ring; a finished day gets a mark on the overview;
     5. "Back" on the inner screens; screens slide and fade (instant with reduced motion).
   State lives in memory only (a reload starts over). Real buttons and checkboxes, the keyboard works,
   focus moves to the new screen's heading and an aria-live line names it. No JS: the screenshots only.
   Strings: js/i18n.js (demo.*). Colours: the client template's, as tokens (--demo-*). */

const t = (k, v) => (window.i18n ? window.i18n.t(k, v) : k);
const lang = () => (window.i18n ? window.i18n.lang() : 'en');
const locale = () => (lang() === 'pl' ? 'pl-PL' : 'en-GB');

const DAYS = [
  { title: 'demo.d1', ex: [['demo.squat', '3 × 10'], ['demo.lunge', '3 × 8'], ['demo.bridge', '3 × 12'], ['demo.plank', '3 × 30 s']] },
  { title: 'demo.d2', ex: [['demo.pushup', '3 × 10'], ['demo.row', '3 × 10'], ['demo.press', '3 × 8'], ['demo.plank', '3 × 30 s']] },
  { title: 'demo.d3', ex: [['demo.squat', '3 × 8'], ['demo.pushup', '3 × 8'], ['demo.row', '3 × 8'], ['demo.plank', '2 × 40 s']] },
];

export function initPlanDemo({ reduced, gsap }) {
  const host = document.querySelector('#training-plans .case__split-text');
  if (!host) return;
  const state = {
    days: DAYS.map((d) => ({ ...d, done: d.ex.map(() => false), date: null })),
    view: 'plan', day: 0, shownP: 0, month: (() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1); })(),
  };

  const root = document.createElement('div');
  root.className = 'pd';
  root.innerHTML = `
    <p class="pd__label mono"></p>
    <div class="pd__phone">
      <div class="pd__screen"></div>
    </div>
    <p class="sr-only" aria-live="polite"></p>`;
  host.appendChild(root);
  const label = root.querySelector('.pd__label');
  const screenEl = root.querySelector('.pd__screen');
  const live = root.querySelector('[aria-live]');

  /* ---------- Helpers ---------- */
  const doneCount = () => state.days.reduce((n, d) => n + d.done.filter(Boolean).length, 0);
  const totalCount = () => state.days.reduce((n, d) => n + d.ex.length, 0);
  const dayDone = (d) => d.done.every(Boolean);
  const fmt = (date, o) => new Intl.DateTimeFormat(locale(), o).format(date);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const tag = (i) => `<span class="pd__tag">${esc(t('demo.day', { n: i + 1 }))}</span>`;
  const ringStyle = (p) => {
    const a = Math.min(p, 0.5) * 360, b = Math.max(0, p - 0.5) * 360;
    return [`transform: rotate(${a.toFixed(1)}deg)`, `transform: rotate(${b.toFixed(1)}deg)`];
  };

  /* ---------- Screens ---------- */
  function planHTML() {
    const p = doneCount() / totalCount();
    const [ra, rb] = ringStyle(state.shownP); // drawn at the last value, then filled (show())
    const daysDone = state.days.filter(dayDone).length;
    return `
      <div class="pd__top">
        <p class="pd__kicker">${esc(t('demo.kicker'))}</p>
        <h4 class="pd__title" tabindex="-1">Client A</h4>
        <p class="pd__muted">${esc(t('demo.goal'))}</p>
      </div>
      <div class="pd__stats">
        <div class="pd__stat"><span class="pd__stat-k">${esc(t('demo.level'))}</span><b>${esc(t('demo.levelV'))}</b></div>
        <div class="pd__stat"><span class="pd__stat-k">${esc(t('demo.dur'))}</span><b>${esc(t('demo.durV'))}</b></div>
      </div>
      <div class="pd__card pd__progress">
        <div class="pd-ring" aria-hidden="true">
          <i class="pd-ring__half pd-ring__half--r"><i class="pd-ring__arc" style="${ra}"></i></i>
          <i class="pd-ring__half pd-ring__half--l"><i class="pd-ring__arc" style="${rb}"></i></i>
          <span class="pd-ring__val"><b>${Math.round(p * 100)}%</b><small>${esc(t('demo.ofPlan'))}</small></span>
        </div>
        <div class="pd__bars">
          <div class="pd__bar-row"><span>${esc(t('demo.workouts'))}</span><b>${daysDone} / ${state.days.length}</b></div>
          <div class="pd__bar" aria-hidden="true"><i style="transform: scaleX(${(daysDone / state.days.length).toFixed(3)})"></i></div>
          <div class="pd__bar-row"><span>${esc(t('demo.exercises'))}</span><b>${doneCount()} / ${totalCount()}</b></div>
          <div class="pd__bar" aria-hidden="true"><i style="transform: scaleX(${p.toFixed(3)})"></i></div>
        </div>
      </div>
      <ul class="pd__days">
        ${state.days.map((d, i) => `
          <li><button class="pd__day${dayDone(d) ? ' is-done' : ''}" type="button" data-day="${i}">
            ${tag(i)}
            <span class="pd__day-title">${esc(t(d.title))}</span>
            <span class="pd__muted">${esc(t('demo.count', { n: d.ex.length }))}${d.date ? ' · ' + esc(fmt(d.date, { day: 'numeric', month: 'short' })) : ''}</span>
            ${dayDone(d) ? `<span class="pd__check" aria-hidden="true"></span><span class="sr-only">, ${esc(t('demo.doneBadge'))}</span>` : ''}
          </button></li>`).join('')}
      </ul>`;
  }

  function calHTML() {
    const d = state.days[state.day];
    const m = state.month;
    const first = (m.getDay() + 6) % 7; // Monday first
    const len = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
    const wd = [...Array(7)].map((_, i) => fmt(new Date(2024, 0, 1 + i), { weekday: 'short' }).replace('.', ''));
    let cells = '';
    for (let i = 0; i < first; i++) cells += '<span class="pd__cell is-off" aria-hidden="true"></span>';
    for (let n = 1; n <= len; n++) {
      const date = new Date(m.getFullYear(), m.getMonth(), n);
      const sel = d.date && d.date.getTime() === date.getTime();
      cells += `<button class="pd__cell${sel ? ' is-sel' : ''}" type="button" data-date="${n}" aria-pressed="${sel}" aria-label="${esc(fmt(date, { weekday: 'long', day: 'numeric', month: 'long' }))}">${n}</button>`;
    }
    return `
      <div class="pd__head">
        <button class="pd__back" type="button" data-back="plan">${esc(t('demo.back'))}</button>
        <h4 class="pd__h" tabindex="-1">${tag(state.day)} ${esc(t(d.title))}</h4>
      </div>
      <div class="pd__card">
        <p class="pd__strong">${esc(t('demo.pick'))}</p>
        <p class="pd__muted">${esc(t('demo.pickHint'))}</p>
        <div class="pd__month">
          <b>${esc(fmt(m, { month: 'long', year: 'numeric' }))}</b>
          <span>
            <button class="pd__arrow" type="button" data-month="-1" aria-label="${esc(t('demo.prev'))}">‹</button>
            <button class="pd__arrow" type="button" data-month="1" aria-label="${esc(t('demo.next'))}">›</button>
          </span>
        </div>
        <div class="pd__grid">
          ${wd.map((w) => `<span class="pd__wd" aria-hidden="true">${esc(w)}</span>`).join('')}
          ${cells}
        </div>
      </div>`;
  }

  function exHTML() {
    const d = state.days[state.day];
    const n = d.done.filter(Boolean).length;
    return `
      <div class="pd__head">
        <button class="pd__back" type="button" data-back="cal">${esc(t('demo.back'))}</button>
        <h4 class="pd__h" tabindex="-1">${tag(state.day)} ${esc(t(d.title))}</h4>
      </div>
      <p class="pd__muted pd__date">${esc(fmt(d.date, { weekday: 'long', day: 'numeric', month: 'long' }))}</p>
      <div class="pd__card">
        <div class="pd__bar-row"><span>${esc(t('demo.exercises'))}</span><b>${n} / ${d.ex.length}</b></div>
        <div class="pd__bar" aria-hidden="true"><i style="transform: scaleX(${(n / d.ex.length).toFixed(3)})"></i></div>
        <ul class="pd__ex">
          ${d.ex.map(([k, sets], i) => `
            <li><label class="pd__exrow">
              <input type="checkbox" data-ex="${i}"${d.done[i] ? ' checked' : ''}>
              <span class="pd__box" aria-hidden="true"></span>
              <span class="pd__exname">${esc(t(k))}</span>
              <span class="pd__sets">${esc(sets)}</span>
            </label></li>`).join('')}
        </ul>
      </div>
      <p class="pd__finish" ${dayDone(d) ? '' : 'hidden'}>${esc(t('demo.dayDone'))}</p>
      <button class="pd__primary" type="button" data-back="plan">${esc(t('demo.toPlan'))}</button>`;
  }

  const VIEWS = { plan: planHTML, cal: calHTML, ex: exHTML };
  const ORDER = { plan: 0, cal: 1, ex: 2 };

  /* ---------- Show a screen (slide + fade) ---------- */
  let current = null;
  function show(view, { focus = true, dir = 0 } = {}) {
    state.view = view;
    const next = document.createElement('div');
    next.className = `pd__view pd__view--${view}`;
    next.innerHTML = VIEWS[view]();
    const prev = current;
    current = next;
    screenEl.appendChild(next);
    const animate = !reduced && gsap && prev && dir;
    if (animate) {
      gsap.fromTo(next, { xPercent: 28 * dir, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.42, ease: 'power3.out' });
      gsap.to(prev, { xPercent: -18 * dir, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: () => prev.remove() });
    } else prev?.remove();
    if (view === 'plan') {
      // the ring and the bar fill from the last value shown to the new one (transforms only)
      const p = doneCount() / totalCount();
      const arcs = next.querySelectorAll('.pd-ring__arc');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const [ra, rb] = ringStyle(p);
        arcs[0].style.cssText = ra; arcs[1].style.cssText = rb;
      }));
      state.shownP = p;
    }
    if (focus) {
      const h = next.querySelector('[tabindex="-1"]');
      h?.focus({ preventScroll: true });
      live.textContent = h ? h.textContent.replace(/\s+/g, ' ').trim() : '';
    }
  }
  const go = (view) => show(view, { dir: ORDER[view] >= ORDER[state.view] ? 1 : -1 });

  /* ---------- Events (delegated) ---------- */
  screenEl.addEventListener('click', (e) => {
    const el = e.target.closest('button');
    if (!el || !current?.contains(el)) return;
    if (el.dataset.day != null) {
      state.day = +el.dataset.day;
      const d = state.days[state.day].date;
      if (d) state.month = new Date(d.getFullYear(), d.getMonth(), 1);
      go('cal');
    } else if (el.dataset.month) {
      state.month = new Date(state.month.getFullYear(), state.month.getMonth() + +el.dataset.month, 1);
      show('cal', { dir: 0, focus: false });
      current.querySelector(`[data-month="${el.dataset.month}"]`)?.focus();
    } else if (el.dataset.date) {
      state.days[state.day].date = new Date(state.month.getFullYear(), state.month.getMonth(), +el.dataset.date);
      go('ex');
    } else if (el.dataset.back) go(el.dataset.back);
  });
  screenEl.addEventListener('change', (e) => {
    const box = e.target.closest('input[data-ex]');
    if (!box) return;
    const d = state.days[state.day];
    d.done[+box.dataset.ex] = box.checked;
    const n = d.done.filter(Boolean).length;
    // update in place, so focus stays on the checkbox
    current.querySelector('.pd__bar-row b').textContent = `${n} / ${d.ex.length}`;
    current.querySelector('.pd__bar i').style.transform = `scaleX(${(n / d.ex.length).toFixed(3)})`;
    const fin = current.querySelector('.pd__finish');
    const wasHidden = fin.hidden;
    fin.hidden = !dayDone(d);
    if (wasHidden && !fin.hidden) live.textContent = fin.textContent;
  });

  function setLabels() {
    label.textContent = t('demo.label');
    show(state.view, { focus: false });
  }
  document.addEventListener('langchange', () => { if (current) setLabels(); else label.textContent = t('demo.label'); });
  label.textContent = t('demo.label');
  // The phone has a fixed height from the start; its first screen is drawn when it comes near the
  // screen, so the page start stays light.
  const nearIO = new IntersectionObserver(([en]) => {
    if (!en.isIntersecting) return;
    nearIO.disconnect();
    show('plan', { focus: false });
  }, { rootMargin: '600px 0px' });
  nearIO.observe(root);
}
