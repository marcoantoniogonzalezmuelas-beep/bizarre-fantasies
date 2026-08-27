// Cartas FOIL en BATALLA: el mismo efecto holográfico que en el Oráculo y en la
// fase de equipamiento — destello diagonal que recorre la carta (bfFoilShine).
//
// ANTES se inyectaba una capa hija (.bf-epic-foil) sobre el recuadro del héroe
// en cada repintado del tablero. Pero el juego RE-RENDERIZA las cartas (sobre
// todo las rivales en cada acción de la IA) y borraba la capa; el hook de
// renderBattle no intercepta las llamadas del juego (el binding global
// renderBattle y window.renderBattle no son el mismo cuando se reasigna), así
// que la capa solo se volvía a poner cada 800 ms → el foil del rival parpadeaba
// o no aparecía.
//
// AHORA el foil se aplica con CSS ::after por ID de carta (#b_p_<id>::after,
// #b_o_<id>::after). El navegador recrea el ::after solo tras cada repintado,
// así que el efecto PERSISTE sin necesidad de re-inyectar nada. La regla se
// genera desde la lista de card_id foil que envía el padre (bfFoilCards) y,
// además, se detecta de forma autónoma cada carta foil en el DOM (por sus datos
// de héroe) por si el mensaje no llegó.
//
// El ::after usa selector por ID (especificidad 1,0,0,1) que GANA a las reglas
// de noHeroMotionPatch/statusFreezePatch que anulan animaciones (son por clase),
// así que el brillo foil sigue animándose aunque el retrato esté quieto.
export const FOIL_SHINE_PATCH = `
<script>
(function(){
  if(window.__bfBattleFoil) return;
  window.__bfBattleFoil = true;

  // Mismo destello foil en PC, móvil y tablet (idéntico al de escritorio).
  var SHINE = 'background:linear-gradient(110deg,transparent 40%,rgba(255,255,255,.45) 48%,rgba(255,255,255,.75) 50%,rgba(255,255,255,.45) 52%,transparent 60%);background-size:250% 250%;mix-blend-mode:screen;opacity:.75';
  var BODY = 'content:"";position:absolute;inset:0;z-index:14;pointer-events:none;border-radius:inherit;overflow:hidden;' + SHINE + ';animation:bfBattleFoilShine 4.5s ease-in-out infinite!important';

  var css = ''
    + '@keyframes bfBattleFoilShine{0%{background-position:130% 0%}100%{background-position:-50% 0%}}'
    + 'html body .bhero{position:relative!important}'
    // Regla base (clase) por si el ID no se ha generado todavía.
    + 'html body .bhero.bf-foil-on::after{' + BODY + '}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);
  setInterval(function(){ if(document.head.lastChild !== st) document.head.appendChild(st); }, 1000);

  var FOIL = {};       // base card_id -> 1 (lista del padre)
  var addedIds = {};   // id DOM ya con regla CSS generada

  window.addEventListener('message', function(e){
    if(e.data && e.data.bfFoilCards){
      FOIL = {};
      (e.data.bfFoilCards || []).forEach(function(id){ FOIL[String(id)] = 1; });
    }
  });

  function baseId(id){ return String(id || '').replace(/_\\d{6,}$/, ''); }

  function gameHero(side, id){
    try {
      if(typeof G === 'undefined' || !G || !G.team) return null;
      var team = G.team[side] || [];
      for(var i = 0; i < team.length; i++){
        if(team[i] && (team[i].id === id || baseId(team[i].id) === id)) return team[i];
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
    // Épicas. gold_border/rainbow_border son efectos de BORDE distintos.
    if(h.foil === true) return true;
    var cl = String(h.clan || '').toLowerCase();
    if(cl === 'épicas' || cl === 'epicas') return true;
    return false;
  }

  // Genera una regla CSS con los IDs de carta foil reales del DOM (con o sin
  // sufijo de multiplayer). El ::after persiste tras cada repintado del juego.
  function emitRule(ids){
    if(!ids.length) return;
    var selectors = ids.map(function(id){ return '#' + cssEscape(id) + '::after'; });
    var rule = selectors.join(',') + '{' + BODY + '}';
    var s = document.createElement('style');
    s.textContent = rule;
    document.head.appendChild(s);
  }
  function cssEscape(id){
    return String(id).replace(/([^a-zA-Z0-9_-])/g, '\\\\$1');
  }

  function detect(){
    var toAdd = [];
    document.querySelectorAll('.bhero[id^="b_"]').forEach(function(card){
      var m = String(card.id || '').match(/^b_([po])_(.+)$/);
      if(!m) return;
      var side = m[1], raw = m[2], key = baseId(raw);
      if(addedIds[card.id]) return;
      var foil = !!FOIL[key] || checkFoil(gameHero(side, key)) || checkFoil(heroData(key));
      if(foil){
        addedIds[card.id] = 1;
        toAdd.push(card.id);
        card.classList.add('bf-foil-on');
      }
    });
    if(toAdd.length) emitRule(toAdd);
  }

  var t = 0, iv = setInterval(function(){ detect(); if(t++ > 60) clearInterval(iv); }, 250);
  setInterval(detect, 1200);
})();
</script>
`;