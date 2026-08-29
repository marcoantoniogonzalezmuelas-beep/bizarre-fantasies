// Parche inyectado en el iframe: implementa las dos habilidades de Doji Conpuri
// (card_id "dojpur", nº 38, HE, No-muertos).
//
// Ambas son pasivas que se ARMAN al activarlas (consumen el turno, marcan
// abilityUsed) y permanecen residentes hasta que se cumple su condición.
// Mientras están armadas muestran un marcador en el retrato de batalla y en
// el panel de acciones del héroe; al dispararse, el marcador desaparece.
//
//   Normal (Pequeña amenaza): la PRÓXIMA vez que reciba daño, lanza un dado de
//   dos caras. Sale 1 → mata directamente a un héroe del rival (en la fase que
//   esté). Sale 2 → no hace nada. Sea cual sea, la amenaza se consume (una
//   sola vez por partida).
//
//   Élite (Gran Amenaza): al MORIR, resucita a todos los aliados caídos y los
//   cura a vida completa. Solo se activa si queda al menos otro aliado vivo
//   (si no, la partida se acaba y no tiene sentido).
export const DOJI_CONPURI_ABILITY_PATCH = `
<script>
(function(){
  if(window.__bfDojiPatch) return;
  window.__bfDojiPatch = true;

  var DOJI_ID = 'dojpur';
  function isDoji(h){ return h && (h.id === DOJI_ID || h.cid === DOJI_ID || h.card_id === DOJI_ID); }

  var css = ''+
  // Marcador sobre el retrato de batalla (esquina superior izquierda).
  '.bf-doji-mark{position:absolute;left:8px;top:6px;z-index:15;display:flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;font-family:Cinzel,serif;font-size:10px;font-weight:1000;letter-spacing:.5px;text-transform:uppercase;pointer-events:none;white-space:nowrap;background:rgba(8,5,14,.9);border:1.5px solid var(--bf-dc,#9dffcf);color:var(--bf-dc,#9dffcf);box-shadow:0 0 10px var(--bf-dc,#9dffcf),0 2px 6px rgba(0,0,0,.5)}'+
  // Marcador en el panel de acciones del héroe activo.
  '.bf-doji-panel-mark{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:999px;font-family:Cinzel,serif;font-size:11px;font-weight:1000;letter-spacing:.5px;text-transform:uppercase;background:rgba(8,5,14,.9);border:1.5px solid var(--bf-dc,#9dffcf);color:var(--bf-dc,#9dffcf);box-shadow:0 0 12px var(--bf-dc,#9dffcf);margin:6px 0 0;vertical-align:middle}'+
  '.bf-doji-panel-mark .bf-doji-dot{width:8px;height:8px;border-radius:50%;background:var(--bf-dc,#9dffcf);box-shadow:0 0 8px var(--bf-dc,#9dffcf);animation:bfDojiBlink 1.4s ease-in-out infinite}'+
  '@keyframes bfDojiBlink{0%,100%{opacity:1}50%{opacity:.4}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  // Hook useAbility: arma la habilidad (normal o élite) y consume el turno.
  function installAbility(){
    if(typeof window.useAbility !== 'function' || window.__bfDojiHooked) return false;
    window.__bfDojiHooked = true;
    var orig = window.useAbility;
    window.useAbility = function(side, h, done){
      if(!isDoji(h)) return orig.apply(this, arguments);
      try{
        // Tirada d20 como el resto de héroes. Pifia (19-20 o 1): la habilidad
        // no produce efecto pero queda marcada como usada.
        var r = 1 + Math.floor(Math.random()*20);
        var fum = (r >= 19 || r === 1);
        if(typeof pushLog === 'function'){
          pushLog(fum?'lx':'li', '\\u{1F3B2} Tirada d20 (habilidad): '+r+'/20 \\u2192 '+(fum?'\\u00a1PIFIA! La habilidad no produce ning\\u00fan efecto.':'OK.'));
        }
        if(fum){
          h.abilityUsed = true;
          if(typeof window.__bfFumblePop === 'function') window.__bfFumblePop(side, h.id, false, r);
          if(typeof renderBattle === 'function') renderBattle();
          if(typeof netSync === 'function') netSync('s-battle');
          setTimeout(function(){ if(typeof done==='function') done(); else if(typeof finishAct==='function') finishAct(); }, 900);
          return;
        }
        if(h.eliteMode) h._bfDojiRevive = true; else h._bfDojiThreat = true;
        h.abilityUsed = true;
        // Cinemática 3D en el momento exacto de la activación.
        if(typeof window.__bfPlayAbilityAnim === 'function'){ try{ window.__bfPlayAbilityAnim(side, h, true); }catch(e){} }
        var name = h.eliteMode ? (h.eAbility||h.ability||h.name) : (h.ability||h.name);
        if(typeof pushLog === 'function') pushLog('li', name + ' se arma: '+(h.eliteMode?'al morir resucitar\\u00e1 a todos los aliados ca\\u00eddos.':'la pr\\u00f3xima vez que reciba da\\u00f1o, lanzar\\u00e1 el dado mortal.'));
        if(typeof pushFx === 'function') pushFx({k:'status', side:side, id:h.id, txt:'\\u26a0'});
        if(typeof renderBattle === 'function') renderBattle();
        if(typeof netSync === 'function') netSync('s-battle');
      }catch(e){}
      if(typeof done==='function') done(); else if(typeof finishAct==='function') finishAct();
    };
    return true;
  }

  // Hook dealDamage: dispara la amenaza normal al recibir daño y la
  // resurrección élite al morir. Solo actúa si la habilidad estaba armada.
  function installDamage(){
    if(typeof window.dealDamage !== 'function' || window.dealDamage.__bfDoji) return false;
    var orig = window.dealDamage;
    window.dealDamage = function(target, amount, opts){
      var armedThreat = isDoji(target) && target && target.alive && target._bfDojiThreat && Number(amount) > 0;
      var armedRevive = isDoji(target) && target && target.alive && target._bfDojiRevive && Number(amount) > 0;
      if(!armedThreat && !armedRevive) return orig.apply(this, arguments);
      var wasAlive = !!target.alive;
      var hpBefore = target.hp;
      var dealt = orig.apply(this, arguments);
      try{
        // Normal: la próxima vez que reciba daño → dado de 2 caras.
        // Se usa el motor compartido de dados (__bfHeroRoll) para que salga la
        // misma cinemática que en el resto de habilidades, y se espera a que el
        // dado se fije antes de resolver el efecto (matar / no hacer nada).
        if(armedThreat && target._bfDojiThreat && hpBefore > (target.hp||0)){
          target._bfDojiThreat = false; // se consume (una sola vez por partida)
          var dr = 1 + Math.floor(Math.random()*2); // 1 o 2 (una sola tirada real)
          if(typeof window.__bfHeroRoll === 'function'){
            window.__bfHeroRoll({ faces:2, forced:dr, hero: target.name, label:'PEQUE\\u00d1A AMENAZA',
              note: dr === 1 ? '\\u00a1FULMINA A UN RIVAL!' : 'NO OCURRE NADA' });
          }
          // Resolver el efecto tras la cinemática del dado (~2.2s).
          setTimeout(function(){
            try{
              if(dr === 1){
                var tSideF = (typeof tSide === 'function') ? tSide : null;
                var foeSide = tSideF ? (tSideF(target) === 'p' ? 'o' : 'p') : 'o';
                var foes = ((typeof G!=='undefined'&&G.team&&G.team[foeSide])||[]).filter(function(f){ return f && f.alive; });
                // Preferir al atacante si es rival; si no, el rival con menos vida.
                var attacker = (typeof B!=='undefined'&&B&&B.current&&typeof getHero==='function') ? getHero(B.current.side, B.current.id) : null;
                var victim = null;
                if(attacker && attacker.alive && attacker !== target && tSideF && tSideF(attacker) === foeSide) victim = attacker;
                if(!victim && foes.length) victim = foes.slice().sort(function(a,b){ return (a.hp||0)-(b.hp||0); })[0];
                if(victim){
                  if(typeof pushLog === 'function') pushLog('ld', '\\u2620 '+target.name+': \\u00a1el dado sale 1! '+victim.name+' cae fulminado.');
                  orig.call(window, victim, 9999, {type:'spell', element:'arcano', bfDojiKill:true});
                  if(typeof pushFx === 'function') pushFx({k:'death', side:foeSide, id:victim.id});
                } else if(typeof pushLog === 'function'){
                  pushLog('lx', target.name+': no hay rivales vivos a los que fulminar.');
                }
              } else if(typeof pushLog === 'function'){
                pushLog('lx', target.name+': el dado sale 2. No ocurre nada.');
              }
              if(typeof renderBattle === 'function') renderBattle();
              if(typeof netSync === 'function') netSync('s-battle');
            }catch(e){}
          }, 2200);
        }
        // Élite: al morir → resucita a todos los aliados caídos a vida completa.
        if(armedRevive && target._bfDojiRevive && wasAlive && !target.alive){
          target._bfDojiRevive = false; // se consume
          var tSideF2 = (typeof tSide === 'function') ? tSide : null;
          var side = tSideF2 ? tSideF2(target) : 'p';
          var allies = ((typeof G!=='undefined'&&G.team&&G.team[side])||[]);
          var dead = allies.filter(function(a){ return a && !a.alive && a !== target; });
          var aliveOther = allies.some(function(a){ return a && a.alive && a !== target; });
          if(!aliveOther){
            if(typeof pushLog === 'function') pushLog('lx', target.name+': cae sin aliados vivos. La partida termina.');
          } else if(dead.length){
            dead.forEach(function(a){
              if(typeof reviveHero === 'function') reviveHero(a, 1);
              a.alive = true;
              a.hp = a.maxHp || a.hp || 1;
              if(typeof pushFx === 'function') pushFx({k:'elite', side:side, id:a.id});
            });
            if(typeof pushLog === 'function') pushLog('li', '\\u{1F31F} '+target.name+': resucita a '+dead.map(function(a){return a.name;}).join(', ')+' con vida completa.');
            if(typeof renderBattle === 'function') renderBattle();
            if(typeof netSync === 'function') netSync('s-battle');
          } else if(typeof pushLog === 'function'){
            pushLog('lx', target.name+': no hab\\u00eda aliados ca\\u00eddos que resucitar.');
          }
        }
      }catch(e){}
      return dealt;
    };
    window.dealDamage.__bfDoji = 1;
    return true;
  }

  // Marcador en el retrato de batalla mientras la habilidad esté armada.
  function heroFor(card){
    var m = String(card.id||'').match(/^b_([po])_(.+)$/);
    return m && typeof G!=='undefined' && G.team ? (G.team[m[1]]||[]).find(function(h){return h&&h.id===m[2];}) : null;
  }
  function updatePortraitMarkers(){
    document.querySelectorAll('.bhero[id^="b_"]').forEach(function(card){
      var h = heroFor(card);
      var badge = card.querySelector('.bf-doji-mark');
      if(h && (h._bfDojiThreat || h._bfDojiRevive)){
        var elite = !!h._bfDojiRevive;
        var color = elite ? '#c79bff' : '#9dffcf';
        var label = elite ? 'GRAN AMENAZA' : 'PEQUE\\u00d1A AMENAZA';
        var icon = elite ? '\\u{1F31F}' : '\\u26a0';
        if(!badge){ badge = document.createElement('div'); badge.className='bf-doji-mark'; card.appendChild(badge); }
        badge.style.setProperty('--bf-dc', color);
        badge.innerHTML = '<span>'+icon+'</span><span>'+label+'</span>';
      } else if(badge){ badge.remove(); }
    });
  }

  // Marcador en el panel de acciones del héroe activo.
  function updatePanelMarker(){
    try{
      if(typeof B==='undefined'||!B||!B.current) return;
      var h = (typeof getHero==='function') ? getHero(B.current.side, B.current.id) : null;
      var panel = document.querySelector('.bf-action-host') || document.querySelector('.action-panel');
      if(!panel) return;
      var mark = panel.querySelector('.bf-doji-panel-mark');
      if(h && isDoji(h) && (h._bfDojiThreat || h._bfDojiRevive)){
        var elite = !!h._bfDojiRevive;
        var color = elite ? '#c79bff' : '#9dffcf';
        var label = elite ? 'GRAN AMENAZA ARMADA' : 'PEQUE\\u00d1A AMENAZA ARMADA';
        if(!mark){ mark = document.createElement('div'); mark.className='bf-doji-panel-mark'; panel.appendChild(mark); }
        mark.style.setProperty('--bf-dc', color);
        mark.innerHTML = '<span class="bf-doji-dot"></span>'+label;
      } else if(mark){ mark.remove(); }
    }catch(e){}
  }

  function hookRender(){
    if(typeof window.renderBattle !== 'function' || window.renderBattle.__bfDojiMark) return false;
    var original = window.renderBattle;
    window.renderBattle = function(){ var r = original.apply(this, arguments); updatePortraitMarkers(); updatePanelMarker(); return r; };
    window.renderBattle.__bfDojiMark = 1;
    return true;
  }

  var tries = 0;
  var timer = setInterval(function(){
    installAbility();
    installDamage();
    hookRender();
    updatePortraitMarkers();
    updatePanelMarker();
    if((window.__bfDojiHooked && window.dealDamage && window.dealDamage.__bfDoji && window.renderBattle && window.renderBattle.__bfDojiMark) || tries++ > 300) clearInterval(timer);
  }, 150);
  setInterval(function(){ updatePortraitMarkers(); updatePanelMarker(); }, 500);
})();
</script>
`;