// Parche inyectado en el iframe: reglas de batalla.
// 1) MUERTE: el equipo (arma/armadura) del héroe va a la pila de descartes con
//    animación. El héroe revive sin armas ni armaduras.
// 3) HABILIDAD UNA VEZ POR BATALLA: la normal y la élite se trackean por
//    separado. Una vez jugada, no se puede volver a jugar (botón en gris).
// 4) REVIVIR: al revivir se borran TODOS los estados (tanquear, maldición,
//    parálisis…). El héroe renace limpio, sin equipo ni estados. Las marcas de
//    habilidad ya usada persisten (regla de oro: una vez por batalla).
// 5) EQUIPO RECUPERADO: el equipo del descarte se puede recuperar con
//    Reanimación Arcana; va a la mano y se equipa gratis (sin oro en batalla).
export const BATTLE_RULES_PATCH = `
<script>
(function(){
  if (window.__bfBattleRules) return;
  window.__bfBattleRules = true;

  var css = ''+
  '.jrpg-btn.ability.bf-abil-used{opacity:.45!important;filter:grayscale(.8)!important;pointer-events:none!important;cursor:not-allowed!important}'+
  '.jrpg-btn.ability.bf-abil-used *{pointer-events:none!important}'+
  '@keyframes bfEqFly{0%{opacity:1;transform:translate(0,0) scale(1) rotate(0deg)}15%{opacity:1}100%{opacity:0;transform:translate(var(--fx,0px),var(--fy,180px)) scale(.2) rotate(540deg)}}'+
  '.bf-eq-fly{position:fixed;z-index:100500;pointer-events:none;width:44px;height:60px;border-radius:6px;border:2px solid rgba(255,140,50,.8);background:#120a1e center/cover no-repeat;box-shadow:0 4px 14px rgba(0,0,0,.7),0 0 12px rgba(255,140,50,.4);animation:bfEqFly .9s ease-in forwards}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  function mySide(){ try{if(typeof NET!=='undefined'&&NET.role==='client'&&NET.mySide)return NET.mySide;}catch(e){} return 'p'; }
  function livingArr(sd){ if(typeof G==='undefined'||!G||!G.team||!G.team[sd])return []; return (G.team[sd]||[]).filter(function(h){return h&&h.alive;}); }
  function allLiving(){ var a=[];['p','o'].forEach(function(s){a=a.concat(livingArr(s));});return a; }
  function findInList(list,id){ if(!list)return null; for(var i=0;i<list.length;i++) if(list[i]&&list[i].id===id) return list[i]; return null; }
  function eqArrFor(slot){ return slot==='mwep'?(typeof MELEE!=='undefined'?MELEE:[]):slot==='rwep'?(typeof RANGED!=='undefined'?RANGED:[]):(typeof ARMORS!=='undefined'?ARMORS:[]); }
  function eqName(slot,id){ var it=findInList(eqArrFor(slot),id); return it?it.name:'Equipo'; }
  function eqNum(slot,id){ var it=findInList(eqArrFor(slot),id); return (it&&it.num)||0; }
  function eqArt(slot,id){ var it=findInList(eqArrFor(slot),id); if(!it)return ''; var n=it.num||0; if(typeof NUM_ART!=='undefined'&&n&&NUM_ART[String(n)])return NUM_ART[String(n)]; return ''; }

  // ===== 2+4. Muerte → equipo al descarte; revivir → sin equipo ni estados =====
  // SOLO se rastrean muertes/revividas durante la pantalla de batalla. Fuera de
  // ella (subasta, tienda) se resetea el tracking: así el primer scan dentro de
  // batalla inicializa todos los héroes como vivos sin disparar onRevive (que
  // les limpiaría el equipo equivocadamente al empezar la batalla).
  var prevAlive={};
  var wasInBattle=false;
  function scanLifeChanges(){
    var battle=document.getElementById('s-battle');
    var inB=battle&&battle.classList.contains('active');
    if(!inB){ prevAlive={}; wasInBattle=false; return; }
    // Al ENTRAR a batalla (transición de no-batalla → batalla): inicializa
    // todos los héroes como vivos sin disparar callbacks.
    if(!wasInBattle){
      wasInBattle=true;
      if(typeof G!=='undefined'&&G&&G.team){
        ['p','o'].forEach(function(side){
          (G.team[side]||[]).forEach(function(h){
            if(h&&h.id) prevAlive[side+'_'+h.id]=!!h.alive;
          });
        });
      }
      return;
    }
    if(typeof G==='undefined'||!G||!G.team)return;
    ['p','o'].forEach(function(side){
      (G.team[side]||[]).forEach(function(h){
        if(!h||!h.id)return;
        var key=side+'_'+h.id;
        var alive=!!h.alive;
        var was=prevAlive[key];
        if(was===undefined){prevAlive[key]=alive;return;}
        if(was&&!alive)onDeath(side,h);
        if(!was&&alive)onRevive(side,h);
        prevAlive[key]=alive;
      });
    });
  }

  function onDeath(side,h){
    var card=document.getElementById('b_'+side+'_'+h.id);
    var eqs=[];
    if(h.mwep)eqs.push({slot:'mwep',id:h.mwep.id});
    if(h.rwep)eqs.push({slot:'rwep',id:h.rwep.id});
    if(h.armor)eqs.push({slot:'armor',id:h.armor.id});
    // Recuerda el equipo que llevaba al morir (lo usa Gran Amenaza de Doji
    // Conpuri para rearmarlo al resucitar).
    h._bfDeathGear={mwep:h.mwep||null,rwep:h.rwep||null,armor:h.armor||null};
    h._bfDeathAt=Date.now();
    // Quita el equipo: el diff de discardPilePatch lo detecta y lo mete en el
    // descarte. Aquí sólo animamos el vuelo de las cartas al descarte.
    h.mwep=null;h.rwep=null;h.armor=null;
    eqs.forEach(function(eq,i){
      if(card)flyEqToDiscard(card,eqArt(eq.slot,eq.id),i*120);
    });
  }

  function flyEqToDiscard(fromCard,artUrl,delay){
    setTimeout(function(){
      try{
        var fr=fromCard.getBoundingClientRect();
        var side=mySide();
        var pile=document.querySelector('#hand_'+side+' .bf-discard-pile');
        var tr=pile?pile.getBoundingClientRect():{left:20,top:window.innerHeight-100,width:60,height:80};
        var el=document.createElement('div');el.className='bf-eq-fly';
        if(artUrl)el.style.backgroundImage='url("'+artUrl+'")';
        el.style.left=(fr.left+fr.width/2-22)+'px';
        el.style.top=(fr.top+fr.height/2-30)+'px';
        el.style.setProperty('--fx',Math.round(tr.left+tr.width/2-fr.left-fr.width/2)+'px');
        el.style.setProperty('--fy',Math.round(tr.top+tr.height/2-fr.top-fr.height/2)+'px');
        document.body.appendChild(el);
        setTimeout(function(){if(el.parentNode)el.parentNode.removeChild(el);},1000);
      }catch(e){}
    },delay);
  }

  function onRevive(side,h){
    // Renace limpio: sin equipo, sin estados. Las marcas de habilidad usada
    // (_bfNormalUsed / _bfEliteUsed) persisten (regla de oro: una vez por batalla).
    // Excepción: si una habilidad lo resucita rearmado (_bfKeepGear), conserva el equipo.
    if(h._bfKeepGear) h._bfKeepGear=false;
    else { h.mwep=null;h.rwep=null;h.armor=null; }
    if(h._mods)h._mods=[];
    if('skip' in h)h.skip=0;
    if('para' in h)h.para=0;
    if('silence' in h)h.silence=0;
    if('stun' in h)h.stun=0;
    if('confuse' in h)h.confuse=0;
    if('poison' in h)h.poison=0;
    if('burn' in h)h.burn=0;
    if('freeze' in h)h.freeze=0;
    if('shock' in h)h.shock=0;
    h._bfTank=false;
    if(typeof renderBattle==='function')renderBattle();
    if(typeof netSync==='function')netSync('s-battle');
  }

  // ===== 3. Habilidad una vez por batalla (normal y élite por separado) =====
  function scanAbilityUsage(){
    if(typeof G==='undefined'||!G||!G.team)return;
    ['p','o'].forEach(function(side){
      (G.team[side]||[]).forEach(function(h){
        if(!h||!h.id)return;
        // Remember usage on the instance and form, not a previous hero ID.
        // A new match or a fast normal→elite transition can reuse that ID.
        if(h.abilityUsed){ if(h.eliteMode)h._bfEliteUsed=true; else h._bfNormalUsed=true; }
      });
    });
  }

  function hookAbilityOnce(){
    if(typeof window.useAbility!=='function'||window.useAbility.__bfRulesOnce)return;
    // Espera a que los demás ganchos de useAbility estén instalados para quedar
    // como capa externa y poder bloquear antes de que disparen animaciones.
    if(!window.__bfAbxHooked||!window.__bfTokenAbilHooked)return;
    var orig=window.useAbility;
    window.useAbility=function(side,hero,done){
      try{
        if(hero){
          var el=!!hero.eliteMode;
          if(el&&hero._bfEliteUsed){if(typeof notif==='function')notif('Habilidad élite ya usada en esta batalla');return;}
          if(!el&&hero._bfNormalUsed){if(typeof notif==='function')notif('Habilidad normal ya usada en esta batalla');return;}
        }
      }catch(e){}
      return orig.apply(this,arguments);
    };
    window.useAbility.__bfRulesOnce=1;
  }

  function greyUsedAbilities(){
    if(typeof B==='undefined'||!B||!B.current)return;
    if(typeof G==='undefined'||!G||!G.team)return;
    var battle=document.getElementById('s-battle');
    if(!battle||!battle.classList.contains('active'))return;
    var side=B.current.side;
    var hero=(typeof getHero==='function')?getHero(side,B.current.id):null;
    if(!hero)return;
    var nUsed=!!hero._bfNormalUsed,eUsed=!!hero._bfEliteUsed;
    // El panel de acciones muestra UN solo botón de habilidad para el héroe
    // activo, que corresponde a su modo actual (normal o élite). Se usa
    // hero.eliteMode como criterio principal: si el héroe está en modo élite,
    // el botón es la habilidad élite (se grisée solo si _bfEliteUsed); si no,
    // es la normal (se grisée solo si _bfNormalUsed). Antes se detectaba por
    // el texto del botón ("élite"/"elite"), pero los tokens invocados (Patito,
    // Pegaso…) no ponen "élite" en el texto y el botón se grisaba por error
    // tras usar la versión normal, impidiendo jugar la élite tras renacer.
    var heroIsElite=!!hero.eliteMode;
    battle.querySelectorAll('.bf-abil-used').forEach(function(b){b.classList.remove('bf-abil-used');});
    if(!nUsed&&!eUsed)return;
    // Target the engine's ability control, never containers whose descendant
    // text happens to mention an ability (Fas's description did exactly that).
    battle.querySelectorAll('.active-hero-panel .jrpg-menu .jrpg-btn.ability').forEach(function(btn){
      if(heroIsElite ? eUsed : nUsed)btn.classList.add('bf-abil-used');
    });
  }

  // ===== 5. Equipo recuperado: equipar gratis desde la mano =====
  function hookUseItemForEquip(){
    if(typeof window.useItem!=='function'||window.useItem.__bfEqRec)return;
    if(!window.useItem.__bfOfx)return; // espera a que objectFxPatch instale su gancho
    var orig=window.useItem;
    window.useItem=function(idx){
      try{
        if(typeof B!=='undefined'&&B&&B.current&&typeof G!=='undefined'&&G&&G.items){
          var side=B.current.side;
          var item=G.items[side]&&G.items[side][idx];
          // El equipo recuperado lo gestiona recoveredEquipPatch (eliges a qué aliado se lo pones); este atajo
          // (equiparlo siempre en el héroe del turno) solo actúa si ese parche no está.
          if(item&&item._bfRecoveredEq&&!window.__bfRecoveredEquip){
            var hero=(typeof getHero==='function')?getHero(side,B.current.id):null;
            if(hero){
              // El equipo viejo del mismo slot va al descarte
              if(hero[item._bfSlot]){var oldEq=hero[item._bfSlot];var pile=G.itemDescarte&&G.itemDescarte[side];if(pile)pile.push({id:oldEq.id,kind:item._bfSlot,name:eqName(item._bfSlot,oldEq.id),num:eqNum(item._bfSlot,oldEq.id)});}
              hero[item._bfSlot]=item;
              G.items[side].splice(idx,1);
              if(typeof pushLog==='function')pushLog('li',hero.name+' equipa '+item.name+' (recuperado del descarte).');
              if(typeof renderBattle==='function')renderBattle();
              if(typeof netSync==='function')netSync('s-battle');
              if(typeof finishAct==='function')finishAct();
              return;
            }
          }
        }
      }catch(e){}
      return orig.apply(this,arguments);
    };
    window.useItem.__bfEqRec=1;
  }

  function hookRender(){
    if(typeof window.renderBattle!=='function'||window.renderBattle.__bfRulesRender)return;
    var orig=window.renderBattle;
    window.renderBattle=function(){var r=orig.apply(this,arguments);try{setTimeout(greyUsedAbilities,50);}catch(e){}return r;};
    window.renderBattle.__bfRulesRender=1;
  }

  setInterval(function(){scanLifeChanges();scanAbilityUsage();greyUsedAbilities();},200);
  var tries=0,iv=setInterval(function(){
    hookAbilityOnce();hookUseItemForEquip();hookRender();
    if(++tries>300)clearInterval(iv);
  },150);
})();
</script>
`;