import { STATUS_STATES } from '@/lib/statusSceneFx';

// Estados de batalla: SOLO rótulo + partículas repartidas por la escena.
// El "aura" (velos de color, degradados, filtros sobre el arte, bordes de neón
// y patrones de fondo) se ha eliminado por completo: era lo que provocaba la
// distorsión visual y el parpadeo.
//
// Este parche también conserva la lógica de los estados propios (confuso,
// borracho, mareado) y su consumo por turnos, además del marcador de AGONÍA.
const LABEL_CSS = STATUS_STATES.map((s) => (
  `.bhero.${s.cls}::after{content:"${s.ic} ${s.lb}";position:absolute;top:6px;right:8px;z-index:16;display:inline-flex;align-items:center;gap:5px;padding:3px 12px;border-radius:999px;background:linear-gradient(180deg,#141026f2,#05040be6);border:2px solid ${s.c};color:${s.c};font-family:Cinzel,serif;font-size:12px;font-weight:1000;letter-spacing:.4px;text-transform:uppercase;text-shadow:0 0 10px ${s.c},0 2px 4px #000;box-shadow:0 2px 10px rgba(0,0,0,.6);white-space:nowrap}`
)).join('');

const CLS_LIST = STATUS_STATES.map((s) => s.cls);

export const STATUS_AURA_PATCH = `
<script>
(function(){
  if(window.__bfStatusSceneFx) return;
  window.__bfStatusSceneFx = true;

  var STATES = ${JSON.stringify(STATUS_STATES)};
  var BY_CLS = {}; STATES.forEach(function(s){ BY_CLS[s.cls] = s; });
  var ORDER = ${JSON.stringify(CLS_LIST)};

  var css = '.bhero{position:relative!important}'
    + ${JSON.stringify(LABEL_CSS)}
    // El emblema nativo intermitente se retira: un solo indicador por estado.
    + '.bhero .bf-status-badge{display:none!important}'
    // Overlays nativos del juego (placa de hielo, patrones, velos): fuera.
    + 'html body .bhero .bf-pat,html body .bhero .bf-frost,html body .bhero .bf-fx-overlay{display:none!important}'
    // Capa de partículas sobre la escena de batalla
    + '.bf-decor-layer{position:absolute;inset:0;z-index:7;pointer-events:none;overflow:hidden;border-radius:inherit}'
    + '.bf-decor{position:absolute;transform:translate(-50%,-50%);line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.75))}'
    // Escarcha cayendo por toda la escena (congelado) — bucle continuo, sin
    // apagarse: opacidad plena de principio a fin para que no parpadee.
    + '.bf-decor-flake{color:#dffaff;text-shadow:0 0 8px #75e8ff,0 1px 2px #000;animation:bfFallLoop 4s linear infinite}'
    + '@keyframes bfFallLoop{0%{transform:translate(-50%,-50%) translateY(-20px) rotate(0)}100%{transform:translate(-50%,-50%) translateY(150px) rotate(220deg)}}'
    // Velitas NEGRAS (maldito): cera oscura + llama que titila
    + '.bf-decor-blackcandle{filter:brightness(.35) saturate(.2) drop-shadow(0 0 6px rgba(255,69,200,.7)) drop-shadow(0 2px 4px #000);animation:bfCandleFlicker 1.4s ease-in-out infinite}'
    + '@keyframes bfCandleFlicker{0%,100%{opacity:.85}50%{opacity:1}}'
    + '.bf-decor-skullrise{filter:drop-shadow(0 0 8px #ff45c8) drop-shadow(0 2px 4px #000);animation:bfRiseLoop 4.8s linear infinite}'
    + '@keyframes bfRiseLoop{0%{transform:translate(-50%,-50%) translateY(80px) scale(.75)}100%{transform:translate(-50%,-50%) translateY(-130px) scale(1.1)}}'
    + '.bf-decor-chain{transform-origin:top center;animation:bfSway 3.2s ease-in-out infinite}'
    + '@keyframes bfSway{0%,100%{transform:translate(-50%,-50%) rotate(-7deg)}50%{transform:translate(-50%,-50%) rotate(7deg)}}'
    + '.bf-decor-shackle{animation:bfSway 2.6s ease-in-out infinite}'
    + '.bf-decor-zzz{font-weight:900;color:#fff;text-shadow:0 0 8px #c792ff,0 2px 4px #000;animation:bfFloatZ 3.4s ease-out infinite}'
    + '@keyframes bfFloatZ{0%{transform:translate(-50%,-50%) scale(.6);opacity:0}25%{opacity:1}100%{transform:translate(-50%,calc(-50% - 44px)) scale(1.3);opacity:0}}'
    + '.bf-decor-bear{animation:bfSway 3.4s ease-in-out infinite}'
    + '.bf-decor-sparkle,.bf-decor-shield{animation:bfTwinkle 2.2s ease-in-out infinite}'
    + '@keyframes bfTwinkle{0%,100%{opacity:.55;transform:translate(-50%,-50%) scale(.9)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.15)}}'
    + '.bf-decor-star,.bf-decor-spiral{animation:bfSpin 3s linear infinite}'
    + '@keyframes bfSpin{from{transform:translate(-50%,-50%) rotate(0)}to{transform:translate(-50%,-50%) rotate(360deg)}}'
    + '.bf-decor-bubble{animation:bfRise 4s ease-in-out infinite}'
    + '@keyframes bfRise{0%{transform:translate(-50%,-50%);opacity:.5}50%{opacity:1}100%{transform:translate(-50%,calc(-50% - 22px));opacity:0}}'
    // Marcador de AGONÍA
    + '.bhero.bf-agonizing .bf-agonize-badge{position:absolute;left:150px;bottom:7px;z-index:17;display:inline-flex;align-items:center;gap:5px;padding:2px 9px;border-radius:999px;font-family:Cinzel,serif;font-size:10px;font-weight:1000;letter-spacing:.5px;text-transform:uppercase;color:#ffd0d0;background:linear-gradient(180deg,#3a0606f2,#1a0202e6);border:1.5px solid #ff4040}'
    // Ráfaga de habilidad
    + '.bf-ability-burst{position:absolute;inset:0;z-index:30;pointer-events:none;display:flex;align-items:center;justify-content:center;border-radius:inherit;overflow:hidden;background:radial-gradient(circle,rgba(255,255,255,.42),rgba(114,240,181,.2) 35%,transparent 70%);animation:bfAbilityBurst 1.25s ease-out forwards}'
    + '.bf-ability-burst b{padding:8px 13px;border-radius:999px;background:#080711e8;border:2px solid currentColor;font-family:Cinzel,serif;font-size:14px;color:#ffe27a;text-shadow:0 0 10px currentColor;box-shadow:0 0 22px currentColor}'
    + '.bf-ability-burst i{position:absolute;font-style:normal;font-size:28px;animation:bfAbilityOrbit 1.1s ease-out forwards}'
    + '.bf-ability-burst i:nth-child(2){transform:rotate(120deg) translateX(58px)}'
    + '.bf-ability-burst i:nth-child(3){transform:rotate(240deg) translateX(58px)}'
    + '@keyframes bfAbilityBurst{0%{opacity:0;transform:scale(.55)}25%{opacity:1;transform:scale(1.04)}100%{opacity:0;transform:scale(1.18)}}'
    + '@keyframes bfAbilityOrbit{0%{opacity:0;filter:blur(5px)}35%{opacity:1}100%{opacity:0;transform:rotate(420deg) translateX(78px)}}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function heroFor(card){
    var m = String(card.id || '').match(/^b_([po])_(.+)$/);
    return m && typeof G !== 'undefined' && G.team ? (G.team[m[1]] || []).find(function(h){ return h && h.id === m[2]; }) : null;
  }
  function hpRatio(card){
    var h = heroFor(card);
    if(h && h.maxHp > 0) return Math.max(0, Math.min(1, h.hp / h.maxHp));
    var m = String((card.querySelector('.bhero-hpnum') || {}).textContent || '').match(/(\\d+)\\s*\\/\\s*(\\d+)/);
    if(m) return Math.max(0, Math.min(1, parseInt(m[1],10) / Math.max(1, parseInt(m[2],10))));
    return 1;
  }
  function activeCls(card){
    for(var i = 0; i < ORDER.length; i++) if(card.classList.contains(ORDER[i])) return ORDER[i];
    return '';
  }
  function buildLayer(card, cls){
    var s = BY_CLS[cls]; if(!s) return;
    var layer = document.createElement('div');
    layer.className = 'bf-decor-layer';
    layer.dataset.bfFor = cls;
    (s.decor || []).forEach(function(d){
      var el = document.createElement('div');
      el.className = 'bf-decor bf-decor-' + d.t;
      el.textContent = d.e;
      el.style.left = d.x; el.style.top = d.y;
      if(d.sz) el.style.fontSize = d.sz + 'px';
      if(d.d) el.style.animationDelay = d.d + 's';
      if(d.dur) el.style.animationDuration = d.dur + 's';
      layer.appendChild(el);
    });
    card.appendChild(layer);
  }

  function decorate(){
    document.querySelectorAll('.bhero[id^="b_"]').forEach(function(card){
      var h = heroFor(card);
      var odd = h && h._bfConfused > 0 ? 'bf-state-confused' : h && h._bfDrunk > 0 ? 'bf-state-drunk' : h && h._bfDizzy > 0 ? 'bf-state-dizzy' : '';
      ['bf-state-confused','bf-state-drunk','bf-state-dizzy'].forEach(function(c){ if(c !== odd && card.classList.contains(c)) card.classList.remove(c); });
      if(odd && !card.classList.contains(odd)) card.classList.add(odd);

      var cls = activeCls(card);
      var layer = card.querySelector('.bf-decor-layer');
      // Solo se reconstruye cuando cambia el estado: así las partículas nunca
      // se reinician a media animación (era otra fuente de parpadeo).
      if(!cls){ if(layer) layer.remove(); }
      else if(!layer) buildLayer(card, cls);
      else if(layer.dataset.bfFor !== cls){ layer.remove(); buildLayer(card, cls); }

      var alive = h ? h.alive : !card.classList.contains('dead');
      var r = hpRatio(card), agon = alive && r > 0 && r <= 0.10;
      if(agon) card.classList.add('bf-agonizing'); else card.classList.remove('bf-agonizing');
      var ab = card.querySelector('.bf-agonize-badge');
      if(agon && !ab){ ab = document.createElement('div'); ab.className = 'bf-agonize-badge'; ab.innerHTML = '\\ud83e\\ude78 AGONIZANDO'; card.appendChild(ab); }
      else if(!agon && ab) ab.remove();
    });
  }

  function hookRender(){
    if(typeof window.renderBattle !== 'function' || window.renderBattle.__bfAura) return;
    var o = window.renderBattle;
    window.renderBattle = function(){ o.apply(this, arguments); try{ decorate(); }catch(e){} };
    window.renderBattle.__bfAura = 1;
  }

  function abilityBurst(side, hero, label, icons, color){
    var card = document.getElementById('b_' + side + '_' + hero.id);
    if(!card) return;
    var fx = document.createElement('div');
    fx.className = 'bf-ability-burst';
    fx.style.color = color || '#ffe27a';
    fx.innerHTML = '<b>' + label + '</b><i>' + icons[0] + '</i><i>' + icons[1] + '</i><i>' + icons[2] + '</i>';
    card.appendChild(fx);
    setTimeout(function(){ if(fx.parentNode) fx.remove(); }, 1300);
  }

  function installAbilities(){
    if(typeof window.useAbility !== 'function') return false;
    if(window.useAbility.__bfOddStates) return true;
    var original = window.useAbility;
    window.useAbility = function(side, hero, done){
      var kind = hero && hero.akind, isNoEffect = kind === 'tk_none' || (kind === 'tk_dizzy' && !hero.eliteMode);
      if(!hero || (!isNoEffect && kind !== 'tk_confuse' && kind !== 'tk_drunk' && kind !== 'tk_dizzy')) return original.apply(this, arguments);
      function complete(){ hero.abilityUsed = true; decorate(); if(typeof done === 'function') done(); else if(typeof finishAct === 'function') finishAct(); }
      if(isNoEffect){
        abilityBurst(side, hero, '\\u2726 ' + (hero.eliteMode ? (hero.eAbility || hero.ability) : (hero.ability || 'HABILIDAD')), ['\\u2728','\\ud83d\\udc5e','\\ud83d\\udcab'], '#ffe27a');
        if(typeof pushLog === 'function') pushLog('li','\\u2726 ' + hero.name + ' usa ' + (hero.eliteMode ? (hero.eAbility || hero.ability) : hero.ability) + '. Es espectacular, pero no altera la batalla.');
        complete(); return;
      }
      var foes = typeof enemySide === 'function' ? enemySide(side) : (side === 'p' ? 'o' : 'p');
      if(kind === 'tk_dizzy'){
        var turns = hero.eliteMode ? 3 : 2, targets = (typeof G !== 'undefined' && G.team && G.team[foes] || []).filter(function(h){ return h && h.alive; });
        targets.forEach(function(target){ target._bfDizzy = Math.max(target._bfDizzy || 0, turns); target._mods = target._mods || []; target._mods.push({cc:-4,ad:-4,he:-4,turns:turns}); if(typeof pushFx === 'function') pushFx({k:'status',side:foes,id:target.id,txt:'\\ud83c\\udf00'}); });
        abilityBurst(side, hero, '\\u2623 GASES T\\u00d3XICOS', ['\\u2601','\\u2623','\\ud83c\\udf00'], '#72f0b5');
        if(typeof pushLog === 'function') pushLog('li','\\u2623 ' + hero.name + ' marea a todos los rivales: -4 a CC, AD y HE durante ' + turns + ' turnos.');
        complete(); return;
      }
      var label = kind === 'tk_confuse' ? 'Rival a confundir' : 'Rival que beber\\u00e1 el licor';
      if(typeof pendTarget !== 'function') return original.apply(this, arguments);
      pendTarget(label, foes, function(target){
        var turns = hero.eliteMode ? 3 : 2;
        if(kind === 'tk_confuse'){
          target._bfConfused = Math.max(target._bfConfused || 0, turns);
          if(typeof pushLog === 'function') pushLog('li','\\u2605 ' + hero.name + ' deja CONFUSO a ' + target.name + ' durante ' + turns + ' turnos.');
          if(typeof pushFx === 'function') pushFx({k:'status',side:typeof tSide === 'function' ? tSide(target) : foes,id:target.id,txt:'\\u2605'});
        } else {
          target._bfDrunk = Math.max(target._bfDrunk || 0, turns);
          target._mods = target._mods || [];
          target._mods.push({cc:-3,ad:-3,he:-3,turns:turns});
          if(typeof dealDamage === 'function') dealDamage(target, 3, {type:'true'});
          if(typeof pushLog === 'function') pushLog('li','\\u25c9 ' + hero.name + ' emborracha a ' + target.name + ': -3 a sus atributos y 3 de da\\u00f1o.');
          if(typeof pushFx === 'function') pushFx({k:'status',side:typeof tSide === 'function' ? tSide(target) : foes,id:target.id,txt:'\\u25c9'});
        }
        complete();
      });
    };
    window.useAbility.__bfOddStates = 1; return true;
  }

  function installTurns(){
    if(typeof window.stepTurn !== 'function') return false;
    if(window.stepTurn.__bfOddStates) return true;
    var original = window.stepTurn;
    window.stepTurn = function(){
      if(typeof B !== 'undefined' && B && !B.over && B.queue && B.qi < B.queue.length){
        var slot = B.queue[B.qi], h = typeof getHero === 'function' ? getHero(slot.side, slot.id) : null;
        if(h && h.alive){
          if(h._bfConfused > 0){ h._bfConfused--; if(Math.random() < .5){ h.skip = Math.max(h.skip || 0, 1); if(typeof pushLog === 'function') pushLog('li','\\u2605 ' + h.name + ' est\\u00e1 CONFUSO y pierde el turno.'); } }
          if(h._bfDrunk > 0){ h._bfDrunk--; if(Math.random() < .35){ h.skip = Math.max(h.skip || 0, 1); if(typeof pushLog === 'function') pushLog('li','\\u25c9 ' + h.name + ' est\\u00e1 BORRACHO y falla su acci\\u00f3n.'); } }
          if(h._bfDizzy > 0) h._bfDizzy--;
        }
      }
      return original.apply(this, arguments);
    };
    window.stepTurn.__bfOddStates = 1; return true;
  }

  var t = 0, timer = setInterval(function(){ t++; hookRender(); installAbilities(); installTurns(); decorate(); if(t > 40) clearInterval(timer); }, 300);
  hookRender(); installAbilities(); installTurns(); decorate();
  setInterval(decorate, 2000);
})();
</script>
`;