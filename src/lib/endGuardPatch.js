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
  function reset(){window.__bfLineup={p:[],o:[]};locked=false;since={p:0,o:0};nudgedAt=0;forced=false;resultSince=0;kicked=false;}
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
  function snapH(h){return {id:h.id,name:h.name,_token:h._token,card_id:h.card_id,cid:h.cid,eliteMode:!!h.eliteMode,alive:h.alive};}

  function capture(){
    if(locked||!inGame()||B.over||!active('s-battle'))return;
    var p=team('p'),o=team('o');
    if(p.length&&o.length){window.__bfLineup={p:p.map(snapH),o:o.map(snapH)};locked=true;}
  }
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
