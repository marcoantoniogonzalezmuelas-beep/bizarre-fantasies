// Parche inyectado en el iframe: OBJETO "El Anillo" (nº 128, 10 monedas).
//
// Concede INVISIBILIDAD durante 2 turnos al héroe que lo usa: la misma
// mecánica que la habilidad élite de Monkgeta (flag _bfInvisible, gestionado
// por monkgetaAbilityPatch: no se le puede elegir, no recibe daño y se limpian
// sus estados negativos). El arte, nº y texto se sincronizan desde la BD y la
// cinemática 3D usa la ability_anim_url de la carta.
export const RING_OBJECT_PATCH = `
<script>
(function(){
  if(window.__bfRingObject) return;
  window.__bfRingObject = true;

  function injectObject(){
    if(typeof OBJECTS === 'undefined' || !OBJECTS) return false;
    if(OBJECTS.some(function(o){ return o && o.id === 'ob_ring'; })) return true;
    OBJECTS.push({ id:'ob_ring', name:'El Anillo', kind:'bf_ring', element:'arcano', tag:'arcano', cost:10, num:128, txt:'Concede a tu h\\u00e9roe INVISIBILIDAD durante 2 turnos: ning\\u00fan rival puede atacarle y no le afecta ning\\u00fan da\\u00f1o ni estado negativo.' });
    return true;
  }

  function resolveRing(side, item, user){
    user._bfInvisible = 2;
    user._bfInvisibleFresh = 1;
    user._bfInvisSrc = 'ring';
    user.sleep = 0; user.para = 0; user.skip = 0; user.silence = 0; user.mark = null;
    var idx = (G.items[side] || []).indexOf(item);
    if(idx >= 0){
      G.items[side].splice(idx, 1);
      if(typeof window.bfDiscardPush === 'function'){ try{ window.bfDiscardPush(side, { id:item.id, kind:'object', name:item.name, num:item.num }); }catch(e){} }
    }
    if(typeof pushLog === 'function') pushLog('li', '\\ud83d\\udc8d ' + item.name + ': ' + user.name + ' se vuelve INVISIBLE durante dos turnos.');
    if(typeof pushFx === 'function') pushFx({ k:'bfItemCine', name:item.name });
    try{ if(typeof window.__bfPlayItemCine === 'function') window.__bfPlayItemCine(item.name); }catch(e){}
    if(typeof renderBattle === 'function') renderBattle();
    if(typeof netSync === 'function') netSync('s-battle');
    if(typeof finishAct === 'function') finishAct();
  }

  function hookUse(){
    if(typeof window.useItem !== 'function' || window.useItem.__bfRing) return false;
    var orig = window.useItem;
    var wrapped = function(idx){
      try{
        var side = (typeof B !== 'undefined' && B && B.current) ? B.current.side : 'p';
        var item = ((typeof G !== 'undefined' && G.items && G.items[side]) || [])[idx];
        if(item && item.kind === 'bf_ring'){
          if(typeof NET !== 'undefined' && NET && NET.role === 'client') return orig.apply(this, arguments);
          var user = (typeof getHero === 'function') ? getHero(side, B.current.id) : null;
          if(!user) return;
          resolveRing(side, item, user);
          return;
        }
      }catch(e){}
      return orig.apply(this, arguments);
    };
    wrapped.__bfRing = 1;
    window.useItem = wrapped;
    return true;
  }

  function hookUseAI(){
    if(typeof window.useItem_AI !== 'function' || window.useItem_AI.__bfRing) return false;
    var orig = window.useItem_AI;
    var wrapped = function(side, idx){
      try{
        var item = ((typeof G !== 'undefined' && G.items && G.items[side]) || [])[idx];
        if(item && item.kind === 'bf_ring'){
          var user = (B && B.current && B.current.side === side) ? getHero(side, B.current.id) : null;
          if(!user) return;
          resolveRing(side, item, user);
          return;
        }
      }catch(e){}
      return orig.apply(this, arguments);
    };
    wrapped.__bfRing = 1;
    window.useItem_AI = wrapped;
    return true;
  }

  // Solo se puede comprar UNA unidad de El Anillo en la fase de equipamiento.
  function hookBuy(){
    if(typeof window.buyObject !== 'function' || window.buyObject.__bfRingBuy) return false;
    var orig = window.buyObject;
    var wrapped = function(side, id){
      try{
        if(id === 'ob_ring' && ((G.items && G.items[side]) || []).some(function(i){ return i && i.id === 'ob_ring'; })){
          if(window.notif) window.notif('M\\u00e1ximo 1 copia de El Anillo.');
          return;
        }
      }catch(e){}
      return orig.apply(this, arguments);
    };
    wrapped.__bfRingBuy = 1;
    window.buyObject = wrapped;
    return true;
  }

  var tries = 0, iv = setInterval(function(){
    injectObject(); hookUse(); hookUseAI(); hookBuy();
    if(tries++ > 200) clearInterval(iv);
  }, 300);
  injectObject();
})();
</script>
`;