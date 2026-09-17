// Habilidades de los HÉROES BIZARROS (tokens). Antes se repartían por "akind",
// pero varios tokens comparten el mismo akind heredado del juego original y sus
// habilidades no hacían nada. Ahora cada bizarro se resuelve por su card_id:
//
//   tk_caj (La Caja de Zapatos) — normal: PIFIA (gag, no pasa nada);
//                                 élite:  1 de daño imparable a un rival + HUMILLAR (-4 stats, 2 turnos).
//   tk_buf (La Butifarra)       — normal: PIFIA; élite: -4 a los stats de todos los rivales (2 turnos).
//   tk_lav (La Lavadora)        — normal: PIFIA; élite: aturde por completo a un rival 2 turnos.
//   tk_ban (El Bañador)         — deja Confuso a un rival (pierde 2 / 3 turnos).
//   tk_pez (El Pez Espada)      — emborracha a un rival: -3 stats y 3 de daño (2 / 3 turnos).
//
// Las invocaciones (Patito, Grulla, Unicornio, Pegaso) las resuelven sus
// propios parches y no se tocan aquí.
//
// Todos los estados usan campos nativos del motor (_mods negativos y skip), así
// que el objeto "Sanar" los limpia igual que el resto.
export const TOKEN_ABILITIES_PATCH = `
<script>
(function(){
  if(window.__bfTokenAbilPatch) return;
  window.__bfTokenAbilPatch = true;

  // Solo estos bizarros se gestionan aquí (los demás tienen su propio parche).
  var OWN = ['tk_caj', 'tk_buf', 'tk_lav', 'tk_ban', 'tk_pez'];

  function tokId(h){
    var raw = String((h && (h._token || h.cid || h.card_id || h.id)) || '');
    return OWN.indexOf(raw) >= 0 ? raw : '';
  }

  function install(){
    if(typeof window.useAbility !== 'function' || window.__bfTokenAbilHooked) return false;
    if(typeof G === 'undefined') return false;
    window.__bfTokenAbilHooked = true;
    var orig = window.useAbility;

    window.useAbility = function(side, h, done){
      var id = tokId(h);
      if(!id) return orig.apply(this, arguments);

      // Multiplayer: el invitado NO resuelve la habilidad en local (aplicaría
      // estados y daño que el anfitrión sobrescribe, dejando el turno colgado).
      // Envía el intent y espera el estado autoritativo del anfitrión.
      if(typeof NET !== 'undefined' && NET.role === 'client' && typeof sendIntent === 'function'){
        sendIntent('ability', {});
        return;
      }

      var el = !!h.eliteMode;
      var foes = enemySide(side);
      var name = el ? (h.eAbility || h.ability) : (h.ability || h.name);
      var finish = function(){ h.abilityUsed = true; if(typeof done === 'function') done(); };

      // Cinemática 3D del bizarro. El hook genérico de abilityAnimPatch ignora
      // los tokens (akind tk_*), así que cada habilidad la lanza aquí al
      // aplicarse (después de elegir objetivo, no antes).
      function cine(){
        if(typeof window.__bfPlayAbilityAnim === 'function'){ try{ window.__bfPlayAbilityAnim(side, h, true); }catch(e){} }
      }

      function sync(){
        if(typeof renderBattle === 'function') renderBattle();
        if(typeof netSync === 'function') netSync('s-battle');
      }

      // Gag intencional: la habilidad no produce ningún efecto → cinemática 3D
      // + letras y efecto visual de PIFIA sobre el bizarro.
      function applyNone(){
        cine();
        pushLog('lx', '\\u{1F3B2} ' + h.name + ' \\u2014 ' + name + ': PIFIA, no produce ning\\u00fan efecto.');
        if(typeof window.__bfFumblePop === 'function') window.__bfFumblePop(side, h.id, false, 0);
        else pushFx({k:'status', side:side, id:h.id, txt:'\\u{1F4A9}'});
        sync(); finish();
      }

      // Caja de Zapatos élite — Zapatillazo: cinemática 3D + 1 de daño que
      // ignora defensa a UN rival tarjeteado, y lo humilla (HUMILLAR: -4 a
      // todos sus stats, 2 turnos, igual que la habilidad del Pijo).
      function applyShoe(t){
        cine();
        pushFx({k:'status', side:tSide(t), id:t.id, txt:'\\u{1F45E}'});
        var d = dealDamage(t, 1, {type:'true'});
        t._mods.push({cc:-4, ad:-4, he:-4, vel:-4, turns:2});
        pushLog('ld', name + ' \\u2192 ' + t.name + ' (-' + d + ', ignora defensa) y queda HUMILLADO (-4 stats, 2 turnos).');
        sync(); finish();
      }

      // Butifarra élite — Gases Tóxicos: -4 stats a todos los rivales (2 turnos).
      function applyDizzyAll(){
        cine();
        living(foes).forEach(function(x){
          x._mods.push({cc:-4, ad:-4, he:-4, vel:-4, turns:2});
          pushFx({k:'status', side:tSide(x), id:x.id, txt:'\\u{1F635}'});
        });
        pushLog('li', name + ': todos los rivales se marean (-4 stats, 2 turnos).');
        sync(); finish();
      }

      // Lavadora élite — Programa Delicado: aturdimiento total 2 turnos.
      function applyStun(t){
        cine();
        t.skip = Math.max(t.skip || 0, 2);
        t.para = Math.max(t.para || 0, 2);
        pushFx({k:'status', side:tSide(t), id:t.id, txt:'\\u{1F300}'});
        pushLog('li', name + ' aturde por completo a ' + t.name + ' (2 turnos).');
        sync(); finish();
      }

      // Bañador — Paella: estado CONFUSO 2 / 3 turnos (50% de fallar cada
      // acción). Usa el campo _bfConfused, que es el que pinta el rótulo
      // "★ CONFUSO" en el retrato y aplica el fallo por turno.
      function applyConfuse(t){
        cine();
        var turns = el ? 3 : 2;
        t._bfConfused = Math.max(t._bfConfused || 0, turns);
        pushFx({k:'status', side:tSide(t), id:t.id, txt:'\\u2605'});
        pushLog('li', name + ' deja CONFUSO a ' + t.name + ' (' + turns + ' turnos, 50% de fallar cada acci\\u00f3n).');
        sync(); finish();
      }

      // Pez Espada — Licor: estado BORRACHO (rótulo ◉ BORRACHO en el retrato,
      // 35% de fallar cada acción) + -3 stats y 3 de daño (2 / 3 turnos).
      function applyDrunk(t){
        cine();
        var turns = el ? 3 : 2;
        t._bfDrunk = Math.max(t._bfDrunk || 0, turns);
        t._mods.push({cc:-3, ad:-3, he:-3, vel:-3, turns:turns});
        var d = dealDamage(t, 3, {type:'true'});
        pushFx({k:'status', side:tSide(t), id:t.id, txt:'\\u25c9'});
        pushLog('li', name + ' emborracha a ' + t.name + ' (-3 stats, -' + d + ', ' + turns + ' turnos, 35% de fallar).');
        sync(); finish();
      }

      // Objetivo: el humano elige; la IA va al rival con menos vida.
      function pickFoe(cb){
        if(window.bfAbilityHuman(side)){
          pendTarget('Objetivo de ' + name, foes, cb);
        } else {
          var t = living(foes).sort(function(a, b){ return a.hp - b.hp; })[0];
          if(t) cb(t); else finish();
        }
      }

      if(id === 'tk_caj'){ el ? pickFoe(applyShoe) : applyNone(); return; }
      if(id === 'tk_buf'){ el ? applyDizzyAll() : applyNone(); return; }
      if(id === 'tk_lav'){ el ? pickFoe(applyStun) : applyNone(); return; }
      if(id === 'tk_ban'){ pickFoe(applyConfuse); return; }
      if(id === 'tk_pez'){ pickFoe(applyDrunk); return; }

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