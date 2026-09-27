// Parche inyectado en el iframe: la IA USA en batalla las cartas nuevas
// (El Anillo, Drenaje, Rearmar, El Ladrón Enmascarado y Reanimación Arcana).
// El motor original solo sabía usar curas/revivir/maná. Se envuelve aiTurn
// ANTES que aiWaitCinePatch (queda por dentro), así la IA sigue esperando a que
// terminen las cinemáticas antes de actuar. Las cartas se resuelven con sus
// propios parches (useItem/castSpell), que eligen objetivo solos para la IA.
export const AI_NEW_CARDS_PATCH = `
<script>
(function(){
  if(window.__bfAiNewCards) return;
  window.__bfAiNewCards = true;

  function idxOf(side, kind){ return (G.items[side] || []).findIndex(function(o){ return o && o.kind === kind; }); }
  function hasSpell(side, id){ return (G.spellbook[side] || []).indexOf(id) >= 0; }
  function spellOk(h, id){ var s = byId(SPELLS, id); return s && h.mana >= s.mana && h.silence <= 0; }
  function pile(side){ return (G.itemDescarte && G.itemDescarte[side]) || []; }
  function canRearm(side){
    return pile(side).some(function(e){
      return e && (e.kind === 'mwep' || e.kind === 'rwep') && living(side).some(function(a){ return !a[e.kind]; });
    });
  }
  function guard(){
    // Rearmar tiene una cinemática de ~4,5 s: se aparta el vigilante para que
    // no fuerce el turno y se vuelve a armar después por seguridad.
    try{ clearWatchdog(); var qi = B.qi; setTimeout(function(){ if(B && !B.over && B.qi === qi) armWatchdog(); }, 6000); }catch(e){}
  }

  function tryNew(h, side){
    if(!B || B.over || !B.current || B.current.side !== side || (typeof humanCtl === 'function' && humanCtl(side))) return false;
    var foes = living(enemySide(side));
    if(!foes.length) return false;
    var ratio = h.hp / Math.max(1, h.maxHp);
    var i = idxOf(side, 'bf_ring');
    if(i >= 0 && !h._bfInvisible && (ratio < 0.5 || h.type === 'HE') && Math.random() < 0.55){ window.useItem(i); return true; }
    i = idxOf(side, 'bf_drain');
    if(i >= 0 && (ratio < 0.7 || Math.random() < 0.3) && Math.random() < 0.5){ window.useItem(i); return true; }
    i = idxOf(side, 'bf_rearm');
    if(i >= 0 && canRearm(side) && Math.random() < 0.6){ guard(); window.useItem(i); return true; }
    var foe = enemySide(side);
    if(hasSpell(side, 'sp_steal') && spellOk(h, 'sp_steal') && ((G.items[foe] || []).length + (G.spellbook[foe] || []).length) > 0 && Math.random() < 0.3){ window.castSpell('sp_steal'); return true; }
    if(hasSpell(side, 'sp_recover') && spellOk(h, 'sp_recover') && pile(side).length > 0 && Math.random() < 0.3){ window.castSpell('sp_recover'); return true; }
    return false;
  }

  // El motor se define después de los parches: intervalo corto para envolver
  // aiTurn antes que aiWaitCinePatch (200 ms) y quedar por dentro.
  var iv = setInterval(function(){
    if(typeof aiTurn !== 'function') return;
    clearInterval(iv);
    var orig = window.aiTurn;
    window.aiTurn = function(h, side){
      try{ if(tryNew(h, side)) return; }catch(e){}
      return orig.apply(this, arguments);
    };
    window.aiTurn.__bfAiNewCards = 1;
  }, 10);
})();
</script>
`;