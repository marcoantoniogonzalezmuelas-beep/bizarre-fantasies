export const MONKGETA_ABILITY_PATCH = `
<script>
(function(){
  if(window.__bfMonkgetaAbility)return;window.__bfMonkgetaAbility=1;
  function id(h){return String(h&&(h.card_id||h.cardId||h.cid||h.id)||'').replace(/_\\d{6,}$/,'');}
  function sideOf(h){return typeof tSide==='function'?tSide(h):'';}
  function clean(h){if(!h||!h._bfInvisible)return;h.sleep=0;h.para=0;h.skip=0;h.silence=0;h.mark=null;h._bfConfused=0;h._bfDrunk=0;h._bfDizzy=0;h._mods=(h._mods||[]).filter(function(m){return !((m.cc||0)<0||(m.ad||0)<0||(m.he||0)<0||(m.vel||0)<0);});}
  // Desorientado: cuando el dado redirige el ataque, el DAÑO ya iba al destino correcto, pero el motor
  // registra el golpe y encola el efecto (tajo / flecha / hechizo) con el objetivo ORIGINAL ANTES de
  // calcular el daño: se veía el ataque al rival y el registro decía "golpea a <rival>" aunque el daño
  // fuera al aliado o a uno mismo. Aquí se corrige el destino del efecto en cola y el nombre en el registro.
  function redirectVisuals(orig,dest){
    try{
      var os=sideOf(orig),ds=sideOf(dest);
      if(typeof _fxQueue!=='undefined'&&_fxQueue)_fxQueue.forEach(function(e){
        if(e&&e.toId===orig.id&&e.toSide===os&&(e.k==='slash'||e.k==='arrow'||e.k==='spell')){e.toId=dest.id;e.toSide=ds;}
      });
      window.__bfDisRelog={from:orig.name,to:dest.name};
      setTimeout(function(){window.__bfDisRelog=null;},0);
    }catch(e){}
  }
  function installLog(){
    if(window.__bfMonkLog||typeof pushLog!=='function')return false;
    window.__bfMonkLog=1;
    var o=pushLog;
    window.pushLog=function(c,t){
      var r=window.__bfDisRelog;
      if(r&&typeof t==='string'&&t.indexOf('(-')>=0&&t.indexOf(r.from)>=0)t=t.split(r.from).join(r.to);
      return o.call(this,c,t);
    };
    return true;
  }
  function finish(side,h,done){h.abilityUsed=true;if(window.__bfPlayAbilityAnim)window.__bfPlayAbilityAnim(side,h);renderBattle();if(typeof netSync==='function')netSync('s-battle');if(typeof done==='function')done();else finishAct();}
  function installAbility(){if(window.__bfMonkgetaUse||typeof useAbility!=='function')return false;window.__bfMonkgetaUse=1;var original=useAbility;window.useAbility=function(side,h,done){
    if(id(h)!=='monkgeta')return original.apply(this,arguments);
    if(h.eliteMode){h._bfInvisible=2;h._bfInvisibleFresh=1;h._bfInvisSrc='monk';clean(h);pushLog('li',h.name+' se vuelve INVISIBLE durante dos turnos.');finish(side,h,done);return;}
    var foes=enemySide(side),apply=function(target){target._bfDisoriented=1;pushFx({k:'status',side:tSide(target),id:target.id,txt:'\\u{1F9ED}'});pushLog('li',target.name+' queda DESORIENTADO: su próximo ataque se decidirá con un dado de 3 caras.');finish(side,h,done);};
    if(window.bfChooseAbilityTarget)window.bfChooseAbilityTarget(side,'Rival a desorientar',foes,apply);else pendTarget('Rival a desorientar',foes,apply);
  };return true;}
  function installDamage(){if(window.__bfMonkgetaDamage||typeof dealDamage!=='function')return false;window.__bfMonkgetaDamage=1;var original=dealDamage;window.dealDamage=function(target,amount,opts){
    var attacker=B&&B.current&&getHero(B.current.side,B.current.id),kind=opts&&opts.type;
    var sess=window.__bfDisSess;
    if(sess&&sess.attacker===attacker&&(kind==='melee'||kind==='ranged'||kind==='spell')&&target){
      // Misma acción (varios impactos / área): el dado ya decidió, todo el ataque sigue esa decisión.
      if(sess.roll!==1){
        if(target.id===sess.origId&&target===sess.orig){if(!sess.dest.alive)return 0;target=sess.dest;}
        else if(target!==sess.dest&&(G.team[enemySide(B.current.side)]||[]).indexOf(target)>=0)return 0;
      }
    }else if(attacker&&attacker._bfDisoriented&&target&&(kind==='melee'||kind==='ranged'||kind==='spell')){
      var roll=window.__bfHeroRoll?window.__bfHeroRoll({faces:3,hero:attacker.name,label:'Desorientado',note:'1 rival · 2 aliado · 3 él mismo',delay:0}):1+Math.floor(Math.random()*3),allies=(G.team[B.current.side]||[]).filter(function(x){return x&&x.alive&&x!==attacker;});
      var orig=target;
      if(roll===2)target=allies.length?allies[Math.floor(Math.random()*allies.length)]:attacker;else if(roll===3)target=attacker;
      if(target!==orig)redirectVisuals(orig,target);
      window.__bfDisSess={attacker:attacker,roll:roll,orig:orig,origId:orig.id,dest:target};setTimeout(function(){window.__bfDisSess=null;},0);
      attacker._bfDisoriented=0;pushLog('li','Dado de DESORIENTADO: '+roll+'. El ataque va contra '+target.name+'.');
    }
    // Invisible (Monkgeta élite o El Anillo): no le afecta NINGÚN daño, ni de
    // rivales ni de efectos pasivos (veneno, quemadura, rebotes…).
    if(target&&target._bfInvisible){clean(target);pushFx({k:'miss',side:sideOf(target),id:target.id});pushLog('li',target.name+' es INVISIBLE: el daño no le afecta.');return 0;}
    return original.call(this,target,amount,opts);
  };return true;}
  function installTargets(){if(window.__bfMonkgetaTargets||typeof pendTarget!=='function')return false;window.__bfMonkgetaTargets=1;var original=pendTarget;window.pendTarget=function(prompt,validSide,cb,opts){opts=opts||{};if(B&&B.current&&validSide!==B.current.side){var visible=(G.team[validSide]||[]).filter(function(h){return h&&h.alive&&!h._bfInvisible;}).map(function(h){return h.id;});opts=Object.assign({},opts,{allowedIds:opts.allowedIds?opts.allowedIds.filter(function(x){return visible.indexOf(x)>=0;}):visible});}return original.call(this,prompt,validSide,cb,opts);};return true;}
  function installTurns(){if(window.__bfMonkgetaTurns||typeof tickAfter!=='function')return false;window.__bfMonkgetaTurns=1;var original=tickAfter;window.tickAfter=function(h){var result=original.apply(this,arguments);if(h&&h._bfInvisible){if(h._bfInvisibleFresh)h._bfInvisibleFresh=0;else if(!--h._bfInvisible)pushLog('li',h.name+' vuelve a ser visible.');clean(h);}return result;};return true;}
  var n=0,iv=setInterval(function(){installAbility();installDamage();installTargets();installTurns();installLog();if(n++>160)clearInterval(iv);},150);installAbility();installDamage();installTargets();installTurns();installLog();setInterval(function(){if(typeof G!=='undefined'&&G.team)['p','o'].forEach(function(s){(G.team[s]||[]).forEach(clean);});},300);
})();
</script>
`;