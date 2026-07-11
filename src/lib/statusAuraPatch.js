// Estados de batalla: cabecera inequívoca, aura elemental y reglas de Confuso/Borracho.
export const STATUS_AURA_PATCH = `
<script>
(function(){
  if(window.__bfStatusAuraPatch)return;
  window.__bfStatusAuraPatch=true;

  var style=document.createElement('style');
  style.textContent='\
.bhero{--bf-state:#59ffd1;--bf-state-dark:#07382f}\
.bhero .bf-state-aura{position:absolute;inset:2px;z-index:5;pointer-events:none;border:2px solid var(--bf-state);border-radius:15px;box-shadow:0 0 18px var(--bf-state),inset 0 0 22px var(--bf-state-dark);animation:bfStateAura 1.9s ease-in-out infinite}\
.bhero .bf-state-banner{position:absolute;top:5px;left:6px;right:6px;z-index:16;height:34px;display:flex;align-items:center;justify-content:center;gap:7px;padding:0 10px;color:var(--bf-state);background:#080711ed;border-top:2px solid var(--bf-state);border-bottom:2px solid var(--bf-state);font-family:Cinzel,serif;font-size:13px;font-weight:1000;letter-spacing:.55px;text-transform:uppercase;text-shadow:0 0 10px var(--bf-state),0 2px 4px #000;box-shadow:0 0 14px var(--bf-state);clip-path:polygon(0 0,44% 0,50% 18%,56% 0,100% 0,94% 100%,56% 100%,50% 82%,44% 100%,6% 100%)}\
.bhero .bf-state-icon{font-size:18px;line-height:1;filter:drop-shadow(0 0 6px var(--bf-state))}\
.bhero .bf-state-particles{position:absolute;inset:38px 4px 4px;z-index:6;pointer-events:none;overflow:hidden;border-radius:12px;color:var(--bf-state);font-size:20px;font-weight:1000;text-shadow:0 0 10px var(--bf-state);opacity:.9}\
.bhero .bf-state-particles span{position:absolute;animation:bfStateParticle 2.8s ease-in-out infinite}\
.bhero .bf-state-particles span:nth-child(1){left:10%;top:18%}.bhero .bf-state-particles span:nth-child(2){right:10%;top:42%;animation-delay:.7s}.bhero .bf-state-particles span:nth-child(3){left:48%;bottom:8%;animation-delay:1.4s}\
.bhero:has(.bf-state-banner)>.bf-active-tag,.bhero:has(.bf-state-banner)>.bf-status-badge{display:none!important}\
.bhero.bf-state-active{--bf-state:#59ffd1;--bf-state-dark:#063f35}.bhero.bf-state-paralyzed{--bf-state:#bde8ff;--bf-state-dark:#14324b}.bhero.bf-state-sleeping{--bf-state:#c792ff;--bf-state-dark:#31145b}.bhero.bf-state-frozen{--bf-state:#75e8ff;--bf-state-dark:#073a53}.bhero.bf-state-cursed{--bf-state:#ff45c8;--bf-state-dark:#4e063b}.bhero.bf-state-blessed{--bf-state:#ffe58a;--bf-state-dark:#55400b}.bhero.bf-state-tank{--bf-state:#63e6ff;--bf-state-dark:#073c51}.bhero.bf-state-confused{--bf-state:#ffe65a;--bf-state-dark:#544405}.bhero.bf-state-drunk{--bf-state:#b8ec72;--bf-state-dark:#29470b}\
.bhero.bf-state-paralyzed .bf-battle-art{filter:saturate(.55) brightness(.92) drop-shadow(0 0 14px #bde8ff)!important}.bhero.bf-state-sleeping .bf-battle-art{filter:saturate(.65) brightness(.72) drop-shadow(0 0 13px #c792ff)!important}.bhero.bf-state-frozen .bf-battle-art{filter:saturate(.7) brightness(.95) hue-rotate(-12deg) drop-shadow(0 0 15px #75e8ff)!important}.bhero.bf-state-cursed .bf-battle-art{filter:saturate(1.25) hue-rotate(260deg) drop-shadow(0 0 15px #ff45c8)!important}.bhero.bf-state-blessed .bf-battle-art{filter:saturate(1.2) brightness(1.16) drop-shadow(0 0 16px #ffe58a)!important}.bhero.bf-state-tank .bf-battle-art{filter:saturate(1.15) contrast(1.08) drop-shadow(0 0 16px #63e6ff)!important}.bhero.bf-state-confused .bf-battle-art{filter:saturate(.85) sepia(.35) drop-shadow(0 0 15px #ffe65a)!important}.bhero.bf-state-drunk .bf-battle-art{filter:saturate(1.25) hue-rotate(18deg) drop-shadow(0 0 15px #b8ec72)!important}\
@keyframes bfStateAura{0%,100%{opacity:.72}50%{opacity:1;filter:brightness(1.22)}}@keyframes bfStateParticle{0%,100%{opacity:.25;transform:translateY(8px) rotate(-8deg) scale(.75)}50%{opacity:1;transform:translateY(-10px) rotate(8deg) scale(1.18)}}';
  document.head.appendChild(style);

  var INFO={
    active:{icon:'★',label:'SU TURNO',particles:['✦','•','✧']},
    paralyzed:{icon:'⚡',label:'PARALIZADO',particles:['ϟ','⚡','ϟ']},
    sleeping:{icon:'☾',label:'DORMIDO',particles:['Z','z','☾']},
    frozen:{icon:'❄',label:'CONGELADO',particles:['❄','❅','✧']},
    cursed:{icon:'☠',label:'MALDITO',particles:['☠','⛧','☾']},
    blessed:{icon:'✦',label:'BENDITO',particles:['✦','羽','✧']},
    tank:{icon:'🛡',label:'TANQUEANDO',particles:['◯','✦','◈']},
    confused:{icon:'★',label:'CONFUSO',particles:['★','?','✦']},
    drunk:{icon:'◉',label:'BORRACHO',particles:['○','◌','°']}
  };
  var stateClasses=Object.keys(INFO).map(function(k){return'bf-state-'+k;});
  function heroFor(card){var m=String(card.id||'').match(/^b_([po])_(.+)$/);return m&&typeof G!=='undefined'&&G.team?(G.team[m[1]]||[]).find(function(h){return h&&h.id===m[2];}):null;}
  function stateOf(card){var h=heroFor(card),text=((card.querySelector('.bhero-status')||{}).textContent||'');if(card.classList.contains('s-paralyzed')||/par[aá]li/i.test(text))return'paralyzed';if(card.classList.contains('s-sleeping')||/dorm|sue[ñn]/i.test(text))return'sleeping';if(card.classList.contains('s-frozen')||/congel/i.test(text))return'frozen';if(card.classList.contains('s-cursed')||/maldi/i.test(text))return'cursed';if(h&&h._bfConfused>0)return'confused';if(h&&h._bfDrunk>0)return'drunk';if(card.classList.contains('s-blessed')||/bendi/i.test(text))return'blessed';if((h&&h._bfTank)||card.classList.contains('s-tank'))return'tank';if(card.classList.contains('active-turn'))return'active';return'';}
  function decorate(){document.querySelectorAll('.bhero[id^="b_"]').forEach(function(card){var st=stateOf(card),old=card.dataset.bfAuraState||'';stateClasses.forEach(function(c){card.classList.remove(c);});if(st)card.classList.add('bf-state-'+st);if(st===old)return;card.dataset.bfAuraState=st;var oldEl=card.querySelector('.bf-state-wrap');if(oldEl)oldEl.remove();if(!st)return;var info=INFO[st],wrap=document.createElement('div');wrap.className='bf-state-wrap';wrap.innerHTML='<div class="bf-state-aura"></div><div class="bf-state-banner"><span class="bf-state-icon">'+info.icon+'</span><span>'+info.label+'</span></div><div class="bf-state-particles"><span>'+info.particles[0]+'</span><span>'+info.particles[1]+'</span><span>'+info.particles[2]+'</span></div>';card.appendChild(wrap);});}

  function installAbilities(){
    if(typeof window.useAbility!=='function')return false;
    if(window.useAbility.__bfOddStates)return true;
    var original=window.useAbility;
    window.useAbility=function(side,hero,done){
      if(!hero||(hero.akind!=='tk_confuse'&&hero.akind!=='tk_drunk'))return original.apply(this,arguments);
      var foes=typeof enemySide==='function'?enemySide(side):(side==='p'?'o':'p');
      var label=hero.akind==='tk_confuse'?'Rival a confundir':'Rival que beberá el licor';
      if(typeof pendTarget!=='function')return original.apply(this,arguments);
      pendTarget(label,foes,function(target){
        var turns=hero.eliteMode?3:2;
        if(hero.akind==='tk_confuse'){
          target._bfConfused=Math.max(target._bfConfused||0,turns);
          if(typeof pushLog==='function')pushLog('li','★ '+hero.name+' deja CONFUSO a '+target.name+' durante '+turns+' turnos.');
          if(typeof pushFx==='function')pushFx({k:'status',side:typeof tSide==='function'?tSide(target):foes,id:target.id,txt:'★'});
        }else{
          target._bfDrunk=Math.max(target._bfDrunk||0,turns);
          target._mods=target._mods||[];target._mods.push({cc:-3,ad:-3,he:-3,turns:turns});
          if(typeof dealDamage==='function')dealDamage(target,3,{type:'true'});
          if(typeof pushLog==='function')pushLog('li','◉ '+hero.name+' emborracha a '+target.name+': -3 a sus atributos y 3 de daño.');
          if(typeof pushFx==='function')pushFx({k:'status',side:typeof tSide==='function'?tSide(target):foes,id:target.id,txt:'◉'});
        }
        hero.abilityUsed=true;decorate();if(typeof done==='function')done();
      });
    };
    window.useAbility.__bfOddStates=1;return true;
  }
  function installTurns(){
    if(typeof window.stepTurn!=='function')return false;
    if(window.stepTurn.__bfOddStates)return true;
    var original=window.stepTurn;
    window.stepTurn=function(){
      if(typeof B!=='undefined'&&B&&!B.over&&B.queue&&B.qi<B.queue.length){var slot=B.queue[B.qi],h=typeof getHero==='function'?getHero(slot.side,slot.id):null;if(h&&h.alive){if(h._bfConfused>0){h._bfConfused--;if(Math.random()<.5){h.skip=Math.max(h.skip||0,1);if(typeof pushLog==='function')pushLog('li','★ '+h.name+' está CONFUSO y pierde el turno.');}}if(h._bfDrunk>0){h._bfDrunk--;if(Math.random()<.35){h.skip=Math.max(h.skip||0,1);if(typeof pushLog==='function')pushLog('li','◉ '+h.name+' está BORRACHO y falla su acción.');}}}}
      return original.apply(this,arguments);
    };
    window.stepTurn.__bfOddStates=1;return true;
  }
  var tries=0,timer=setInterval(function(){tries++;var a=installAbilities(),t=installTurns();decorate();if((a&&t)||tries>80)clearInterval(timer);},150);
  installAbilities();installTurns();decorate();
  new MutationObserver(decorate).observe(document.documentElement,{childList:true,subtree:true});
})();
</script>
`;