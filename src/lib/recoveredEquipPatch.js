// Parche inyectado en el iframe: EQUIPAR EN BATALLA un arma/armadura recuperada.
//
// "Reanimación Arcana" (y la acción recover_card de las habilidades) devuelve a
// la mano armas y armaduras de la pila de descartes. Hasta ahora esas cartas se
// quedaban en la mano sin poder usarse. Con este parche, al jugarlas durante el
// turno de uno de tus héroes se colocan GRATIS en el hueco que le falte:
//   · Si el héroe activo tiene ese hueco libre, se equipa directamente.
//   · Si lo tiene ocupado, se elige a qué héroe del equipo (con ese hueco
//     libre) se le pone para fortificarlo.
export const RECOVERED_EQUIP_PATCH = `
<script>
(function(){
  if (window.__bfRecoveredEquip) return;
  window.__bfRecoveredEquip = true;

  var SLOT_LBL = { mwep:'arma cuerpo a cuerpo', rwep:'arma a distancia', armor:'armadura' };

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
  // Los iconos de equipo del retrato se pintan una sola vez por héroe
  // (dataset.bfGear): al equipar en batalla hay que forzar su repintado.
  function refreshGear(side, id){
    try{
      var card = document.getElementById('b_' + side + '_' + id);
      if(!card) return;
      card.removeAttribute('data-bf-gear');
      var row = card.querySelector('.bf-battle-gear');
      if(row) row.remove();
    }catch(e){}
  }

  // UN SOLO ARMA por héroe (de momento ningún héroe puede llevar dos): al ponerle un arma, la que llevara —sea
  // cuerpo a cuerpo o a distancia— va a la pila de descartes.
  function dropWeapons(side, hero){
    ['mwep','rwep'].forEach(function(s){
      var old = hero && hero[s];
      if(!old) return;
      try{ if(!G.itemDescarte) G.itemDescarte = {p:[],o:[]}; if(!G.itemDescarte[side]) G.itemDescarte[side] = []; G.itemDescarte[side].push({ id:old.id, kind:s, name:old.name, num:old.num||0 }); }catch(e){}
      hero[s] = null;
      if(typeof pushLog==='function') pushLog('li', hero.name + ' deja ' + (old.name||'su arma') + ' en los descartes (solo se puede llevar un arma).');
    });
  }
  function equipOn(side, hero, item, slot){
    var tpl = tplFor(slot, item.id);
    var gear = tpl ? clone(tpl) : null;
    if(!gear){ if(typeof notif==='function') notif('No se pudo equipar ' + (item.name||'') + '.'); return false; }
    // ARMA: un solo arma por héroe → deja la que llevara (de cualquier tipo). ARMADURA: si ya llevaba una, la
    // vieja va a los descartes (y deja de sumar vida).
    if(slot==='mwep' || slot==='rwep') dropWeapons(side, hero);
    var old = (slot==='armor') ? hero[slot] : null;
    if(old){
      if(slot==='armor' && old.hp){ hero.maxHp = Math.max(1,(hero.maxHp||0) - old.hp); hero.hp = Math.max(1, Math.min(hero.hp||0, hero.maxHp)); }
      try{ if(!G.itemDescarte) G.itemDescarte = {p:[],o:[]}; if(!G.itemDescarte[side]) G.itemDescarte[side] = []; G.itemDescarte[side].push({ id:old.id, kind:slot, name:old.name, num:old.num||0 }); }catch(e){}
      if(typeof pushLog==='function') pushLog('li', hero.name + ' deja ' + (old.name||'su equipo') + ' en los descartes.');
    }
    hero[slot] = gear;
    // La armadura suma vida máxima (igual que al comprarla en equipamiento).
    if(slot==='armor' && gear.hp){ hero.maxHp = (hero.maxHp||0) + gear.hp; hero.hp = (hero.hp||0) + gear.hp; }
    var idx = (G.items[side]||[]).indexOf(item);
    if(idx >= 0) G.items[side].splice(idx, 1);
    if(typeof pushLog==='function') pushLog('lg', '\\u2694\\ufe0f ' + hero.name + ' se equipa ' + gear.name + ' (recuperada de los descartes).');
    if(typeof pushFx==='function') pushFx({ k:'shieldup', toSide:side, toId:hero.id });
    if(typeof notif==='function') notif(gear.name + ' \\u2192 ' + hero.name);
    refreshGear(side, hero.id);
    if(typeof renderBattle==='function') renderBattle();
    if(typeof netSync==='function') netSync('s-battle');
    return true;
  }

  function hook(){
    if(typeof window.useItem !== 'function' || window.useItem.__bfRecEq) return false;
    var orig = window.useItem;
    var wrapped = function(idx){
      try{
        var side = (typeof B!=='undefined' && B && B.current) ? B.current.side : 'p';
        var item = ((typeof G!=='undefined' && G.items && G.items[side]) || [])[idx];
        if(item && item._bfRecoveredEq){
          // El invitado no resuelve nada: el original manda la intención al host.
          if(typeof NET!=='undefined' && NET && NET.role==='client') return orig.apply(this, arguments);
          var slot = item._bfSlot || 'mwep';
          var hero = (typeof getHero==='function') ? getHero(side, B.current.id) : null;
          // Gastando la acción de este héroe, el equipo recuperado se le pone al ALIADO QUE QUIERAS (también a uno
          // que ya lleve algo en ese hueco: lo que llevaba va a los descartes).
          var cands = alive(side);
          if(!cands.length) return;
          var done = function(t){
            if(!t || !t.alive || cands.indexOf(t) < 0){ if(typeof notif==='function') notif('Elige a un h\\u00e9roe vivo de tu equipo.'); return; }
            if(equipOn(side, t, item, slot) && typeof finishAct==='function') finishAct();
          };
          if(cands.length === 1){ done(cands[0]); return; }
          if(((typeof window.bfAbilityHuman==='function' && window.bfAbilityHuman(side)) || (typeof humanCtl==='function' && humanCtl(side))) && typeof pendTarget==='function'){
            pendTarget('\\u00bfA qui\\u00e9n le pones ' + (item.name||'el equipo') + '?', side, done);
          } else {
            // IA: un aliado sin arma (o sin armadura, si es armadura), el más sano; si todos llevan, el más sano.
            var free = cands.filter(function(h){ return (slot==='armor') ? freeSlot(h, slot) : !(h.mwep || h.rwep); });
            done((free.length ? free : cands).slice().sort(function(a,b){ return (b.hp||0) - (a.hp||0); })[0]);
          }
          return;
        }
      }catch(e){}
      return orig.apply(this, arguments);
    };
    wrapped.__bfRecEq = 1;
    window.useItem = wrapped;
    return true;
  }

  var tries = 0, iv = setInterval(function(){ if(hook() || tries++ > 160) clearInterval(iv); }, 200);
})();
</script>
`;