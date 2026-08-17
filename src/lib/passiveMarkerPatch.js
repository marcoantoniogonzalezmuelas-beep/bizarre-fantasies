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
    _bfCrane: { icon: '\\u{1F6E1}\\uFE0F', color: '#9dffcf', label: 'Protecci\\u00f3n' }
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
  '.bf-passive-mark{position:absolute;left:8px;bottom:8px;z-index:15;display:flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;font-family:Cinzel,serif;font-size:11px;font-weight:1000;letter-spacing:.5px;text-transform:uppercase;backdrop-filter:blur(4px);pointer-events:none;animation:bfPassivePulse 2.4s ease-in-out infinite;white-space:nowrap}' +
  '@keyframes bfPassivePulse{0%,100%{opacity:.82;box-shadow:0 0 8px var(--bf-pc,#fff),0 2px 6px rgba(0,0,0,.5)}50%{opacity:1;box-shadow:0 0 18px var(--bf-pc,#fff),0 0 28px var(--bf-pc,#fff),0 2px 8px rgba(0,0,0,.5)}}' +
  // ---- Banner de KO (golpe final) ----
  '#bf-ko-overlay{position:fixed;inset:0;z-index:100008;pointer-events:none;display:flex;align-items:center;justify-content:center;animation:bfKoIn .25s ease-out}' +
  '#bf-ko-overlay.bf-ko-out{transition:opacity .5s;opacity:0}' +
  '@keyframes bfKoIn{from{opacity:0}to{opacity:1}}' +
  '.bf-ko-flash{position:absolute;inset:0;background:radial-gradient(circle,rgba(255,20,20,.38),transparent 65%);animation:bfKoFlash .9s ease-out forwards}' +
  '@keyframes bfKoFlash{0%{opacity:0}15%{opacity:1}100%{opacity:0}}' +
  '.bf-ko-body{position:relative;text-align:center;animation:bfKoBody 2.2s ease-out forwards}' +
  '@keyframes bfKoBody{0%{opacity:0;transform:scale(.4)}12%{opacity:1;transform:scale(1.12)}80%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.15)}}' +
  '.bf-ko-title{font-family:Cinzel,serif;font-weight:900;font-size:clamp(44px,13vw,130px);color:#ff2020;text-shadow:0 0 30px rgba(255,0,0,.9),0 0 60px rgba(255,0,0,.4),0 4px 10px #000;letter-spacing:8px;line-height:1}' +
  '.bf-ko-sub{font-family:Rubik,sans-serif;font-weight:700;font-size:clamp(15px,4vw,26px);color:#fff;text-shadow:0 2px 8px #000,0 0 14px rgba(255,0,0,.5);margin-top:10px}' +
  // ---- Flash de refracci\\u00f3n sobre el retrato de Juniana ----
  '.bf-refract-flash{animation:bfRefractFlash .8s ease-out forwards}' +
  '@keyframes bfRefractFlash{0%{box-shadow:0 0 0 3px #c79bff,0 0 30px #c79bff,0 0 60px #c79bffcc!important}100%{box-shadow:0 0 0 0 transparent!important}}';

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  // Busca el hero data desde el card del DOM (mismo patr\\u00f3n que statusAuraPatch)
  function heroFor(card){
    var m = String(card.id || '').match(/^b_([po])_(.+)$/);
    return m && typeof G !== 'undefined' && G.team ? (G.team[m[1]] || []).find(function(h){ return h && h.id === m[2]; }) : null;
  }

  // Inyecta/actualiza el marcador pasivo en cada retrato de batalla
  function updateMarkers(){
    document.querySelectorAll('.bhero[id^="b_"]').forEach(function(card){
      var h = heroFor(card);
      var badge = card.querySelector('.bf-passive-mark');
      var found = null;
      if(h){
        // Primero mira el mapa del editor (card_id → {flag, icon, color, label})
        var cfg = markersMap[h.id] || markersMap[h.cid] || markersMap[h.card_id];
        if(cfg && cfg.flag && h[cfg.flag]){
          found = { icon: cfg.icon || '\\u2726', color: cfg.color || '#ffd24a', label: cfg.label || 'Pasiva' };
        }
        // Fallback al mapa hardcoded
        if(!found){
          for(var flag in PASSIVES){
            if(h[flag]){ found = PASSIVES[flag]; break; }
          }
        }
      }
      if(found){
        if(!badge){
          badge = document.createElement('div');
          badge.className = 'bf-passive-mark';
          card.appendChild(badge);
        }
        badge.style.setProperty('--bf-pc', found.color);
        badge.style.background = 'rgba(8,5,14,.88)';
        badge.style.border = '1.5px solid ' + found.color;
        badge.style.color = found.color;
        badge.innerHTML = '<span>' + found.icon + '</span><span>' + found.label + '</span>';
      } else if(badge){
        badge.remove();
      }
    });
  }

  // KO: banner dram\\u00e1tico cuando un h\\u00e9roe cae
  function showKO(hero){
    var old = document.getElementById('bf-ko-overlay');
    if(old && old.parentNode) old.parentNode.removeChild(old);
    var ov = document.createElement('div');
    ov.id = 'bf-ko-overlay';
    var name = (hero && hero.name) || 'H\\u00e9roe';
    var html = '<div class="bf-ko-flash"></div>';
    html += '<div class="bf-ko-body"><div class="bf-ko-title">KO</div><div class="bf-ko-sub">' + name + ' ha ca\\u00eddo</div></div>';
    ov.innerHTML = html;
    (window.__bfAppend || function(n){ document.body.appendChild(n); })(ov);
    setTimeout(function(){ ov.classList.add('bf-ko-out'); }, 1900);
    setTimeout(function(){ if(ov.parentNode) ov.parentNode.removeChild(ov); }, 2500);
  }

  // Hook de dealDamage: detecta cuando un h\\u00e9roe pasa de vivo a muerto
  function installKoHook(){
    if(typeof window.dealDamage !== 'function' || window.__bfKoHooked) return false;
    window.__bfKoHooked = true;
    var orig = window.dealDamage;
    window.dealDamage = function(target, dmg, opts){
      var wasAlive = target && target.alive;
      var result = orig.apply(this, arguments);
      try{
        if(wasAlive && target && !target.alive && Number(dmg) > 0){
          showKO(target);
        }
      }catch(e){}
      return result;
    };
    return true;
  }

  function hookRender(){
    if(typeof window.renderBattle !== 'function' || window.renderBattle.__bfPassiveMarker) return false;
    var original = window.renderBattle;
    window.renderBattle = function(){ var result = original.apply(this, arguments); updateMarkers(); return result; };
    window.renderBattle.__bfPassiveMarker = 1;
    return true;
  }

  var tries = 0;
  var timer = setInterval(function(){
    hookRender();
    installKoHook();
    updateMarkers();
    if((window.renderBattle && window.renderBattle.__bfPassiveMarker && window.__bfKoHooked) || tries++ > 120) clearInterval(timer);
  }, 200);
  updateMarkers();
})();
</script>
`;