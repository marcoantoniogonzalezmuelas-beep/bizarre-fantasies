// Parche inyectado en el iframe: implementa el efecto REAL de la habilidad de
// Nixara (La Nigromante, card_id "nix", akind "drain").
//
// Bug del motor nativo: 'drain' NO está declarado en abilityNeedsEnemy() ni en
// abilityNeedsAlly(), así que el motor ejecuta el case 'drain' sin objetivo
// (t === undefined) → excepción → la habilidad no aplica nada y el turno no
// avanza (partida bloqueada).
//
// Implementación correcta (ambas versiones piden objetivos al jugador):
//   Normal (Drenaje Vital):  elige RIVAL → le roba HP; elige ALIADO → se lo cura.
//   Élite (Drenaje Masivo):  elige RIVAL → le roba MÁS HP; elige ALIADO → recibe
//                            la mitad y el resto se reparte entre los demás
//                            aliados vivos.
// Cualquier camino termina llamando a done() para que el turno avance.
export const NIXARA_ABILITY_PATCH = `
<script>
(function(){
  if (window.__bfNixaraAbilPatch) return;
  window.__bfNixaraAbilPatch = true;

  function isNix(h){ return h && (h.akind === 'drain' || h.id === 'nix' || h.cid === 'nix' || h.card_id === 'nix'); }

  function install(){
    if (typeof window.useAbility !== 'function' || window.__bfNixaraHooked) return false;
    if (typeof pendTarget !== 'function' || typeof dealDamage !== 'function') return false;
    window.__bfNixaraHooked = true;
    var orig = window.useAbility;

    window.useAbility = function(side, h, done){
      if (!isNix(h) || (window.__bfSpecOwns && window.__bfSpecOwns(h))) return orig.apply(this, arguments);

      var el = !!h.eliteMode;
      var foesSide = (typeof enemySide === 'function') ? enemySide(side) : (side === 'p' ? 'o' : 'p');
      var allies = (typeof G !== 'undefined' && G.team) ? (G.team[side] || []) : [];
      function livingArr(arr){ return (arr || []).filter(function(x){ return x && x.alive; }); }
      function sync(){ if (typeof renderBattle === 'function') renderBattle(); if (typeof netSync === 'function') netSync('s-battle'); }
      function finish(){ h.abilityUsed = true; sync(); if (typeof done === 'function') done(); else if(typeof finishAct === 'function') finishAct(); }
      function healOne(a, amt){
        if (!a || amt <= 0) return 0;
        if (typeof heal === 'function') return heal(a, amt) || 0;
        var max = a.maxHp || a.hp || amt, before = a.hp || 0;
        a.hp = Math.min(max, before + amt);
        return a.hp - before;
      }

      try {
        var base = (typeof stat === 'function') ? stat(h, 'he') : (h.he || 10);
        var power = el ? Math.round(base * 1.25) + 6 : Math.round(base * 1.1);

        // 1) El jugador elige el RIVAL al que drenar la vida.
        window.bfChooseAbilityTarget(side, el ? 'Rival a drenar (Drenaje Masivo)' : 'Rival a drenar', foesSide, function(foe){
          var drained = 0;
          try {
            if (typeof pushFx === 'function') {
              pushFx({ k: 'spell', toSide: (typeof tSide === 'function' ? tSide(foe) : foesSide), toId: foe.id, el: 'arcano' });
            }
            drained = dealDamage(foe, power, { type: 'spell', element: 'arcano' }) || 0;
            if (typeof pushLog === 'function') {
              pushLog('ld', h.name + ' drena la vida de ' + foe.name + ' (-' + drained + ').');
            }
          } catch (e) {}

          var pool = livingArr(allies);
          if (drained <= 0 || pool.length === 0) { finish(); return; }

          // 2) El jugador elige el ALIADO que recibe la vida robada.
          window.bfChooseAbilityTarget(side, 'Aliado que recibe la vida', side, function(ally){
            try {
              if (el && pool.length > 1) {
                // Élite: el aliado elegido recibe la mitad; el resto se reparte
                // entre los demás aliados vivos.
                var mine = Math.ceil(drained / 2);
                var got = healOne(ally, mine);
                var others = pool.filter(function(a){ return a !== ally; });
                var rest = drained - mine;
                var share = Math.floor(rest / others.length), extra = rest - share * others.length;
                var spread = 0;
                others.forEach(function(a, i){ spread += healOne(a, share + (i < extra ? 1 : 0)); });
                if (typeof pushLog === 'function') {
                  pushLog('lh', h.name + ': ' + ally.name + ' recupera +' + got + ' y reparte +' + spread + ' entre sus aliados.');
                }
              } else {
                var g = healOne(ally, drained);
                if (typeof pushLog === 'function') {
                  pushLog('lh', h.name + ' transfiere la vida robada a ' + ally.name + ' (+' + g + ').');
                }
              }
              if (typeof pushFx === 'function') {
                pushFx({ k: 'status', side: (typeof tSide === 'function' ? tSide(ally) : side), id: ally.id, txt: '✚' });
              }
            } catch (e) {}
            finish();
          }, {noCancel:true});
        });
      } catch (e) {
        finish(); // nunca bloquear la partida
      }
    };
    return true;
  }

  var tries = 0;
  var timer = setInterval(function(){
    if (install() || tries++ > 200) clearInterval(timer);
  }, 150);
  install();
})();
</script>
`;