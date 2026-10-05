// REPINTADO ESTABLE de la batalla. El motor reconstruye TODO el tablero en cada repintado (la mano, cada carta de
// héroe...): las imágenes se volvían a cargar y los retratos "saltaban" aunque no hubiera cambiado nada.
// Ahora, tras cada repintado:
//   · todo elemento con id que haya quedado EXACTAMENTE igual se sustituye por el que ya estaba en pantalla
//     (ya pintado: ni parpadea ni se mueve);
//   · en los que sí cambian (p. ej. un héroe pierde vida), se reutilizan sus imágenes ya cargadas.
export const STEADY_RENDER_PATCH = `
<script>
(function(){
  if(window.__bfSteadyRender)return;
  window.__bfSteadyRender=true;
  function root(){ return document.getElementById('s-battle'); }
  // HUELLA DE LA MANO: todo lo que la mano muestra (cartas, de quién es el turno y su maná, si está silenciado o con la
  // mano bloqueada, si hay algo pendiente, los descartes). Si no cambia, la mano ya pintada se conserva tal cual.
  // Huella del estado con el que se pintó la mano que hay ahora en pantalla (se guarda al terminar cada repintado).
  var paintedSig={p:null,o:null};
  function handSig(side){
    try{
      var cur=(typeof B!=='undefined'&&B)?B.current:null,h=(cur&&typeof getHero==='function')?getHero(cur.side,cur.id):null;
      return JSON.stringify([
        (G.spellbook&&G.spellbook[side])||[],
        ((G.items&&G.items[side])||[]).map(function(i){ return (i&&i.id)+(i&&i._bfRecoveredEq?'*':''); }),
        cur?(cur.side+':'+cur.id):'',
        h?[h.mana,h.silence||0,h._bfHandBlocked||0,!!h.abilityUsed,!!h.alive]:0,
        !!(B&&B.pending),!!(B&&B.over),
        ((G.itemDescarte&&G.itemDescarte[side])||[]).length,((G.spellDescarte&&G.spellDescarte[side])||[]).length
      ]);
    }catch(e){ return String(Math.random()); }
  }
  function snapshot(){
    var r=root(),byId={},imgs={};
    if(!r)return null;
    var els=r.querySelectorAll('[id]');
    for(var i=0;i<els.length;i++){ var e=els[i]; if(e.id&&!byId[e.id])byId[e.id]={node:e}; }
    var im=r.querySelectorAll('img[src]');
    for(var j=0;j<im.length;j++){ var s=im[j].getAttribute('src'); if(s&&im[j].complete){ (imgs[s]=imgs[s]||[]).push(im[j]); } }
    return {byId:byId,imgs:imgs};
  }
  function restore(snap,first){
    var r=root();
    if(!r||!snap)return;
    // 1) Elementos idénticos: se devuelve el que ya estaba (de fuera hacia dentro: el primero que coincide gana).
    var els=r.querySelectorAll('[id]'),done=[];
    for(var i=0;i<els.length;i++){
      var e=els[i],old=snap.byId[e.id];
      if(!old||old.node===e||!e.parentNode)continue;
      var inside=false;for(var d=0;d<done.length;d++){ if(done[d].contains(e)){ inside=true; break; } }
      if(inside)continue;
      // isEqualNode compara contenido y atributos SIN importar su orden (los parches los añaden en distinto orden).
      if(e.isEqualNode(old.node)){ e.parentNode.replaceChild(old.node,e); done.push(old.node); }
    }
    // 1b) La mano: si su huella no ha cambiado, se conserva la que ya estaba pintada (con todos sus adornos).
    if(first)['p','o'].forEach(function(side){
      var cur=document.getElementById('hand_'+side),old=snap.byId['hand_'+side],now=handSig(side);
      if(cur&&old&&old.node!==cur&&cur.parentNode&&paintedSig[side]!==null&&paintedSig[side]===now)cur.parentNode.replaceChild(old.node,cur);
      paintedSig[side]=now;
    });
    // 2) Imágenes ya cargadas con la misma dirección: se reutilizan (sin recargar el retrato).
    var im=r.querySelectorAll('img[src]');
    for(var j=0;j<im.length;j++){
      var n=im[j];if(n.complete&&n.naturalWidth)continue;
      var s=n.getAttribute('src'),pool=snap.imgs[s];
      if(!pool||!pool.length)continue;
      var o=pool.shift();if(!o||o===n||r.contains(o)||!n.parentNode)continue;
      o.className=n.className;o.style.cssText=n.style.cssText;if(n.alt)o.alt=n.alt;
      n.parentNode.replaceChild(o,n);
    }
  }
  var depth=0;
  // Se instala UNA sola vez: reinstalarse cada medio segundo apilaba capas sin fin con otros parches (miles en una partida larga → "too much recursion" y turnos atascados).
  var hooked=false;
  function hook(){
    if(hooked||typeof window.renderBattle!=='function')return;
    hooked=true;
    var orig=window.renderBattle;
    var w=function(){
      // Otros parches envuelven renderBattle después de este y el gancho se reinstala por encima: solo actúa la capa
      // MÁS EXTERNA de cada repintado (si no, la de dentro guardaba la huella nueva y la de fuera devolvía la mano vieja).
      if(depth>0)return orig.apply(this,arguments);
      depth++;
      var snap=null,out;
      try{ snap=snapshot(); }catch(e){}
      try{ out=orig.apply(this,arguments); } finally { depth--; }
      try{ restore(snap,true); }catch(e){}
      // Segunda pasada al instante siguiente: por si otro parche retoca las cartas justo después del repintado.
      setTimeout(function(){ try{ restore(snap,false); }catch(e){} },0);   // (la mano solo se decide en la primera)
      return out;
    };
    w.__bfSteady=1;window.renderBattle=w;
  }
  hook();
  var iv=setInterval(function(){ hook(); if(hooked)clearInterval(iv); },700);
})();
</script>
`;
