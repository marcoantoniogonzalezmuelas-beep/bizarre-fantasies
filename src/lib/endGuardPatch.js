// RED DE SEGURIDAD DEL FIN DE PARTIDA y de los retratos finales.
//   1) FOTO FIJA de la alineación (hasta 3 héroes por bando) al empezar la batalla: la cinemática final
//      leía G.team justo en ese instante y, si ya no reflejaba a los héroes de la batalla, salían menos
//      retratos (o ninguno). Ahora cae a esta foto (nombre/id/arte) cuando G.team trae menos.
//   2) FIN FORZADO: si un bando se queda SIN UNIDADES VIVAS (misma regla que el motor: living(); los héroes
//      bizarros y las invocaciones son héroes como los demás) y la partida no ha terminado en 4 s, se llama
//      a checkWin(); si 4 s después sigue sin terminar, se da por terminada (solo el anfitrión / partida
//      local: el invitado recibe el estado). Queda un aviso en diagnósticos.
//   3) La cinemática final se arranca si la pantalla de resultado lleva 3 s sin ella.
export const END_GUARD_PATCH = `
<script>
(function(){
  if(window.__bfEndGuard)return;
  window.__bfEndGuard=1;
  window.__bfLineup={p:[],o:[]};
  var locked=false,since={p:0,o:0},nudgedAt=0,forced=false,resultSince=0,kicked=false;
  // La foto de la alineación NO se borra al reiniciar: se sustituye cuando empieza la siguiente batalla. Antes se
  // borraba y, si la misión reiniciaba la partida antes de la cinemática final, salía sin retratos.
  function reset(){locked=false;since={p:0,o:0};nudgedAt=0;forced=false;resultSince=0;kicked=false;}
  if(window.bfOnMatchReset)window.bfOnMatchReset(reset);

  // Arte del héroe por card_id / nombre (mapa que manda la página padre).
  window.bfLineupArt=function(h){
    try{
      var m=window.__bfCardArtMap||{};
      var e=m[h._token]||m[h.id]||m[h.card_id]||m[h.cid]||m[h.name];
      return e?((h.eliteMode&&e.elite)||e.base||''):'';
    }catch(x){return '';}
  };
  function team(side){try{return(G.team[side]||[]).filter(function(h){return h&&!h._bfDuck;}).slice(0,3);}catch(e){return [];}}
  function active(id){var e=document.getElementById(id);return !!(e&&e.classList.contains('active'));}
  function inGame(){return typeof G!=='undefined'&&G&&G.team&&typeof B!=='undefined'&&B;}
  // Retrato tal como se ve en el tablero (#b_<bando>_<id> .bf-battle-art): es la imagen que el jugador está viendo,
  // así que vale también para héroes de la base de datos, bizarros e invocaciones de misiones.
  function boardArt(side,h){
    try{
      var c=document.getElementById('b_'+side+'_'+h.id);if(!c)return '';
      var a=c.querySelector('.bf-battle-art')||c;
      var m=String(a.style.backgroundImage||'').match(/url\\(["']?([^"')]+)/);
      return m?m[1]:'';
    }catch(e){return '';}
  }
  function snapH(h,side,prev){
    var old=(prev||[]).find(function(x){return x.id===h.id;})||{};
    return {id:h.id,name:h.name,_token:h._token,card_id:h.card_id,cid:h.cid,eliteMode:!!h.eliteMode,alive:h.alive,snap:1,art:boardArt(side,h)||old.art||''};
  }
  // La foto se ACTUALIZA durante toda la batalla (con su retrato) y se congela al terminar: así refleja la batalla
  // que acaba de jugarse aunque sea la segunda o tercera de una misión.
  function capture(){
    if(!inGame()||B.over||!active('s-battle'))return;
    var p=team('p'),o=team('o');
    if(p.length&&o.length){var prev=window.__bfLineup||{p:[],o:[]};window.__bfLineup={p:p.map(function(h){return snapH(h,'p',prev.p);}),o:o.map(function(h){return snapH(h,'o',prev.o);})};locked=true;}
  }
  window.bfLineupArtFor=function(side,h){
    try{var L=((window.__bfLineup||{})[side])||[];var e=L.find(function(x){return x.id===h.id;})||L.find(function(x){return x.name===h.name;});return (e&&e.art)||'';}catch(x){return '';}
  };
  function isClient(){try{return typeof NET!=='undefined'&&NET&&NET.role==='client';}catch(e){return false;}}
  function report(msg){try{window.parent.postMessage({bfRelayError:{room_code:'',side:'',nick:'',error_type:'forced_end',action:'endGuard',error_message:msg}},'*');}catch(e){}}

  function tick(){
    try{
      capture();
      // ---- 3) la cinemática final arranca ----
      if(inGame()&&active('s-result')){
        if(!resultSince)resultSince=Date.now();
        if(!kicked&&Date.now()-resultSince>3000&&!document.getElementById('bf-end-cine')&&!window.__bfEndCineDoneAt&&typeof window.bfEndCinematic==='function'){
          kicked=true;window.__bfEndCine=0;try{window.bfEndCinematic();}catch(e){}
        }
      }else resultSince=0;
      // ---- 2) fin forzado ----
      if(!inGame()||B.over||G.demo||!active('s-battle')||isClient()){since.p=since.o=0;return;}
      ['p','o'].forEach(function(side){
        var all=(G.team[side]||[]).filter(function(h){return h&&!h._bfDuck;});
        var dead=all.length>0&&(typeof living==='function'?living(side).filter(function(h){return !h._bfDuck;}).length===0:all.every(function(h){return h.alive===false;}));
        since[side]=dead?(since[side]||Date.now()):0;
      });
      var side=(since.p&&since.o)?(since.p<=since.o?'p':'o'):(since.p?'p':(since.o?'o':''));
      if(!side){nudgedAt=0;return;}
      var age=Date.now()-since[side];
      if(age>4000&&!nudgedAt){nudgedAt=Date.now();if(typeof checkWin==='function')checkWin();return;}
      if(nudgedAt&&Date.now()-nudgedAt>4000&&!B.over&&!forced){
        forced=true;var pWin=side==='o';
        B.over=true;G._result={pWin:pWin};
        report('fin forzado: '+side+' sin héroes desde hace '+age+'ms');
        if(typeof showResult==='function')showResult(pWin);
        if(typeof netSync==='function'){try{netSync('s-result');}catch(e){}}
      }
    }catch(e){}
  }
  setInterval(tick,500);
  window.__bfEndGuardTick=tick;
})();
</script>
`;
