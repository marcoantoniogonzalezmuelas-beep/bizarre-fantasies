// Visuales ANIME del rectángulo de batalla (el recuadro a la derecha del
// retrato de cada héroe):
//  1. Inyecta el ARTE del héroe difuminado en ese rectángulo (como hace el
//     panel de acciones con .bf-action-bg). Lee la URL del retrato vía
//     getComputedStyle (más fiable que el estilo inline, que a veces llega
//     vacío si injectBattleHeroArt aún no ha corrido).
//  2. Tintes de estado anime (Maldito, Paralizado, Dormido, Bendito,
//     Congelado, Tanqueando) sobre el rectángulo — degradados + líneas de
//     velocidad diagonales, siempre pintan (CSS puro, sin SVG data-URI).
//  3. Velo de SANGRE sobre el retrato cuando el héroe AGONIZA (≤10% HP), con
//     pulso rojo anime.
export const BATTLE_ANIME_PATCH = `
<script>
(function(){
  if(window.__bfBattleAnimePatch)return;
  window.__bfBattleAnimePatch=true;

  var css =
  // Arte del héroe en el panel derecho del .bhero (anime: vívido). !important
  // porque el CSS del juego fuerza position:relative en los hijos de .bhero y
  // sin eso top/bottom no dan altura (quedaba en 0 → invisible).
  '.bf-bhero-bgart{position:absolute!important;left:122px!important;right:0!important;top:0!important;bottom:0!important;z-index:1;pointer-events:none;background-size:cover!important;background-position:center 18%!important;background-repeat:no-repeat!important;filter:blur(3px) saturate(1.3) brightness(.82);opacity:.9}'+
  '.bf-bhero-bgart::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(14,9,22,.82) 0%,rgba(14,9,22,.12) 26%,rgba(14,9,22,.12) 74%,rgba(14,9,22,.8) 100%),linear-gradient(180deg,rgba(14,9,22,.1),rgba(14,9,22,.45))}'+
  // NADA de tintes de color por estado: los estados se indican solo con su
  // rótulo y con las partículas de la escena (statusAuraPatch).
  '.bf-bhero-bgart::before{display:none!important}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  // Lee la URL del retrato de forma robusta: primero el estilo inline (lo que
  // pone injectBattleHeroArt) y, si está vacío, el computed (cubre el caso en
  // que el arte llega por otra vía o aún no se ha inyectado).
  function artUrlOf(art){
    var bg=art.style.backgroundImage||'';
    if(!bg||bg==='none'){try{bg=getComputedStyle(art).backgroundImage;}catch(e){bg='';}}
    return (bg&&bg!=='none')?bg:'';
  }
  // Halla el héroe del juego a partir de la carta de batalla (b_p_<id>).
  function heroFor(card){
    var m=String(card.id||'').match(/^b_([po])_(.+)$/);
    if(!m||typeof G==='undefined'||!G.team)return null;
    return (G.team[m[1]]||[]).find(function(h){return h&&h.id===m[2];})||null;
  }
  // El padre (Home.jsx) envía el mapa de escenas de batalla { card_id: {base,elite} }.
  window.addEventListener('message',function(e){
    if(e.data&&e.data.bfBattleArt){window.__bfBattleArt=e.data.bfBattleArt;injectBgArt();}
  });
  function injectBgArt(){
    document.querySelectorAll('.bhero[id^="b_"]').forEach(function(card){
      var el=card.querySelector('.bf-bhero-bgart');
      if(!el){el=document.createElement('div');el.className='bf-bhero-bgart';card.insertBefore(el,card.firstChild);}
      var bg='';
      // 1. Escena de batalla desde la base de datos (cambia a élite si corresponde).
      var m=String(card.id||'').match(/^b_[po]_(.+)$/);
      var hid=m?m[1]:'';
      var map=window.__bfBattleArt||{};
      var hero=heroFor(card);
      // Héroe transformado por el Transformer: su arte ya no es el de la BD
      // (sigue con el mismo id pero es un token), así que se usa el arte del
      // juego (fallback de abajo).
      if(hid&&map[hid]&&!(hero&&hero._token)){
        var url=(hero&&hero.eliteMode)?map[hid].elite:map[hid].base;
        if(url)bg='url("'+url+'")';
      }
      // 2. Fallback: arte del retrato (mientras no llegue el mapa).
      if(!bg){
        var art=card.querySelector('.bf-battle-art');
        if(art)bg=artUrlOf(art);
      }
      if(bg&&el.dataset.bfBg!==bg){el.style.backgroundImage=bg;el.dataset.bfBg=bg;}
    });
  }
  var ONCE={};   // instalación única (ver nota en rivalHandBackPatch)
  function hookRender(){
    if(ONCE.rb||typeof window.renderBattle!=='function')return;
    ONCE.rb=1;
    var o=window.renderBattle;
    window.renderBattle=function(){o.apply(this,arguments);try{injectBgArt();}catch(e){}};
    window.renderBattle.__bfAnimeBg=1;
  }
  // Hook a renderBattle: inyecta el bgart SÍNCRONAMENTE tras cada render
  // (sin MutationObserver ni interval agresivo — eso causaba parpadeo en móvil).
  var t=0,timer=setInterval(function(){t++;hookRender();if(t>30)clearInterval(timer);},300);
  hookRender();injectBgArt();
})();
</script>
`;