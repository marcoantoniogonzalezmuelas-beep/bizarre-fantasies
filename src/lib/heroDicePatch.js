// TIRADA DE DADO DEL HÉROE (cinemática bizarra reutilizable).
//
// No tiene nada que ver con el d30 de pifia / fallo épico: esto es el dado que
// lanza la PROPIA habilidad para decidir algo al azar (potencia, reparto,
// objetivo…). Cualquier habilidad —presente o futura— que tire un dado debe
// usar el mismo motor para que la cinemática y el registro sean idénticos:
//
//   var roll = window.__bfHeroRoll({ faces:20, hero:'El Rolero', label:'TIRADA CRÍTICA',
//                                    forced:20, crit:true, mult:'2.00', note:'potencia sobre su HE' });
//
// __bfHeroRoll: tira el dado, lo anuncia en el registro de batalla, lanza la
// cinemática en local y la propaga al rival online (efecto 'bfherodice').
// __bfHeroDicePop: solo la cinemática (la usa el rival al recibir el efecto).
import { HERO_DICE_PRESENTATION_CSS } from '@/lib/heroDicePresentation';

export const HERO_DICE_PATCH = `
<script>
(function(){
  if(window.__bfHeroDice) return;
  window.__bfHeroDice = true;

  var st = document.createElement('style');
  st.textContent = ''
    // Telón bizarro: la pantalla se oscurece y late en morado mientras rueda el dado.
    + '.bf-hdice-veil{position:fixed;inset:0;z-index:100005;pointer-events:none;'
    + 'background:radial-gradient(circle at 50% 34%,rgba(120,40,220,.34),rgba(4,2,8,.86) 68%);'
    + 'animation:bfHdVeil .35s ease-out both}'
    + '@keyframes bfHdVeil{from{opacity:0}to{opacity:1}}'
    + '.bf-hdice-veil.bf-hd-out{animation:bfHdVeilOut .5s ease-in forwards}'
    + '@keyframes bfHdVeilOut{to{opacity:0}}'
    + '.bf-hdice{position:fixed;left:50%;top:38%;z-index:100007;pointer-events:none;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:8px;animation:bfHdIn .34s cubic-bezier(.2,1.6,.4,1) both}'
    + '@keyframes bfHdIn{from{opacity:0;transform:translate(-50%,-10%) scale(.3) rotate(-40deg)}to{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(0)}}'
    + '.bf-hdice.bf-hd-out{animation:bfHdOut .5s ease-in forwards}'
    + '@keyframes bfHdOut{to{opacity:0;transform:translate(-50%,-120%) scale(.9) rotate(18deg)}}'
    // Aura giratoria de runas alrededor del dado.
    + '.bf-hdice-aura{position:absolute;width:210px;height:210px;border-radius:50%;'
    + 'background:conic-gradient(from 0deg,transparent,rgba(255,210,74,.55),transparent 40%,rgba(192,91,255,.6),transparent 75%);'
    + 'filter:blur(6px);animation:bfHdAura 1.5s linear infinite}'
    + '@keyframes bfHdAura{to{transform:rotate(360deg)}}'
    + '.bf-hdice-cube{position:relative;width:104px;height:104px;border-radius:20px;display:flex;align-items:center;justify-content:center;'
    + "font-family:'Cinzel',serif;font-weight:900;font-size:46px;color:#fff5dc;"
    + 'background:linear-gradient(160deg,#3a1d63,#0c0714 70%);border:3px solid #ffd24a;'
    + 'box-shadow:0 12px 30px rgba(0,0,0,.75),0 0 30px rgba(255,210,74,.6),inset 0 0 22px rgba(192,91,255,.35);'
    + 'text-shadow:0 0 16px rgba(255,210,74,.95),0 3px 6px #000;animation:bfHdRoll .13s linear infinite}'
    + '@keyframes bfHdRoll{0%{transform:rotate(-14deg) scale(1) skewX(-4deg)}33%{transform:rotate(11deg) scale(1.09) skewX(5deg)}66%{transform:rotate(-6deg) scale(.96) skewX(-2deg)}100%{transform:rotate(-14deg) scale(1) skewX(-4deg)}}'
    + '.bf-hdice-cube.bf-hd-locked{animation:bfHdLock .55s cubic-bezier(.2,1.7,.3,1) both}'
    + '@keyframes bfHdLock{0%{transform:scale(1.45) rotate(9deg)}55%{transform:scale(.92) rotate(-3deg)}100%{transform:scale(1) rotate(0)}}'
    + '.bf-hdice-cube.bf-hd-crit{border-color:#ff5252;color:#ffdede;background:linear-gradient(160deg,#5d0f14,#12060a 70%);'
    + 'box-shadow:0 12px 30px rgba(0,0,0,.75),0 0 40px rgba(255,60,60,.9),inset 0 0 24px rgba(255,60,60,.4);text-shadow:0 0 18px rgba(255,90,90,1),0 3px 6px #000}'
    // Ojo bizarro que se abre en el dado al detenerse.
    + '.bf-hdice-eye{position:absolute;bottom:-9px;right:-9px;width:30px;height:30px;border-radius:50%;'
    + 'background:radial-gradient(circle at 50% 50%,#fff 0 18%,#c06bff 19% 46%,#12061f 47%);'
    + 'border:2px solid #ffd24a;box-shadow:0 0 14px rgba(192,91,255,.9);animation:bfHdEye 1.6s ease-in-out infinite}'
    + '@keyframes bfHdEye{0%,100%{transform:scaleY(1)}45%{transform:scaleY(.12)}}'
    + '.bf-hdice-lbl{padding:4px 14px;border-radius:999px;background:rgba(8,5,14,.92);border:1.5px solid #ffd24a;'
    + "font-family:'Cinzel',serif;font-weight:900;font-size:12.5px;letter-spacing:1.2px;color:#ffe9a8;white-space:nowrap;text-shadow:0 2px 4px #000}"
    + '.bf-hdice-note{font-family:Rubik,sans-serif;font-size:11px;font-weight:700;color:#d9c7ff;text-shadow:0 2px 4px #000;letter-spacing:.4px}'
    + '.bf-hdice-crit{padding:4px 16px;border-radius:999px;background:rgba(60,0,0,.92);border:2px solid #ff5252;'
    + "font-family:'Cinzel',serif;font-weight:900;font-size:15px;letter-spacing:2px;color:#ff8a8a;white-space:nowrap;"
    + 'text-shadow:0 0 12px rgba(255,80,80,.95),0 2px 5px #000;animation:bfHdCrit .7s ease-in-out infinite}'
    + '@keyframes bfHdCrit{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}'
    // Chispas que salen disparadas al fijarse el resultado.
    + '.bf-hdice-spark{position:absolute;left:50%;top:50%;width:7px;height:7px;border-radius:50%;background:#ffd24a;'
    + 'box-shadow:0 0 12px #ffd24a;animation:bfHdSpark .75s ease-out forwards}'
    + '@keyframes bfHdSpark{from{opacity:1;transform:translate(-50%,-50%) scale(1)}to{opacity:0;transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(.2)}}';
  st.textContent += ${JSON.stringify(HERO_DICE_PRESENTATION_CSS)};
  document.head.appendChild(st);
  var ROLL_MS=2600, READ_MS=4500, EXIT_MS=550;
  var TOTAL_MS=ROLL_MS+READ_MS+EXIT_MS;

  var BIZARRE = ['\\u00a1EL DADO DECIDE!', 'EL AZAR BIZARRO HABLA', 'RUEDA EL HUESO M\\u00c1GICO', 'EL DESTINO TARTAMUDEA', 'CAOS EN 3, 2, 1\\u2026'];

  function pop(cfg){
    cfg = cfg || {};
    var faces = Number(cfg.faces || 20);
    var roll = Number(cfg.roll || 1);
    var veil = document.createElement('div');
    veil.className = 'bf-hdice-veil';
    var box = document.createElement('div');
    box.className = 'bf-hdice';
    var aura = document.createElement('div');
    aura.className = 'bf-hdice-aura';
    var cube = document.createElement('div');
    cube.className = 'bf-hdice-cube';
    cube.textContent = '?';
    var lbl = document.createElement('div');
    lbl.className = 'bf-hdice-lbl';
    lbl.textContent = BIZARRE[Math.floor(Math.random() * BIZARRE.length)] + ' \\u00b7 d' + faces;
    var note = document.createElement('div');
    note.className = 'bf-hdice-note';
    note.textContent = [cfg.hero, cfg.label].filter(Boolean).join(' \\u00b7 ');
    var stage=document.createElement('div');stage.className='bf-hdice-stage';
    var cup=document.createElement('div');cup.className='bf-hdice-cup';cup.setAttribute('aria-hidden','true');
    stage.appendChild(aura);stage.appendChild(cup);stage.appendChild(cube);
    var who=document.createElement('div');who.className='bf-hdice-who';who.textContent=note.textContent;
    box.setAttribute('role','status');box.setAttribute('aria-live','polite');
    box.appendChild(who);
    box.appendChild(stage);
    box.appendChild(lbl);
    box.appendChild(note);
    document.body.appendChild(veil);
    document.body.appendChild(box);

    // El dado gira mostrando números al azar y luego se detiene en el resultado.
    var spin = setInterval(function(){ cube.textContent = String(1 + Math.floor(Math.random() * faces)); }, 65);
    setTimeout(function(){
      clearInterval(spin);
      cube.textContent = String(roll);
      cube.classList.add('bf-hd-locked');
      box.classList.add('bf-hd-result');
      if(cfg.crit) cube.classList.add('bf-hd-crit');
      aura.style.animationDuration = '4s';
      var eye = document.createElement('div');
      eye.className = 'bf-hdice-eye';
      cube.appendChild(eye);
      for(var i = 0; i < 12; i++){
        var s = document.createElement('div');
        s.className = 'bf-hdice-spark';
        var ang = (Math.PI * 2 * i) / 12;
        s.style.setProperty('--dx', Math.round(Math.cos(ang) * 110) + 'px');
        s.style.setProperty('--dy', Math.round(Math.sin(ang) * 110) + 'px');
        if(cfg.crit) s.style.background = '#ff6a6a';
        cube.appendChild(s);
      }
      lbl.textContent = (window.__bfLangEn?'RESULT: ':'RESULTADO: ') + roll + ' / ' + faces + (cfg.mult ? '  \\u2192  \\u00d7' + cfg.mult : '');
      note.textContent = cfg.note || '';
      if(faces===3 && String(cfg.label||'').toLowerCase()==='desorientado') note.textContent=(window.__bfLangEn?['Attacks an enemy','Attacks an ally (or self if alone)','Attacks self']:['Ataca a un rival','Ataca a un aliado (o a sí mismo si está solo)','Se ataca a sí mismo'])[roll-1];
      if(faces===2 && cfg.label==='Compresor Roto') note.textContent=roll===1?'SIN FASE ÉLITE':'SIN HABILIDAD';
      if(cfg.crit){
        var c = document.createElement('div');
        c.className = 'bf-hdice-crit';
        c.textContent = '\\ud83d\\udca5 \\u00a1CR\\u00cdTICO! ATRAVIESA LA DEFENSA';
        box.appendChild(c);
      }
    }, ROLL_MS);
    setTimeout(function(){ box.classList.add('bf-hd-out'); veil.classList.add('bf-hd-out'); }, ROLL_MS+READ_MS);
    setTimeout(function(){
      if(box.parentNode) box.parentNode.removeChild(box);
      if(veil.parentNode) veil.parentNode.removeChild(veil);
    }, TOTAL_MS);
  }

  // Lanza la cinemática del dado esperando a que termine la cinemática 3D que
  // haya en cola (la de la acción anterior). REGLA GENERAL: cualquier tirada
  // de dado sale DESPUÉS de la animación 3D en curso, nunca solapada.
  function launchPop(payload, onSettled){
    // Una tirada = un solo dado: la misma tirada llega por la vía local y por
    // la cola de efectos (flushFx); la segunda se descarta.
    window.__bfDiceSeen = window.__bfDiceSeen || {};
    if(payload && payload.rid){ if(window.__bfDiceSeen[payload.rid]) return; window.__bfDiceSeen[payload.rid] = 1; }
    var start = Date.now();
    function tick(){
      if(document.querySelector('.bf-hdice')){setTimeout(tick,200);return;}
      if(typeof window.__bfCinematicBusy === 'function' && window.__bfCinematicBusy()){
        if(Date.now() - start < 12000){ setTimeout(tick, 200); return; }
      }
      pop(payload);
      if(typeof onSettled === 'function') setTimeout(onSettled, TOTAL_MS+50);
    }
    tick();
  }
  window.__bfHeroDiceLaunch = launchPop;

  // Motor compartido: cualquier habilidad (actual o futura) tira aquí su dado.
  function roll(cfg){
    cfg = cfg || {};
    var faces = Number(cfg.faces || 20);
    var value = cfg.forced != null ? Number(cfg.forced)
      : (typeof window.__bfDie === 'function' ? window.__bfDie(faces) : (1 + Math.floor(Math.random() * faces)));
    var payload = { faces:faces, roll:value, crit:!!cfg.crit, mult:cfg.mult, label:cfg.label, hero:cfg.hero, note:cfg.note, rid: Date.now().toString(36) + Math.random().toString(36).slice(2,7) };
    if(typeof pushLog === 'function'){
      pushLog('li', '\\ud83c\\udfb2 Tirada de habilidad' + (cfg.hero ? ' de ' + cfg.hero : '')
        + (cfg.label ? ' (' + cfg.label + ')' : '') + ': ' + value + '/' + faces
        + (cfg.mult ? ' \\u2192 \\u00d7' + cfg.mult : '')
        + (cfg.note ? ' \\u2014 ' + cfg.note : '')
        + (cfg.crit ? ' \\u2014 \\u00a1CR\\u00cdTICO! atraviesa escudo y armadura.' : '.'));
    }
    // El dado se lanza tras un breve retardo (arranque de la cinemática de la
    // habilidad) y SIEMPRE después de que termine la cinemática 3D en cola.
    setTimeout(function(){ launchPop(payload, cfg.onSettled); }, cfg.delay != null ? cfg.delay : 700);
    if(typeof pushFx === 'function') pushFx({ k:'bfherodice', cfg:payload });
    return value;
  }

  window.__bfHeroDicePop = pop;
  window.__bfHeroRoll = roll;

  // Rival online: la tirada la resuelve el anfitrión y llega por los efectos.
  var tries = 0, iv = setInterval(function(){
    if(typeof window.flushFx === 'function' && !window.flushFx.__bfHdice){
      var orig = window.flushFx;
      window.flushFx = function(list){
        try{ (list || []).forEach(function(ev){ if(ev && ev.k === 'bfherodice') launchPop(ev.cfg || ev); }); }catch(e){}
        return orig.apply(this, arguments);
      };
      window.flushFx.__bfHdice = 1;
      clearInterval(iv);
    }
    if(tries++ > 200) clearInterval(iv);
  }, 250);
})();
</script>
`;