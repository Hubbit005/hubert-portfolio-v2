/* Guitar sound for the guitar scene (task 12): Hubert's own recording, assets/audio/song.webm (Opus)
   or song.m4a (AAC), 2:29. The <audio> element is made on the first Play (preload="none"), so
   nothing loads before. Web Audio: MediaElementAudioSourceNode → AnalyserNode → output.
   The visuals read update() (6 strings: frequency bands from bass to treble, low E = 0), level()
   (RMS of the output), bass() (about 60–250 Hz, for the amp's speakers) and progress() (0 … 1). */

// one band per string, Hz (low E … high E)
const BANDS = [[70, 160], [160, 300], [300, 600], [600, 1200], [1200, 2500], [2500, 6000]];

export function createGuitar() {
  const AC = window.AudioContext || window.webkitAudioContext;
  const audio = document.createElement('audio');
  audio.preload = 'none';
  audio.src = audio.canPlayType('audio/webm; codecs="opus"') ? 'assets/audio/song.webm' : 'assets/audio/song.m4a';
  const ctx = AC ? new AC() : null;
  let analyser = null, fdata = null, tdata = null, hz = 1;
  if (ctx) {
    analyser = ctx.createAnalyser();
    analyser.fftSize = 2048; analyser.smoothingTimeConstant = 0.6;
    ctx.createMediaElementSource(audio).connect(analyser).connect(ctx.destination);
    fdata = new Uint8Array(analyser.frequencyBinCount); tdata = new Float32Array(analyser.fftSize);
    hz = ctx.sampleRate / analyser.fftSize;
  }
  const energy = new Float32Array(6);
  let playing = false, onEnd = null;

  function play(done) {
    if (playing) return;
    playing = true; onEnd = done;
    if (ctx?.state === 'suspended') ctx.resume();
    audio.currentTime = 0;
    audio.play()?.catch?.(() => finish());
  }
  function finish() {
    if (!playing) return;
    playing = false;
    const cb = onEnd; onEnd = null;
    cb?.();
  }
  function stop() { audio.pause(); finish(); }
  audio.addEventListener('ended', finish);

  const band = (a, b) => {
    const i0 = Math.max(1, Math.floor(a / hz)), i1 = Math.max(i0 + 1, Math.ceil(b / hz));
    let sum = 0;
    for (let i = i0; i <= i1; i++) sum += fdata[i];
    return sum / (i1 - i0 + 1) / 255;
  };
  function update() {
    if (!analyser || !playing) { energy.fill(0); return energy; }
    analyser.getByteFrequencyData(fdata);
    BANDS.forEach(([a, b], i) => { energy[i] = Math.min(1, Math.max(0, (band(a, b) - 0.2) * 1.8)); });
    return energy;
  }
  function level() {
    if (!analyser) return 0;
    analyser.getFloatTimeDomainData(tdata);
    let sum = 0;
    for (let i = 0; i < tdata.length; i++) sum += tdata[i] * tdata[i];
    return Math.min(1, Math.sqrt(sum / tdata.length) * 3.2);
  }
  function bass() {
    if (!analyser) return 0;
    analyser.getByteFrequencyData(fdata);
    return Math.min(1, Math.max(0, (band(60, 250) - 0.25) * 1.6));
  }
  const progress = () => (audio.duration ? audio.currentTime / audio.duration : 0);
  return { play, stop, update, level, bass, progress, get playing() { return playing; }, ctx };
}
