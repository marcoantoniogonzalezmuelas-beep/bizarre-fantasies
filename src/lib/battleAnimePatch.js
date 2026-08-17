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
  // Tinte de estado anime (::before del bgart) — siempre pinta.
  '.bf-bhero-bgart::before{content:"";position:absolute;inset:0;opacity:0;transition:opacity .35s ease;mix-blend-mode:screen}'+
  '.bhero.s-cursed .bf-bhero-bgart::before{opacity:1;background:linear-gradient(135deg,rgba(176,108,255,.5),rgba(78,6,59,.55)),repeating-linear-gradient(48deg,transparent 0 8px,rgba(255,69,200,.22) 8px 9px)}'+
  '.bhero.s-paralyzed .bf-bhero-bgart::before{opacity:1;background:linear-gradient(135deg,rgba(120,200,255,.5),rgba(8,18,32,.55)),repeating-linear-gradient(90deg,transparent 0 10px,rgba(189,232,255,.28) 10px 11px)}'+
  '.bhero.s-sleeping .bf-bhero-bgart::before{opacity:1;background:linear-gradient(135deg,rgba(199,146,255,.45),rgba(20,10,40,.55)),radial-gradient(circle at 72% 28%,rgba(199,146,255,.35),transparent 62%)}'+
  '.bhero.s-blessed .bf-bhero-bgart::before{opacity:1;background:linear-gradient(135deg,rgba(255,229,138,.48),rgba(40,30,5,.42)),repeating-conic-gradient(from 0deg at 50% 50%,rgba(255,229,138,.18),transparent 24deg)}'+
  '.bhero.s-frozen .bf-bhero-bgart::before{opacity:1;background:linear-gradient(135deg,rgba(117,232,255,.5),rgba(7,58,83,.55)),repeating-linear-gradient(58deg,transparent 0 7px,rgba(160,230,255,.26) 7px 8px)}'+
  '.bhero.s-tank .bf-bhero-bgart::before{opacity:1;background:linear-gradient(135deg,rgba(255,180,58,.48),rgba(80,40,5,.5)),repeating-linear-gradient(45deg,transparent 0 8px,rgba(255,180,58,.2) 8px 9px)}'+
  '.bhero.bf-state-confused .bf-bhero-bgart::before{opacity:1;background:linear-gradient(135deg,rgba(255,230,90,.42),rgba(54,44,5,.5)),repeating-conic-gradient(from 0deg at 50% 50%,rgba(255,230,90,.16),transparent 30deg)}'+
  '.bhero.bf-state-drunk .bf-bhero-bgart::before{opacity:1;background:linear-gradient(135deg,rgba(184,236,114,.42),rgba(29,47,11,.5)),repeating-linear-gradient(65deg,transparent 0 9px,rgba(184,236,114,.18) 9px 10px)}'+
  '.bhero.bf-state-dizzy .bf-bhero-bgart::before{opacity:1;background:linear-gradient(135deg,rgba(114,240,181,.42),rgba(11,73,52,.5)),repeating-conic-gradient(from 0deg at 50% 50%,rgba(114,240,181,.14),transparent 20deg)}'+
  // Agonizando: velo de sangre anime sobre el retrato + pulso rojo del rectángulo.
  '.bhero.bf-agonizing{box-shadow:0 0 0 2px rgba(255,30,30,.85),0 0 26px rgba(255,0,0,.6)!important;animation:bfAgonShake 1.1s ease-in-out infinite!important}'+
  '.bhero.bf-agonizing .bf-battle-art{filter:saturate(1.1) brightness(.7) drop-shadow(0 0 10px rgba(255,0,0,.7))!important}'+
  // (El velo de sangre real lo gestiona heroBloodFxPatch con un elemento dedicado)
  '@keyframes bfAgonShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-2px)}75%{transform:translateX(2px)}}'+
  '.bhero.bf-agonizing .bf-bhero-bgart::before{opacity:1;background:linear-gradient(135deg,rgba(255,30,30,.5),rgba(60,0,0,.6)),repeating-linear-gradient(90deg,transparent 0 12px,rgba(255,0,0,.16) 12px 13px)}'+
  '@keyframes bfBloodPulse{0%,100%{opacity:.5}50%{opacity:.85}}';
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
  function hookRender(){
    if(typeof window.renderBattle!=='function'||window.renderBattle.__bfAnimeBg)return;
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