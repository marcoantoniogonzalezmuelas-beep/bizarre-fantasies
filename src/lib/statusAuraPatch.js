// Estados de batalla: cabecera inequívoca, aura elemental y panel temático de
// estado en el recuadro derecho del héroe (donde están HP/maná), con degradado
// y motivo visual por estado (cadenas, luces de discoteca, nieve, etc.).
// Además, cuando un héroe cae a ≤10% de vida, el retrato se tiñe de rojo
// "sangriento" para notar que está agonizando.
export const STATUS_AURA_PATCH = `
<script>
(function(){
  if(window.__bfStatusAuraPatch)return;
  window.__bfStatusAuraPatch=true;

  var style=document.createElement('style');
  style.textContent='\
.bhero{--bf-state:#59ffd1;--bf-state-dark:#07382f}\
.bhero .bf-state-aura{position:absolute;inset:2px;z-index:5;pointer-events:none;border:2px solid var(--bf-state);border-radius:15px;box-shadow:0 0 18px var(--bf-state),inset 0 0 22px var(--bf-state-dark);animation:bfStateAura 1.9s ease-in-out infinite}\
.bhero .bf-state-banner{position:absolute;top:5px;right:8px;left:auto;z-index:16;height:24px;display:inline-flex;width:auto;max-width:70%;align-items:center;justify-content:center;gap:6px;padding:0 10px;color:var(--bf-state);background:linear-gradient(180deg,#141026f2,#05040be6);border:2px solid var(--bf-state);border-radius:999px;box-shadow:0 2px 10px rgba(0,0,0,.6),0 0 16px var(--bf-state),inset 0 0 12px var(--bf-state-dark);animation:bfStateBanner 1.5s ease-in-out infinite;font-family:Cinzel,serif;font-size:11px;font-weight:1000;letter-spacing:.4px;text-transform:uppercase;text-shadow:0 0 10px var(--bf-state),0 2px 4px #000;clip-path:polygon(0 0,44% 0,50% 18%,56% 0,100% 0,94% 100%,56% 100%,50% 82%,44% 100%,6% 100%)}\
.bhero .bf-state-icon{font-size:18px;line-height:1;filter:drop-shadow(0 0 6px var(--bf-state))}\
.bhero.active-turn,.bhero.active-turn .bf-battle-art,.bhero.bf-state-active,.bhero.bf-state-active .bf-battle-art{transform:none!important;zoom:1!important;scale:none!important}\
.bhero.bf-state-active .bf-state-aura{display:none!important}\
.bhero.bf-state-active .bf-state-banner{top:8px;right:10px;height:32px;padding:0 16px;font-size:14px;letter-spacing:1px;border-width:3px;color:#fff8d8;--bf-state:#ffd24a;--bf-state-dark:#5a3f04;clip-path:none!important;border-radius:999px!important}\
.bhero.bf-state-active .bf-state-icon{font-size:20px}\
.bhero:has(.bf-state-banner)>.bf-active-tag,.bhero:has(.bf-state-banner)>.bf-status-badge{display:none!important}\
.bhero.bf-state-active{--bf-state:#59ffd1;--bf-state-dark:#063f35}.bhero.bf-state-paralyzed{--bf-state:#bde8ff;--bf-state-dark:#14324b}.bhero.bf-state-sleeping{--bf-state:#c792ff;--bf-state-dark:#31145b}.bhero.bf-state-frozen{--bf-state:#75e8ff;--bf-state-dark:#073a53}.bhero.bf-state-cursed{--bf-state:#ff45c8;--bf-state-dark:#4e063b}.bhero.bf-state-blessed{--bf-state:#ffe58a;--bf-state-dark:#55400b}.bhero.bf-state-tank{--bf-state:#63e6ff;--bf-state-dark:#073c51}.bhero.bf-state-confused{--bf-state:#ffe65a;--bf-state-dark:#544405}.bhero.bf-state-drunk{--bf-state:#b8ec72;--bf-state-dark:#29470b}.bhero.bf-state-dizzy{--bf-state:#72f0b5;--bf-state-dark:#0b4934}\
.bhero.bf-state-paralyzed .bf-battle-art{filter:saturate(.55) brightness(.92) drop-shadow(0 0 14px #bde8ff)!important}.bhero.bf-state-sleeping .bf-battle-art{filter:saturate(.65) brightness(.72) drop-shadow(0 0 13px #c792ff)!important}.bhero.bf-state-frozen .bf-battle-art{filter:saturate(.7) brightness(.95) hue-rotate(-12deg) drop-shadow(0 0 15px #75e8ff)!important}.bhero.bf-state-cursed .bf-battle-art{filter:saturate(1.25) hue-rotate(260deg) drop-shadow(0 0 15px #ff45c8)!important}.bhero.bf-state-blessed .bf-battle-art{filter:saturate(1.2) brightness(1.16) drop-shadow(0 0 16px #ffe58a)!important}.bhero.bf-state-tank .bf-battle-art{filter:saturate(1.15) contrast(1.08) drop-shadow(0 0 16px #63e6ff)!important}.bhero.bf-state-confused .bf-battle-art{filter:saturate(.85) sepia(.35) drop-shadow(0 0 15px #ffe65a)!important}.bhero.bf-state-drunk .bf-battle-art{filter:saturate(1.25) hue-rotate(18deg) drop-shadow(0 0 15px #b8ec72)!important}.bhero.bf-state-dizzy .bf-battle-art{filter:saturate(.7) hue-rotate(65deg) blur(.35px) drop-shadow(0 0 16px #72f0b5)!important}\
\
/* ---- Panel de estado en el recuadro derecho (sobre HP/maná) ---- */\
.bhero .bf-status-panel{position:absolute;z-index:3;pointer-events:none;border-radius:12px;overflow:hidden}\
.bhero .bf-status-panel::before{content:"";position:absolute;inset:0;background:var(--bf-panel-bg,transparent);opacity:.92}\
.bhero .bf-status-panel .bf-sp-motif{position:absolute;inset:0;overflow:hidden}\
.bhero .bf-status-panel .bf-sp-motif span{position:absolute;color:var(--bf-state);text-shadow:0 0 10px var(--bf-state);opacity:.0;animation:bfSpMotif 3s ease-in-out infinite}\
.bhero .bf-status-panel .bf-sp-motif span:nth-child(1){left:14%;top:18%;font-size:22px;animation-delay:0s}\
.bhero .bf-status-panel .bf-sp-motif span:nth-child(2){right:16%;top:46%;font-size:18px;animation-delay:.8s}\
.bhero .bf-status-panel .bf-sp-motif span:nth-child(3){left:46%;bottom:14%;font-size:20px;animation-delay:1.6s}\
.bhero .bf-status-panel .bf-sp-motif span:nth-child(4){right:10%;bottom:26%;font-size:16px;animation-delay:2.2s}\
@keyframes bfSpMotif{0%,100%{opacity:.0;transform:translateY(6px) scale(.7) rotate(-8deg)}45%{opacity:.85;transform:translateY(-4px) scale(1.12) rotate(6deg)}}\
/* Degradados temáticos por estado (recuadro derecho) */\
.bhero.bf-state-active .bf-status-panel::before{--bf-panel-bg:linear-gradient(135deg,rgba(90,63,4,.5),rgba(40,28,4,.78));box-shadow:inset 0 0 0 1.5px rgba(255,210,74,.45)}\
.bhero.bf-state-paralyzed .bf-status-panel::before{--bf-panel-bg:linear-gradient(135deg,rgba(20,50,75,.62),rgba(8,18,32,.85));box-shadow:inset 0 0 0 1.5px rgba(189,232,255,.5)}\
.bhero.bf-state-sleeping .bf-status-panel::before{--bf-panel-bg:linear-gradient(135deg,rgba(49,20,91,.6),rgba(20,10,40,.85));box-shadow:inset 0 0 0 1.5px rgba(199,146,255,.5)}\
.bhero.bf-state-frozen .bf-status-panel::before{--bf-panel-bg:linear-gradient(135deg,rgba(7,58,83,.6),rgba(10,30,45,.85));box-shadow:inset 0 0 0 1.5px rgba(117,232,255,.55)}\
.bhero.bf-state-cursed .bf-status-panel::before{--bf-panel-bg:linear-gradient(135deg,rgba(78,6,59,.62),rgba(30,4,24,.86));box-shadow:inset 0 0 0 1.5px rgba(255,69,200,.5)}\
.bhero.bf-state-blessed .bf-status-panel::before{--bf-panel-bg:linear-gradient(135deg,rgba(85,64,11,.5),rgba(40,30,5,.82));box-shadow:inset 0 0 0 1.5px rgba(255,229,138,.55)}\
.bhero.bf-state-tank .bf-status-panel::before{--bf-panel-bg:linear-gradient(135deg,rgba(7,60,81,.6),rgba(10,30,40,.85));box-shadow:inset 0 0 0 1.5px rgba(99,230,255,.55)}\
.bhero.bf-state-confused .bf-status-panel::before{--bf-panel-bg:linear-gradient(135deg,rgba(84,68,5,.55),rgba(40,32,4,.82));box-shadow:inset 0 0 0 1.5px rgba(255,230,90,.5)}\
.bhero.bf-state-drunk .bf-status-panel::before{--bf-panel-bg:linear-gradient(135deg,rgba(41,71,11,.5),rgba(20,34,6,.82));box-shadow:inset 0 0 0 1.5px rgba(184,236,114,.5)}\
.bhero.bf-state-dizzy .bf-status-panel::before{--bf-panel-bg:linear-gradient(135deg,rgba(11,73,52,.55),rgba(6,34,24,.84));box-shadow:inset 0 0 0 1.5px rgba(114,240,181,.5)}\
/* Patrones específicos: cadenas (paralizado) y escarcha (congelado) sobre el panel */\
.bhero.bf-state-paralyzed .bf-status-panel::after{content:"";position:absolute;inset:0;background-image:repeating-linear-gradient(90deg,rgba(189,232,255,.18) 0 14px,transparent 14px 28px);opacity:.6;mix-blend-mode:screen}\
.bhero.bf-state-frozen .bf-status-panel::after{content:"";position:absolute;inset:0;background-image:repeating-linear-gradient(45deg,rgba(160,230,255,.22) 0 6px,transparent 6px 18px),repeating-linear-gradient(-45deg,rgba(200,240,255,.18) 0 5px,transparent 5px 16px);opacity:.7}\
/* Luces de discoteca (borracho): manchas de color que se mueven */\
.bhero.bf-state-drunk .bf-status-panel::after{content:"";position:absolute;inset:-30%;background:radial-gradient(circle at 20% 30%,rgba(255,80,200,.55),transparent 30%),radial-gradient(circle at 70% 20%,rgba(80,200,255,.55),transparent 30%),radial-gradient(circle at 80% 70%,rgba(255,230,80,.55),transparent 30%),radial-gradient(circle at 30% 80%,rgba(140,255,120,.5),transparent 30%);mix-blend-mode:screen;animation:bfDisco 2.4s linear infinite;opacity:.7}\
@keyframes bfDisco{0%{transform:rotate(0) scale(1.1)}100%{transform:rotate(360deg) scale(1.1)}}\
/* Niebla oscura (maldito) */\
.bhero.bf-state-cursed .bf-status-panel .bf-sp-motif{background:radial-gradient(circle at 50% 60%,rgba(255,69,200,.18),transparent 60%);animation:bfMist 4s ease-in-out infinite}\
@keyframes bfMist{0%,100%{opacity:.5;transform:scale(1)}50%{opacity:.9;transform:scale(1.08)}}\
/* Aura dorada pulsante (bendito) */\
.bhero.bf-state-blessed .bf-status-panel{box-shadow:inset 0 0 22px rgba(255,229,138,.35);animation:bfBless 2.2s ease-in-out infinite}\
@keyframes bfBless{0%,100%{box-shadow:inset 0 0 14px rgba(255,229,138,.25)}50%{box-shadow:inset 0 0 30px rgba(255,229,138,.5)}}\
/* Remaches metálicos (tanque) */\
.bhero.bf-state-tank .bf-status-panel::after{content:"";position:absolute;inset:0;background-image:radial-gradient(circle,rgba(99,230,255,.5) 1.5px,transparent 2px);background-size:22px 22px;background-position:6px 6px;opacity:.45}\
/* Espirales (mareado) */\
.bhero.bf-state-dizzy .bf-status-panel{animation:bfDizzySwirl 3.5s linear infinite}\
@keyframes bfDizzySwirl{0%{filter:hue-rotate(0)}100%{filter:hue-rotate(40deg)}}\
/* Estrellas giratorias (confuso) */\
.bhero.bf-state-confused .bf-status-panel .bf-sp-motif{animation:bfConfSwirl 3s linear infinite}\
@keyframes bfConfSwirl{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}\
\
/* ---- Agonía: ≤10% de vida ---- */\
.bhero.bf-agonizing .bf-battle-art{animation:bfAgonPulse 1.1s ease-in-out infinite}\
.bhero.bf-agonizing .bf-agonize-veil{position:absolute;left:-22px;top:-18px;bottom:-18px;width:216px;z-index:2;pointer-events:none;border-radius:0;overflow:hidden}\
.bhero.bf-agonizing .bf-agonize-veil::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 80%,rgba(255,0,0,.55),rgba(120,0,0,.25) 55%,transparent 80%);mix-blend-mode:multiply;animation:bfAgonPulse 1.1s ease-in-out infinite}\
.bhero.bf-agonizing .bf-agonize-veil::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(180,0,0,.5) 100%);animation:bfAgonDrip 2.6s ease-in-out infinite}\
.bhero.bf-agonizing .bf-agonize-badge{position:absolute;left:178px;bottom:7px;z-index:17;display:inline-flex;align-items:center;gap:5px;padding:2px 9px;border-radius:999px;font-family:Cinzel,serif;font-size:10px;font-weight:1000;letter-spacing:.5px;text-transform:uppercase;color:#ffd0d0;background:linear-gradient(180deg,#3a0606f2,#1a0202e6);border:1.5px solid #ff4040;box-shadow:0 0 12px rgba(255,40,40,.7),inset 0 0 8px rgba(120,0,0,.6);animation:bfAgonBadge 1s ease-in-out infinite}\
@keyframes bfAgonPulse{0%,100%{opacity:.6;filter:brightness(1)}50%{opacity:1;filter:brightness(1.12)}}\
@keyframes bfAgonDrip{0%,100%{transform:translateY(0);opacity:.6}50%{transform:translateY(4px);opacity:1}}\
@keyframes bfAgonBadge{0%,100%{box-shadow:0 0 8px rgba(255,40,40,.5),inset 0 0 8px rgba(120,0,0,.5);transform:scale(1)}50%{box-shadow:0 0 18px rgba(255,40,40,.95),inset 0 0 10px rgba(160,0,0,.7);transform:scale(1.06)}}\
\
.bf-ability-burst{position:absolute;inset:0;z-index:30;pointer-events:none;display:flex;align-items:center;justify-content:center;border-radius:inherit;overflow:hidden;background:radial-gradient(circle,rgba(255,255,255,.42),rgba(114,240,181,.2) 35%,transparent 70%);animation:bfAbilityBurst 1.25s ease-out forwards}.bf-ability-burst b{padding:8px 13px;border-radius:999px;background:#080711e8;border:2px solid currentColor;font-family:Cinzel,serif;font-size:14px;color:#ffe27a;text-shadow:0 0 10px currentColor;box-shadow:0 0 22px currentColor}.bf-ability-burst i{position:absolute;font-style:normal;font-size:28px;animation:bfAbilityOrbit 1.1s ease-out forwards}.bf-ability-burst i:nth-child(2){transform:rotate(120deg) translateX(58px)}.bf-ability-burst i:nth-child(3){transform:rotate(240deg) translateX(58px)}\
@keyframes bfAbilityBurst{0%{opacity:0;transform:scale(.55)}25%{opacity:1;transform:scale(1.04)}100%{opacity:0;transform:scale(1.18)}}@keyframes bfAbilityOrbit{0%{opacity:0;filter:blur(5px)}35%{opacity:1}100%{opacity:0;transform:rotate(420deg) translateX(78px)}}@keyframes bfStateBanner{0%,100%{box-shadow:0 2px 10px rgba(0,0,0,.6),0 0 12px var(--bf-state),inset 0 0 12px var(--bf-state-dark);filter:brightness(1)}50%{box-shadow:0 2px 10px rgba(0,0,0,.6),0 0 30px var(--bf-state),0 0 52px var(--bf-state),inset 0 0 16px var(--bf-state-dark);filter:brightness(1.25)}}@keyframes bfStateAura{0%,100%{opacity:.72}50%{opacity:1;filter:brightness(1.22)}}';
  document.head.appendChild(style);

  var INFO={
    active:{icon:'★',label:'SU TURNO',motif:['✦','✧','✦','✧']},
    paralyzed:{icon:'⛓',label:'PARALIZADO',motif:['⛓','⛓','⛓','⛓']},
    sleeping:{icon:'☾',label:'DORMIDO',motif:['Z','z','☾','z']},
    frozen:{icon:'❄',label:'CONGELADO',motif:['❄','❅','✧','❆']},
    cursed:{icon:'☠',label:'MALDITO',motif:['☠','⛧','☾','☠']},
    blessed:{icon:'✦',label:'BENDITO',motif:['✦','羽','✧','✦']},
    tank:{icon:'🛡',label:'TANQUEANDO',motif:['🛡','◯','◈','◯']},
    confused:{icon:'★',label:'CONFUSO',motif:['★','?','✦','?']},
    drunk:{icon:'◉',label:'BORRACHO',motif:['◉','○','°','◉']},
    dizzy:{icon:'🌀',label:'MAREADO',motif:['🌀','≈','◌','🌀']}
  };
  var stateClasses=Object.keys(INFO).map(function(k){return'bf-state-'+k;});
  function heroFor(card){var m=String(card.id||'').match(/^b_([po])_(.+)$/);return m&&typeof G!=='undefined'&&G.team?(G.team[m[1]]||[]).find(function(h){return h&&h.id===m[2];}):null;}
  function stateOf(card){var h=heroFor(card),text=((card.querySelector('.bhero-status')||{}).textContent||'');if(card.classList.contains('s-paralyzed')||/par[aá]li/i.test(text))return'paralyzed';if(card.classList.contains('s-sleeping')||/dorm|sue[ñn]/i.test(text))return'sleeping';if(card.classList.contains('s-frozen')||/congel/i.test(text))return'frozen';if(card.classList.contains('s-cursed')||/maldi/i.test(text))return'cursed';if(h&&h._bfConfused>0)return'confused';if(h&&h._bfDrunk>0)return'drunk';if(h&&h._bfDizzy>0)return'dizzy';if(card.classList.contains('s-blessed')||/bendi/i.test(text))return'blessed';if((h&&h._bfTank)||card.classList.contains('s-tank'))return'tank';if(card.classList.contains('active-turn'))return'active';return'';}

  // Mide el porcentaje de vida del héroe (preferimos G.team; si no, el texto HP).
  function hpRatio(card){
    var h=heroFor(card);
    if(h&&h.maxHp>0)return Math.max(0,Math.min(1,h.hp/h.maxHp));
    var m=String((card.querySelector('.bhero-hpnum')||{}).textContent||'').match(/(\\d+)\\s*\\/\\s*(\\d+)/);
    if(m)return Math.max(0,Math.min(1,parseInt(m[1],10)/Math.max(1,parseInt(m[2],10))));
    return 1;
  }

  function decorate(){document.querySelectorAll('.bhero[id^="b_"]').forEach(function(card){
    var st=stateOf(card),old=card.dataset.bfAuraState||'';
    stateClasses.forEach(function(c){card.classList.remove(c);});
    if(st)card.classList.add('bf-state-'+st);

    // ---- Agonía (≤10% vida, vivo) ----
    var h=heroFor(card);
    var alive=h?h.alive:!card.classList.contains('dead');
    var r=hpRatio(card);
    var agonizing=alive&&r>0&&r<=0.10;
    if(agonizing)card.classList.add('bf-agonizing');else card.classList.remove('bf-agonizing');
    var veil=card.querySelector('.bf-agonize-veil');
    if(agonizing&&!veil){veil=document.createElement('div');veil.className='bf-agonize-veil';card.appendChild(veil);}
    else if(!agonizing&&veil)veil.remove();
    var abadge=card.querySelector('.bf-agonize-badge');
    if(agonizing&&!abadge){abadge=document.createElement('div');abadge.className='bf-agonize-badge';abadge.innerHTML='🩸 AGONIZANDO';card.appendChild(abadge);}
    else if(!agonizing&&abadge)abadge.remove();

    // El panel/aura/banner solo cambian cuando el estado cambia de verdad.
    if(st===old)return;
    card.dataset.bfAuraState=st;
    var oldWrap=card.querySelector('.bf-state-wrap');
    if(oldWrap)oldWrap.remove();
    if(!st)return;
    var info=INFO[st],wrap=document.createElement('div');
    wrap.className='bf-state-wrap';
    // Panel temático en el recuadro derecho (sobre HP/maná). El retrato, con
    // z-index superior, lo tapa por la izquierda: el degradado/motivo solo se
    // ve en el recuadro de la derecha, justo donde piden.
    var panel=document.createElement('div');
    panel.className='bf-status-panel';
    panel.style.cssText='left:150px;right:4px;top:4px;bottom:4px';
    panel.innerHTML='<div class="bf-sp-motif"><span>'+info.motif[0]+'</span><span>'+info.motif[1]+'</span><span>'+info.motif[2]+'</span><span>'+info.motif[3]+'</span></div>';
    wrap.appendChild(panel);
    var aura=document.createElement('div');aura.className='bf-state-aura';wrap.appendChild(aura);
    var bn=document.createElement('div');bn.className='bf-state-banner';bn.innerHTML='<span class="bf-state-icon">'+info.icon+'</span><span>'+info.label+'</span>';wrap.appendChild(bn);
    card.appendChild(wrap);
  });}

  function abilityBurst(side,hero,label,icons,color){
    var card=document.getElementById('b_'+side+'_'+hero.id);if(!card)return;
    var fx=document.createElement('div');fx.className='bf-ability-burst';fx.style.color=color||'#ffe27a';fx.innerHTML='<b>'+label+'</b><i>'+icons[0]+'</i><i>'+icons[1]+'</i><i>'+icons[2]+'</i>';card.appendChild(fx);setTimeout(function(){if(fx.parentNode)fx.remove();},1300);
  }
  function installAbilities(){
    if(typeof window.useAbility!=='function')return false;
    if(window.useAbility.__bfOddStates)return true;
    var original=window.useAbility;
    window.useAbility=function(side,hero,done){
      var kind=hero&&hero.akind,isNoEffect=kind==='tk_none'||(kind==='tk_dizzy'&&!hero.eliteMode);
      if(!hero||(!isNoEffect&&kind!=='tk_confuse'&&kind!=='tk_drunk'&&kind!=='tk_dizzy'))return original.apply(this,arguments);
      function complete(){hero.abilityUsed=true;decorate();if(typeof done==='function')done();else if(typeof finishAct==='function')finishAct();}
      if(isNoEffect){
        abilityBurst(side,hero,'✦ '+(hero.eliteMode?(hero.eAbility||hero.ability):(hero.ability||'HABILIDAD')),['✨','👞','💫'],'#ffe27a');
        if(typeof pushLog==='function')pushLog('li','✦ '+hero.name+' usa '+(hero.eliteMode?(hero.eAbility||hero.ability):hero.ability)+'. Es espectacular, pero no altera la batalla.');
        complete();return;
      }
      var foes=typeof enemySide==='function'?enemySide(side):(side==='p'?'o':'p');
      if(kind==='tk_dizzy'){
        var turns=hero.eliteMode?3:2,targets=(typeof G!=='undefined'&&G.team&&G.team[foes]||[]).filter(function(h){return h&&h.alive;});
        targets.forEach(function(target){target._bfDizzy=Math.max(target._bfDizzy||0,turns);target._mods=target._mods||[];target._mods.push({cc:-4,ad:-4,he:-4,turns:turns});if(typeof pushFx==='function')pushFx({k:'status',side:foes,id:target.id,txt:'🌀'});});
        abilityBurst(side,hero,'☣ GASES TÓXICOS',['☁','☣','🌀'],'#72f0b5');
        if(typeof pushLog==='function')pushLog('li','☣ '+hero.name+' marea a todos los rivales: -4 a CC, AD y HE durante '+turns+' turnos.');
        complete();return;
      }
      var label=kind==='tk_confuse'?'Rival a confundir':'Rival que beberá el licor';
      if(typeof pendTarget!=='function')return original.apply(this,arguments);
      pendTarget(label,foes,function(target){
        var turns=hero.eliteMode?3:2;
        if(kind==='tk_confuse'){
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
        complete();
      });
    };
    window.useAbility.__bfOddStates=1;return true;
  }
  function installTurns(){
    if(typeof window.stepTurn!=='function')return false;
    if(window.stepTurn.__bfOddStates)return true;
    var original=window.stepTurn;
    window.stepTurn=function(){
      if(typeof B!=='undefined'&&B&&!B.over&&B.queue&&B.qi<B.queue.length){var slot=B.queue[B.qi],h=typeof getHero==='function'?getHero(slot.side,slot.id):null;if(h&&h.alive){if(h._bfConfused>0){h._bfConfused--;if(Math.random()<.5){h.skip=Math.max(h.skip||0,1);if(typeof pushLog==='function')pushLog('li','★ '+h.name+' está CONFUSO y pierde el turno.');}}if(h._bfDrunk>0){h._bfDrunk--;if(Math.random()<.35){h.skip=Math.max(h.skip||0,1);if(typeof pushLog==='function')pushLog('li','◉ '+h.name+' está BORRACHO y falla su acción.');}}if(h._bfDizzy>0)h._bfDizzy--;}}
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