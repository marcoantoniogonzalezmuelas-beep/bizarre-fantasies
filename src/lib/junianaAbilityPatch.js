// Parche inyectado en el iframe: implementa la habilidad de Juniana
// (Refracción Arcana / Supernova Espejada, card_id "juni").
//
// La habilidad es PASIVA: al activarse, reproduce la cinemática 3D, se marca
// como "EN JUEGO" (no se puede volver a activar) y pasa el turno. La refracción
// de daño (la mitad del daño recibido devuelta al atacante) la gestiona el
// propio motor del juego (patchDuckAbility en gameHtml) a través del akind
// 'reflect-damage'. Este parche SOLO añade la cinemática y el marcador
// "EN JUEGO"; NO duplica la lógica de refracción (antes lo hacía y causaba
// doble reflejo + objetivos equivocados).
export const JUNIANA_ABILITY_PATCH = `
<script>
(function(){
  if(window.__bfJunianaPatch) return;
  window.__bfJunianaPatch = true;

  function isJun(h){ return h && (h.id === 'juni' || h.cid === 'juni' || h.card_id === 'juni' || h.akind === 'reflect-damage' || h.akind === 'Jdjdjjxjx'); }

  // Hook de useAbility: intercepta la activación de Juniana. Reproduce la
  // cinemática, marca la habilidad como pasiva (_bfRefract + abilityUsed) y
  // pasa el turno. La refracción la hace el motor (akind 'reflect-damage').
  function installAbility(){
    if(typeof window.useAbility !== 'function' || window.__bfJunianaHooked) return false;
    window.__bfJunianaHooked = true;
    var orig = window.useAbility;
    window.useAbility = function(side, h, done){
      if(!isJun(h)) return orig.apply(this, arguments);
      // Tirada de d20 como el resto de héroes. Al ser una habilidad de efecto
      // permanente: sin fallo épico y, si sale pifia (19-20 o 1), no ocurre
      // nada pero la habilidad queda marcada como usada.
      try{
        var r = 1 + Math.floor(Math.random() * 20);
        var fum = (r >= 19 || r === 1);
        if(typeof pushLog === 'function'){
          pushLog(fum ? 'lx' : 'li', '\\u{1F3B2} Tirada d20 (habilidad): ' + r + '/20 \\u2192 ' + (fum ? '\\u00a1PIFIA! La habilidad no produce ning\\u00fan efecto.' : 'OK.'));
        }
        if(fum){
          h.abilityUsed = true;
          if(typeof window.__bfFumblePop === 'function') window.__bfFumblePop(side, h.id, false, r);
          if(typeof renderBattle === 'function') renderBattle();
          if(typeof netSync === 'function') netSync('s-battle');
          setTimeout(function(){ if(typeof done === 'function') done(); else if(typeof finishAct === 'function') finishAct(); }, 900);
          return;
        }
      }catch(e){}
      try{
        h._bfRefract = true;
        h.abilityUsed = true;
        if(typeof window.__bfPlayAbilityAnim === 'function'){
          try{ window.__bfPlayAbilityAnim(side, h); }catch(e){}
        }
        var name = h.eliteMode ? (h.eAbility || h.ability || h.name) : (h.ability || h.name);
        if(typeof pushLog === 'function') pushLog('li', name + ' se activa: reflejar\\u00e1 el da\\u00f1o recibido mientras siga viva.');
        if(typeof pushFx === 'function') pushFx({k:'status', side:side, id:h.id, txt:'\\u2726'});
        if(typeof renderBattle === 'function') renderBattle();
        if(typeof netSync === 'function') netSync('s-battle');
      }catch(e){}
      if(typeof done === 'function') done(); else if(typeof finishAct === 'function') finishAct();
    };
    return true;
  }

  // Panel de acciones: muestra la habilidad como "EN JUEGO" y desactiva el
  // bot\\u00f3n (es pasiva, no se puede volver a pulsar). Igual que la Grulla.
  function markPassiveButton(){
    try{
      if(typeof B === 'undefined' || !B || !B.current) return;
      var h = (typeof getHero === 'function') ? getHero(B.current.side, B.current.id) : null;
      if(!h || !isJun(h) || !h._bfRefract) return;
      var btn = document.querySelector('.jrpg-btn.ability');
      if(!btn || btn.dataset.bfJuniana === '1') return;
      btn.dataset.bfJuniana = '1';
      btn.classList.add('disabled');
      btn.removeAttribute('onclick');
      btn.onclick = null;
      btn.style.pointerEvents = 'none';
      var name = h.ability || 'Refracci\\u00f3n Arcana';
      var lab = btn.querySelector('.jrpg-btn-label');
      var val = btn.querySelector('.jrpg-btn-val');
      if(lab) lab.innerHTML = '<span style="display:block;font-size:11px;color:#c79bff;letter-spacing:.6px">EN JUEGO</span><span style="display:block">' + name + '</span>';
      if(val){ val.textContent = '\\u2726'; val.style.color = '#c79bff'; }
      btn.title = name + ': pasiva - refleja el da\\u00f1o recibido.';
    }catch(e){}
  }

  // ---- Refracción: espejo + haz de luz hacia el objetivo ----
  function fxCss(){
    if(document.getElementById('bf-refract-fx-css')) return;
    var st=document.createElement('style'); st.id='bf-refract-fx-css';
    st.textContent='.bf-refract-mirror{position:fixed;z-index:9999;pointer-events:none;width:46px;height:60px;border-radius:23px/30px;transform:translate(-50%,-50%);background:linear-gradient(135deg,#fff,#dff3ff 28%,#c79bff 58%,#fff);border:3px solid #f3e4ff;box-shadow:0 0 26px #c79bff,inset 0 0 16px rgba(255,255,255,.9);animation:bfMirrorPop 1s ease-out forwards}'
      +'.bf-refract-beam{position:fixed;z-index:9998;pointer-events:none;height:10px;border-radius:999px;transform-origin:0 50%;background:linear-gradient(90deg,#fff,#e9d4ff 30%,#c79bff 70%,rgba(199,155,255,0));box-shadow:0 0 22px #c79bff,0 0 44px rgba(199,155,255,.6);animation:bfBeamShoot .8s ease-out forwards}'
      +'@keyframes bfMirrorPop{0%{opacity:0;transform:translate(-50%,-50%) scale(.4) rotate(-18deg)}25%{opacity:1;transform:translate(-50%,-50%) scale(1.15) rotate(6deg)}100%{opacity:0;transform:translate(-50%,-50%) scale(1) rotate(0)}}'
      +'@keyframes bfBeamShoot{0%{opacity:0;transform:scaleX(.05)}20%{opacity:1}70%{opacity:1;transform:scaleX(1)}100%{opacity:0;transform:scaleX(1)}}';
    document.head.appendChild(st);
  }
  function center(el){ if(!el) return null; var r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; }
  function beam(fromEl,toEl){
    var a=center(fromEl), b=center(toEl);
    if(!a||!b) return;
    fxCss();
    var m=document.createElement('div'); m.className='bf-refract-mirror';
    m.style.left=a.x+'px'; m.style.top=a.y+'px';
    (window.__bfAppend||function(x){document.body.appendChild(x);})(m);
    var dx=b.x-a.x, dy=b.y-a.y, len=Math.sqrt(dx*dx+dy*dy);
    var bm=document.createElement('div'); bm.className='bf-refract-beam';
    bm.style.left=a.x+'px'; bm.style.top=(a.y-5)+'px'; bm.style.width=len+'px';
    bm.style.transform='rotate('+(Math.atan2(dy,dx)*180/Math.PI)+'deg)';
    (window.__bfAppend||function(x){document.body.appendChild(x);})(bm);
    setTimeout(function(){ if(m.parentNode)m.remove(); if(bm.parentNode)bm.remove(); },1060);
  }
  function card(side,id){ return document.getElementById('b_'+side+'_'+id); }

  // Mecánica de la refracción (sustituye a la del motor, que no distinguía élite):
  //  · Normal: devuelve la MITAD del daño recibido al MISMO rival que la hirió.
  //  · Élite: devuelve TODO ese daño como daño mágico a TODOS los rivales.
  function installReflect(){
    // Espera a que el motor haya instalado su propio dealDamage para envolverlo
    // por fuera (así podemos anular su reflejo y aplicar el nuestro).
    if(!window.__bfDuckPatched) return false;
    if(typeof window.dealDamage!=='function' || window.dealDamage.__bfRefract) return false;
    var orig=window.dealDamage;
    window.dealDamage=function(target,amount,opts){
      var isRef = target && target.akind==='reflect-damage' && target.alive && Number(amount)>0 && !(opts&&opts.bfReflect);
      if(!isRef) return orig.apply(this,arguments);
      // Copia de opts con bfReflect: desactiva el reflejo interno del motor.
      var o={}; if(opts) for(var k in opts) o[k]=opts[k]; o.bfReflect=true;
      var dealt=orig.call(this,target,amount,o);
      try{
        if(dealt>0 && typeof B!=='undefined' && B && B.current && typeof getHero==='function'){
          var attacker=getHero(B.current.side,B.current.id);
          var tSideF=(typeof tSide==='function')?tSide:null;
          var tgtSide=tSideF?tSideF(target):'';
          var atkSide=(attacker&&tSideF)?tSideF(attacker):'';
          // Solo se refracta el daño de un RIVAL (nunca a aliados ni a sí misma).
          if(attacker && attacker.alive && attacker!==target && atkSide && tgtSide && atkSide!==tgtSide){
            var src=card(tgtSide,target.id);
            var victims, dmg;
            if(target.eliteMode){
              victims=((typeof G!=='undefined'&&G.team&&G.team[atkSide])||[]).filter(function(h){return h&&h.alive;});
              dmg=Math.ceil(dealt/2);
            } else {
              victims=[attacker];
              dmg=Math.ceil(dealt/2);
            }
            victims.forEach(function(v){
              beam(src,card(atkSide,v.id));
              orig.call(window,v,dmg,{type:'spell',element:'arcano',bfReflect:true});
              if(typeof pushFx==='function') pushFx({k:'spell',toSide:atkSide,toId:v.id,el:'arcano'});
            });
            if(typeof pushLog==='function'){
              pushLog('li','\\u2726 '+target.name+' refracta '+dmg+' de da\\u00f1o m\\u00e1gico a '+(target.eliteMode?'todos los rivales':attacker.name)+'.');
            }
          }
        }
      }catch(e){}
      return dealt;
    };
    window.dealDamage.__bfRefract=1;
    return true;
  }

  var tries = 0;
  var timer = setInterval(function(){
    installAbility();
    installReflect();
    if((window.__bfJunianaHooked && window.dealDamage && window.dealDamage.__bfRefract) || tries++ > 300) clearInterval(timer);
  }, 150);
  setInterval(markPassiveButton, 250);
})();
</script>
`;