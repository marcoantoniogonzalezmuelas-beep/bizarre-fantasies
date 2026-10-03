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
  function reset(){locked=false;since={p:0,o:0};nudgedAt=0;forced=false;resultSince=0;kicked=false;cineRetries=0;}
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
  var cineRetries=0;
  function esc(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function injectLineup(cineEl){
    try{
      var L=window.__bfLineup||{p:[],o:[]};
      var mySide=(typeof NET!=='undefined'&&NET&&NET.role==='client')?'o':((typeof NET!=='undefined'&&NET&&NET.mySide)||'p');
      var win=cineEl.classList.contains('bf-cine-victory');
      var winSide=win?mySide:(mySide==='p'?'o':'p'),rival=mySide==='p'?'o':'p';
      var mk=function(h,side,i){var won=side===winSide,u=h.art||(window.bfHeroArtFor&&window.bfHeroArtFor(h))||'';
        return '<div class="bf-cine-hero '+(won?'bf-cine-winner':'bf-cine-fallen')+'" style="--bf-delay:'+(i*.16+(side==='o'?.18:0))+'s;opacity:1;animation:none"><div class="bf-cine-portrait">'+(u?'<img src="'+esc(u)+'" alt="'+esc(h.name)+'">':'<span class="bf-cine-initial">'+esc(String(h.name||'?').charAt(0))+'</span>')+'</div><div class="bf-cine-name">'+esc(h.name||'Héroe')+'</div></div>';};
      var team=function(side){return (L[side]||[]).slice(0,3).map(function(h,i){return mk(h,side,i);}).join('');};
      if(!(L.p||[]).length&&!(L.o||[]).length)return;
      var box=cineEl.querySelector('.bf-cine-lineup');
      if(!box){box=document.createElement('div');box.className='bf-cine-lineup';cineEl.appendChild(box);}
      box.innerHTML='<div class="bf-cine-team bf-cine-local">'+team(mySide)+'</div><div class="bf-cine-vs">VS</div><div class="bf-cine-team bf-cine-rival">'+team(rival)+'</div>';
      try{window.parent.postMessage({bfRelayError:{room_code:'',side:'',nick:'',error_type:'server_error',action:'endCine',error_message:'[end_cine_lineup] animación final sin héroes: puestos desde la foto'}},'*');}catch(e){}
    }catch(e){}
  }
  function report(msg){try{window.parent.postMessage({bfRelayError:{room_code:'',side:'',nick:'',error_type:'forced_end',action:'endGuard',error_message:msg}},'*');}catch(e){}}

  function tick(){
    try{
      capture();
      // ---- 3) la cinemática final arranca ----
      if(inGame()&&active('s-result')){
        if(!resultSince)resultSince=Date.now();
        // a) La marca "ya mostrada" se pone ANTES de construir la animación: si algo fallaba a mitad, no volvía a
        //    salir en esa partida. Si a los 2 s hay marca pero no hay animación, se libera para que el juego la repita.
        var cineEl=document.getElementById('bf-end-cine');
        if(window.__bfEndCine===1&&!cineEl&&!window.__bfEndCineDoneAt&&Date.now()-resultSince>2000&&cineRetries<3){
          cineRetries++;window.__bfEndCine=0;
          try{window.parent.postMessage({bfRelayError:{room_code:'',side:'',nick:'',error_type:'server_error',action:'endCine',error_message:'[end_cine_retry] animación final reintentada '+cineRetries}},'*');}catch(e){}
        }
        // b) Los 6 héroes SIEMPRE dentro de la animación final: si salió sin ellos, se ponen con la foto de la batalla.
        if(cineEl&&!cineEl.dataset.bfLineupChecked&&Date.now()-resultSince>800){
          cineEl.dataset.bfLineupChecked='1';
          if(!cineEl.querySelector('.bf-cine-hero'))injectLineup(cineEl);
        }
        if(!kicked&&Date.now()-resultSince>3000&&!document.getElementById('bf-end-cine')&&!window.__bfEndCineDoneAt&&typeof window.bfEndCinematic==='function'){
          kicked=true;window.__bfEndCine=0;try{window.bfEndCinematic();}catch(e){}
        }
      }else{resultSince=0;cineRetries=0;}
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
