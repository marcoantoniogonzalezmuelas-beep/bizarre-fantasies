// EMPATE: si los últimos héroes de LOS DOS bandos caen a la vez (el Unicornio Kamikaze se inmola y mata al último
// rival siendo él el último de los suyos, un reflejo de Juniana que mata al atacante mientras ella cae...), el motor
// daba la victoria SIEMPRE al bando "p" (tú contra la IA; el anfitrión en línea), hiciera quien hiciera la jugada.
// Regla: gana el bando que hizo la jugada (el que tenía el turno). Queda anotado en el registro.
export const DRAW_RULE_PATCH = `
<script>
(function(){
  if(window.__bfDrawRule)return;
  window.__bfDrawRule=true;
  // Se instala UNA sola vez: reinstalarse cada medio segundo apilaba capas sin fin con otros parches (miles en una partida larga → "too much recursion" y turnos atascados).
  var hooked=false;
  function hook(){
    var cur=window.checkWin;
    if(hooked||typeof cur!=='function')return;
    hooked=true;
    var w=function(){
      try{
        if(typeof B!=='undefined'&&B&&!B.over&&typeof living==='function'&&living('p').length===0&&living('o').length===0){
          var actor=(B.current&&B.current.side)||'p';
          var pWin=actor==='p';
          var nm=(typeof G!=='undefined'&&G.names&&G.names[actor])||actor;
          if(typeof pushLog==='function')pushLog('lx','\\u2696\\ufe0f Caen a la vez los \\u00faltimos h\\u00e9roes de los dos bandos: gana quien hizo la jugada ('+nm+').');
          B.over=true;
          if(typeof clearWatchdog==='function')clearWatchdog();
          G._result={pWin:pWin,tie:true};G._gameOver=true;
          if(typeof NET!=='undefined'&&NET.role==='host'){
            if(typeof netSync==='function')netSync('s-battle');
            if(typeof netSend==='function')netSend({t:'end',pWin:pWin});
          }
          setTimeout(function(){showResult((typeof NET!=='undefined'&&NET.role==='client')?(pWin===(NET.mySide==='p')):pWin);},800);
          return true;
        }
      }catch(e){}
      return cur.apply(this,arguments);
    };
    w.__bfDraw=1;
    window.checkWin=w;
  }
  hook();
  var iv=setInterval(function(){ hook(); if(hooked)clearInterval(iv); },500);
})();
</script>
`;
