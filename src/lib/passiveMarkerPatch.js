// Parche inyectado en el iframe: dos mejoras de claridad visual en batalla.
//
// 1. MARCADOR PERMANENTE de habilidades pasivas "EN JUEGO": un badge que
//    flota sobre el retrato del h\\u00e9roe mientras su habilidad pasiva est\\u00e9
//    activa (refracci\\u00f3n de Juniana, protecci\\u00f3n de la Grulla...). As\\u00ed el
//    jugador siempre ve qu\\u00e9 efectos permanentes hay sobre el campo.
//    Para registrar una nueva habilidad pasiva, basta con a\\u00f1adir su flag
//    al mapa PASSIVES (ver abajo).
//
// 2. BANNER DE KO: cuando un h\\u00e9roe cae a 0 de vida, un flash rojo a
//    pantalla completa + "KO" + el nombre del h\\u00e9roe ca\\u00eddo. As\\u00ed nunca
//    se pierde el \\u00faltimo golpe, ni el que le da la victoria a tu rival.
export const PASSIVE_MARKER_PATCH = `
<script>
(function(){
  if(window.__bfPassiveMarkerPatch) return;
  window.__bfPassiveMarkerPatch = true;

  // Registro de habilidades pasivas "EN JUEGO": flag → {icon, color, label}.
  // Para a\\u00f1adir una nueva habilidad pasiva, registra su flag aqu\\u00ed.
  var PASSIVES = {
    _bfRefract: { icon: '\\u2726', color: '#c79bff', label: 'Refracci\\u00f3n' },
    _bfCrane: { icon: '\\u{1F6E1}\\uFE0F', color: '#9dffcf', label: 'Protecci\\u00f3n' },
    _bfDuckBlock: { icon: '\\u{1F986}', color: '#9dffcf', label: 'Picotazo' },
    _bfDisoriented: { icon: '\\u{1F9ED}', color: '#c79bff', label: 'Desorientado' },
    _bfInvisible: { icon: '\\u{1F441}\\uFE0F', color: '#c05bff', label: 'Invisible' },
    _bfDojiRevive: { icon: '\\u{1F31F}', color: '#c79bff', label: 'Gran amenaza' },
    _bfDojiThreat: { icon: '\\u26a0\\uFE0F', color: '#9dffcf', label: 'Peque\\u00f1a amenaza' }
  };
  // Mapa din\u00e1mico desde el editor: card_id \u2192 {flag, icon, color, label}
  var markersMap = {};
  window.addEventListener('message', function(e){
    if(e.data && e.data.bfPassiveMarkers && typeof e.data.bfPassiveMarkers === 'object'){
      markersMap = e.data.bfPassiveMarkers;
    }
  });

  var css =
  // ---- Marcador permanente de habilidad pasiva sobre el retrato ----
  // Badge MÁS GRANDE y chulo: icono (emoji o imagen IA) en círculo + rótulo
  // siempre visible. Igual de claro que el de Refracción de Juniana.
  '.bf-passive-mark{position:absolute;left:50%;bottom:2px;transform:translateX(-50%);z-index:22;display:flex;align-items:center;gap:7px;padding:4px 13px 4px 4px;border-radius:999px;font-family:Cinzel,serif;font-size:12px;font-weight:1000;letter-spacing:.5px;text-transform:uppercase;backdrop-filter:blur(4px);pointer-events:none;white-space:nowrap;background:rgba(8,5,14,.92);border:1.5px solid var(--bf-pc,#fff);color:var(--bf-pc,#fff);box-shadow:0 0 14px var(--bf-pc,#fff),0 3px 9px rgba(0,0,0,.6)}' +
  '.bf-passive-mark .bf-pm-ico{width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;overflow:hidden;background:radial-gradient(circle at 38% 28%, rgba(255,255,255,.28), rgba(0,0,0,.4) 70%);border:2px solid var(--bf-pc,#fff);box-shadow:0 0 10px var(--bf-pc,#fff),inset 0 0 8px rgba(255,255,255,.2)}' +
  '.bf-passive-mark .bf-pm-ico img{width:100%;height:100%;object-fit:cover;display:block}' +
  '.bf-passive-mark .bf-pm-emoji{font-size:18px;line-height:1;text-shadow:0 0 8px var(--bf-pc,#fff)}' +
  '.bf-passive-mark .bf-pm-label{font-size:12px;line-height:1;text-shadow:0 1px 3px #000,0 0 8px var(--bf-pc,#fff)}' +
  '@media(max-width:640px){.bf-passive-mark{font-size:10px;padding:3px 10px 3px 3px;gap:5px}.bf-passive-mark .bf-pm-ico{width:26px;height:26px}.bf-passive-mark .bf-pm-emoji{font-size:15px}.bf-passive-mark .bf-pm-label{font-size:10px}}' +
  // ---- Marcador de habilidad pasiva en el PANEL DE ACCIONES ----
  // Igual que el de Doji Conpuri: un badge con punto pulsante que indica que
  // la pasiva está ARMADA (latente, esperando su condición). Visible solo en
  // el panel del héroe activo que tenga la pasiva armada.
  '.bf-passive-panel-mark{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:999px;font-family:Cinzel,serif;font-size:11px;font-weight:1000;letter-spacing:.5px;text-transform:uppercase;background:rgba(8,5,14,.92);border:1.5px solid var(--bf-pc,#fff);color:var(--bf-pc,#fff);box-shadow:0 0 12px var(--bf-pc,#fff),0 2px 6px rgba(0,0,0,.5);margin:6px 0 0;vertical-align:middle;pointer-events:none;white-space:nowrap}' +
  '.bf-passive-panel-mark .bf-ppm-dot{width:8px;height:8px;border-radius:50%;background:var(--bf-pc,#fff);box-shadow:0 0 8px var(--bf-pc,#fff);animation:bfPpmBlink 1.4s ease-in-out infinite}' +
  '.bf-passive-panel-mark .bf-ppm-ico{font-size:14px;line-height:1}' +
  '@keyframes bfPpmBlink{0%,100%{opacity:1}50%{opacity:.4}}' +
  // ---- Banner de ACCIÓN DEFINITIVA (solo cuando termina la partida) ----
  '#bf-final-blow{position:fixed;inset:0;z-index:999999;pointer-events:none;display:flex;align-items:center;justify-content:center;animation:bfFbIn .3s ease-out}' +
  '#bf-final-blow.bf-fb-out{transition:opacity .6s;opacity:0}' +
  '@keyframes bfFbIn{from{opacity:0}to{opacity:1}}' +
  '.bf-fb-flash{position:absolute;inset:0;background:radial-gradient(circle,rgba(255,210,74,.32),transparent 70%);animation:bfFbFlash 2s ease-out forwards}' +
  '@keyframes bfFbFlash{0%{opacity:0}20%{opacity:1}100%{opacity:0}}' +
  '.bf-fb-body{position:relative;text-align:center;animation:bfFbBody 5s ease-out forwards}' +
  '@keyframes bfFbBody{0%{opacity:0;transform:scale(.5)}8%{opacity:1;transform:scale(1.1)}88%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.1)}}' +
  '.bf-fb-title{font-family:Cinzel,serif;font-weight:900;font-size:clamp(34px,9vw,82px);color:#ffd24a;text-shadow:0 0 30px rgba(255,210,74,.9),0 0 60px rgba(255,210,74,.4),0 4px 10px #000;letter-spacing:6px;line-height:1}' +
  '.bf-fb-sub{font-family:Rubik,sans-serif;font-weight:700;font-size:clamp(15px,4vw,26px);color:#fff;text-shadow:0 2px 8px #000,0 0 14px rgba(255,210,74,.5);margin-top:12px}' +
  // ---- Flash de refracci\\u00f3n sobre el retrato de Juniana ----
  '.bf-refract-flash{animation:bfRefractFlash .8s ease-out forwards}' +
  '@keyframes bfRefractFlash{0%{box-shadow:0 0 0 3px #c79bff,0 0 30px #c79bff,0 0 60px #c79bffcc!important}100%{box-shadow:0 0 0 0 transparent!important}}';

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  // Busca el hero data desde el card del DOM: usa getHero (igual que
  // statusLabelPatch y statusSceneFxPatch) para garantizar que el objeto
  // devuelto es el mismo que tiene los flags de pasivas (_bfRefract, etc.).
  function heroFor(card){
    var parts = String(card.id || '').split('_');
    if(parts.length < 3 || typeof getHero !== 'function') return null;
    try{ return getHero(parts[1], parts.slice(2).join('_')); }catch(e){ return null; }
  }

  // Inyecta/actualiza el marcador pasivo en cada retrato de batalla
  function updateMarkers(){
    document.querySelectorAll('.bhero[id^="b_"]').forEach(function(card){
      var h = heroFor(card);
      var badge = card.querySelector('.bf-passive-mark');
      var found = null;
      if(h && h.alive){
        // Mapa del editor: card_id → {normal:{...}, elite:{...}}. En modo élite
        // se usa la variante élite (si la hay); si no, la normal.
        var cfg = markersMap[h.id] || markersMap[h.cid] || markersMap[h.card_id];
        if(cfg){
          var variant = h.eliteMode ? (cfg.elite || cfg.normal) : (cfg.normal || cfg.elite);
          if(variant && variant.flag && h[variant.flag]){
            found = { icon: variant.icon || '\\u2726', icon_url: variant.icon_url || '', color: variant.color || '#ffd24a', label: variant.label || 'Pasiva' };
          }
        }
        // Fallback al mapa hardcoded (Refracción, Protección, Picotazo…)
        if(!found){
          for(var flag in PASSIVES){
            if(h[flag]){ found = PASSIVES[flag]; break; }
          }
        }
      }
      if(found){
        // Se ancla a la carta completa (.bhero) y se pega al borde inferior:
        // antes estaba en .bf-battle-art (el retrato), que queda en la zona
        // media/alta de la carta y se solapaba con las armas. En el borde
        // inferior de la carta ya no pisa nada.
        var host = card;
        if(badge && badge.parentElement !== host) badge.remove();
        if(!badge || !badge.parentElement){
          badge = document.createElement('div');
          badge.className = 'bf-passive-mark';
          host.appendChild(badge);
        }
        badge.style.setProperty('--bf-pc', found.color);
        var icoHtml = found.icon_url
          ? '<span class="bf-pm-ico"><img src="' + found.icon_url + '" alt=""></span>'
          : '<span class="bf-pm-ico"><span class="bf-pm-emoji">' + (found.icon || '\\u2726') + '</span></span>';
        badge.innerHTML = icoHtml + '<span class="bf-pm-label">' + found.label + '</span>';
      } else if(badge){
        badge.remove();
      }
    });
  }

  // Marcador en el PANEL DE ACCIONES del héroe activo: igual que Doji Conpuri,
  // muestra un badge con el nombre de la pasiva mientras esté armada. Funciona
  // para TODAS las pasivas (editor config + fallback hardcoded).
  function updatePanelMarker(){
    try{
      if(typeof B==='undefined'||!B||!B.current) return;
      var h = (typeof getHero==='function') ? getHero(B.current.side, B.current.id) : null;
      var panel = document.querySelector('.bf-action-host');
      if(!panel) return;
      var mark = panel.querySelector('.bf-passive-panel-mark');
      var found = null;
      if(h && h.alive){
        var cfg = markersMap[h.id] || markersMap[h.cid] || markersMap[h.card_id];
        if(cfg){
          var variant = h.eliteMode ? (cfg.elite || cfg.normal) : (cfg.normal || cfg.elite);
          if(variant && variant.flag && h[variant.flag]){
            found = { icon: variant.icon || '\\u2726', color: variant.color || '#ffd24a', label: variant.label || 'Pasiva' };
          }
        }
        if(!found){
          for(var flag in PASSIVES){
            if(h[flag]){ found = PASSIVES[flag]; break; }
          }
        }
      }
      if(found){
        if(!mark){ mark = document.createElement('div'); mark.className='bf-passive-panel-mark'; panel.appendChild(mark); }
        mark.style.setProperty('--bf-pc', found.color);
        mark.innerHTML = '<span class="bf-ppm-dot"></span><span class="bf-ppm-ico">' + (found.icon || '\\u2726') + '</span>' + found.label;
      } else if(mark){ mark.remove(); }
    }catch(e){}
  }

  // (El resumen de la ACCIÓN DEFINITIVA se rehará como repaso de la jugada;
  //  el cartel anterior y su espera al final de partida se han retirado.)

  function hookRender(){
    if(typeof window.renderBattle !== 'function' || window.renderBattle.__bfPassiveMarker) return false;
    var original = window.renderBattle;
    window.renderBattle = function(){ var result = original.apply(this, arguments); updateMarkers(); updatePanelMarker(); return result; };
    window.renderBattle.__bfPassiveMarker = 1;
    return true;
  }

  var tries = 0;
  var timer = setInterval(function(){
    hookRender();
    updateMarkers();
    updatePanelMarker();
    if((window.renderBattle && window.renderBattle.__bfPassiveMarker) || tries++ > 120) clearInterval(timer);
  }, 200);
  // Vigilancia permanente: otros parches redibujan los retratos y el marcador
  // podr\\u00eda perderse; as\\u00ed el estado (Refracci\\u00f3n, Protecci\\u00f3n, Picotazo\\u2026) se mantiene
  // visible todo el tiempo que la pasiva siga activa.
  setInterval(function(){ updateMarkers(); updatePanelMarker(); }, 500);
  updateMarkers();
  updatePanelMarker();
})();
</script>
`;