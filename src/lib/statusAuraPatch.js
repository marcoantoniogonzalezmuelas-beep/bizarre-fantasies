import { STATUS_STATES } from '@/lib/statusSceneFx';

// Estados de batalla: SOLO rótulo + partículas repartidas por la escena.
// El "aura" (velos de color, degradados, filtros sobre el arte, bordes de neón
// y patrones de fondo) se ha eliminado por completo: era lo que provocaba la
// distorsión visual y el parpadeo.
//
// Este parche también conserva la lógica de los estados propios (confuso,
// borracho, mareado) y su consumo por turnos, además del marcador de AGONÍA.
// El rótulo es una CAPA ABSOLUTA propia (antes era un ::after del recuadro y,
// al ser este un contenedor flex, el pseudo-elemento entraba en el flujo y
// empujaba todos los textos del héroe hacia abajo).
const LABEL_CSS = 'html body .bhero .bf-state-label{position:absolute!important;top:6px;right:8px;z-index:22;display:inline-flex;align-items:center;gap:5px;padding:3px 12px;border-radius:999px;background:linear-gradient(180deg,#141026f2,#05040be6);font-family:Cinzel,serif;font-size:12px;font-weight:1000;letter-spacing:.4px;text-transform:uppercase;box-shadow:0 2px 10px rgba(0,0,0,.6);white-space:nowrap;pointer-events:none;animation:none!important;transition:none!important}';

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
    // BARRA DE ARMAS/EQUIPO del héroe de batalla: el backdrop-filter:blur
    // recomputa el fondo en cada repintado del recuadro (sobre todo con
    // CONGELADO, que cambia el filter del arte) y eso es lo que parpadea.
    // Se deja estática: fondo opaco (sin blur), sin animaciones ni
    // transiciones (también en los iconos de las armas).
    + 'html body .bhero .bf-battle-gear{backdrop-filter:none!important;-webkit-backdrop-filter:none!important;background:rgba(8,5,14,.82)!important;animation:none!important;transition:none!important}'
    + 'html body .bhero .bf-battle-gear .bf-gear-icon{transition:none!important;animation:none!important}'
    + 'html body .bhero .bf-battle-gear .bf-gear-icon:hover{transform:none!important}'
    // El emblema nativo intermitente se retira: un solo indicador por estado.
    + '.bhero .bf-status-badge{display:none!important}'
    // Fila nativa de chapas de estado: es la que crecía al activarse un estado
    // y empujaba TODOS los textos y marcadores del héroe hacia abajo. Se queda
    // con altura fija (2px, como cuando no hay estado) y sin chapas: el estado
    // ya se indica con el rótulo flotante.
    + 'html body .bhero .bhero-status{height:2px!important;min-height:2px!important;max-height:2px!important;margin-top:6px!important;padding:0!important;overflow:hidden!important;gap:0!important}'
    + 'html body .bhero .bhero-status .status-badge{display:none!important}'
    // Overlays nativos del juego (placa de hielo, patrones, velos): fuera.
    + 'html body .bhero .bf-pat,html body .bhero .bf-frost,html body .bhero .bf-fx-overlay{display:none!important}'
    // Filtros/bordes de color de los estados nativos: fuera (distorsionaban).
    + 'html body .bhero.s-cursed .bf-battle-art,html body .bhero.s-frozen .bf-battle-art,html body .bhero.s-paralyzed .bf-battle-art,html body .bhero.s-sleeping .bf-battle-art,html body .bhero.s-blessed .bf-battle-art,html body .bhero.s-tank .bf-battle-art{filter:none!important}'
    + 'html body .bhero.s-cursed,html body .bhero.s-frozen,html body .bhero.s-paralyzed,html body .bhero.s-sleeping,html body .bhero.s-blessed,html body .bhero.s-tank{filter:none!important;box-shadow:none!important}'
    // Nombre del héroe: SIEMPRE en una sola línea (aunque sea largo, tipo
    // "Fas Everest Panzer"), con altura fija para que el retrato no se mueva
    // al refrescarse los números.
    + 'html body .bhero .bhero-name{display:block!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;max-width:100%!important;height:18px!important;line-height:18px!important;font-size:12.5px!important;letter-spacing:0!important}'
    // Los números (vida, atributos) se refrescan constantemente: con cifras de
    // ancho fijo y altura reservada, al cambiar solo repintan ellos y el retrato
    // se queda exactamente igual, sin saltos ni recolocaciones.
    + 'html body .bhero .bhero-hpnum,html body .bhero .bhero-stats,html body .bhero .bhero-hp,html body .bhero .bhero-mana{font-variant-numeric:tabular-nums!important;font-feature-settings:"tnum" 1!important}'
    + 'html body .bhero .bhero-hpnum{display:inline-block!important;min-width:62px!important;text-align:center!important}'
    // BARRA DE STATS (CC/AD/HE): TOTALMENTE ESTÁTICA y SIEMPRE visible.
    // El juego la ocultaba/mostraba según el estado del héroe y eso hacía que
    // apareciera y desapareciera. Ahora se queda fija: misma altura, siempre
    // visible, sin transiciones ni animaciones (ni ella ni sus números).
    + 'html body .bhero .bhero-stats{display:flex!important;align-items:center!important;visibility:visible!important;opacity:1!important;height:16px!important;min-height:16px!important;max-height:16px!important;line-height:16px!important;white-space:nowrap!important;overflow:hidden!important;animation:none!important;transition:none!important}'
    + 'html body .bhero .bhero-stats *{visibility:visible!important;opacity:1!important;animation:none!important;transition:none!important}'
    // La BARRA de vida/maná: mismo hueco y mismo grosor durante TODA la batalla.
    // Siempre visible (aunque el juego la vacíe) y sin transiciones al cambiar
    // el relleno: así deja de aparecer/desaparecer y de dar el salto.
    + 'html body .bhero .bhero-hp,html body .bhero .bhero-mana{display:block!important;visibility:visible!important;opacity:1!important;height:8px!important;min-height:8px!important;max-height:8px!important;margin:3px 0!important;flex:0 0 8px!important;overflow:hidden!important;animation:none!important;transition:none!important}'
    + 'html body .bhero .bhero-hp>*,html body .bhero .bhero-mana>*{height:100%!important;animation:none!important;transition:none!important}'
    // Capa de partículas sobre la escena de batalla
    + 'html body .bhero .bf-decor-layer{position:absolute!important;inset:0!important;z-index:20!important;pointer-events:none;overflow:hidden;border-radius:inherit;display:block!important;opacity:1!important;visibility:visible!important}'
    + '.bf-decor{position:absolute;transform:translate(-50%,-50%);line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.75))}'
    // CONGELADO: mismo tratamiento que MALDITO — sin aislar la capa de
    // partículas (isolation/contain provoca parpadeo al repintar el recuadro)
    // y sin un filter:none general sobre todo el héroe. Solo emojis quietos.
    // TODO ESTÁTICO: sin velos, sin animaciones que parpadeen. Solo emojis
    // quietos con una sombra suave para darles volumen sobre la escena.
    + 'html body .bhero .bf-decor{transform:translate(-50%,-50%)!important;animation:none!important;transition:none!important;filter:drop-shadow(0 2px 4px rgba(0,0,0,.75))}'
    // CONGELADO: muñeco de nieve + Papa Noel + cubitos de hielo + copos, quietos
    + 'html body .bhero.s-frozen .bf-decor{color:#eaf6ff;text-shadow:0 2px 6px rgba(0,0,0,.6),0 0 14px rgba(180,230,255,.85)}'
    // CONFUSO: interrogaciones con brillo neón (estáticas)
    + 'html body .bhero.bf-state-confused .bf-decor-neon{font-family:Cinzel,serif;font-weight:1000;color:#fffbe0;text-shadow:0 0 6px #ffe65a,0 0 16px #ff7ae0,0 0 30px #6cf}'
    // BORRACHO: bola de discoteca con brillo fijo
    + 'html body .bhero.bf-state-drunk .bf-decor-ball{filter:drop-shadow(0 0 12px #b8ec72)}'
    // MAREADO: nubes tóxicas con brillo fijo
    + 'html body .bhero.bf-state-dizzy .bf-decor-toxic{color:#9dffcf;text-shadow:0 0 12px #72f0b5}'
    // PARALIZADO: cadenas y candados con brillo eléctrico fijo
    + 'html body .bhero.s-paralyzed .bf-decor{color:#dff2ff;text-shadow:0 0 8px #bde8ff}'
    // DORMIDO: luna y ZZZ con brillo suave fijo
    + 'html body .bhero.s-sleeping .bf-decor-moon{filter:drop-shadow(0 0 10px #c792ff)}'
    + 'html body .bhero.s-sleeping .bf-decor-zzz{font-weight:900;color:#fff;text-shadow:0 0 8px #c792ff,0 2px 4px #000}'
    // MALDITO: velitas negras y muñecos vudú con brillo mágico fijo
    + 'html body .bhero.s-cursed .bf-decor-blackcandle{filter:brightness(.35) saturate(.2) drop-shadow(0 0 6px rgba(255,69,200,.7)) drop-shadow(0 2px 4px #000)}'
    + 'html body .bhero.s-cursed .bf-decor-voodoo{filter:drop-shadow(0 0 8px #ff45c8) drop-shadow(0 2px 4px #000)}'
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
  // Estado activo del héroe. Se calcula a partir de SUS DATOS (no solo de las
  // clases del recuadro): el juego borra las clases de estado en algunos
  // refrescos y por eso el efecto de MALDITO no llegaba a verse nunca.
  function activeCls(card, h){
    if(h){
      var mods = h._mods || [];
      if(h._bfConfused > 0) return 'bf-state-confused';
      if(h._bfDrunk > 0) return 'bf-state-drunk';
      if(h._bfDizzy > 0) return 'bf-state-dizzy';
      if(h.freeze > 0 || h.frozen > 0) return 's-frozen';
      if(h.para > 0) return 's-paralyzed';
      if(h.sleep > 0) return 's-sleeping';
      if(mods.some(function(m){ return m && (m.cc < 0 || m.ad < 0 || m.he < 0); })) return 's-cursed';
      if(mods.some(function(m){ return m && (m.cc > 0 || m.ad > 0 || m.he > 0); })) return 's-blessed';
      if(h._bfTank) return 's-tank';
    }
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

      var cls = activeCls(card, h);
      if(cls && !card.classList.contains(cls)) card.classList.add(cls);
      ORDER.forEach(function(c){ if(c !== cls && card.classList.contains(c)) card.classList.remove(c); });

      // Rótulo del estado: capa absoluta propia (no empuja los textos).
      var lbl = card.querySelector('.bf-state-label');
      var st = cls ? BY_CLS[cls] : null;
      if(!st){ if(lbl) lbl.remove(); }
      else {
        if(!lbl){ lbl = document.createElement('div'); lbl.className = 'bf-state-label'; card.appendChild(lbl); }
        var txt = st.ic + ' ' + st.lb;
        if(lbl.textContent !== txt) lbl.textContent = txt;
        if(lbl.dataset.bfC !== st.c){
          lbl.dataset.bfC = st.c;
          lbl.style.border = '2px solid ' + st.c;
          lbl.style.color = st.c;
          lbl.style.textShadow = '0 0 10px ' + st.c + ',0 2px 4px #000';
        }
      }
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