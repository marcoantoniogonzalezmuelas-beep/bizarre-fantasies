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
    { key:'agony',    icon:'\\ud83e\\ude78', label:'AGONIZANDO', c1:'#ff3b30', c2:'#7a0000', test:function(h){ return h.alive && h.hp > 0 && h.maxHp >= 15 && h.hp <= Math.ceil(h.maxHp * .1); } },
    { key:'sleep',    icon:'\\ud83d\\udca4', label:'DORMIDO',    c1:'#6aa9ff', c2:'#10285e', test:function(h){ return h.sleep > 0; } },
    { key:'para',     icon:'\\u26a1',        label:'PARALIZADO', c1:'#ffe14a', c2:'#6b5000', test:function(h){ return h.para > 0; } },
    { key:'silence',  icon:'\\ud83d\\udd07', label:'SILENCIADO', c1:'#c9b6ff', c2:'#2e1a63', test:function(h){ return h.silence > 0; } },
    { key:'frozen',   icon:'\\u2744',        label:'CONGELADO',  c1:'#8fe6ff', c2:'#0b3a5e', test:function(h){ return h.frozen > 0 || (h._mods || []).some(function(m){ return m && (m.turns === undefined || m.turns > 0) && Number(m.vel) < 0; }); } },
    { key:'confuse',  icon:'\\u2605',        label:'CONFUSO',    c1:'#ff9ae6', c2:'#5c0d4b', test:function(h){ return h._bfConfused > 0; } },
    { key:'drunk',    icon:'\\u25c9',        label:'BORRACHO',   c1:'#ffb45c', c2:'#5e2f00', test:function(h){ return h._bfDrunk > 0; } },
    { key:'dizzy',    icon:'\\ud83c\\udf00', label:'MAREADO',    c1:'#7ee8e0', c2:'#0b4a46', test:function(h){ return h._bfDizzy > 0; } },
    { key:'curse',    icon:'\\u25bc',        label:'MALDITO',    c1:'#b06bff', c2:'#2b0a52', test:function(h){ return modSum(h) < 0; } },
    { key:'bless',    icon:'\\u25b2',        label:'BENDECIDO',  c1:'#ffe14a', c2:'#6b5000', test:function(h){ return modSum(h) > 0; } }
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
    '.bf-status-labels{position:absolute!important;left:5px!important;bottom:5px!important;right:5px!important;z-index:20!important;display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:3px!important;pointer-events:none!important;contain:layout style!important}' +
    '.bf-status-tag{display:inline-flex;align-items:center;gap:4px;padding:2px 7px 2px 5px;border-radius:999px;font-family:Cinzel,serif;font-weight:900;font-size:9.5px;letter-spacing:.6px;line-height:1.35;white-space:nowrap;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.9);border:1px solid rgba(255,255,255,.3);box-shadow:0 1px 4px rgba(0,0,0,.5);animation:bfStatusTagIn .28s ease-out both}' +
    '.bf-status-tag i{font-style:normal;font-size:11px;line-height:1;filter:drop-shadow(0 1px 1px rgba(0,0,0,.8))}' +
    '@keyframes bfStatusTagIn{from{opacity:0;transform:translateX(-8px) scale(.9)}to{opacity:1;transform:none}}' +
    // Borde parpadeante del retrato: MISMO comportamiento para todos los estados,
    // con el color del estado más importante. Vive dentro de .bf-battle-art, así
    // que no puede mover el nombre ni la barra de atributos.
    '.bf-status-ring{position:absolute!important;inset:0!important;z-index:13!important;pointer-events:none!important;border-radius:inherit;border:3px solid var(--bfsc,#fff);opacity:.16;box-shadow:0 0 3px var(--bfsc);contain:layout style!important}' +
    // Velo de color sobre TODO el retrato (mismo efecto que el congelado) con
    // el color del estado. Es una capa absoluta: no toca la maquetación.
    '.bf-status-veil{position:absolute!important;inset:0!important;z-index:12!important;pointer-events:none!important;border-radius:inherit;background:linear-gradient(180deg,var(--bfsc,#fff) 0%,transparent 62%),radial-gradient(circle at 50% 18%,var(--bfsc,#fff),transparent 58%);mix-blend-mode:screen;opacity:.045;contain:layout style!important}' +
    // AGONIZANDO: velo rojo oscuro (sangre), sin "screen" para que no ilumine.
    '.bf-status-veil.bf-veil-agony{mix-blend-mode:normal!important;background:linear-gradient(180deg,rgba(140,0,0,.5) 0%,rgba(70,0,0,.15) 65%),radial-gradient(circle at 50% 20%,rgba(185,10,10,.4),transparent 60%)!important;opacity:.14}' +
    // La fila de chips de estado del juego ocupaba sitio EN EL FLUJO de la carta:
    // al aparecer un estado (dormido, maldito, silenciado…) empujaba el nombre y
    // la barra de atributos hacia abajo. Ahora es una capa ABSOLUTA pegada al
    // borde inferior derecho: aparezca o no, la maquetación de la carta no cambia.
    '.bhero{padding-bottom:10px!important}' +
    '.bhero .bhero-status{position:absolute!important;right:9px!important;bottom:6px!important;left:auto!important;top:auto!important;margin:0!important;height:18px!important;min-height:18px!important;max-height:18px!important;width:auto!important;max-width:62%!important;justify-content:flex-end!important;flex-wrap:nowrap!important;overflow:hidden!important;align-items:center!important;z-index:16!important;pointer-events:none!important;contain:layout style!important}' +
    // El icono grande de estado del juego (.bhero-ov) estaba quedando EN FLUJO
    // (otro parche fuerza position:relative en los hijos de la carta), así que
    // empujaba 52 px hacia abajo el nombre y la barra de atributos. Se devuelve
    // a capa absoluta centrada, igual que en el congelado.
    '.bhero>.bhero-ov{position:absolute!important;top:50%!important;left:50%!important;transform:translate(-50%,-50%)!important;margin:0!important;z-index:11!important;pointer-events:none!important}' +
    // El rótulo/borde nativo del juego (que salía en otro sitio y solo en algunos
    // estados) se desactiva: este sistema es el único que pinta estados.
    '.bhero .bf-status-badge{display:none!important}' +
    '.bhero.s-frozen{box-shadow:none!important}' +
    // Las capas de efecto que el juego añade al aplicar un estado (escarcha,
    // runas, chispas…) se insertaban como contenido normal de la carta: durante
    // ese instante empujaban el nombre y la barra de atributos, y al quitarse
    // volvían a su sitio. Se fuerzan como capas absolutas superpuestas.
    '.bhero>.bf-fx-overlay,.bhero>.bf-frost,.bhero>.bf-combat-fx{position:absolute!important;inset:0!important;margin:0!important;z-index:15!important;pointer-events:none!important;contain:layout style!important}' +
    // Rótulo TANQUEANDO: banner dorado en la parte INFERIOR del retrato, visible
    // solo mientras el héroe tenga _bfTank (acción de tanquear del panel). Va
    // centrado horizontalmente y a 30 px del borde inferior: POR ENCIMA de la
    // fila de rótulos de estado (abajo izquierda, bottom:5px) y de los chips de
    // estado del juego (abajo derecha, bottom:6px, ~24px de alto), y libre del
    // marcador pasivo (abajo izquierda, ~48px) y de las chapas de equipo (abajo
    // derecha, bottom:32px) al estar centrado y ser estrecho. No tapa el nombre
    // del héroe (cabecera superior) ni se solapa con ningún elemento.
    '.bf-tank-banner{position:absolute!important;bottom:30px!important;left:50%!important;transform:translateX(-50%)!important;z-index:21!important;display:inline-flex!important;align-items:center!important;gap:5px!important;padding:4px 13px!important;border-radius:999px!important;font-family:Cinzel,serif!important;font-weight:1000!important;font-size:11px!important;letter-spacing:.7px!important;text-transform:uppercase!important;white-space:nowrap!important;background:linear-gradient(180deg,#ffd06a,#b06a00)!important;border:2px solid #ffd24a!important;color:#3a1a00!important;text-shadow:0 1px 2px rgba(255,255,255,.45)!important;box-shadow:0 3px 10px rgba(0,0,0,.6),0 0 14px rgba(255,180,70,.75)!important;pointer-events:none!important;contain:layout style!important;animation:bfTankPulse 1.6s ease-in-out infinite!important}' +
    '.bf-tank-banner .bf-tank-ico{font-style:normal;font-size:14px;line-height:1;filter:drop-shadow(0 1px 1px rgba(0,0,0,.5))}' +
    '@keyframes bfTankPulse{0%,100%{box-shadow:0 3px 10px rgba(0,0,0,.6),0 0 14px rgba(255,180,70,.75)}50%{box-shadow:0 3px 10px rgba(0,0,0,.6),0 0 22px rgba(255,180,70,1)}}' +
    '@media(max-width:880px){.bf-tank-banner{font-size:10px!important;padding:3px 10px!important;gap:4px!important}.bf-tank-banner .bf-tank-ico{font-size:12px}}';

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

    // Rótulo TANQUEANDO: banner dorado en la parte alta del retrato, visible
    // solo mientras el héroe tenga _bfTank (acción de tanquear del panel). Se
    // gestiona aparte de la columna de estados y ANTES del return temprano para
    // que un héroe que solo esté tanqueando (sin otros estados) también lo
    // muestre. No se solapa con el marcador pasivo ni con las chapas de equipo.
    var tank = host.querySelector('.bf-tank-banner');
    if(hero && hero.alive && hero._bfTank){
      if(!tank){ tank = document.createElement('div'); tank.className = 'bf-tank-banner'; tank.innerHTML = '<span class="bf-tank-ico">🛡️</span>TANQUEANDO'; host.appendChild(tank); }
    } else if(tank){ tank.remove(); }

    var box = card.querySelector('.bf-status-labels');
    var active = [];
    if(hero && hero.alive) STATES.forEach(function(s){ try { if(s.test(hero)) active.push(s); } catch(e){} });

    var ring = host.querySelector('.bf-status-ring');
    var veil = host.querySelector('.bf-status-veil');
    if(!active.length){ if(box) box.remove(); if(ring) ring.remove(); if(veil) veil.remove(); return; }
    if(!ring){ ring = document.createElement('div'); ring.className = 'bf-status-ring'; host.appendChild(ring); }
    if(!veil){ veil = document.createElement('div'); veil.className = 'bf-status-veil'; host.appendChild(veil); }
    if(ring.dataset.bfKey !== active[0].key){ ring.dataset.bfKey = active[0].key; ring.style.setProperty('--bfsc', active[0].c1); }
    if(veil.dataset.bfKey !== active[0].key){
      veil.dataset.bfKey = active[0].key;
      veil.style.setProperty('--bfsc', active[0].c1);
      veil.classList.toggle('bf-veil-agony', active[0].key === 'agony');
    }

    var signature = active.map(function(s){ return s.key; }).join('|');
    if(box && box.dataset.bfSig === signature) return; // sin cambios: no repintar
    if(!box){
      box = document.createElement('div');
      box.className = 'bf-status-labels';
      // Se ancla a la carta (.bhero) y no al retrato (.bf-battle-art): así queda
      // POR ENCIMA de las capas de efecto del juego (escarcha del congelado,
      // z-index 15) y el rótulo no queda tapado. Es absolute + contain, así que
      // no altera el flujo del nombre ni de la barra de atributos.
      card.appendChild(box);
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
  // Sondeo periódico: la acción de tanquear no siempre dispara renderBattle,
  // así que sin esto el banner TANQUEANDO no aparecía hasta el siguiente render.
  setInterval(update, 500);
  update();
})();
</script>
`;