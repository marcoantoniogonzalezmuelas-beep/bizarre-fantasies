// ROTULOS DE ESTADO persistentes en batalla (sistema nuevo, desde cero).
//
// Regla: mientras el héroe tenga el estado, el rótulo está visible; en cuanto
// deja de tenerlo, desaparece.
//
// Colocación segura: los rótulos NO se añaden como hijo de la carta (eso podía
// reordenar y hacer parpadear el nombre y los stats en héroes de nombre largo).
// Viven DENTRO del contenedor del retrato (.bf-battle-art), que ya es una capa
// absoluta e independiente, y con `contain` para que su contenido no pueda
// provocar ningún recálculo de la maquetación de la carta.
export const STATUS_LABEL_PATCH = `
<script>
(function(){
  if(window.__bfStatusLabels) return;
  window.__bfStatusLabels = true;

  // Definición de cada estado: cómo se detecta, su icono, su texto y su color.
  var STATES = [
    { key:'agony',    icon:'\\ud83e\\ude78', label:'AGONIZANDO', c1:'#ff3b30', c2:'#7a0000', test:function(h){ return h.alive && h.hp > 0 && h.maxHp > 0 && h.hp <= Math.ceil(h.maxHp * .1); } },
    { key:'sleep',    icon:'\\ud83d\\udca4', label:'DORMIDO',    c1:'#6aa9ff', c2:'#10285e', test:function(h){ return h.sleep > 0; } },
    { key:'para',     icon:'\\u26a1',        label:'PARALIZADO', c1:'#ffe14a', c2:'#6b5000', test:function(h){ return h.para > 0; } },
    { key:'silence',  icon:'\\ud83d\\udd07', label:'SILENCIADO', c1:'#c9b6ff', c2:'#2e1a63', test:function(h){ return h.silence > 0; } },
    { key:'frozen',   icon:'\\u2744',        label:'CONGELADO',  c1:'#8fe6ff', c2:'#0b3a5e', test:function(h){ return (h._mods || []).some(function(m){ return m && (m.turns === undefined || m.turns > 0) && Number(m.vel) < 0; }); } },
    { key:'confuse',  icon:'\\u2605',        label:'CONFUSO',    c1:'#ff9ae6', c2:'#5c0d4b', test:function(h){ return h._bfConfused > 0; } },
    { key:'drunk',    icon:'\\u25c9',        label:'BORRACHO',   c1:'#ffb45c', c2:'#5e2f00', test:function(h){ return h._bfDrunk > 0; } },
    { key:'dizzy',    icon:'\\ud83c\\udf00', label:'MAREADO',    c1:'#7ee8e0', c2:'#0b4a46', test:function(h){ return h._bfDizzy > 0; } },
    { key:'curse',    icon:'\\u25bc',        label:'MALDITO',    c1:'#b06bff', c2:'#2b0a52', test:function(h){ return modSum(h) < 0; } },
    { key:'bless',    icon:'\\u25b2',        label:'BENDECIDO',  c1:'#8affb0', c2:'#0b4a22', test:function(h){ return modSum(h) > 0; } }
  ];

  function modSum(h){
    var total = 0;
    (h._mods || []).forEach(function(m){
      if(!m || (m.turns !== undefined && m.turns <= 0)) return;
      total += (m.cc || 0) + (m.ad || 0) + (m.he || 0);
    });
    return total;
  }

  var css =
    // Columna de rótulos: pegada al borde inferior izquierdo, sobre el retrato.
    '.bf-status-labels{position:absolute!important;left:5px!important;bottom:5px!important;right:5px!important;z-index:14!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:3px!important;pointer-events:none!important;contain:layout style!important}' +
    '.bf-status-tag{display:inline-flex;align-items:center;gap:4px;padding:2px 7px 2px 5px;border-radius:999px;font-family:Cinzel,serif;font-weight:900;font-size:9.5px;letter-spacing:.6px;line-height:1.35;white-space:nowrap;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.9);border:1px solid rgba(255,255,255,.45);box-shadow:0 2px 8px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.25);animation:bfStatusTagIn .28s ease-out both}' +
    '.bf-status-tag i{font-style:normal;font-size:11px;line-height:1;filter:drop-shadow(0 1px 1px rgba(0,0,0,.8))}' +
    '@keyframes bfStatusTagIn{from{opacity:0;transform:translateX(-8px) scale(.9)}to{opacity:1;transform:none}}' +
    // Borde parpadeante del retrato: MISMO comportamiento para todos los estados,
    // con el color del estado más importante. Vive dentro de .bf-battle-art, así
    // que no puede mover el nombre ni la barra de atributos.
    '.bf-status-ring{position:absolute!important;inset:0!important;z-index:13!important;pointer-events:none!important;border-radius:inherit;border:3px solid var(--bfsc,#fff);animation:bfStatusRing 1.15s ease-in-out infinite;contain:layout style!important}' +
    '@keyframes bfStatusRing{0%,100%{opacity:.35;box-shadow:0 0 6px var(--bfsc),inset 0 0 8px var(--bfsc)}50%{opacity:1;box-shadow:0 0 20px var(--bfsc),inset 0 0 18px var(--bfsc)}}' +
    // El rótulo/borde nativo del juego (que salía en otro sitio y solo en algunos
    // estados) se desactiva: este sistema es el único que pinta estados.
    '.bhero .bf-status-badge{display:none!important}' +
    '.bhero.s-frozen{box-shadow:none!important}';

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  function heroFromCard(card){
    var parts = String(card.id || '').split('_');
    if(parts.length < 3 || typeof getHero !== 'function') return null;
    try { return getHero(parts[1], parts.slice(2).join('_')); } catch(e){ return null; }
  }

  function paint(card){
    var hero = heroFromCard(card);
    // Host = el contenedor del retrato. Es una capa absoluta propia, así que
    // meter los rótulos aquí no puede alterar la maquetación del nombre ni de
    // la barra de atributos, ni en héroes con nombres muy largos.
    var host = card.querySelector('.bf-battle-art') || card;
    var box = host.querySelector('.bf-status-labels');
    var active = [];
    if(hero && hero.alive) STATES.forEach(function(s){ try { if(s.test(hero)) active.push(s); } catch(e){} });

    var ring = host.querySelector('.bf-status-ring');
    if(!active.length){ if(box) box.remove(); if(ring) ring.remove(); return; }
    if(!ring){ ring = document.createElement('div'); ring.className = 'bf-status-ring'; host.appendChild(ring); }
    if(ring.dataset.bfKey !== active[0].key){ ring.dataset.bfKey = active[0].key; ring.style.setProperty('--bfsc', active[0].c1); }

    var signature = active.map(function(s){ return s.key; }).join('|');
    if(box && box.dataset.bfSig === signature) return; // sin cambios: no repintar
    if(!box){
      box = document.createElement('div');
      box.className = 'bf-status-labels';
      host.appendChild(box);
    }
    box.dataset.bfSig = signature;
    box.innerHTML = active.map(function(s){
      return '<span class="bf-status-tag" style="background:linear-gradient(180deg,' + s.c1 + ',' + s.c2 + ')"><i>' + s.icon + '</i>' + s.label + '</span>';
    }).join('');
  }

  function update(){ document.querySelectorAll('.bhero[id^="b_"]').forEach(paint); }

  function hookRender(){
    if(typeof window.renderBattle !== 'function' || window.renderBattle.__bfStatusLabels) return false;
    var original = window.renderBattle;
    window.renderBattle = function(){ var r = original.apply(this, arguments); update(); return r; };
    window.renderBattle.__bfStatusLabels = 1;
    return true;
  }

  var tries = 0, timer = setInterval(function(){ if(hookRender() || tries++ > 120) clearInterval(timer); }, 200);
  update();
})();
</script>
`;