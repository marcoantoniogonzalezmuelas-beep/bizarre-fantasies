// Habilidad de Fast Everest Panzer (card_id "Fast").
//
// NORMAL — "Compresor Roto": tras la cinemática 3D se pide tarjetear a un rival
// y después se elige una de dos sabotajes:
//   · Bloquear su fase ÉLITE  → se marca eliteUsed, así que al morir cae de
//     verdad (el motor solo renace en élite si eliteUsed es false).
//   · Anular su habilidad     → abilityUsed = true en su forma actual (si algún
//     día renace élite, recupera habilidad, como pide la carta).
//
// ÉLITE — "Monedero Roto": rival vivo AL AZAR (no se elige) con −15 a todos sus
// stats durante todo el combate.
export const FAST_ABILITY_PATCH = `
<script>
(function(){
  if(window.__bfFastAbil) return;
  window.__bfFastAbil = true;

  function isFast(h){
    if(!h) return false;
    var id = String(h.id || h.cid || h.card_id || '').toLowerCase();
    var nm = String(h.name || '');
    return id === 'faseve' || id === 'fast' || nm === 'Fas Everest Panzer' || nm === 'Fast Everest Panzer';
  }

  function askChoice(foeName, cb){
    window.bfChoiceModal({
      icon:'⚙', title:'Compresor Roto', text:'Sabotaje contra ' + foeName + '. Elige qué le rompes:',
      options:[
        {key:'elite', icon:'⛔', label:'Bloquear su fase ÉLITE'},
        {key:'abil', icon:'✨', label:'Anular su habilidad actual'}
      ]
    }, cb);
  }

  function install(){
    if(typeof window.useAbility !== 'function' || window.__bfFastHooked) return false;
    if(typeof pendTarget !== 'function' || typeof G === 'undefined') return false;
    window.__bfFastHooked = true;
    var orig = window.useAbility;

    window.useAbility = function(side, h, done){
      if(!isFast(h)) return orig.apply(this, arguments);

      var foesSide = (typeof enemySide === 'function') ? enemySide(side) : (side === 'p' ? 'o' : 'p');
      function livingFoes(){
        var arr = (G.team && G.team[foesSide]) || [];
        return arr.filter(function(x){ return x && x.alive; });
      }
      function finish(){
        h.abilityUsed = true;
        if(typeof renderBattle === 'function') renderBattle();
        if(typeof netSync === 'function') netSync('s-battle');
        if(typeof done === 'function') done(); else if(typeof finishAct === 'function') finishAct();
      }

      try{
        // ÉLITE: rival vivo al azar, −15 a todos sus stats el resto del combate.
        if(h.eliteMode){
          var pool = livingFoes();
          if(!pool.length){ finish(); return; }
          var t = pool[Math.floor(Math.random() * pool.length)];
          t._mods = t._mods || [];
          t._mods.push({ cc:-15, ad:-15, he:-15, turns:99 });
          if(typeof pushFx === 'function') pushFx({ k:'status', side: foesSide, id: t.id, txt:'\\u25bc' });
          if(typeof pushLog === 'function') pushLog('li', h.name + ' \\u2014 Monedero Roto: ' + t.name + ' pierde 15 en todos sus stats.');
          finish();
          return;
        }

        function apply(foe, kind){
          if(kind === 'elite'){
            foe.eliteUsed = true;
            foe._bfNoElite = 1;
            if(typeof pushLog === 'function') pushLog('li', h.name + ' bloquea la fase \\u00c9LITE de ' + foe.name + ': cuando caiga, morir\\u00e1 definitivamente.');
          } else {
            foe.abilityUsed = true;
            foe._bfAbilityCineSuppressed = foe.eliteMode ? 'elite' : 'normal';
            if(typeof pushLog === 'function') pushLog('li', h.name + ' anula la habilidad de ' + foe.name + ' en su forma actual.');
          }
          if(typeof pushFx === 'function') pushFx({ k:'status', side: foesSide, id: foe.id, txt:'\\u2699\\ufe0f' });
          if(window.bfStatusPop) window.bfStatusPop(foesSide, foe.id, kind === 'elite' ? '\\u26D4 SIN \\u00c9LITE' : '\\u2728 SIN HABILIDAD');
          finish();
        }

        // IA: elige rival y sabotaje al azar, sin diálogo.
        if(!window.bfAbilityHuman(side)){
          var p2 = livingFoes();
          if(!p2.length){ finish(); return; }
          apply(p2[Math.floor(Math.random() * p2.length)], Math.random() < 0.5 ? 'elite' : 'abil');
          return;
        }

        pendTarget('Rival a sabotear (Compresor Roto)', foesSide, function(foe){
          askChoice(foe.name, function(kind){ apply(foe, kind); });
        });
      }catch(e){ finish(); }
    };
    return true;
  }

  var n = 0, iv = setInterval(function(){ if(install() || n++ > 200) clearInterval(iv); }, 150);
  install();
})();
</script>
`;