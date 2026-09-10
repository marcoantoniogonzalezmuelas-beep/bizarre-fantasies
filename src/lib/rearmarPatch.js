// Parche inyectado en el iframe: objeto "Rearmar".
// Al usarlo, coge automáticamente un ARMA de la pila de descartes del jugador
// y la equipa en el héroe que se elija (gratis, sin gastar acción de compra).
// Si no hay armas en el descarte, avisa y no consume el objeto.
export const REARMAR_PATCH = `
<script>
(function(){
  if (window.__bfRearmarPatch) return;
  window.__bfRearmarPatch = true;

  var REARMAR_NAMES = ['Rearmar', 'Rearmar'];

  // Añade el objeto "Rearmar" al array OBJECTS del juego para que aparezca en
  // la tienda de equipamiento. El juego solo sincroniza por número dentro del
  // rango predefinido (83-91), así que los objetos nuevos con números fuera de
  // ese rango hay que añadirlos explícitamente (igual que Transformer/Reanimación).
  function ensureRearmarObject(){
    if (typeof OBJECTS === 'undefined' || !OBJECTS) return false;
    if (OBJECTS.some(function(o){ return o && o.id === 'ob_rearm'; })) return true;
    OBJECTS.push({
      id: 'ob_rearm',
      name: 'Rearmar',
      kind: 'bf_rearm',
      element: 'arcano',
      type: 'arcano',
      tag: 'arcano',
      cost: 8,
      num: 118,
      txt: 'Coge un arma de tu pila de descartes y la equipa en el h\\u00e9roe que elijas.',
      desc: 'Coge un arma de tu pila de descartes y la equipa en el h\\u00e9roe que elijas.'
    });
    // Fuerza un re-render de la tienda de equipamiento para que el objeto
    // aparezca inmediatamente sin esperar a que el jugador cambie de pestaña.
    try {
      if (typeof G !== 'undefined' && G && G.eqSide && typeof window.renderEquip === 'function') {
        window.renderEquip(G.eqSide);
      }
    } catch(e){}
    return true;
  }
  var objTries = 0, objIv = setInterval(function(){ if(ensureRearmarObject() || objTries++ > 160) clearInterval(objIv); }, 200);

  function clone(o){ try{ return (typeof deep==='function')?deep(o):JSON.parse(JSON.stringify(o)); }catch(e){ return null; } }
  function team(side){ try{ return (G && G.team && G.team[side]) || []; }catch(e){ return []; } }
  function alive(side){ return team(side).filter(function(h){ return h && h.alive; }); }
  function freeSlot(h, slot){ return !!(h && h.alive && !h[slot]); }
  function tplFor(slot, id){
    var arr = slot==='mwep' ? (typeof MELEE!=='undefined'?MELEE:[])
            : slot==='rwep' ? (typeof RANGED!=='undefined'?RANGED:[])
            : (typeof ARMORS!=='undefined'?ARMORS:[]);
    return (typeof byId==='function') ? byId(arr, id) : null;
  }
  function refreshGear(side, id){
    try{
      var card = document.getElementById('b_' + side + '_' + id);
      if(!card) return;
      card.removeAttribute('data-bf-gear');
      var row = card.querySelector('.bf-battle-gear');
      if(row) row.remove();
    }catch(e){}
  }

  function equipOn(side, hero, entry){
    var slot = entry.kind; // 'mwep' o 'rwep'
    var tpl = tplFor(slot, entry.id);
    var gear = tpl ? clone(tpl) : null;
    if(!gear){ if(typeof notif==='function') notif('No se pudo equipar el arma recuperada.'); return false; }
    hero[slot] = gear;
    if(typeof pushLog==='function') pushLog('lg', '\\u2694\\ufe0f Rearmar: ' + hero.name + ' se equipa ' + gear.name + ' (de la pila de descartes).');
    if(typeof pushFx==='function') pushFx({ k:'shieldup', toSide:side, toId:hero.id });
    if(typeof notif==='function') notif(gear.name + ' \\u2192 ' + hero.name);
    refreshGear(side, hero.id);
    if(typeof renderBattle==='function') renderBattle();
    if(typeof netSync==='function') netSync('s-battle');
    return true;
  }

  // Saca un ARMA de la pila de descartes del jugador (la primera que encuentre).
  function popWeaponFromDiscard(side){
    try{
      if(typeof window.bfDiscardPop !== 'function') return null;
      var pile = (G.itemDescarte && G.itemDescarte[side]) || [];
      // Busca la primera arma en la pila.
      var idx = -1;
      for(var i = 0; i < pile.length; i++){
        if(pile[i] && (pile[i].kind === 'mwep' || pile[i].kind === 'rwep')){ idx = i; break; }
      }
      if(idx < 0) return null;
      var entry = pile[idx];
      pile.splice(idx, 1);
      window.__bfDiscardJust = side;
      return entry;
    }catch(e){ return null; }
  }

  function hook(){
    if(typeof window.useItem !== 'function' || window.useItem.__bfRearmar) return false;
    var orig = window.useItem;
    var wrapped = function(idx){
      try{
        var side = (typeof B!=='undefined' && B && B.current) ? B.current.side : 'p';
        var item = ((typeof G!=='undefined' && G.items && G.items[side]) || [])[idx];
        if(item && REARMAR_NAMES.indexOf(item.name) >= 0){
          // El invitado no resuelve nada: el original manda la intención al host.
          if(typeof NET!=='undefined' && NET && NET.role==='client') return orig.apply(this, arguments);

          var entry = popWeaponFromDiscard(side);
          if(!entry){
            if(typeof notif==='function') notif('No hay armas en tu pila de descartes.');
            return;
          }
          var slot = entry.kind;
          var hero = (typeof getHero==='function') ? getHero(side, B.current.id) : null;
          var cands = alive(side).filter(function(h){ return freeSlot(h, slot); });
          if(!cands.length){
            if(typeof notif==='function') notif('Todos tus h\\u00e9roes vivos ya llevan ' + (slot==='mwep'?'arma cuerpo a cuerpo':'arma a distancia') + '.');
            // Devolver el arma a la pila si no se puede equipar a nadie.
            if(G.itemDescarte && G.itemDescarte[side]) G.itemDescarte[side].push(entry);
            return;
          }
          var done = function(t){
            if(!t || !freeSlot(t, slot)){
              if(typeof notif==='function') notif((t?t.name:'Ese h\\u00e9roe') + ' ya lleva esa arma.');
              if(G.itemDescarte && G.itemDescarte[side]) G.itemDescarte[side].push(entry);
              return;
            }
            if(equipOn(side, t, entry)){
              // Consumir el objeto Rearmar de la mano.
              var arr = (G.items && G.items[side]) || [];
              var i2 = arr.indexOf(item);
              if(i2 >= 0) arr.splice(i2, 1);
              if(typeof finishAct==='function') finishAct();
            }
          };
          // El héroe activo tiene el hueco libre → se equipa él mismo.
          if(hero && freeSlot(hero, slot)){ done(hero); return; }
          // Si no, se elige a quién armar (o lo decide la IA).
          if(cands.length === 1){ done(cands[0]); return; }
          if(typeof humanCtl==='function' && humanCtl(side) && typeof pendTarget==='function'){
            pendTarget('\\u00bfA qui\\u00e9n le pones el arma recuperada?', side, done);
          } else {
            done(cands.sort(function(a,b){ return (b.hp||0) - (a.hp||0); })[0]);
          }
          return;
        }
      }catch(e){}
      return orig.apply(this, arguments);
    };
    wrapped.__bfRearmar = 1;
    window.useItem = wrapped;
    return true;
  }

  var tries = 0, iv = setInterval(function(){ if(hook() || tries++ > 400) clearInterval(iv); }, 200);
})();
</script>
`;