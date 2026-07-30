// Parche inyectado en el iframe: implementa los efectos reales de las
// habilidades de los héroes token (Bizarros). Hasta ahora todos caían al
// `default` de useAbility (un ataque básico de fuego) y sus textos de
// "mareado/confuso/borracho" no tenían ningún efecto.
//
// Ahora cada akind hace lo que dice su carta:
//   tk_dizzy  (La Butifarra) — normal: nada (Petardeo); élite: -4 stats a todos los rivales 2 turnos.
//   tk_drunk  (El Pez Espada) — -3 stats + 3 daño a un rival (2/3 turnos).
//   tk_confuse (El Bañador) — confunde a un rival: pierde 2/3 turnos.
//   tk_none   (La Lavadora / La Caja) — gag: no pasa nada (intencional).
//
// Todos los estados usan campos nativos del motor (_mods negativos y skip),
// que el objeto "Sanar" (cleanse) ya elimina: filtra _mods negativos y
// resetea skip/para/silence. Así todo es eliminable con Sanar sin tocar el
// caso cleanse del juego.
export const TOKEN_ABILITIES_PATCH = `
<script>
(function(){
  if(window.__bfTokenAbilPatch) return;
  window.__bfTokenAbilPatch = true;

  function install(){
    if(typeof window.useAbility !== 'function' || window.__bfTokenAbilHooked) return false;
    if(typeof G === 'undefined') return false;
    window.__bfTokenAbilHooked = true;
    var orig = window.useAbility;

    window.useAbility = function(side, h, done){
      var k = h && h.akind;
      // Solo interceptamos los héroes token; el resto sigue su curso original.
      if(!k || String(k).indexOf('tk_') !== 0) return orig.apply(this, arguments);

      var el = !!h.eliteMode;
      var foes = enemySide(side);
      var finish = function(){ h.abilityUsed = true; if(typeof done === 'function') done(); };
      var name = el ? (h.eAbility || h.ability) : (h.ability || h.name);

      function sync(){
        if(typeof renderBattle === 'function') renderBattle();
        if(typeof netSync === 'function') netSync('s-battle');
      }

      // tk_dizzy élite — Gases Tóxicos: todos los rivales se marean (-4 stats, 2 turnos).
      function applyDizzy(){
        living(foes).forEach(function(x){
          x._mods.push({cc:-4, ad:-4, he:-4, vel:-4, turns:2});
          pushFx({k:'status', side:tSide(x), id:x.id, txt:'\u{1F635}'});
        });
        pushLog('li', name + ': todos los rivales se marean (-4 stats, 2 turnos).');
        sync(); finish();
      }

      // tk_drunk — Licor: -3 stats + 3 daño a un rival (2/3 turnos).
      function applyDrunk(t){
        var turns = el ? 3 : 2;
        t._mods.push({cc:-3, ad:-3, he:-3, vel:-3, turns:turns});
        var d = dealDamage(t, 3, {type:'true'});
        pushFx({k:'status', side:tSide(t), id:t.id, txt:'\u{1F974}'});
        pushLog('li', name + ' emborracha a ' + t.name + ' (-3 stats, -' + d + ', ' + turns + ' turnos).');
        sync(); finish();
      }

      // tk_confuse — Paella: confunde a un rival, pierde 2/3 turnos.
      function applyConfuse(t){
        var turns = el ? 3 : 2;
        t.skip = Math.max(t.skip || 0, turns);
        pushFx({k:'status', side:tSide(t), id:t.id, txt:'\u{1F300}'});
        pushLog('li', name + ' deja confuso a ' + t.name + ' (pierde ' + turns + ' turnos).');
        sync(); finish();
      }

      // tk_none / tk_dizzy normal — gag: no pasa nada (intencional).
      function applyNone(){
        pushFx({k:'status', side:side, id:h.id, txt:'\u{1F4A9}'});
        pushLog('li', h.name + ' usa ' + name + '… no pasa nada.');
        sync(); finish();
      }

      // Lógica de selección de objetivo (igual que el motor: humano elige, IA al de menos vida).
      function pickFoe(cb){
        if(humanCtl(side)){
          pendTarget('Objetivo de ' + name, foes, cb);
        } else {
          var t = living(foes).sort(function(a,b){ return a.hp - b.hp; })[0];
          if(t) cb(t); else finish();
        }
      }

      if(k === 'tk_dizzy'){ el ? applyDizzy() : applyNone(); return; }
      if(k === 'tk_none'){ applyNone(); return; }
      if(k === 'tk_drunk'){ pickFoe(applyDrunk); return; }
      if(k === 'tk_confuse'){ pickFoe(applyConfuse); return; }

      // Fallback (no debería alcanzarse): comportamiento original.
      return orig.apply(this, arguments);
    };
    return true;
  }

  var tries = 0;
  var timer = setInterval(function(){
    if(install() || tries++ > 120) clearInterval(timer);
  }, 150);
  install();
})();
</script>
`;