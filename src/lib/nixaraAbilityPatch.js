// Parche inyectado en el iframe: implementa el efecto REAL de la habilidad de
// Nixara (La Nigromante, card_id "nix"). El motor nativo reproduce la
// animación "drain" pero no aplica el efecto (no quita HP ni cura) y, al
// fallar, no avanza el turno → la partida se queda bloqueada.
//
// Aquí interceptamos useAbility para el héroe "nix" y aplicamos el drenaje:
//   Normal (Drenaje Vital):   quita 3 HP a cada rival vivo y reparte el total
//                             curando a todos los aliados vivos a partes iguales.
//   Élite (Drenaje Masivo):   quita 5 HP a cada rival vivo y reparte el total.
// Sea cual sea el resultado (sin rivales vivos, sin aliados…), SIEMPLEMTE
// llamamos a done() para que el turno avance. La animación la pone
// abilityFxPatch.js vía el escaneo de abilityUsed (familia 'drain' → magic).
export const NIXARA_ABILITY_PATCH = `
<script>
(function(){
  if (window.__bfNixaraAbilPatch) return;
  window.__bfNixaraAbilPatch = true;

  function isNix(h){ return h && (h.id === 'nix' || h.cid === 'nix' || h.card_id === 'nix'); }

  function install(){
    if (typeof window.useAbility !== 'function' || window.__bfNixaraHooked) return false;
    if (typeof G === 'undefined') return false;
    window.__bfNixaraHooked = true;
    var orig = window.useAbility;

    window.useAbility = function(side, h, done){
      if (!isNix(h)) return orig.apply(this, arguments);

      var el = !!h.eliteMode;
      var amt = el ? 5 : 3;
      var foes = (typeof enemySide === 'function') ? enemySide(side) : (G.team[(side === 'p') ? 'o' : 'p'] || []);
      var allies = G.team[side] || [];

      function living(arr){ return (arr || []).filter(function(x){ return x && x.alive; }); }
      function sync(){
        if (typeof renderBattle === 'function') renderBattle();
        if (typeof netSync === 'function') netSync('s-battle');
      }
      function finish(){ h.abilityUsed = true; if (typeof done === 'function') done(); }

      var livingFoes = living(foes);
      var livingAllies = living(allies);
      var drained = 0;

      // Roba HP a cada rival vivo.
      livingFoes.forEach(function(t){
        if (typeof dealDamage === 'function') {
          drained += dealDamage(t, amt, { type: 'true' }) || 0;
        } else {
          var before = t.hp || 0;
          t.hp = Math.max(0, before - amt);
          drained += (before - t.hp);
        }
        if (typeof pushFx === 'function') {
          var ts = (typeof tSide === 'function') ? tSide(t) : ((side === 'p') ? 'o' : 'p');
          pushFx({ k: 'status', side: ts, id: t.id, txt: '🩸' });
        }
      });

      // Reparte lo drenado entre todos los aliados vivos a partes iguales.
      if (drained > 0 && livingAllies.length > 0) {
        var share = Math.floor(drained / livingAllies.length);
        var rem = drained - share * livingAllies.length;
        livingAllies.forEach(function(a, i){
          var heal = share + (i < rem ? 1 : 0);
          var max = a.maxHp || a.maxhp || (a.hp ? a.hp + heal : heal);
          a.hp = Math.min(max, (a.hp || 0) + heal);
          if (typeof pushFx === 'function') {
            var ts2 = (typeof tSide === 'function') ? tSide(a) : side;
            pushFx({ k: 'status', side: ts2, id: a.id, txt: '✚' });
          }
        });
      }

      var abilityName = el ? (h.eAbility || h.ability || h.name) : (h.ability || h.name);
      if (typeof pushLog === 'function') {
        pushLog('li', abilityName + ': drena ' + drained + ' HP de ' + livingFoes.length + ' rival(es) y reparte ' + drained + ' entre ' + livingAllies.length + ' aliado(s).');
      }

      sync();
      finish(); // SIEMPRE avanza el turno, aunque no hubiera rivales/aliados.
    };
    return true;
  }

  var tries = 0;
  var timer = setInterval(function(){
    if (install() || tries++ > 120) clearInterval(timer);
  }, 150);
  install();
})();
</script>
`;