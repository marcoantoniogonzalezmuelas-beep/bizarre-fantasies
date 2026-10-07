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

  // Foil en tablet/móvil no se ve igual que en PC (el contexto de apilado del
  // iframe escalado altera el destello). Se quita en táctil; en PC se mantiene.
  var _ua = navigator.userAgent || '';
  var _isTablet = /iPad/i.test(_ua) || (/Macintosh|Mac OS/i.test(_ua) && navigator.maxTouchPoints > 1) || (/Android/i.test(_ua) && !/Mobile/i.test(_ua));
  var _isPhone = !_isTablet && /Android|iPhone|iPod|Mobile/i.test(_ua);
  void _isTablet; void _isPhone;   // (el borde QUIETO se ve igual en todas partes: ya no se excluyen móvil y tableta)

  // Destello foil SUAVE en el retrato de batalla, idéntico en PC, móvil y tablet.
  // CAUSA del desajuste anterior: el brillo usaba mix-blend-mode:screen. En
  // móvil/tablet el parche antiparpadeo aplica transform:translateZ(0) a .bhero,
  // lo que crea un contexto de apilado que AISLA la mezcla screen → el destello
  // se veía distinto que en PC (donde .bhero no tiene transform ni contexto).
  // Con mix-blend-mode:normal el destello se compone igual en todas las
  // plataformas (no depende del contexto de apilado del padre). Color original
  // (blanco), solo destello suave, sin nada más.
  var SHINE = 'background:linear-gradient(110deg,transparent 42%,rgba(255,255,255,.18) 48%,rgba(255,255,255,.34) 50%,rgba(255,255,255,.18) 52%,transparent 58%);background-size:250% 250%;mix-blend-mode:normal;opacity:.85';
  // SIN MOVIMIENTO: en lugar del destello que recorría la carta, un ANILLO MULTICOLOR QUIETO alrededor del borde
  // (las cartas con borde dorado en la base de datos conservan su dorado y no llevan este anillo).
  var BODY = 'content:\"\";position:absolute;inset:0;z-index:14;pointer-events:none;border-radius:inherit;padding:5px;'
    // ANILLO HOLOGRÁFICO PLATEADO (distinto del multicolor del arco iris): tonos perla iridiscentes, QUIETO.
    + 'background:conic-gradient(from 200deg,#ffffff,#bfefff 12%,#e9d4ff 24%,#ffd1ec 36%,#fff2c4 48%,#d4fff0 60%,#c7d4ff 72%,#f2f2ff 84%,#ffffff);'
    + '-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;'
    + 'filter:drop-shadow(0 0 2px rgba(255,255,255,.9));animation:none!important;transition:none!important'

  var css = ''
    + '@keyframes bfBattleFoilShine{0%{background-position:130% 0%}100%{background-position:-50% 0%}}'
    + 'html body .bhero{position:relative!important}'
    // Regla base (clase) por si el ID no se ha generado todavía.
    + 'html body .bhero.bf-foil-on:not(.bf-truedead)::after{' + BODY + '}'
    + 'html body .bhero.bf-foil-on:not(.bf-truedead){box-shadow:0 0 0 1px rgba(255,255,255,.75),0 0 18px rgba(165,225,255,.75),0 0 38px rgba(255,165,235,.38)!important}'
    // Destellos FIJOS en las cuatro esquinas (tipo carta coleccionable).
    + 'html body .bhero.bhero .bf-foil-gems{position:absolute!important;top:0!important;left:0!important;right:0!important;bottom:0!important;width:auto!important;height:auto!important;margin:0!important;padding:0!important;z-index:15!important;pointer-events:none;border-radius:inherit}'
    // En las cartas FOIL que además tienen borde multicolor (Daidoji Esva, KillerDucks, Chuchinjo) manda el foil: su
    // borde exterior pasa a ser también holográfico plateado (antes el arco iris asomaba por fuera del anillo).
    + 'html body .bhero.bf-foil-on.bf-rainbow:not(.bf-truedead){background:linear-gradient(#140d24,#140d24) padding-box,conic-gradient(from 200deg,#ffffff,#bfefff 12%,#e9d4ff 24%,#ffd1ec 36%,#fff2c4 48%,#d4fff0 60%,#c7d4ff 72%,#f2f2ff 84%,#ffffff) border-box!important}'
    + 'html body .bhero.bhero .bf-foil-gems i{position:absolute!important;width:22px;height:22px;font-style:normal;font-size:20px;line-height:22px;text-align:center;color:#fff;text-shadow:0 0 6px #bfefff,0 0 12px #ffc6ee,0 0 2px #fff;animation:none!important}'
    + 'html body .bhero .bf-foil-gems i::before{content:\"\\\\2726\"}'
    + 'html body .bhero .bf-foil-gems i:nth-child(1){top:42px;left:9px}html body .bhero .bf-foil-gems i:nth-child(2){top:7px;right:7px}'
    + 'html body .bhero .bf-foil-gems i:nth-child(3){bottom:7px;left:7px}html body .bhero .bf-foil-gems i:nth-child(4){bottom:7px;right:7px}'
    + 'html body .bhero.bf-truedead .bf-foil-gems{display:none}'
    + 'html body .bhero.bf-foil-on.bf-epic-gold::after{content:none!important}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);
  // El orden de cascada lo garantiza el coordinador de styleOrderPatch: esta
  // hoja va la ÚLTIMA (el destello debe ganar incluso al congelador total, que
  // ya lo exceptúa por diseño). Antes se re-añadía al final del head en bucle,
  // en guerra con otros parches: recálculos constantes = parpadeo en tablet.
  if(window.__bfStyleOrder) window.__bfStyleOrder(st, 60);

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
    var selectors = ids.map(function(id){ return '#' + cssEscape(id) + ':not(.bf-truedead)::after'; });   // en los caídos manda la lápida R.I.P.
    var rule = selectors.join(',') + '{' + BODY + '}';
    var s = document.createElement('style');
    s.textContent = rule;
    document.head.appendChild(s);
  }
  function cssEscape(id){
    return String(id).replace(/([^a-zA-Z0-9_-])/g, '\\\\$1');
  }

  function gems(card){ if(!card.querySelector(':scope > .bf-foil-gems')){ var g=document.createElement('div'); g.className='bf-foil-gems'; g.innerHTML='<i></i><i></i><i></i><i></i>'; card.appendChild(g); } }
  function detect(){
    var toAdd = [];
    document.querySelectorAll('.bhero[id^="b_"]').forEach(function(card){
      var m = String(card.id || '').match(/^b_([po])_(.+)$/);
      if(!m) return;
      var side = m[1], raw = m[2], key = baseId(raw);
      // La marca se pone en CADA pasada (el repintado crea cartas nuevas); la regla CSS por id, una sola vez.
      if(addedIds[card.id]){ if(!card.classList.contains('bf-foil-on')) card.classList.add('bf-foil-on'); gems(card); return; }
      var foil = !!FOIL[key] || checkFoil(gameHero(side, key)) || checkFoil(heroData(key));
      if(foil){
        addedIds[card.id] = 1;
        toAdd.push(card.id);
        card.classList.add('bf-foil-on');
        gems(card);
      }
    });
    if(toAdd.length) emitRule(toAdd);
  }

  var t = 0, iv = setInterval(function(){ detect(); if(t++ > 60) clearInterval(iv); }, 250);
  setInterval(detect, 1200);
  (window.__bfAfterRender=window.__bfAfterRender||[]).push(detect);   // en el mismo instante del repintado
})();
</script>
`;
