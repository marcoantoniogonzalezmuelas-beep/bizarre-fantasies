export const LLORILOMO_ABILITY_PATCH = `
<script>
(function(){
  if(window.__bfLlorilomoAbility)return; window.__bfLlorilomoAbility=1;
  function id(h){return String(h&&(h.card_id||h.cardId||h.cid||h.id)||'').replace(/_\\d{6,}$/,'');}
  function alive(s){return (G.team[s]||[]).filter(function(x){return x&&x.alive;});}
  function finish(side,h,done){h.abilityUsed=true;if(window.__bfPlayAbilityAnim)window.__bfPlayAbilityAnim(side,h);renderBattle();if(typeof netSync==='function')netSync('s-battle');if(typeof done==='function')done();else finishAct();}
  function install(){
    if(window.__bfLlorilomoHook||typeof useAbility!=='function')return false;
    window.__bfLlorilomoHook=1;var original=useAbility;
    window.useAbility=function(side,h,done){
      if(id(h)!=='yoritom'||(window.__bfSpecOwns&&window.__bfSpecOwns(h)))return original.apply(this,arguments);
      var foes=enemySide(side),shots=h.eliteMode?2:1,turns=h.eliteMode?2:1;
      for(var i=0;i<shots;i++){
        var pool=alive(foes);if(!pool.length)break;
        var roll=window.__bfHeroRoll?window.__bfHeroRoll({faces:pool.length,hero:h.name,label:h.eliteMode?'Doble Ballesta':'Ráfaga de Flechas',note:'objetivo rival aleatorio'}):1+Math.floor(Math.random()*pool.length);
        var target=pool[Math.max(0,Math.min(pool.length-1,roll-1))];
        pushFx({k:'arrow',fromSide:side,fromId:h.id,toSide:tSide(target),toId:target.id,hits:1});
        var damage=dealDamage(target,stat(h,'ad'),{type:'ranged'});target.para=Math.max(target.para||0,turns);
        pushLog('ld',h.name+' dispara a '+target.name+' (-'+damage+') y lo paraliza '+turns+' turno'+(turns>1?'s':'')+'.');
      }
      finish(side,h,done);
    };return true;
  }
  var n=0,iv=setInterval(function(){if(install()||n++>120)clearInterval(iv);},150);install();
})();
</script>
`;