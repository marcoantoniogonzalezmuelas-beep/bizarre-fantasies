// MECÁNICAS DE EQUIPO PARAMETRIZABLES (Card → parámetros del motor). Cualquier arma o armadura de la base de datos
// puede usarlas sin código; las estrenan el Bastón Extensible, la Varita de Juguete Bizarra y la Armadura de Pinchos.
//   Arma:     spell_boost_pct (hechizos del portador +%), weakness_bonus_pct (+% si el hechizo es la DEBILIDAD de la
//             armadura elemental del objetivo), toy_crit (1 de cada N: ¡¡PÍO!! y el hechizo hace doble daño),
//             shot_he (el disparo es mágico y escala con HE), he_mult (el golpe cuerpo a cuerpo escala con HE),
//             reach_pct (el golpe se alarga y alcanza a un segundo rival con ese % del daño)
//   Armadura: thorns (quien la golpea cuerpo a cuerpo recibe ese daño), vel (cambia la velocidad del portador)
//   Veneno:   marca _bfPoison {dmg, turns} (paso "poison" del ejecutor): daño al empezar cada turno del envenenado.
export const NEW_GEAR_PATCH = `
<script>
(function(){
  if(window.__bfNewGear)return;
  window.__bfNewGear=true;
  // Debilidad de cada armadura elemental: el elemento que ESA armadura no puede anular y que la castiga
  // (inverso de ELEM_COUNTER: la de agua anula el fuego y es débil al rayo, etc.).
  var WEAK={agua:'rayo',rayo:'hielo',hielo:'fuego',fuego:'agua'};
  function attacker(){ try{ return (typeof B!=='undefined'&&B&&B.current&&typeof getHero==='function')?getHero(B.current.side,B.current.id):null; }catch(e){ return null; } }
  function gear(h){ return h?[h.mwep,h.rwep].filter(Boolean):[]; }
  function sumP(h,k){ return gear(h).reduce(function(s,w){ return s+(Number(w[k])||0); },0); }
  function L(t){ if(typeof pushLog==='function')pushLog('lg',t); }
  function heRef(){ return (typeof HE_REF!=='undefined'&&HE_REF>0)?HE_REF:18; }
  function hookDamage(){
    if(typeof window.dealDamage!=='function'||window.dealDamage.__bfNewGear)return false;
    var orig=window.dealDamage;
    var w=function(target,amount,opts){
      opts=opts||{};
      if(opts.bfGear)return orig.apply(this,arguments);
      var a=attacker(),side=(a&&typeof tSide==='function')?tSide(a):null;
      var foe=!!(a&&target&&typeof tSide==='function'&&tSide(target)!==side);
      try{
        if(foe&&amount>0){
          if(opts.type==='ranged'&&a.rwep&&Number(a.rwep.shot_he)>0){
            amount=Math.max(1,Math.round((Number(a.rwep.power)||0)*stat(a,'he')/heRef()));
            opts=Object.assign({},opts,{type:'spell',element:opts.element||a.rwep.element||'arcano'});
          }
          if(opts.type==='melee'&&!opts.bfReach&&a.mwep&&Number(a.mwep.he_mult)>0){
            amount=Math.max(amount,Math.round(stat(a,'he')*Number(a.mwep.he_mult)));
          }
          if(opts.type==='spell'){
            var boost=sumP(a,'spell_boost_pct');
            if(boost>0)amount=Math.round(amount*(1+boost/100));
            var wb=sumP(a,'weakness_bonus_pct');
            if(wb>0&&opts.element&&target.armor&&target.armor.element&&WEAK[target.armor.element]===opts.element){
              amount=Math.round(amount*(1+wb/100));
              L('\\u{1F3AF} \\u00a1Golpe a la debilidad! El '+opts.element+' castiga la '+target.armor.name+' de '+target.name+' (+'+wb+'%).');
            }
            var tc=0;gear(a).forEach(function(g){ if(Number(g.toy_crit)>1)tc=Number(g.toy_crit); });
            if(tc>1){
              var r=(typeof window.__bfDie==='function')?Number(window.__bfDie(tc)):1+Math.floor(Math.random()*tc);
              if(r===1){ amount*=2; L('\\u{1F424} \\u00a1\\u00a1P\\u00cdO!! La varita de juguete chilla y el hechizo hace DOBLE da\\u00f1o.'); try{ pushFx({k:'status',side:side,id:a.id,txt:'\\u{1F424}'}); }catch(e){} }
            }
          }
        }
      }catch(e){}
      var out=orig.call(this,target,amount,opts);
      try{
        if(foe&&opts.type==='melee'&&target&&target.armor&&Number(target.armor.thorns)>0&&a.alive&&a!==target){
          var th=Number(target.armor.thorns);
          orig.call(this,a,th,{type:'true',bfGear:true});
          L('\\u{1F335} '+a.name+' se pincha con la '+target.armor.name+' de '+target.name+' (-'+th+').');
          try{ pushFx({k:'status',side:side,id:a.id,txt:'\\u{1F335}'}); }catch(e){}
        }
        if(foe&&opts.type==='melee'&&!opts.bfReach&&a.mwep&&Number(a.mwep.reach_pct)>0){
          var ts=tSide(target),other=(G.team[ts]||[]).find(function(x){ return x&&x.alive&&x!==target; });
          if(other){
            var d2=Math.max(1,Math.round(Number(amount)*Number(a.mwep.reach_pct)/100));
            try{ pushFx({k:'slash',toSide:ts,toId:other.id}); }catch(e){}
            var got=window.dealDamage(other,d2,{type:'melee',bfReach:true});
            L('\\u{1FA84} El '+a.mwep.name+' se alarga y alcanza tambi\\u00e9n a '+other.name+' (-'+(got||0)+').');
          }
        }
      }catch(e){}
      return out;
    };
    w.__bfNewGear=1;window.dealDamage=w;return true;
  }
  function hookVel(){
    if(typeof window.velocity!=='function'||window.velocity.__bfNewGear)return false;
    var o=window.velocity;
    var w=function(h){ var v=o.apply(this,arguments); try{ if(h&&h.armor&&Number(h.armor.vel))v=Math.max(1,v+Number(h.armor.vel)); }catch(e){} return v; };
    w.__bfNewGear=1;window.velocity=w;return true;
  }
  // VENENO: al empezar el turno del envenenado, recibe su daño (ignora armaduras y escudos) y le queda un turno menos.
  function hookPoison(){
    if(typeof window.stepTurn!=='function'||window.stepTurn.__bfPoison)return false;
    var o=window.stepTurn;
    var w=function(){
      try{
        if(typeof B!=='undefined'&&B&&!B.over&&B.queue&&B.qi<B.queue.length){
          var slot=B.queue[B.qi],h=getHero(slot.side,slot.id);
          if(h&&h.alive&&h._bfPoison&&h._bfPoison.turns>0&&h._bfPoisonRound!==B.round){
            h._bfPoisonRound=B.round;
            var p=h._bfPoison;p.turns--;
            try{ pushFx({k:'status',side:slot.side,id:h.id,txt:'\\u2620\\ufe0f'}); }catch(e){}
            var got=window.dealDamage(h,p.dmg,{type:'true',bfGear:true,bfPoison:true});
            if(typeof pushLog==='function')pushLog('ld','\\u2620\\ufe0f '+h.name+' sufre el veneno (-'+(got||0)+')'+(p.turns>0?'. Le quedan '+p.turns+' turno'+(p.turns>1?'s':'')+'.':' y se le pasa.'));
            if(p.turns<=0)h._bfPoison=null;
            if(typeof renderBattle==='function')renderBattle();
            if(typeof checkWin==='function'&&checkWin())return;
            if(!h.alive){ var self0=this,args0=arguments;return setTimeout(function(){ o.apply(self0,args0); },700); }
          }
        }
      }catch(e){}
      return o.apply(this,arguments);
    };
    w.__bfPoison=1;window.stepTurn=w;return true;
  }
  // NÚMERO DE CARTA: el motor numeraba por POSICIÓN en sus tablas, así que una carta nueva salía con un número
  // que no era el suyo ("Nº 071" en vez de "Nº 140"). Ahora siempre se usa el número real de la carta (el de la base
  // de datos); la posición solo si la carta no trae número.
  function hookCardNo(){
    if(typeof window.cardNo!=='function'||window.cardNo.__bfRealNo)return false;
    var o=window.cardNo;
    var w=function(id){
      try{
        var lists=[typeof HEROES!=='undefined'?HEROES:[],typeof SPELLS!=='undefined'?SPELLS:[],typeof MELEE!=='undefined'?MELEE:[],typeof RANGED!=='undefined'?RANGED:[],typeof ARMORS!=='undefined'?ARMORS:[],typeof OBJECTS!=='undefined'?OBJECTS:[],typeof BONUS!=='undefined'?BONUS:[]];
        for(var i=0;i<lists.length;i++){ var arr=lists[i]||[]; for(var j=0;j<arr.length;j++){ var x=arr[j]; if(x&&x.id===id&&Number(x.num)>0)return String(Number(x.num)).padStart(3,'0'); } }
      }catch(e){}
      return o.apply(this,arguments);
    };
    w.__bfRealNo=1;window.cardNo=w;return true;
  }
  // VENENO VISIBLE: insignia fija "☠️ turnos" en el retrato del envenenado, junto a las demás (dormido, paralizado...).
  function hookBadges(){
    if(typeof window.statusBadges!=='function'||window.statusBadges.__bfPoison)return false;
    var o=window.statusBadges;
    var w=function(h){
      var out=o.apply(this,arguments);
      try{ if(h&&h._bfPoison&&h._bfPoison.turns>0)out=(out||'')+'<span class="status-badge st-poison" title="Envenenado: -'+h._bfPoison.dmg+' al empezar cada turno" style="background:rgba(70,110,20,.85);border-color:#a8d84a;color:#eaffc0">\u2620\ufe0f'+h._bfPoison.turns+'</span>'; }catch(e){}
      return out;
    };
    w.__bfPoison=1;window.statusBadges=w;return true;
  }
  // SANAR CURA EL VENENO: el motor libera al aliado y lo anota ("Sanar: X liberado."); en ese momento se le quita
  // también el veneno (vale para el jugador, la IA y la partida en línea, que resuelve el anfitrión).
  function hookCleanse(){
    if(typeof window.pushLog!=='function'||window.pushLog.__bfPoisonCure)return false;
    var o=window.pushLog;
    var w=function(cls,txt){
      var r=o.apply(this,arguments);
      try{
        var m=/: (.+?) (?:liberado|vuelve a su estado normal)\.$/.exec(String(txt||''));
        if(m&&typeof G!=='undefined'&&G&&G.team){
          var side=(typeof B!=='undefined'&&B&&B.current)?B.current.side:null;
          var pool=(side?(G.team[side]||[]):[]).concat(G.team.p||[],G.team.o||[]);
          var h=pool.find(function(x){ return x&&x.alive&&x.name===m[1]&&x._bfPoison; });
          if(h){ h._bfPoison=null; o.call(this,'lh','\u2728 '+h.name+' se cura del veneno.'); }
        }
      }catch(e){}
      return r;
    };
    w.__bfPoisonCure=1;window.pushLog=w;return true;
  }
  function all(){ var a=hookDamage(),b=hookVel(),c=hookPoison(),d=hookCardNo(),e1=hookBadges(),f1=hookCleanse(); return window.dealDamage.__bfNewGear&&window.velocity&&window.velocity.__bfNewGear&&window.stepTurn&&window.stepTurn.__bfPoison&&window.cardNo&&window.cardNo.__bfRealNo&&window.statusBadges&&window.statusBadges.__bfPoison&&window.pushLog&&window.pushLog.__bfPoisonCure; }
  if(!all()){ var iv=setInterval(function(){ if(all())clearInterval(iv); },300); setTimeout(function(){ clearInterval(iv); },15000); }
})();
</script>
`;
