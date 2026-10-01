// TRANSICIÓN DEL PASO DE TURNO entre héroes en partidas ONLINE (host e invitado).
//
// Contra la IA el paso de turno se ve fluido; en multijugador el invitado solo recibe estados: el héroe
// activo cambiaba de golpe (sin ninguna transición) y los parches que suavizaban el paso se disparaban
// por funciones que solo ejecuta quien lleva la partida. Esta transición es POR ESTADO (mira B.current),
// así que funciona igual en los dos lados. Solo toca box-shadow/filter (nunca transform, que usan otros
// parches) y no hace nada fuera de online (la IA se queda exactamente como estaba).
export const TURN_GLIDE_PATCH = `
<script>
(function(){
  if(window.__bfTurnGlide)return;
  window.__bfTurnGlide=true;
  var st=document.createElement('style');
  st.textContent=[
    '@keyframes bfTurnIn{0%{filter:brightness(1);box-shadow:0 0 0 0 rgba(255,210,74,0)}30%{filter:brightness(1.18);box-shadow:0 0 24px 7px rgba(255,210,74,.65)}100%{filter:brightness(1);box-shadow:0 0 12px 2px rgba(255,210,74,.32)}}',
    '@keyframes bfTurnOut{0%{box-shadow:0 0 14px 3px rgba(255,210,74,.45)}100%{box-shadow:0 0 0 0 rgba(255,210,74,0)}}',
    '.bhero.bf-turn-in{animation:bfTurnIn .65s cubic-bezier(.2,.8,.3,1) both}',
    '.bhero.bf-turn-out{animation:bfTurnOut .45s ease-out both}'
  ].join('');
  document.head.appendChild(st);
  var lastKey='',prevKey='',inUntil=0,outUntil=0;
  function card(k){var p=k.split('_');return document.getElementById('b_'+p[0]+'_'+p.slice(1).join('_'));}
  function isOnline(){try{return typeof online==='function'&&online();}catch(e){return false;}}
  function paint(){
    var now=Date.now(),c;
    if(lastKey&&now<inUntil){c=card(lastKey);if(c&&!c.classList.contains('bf-turn-in'))c.classList.add('bf-turn-in');}
    if(prevKey&&now<outUntil){c=card(prevKey);if(c&&!c.classList.contains('bf-turn-out'))c.classList.add('bf-turn-out');}
  }
  function check(){
    if(!isOnline()||typeof B==='undefined'||!B||B.over||!B.current)return;
    var k=B.current.side+'_'+B.current.id;
    if(k!==lastKey){prevKey=lastKey;lastKey=k;inUntil=Date.now()+650;outUntil=Date.now()+450;}
    paint();
  }
  window.__bfTurnGlideCheck=check;
  if(window.bfOnMatchReset)window.bfOnMatchReset(function(){lastKey='';prevKey='';inUntil=0;outUntil=0;});
  function hookRender(){
    if(typeof window.renderBattle!=='function'||window.renderBattle.__bfGlide)return false;
    var orig=window.renderBattle;
    window.renderBattle=function(){var r=orig.apply(this,arguments);try{check();}catch(e){}return r;};
    window.renderBattle.__bfGlide=1;return true;
  }
  var t=0,iv=setInterval(function(){if(hookRender()||t++>200)clearInterval(iv);},200);
  setInterval(function(){try{check();}catch(e){}},120);
})();
</script>
`;
