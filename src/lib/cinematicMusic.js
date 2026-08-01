// Banda sonora procedural para la cinemática de intro de Bizarre Fantasies.
// Web Audio: pad de sintetizadores espaciales + bajo + batería (con un toque
// metal: doble bombo y redoble) + melodía pentatónica épica. Sin archivos
// externos => 100% libre de copyright.

let ctx = null;
let master = null;
let timer = null;
let barI = 0;
let nextTime = 0;
let muted = false;
let started = false;
let noiseBuf = null;

const BPM = 126;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;

// Progresión épica en La menor: Am - F - C - G (i - VI - III - VII)
const PROG = [
  { triad: [220.00, 261.63, 329.63], bass: 110.00 },   // Am
  { triad: [174.61, 220.00, 261.63], bass: 87.31 },     // F
  { triad: [261.63, 329.63, 392.00], bass: 130.81 },   // C
  { triad: [196.00, 246.94, 293.66], bass: 98.00 },    // G
];

// Melodía pentatónica La menor (A C D E G), 4 notas por compás.
const PENT = [440, 523.25, 587.33, 659.25, 783.99];
const LEAD = [
  [0, 0], [1, 2], [2, 3], [3, 2],
  [0, 3], [1.5, 4], [2.5, 2], [3, 1],
  [0, 4], [1, 3], [2, 2], [3, 4],
  [0, 2], [1, 1], [2, 0], [3, 2],
];

function makeNoise(c) {
  const b = c.createBuffer(1, c.sampleRate, c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

function scheduleBar(t0) {
  const p = PROG[barI % PROG.length];

  // PAD — sintetizadores espaciales con filtro paso-bajo y ligero detune.
  const pf = ctx.createBiquadFilter();
  pf.type = 'lowpass'; pf.frequency.value = 900; pf.Q.value = 6;
  pf.connect(master);
  const pg = ctx.createGain(); pg.gain.value = 0.09; pg.connect(pf);
  p.triad.forEach((f, i) => {
    const o = ctx.createOscillator();
    o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = (i - 1) * 7;
    o.connect(pg); o.start(t0); o.stop(t0 + BAR + 0.1);
  });

  // BASS — bajo de triangle en tiempos 1 y 3.
  [0, 2].forEach((bt) => {
    const t = t0 + bt * BEAT;
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = p.bass;
    const g = ctx.createGain(); o.connect(g); g.connect(master);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.22, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
    o.start(t); o.stop(t + 0.6);
  });

  // KICK — doble bombo metalero (1, 1.5, 3, 3.5).
  [0, 0.5, 2, 2.5].forEach((bt) => {
    const t = t0 + bt * BEAT;
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(160, t);
    o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    const g = ctx.createGain(); o.connect(g); g.connect(master);
    g.gain.setValueAtTime(0.9, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.start(t); o.stop(t + 0.22);
  });

  // SNARE en tiempos 2 y 4.
  [1, 3].forEach((bt) => {
    const t = t0 + bt * BEAT;
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1800;
    const g = ctx.createGain(); s.connect(bp); bp.connect(g); g.connect(master);
    g.gain.setValueAtTime(0.5, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    s.start(t); s.stop(t + 0.16);
  });

  // HI-HATS en corcheas.
  for (let i = 0; i < 8; i++) {
    const t = t0 + i * 0.5 * BEAT;
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 7000;
    const g = ctx.createGain(); s.connect(hp); hp.connect(g); g.connect(master);
    g.gain.setValueAtTime(0.1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    s.start(t); s.stop(t + 0.05);
  }

  // LEAD — melodía pentatónica con delay espacial.
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
  const dly = ctx.createDelay(); dly.delayTime.value = 0.38;
  const fb = ctx.createGain(); fb.gain.value = 0.32;
  const lw = ctx.createGain(); lw.gain.value = 0.5;
  lp.connect(lw); lw.connect(master); lw.connect(dly); dly.connect(fb); fb.connect(dly); dly.connect(master);
  const idx = (barI % 4) * 4;
  LEAD.slice(idx, idx + 4).forEach((n) => {
    const t = t0 + n[0] * BEAT;
    const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = PENT[n[1] % 5] * 2;
    const g = ctx.createGain(); o.connect(g); g.connect(lp);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.18, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
    o.start(t); o.stop(t + 0.65);
  });

  barI++;
}

function scheduler() {
  while (nextTime < ctx.currentTime + 0.2) {
    scheduleBar(nextTime);
    nextTime += BAR;
  }
}

export function startMusic() {
  if (started) return;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) { return; }
  started = true;
  master = ctx.createGain();
  master.gain.setValueAtTime(0, ctx.currentTime);
  master.gain.linearRampToValueAtTime(muted ? 0 : 0.9, ctx.currentTime + 1.6);
  master.connect(ctx.destination);
  noiseBuf = makeNoise(ctx);
  barI = 0;
  nextTime = ctx.currentTime + 0.05;
  timer = setInterval(scheduler, 150);
}

export function stopMusic() {
  if (!started) return;
  started = false;
  if (timer) clearInterval(timer);
  if (master && ctx) master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
  const close = ctx;
  setTimeout(() => { if (close) close.close().catch(() => {}); }, 420);
  ctx = null; master = null; timer = null;
}

export function setMuted(m) {
  muted = m;
  if (master && ctx) master.gain.linearRampToValueAtTime(m ? 0 : 0.9, ctx.currentTime + 0.15);
}