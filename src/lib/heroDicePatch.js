// TIRADA DE DADO DEL HÉROE (habilidades tipo El Rolero).
//
// No tiene nada que ver con el d30 de pifia / fallo épico: esto es el dado que
// la propia habilidad lanza para calcular su potencia. Se muestra sobre la
// cinemática 3D de la habilidad: el dado gira unos instantes y se detiene en el
// número obtenido, marcando «¡CRÍTICO!» cuando el golpe atraviesa la defensa.
//
// API: window.__bfHeroDicePop({ faces, roll, label, mult, crit })
export const HERO_DICE_PATCH = `
<script>
(function(){
  if(window.__bfHeroDice) return;
  window.__bfHeroDice = true;

  var st = document.createElement('style');
  st.textContent = ''
    + '.bf-hdice{position:fixed;left:50%;top:34%;z-index:100007;pointer-events:none;transform:translate(-50%,-50%);display:flex;flex-direction:column;align-items:center;gap:6px;animation:bfHdIn .3s ease-out both}'
    + '@keyframes bfHdIn{from{opacity:0;transform:translate(-50%,-30%) scale(.6)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}'
    + '.bf-hdice.bf-hd-out{animation:bfHdOut .45s ease-in forwards}'
    + '@keyframes bfHdOut{to{opacity:0;transform:translate(-50%,-95%) scale(.95)}}'
    + '.bf-hdice-cube{width:96px;height:96px;border-radius:18px;display:flex;align-items:center;justify-content:center;'
    + "font-family:'Cinzel',serif;font-weight:900;font-size:44px;color:#fff5dc;"
    + 'background:linear-gradient(160deg,#2b1a48,#0c0714);border:3px solid #ffd24a;'
    + 'box-shadow:0 10px 26px rgba(0,0,0,.7),0 0 26px rgba(255,210,74,.55),inset 0 0 18px rgba(255,210,74,.25);'
    + 'text-shadow:0 0 14px rgba(255,210,74,.9),0 3px 6px #000;animation:bfHdRoll .16s linear infinite}'
    + '@keyframes bfHdRoll{0%{transform:rotate(-9deg) scale(1)}50%{transform:rotate(8deg) scale(1.06)}100%{transform:rotate(-9deg) scale(1)}}'
    + '.bf-hdice-cube.bf-hd-locked{animation:bfHdLock .5s ease-out both}'
    + '@keyframes bfHdLock{0%{transform:scale(1.3) rotate(6deg)}60%{transform:scale(.96) rotate(-2deg)}100%{transform:scale(1) rotate(0)}}'
    + '.bf-hdice-cube.bf-hd-crit{border-color:#ff5252;color:#ffdede;box-shadow:0 10px 26px rgba(0,0,0,.7),0 0 34px rgba(255,60,60,.85),inset 0 0 20px rgba(255,60,60,.35);text-shadow:0 0 16px rgba(255,90,90,.95),0 3px 6px #000}'
    + '.bf-hdice-lbl{padding:3px 12px;border-radius:999px;background:rgba(8,5,14,.9);border:1.5px solid #ffd24a;'
    + "font-family:'Cinzel',serif;font-weight:900;font-size:12px;letter-spacing:1px;color:#ffe9a8;white-space:nowrap;text-shadow:0 2px 4px #000}"
    + '.bf-hdice-crit{padding:3px 14px;border-radius:999px;background:rgba(60,0,0,.92);border:2px solid #ff5252;'
    + "font-family:'Cinzel',serif;font-weight:900;font-size:15px;letter-spacing:2px;color:#ff8a8a;white-space:nowrap;"
    + 'text-shadow:0 0 12px rgba(255,80,80,.95),0 2px 5px #000;animation:bfHdCrit .7s ease-in-out infinite}'
    + '@keyframes bfHdCrit{0%,100%{transform:scale(1)}50%{transform:scale(1.07)}}';
  document.head.appendChild(st);

  function pop(cfg){
    cfg = cfg || {};
    var faces = Number(cfg.faces || 20);
    var roll = Number(cfg.roll || 1);
    var box = document.createElement('div');
    box.className = 'bf-hdice';
    var cube = document.createElement('div');
    cube.className = 'bf-hdice-cube';
    cube.textContent = '?';
    var lbl = document.createElement('div');
    lbl.className = 'bf-hdice-lbl';
    lbl.textContent = (cfg.label || 'TIRADA') + ' \\u00b7 d' + faces;
    box.appendChild(cube);
    box.appendChild(lbl);
    (window.__bfAppend || function(x){ document.body.appendChild(x); })(box);

    // El dado gira mostrando números al azar y luego se detiene en el resultado.
    var spin = setInterval(function(){ cube.textContent = String(1 + Math.floor(Math.random() * faces)); }, 70);
    setTimeout(function(){
      clearInterval(spin);
      cube.textContent = String(roll);
      cube.classList.add('bf-hd-locked');
      if(cfg.crit) cube.classList.add('bf-hd-crit');
      lbl.textContent = (cfg.label || 'TIRADA') + ' \\u00b7 ' + roll + '/' + faces + (cfg.mult ? ' \\u2192 \\u00d7' + cfg.mult : '');
      if(cfg.crit){
        var c = document.createElement('div');
        c.className = 'bf-hdice-crit';
        c.textContent = '\\u{1F4A5} \\u00a1CR\\u00cdTICO! ATRAVIESA LA DEFENSA';
        box.appendChild(c);
      }
    }, 950);
    setTimeout(function(){ box.classList.add('bf-hd-out'); }, 3100);
    setTimeout(function(){ if(box.parentNode) box.parentNode.removeChild(box); }, 3600);
  }

  window.__bfHeroDicePop = pop;

  // Rival online: la tirada la resuelve el anfitrión y llega por los efectos.
  var tries = 0, iv = setInterval(function(){
    if(typeof window.flushFx === 'function' && !window.flushFx.__bfHdice){
      var orig = window.flushFx;
      window.flushFx = function(list){
        try{ (list || []).forEach(function(ev){ if(ev && ev.k === 'bfherodice') pop(ev.cfg || ev); }); }catch(e){}
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