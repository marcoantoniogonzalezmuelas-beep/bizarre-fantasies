// Parche inyectado en el iframe: implementa la habilidad de Juniana
// (Refracción Arcana / Supernova Espejada, card_id "juni").
//
// La habilidad es PASIVA: al activarse, reproduce la cinemática 3D, se marca
// como "EN JUEGO" (no se puede volver a activar) y pasa el turno. Mientras
// Juniana esté viva, cada vez que reciba daño refleja parte de ese valor:
//   Normal (Refracción Arcana): la mitad del daño recibido como daño mágico
//     a un enemigo aleatorio.
//   Élite (Supernova Espejada): el valor total recibido como daño mágico a
//     todos los enemigos vivos.
//
// Sigue el mismo patrón que craneSummonPatch (la Grulla): el botón de
// habilidad se muestra como "EN JUEGO" y se desactiva; el turno avanza con
// done()/finishAct().
export const JUNIANA_ABILITY_PATCH = `
<script>
(function(){
  if(window.__bfJunianaPatch) return;
  window.__bfJunianaPatch = true;

  function isJun(h){ return h && (h.id === 'juni' || h.cid === 'juni' || h.card_id === 'juni' || h.akind === 'Jdjdjjxjx'); }

  function foesOf(side){
    var fs = (typeof enemySide === 'function') ? enemySide(side) : (side === 'p' ? 'o' : 'p');
    return (typeof living === 'function') ? living((typeof G !== 'undefined' && G.team) ? (G.team[fs] || []) : []) : [];
  }

  // Hook de useAbility: intercepta la activación de Juniana. Reproduce la
  // cinemática, marca la habilidad como pasiva (_bfRefract + abilityUsed) y
  // pasa el turno. No llama a orig: el akind nativo ("Jdjdjjxjx") no hace
  // nada útil en el motor.
  function installAbility(){
    if(typeof window.useAbility !== 'function' || window.__bfJunianaHooked) return false;
    window.__bfJunianaHooked = true;
    var orig = window.useAbility;
    window.useAbility = function(side, h, done){
      if(!isJun(h)) return orig.apply(this, arguments);
      try{
        h._bfRefract = true;
        h.abilityUsed = true;
        if(typeof window.__bfPlayAbilityAnim === 'function'){
          try{ window.__bfPlayAbilityAnim(side, h); }catch(e){}
        }
        var name = h.eliteMode ? (h.eAbility || h.ability || h.name) : (h.ability || h.name);
        if(typeof pushLog === 'function') pushLog('li', name + ' se activa: reflejar\\u00e1 el da\\u00f1o recibido mientras siga viva.');
        if(typeof pushFx === 'function') pushFx({k:'status', side:side, id:h.id, txt:'\\u2726'});
        if(typeof renderBattle === 'function') renderBattle();
        if(typeof netSync === 'function') netSync('s-battle');
      }catch(e){}
      if(typeof done === 'function') done(); else if(typeof finishAct === 'function') finishAct();
    };
    return true;
  }

  // Panel de acciones: muestra la habilidad como "EN JUEGO" y desactiva el
  // bot\\u00f3n (es pasiva, no se puede volver a pulsar). Igual que la Grulla.
  function markPassiveButton(){
    try{
      if(typeof B === 'undefined' || !B || !B.current) return;
      var h = (typeof getHero === 'function') ? getHero(B.current.side, B.current.id) : null;
      if(!h || !isJun(h) || !h._bfRefract) return;
      var btn = document.querySelector('.jrpg-btn.ability');
      if(!btn || btn.dataset.bfJuniana === '1') return;
      btn.dataset.bfJuniana = '1';
      btn.classList.add('disabled');
      btn.removeAttribute('onclick');
      btn.onclick = null;
      btn.style.pointerEvents = 'none';
      var name = h.ability || 'Refracci\\u00f3n Arcana';
      var lab = btn.querySelector('.jrpg-btn-label');
      var val = btn.querySelector('.jrpg-btn-val');
      if(lab) lab.innerHTML = '<span style="display:block;font-size:11px;color:#c79bff;letter-spacing:.6px">EN JUEGO</span><span style="display:block">' + name + '</span>';
      if(val){ val.textContent = '\\u2726'; val.style.color = '#c79bff'; }
      btn.title = name + ': pasiva - refleja el da\\u00f1o recibido.';
    }catch(e){}
  }

  // Hook de dealDamage: cuando Juniana con _bfRefract recibe da\\u00f1o, refleja
  // parte de ese valor como da\\u00f1o m\\u00e1gico al rival. El flag bfReflect
  // evita la recursi\\u00f3n infinita (el da\\u00f1o reflejado no vuelve a reflejarse).
  function installReflect(){
    if(typeof window.dealDamage !== 'function' || window.__bfJunianaReflectHooked) return false;
    window.__bfJunianaReflectHooked = true;
    var orig = window.dealDamage;
    window.dealDamage = function(target, dmg, opts){
      var applied = orig.apply(this, arguments);
      try{
        if(target && isJun(target) && target._bfRefract && Number(dmg) > 0 && !(opts && opts.bfReflect)){
          var side = (typeof tSide === 'function') ? tSide(target) : null;
          if(side){
            var foes = foesOf(side);
            if(foes.length){
              var el = !!target.eliteMode;
              var reflectDmg = el ? Math.round(Number(dmg)) : Math.round(Number(dmg) / 2);
              if(reflectDmg > 0){
                if(el){
                  foes.forEach(function(f){
                    dealDamage(f, reflectDmg, {type:'spell', element:'arcano', bfReflect:true});
                  });
                  if(typeof pushLog === 'function') pushLog('ld', (target.eAbility||target.ability||target.name) + ' refleja ' + reflectDmg + ' de da\\u00f1o m\\u00e1gico a todos los enemigos.');
                }else{
                  var tgt = foes[Math.floor(Math.random() * foes.length)];
                  dealDamage(tgt, reflectDmg, {type:'spell', element:'arcano', bfReflect:true});
                  if(typeof pushLog === 'function') pushLog('ld', (target.ability||target.name) + ' refleja ' + reflectDmg + ' de da\\u00f1o m\\u00e1gico a ' + tgt.name + '.');
                }
                if(typeof pushFx === 'function') pushFx({k:'status', side:side, id:target.id, txt:'\\u2726'});
                if(typeof renderBattle === 'function') renderBattle();
                if(typeof netSync === 'function') netSync('s-battle');
              }
            }
          }
        }
        // Si Juniana muere, desactiva el reflejo (hasta que reviva y reactiven).
        if(target && isJun(target) && !target.alive && target._bfRefract){
          target._bfRefract = false;
        }
      }catch(e){}
      return applied;
    };
    return true;
  }

  var tries = 0;
  var timer = setInterval(function(){
    installAbility();
    installReflect();
    if((window.__bfJunianaHooked && window.__bfJunianaReflectHooked) || tries++ > 200) clearInterval(timer);
  }, 150);
  setInterval(markPassiveButton, 250);
})();
</script>
`;