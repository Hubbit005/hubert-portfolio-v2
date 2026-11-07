/* Guitar sound for the guitar section (task 09), all made in code with Web Audio, no files.
   An ORIGINAL riff in the spirit of 80s rock (not any existing song or its motif): power-chord chugs
   and a single-note phrase in E minor pentatonic, 120 BPM, about 14 s.
   Strings: Karplus-Strong (a short noise burst in a feedback delay line with a low-pass average),
   computed once per note into an AudioBuffer → overdrive (WaveShaper) → cabinet filter → chorus
   (modulated delay) → simple reverb (delays with feedback) → compressor → about −12 dB.
   The visuals read stringEnergy (6 strings, low E = 0) and level() (RMS of the output). */

const BPM = 120;
const E8 = 60 / BPM / 2; // one eighth note, s

// Power chords (root, fifth, octave) with the string each note sits on; low E string = 0
const PC = {
  E5: [[82.41, 0], [123.47, 1], [164.81, 2]],
  G5: [[98.0, 0], [146.83, 1], [196.0, 2]],
  A5: [[110.0, 1], [164.81, 2], [220.0, 3]],
  D5: [[146.83, 2], [220.0, 3], [293.66, 4]],
  B5: [[123.47, 1], [185.0, 2], [246.94, 3]],
};
// Single notes of the phrase (E minor pentatonic), with their strings
const LN = {
  D4: [293.66, 4], E4: [329.63, 5], G4: [392.0, 5], A4: [440.0, 5], B4: [493.88, 5], D5: [587.33, 5], E5: [659.26, 5],
};

/* The riff: one token per eighth. 'E5c' ringing power chord, 'E5m' palm-muted chord, a plain note
   name ('E4', 'E5' = high E) for the phrase, '-' keeps the previous sound ringing. 7 bars of 8 eighths. */
const RIFF = [
  'E5m', 'E5m', 'E5m', 'E5m', 'G5c', '-', 'A5c', '-',
  'E5m', 'E5m', 'E5m', 'E5m', 'D5c', '-', 'E5c', '-',
  'E5m', 'E5m', 'E5m', 'E5m', 'G5c', '-', 'A5c', '-',
  'B5c', '-', '-', 'A5c', '-', '-', 'G5c', '-',
  'E4', 'G4', 'A4', '-', 'B4', 'A4', 'G4', 'E4',
  'D4', 'E4', 'G4', 'A4', 'B4', '-', 'D5', '-',
  'E5', '-', '-', '-', 'E5c', '-', '-', '-',
];

function events() {
  const out = [];
  for (let i = 0; i < RIFF.length; i++) {
    const tok = RIFF[i];
    if (tok === '-') continue;
    let len = 1; while (RIFF[i + len] === '-') len++;
    const t = i * E8, dur = len * E8, last = i + len >= RIFF.length;
    if (tok.endsWith('c') || tok.endsWith('m')) {
      const mute = tok.endsWith('m');
      out.push({ t, dur: dur + (last ? 1.6 : 0.05), notes: PC[tok.slice(0, -1)], vel: mute ? 0.62 : 0.88, mute, strum: mute ? 0.004 : 0.01 });
    } else {
      out.push({ t, dur: dur + 0.12, notes: [LN[tok]], vel: 0.74, mute: false, strum: 0 });
    }
  }
  return out;
}

export function createGuitar() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  const ctx = new AC();
  const sr = ctx.sampleRate;

  /* ---------- Chain ---------- */
  const input = ctx.createGain(); input.gain.value = 1;
  const drive = ctx.createGain(); drive.gain.value = 3.2;
  const shaper = ctx.createWaveShaper();
  const curve = new Float32Array(2048);
  for (let i = 0; i < curve.length; i++) { const x = (i / (curve.length - 1)) * 2 - 1; const k = 18; curve[i] = ((1 + k) * x) / (1 + k * Math.abs(x)); }
  shaper.curve = curve; shaper.oversample = '4x';
  const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 85;
  const cab = ctx.createBiquadFilter(); cab.type = 'lowpass'; cab.frequency.value = 4300; cab.Q.value = 0.7;
  const mid = ctx.createBiquadFilter(); mid.type = 'peaking'; mid.frequency.value = 900; mid.gain.value = 3; mid.Q.value = 0.8;
  input.connect(drive).connect(shaper).connect(hp).connect(cab).connect(mid);
  // chorus: dry + a modulated short delay
  const dry = ctx.createGain(); dry.gain.value = 0.85;
  const chDelay = ctx.createDelay(0.05); chDelay.delayTime.value = 0.018;
  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.9;
  const lfoAmt = ctx.createGain(); lfoAmt.gain.value = 0.0035;
  lfo.connect(lfoAmt).connect(chDelay.delayTime); lfo.start();
  const wet = ctx.createGain(); wet.gain.value = 0.35;
  const bus = ctx.createGain();
  mid.connect(dry).connect(bus);
  mid.connect(chDelay).connect(wet).connect(bus);
  // reverb: a few delays with feedback and damping
  const verbOut = ctx.createGain(); verbOut.gain.value = 0.22;
  [0.031, 0.047, 0.067, 0.089].forEach((d, i) => {
    const dl = ctx.createDelay(0.2); dl.delayTime.value = d;
    const fb = ctx.createGain(); fb.gain.value = 0.48 - i * 0.04;
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
    bus.connect(dl); dl.connect(lp).connect(fb).connect(dl); lp.connect(verbOut);
  });
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18; comp.ratio.value = 4; comp.attack.value = 0.005; comp.release.value = 0.15;
  const master = ctx.createGain(); master.gain.value = 0.25; // about −12 dB
  const analyser = ctx.createAnalyser(); analyser.fftSize = 1024;
  bus.connect(comp); verbOut.connect(comp);
  comp.connect(master).connect(analyser).connect(ctx.destination);
  const tdata = new Float32Array(analyser.fftSize);

  /* ---------- Karplus-Strong ---------- */
  const cache = new Map();
  function pluck(freq, dur, mute) {
    const key = `${freq}|${dur.toFixed(2)}|${mute ? 1 : 0}`;
    if (cache.has(key)) return cache.get(key);
    const len = Math.max(1, Math.floor(sr * dur));
    const buffer = ctx.createBuffer(1, len, sr);
    const out = buffer.getChannelData(0);
    const N = Math.max(2, Math.round(sr / freq));
    const line = new Float32Array(N);
    // the pick: noise, a little smoothed (warmer attack)
    let prev = 0;
    for (let i = 0; i < N; i++) { const v = Math.random() * 2 - 1; prev = prev * 0.45 + v * 0.55; line[i] = prev; }
    const damp = mute ? 0.982 : 0.9965;   // muted strings die fast
    const blend = mute ? 0.3 : 0.5;       // lower = darker
    let idx = 0;
    for (let t = 0; t < len; t++) {
      const cur = line[idx], nxt = line[(idx + 1) % N];
      out[t] = cur;
      line[idx] = damp * (blend * cur + (1 - blend) * nxt);
      idx = (idx + 1) % N;
    }
    // short fade at the end
    const fade = Math.min(len, Math.floor(sr * 0.03));
    for (let i = 0; i < fade; i++) out[len - 1 - i] *= i / fade;
    cache.set(key, buffer);
    return buffer;
  }

  /* ---------- Playing ---------- */
  const EVENTS = events();
  const TOTAL = RIFF.length * E8 + 1.8;
  const stringEnergy = new Float32Array(6);
  const hits = []; // per string: { t (ctx time), vel, decay }
  let sources = [], playing = false, t0 = 0, endTimer = 0, onEnd = null;

  function play(done) {
    if (playing) return;
    if (ctx.state === 'suspended') ctx.resume();
    playing = true; onEnd = done;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setValueAtTime(0.25, ctx.currentTime);
    t0 = ctx.currentTime + 0.08;
    hits.length = 0;
    for (const ev of EVENTS) {
      ev.notes.forEach(([f, s], k) => {
        const when = t0 + ev.t + k * ev.strum;
        const src = ctx.createBufferSource();
        src.buffer = pluck(f, ev.dur, ev.mute);
        const g = ctx.createGain(); g.gain.value = ev.vel * (ev.notes.length > 1 ? 0.5 : 0.75);
        src.connect(g).connect(input);
        src.start(when);
        sources.push(src);
        hits.push({ s, t: when, vel: ev.vel, decay: ev.mute ? 0.12 : Math.min(1.4, ev.dur * 0.8 + 0.2) });
      });
    }
    clearTimeout(endTimer);
    endTimer = setTimeout(() => finish(), (TOTAL + 0.2) * 1000);
  }
  function finish() {
    if (!playing) return;
    playing = false;
    clearTimeout(endTimer);
    const cb = onEnd; onEnd = null;
    cb?.();
  }
  function stop() {
    if (!playing) return;
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setTargetAtTime(0, now, 0.04);
    const list = sources; sources = [];
    setTimeout(() => { list.forEach((s) => { try { s.stop(); } catch (e) { /* not started */ } }); master.gain.setValueAtTime(0.25, ctx.currentTime); }, 220);
    hits.length = 0;
    finish();
  }
  function update() {
    // energy of each string from its last pluck (for the vibrating lines)
    const now = ctx.currentTime;
    stringEnergy.fill(0);
    for (const h of hits) {
      if (h.t > now) continue;
      const e = h.vel * Math.exp(-(now - h.t) / h.decay);
      if (e > stringEnergy[h.s]) stringEnergy[h.s] = e;
    }
    return stringEnergy;
  }
  function level() {
    analyser.getFloatTimeDomainData(tdata);
    let sum = 0;
    for (let i = 0; i < tdata.length; i++) sum += tdata[i] * tdata[i];
    return Math.min(1, Math.sqrt(sum / tdata.length) * 3.2);
  }
  return { play, stop, update, level, get playing() { return playing; }, duration: TOTAL, ctx };
}
