// Habilidad PROPIA de los Patitos de Goma (token tk_patito_goma).
//
// El bloqueo (tanqueo) ya lo hace el motor: cualquier golpe dirigido a un aliado
// se desvía al patito vivo, para el resto de la partida, hasta que muere.
// Lo que faltaba era SU habilidad, que caía en el ataque genérico del motor:
//   · Normal — «Picotazo»: pequeño ataque a distancia a un rival y el patito
//     queda EN JUEGO como bloqueador mientras siga vivo.
//   · Élite — «Doble Metralleta Láser»: ráfaga de metralleta a TODOS los
//     rivales. Disparo de 10 a cada héroe enemigo. Lanza la cinemática 3D
//     de la habilidad y un efecto visual de ráfaga con trazadores y
//     destellos de impacto sobre cada rival.
export const DUCK_ABILITY_PATCH = `
<script>
(function(){
  if(window.__bfDuckAbil) return;
  window.__bfDuckAbil = true;

  function isDuck(h){ return !!h && (h._bfDuck || h._token === 'tk_patito_goma' || h.id === 'tk_patito_goma' || String(h.id||'').indexOf('tk_patito_goma') === 0); }

  // ---- CSS del efecto visual de metralleta ----
  var css = [
    '#bf-duck-mg{position:fixed;inset:0;z-index:100005;pointer-events:none;overflow:hidden}',
    '#bf-duck-mg .bf-mg-flash{position:absolute;width:80px;height:80px;border-radius:50%;background:radial-gradient(circle,rgba(255,220,80,.9),rgba(255,140,0,.4) 40%,transparent 70%);transform:translate(-50%,-50%);animation:bfMgFlash .12s ease-out infinite alternate}',
    '@keyframes bfMgFlash{from{opacity:.4;transform:translate(-50%,-50%) scale(.7)}to{opacity:1;transform:translate(-50%,-50%) scale(1.3)}}',
    '#bf-duck-mg .bf-mg-tracer{position:absolute;height:3px;transform-origin:left center;border-radius:2px;background:linear-gradient(90deg,rgba(255,240,160,.95),rgba(255,180,40,.6),transparent);box-shadow:0 0 8px rgba(255,200,60,.8);animation:bfMgTracer .08s linear forwards}',
    '@keyframes bfMgTracer{from{opacity:.9}to{opacity:0}}',
    '#bf-duck-mg .bf-mg-impact{position:absolute;width:50px;height:50px;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(255,200,40,.85),rgba(255,100,0,.3) 50%,transparent 70%);animation:bfMgImpact .25s ease-out forwards}',
    '@keyframes bfMgImpact{0%{opacity:1;transform:translate(-50%,-50%) scale(.4)}100%{opacity:0;transform:translate(-50%,-50%) scale(2)}}',
    '#bf-duck-mg .bf-mg-spark{position:absolute;width:4px;height:4px;border-radius:50%;background:#ffd24a;box-shadow:0 0 6px #ffb000;animation:bfMgSpark .3s ease-out forwards}',
    '@keyframes bfMgSpark{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--sx,20px),var(--sy,20px)) scale(0)}}',
    '#bf-duck-mg .bf-mg-label{position:absolute;top:8%;left:50%;transform:translateX(-50%);font-family:Cinzel,serif;font-weight:1000;font-size:clamp(20px,5vw,42px);color:#ffd24a;text-shadow:0 0 24px rgba(255,210,74,.9),0 0 48px rgba(255,180,40,.5),0 4px 10px #000;letter-spacing:4px;white-space:nowrap;animation:bfMgLabel .5s ease-out both}',
    '@keyframes bfMgLabel{0%{opacity:0;transform:translateX(-50%) scale(2)}100%{opacity:1;transform:translateX(-50%) scale(1)}}',
    '@media(max-width:880px){#bf-duck-mg .bf-mg-flash{width:50px;height:50px}#bf-duck-mg .bf-mg-impact{width:32px;height:32px}#bf-duck-mg .bf-mg-label{font-size:clamp(16px,6vw,28px)}}'
  ].join('\\n');
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  // Devuelve las coords centrales (x,y) de un héroe en pantalla.
  function heroPos(side, id){
    try{
      var card = document.getElementById('b_' + side + '_' + id);
      if(!card) return null;
      var r = card.getBoundingClientRect();
      return { x: r.left + r.width/2, y: r.top + r.height/2 };
    }catch(e){ return null; }
  }

  // Efecto visual de metralleta: fogonazo en el patito + trazadores y
  // destellos de impacto sobre cada rival durante ~1,5 s.
  function machineGunFx(side, h, targets){
    var ov = document.createElement('div');
    ov.id = 'bf-duck-mg';

    // Cartel
    var lbl = document.createElement('div');
    lbl.className = 'bf-mg-label';
    lbl.textContent = '\\u{1F525} METRALLETA L\\u00c1SER \\u{1F525}';
    ov.appendChild(lbl);

    // Fogonazo en la posición del patito
    var srcPos = heroPos(side, h.id);
    if(srcPos){
      var flash = document.createElement('div');
      flash.className = 'bf-mg-flash';
      flash.style.left = srcPos.x + 'px';
      flash.style.top = srcPos.y + 'px';
      ov.appendChild(flash);
    }

    (window.__bfAppend || function(n){ document.body.appendChild(n); })(ov);

    // Posiciones de los rivales (se leen al disparar, no antes: el retrato
    // puede moverse entre ráfagas).
    function fireBurst(){
      targets.forEach(function(t){
        var tp = heroPos(tSide(t), t.id);
        if(!tp || !srcPos) return;
        // Trazador (línea del patito al rival)
        var dx = tp.x - srcPos.x, dy = tp.y - srcPos.y;
        var len = Math.sqrt(dx*dx + dy*dy);
        var ang = Math.atan2(dy, dx) * 180 / Math.PI;
        var tr = document.createElement('div');
        tr.className = 'bf-mg-tracer';
        tr.style.left = srcPos.x + 'px';
        tr.style.top = srcPos.y + 'px';
        tr.style.width = len + 'px';
        tr.style.transform = 'rotate(' + ang + 'deg)';
        ov.appendChild(tr);
        // Destello de impacto en el rival
        var imp = document.createElement('div');
        imp.className = 'bf-mg-impact';
        imp.style.left = tp.x + 'px';
        imp.style.top = tp.y + 'px';
        ov.appendChild(imp);
        // Chispas dispersas
        for(var s = 0; s < 4; s++){
          var sp = document.createElement('div');
          sp.className = 'bf-mg-spark';
          sp.style.left = tp.x + 'px';
          sp.style.top = tp.y + 'px';
          sp.style.setProperty('--sx', ((Math.random() - 0.5) * 60).toFixed(0) + 'px');
          sp.style.setProperty('--sy', ((Math.random() - 0.5) * 60).toFixed(0) + 'px');
          ov.appendChild(sp);
        }
      });
    }

    // Ráfaga: 8 disparos en 1,4 s
    var bursts = 0;
    var mgTimer = setInterval(function(){
      fireBurst();
      bursts++;
      if(bursts >= 8) clearInterval(mgTimer);
    }, 160);
    fireBurst();

    // Limpieza
    setTimeout(function(){ if(ov.parentNode) ov.parentNode.removeChild(ov); }, 2200);
  }

  function install(){
    if(typeof window.useAbility !== 'function' || window.__bfDuckAbilHooked) return false;
    if(typeof G === 'undefined') return false;
    window.__bfDuckAbilHooked = true;
    var orig = window.useAbility;

    window.useAbility = function(side, h, done){
      if(!isDuck(h)) return orig.apply(this, arguments);
      var foes = enemySide(side);
      function sync(){ if(typeof renderBattle === 'function') renderBattle(); if(typeof netSync === 'function') netSync('s-battle'); }
      var finish = function(){ h.abilityUsed = true; sync(); if(typeof done === 'function') done(); };

      // ÉLITE — Doble Metralleta Láser: 10 de daño a TODOS los rivales.
      if(h.eliteMode){
        var targets = living(foes).slice();
        // Lanza la cinemática 3D de la habilidad (si el patito tiene arte
        // de animación asignado en la BD).
        if(typeof window.__bfPlayAbilityAnim === 'function'){
          try{ window.__bfPlayAbilityAnim(side, h, true); }catch(e){}
        }
        // Efecto visual de metralleta tras un breve margen (para que no
        // solape con el flash inicial de la cinemática 3D).
        setTimeout(function(){ machineGunFx(side, h, targets); }, 300);
        // Aplica 10 de daño a cada rival
        var total = 0;
        targets.forEach(function(t){
          var d = dealDamage(t, 10, { type:'ranged' });
          total += d;
          pushFx({ k:'arrow', fromSide:side, fromId:h.id, toSide:tSide(t), toId:t.id, hits:1 });
        });
        pushLog('ld', h.name + ' suelta una ráfaga de metralleta l\\u00e1ser sobre todos los rivales (-' + total + ').');
        finish();
        return;
      }

      // NORMAL — Picotazo: pequeño ataque a distancia y queda en juego bloqueando.
      var shoot = function(t){
        if(typeof window.__bfPlayAbilityAnim === 'function'){
          try{ window.__bfPlayAbilityAnim(side, h, true); }catch(e){}
        }
        var d = dealDamage(t, 2, { type:'ranged' });
        pushFx({ k:'arrow', fromSide:side, fromId:h.id, toSide:tSide(t), toId:t.id, hits:1 });
        pushFx({ k:'status', side:side, id:h.id, txt:'\\u{1F986}' });
        pushLog('ld', h.name + ' da un Picotazo a ' + t.name + ' (-' + d + ') y queda EN JUEGO bloqueando los golpes de sus aliados.');
        finish();
      };

      if(humanCtl(side)) pendTarget('Objetivo del Picotazo', foes, shoot);
      else {
        var t = living(foes).sort(function(a,b){ return a.hp - b.hp; })[0];
        if(t) shoot(t); else finish();
      }
    };
    return true;
  }

  var n = 0, iv = setInterval(function(){ if(install() || n++ > 150) clearInterval(iv); }, 150);
  install();
})();
</script>
`;