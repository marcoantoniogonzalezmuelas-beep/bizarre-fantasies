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

  // ACCIÓN DEFINITIVA: banner solo cuando el golpe que mata al último
  // héroe de un lado pone fin a la partida. As\\u00ed el jugador siempre
  // sabe cu\\u00e1l fue la acci\\u00f3n que decidi\\u00f3 el final.
  function sideOf(hero){
    try{
      if(typeof G==='undefined'||!G||!G.team)return null;
      for(var s=0;s<2;s++){var side=s?'o':'p';var arr=G.team[side]||[];for(var i=0;i<arr.length;i++){if(arr[i]&&arr[i].id===hero.id)return side;}}
    }catch(e){}
    return null;
  }
  function allDead(side){
    try{
      if(typeof G==='undefined'||!G||!G.team)return false;
      var arr=G.team[side]||[];
      return arr.length>0 && arr.every(function(h){ return !h || !h.alive; });
    }catch(e){return false;}
  }
  var FINAL_BLOW_DELAY = 5000;
  function showFinalBlow(hero){
    var old = document.getElementById('bf-final-blow');
    if(old && old.parentNode) old.parentNode.removeChild(old);
    var ov = document.createElement('div');
    ov.id = 'bf-final-blow';
    var name = (hero && hero.name) || 'H\\u00e9roe';
    var html = '<div class="bf-fb-flash"></div>';
    html += '<div class="bf-fb-body"><div class="bf-fb-title">ACCI\\u00d3N DEFINITIVA</div><div class="bf-fb-sub">' + name + ' cae. Fin de la partida.</div></div>';
    ov.innerHTML = html;
    (window.__bfAppend || function(n){ document.body.appendChild(n); })(ov);
    // Retrasa el fin de partida para que el banner se vea completo.
    window.__bfFinalBlowUntil = Date.now() + FINAL_BLOW_DELAY;
    setTimeout(function(){ ov.classList.add('bf-fb-out'); }, FINAL_BLOW_DELAY - 600);
    setTimeout(function(){ if(ov.parentNode) ov.parentNode.removeChild(ov); }, FINAL_BLOW_DELAY);
  }

  // Hook de checkWin: retrasa el fin de partida (y la cinemática final del
  // juego) hasta que el banner de ACCIÓN DEFINITIVA termine. As\\u00ed el
  // jugador siempre ve cu\\u00e1l fue el \\u00faltimo golpe antes de que
  // salga la pantalla de victoria/derrota.
  function installCheckWinDelay(){
    if(typeof window.checkWin !== 'function' || window.__bfFinalBlowDelayHooked) return false;
    window.__bfFinalBlowDelayHooked = true;
    var orig = window.checkWin;
    window.checkWin = function(){
      var until = window.__bfFinalBlowUntil || 0, now = Date.now();
      if(until > now){
        var self = this, args = arguments;
        setTimeout(function(){ orig.apply(self, args); }, until - now);
        return;
      }
      return orig.apply(this, arguments);
    };
    return true;
  }

  // Hook de dealDamage: solo muestra el banner si el golpe que mata al
  // h\\u00e9roe deja a todo su equipo sin vivos → acci\\u00f3n definitiva.
  function installFinalBlowHook(){
    if(typeof window.dealDamage !== 'function' || window.__bfFinalBlowHooked) return false;
    window.__bfFinalBlowHooked = true;
    var orig = window.dealDamage;
    window.dealDamage = function(target, dmg, opts){
      var wasAlive = target && target.alive;
      var result = orig.apply(this, arguments);
      try{
        if(wasAlive && target && !target.alive && Number(dmg) > 0){
          var side = sideOf(target);
          if(side && allDead(side)){
            showFinalBlow(target);
          }
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
    installFinalBlowHook();
    installCheckWinDelay();
    updateMarkers();
    if((window.renderBattle && window.renderBattle.__bfPassiveMarker && window.__bfFinalBlowHooked) || tries++ > 120) clearInterval(timer);
  }, 200);
  updateMarkers();
})();
</script>
`;