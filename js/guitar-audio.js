/* Guitar sound for the guitar scene (task 12): Hubert's own recording, assets/audio/song.webm (Opus)
   or song.m4a (AAC), 2:29. The <audio> (#guitar-song) has preload="none", so nothing loads before the
   first Play. Web Audio: MediaElementAudioSourceNode → AnalyserNode → output.
   The visuals read update() (6 strings: frequency bands from bass to treble, low E = 0), level()
   (RMS of the output), bass() (about 60–250 Hz, for the amp's speakers) and progress() (0 … 1). */

// one band per string, Hz (low E … high E)
const BANDS = [[70, 160], [160, 300], [300, 600], [600, 1200], [1200, 2500], [2500, 6000]];

export function createGuitar() {
  const AC = window.AudioContext || window.webkitAudioContext;
  // the <audio> lives in index.html (#guitar-song, preload="none"); data-start: start point in seconds
  const audio = document.getElementById('guitar-song');
  const start = parseFloat(audio.dataset.start) || 0;
  audio.currentTime = start;
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

  // Pause keeps the position, Play resumes; after the end the next Play starts at data-start
  function play() {
    if (ctx?.state === 'suspended') ctx.resume();
    audio.play()?.catch?.(() => {});
  }
  const pause = () => audio.pause();
  audio.addEventListener('ended', () => { audio.currentTime = start; });

  const band = (a, b) => {
    const i0 = Math.max(1, Math.floor(a / hz)), i1 = Math.max(i0 + 1, Math.ceil(b / hz));
    let sum = 0;
    for (let i = i0; i <= i1; i++) sum += fdata[i];
    return sum / (i1 - i0 + 1) / 255;
  };
  function update() {
    if (!analyser || audio.paused) { energy.fill(0); return energy; }
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
  return { play, pause, update, level, bass, progress, audio, get playing() { return !audio.paused; }, ctx };
}
