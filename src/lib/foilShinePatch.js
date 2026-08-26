// Cartas FOIL en BATALLA: el mismo efecto holográfico que en el Oráculo y en la
// fase de equipamiento — capa de tinte multicolor girando (bfFoilShift) + el
// destello diagonal que recorre la carta (bfFoilShine).
//
// El juego no marcaba las cartas foil en batalla, así que aquí se recibe del
// padre la lista de card_id foil (postMessage bfFoilCards) y se inyecta la capa
// sobre el recuadro de cada héroe foil en cada repintado del tablero.
export const FOIL_SHINE_PATCH = `
<script>
(function(){
  if(window.__bfBattleFoil) return;
  window.__bfBattleFoil = true;

  // Los fotogramas se declaran AQUÍ: dentro del juego no existen los del
  // Oráculo (viven en la hoja de la web), y sin ellos la capa quedaba estática
  // e invisible.
  var css = ''
    + '@keyframes bfBattleFoilShine{0%{background-position:130% 0%}100%{background-position:-50% 0%}}'
    + 'html body .bhero .bf-epic-foil{position:absolute!important;inset:0!important;z-index:14!important;pointer-events:none!important;border-radius:inherit;overflow:hidden;display:block!important;opacity:1!important}'
    + 'html body .bhero .bf-epic-foil-shine{position:absolute;inset:0;border-radius:inherit;background:linear-gradient(110deg,transparent 40%,rgba(255,255,255,.45) 48%,rgba(255,255,255,.75) 50%,rgba(255,255,255,.45) 52%,transparent 60%);background-size:250% 250%;mix-blend-mode:screen;opacity:.75!important;animation:bfBattleFoilShine 4.5s ease-in-out infinite!important}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var FOIL = {};
  window.addEventListener('message', function(e){
    if(e.data && e.data.bfFoilCards){
      FOIL = {};
      (e.data.bfFoilCards || []).forEach(function(id){ FOIL[String(id)] = 1; });
      apply();
    }
  });

  function baseId(id){ return String(id || '').replace(/_\\d{6,}$/, ''); }

  // Detección autónoma de foil. Funca para AMBOS lados (propio y rival):
  // 1. La lista enviada por el padre (bfFoilCards) — card_id foil/épicas.
  // 2. El héroe vivo en el estado del juego (G.team[side]) — tiene clan/foil
  //    reales sea cual sea su id, así el rival también se detecta aunque su
  //    card_id no coincida con la lista del padre.
  // 3. El array global HEROES del juego (referencia léxica directa, no window:
  //    es un const top-level y por eso no aparece en window.HEROES).
  function gameHero(side, id){
    try {
      if(typeof G === 'undefined' || !G || !G.team) return null;
      var team = G.team[side] || [];
      for(var i = 0; i < team.length; i++){
        if(team[i] && team[i].id === id) return team[i];
      }
    } catch(e){}
    return null;
  }
  function heroData(id){
    var srcs = [];
    try { if(typeof HEROES !== 'undefined' && HEROES) srcs.push(HEROES); } catch(e){}
    try { if(typeof DB_HERO_OBJS !== 'undefined' && DB_HERO_OBJS) srcs.push(DB_HERO_OBJS); } catch(e){}
    for(var i = 0; i < srcs.length; i++){
      var arr = srcs[i]; if(!arr || !arr.length) continue;
      for(var j = 0; j < arr.length; j++){
        if(arr[j] && arr[j].id === id) return arr[j];
      }
    }
    return null;
  }
  function checkFoil(h){
    if(!h) return false;
    // Mismo criterio que el Oráculo (HeroCardFace): foil = foil:true O clan
    // Épicas. gold_border/rainbow_border son efectos de BORDE distintos,
    // no foil (Juniana tiene gold_border pero no es foil).
    if(h.foil === true) return true;
    var cl = String(h.clan || '').toLowerCase();
    if(cl === 'épicas' || cl === 'epicas') return true;
    return false;
  }
  function isFoilHero(side, id){
    var key = baseId(id);
    if(FOIL[key]) return true;
    if(checkFoil(gameHero(side, key))) return true;
    if(checkFoil(heroData(key))) return true;
    return false;
  }

  function apply(){
    document.querySelectorAll('.bhero[id^="b_"]').forEach(function(card){
      var m = String(card.id || '').match(/^b_([po])_(.+)$/);
      var isFoil = m && isFoilHero(m[1], m[2]);
      var layer = card.querySelector('.bf-epic-foil');
      if(isFoil && !layer){
        layer = document.createElement('div');
        layer.className = 'bf-epic-foil';
        layer.innerHTML = '<div class="bf-epic-foil-shine"></div>';
        card.appendChild(layer);
      } else if(!isFoil && layer){
        layer.remove();
      } else if(isFoil && layer && card.lastChild !== layer){
        // El juego repinta el recuadro: la capa debe quedar siempre encima.
        card.appendChild(layer);
      }
    });
  }

  function hookRender(){
    if(typeof window.renderBattle !== 'function' || window.renderBattle.__bfFoil) return;
    var o = window.renderBattle;
    window.renderBattle = function(){ o.apply(this, arguments); try{ apply(); }catch(e){} };
    window.renderBattle.__bfFoil = 1;
  }
  var t = 0, iv = setInterval(function(){ hookRender(); apply(); if(t++ > 40) clearInterval(iv); }, 300);
  setInterval(apply, 800);
  // Los parches de "congelado" se reinsertan al final del <head>: esta hoja se
  // recoloca después para que el brillo foil no quede anulado por ellos.
  setInterval(function(){ if(document.head.lastChild !== st) document.head.appendChild(st); }, 1000);
})();
</script>
`;