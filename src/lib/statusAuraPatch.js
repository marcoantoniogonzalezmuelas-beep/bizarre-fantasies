// Estados de batalla visuales: degradado temático + etiqueta en el recuadro del
// héroe, con CSS PURO sobre las clases nativas del juego (s-cursed, s-paralyzed,
// s-sleeping, s-blessed, s-frozen, s-tank). Como el juego añade esas clases en
// CADA repintado, el ::before (degradado) y el ::after (etiqueta) están siempre
// presentes — sin JS que se borre al recrear el .bhero, sin parpadeo.
// Los estados sin clase nativa (confuso/borracho/mareado) los añade el JS
// (bf-state-*) y un hook a renderBattle los repone al instante.
// Además, ≤10% de vida → velo rojo "agonizando".
export const STATUS_AURA_PATCH = `
<script>
(function(){
  if(window.__bfStatusAuraPatch)return;
  window.__bfStatusAuraPatch=true;

  var STATES=[
    {cls:'s-cursed',      c:'#ff45c8',d:'#4e063b',ic:'☠', lb:'MALDITO',    grad:'linear-gradient(135deg,rgba(78,6,59,.5),rgba(30,4,24,.74))',filt:'saturate(1.25) hue-rotate(260deg) drop-shadow(0 0 15px #ff45c8)',pat:'radial-gradient(circle at 50% 60%,rgba(255,69,200,.22),transparent 60%)'},
    {cls:'s-paralyzed',    c:'#bde8ff',d:'#14324b',ic:'⚡', lb:'PARALIZADO', grad:'linear-gradient(135deg,rgba(20,50,75,.5),rgba(8,18,32,.76))',filt:'saturate(.55) brightness(.92) drop-shadow(0 0 14px #bde8ff)',pat:'repeating-linear-gradient(90deg,rgba(189,232,255,.18) 0 14px,transparent 14px 28px)'},
    {cls:'s-sleeping',     c:'#c792ff',d:'#31145b',ic:'💤', lb:'DORMIDO',    grad:'linear-gradient(135deg,rgba(49,20,91,.5),rgba(20,10,40,.76))',filt:'saturate(.65) brightness(.72) drop-shadow(0 0 13px #c792ff)',pat:'none'},
    {cls:'s-blessed',      c:'#ffe58a',d:'#55400b',ic:'✦', lb:'BENDITO',    grad:'linear-gradient(135deg,rgba(85,64,11,.42),rgba(40,30,5,.72))',filt:'saturate(1.2) brightness(1.16) drop-shadow(0 0 16px #ffe58a)',pat:'none'},
    {cls:'s-frozen',       c:'#75e8ff',d:'#073a53',ic:'❄', lb:'CONGELADO',  grad:'linear-gradient(135deg,rgba(7,58,83,.5),rgba(10,30,45,.76))',filt:'saturate(.7) brightness(.95) hue-rotate(-12deg) drop-shadow(0 0 15px #75e8ff)',pat:'repeating-linear-gradient(45deg,rgba(160,230,255,.2) 0 6px,transparent 6px 18px),repeating-linear-gradient(-45deg,rgba(200,240,255,.16) 0 5px,transparent 5px 16px)'},
    {cls:'s-tank',         c:'#ffb43a',d:'#5a3f04',ic:'🛡', lb:'TANQUEANDO', grad:'linear-gradient(135deg,rgba(255,140,30,.42),rgba(80,40,5,.72))',filt:'saturate(1.15) contrast(1.08) drop-shadow(0 0 16px #ffb43a)',pat:'radial-gradient(circle,rgba(255,170,60,.5) 1.5px,transparent 2px)'},
    {cls:'bf-state-confused',c:'#ffe65a',d:'#544405',ic:'★',lb:'CONFUSO',  grad:'linear-gradient(135deg,rgba(84,68,5,.45),rgba(40,32,4,.72))',filt:'saturate(.85) sepia(.35) drop-shadow(0 0 15px #ffe65a)',pat:'none'},
    {cls:'bf-state-drunk',   c:'#b8ec72',d:'#29470b',ic:'◉',lb:'BORRACHO', grad:'linear-gradient(135deg,rgba(41,71,11,.45),rgba(20,34,6,.72))',filt:'saturate(1.25) hue-rotate(18deg) drop-shadow(0 0 15px #b8ec72)',pat:'none'},
    {cls:'bf-state-dizzy',   c:'#72f0b5',d:'#0b4934',ic:'🌀',lb:'MAREADO',  grad:'linear-gradient(135deg,rgba(11,73,52,.45),rgba(6,34,24,.72))',filt:'saturate(.7) hue-rotate(65deg) blur(.35px) drop-shadow(0 0 16px #72f0b5)',pat:'none'}
  ];

  var css='.bhero{position:relative!important}';
  STATES.forEach(function(s){
    var bg = s.pat && s.pat!=='none' ? s.pat+','+s.grad : s.grad;
    css+=
      '.bhero.'+s.cls+'{--bf-state:'+s.c+';--bf-state-dark:'+s.d+';box-shadow:0 0 0 2px '+s.c+',0 0 22px '+s.c+'66!important}'+
      '.bhero.'+s.cls+' .bf-battle-art{filter:'+s.filt+'!important}'+
      '.bhero.'+s.cls+'::before{content:"";position:absolute;inset:0;z-index:4;pointer-events:none;border-radius:inherit;background:'+bg+';background-size:22px 22px,auto;mix-blend-mode:overlay;opacity:.7;animation:bfAuraPulse 2.2s ease-in-out infinite}'+
      '.bhero.'+s.cls+'::after{content:"'+s.ic+' '+s.lb+'";position:absolute;top:6px;right:8px;left:auto;z-index:16;display:inline-flex;align-items:center;gap:5px;padding:2px 11px;border-radius:999px;background:linear-gradient(180deg,#141026f2,#05040be6);border:2px solid '+s.c+';color:'+s.c+';font-family:Cinzel,serif;font-size:11px;font-weight:1000;letter-spacing:.4px;text-transform:uppercase;text-shadow:0 0 10px '+s.c+',0 2px 4px #000;box-shadow:0 2px 10px rgba(0,0,0,.6),0 0 16px '+s.c+',inset 0 0 12px '+s.d+';animation:bfStateBanner 1.5s ease-in-out infinite;white-space:nowrap}';
  });
  // Evitar etiqueta duplicada: ocultar el badge nativo del juego cuando tenemos
  // nuestra etiqueta CSS, y el tag de turno activo nativo.
  css+='.bhero.s-cursed>.bf-status-badge,.bhero.s-paralyzed>.bf-status-badge,.bhero.s-sleeping>.bf-status-badge,.bhero.s-blessed>.bf-status-badge,.bhero.s-frozen>.bf-status-badge,.bhero.s-tank>.bf-status-badge,.bhero.bf-state-confused>.bf-status-badge,.bhero.bf-state-drunk>.bf-status-badge,.bhero.bf-state-dizzy>.bf-status-badge{display:none!important}';
  // Agonía (≤10% vida): velo rojo + insignia
  css+=
    '.bhero.bf-agonizing .bf-battle-art{animation:bfAgonPulse 1.1s ease-in-out infinite}'+
    '.bhero.bf-agonizing .bf-agonize-badge{position:absolute;left:150px;bottom:7px;z-index:17;display:inline-flex;align-items:center;gap:5px;padding:2px 9px;border-radius:999px;font-family:Cinzel,serif;font-size:10px;font-weight:1000;letter-spacing:.5px;text-transform:uppercase;color:#ffd0d0;background:linear-gradient(180deg,#3a0606f2,#1a0202e6);border:1.5px solid #ff4040;box-shadow:0 0 12px rgba(255,40,40,.7),inset 0 0 8px rgba(120,0,0,.6);animation:bfAgonBadge 1s ease-in-out infinite}'+
    '@keyframes bfAgonPulse{0%,100%{opacity:.6;filter:brightness(1)}50%{opacity:1;filter:brightness(1.12)}}@keyframes bfAgonBadge{0%,100%{box-shadow:0 0 8px rgba(255,40,40,.5);transform:scale(1)}50%{box-shadow:0 0 18px rgba(255,40,40,.95);transform:scale(1.06)}}'+
    '@keyframes bfAuraPulse{0%,100%{opacity:.55}50%{opacity:.82}}@keyframes bfStateBanner{0%,100%{box-shadow:0 2px 10px rgba(0,0,0,.6),0 0 12px var(--bf-state),inset 0 0 12px var(--bf-state-dark);filter:brightness(1)}50%{box-shadow:0 2px 10px rgba(0,0,0,.6),0 0 28px var(--bf-state),0 0 44px var(--bf-state),inset 0 0 16px var(--bf-state-dark);filter:brightness(1.25)}}';
  // Ability burst (mantener)
  css+='.bf-ability-burst{position:absolute;inset:0;z-index:30;pointer-events:none;display:flex;align-items:center;justify-content:center;border-radius:inherit;overflow:hidden;background:radial-gradient(circle,rgba(255,255,255,.42),rgba(114,240,181,.2) 35%,transparent 70%);animation:bfAbilityBurst 1.25s ease-out forwards}.bf-ability-burst b{padding:8px 13px;border-radius:999px;background:#080711e8;border:2px solid currentColor;font-family:Cinzel,serif;font-size:14px;color:#ffe27a;text-shadow:0 0 10px currentColor;box-shadow:0 0 22px currentColor}.bf-ability-burst i{position:absolute;font-style:normal;font-size:28px;animation:bfAbilityOrbit 1.1s ease-out forwards}.bf-ability-burst i:nth-child(2){transform:rotate(120deg) translateX(58px)}.bf-ability-burst i:nth-child(3){transform:rotate(240deg) translateX(58px)}@keyframes bfAbilityBurst{0%{opacity:0;transform:scale(.55)}25%{opacity:1;transform:scale(1.04)}100%{opacity:0;transform:scale(1.18)}}@keyframes bfAbilityOrbit{0%{opacity:0;filter:blur(5px)}35%{opacity:1}100%{opacity:0;transform:rotate(420deg) translateX(78px)}}';
  var style=document.createElement('style');
  style.textContent=css;
  document.head.appendChild(style);

  function heroFor(card){var m=String(card.id||'').match(/^b_([po])_(.+)$/);return m&&typeof G!=='undefined'&&G.team?(G.team[m[1]]||[]).find(function(h){return h&&h.id===m[2];}):null;}
  function hpRatio(card){var h=heroFor(card);if(h&&h.maxHp>0)return Math.max(0,Math.min(1,h.hp/h.maxHp));var m=String((card.querySelector('.bhero-hpnum')||{}).textContent||'').match(/(\\d+)\\s*\\/\\s*(\\d+)/);if(m)return Math.max(0,Math.min(1,parseInt(m[1],10)/Math.max(1,parseInt(m[2],10))));return 1;}

  // JS mínimo: estados sin clase nativa (confuso/borracho/mareado) + agonía.
  // Las clases nativas (s-cursed etc.) las pinta el CSS solo — aquí no las
  // tocamos (tocar classList dispararía bucles).
  function decorate(){
    document.querySelectorAll('.bhero[id^="b_"]').forEach(function(card){
      var h=heroFor(card);
      var odd = h&&h._bfConfused>0?'bf-state-confused':h&&h._bfDrunk>0?'bf-state-drunk':h&&h._bfDizzy>0?'bf-state-dizzy':'';
      ['bf-state-confused','bf-state-drunk','bf-state-dizzy'].forEach(function(c){ if(c===odd)return; if(card.classList.contains(c))card.classList.remove(c); });
      if(odd&&!card.classList.contains(odd))card.classList.add(odd);
      // Agonía ≤10%
      var alive=h?h.alive:!card.classList.contains('dead');
      var r=hpRatio(card), agonizing=alive&&r>0&&r<=0.10;
      if(agonizing)card.classList.add('bf-agonizing');else if(card.classList.contains('bf-agonizing'))card.classList.remove('bf-agonizing');
      var ab=card.querySelector('.bf-agonize-badge');
      if(agonizing&&!ab){ab=document.createElement('div');ab.className='bf-agonize-badge';ab.innerHTML='🩸 AGONIZANDO';card.appendChild(ab);}
      else if(!agonizing&&ab)ab.remove();
    });
  }

  // Hook renderBattle: repinta los estados JS al instante tras cada repintado
  // del juego (sin esperar al intervalo). Así confuso/borracho/mareado/agonía
  // no parpadean al recrearse el .bhero.
  function hookRender(){ if(typeof window.renderBattle!=='function'||window.renderBattle.__bfAura)return; var o=window.renderBattle; window.renderBattle=function(){ o.apply(this,arguments); try{decorate();}catch(e){} }; window.renderBattle.__bfAura=1; }

  function abilityBurst(side,hero,label,icons,color){var card=document.getElementById('b_'+side+'_'+hero.id);if(!card)return;var fx=document.createElement('div');fx.className='bf-ability-burst';fx.style.color=color||'#ffe27a';fx.innerHTML='<b>'+label+'</b><i>'+icons[0]+'</i><i>'+icons[1]+'</i><i>'+icons[2]+'</i>';card.appendChild(fx);setTimeout(function(){if(fx.parentNode)fx.remove();},1300);}
  function installAbilities(){
    if(typeof window.useAbility!=='function')return false;
    if(window.useAbility.__bfOddStates)return true;
    var original=window.useAbility;
    window.useAbility=function(side,hero,done){
      var kind=hero&&hero.akind,isNoEffect=kind==='tk_none'||(kind==='tk_dizzy'&&!hero.eliteMode);
      if(!hero||(!isNoEffect&&kind!=='tk_confuse'&&kind!=='tk_drunk'&&kind!=='tk_dizzy'))return original.apply(this,arguments);
      function complete(){hero.abilityUsed=true;decorate();if(typeof done==='function')done();else if(typeof finishAct==='function')finishAct();}
      if(isNoEffect){abilityBurst(side,hero,'✦ '+(hero.eliteMode?(hero.eAbility||hero.ability):(hero.ability||'HABILIDAD')),['✨','👞','💫'],'#ffe27a');if(typeof pushLog==='function')pushLog('li','✦ '+hero.name+' usa '+(hero.eliteMode?(hero.eAbility||hero.ability):hero.ability)+'. Es espectacular, pero no altera la batalla.');complete();return;}
      var foes=typeof enemySide==='function'?enemySide(side):(side==='p'?'o':'p');
      if(kind==='tk_dizzy'){var turns=hero.eliteMode?3:2,targets=(typeof G!=='undefined'&&G.team&&G.team[foes]||[]).filter(function(h){return h&&h.alive;});targets.forEach(function(target){target._bfDizzy=Math.max(target._bfDizzy||0,turns);target._mods=target._mods||[];target._mods.push({cc:-4,ad:-4,he:-4,turns:turns});if(typeof pushFx==='function')pushFx({k:'status',side:foes,id:target.id,txt:'🌀'});});abilityBurst(side,hero,'☣ GASES TÓXICOS',['☁','☣','🌀'],'#72f0b5');if(typeof pushLog==='function')pushLog('li','☣ '+hero.name+' marea a todos los rivales: -4 a CC, AD y HE durante '+turns+' turnos.');complete();return;}
      var label=kind==='tk_confuse'?'Rival a confundir':'Rival que beberá el licor';
      if(typeof pendTarget!=='function')return original.apply(this,arguments);
      pendTarget(label,foes,function(target){var turns=hero.eliteMode?3:2;if(kind==='tk_confuse'){target._bfConfused=Math.max(target._bfConfused||0,turns);if(typeof pushLog==='function')pushLog('li','★ '+hero.name+' deja CONFUSO a '+target.name+' durante '+turns+' turnos.');if(typeof pushFx==='function')pushFx({k:'status',side:typeof tSide==='function'?tSide(target):foes,id:target.id,txt:'★'});}else{target._bfDrunk=Math.max(target._bfDrunk||0,turns);target._mods=target._mods||[];target._mods.push({cc:-3,ad:-3,he:-3,turns:turns});if(typeof dealDamage==='function')dealDamage(target,3,{type:'true'});if(typeof pushLog==='function')pushLog('li','◉ '+hero.name+' emborracha a '+target.name+': -3 a sus atributos y 3 de daño.');if(typeof pushFx==='function')pushFx({k:'status',side:typeof tSide==='function'?tSide(target):foes,id:target.id,txt:'◉'});}complete();});
    };
    window.useAbility.__bfOddStates=1;return true;
  }
  function installTurns(){
    if(typeof window.stepTurn!=='function')return false;
    if(window.stepTurn.__bfOddStates)return true;
    var original=window.stepTurn;
    window.stepTurn=function(){if(typeof B!=='undefined'&&B&&!B.over&&B.queue&&B.qi<B.queue.length){var slot=B.queue[B.qi],h=typeof getHero==='function'?getHero(slot.side,slot.id):null;if(h&&h.alive){if(h._bfConfused>0){h._bfConfused--;if(Math.random()<.5){h.skip=Math.max(h.skip||0,1);if(typeof pushLog==='function')pushLog('li','★ '+h.name+' está CONFUSO y pierde el turno.');}}if(h._bfDrunk>0){h._bfDrunk--;if(Math.random()<.35){h.skip=Math.max(h.skip||0,1);if(typeof pushLog==='function')pushLog('li','◉ '+h.name+' está BORRACHO y falla su acción.');}}if(h._bfDizzy>0)h._bfDizzy--;}}return original.apply(this,arguments);};
    window.stepTurn.__bfOddStates=1;return true;
  }

  var t=0,timer=setInterval(function(){t++;hookRender();installAbilities();installTurns();decorate();if(t>80)clearInterval(timer);},150);
  hookRender();installAbilities();installTurns();decorate();
  new MutationObserver(function(){decorate();}).observe(document.documentElement,{childList:true,subtree:true});
  setInterval(decorate,700);
})();
</script>
`;