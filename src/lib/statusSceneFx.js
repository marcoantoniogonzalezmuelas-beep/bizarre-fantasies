// Definición de los estados de batalla: color, icono, rótulo y las PARTÍCULAS
// que se reparten por la escena de batalla. Sin velos, sin filtros y sin bordes
// de neón (eso provocaba distorsión y parpadeo).
//
// Cada partícula: t = tipo (clase CSS), e = emoji/caracter, x/y = posición,
// sz = tamaño, d = retardo, dur = duración de su animación.
export const STATUS_STATES = [
  {
    cls: 's-cursed', c: '#ff45c8', ic: '☠', lb: 'MALDITO',
    decor: [
      { t: 'blackcandle', e: '🕯', x: '6%', y: '86%', sz: 20, d: 0 },
      { t: 'blackcandle', e: '🕯', x: '20%', y: '92%', sz: 17, d: 0.4 },
      { t: 'blackcandle', e: '🕯', x: '34%', y: '84%', sz: 22, d: 0.9 },
      { t: 'blackcandle', e: '🕯', x: '48%', y: '93%', sz: 18, d: 0.2 },
      { t: 'blackcandle', e: '🕯', x: '62%', y: '85%', sz: 21, d: 1.1 },
      { t: 'blackcandle', e: '🕯', x: '76%', y: '92%', sz: 17, d: 0.6 },
      { t: 'blackcandle', e: '🕯', x: '90%', y: '86%', sz: 20, d: 1.4 },
      { t: 'blackcandle', e: '🕯', x: '13%', y: '62%', sz: 15, d: 0.8 },
      { t: 'blackcandle', e: '🕯', x: '84%', y: '60%', sz: 15, d: 1.7 },
      { t: 'skullrise', e: '💀', x: '26%', y: '70%', sz: 16, d: 0, dur: 4.6 },
      { t: 'skullrise', e: '💀', x: '55%', y: '76%', sz: 21, d: 1.8, dur: 5.4 },
      { t: 'skullrise', e: '💀', x: '80%', y: '72%', sz: 14, d: 3.2, dur: 4.9 },
    ],
  },
  {
    cls: 's-frozen', c: '#75e8ff', ic: '❄', lb: 'CONGELADO',
    decor: [
      { t: 'flake', e: '❄', x: '8%', y: '8%', sz: 13, d: 0, dur: 4 },
      { t: 'flake', e: '❅', x: '22%', y: '8%', sz: 17, d: 1.3, dur: 4.6 },
      { t: 'flake', e: '❄', x: '36%', y: '8%', sz: 12, d: 2.4, dur: 4.2 },
      { t: 'flake', e: '❆', x: '50%', y: '8%', sz: 19, d: 0.7, dur: 5 },
      { t: 'flake', e: '❄', x: '64%', y: '8%', sz: 14, d: 2, dur: 4.4 },
      { t: 'flake', e: '❅', x: '78%', y: '8%', sz: 16, d: 3.1, dur: 4.8 },
      { t: 'flake', e: '❄', x: '92%', y: '8%', sz: 12, d: 1, dur: 4.1 },
    ],
  },
  { cls: 's-paralyzed', c: '#bde8ff', ic: '⛓', lb: 'PARALIZADO',
    decor: [
      { t: 'chain', e: '⛓', x: '20%', y: '18%', sz: 22, d: 0 },
      { t: 'chain', e: '⛓', x: '52%', y: '12%', sz: 26, d: 0.5 },
      { t: 'chain', e: '⛓', x: '82%', y: '20%', sz: 22, d: 1 },
      { t: 'shackle', e: '🔒', x: '10%', y: '84%', sz: 20, d: 0.3 },
      { t: 'shackle', e: '🔒', x: '88%', y: '84%', sz: 20, d: 0.8 },
    ] },
  { cls: 's-sleeping', c: '#c792ff', ic: '💤', lb: 'DORMIDO',
    decor: [
      { t: 'zzz', e: 'Z', x: '58%', y: '30%', sz: 20, d: 0 },
      { t: 'zzz', e: 'z', x: '68%', y: '22%', sz: 15, d: 0.9 },
      { t: 'zzz', e: 'z', x: '76%', y: '14%', sz: 12, d: 1.8 },
      { t: 'bear', e: '🧸', x: '16%', y: '76%', sz: 24, d: 0 },
    ] },
  { cls: 's-blessed', c: '#ffe58a', ic: '✦', lb: 'BENDITO',
    decor: [
      { t: 'sparkle', e: '✨', x: '16%', y: '22%', sz: 18, d: 0 },
      { t: 'sparkle', e: '✨', x: '50%', y: '14%', sz: 20, d: 0.6 },
      { t: 'sparkle', e: '✨', x: '84%', y: '68%', sz: 18, d: 1.2 },
    ] },
  { cls: 's-tank', c: '#ffb43a', ic: '🛡', lb: 'TANQUEANDO',
    decor: [{ t: 'shield', e: '🛡', x: '50%', y: '50%', sz: 26, d: 0 }] },
  { cls: 'bf-state-confused', c: '#ffe65a', ic: '★', lb: 'CONFUSO',
    decor: [
      { t: 'star', e: '★', x: '26%', y: '24%', sz: 20, d: 0 },
      { t: 'star', e: '★', x: '74%', y: '72%', sz: 20, d: 0.7 },
    ] },
  { cls: 'bf-state-drunk', c: '#b8ec72', ic: '◉', lb: 'BORRACHO',
    decor: [
      { t: 'bubble', e: '🍺', x: '20%', y: '74%', sz: 20, d: 0 },
      { t: 'bubble', e: '💧', x: '78%', y: '26%', sz: 18, d: 0.8 },
    ] },
  { cls: 'bf-state-dizzy', c: '#72f0b5', ic: '🌀', lb: 'MAREADO',
    decor: [{ t: 'spiral', e: '🌀', x: '50%', y: '48%', sz: 24, d: 0 }] },
];