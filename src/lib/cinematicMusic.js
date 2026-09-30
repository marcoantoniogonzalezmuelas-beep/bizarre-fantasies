// Banda sonora procedural ÉPICA para la intro de Bizarre Fantasies.
// Estilo LOTR / Star Wars: orquesta de varias secciones que EVOLUCIONA
// (intro de cuerdas → tema heroico de metal → puente lírico → clímax con
// timpanales y doblaje melódico → outro de desvanecimiento). Sin samples
// externos => 100% libre de copyright. Web Audio puro.
//
// Estructura (en compases de 4/4 a 92 BPM, tempo cinematográfico):
//   A  (0..7)   Intro: pad de cuerdas + shimmer, sin batería, crescendo
//   B  (8..23)  Tema heroico: metales (brass stabs), bajo, batería, lead épico
//   C  (24..39) Puente lírico: modo mayor relativo, cuerdas, contrameloda
//   D  (40..55) Clímax: todo + timpanales + lead doblado a la octava
//   E  (56..71) Outro: pad que se desvanece, última nota colgante
// Menos repetitivo: progresión de 8 acordes, melodía que cambia por sección
// e instrumentación distinta en cada parte.

let ctx = null;
let master = null;
let timer = null;
let barI = 0;
let nextTime = 0;
let muted = false;
let started = false;
let noiseBuf = null;

const BPM = 92;
const BEAT = 60 / BPM;
const BAR = BEAT * 4;

// Progresión épica en La menor (8 compases, cinematográfica):
//   Am - F - C - G - Dm - Am - E - Am   (i-VI-III-VII-iv-i-V-i)
const PROG = [
  { triad: [220.00, 261.63, 329.63], bass: 110.00, root: 'A' },   // Am
  { triad: [174.61, 220.00, 261.63], bass: 87.31,  root: 'F' },   // F
  { triad: [261.63, 329.63, 392.00], bass: 130.81, root: 'C' },   // C
  { triad: [196.00, 246.94, 293.66], bass: 98.00,  root: 'G' },   // G
  { triad: [146.83, 174.61, 220.00], bass: 73.42,  root: 'D' },   // Dm
  { triad: [220.00, 261.63, 329.63], bass: 110.00, root: 'A' },   // Am
  { triad: [164.81, 220.00, 246.94], bass: 82.41,  root: 'E' },   // E
  { triad: [220.00, 261.63, 329.63], bass: 110.00, root: 'A' },   // Am
];

// Secciones (en compases). Dinámica 0..1 que sube hasta el clímax y baja.
function section(bar) {
  if (bar < 8) return { id: 'A', dyn: 0.15 + (bar / 8) * 0.25 };
  if (bar < 24) return { id: 'B', dyn: 0.55 + Math.min(0.25, (bar - 8) / 16 * 0.25) };
  if (bar < 40) return { id: 'C', dyn: 0.6 };
  if (bar < 56) return { id: 'D', dyn: 0.7 + Math.min(0.25, (bar - 40) / 16 * 0.25) };
  return { id: 'E', dyn: Math.max(0.1, 0.5 - (bar - 56) / 16 * 0.45) };
}

// Melodía heroica (notas por compás: [beat, scaleDegree, octava]).
// Escala La menor pentatónica + tensión: A C D E G (grados 0..4).
const PENT = [440, 523.25, 587.33, 659.25, 783.99];
// Tema A (heroico, usado en B y D doblado)
const LEAD_A = [
  [0, 4, 1], [1, 3, 1], [2, 2, 1], [3, 4, 0],
  [0, 2, 1], [1, 4, 1], [2, 3, 1], [3, 2, 1],
  [0, 4, 1], [1, 2, 2], [2, 3, 1], [3, 4, 1],
  [0, 3, 1], [1, 2, 1], [2, 1, 1], [3, 0, 2],
  [0, 4, 1], [1, 3, 1], [2, 4, 2], [3, 3, 1],
  [0, 2, 1], [1, 4, 1], [2, 3, 2], [3, 2, 1],
  [0, 1, 1], [1, 2, 1], [2, 3, 1], [3, 4, 2],
  [0, 2, 1], [1, 0, 2], [2, 2, 1], [3, 4, 1],
];
// Puente C (lírico, más lento, contrameloda en sextillos)
const LEAD_C = [
  [0, 2, 1], [2, 3, 1], [0, 4, 1],
  [0, 3, 1], [2, 2, 1], [0, 4, 1],
  [0, 4, 2], [2, 3, 2], [0, 2, 1],
  [0, 3, 1], [2, 4, 1], [0, 2, 1],
  [0, 2, 1], [2, 4, 1], [0, 3, 1],
  [0, 3, 2], [2, 2, 1], [0, 4, 1],
  [0, 4, 1], [2, 3, 2], [0, 2, 1],
  [0, 1, 1], [2, 2, 1], [0, 0, 2],
];

function makeNoise(c) {
  const b = c.createBuffer(1, c.sampleRate, c.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
}

// --- Voz de pad de cuerdas (sawtooth + filtro paso-bajo, detune) ---
function strings(t0, p, dyn, vol) {
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass'; f.frequency.value = 1400; f.Q.value = 4;
  const g = ctx.createGain(); g.gain.value = vol * dyn;
  f.connect(g); g.connect(master);
  p.triad.forEach((fr, i) => {
    const o = ctx.createOscillator();
    o.type = 'sawtooth'; o.frequency.value = fr; o.detune.value = (i - 1) * 8;
    // swell cinematográfico: sube y baja dentro del compás
    o.connect(f); o.start(t0); o.stop(t0 + BAR + 0.2);
  });
  return f;
}

// --- Voz de metal/brass (sawtooth + forma de onda de trompeta, ataque rápido) ---
function brass(t0, p, dyn, vol) {
  const f = ctx.createBiquadFilter();
  f.type = 'lowpass'; f.frequency.value = 2200; f.Q.value = 2;
  const g = ctx.createGain(); g.gain.value = 0; f.connect(g); g.connect(master);
  // stabs en tiempos 0 y 2 (negras), largos
  [0, 2].forEach((bt) => {
    const t = t0 + bt * BEAT;
    p.triad.forEach((fr, i) => {
      const o = ctx.createOscillator();
      o.type = 'sawtooth'; o.frequency.value = fr * (i === 0 ? 2 : 1); o.detune.value = (i - 1) * 5;
      const og = ctx.createGain(); og.gain.value = vol * 0.5 * dyn;
      o.connect(og); og.connect(f);
      o.start(t); o.stop(t + BEAT * 1.8);
    });
  });
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(vol * dyn, t0 + 0.05);
  g.gain.linearRampToValueAtTime(vol * dyn * 0.6, t0 + BEAT * 1.9);
  g.gain.linearRampToValueAtTime(0, t0 + BAR);
}

// --- Timbal (sine grave con pitch-drop, golpe seco) ---
function timpani(t0, freq, vol) {
  const t = t0;
  const o = ctx.createOscillator(); o.type = 'sine';
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(freq * 0.5, t + 0.18);
  const g = ctx.createGain(); o.connect(g); g.connect(master);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
  o.start(t); o.stop(t + 0.55);
}

// --- Redoble de timbal (varios golpes rápidos) ---
function timpaniRoll(t0, freq, vol, beats) {
  for (let i = 0; i < beats * 4; i++) {
    const t = t0 + i * (BEAT / 4);
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 0.6, t + 0.1);
    const g = ctx.createGain(); o.connect(g); g.connect(master);
    g.gain.setValueAtTime(vol * (i % 2 ? 0.5 : 1), t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    o.start(t); o.stop(t + 0.13);
  }
}

// --- Bajo (triangle, raíz del acorde) ---
function bass(t0, p, vol) {
  [0, 1.5, 2, 3.5].forEach((bt) => {
    const t = t0 + bt * BEAT;
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = p.bass;
    const g = ctx.createGain(); o.connect(g); g.connect(master);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.03);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    o.start(t); o.stop(t + 0.55);
  });
}

// --- Batería cinematográfica ---
function drums(t0, dyn, heavy) {
  // Kick
  const kickVol = 0.9 * dyn;
  [0, heavy ? 1.5 : 2, 2, heavy ? 3.5 : 3].forEach((bt) => {
    const t = t0 + bt * BEAT;
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.13);
    const g = ctx.createGain(); o.connect(g); g.connect(master);
    g.gain.setValueAtTime(kickVol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    o.start(t); o.stop(t + 0.24);
  });
  // Snare
  [1, 3].forEach((bt) => {
    const t = t0 + bt * BEAT;
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1700;
    const g = ctx.createGain(); s.connect(bp); bp.connect(g); g.connect(master);
    g.gain.setValueAtTime(0.5 * dyn, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    s.start(t); s.stop(t + 0.16);
  });
  // Hi-hats en corcheas
  for (let i = 0; i < 8; i++) {
    const t = t0 + i * 0.5 * BEAT;
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 8000;
    const g = ctx.createGain(); s.connect(hp); hp.connect(g); g.connect(master);
    g.gain.setValueAtTime(0.09 * dyn, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
    s.start(t); s.stop(t + 0.05);
  }
  // Crash en el 1 (clímax)
  if (heavy) {
    const t = t0;
    const s = ctx.createBufferSource(); s.buffer = noiseBuf;
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3000;
    const g = ctx.createGain(); s.connect(hp); hp.connect(g); g.connect(master);
    g.gain.setValueAtTime(0.25 * dyn, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
    s.start(t); s.stop(t + 1.25);
  }
}

// --- Lead melódico épico (sawtooth + delay espacial) ---
function lead(t0, notes, vol, octave) {
  const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 3200;
  const dly = ctx.createDelay(); dly.delayTime.value = BEAT * 0.75;
  const fb = ctx.createGain(); fb.gain.value = 0.3;
  const lw = ctx.createGain(); lw.gain.value = 0.55;
  lp.connect(lw); lw.connect(master); lw.connect(dly); dly.connect(fb); fb.connect(dly); dly.connect(master);
  notes.forEach((n) => {
    const t = t0 + n[0] * BEAT;
    const o = ctx.createOscillator(); o.type = 'sawtooth';
    o.frequency.value = PENT[n[1] % 5] * (n[2] ? 2 : 1) * (octave || 1);
    const g = ctx.createGain(); o.connect(g); g.connect(lp);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.04);
    g.gain.linearRampToValueAtTime(vol * 0.7, t + 0.3);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
    o.start(t); o.stop(t + 0.75);
  });
}

function scheduleBar(t0) {
  const p = PROG[barI % PROG.length];
  const s = section(barI);
  const dyn = s.dyn;

  // Cuerdas siempre (base orquestal)
  strings(t0, p, dyn, 0.10);

  if (s.id === 'A') {
    // Intro: solo cuerdas + shimmer + timbal suave al final del compás
    if (barI % 4 === 3) timpani(t0 + 3 * BEAT, p.bass, 0.3 * dyn);
    // shimmer alto (triángulo sintético)
    const sg = ctx.createGain(); sg.gain.value = 0.03 * dyn; sg.connect(master);
    const so = ctx.createOscillator(); so.type = 'sine'; so.frequency.value = p.triad[2] * 4;
    so.connect(sg); so.start(t0); so.stop(t0 + BAR);
  } else if (s.id === 'B') {
    bass(t0, p, 0.22 * dyn);
    drums(t0, dyn, false);
    brass(t0, p, dyn, 0.16);
    lead(t0, LEAD_A.slice((barI % 4) * 4, (barI % 4) * 4 + 4), 0.16 * dyn, 1);
  } else if (s.id === 'C') {
    // Puente lírico: bajo suave, sin batería, cuerdas más presentes, contrameloda
    bass(t0, p, 0.14 * dyn);
    strings(t0, p, dyn, 0.14); // refuerzo de cuerdas
    lead(t0, LEAD_C.slice((barI % 4) * 3, (barI % 4) * 3 + 3), 0.14 * dyn, 1);
    if (barI % 4 === 0) timpani(t0, p.bass, 0.2 * dyn);
  } else if (s.id === 'D') {
    // Clímax: todo + timpanales + lead doblado a octava + redobles
    bass(t0, p, 0.26 * dyn);
    drums(t0, dyn, true);
    brass(t0, p, dyn, 0.22);
    lead(t0, LEAD_A.slice((barI % 4) * 4, (barI % 4) * 4 + 4), 0.18 * dyn, 1);
    lead(t0, LEAD_A.slice((barI % 4) * 4, (barI % 4) * 4 + 4), 0.10 * dyn, 2); // doblaje octava
    timpani(t0, p.bass, 0.4 * dyn);
    if (barI % 4 === 3) timpaniRoll(t0 + 2 * BEAT, p.bass * 1.5, 0.3 * dyn, 2);
  } else {
    // Outro: cuerdas que se desvanecen, última nota colgante
    if (barI % 8 === 0) {
      const o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.value = p.triad[0];
      const g = ctx.createGain(); o.connect(g); g.connect(master);
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.12 * dyn, t0 + 0.4);
      g.gain.linearRampToValueAtTime(0.001, t0 + BAR * 2);
      o.start(t0); o.stop(t0 + BAR * 2 + 0.1);
    }
  }

  barI++;
}

function scheduler() {
  if (!ctx) return;
  while (nextTime < ctx.currentTime + 0.3) {
    scheduleBar(nextTime);
    nextTime += BAR;
  }
}

// iOS deja el AudioContext 'suspended' hasta un gesto del usuario y lo pone en
// 'interrupted' al bloquear la pantalla o cambiar de app: hay que reanudarlo.
let wakeInstalled = false;
function wakeAudio() {
  if (ctx && ctx.state !== 'running') { try { ctx.resume(); } catch (e) { /* noop */ } }
}
function installAudioWake() {
  if (wakeInstalled || typeof document === 'undefined') return;
  wakeInstalled = true;
  ['pointerdown', 'touchend', 'click', 'keydown'].forEach((ev) => document.addEventListener(ev, wakeAudio, true));
  document.addEventListener('visibilitychange', () => { if (!document.hidden) wakeAudio(); });
}

export function startMusic() {
  if (started) return;
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
  } catch (e) { return; }
  started = true;
  installAudioWake();
  wakeAudio();
  master = ctx.createGain();
  master.gain.setValueAtTime(0, ctx.currentTime);
  master.gain.linearRampToValueAtTime(muted ? 0 : 0.85, ctx.currentTime + 2.0);
  // Compresor suave para pegar la orquesta
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18; comp.knee.value = 20; comp.ratio.value = 3; comp.attack.value = 0.01; comp.release.value = 0.25;
  master.disconnect();
  master.connect(comp); comp.connect(ctx.destination);
  noiseBuf = makeNoise(ctx);
  barI = 0;
  nextTime = ctx.currentTime + 0.1;
  timer = setInterval(scheduler, 120);
}

export function stopMusic() {
  if (!started) return;
  started = false;
  if (timer) clearInterval(timer);
  if (master && ctx) master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
  const close = ctx;
  setTimeout(() => { if (close) close.close().catch(() => {}); }, 520);
  ctx = null; master = null; timer = null;
}

export function setMuted(m) {
  muted = m;
  if (master && ctx) master.gain.linearRampToValueAtTime(m ? 0 : 0.85, ctx.currentTime + 0.2);
}