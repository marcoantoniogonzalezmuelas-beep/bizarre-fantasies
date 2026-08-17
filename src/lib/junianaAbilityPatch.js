// Parche inyectado en el iframe: implementa la habilidad de Juniana
// (Refracción Arcana / Supernova Espejada, card_id "juni").
//
// La habilidad es PASIVA: al activarse, reproduce la cinemática 3D, se marca
// como "EN JUEGO" (no se puede volver a activar) y pasa el turno. La refracción
// de daño (la mitad del daño recibido devuelta al atacante) la gestiona el
// propio motor del juego (patchDuckAbility en gameHtml) a través del akind
// 'reflect-damage'. Este parche SOLO añade la cinemática y el marcador
// "EN JUEGO"; NO duplica la lógica de refracción (antes lo hacía y causaba
// doble reflejo + objetivos equivocados).
export const JUNIANA_ABILITY_PATCH = `
<script>
(function(){
  if(window.__bfJunianaPatch) return;
  window.__bfJunianaPatch = true;

  function isJun(h){ return h && (h.id === 'juni' || h.cid === 'juni' || h.card_id === 'juni' || h.akind === 'reflect-damage' || h.akind === 'Jdjdjjxjx'); }

  // Hook de useAbility: intercepta la activación de Juniana. Reproduce la
  // cinemática, marca la habilidad como pasiva (_bfRefract + abilityUsed) y
  // pasa el turno. La refracción la hace el motor (akind 'reflect-damage').
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

  var tries = 0;
  var timer = setInterval(function(){
    installAbility();
    if(window.__bfJunianaHooked || tries++ > 200) clearInterval(timer);
  }, 150);
  setInterval(markPassiveButton, 250);
})();
</script>
`;