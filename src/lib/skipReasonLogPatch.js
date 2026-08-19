// Parche: TRANSPARENCIA DEL ORDEN DE TURNOS.
// El orden de juego es SIEMPRE el de la barra de turnos. Cuando a un héroe le
// llega su turno pero no puede jugarlo (parálisis, sueño, congelación,
// silencio o cualquier "pierde turno"), el juego lo saltaba en silencio y
// parecía que los turnos estaban forzados. Ahora:
//  1) Se escribe en el registro por qué ese héroe no juega su turno.
//  2) Se garantiza el marcador visual en su retrato (PARALIZADO, DORMIDO,
//     CONGELADO…) para que se vea de un vistazo quién está incapacitado.
export const SKIP_REASON_LOG_PATCH = `
<script>
(function(){
  if(window.__bfSkipReasonLog)return;
  window.__bfSkipReasonLog=true;

  function reasonOf(h){
    if(!h)return null;
    if(h.para>0)return {ic:'⛓',lb:'PARALIZADO',txt:'está PARALIZADO y no puede jugar su turno'};
    if(h.frozen>0)return {ic:'❄',lb:'CONGELADO',txt:'está CONGELADO y no puede jugar su turno'};
    if(h.sleep>0)return {ic:'💤',lb:'DORMIDO',txt:'está DORMIDO y no puede jugar su turno'};
    if(h.skip>0)return {ic:'🚫',lb:'SIN TURNO',txt:'pierde su turno por un efecto en su contra'};
    return null;
  }

  // Marcador visual: si el héroe está paralizado/dormido/congelado, su retrato
  // lleva la clase de estado nativa aunque el repintado no la haya puesto.
  function markStates(){
    if(typeof G==='undefined'||!G||!G.team)return;
    ['p','o'].forEach(function(s){
      (G.team[s]||[]).forEach(function(h){
        var card=document.getElementById('b_'+s+'_'+h.id);
        if(!card)return;
        [['para','s-paralyzed'],['sleep','s-sleeping'],['frozen','s-frozen']].forEach(function(pair){
          var on=Number(h[pair[0]]||0)>0;
          if(on&&!card.classList.contains(pair[1]))card.classList.add(pair[1]);
          if(!on&&card.classList.contains(pair[1])&&!h[pair[0]])card.classList.remove(pair[1]);
        });
      });
    });
  }

  function install(){
    if(typeof window.stepTurn!=='function')return false;
    if(window.stepTurn.__bfSkipLog)return true;
    var original=window.stepTurn;
    window.stepTurn=function(){
      try{
        if(typeof B!=='undefined'&&B&&!B.over&&B.queue&&B.qi<B.queue.length){
          var slot=B.queue[B.qi];
          var h=(typeof getHero==='function'&&slot)?getHero(slot.side,slot.id):null;
          var r=reasonOf(h);
          if(h&&h.alive&&r){
            var key=(B.turn||0)+'|'+B.qi+'|'+slot.side+'|'+slot.id+'|'+r.lb;
            if(window.__bfSkipKey!==key){
              window.__bfSkipKey=key;
              if(typeof pushLog==='function')pushLog('li',r.ic+' '+h.name+' '+r.txt+'.');
            }
          }
        }
      }catch(e){}
      var out=original.apply(this,arguments);
      try{markStates();}catch(e){}
      return out;
    };
    window.stepTurn.__bfSkipLog=1;
    return true;
  }

  var iv=setInterval(function(){ if(install())clearInterval(iv); },300);
  install();
  setInterval(function(){ var sc=document.getElementById('s-battle'); if(sc&&sc.classList.contains('active'))markStates(); },600);
})();
</script>
`;