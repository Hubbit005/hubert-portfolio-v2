/* Roulette sound, made in code (Web Audio, no files): a rolling hiss whose loudness and pitch follow
   the ball's speed, a short tick when the ball hits a fret, and a quiet click when it stops.
   The audio context is only created on a user gesture (the first Spin or a fling of the wheel).
   Muted state is kept in localStorage ('rouletteSound'); the button lives in js/roulette.js. */

export function createRouletteSound() {
  let ctx = null, master = null, rollGain = null, rollFilter = null;
  let muted = false;
  try { muted = localStorage.getItem('rouletteSound') === 'off'; } catch (e) { /* storage blocked */ }

  function ensure() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return true; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.25; // about −12 dB
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    // rolling: looped noise → band-pass → gain (follows the speed)
    const len = ctx.sampleRate * 2;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let b0 = 0;
    for (let i = 0; i < len; i++) { b0 = 0.97 * b0 + 0.03 * (Math.random() * 2 - 1); d[i] = b0 * 6 + (Math.random() * 2 - 1) * 0.08; }
    const src = ctx.createBufferSource();
    src.buffer = buf; src.loop = true;
    rollFilter = ctx.createBiquadFilter();
    rollFilter.type = 'bandpass'; rollFilter.frequency.value = 700; rollFilter.Q.value = 0.9;
    rollGain = ctx.createGain(); rollGain.gain.value = 0;
    src.connect(rollFilter).connect(rollGain).connect(master);
    src.start();
    return true;
  }

  return {
    get muted() { return muted; },
    set muted(m) {
      muted = !!m;
      try { localStorage.setItem('rouletteSound', muted ? 'off' : 'on'); } catch (e) { /* storage blocked */ }
      if (master) master.gain.setTargetAtTime(muted ? 0 : 0.25, ctx.currentTime, 0.05);
    },
    /** call from a click / pointer gesture */
    wake() { return ensure(); },
    /** s: ball speed relative to the surface, 0…1 */
    roll(s) {
      if (!ctx || !rollGain) return;
      const t = ctx.currentTime;
      const v = Math.max(0, Math.min(1, s));
      rollGain.gain.setTargetAtTime(v * v * 0.9, t, 0.06);
      rollFilter.frequency.setTargetAtTime(380 + v * 1900, t, 0.08);
    },
    /** a fret hit; k: strength 0…1 */
    tick(k = 0.6) {
      if (!ctx || muted) return;
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(2200 + Math.random() * 900, t);
      o.frequency.exponentialRampToValueAtTime(900, t + 0.05);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.5 * Math.max(0.15, k), t + 0.003);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);
      o.connect(g).connect(master);
      o.start(t); o.stop(t + 0.08);
    },
    /** the ball comes to rest */
    click() {
      if (!ctx || muted) return;
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(1300, t);
      o.frequency.exponentialRampToValueAtTime(500, t + 0.06);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.18, t + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      o.connect(g).connect(master);
      o.start(t); o.stop(t + 0.14);
    },
    silence() { if (rollGain && ctx) rollGain.gain.setTargetAtTime(0, ctx.currentTime, 0.05); },
  };
}
