// Parche inyectado en el iframe: REPASO DE LA ACCIÓN DEFINITIVA.
//
// Al terminar la partida (pantalla de resultado), se superpone durante 3 s un
// mini-repaso en blanco y negro del último golpe mortal: retrato del ejecutor →
// icono y nombre de la acción con el daño → retrato del caído desplomándose,
// con un destello dorado en el instante del impacto. Se puede tocar para
// saltarlo y no añade ninguna espera: la pantalla de resultado ya está debajo.
//
// Los datos del golpe los anota killActorPatch en window.__bfFinalBlow.
export const FINAL_ACTION_RECAP_PATCH = `
<script>
(function(){
  if(window.__bfFinalRecap) return;
  window.__bfFinalRecap = true;

  var KIND = {
    attack: { icon: '\\u2694\\uFE0F', label: 'Ataque' },
    useAbility: { icon: '\\u2728', label: 'Habilidad' },
    castSpell: { icon: '\\u{1F52E}', label: 'Hechizo' },
    useItem: { icon: '\\u{1F9EA}', label: 'Objeto' }
  };

  var st = document.createElement('style');
  st.textContent =
  '#bf-recap{position:fixed;inset:0;z-index:999998;display:flex;align-items:center;justify-content:center;text-align:center;background:rgba(4,3,8,.9);cursor:pointer;animation:bfRcIn .25s ease-out}' +
  '#bf-recap.bf-rc-out{opacity:0;transition:opacity .45s ease-in}' +
  '@keyframes bfRcIn{from{opacity:0}to{opacity:1}}' +
  '.bf-rc-stage{position:relative;width:min(92vw,520px);text-align:center;filter:grayscale(1)}' +
  '.bf-rc-step{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);opacity:0}' +
  '.bf-rc-step.bf-rc-s1{animation:bfRcStep 1s ease-out .05s both}' +
  '.bf-rc-step.bf-rc-s2{animation:bfRcStep 1.1s ease-out 1s both}' +
  '.bf-rc-step.bf-rc-s3{animation:bfRcStep3 1.1s ease-out 2s both}' +
  '@keyframes bfRcStep{0%{opacity:0;transform:translateY(-50%) scale(.86)}18%{opacity:1;transform:translateY(-50%) scale(1)}80%{opacity:1}100%{opacity:0}}' +
  '@keyframes bfRcStep3{0%{opacity:0;transform:translateY(-50%) scale(.9) rotate(0)}18%{opacity:1;transform:translateY(-50%) scale(1) rotate(0)}100%{opacity:1;transform:translateY(-32%) scale(.94) rotate(7deg)}}' +
  '.bf-rc-port{width:min(52vw,190px);height:min(52vw,190px);margin:0 auto;border-radius:16px;border:2px solid #cfcfcf;background-size:cover;background-position:center 12%;box-shadow:0 10px 30px rgba(0,0,0,.7)}' +
  '.bf-rc-name{margin-top:10px;font-family:Cinzel,serif;font-weight:900;font-size:clamp(17px,5vw,26px);color:#fff;letter-spacing:2px;text-shadow:0 2px 8px #000}' +
  '.bf-rc-tag{margin-top:4px;font-family:Rubik,sans-serif;font-weight:700;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#bdbdbd}' +
  '.bf-rc-act{font-size:clamp(44px,14vw,84px);line-height:1;filter:drop-shadow(0 0 18px rgba(255,255,255,.5))}' +
  '.bf-rc-dmg{margin-top:8px;font-family:Cinzel,serif;font-weight:900;font-size:clamp(22px,7vw,38px);color:#fff;text-shadow:0 0 18px rgba(255,255,255,.6),0 2px 8px #000}' +
  '.bf-rc-flash{position:absolute;inset:-40px;pointer-events:none;background:radial-gradient(circle,rgba(255,210,74,.55),transparent 68%);opacity:0;animation:bfRcFlash .5s ease-out 1.95s}' +
  '@keyframes bfRcFlash{0%{opacity:0}30%{opacity:1}100%{opacity:0}}' +
  '.bf-rc-hint{position:absolute;left:0;right:0;bottom:18px;font-family:Rubik,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8b8b8b}' +
  '.bf-rc-title{position:absolute;left:0;right:0;top:20px;font-family:Cinzel,serif;font-weight:900;font-size:clamp(13px,4vw,18px);letter-spacing:5px;text-transform:uppercase;color:#d8d8d8;text-shadow:0 2px 8px #000}';
  document.head.appendChild(st);

  function art(key, name, elite){
    var m = window.__bfCardArtMap || {};
    var e = m[key] || m[name] || null;
    if(!e) return '';
    return (elite ? (e.elite || e.base) : e.base) || '';
  }

  function show(fb){
    if(document.getElementById('bf-recap')) return;
    var k = KIND[fb.kind] || KIND.attack;
    var ov = document.createElement('div');
    ov.id = 'bf-recap';
    ov.innerHTML =
      '<div class="bf-rc-title">Acci\\u00f3n definitiva</div>' +
      '<div class="bf-rc-stage" style="height:min(64vw,270px)">' +
        '<div class="bf-rc-step bf-rc-s1">' +
          '<div class="bf-rc-port" style="background-image:url(&quot;' + art(fb.actorKey, fb.actorName, fb.actorElite) + '&quot;)"></div>' +
          '<div class="bf-rc-name">' + (fb.actorName || '?') + '</div>' +
          '<div class="bf-rc-tag">Ejecutor</div>' +
        '</div>' +
        '<div class="bf-rc-step bf-rc-s2">' +
          '<div class="bf-rc-act">' + k.icon + '</div>' +
          '<div class="bf-rc-name">' + k.label + '</div>' +
          '<div class="bf-rc-dmg">-' + fb.amount + ' \\u2764</div>' +
        '</div>' +
        '<div class="bf-rc-step bf-rc-s3">' +
          '<div class="bf-rc-port" style="background-image:url(&quot;' + art(fb.victimKey, fb.victimName, fb.victimElite) + '&quot;)"></div>' +
          '<div class="bf-rc-name">' + (fb.victimName || '?') + '</div>' +
          '<div class="bf-rc-tag">Ca\\u00eddo</div>' +
        '</div>' +
        '<div class="bf-rc-flash"></div>' +
      '</div>' +
      '<div class="bf-rc-hint">Toca para saltar</div>';
    document.body.appendChild(ov);

    function close(){
      if(!ov.parentNode) return;
      ov.classList.add('bf-rc-out');
      setTimeout(function(){ if(ov.parentNode) ov.parentNode.removeChild(ov); }, 450);
    }
    ov.addEventListener('click', close);
    setTimeout(close, 3100);
  }

  // La pantalla de resultado se activa al terminar la partida: ese es el momento
  // del repaso. Cada partida se repasa una sola vez (marca de tiempo del golpe).
  var shown = 0;
  // La cinemática de victoria/derrota espera a este aviso: antes arrancaban a la vez y el repaso
  // (z-index mayor) tapaba los retratos de los héroes durante sus primeros 3 segundos.
  window.__bfRecapPending = function(){
    var res = document.getElementById('s-result');
    if(!res || !res.classList.contains('active')) return false;
    if(document.getElementById('bf-recap')) return true;
    var fb = window.__bfFinalBlow;
    return !!(fb && fb.ts !== shown && window.__bfKillFinalShown !== fb.ts);
  };
  setInterval(function(){
    var res = document.getElementById('s-result');
    if(!res || !res.classList.contains('active')) return;
    var fb = window.__bfFinalBlow;
    if(!fb || fb.ts === shown || window.__bfKillFinalShown===fb.ts) return;
    shown = fb.ts;
    show(fb);
  }, 300);
})();
</script>
`;