// Efecto de SANGRE sobre el retrato del héroe cuando AGONIZA (≤10% HP).
// Problema anterior: el efecto usaba .bf-battle-art::after, que ya estaba
// ocupado por battlePortraitPatch (gradiente con !important), así que la
// sangre nunca se pintaba.
// Solución: un velo DOM dedicado (.bf-blood-veil) que se inyecta sobre el
// retrato con z-index superior, tiñendo todo el retrato de rojo degradado +
// gotitas de sangre animadas cayendo. También mejora la animación de los
// recuadros de estado con un pulso de borde más vivo.
export const HERO_BLOOD_FX_PATCH = `
<script>
(function(){
  if(window.__bfBloodFxPatch) return;
  window.__bfBloodFxPatch = true;

  var css =
  // ---- Velo de sangre sobre el retrato ----
  '.bf-blood-veil{position:absolute!important;left:-22px!important;top:-18px!important;bottom:-18px!important;width:216px!important;z-index:3!important;pointer-events:none!important;overflow:hidden!important;border-radius:0!important}' +
  // Tinte rojo degradado que tiñe TODO el retrato
  '.bf-blood-veil::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(140,0,0,.72) 0%,rgba(90,0,0,.88) 50%,rgba(60,0,0,.95) 100%);mix-blend-mode:multiply;animation:bfBloodTint 1s ease-in-out infinite}' +
  // Rayas de sangre verticales que se deslizan
  '.bf-blood-veil::after{content:"";position:absolute;inset:0;background:' +
    'repeating-linear-gradient(175deg,transparent 0 16px,rgba(200,0,0,.4) 16px 19px),' +
    'repeating-linear-gradient(185deg,transparent 0 23px,rgba(160,0,0,.3) 23px 25px),' +
    'radial-gradient(ellipse at 30% -5%,rgba(255,0,0,.7) 0%,transparent 14%),' +
    'radial-gradient(ellipse at 65% -5%,rgba(255,0,0,.6) 0%,transparent 12%),' +
    'radial-gradient(ellipse at 45% -5%,rgba(255,0,0,.5) 0%,transparent 10%)' +
    ';animation:bfBloodDrip 1.6s linear infinite}' +
  '@keyframes bfBloodTint{0%,100%{opacity:.65}50%{opacity:.95}}' +
  '@keyframes bfBloodDrip{0%{background-position:0 0,0 0,0 0,0 0,0 0}100%{background-position:0 42px,0 38px,0 0,0 0,0 0}}' +
  // Gotitas de sangre (elementos JS) que caen por el retrato
  '.bf-blood-drop{position:absolute;top:-20px;width:5px;height:12px;border-radius:50% 50% 50% 50%/60% 60% 40% 40%;background:linear-gradient(180deg,#ff1a1a,#7a0000);box-shadow:0 0 5px rgba(255,0,0,.9),0 1px 2px rgba(0,0,0,.5);animation:bfBloodFall linear infinite;pointer-events:none}' +
  '@keyframes bfBloodFall{0%{transform:translateY(0) scale(.4);opacity:0}8%{opacity:1}90%{opacity:.7}100%{transform:translateY(230px) scale(1.3);opacity:0}}' +
  // ---- Animación de borde de agonía más viva ----
  // Agonía SIN sacudida ni pulsos: borde rojo y velo estáticos.
  '.bhero.bf-agonizing{box-shadow:0 0 0 3px rgba(255,20,20,.9),0 0 30px rgba(255,0,0,.7),inset 0 0 20px rgba(120,0,0,.4)!important;animation:none!important;transform:none!important}' +
  // El velo de sangre y las gotas SIGUEN visibles, pero quietos (sin caída ni pulso).
  '.bhero .bf-blood-veil,.bhero .bf-blood-veil::before,.bhero .bf-blood-veil::after,.bhero .bf-blood-drop{animation:none!important;transition:none!important}';

  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  // Configuración de gotas de sangre: posición horizontal, delay, duración
  var DROPS = [
    {x:12,d:0,dur:2.4},{x:24,d:.6,dur:1.9},{x:38,d:1.1,dur:2.6},
    {x:52,d:.3,dur:2.1},{x:66,d:.9,dur:2.3},{x:80,d:1.4,dur:1.8},
    {x:92,d:.5,dur:2.5}
  ];

  function injectBloodVeil(card){
    var veil = card.querySelector('.bf-blood-veil');
    if(card.classList.contains('bf-agonizing')){
      if(!veil){
        veil = document.createElement('div');
        veil.className = 'bf-blood-veil';
        DROPS.forEach(function(d){
          var drop = document.createElement('div');
          drop.className = 'bf-blood-drop';
          drop.style.left = d.x + '%';
          // Gotas visibles pero estáticas: sin caída, se colocan a distintas alturas.
          drop.style.top = (10 + (d.d * 22) % 70) + '%';
          veil.appendChild(drop);
        });
        card.appendChild(veil);
      }
    } else if(veil){
      veil.remove();
    }
  }

  function update(){
    document.querySelectorAll('.bhero[id^="b_"]').forEach(injectBloodVeil);
  }

  // El estado de agonía solo puede cambiar cuando se redibuja la batalla.
  // Evitamos observar todo el documento, porque los nodos de cada efecto visual
  // hacían recorrer los retratos repetidamente durante las cinemáticas.
  function hookRender(){
    if(typeof window.renderBattle!=='function'||window.renderBattle.__bfBlood)return false;
    var original=window.renderBattle;
    window.renderBattle=function(){var result=original.apply(this,arguments);update();return result;};
    window.renderBattle.__bfBlood=1;
    return true;
  }
  var tries=0,timer=setInterval(function(){if(hookRender()||tries++>120)clearInterval(timer);},200);
  update();
})();
</script>
`;