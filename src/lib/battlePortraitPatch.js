// Parche inyectado en el iframe: retratos de batalla COMPLETOS (sin recorte por
// arriba) y campo de batalla más épico.
// Problema: el retrato usaba cover + posición vertical fija (center 26%) + un
// overscan (::before inset negativo) que empujaba la cabeza/cuernos/casco fuera
// del marco → se cortaba por arriba en héroes altos.
// Solución:
//  - Retrato con aspect-ratio 3/4.1 (mismo que la carta) + background-size:cover
//    + background-position:center top → la cabeza queda anclada arriba (nunca se
//    corta) y solo se recorta la zona inferior (la placa de nombre, redundante).
//  - Se oculta el ::before de overscan (era lo que sacaba la cabeza del cuadro).
//  - Marco más grande, borde dorado, glow, viñeta interior → look brutal.
//  - army-panel y bhero con gradientes, sombras y brillo dorado → épico.
// Las reglas van con !important y se inyectan DESPUÉS de battleUiPatch, así que
// prevalecen sobre sus overrides (y sobre los inline sin !important del refit).
export const BATTLE_PORTRAIT_PATCH = `
<script>
(function(){
  if (window.__bfBattlePortraitPatch) return;
  window.__bfBattlePortraitPatch = true;

  var st = document.createElement('style');
  st.textContent = [
    // ---- Retrato de batalla: ratio de carta, anclado arriba, sin recorte de cabeza ----
    // Mismo encuadre que los retratos de la fase de equipamiento: sangra por el
    // lateral izquierdo a toda la altura y se funde con el panel a la derecha.
    '.bf-battle-art{position:absolute!important;left:-22px!important;top:-18px!important;bottom:-18px!important;width:216px!important;height:auto!important;aspect-ratio:auto!important;border:0!important;border-radius:0!important;overflow:hidden!important;background-size:cover!important;background-position:center 10%!important;background-repeat:no-repeat!important;background-color:#0a0710!important;box-shadow:none!important;filter:saturate(1.14) contrast(1.1)!important;transform:none!important;opacity:1!important;z-index:1!important}',
    '.bf-battle-art::before{display:none!important}',
    '.bf-battle-art::after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;background:linear-gradient(180deg,rgba(8,5,14,.12) 0%,rgba(8,5,14,.42) 45%,rgba(8,5,14,.72) 100%),linear-gradient(90deg,rgba(0,0,0,0) 0%,rgba(0,0,0,.04) 48%,rgba(14,9,26,.95) 100%)!important;mix-blend-mode:normal!important}',
    '.bhero>*:not(.bf-battle-art):not(.bf-battle-zoom){position:relative;z-index:2}',
    // Lupa (zoom) sobre el retrato del héroe en batalla: se mantiene visible y
    // clickeable, igual que en la fase de equipamiento. Sin esta regla, el
    // selector genérico .bhero>*:not(.bf-battle-art) le robaría la posición
    // absoluta y la lupa desaparecería del recuadro del héroe.
    '.bhero .bf-battle-zoom{position:absolute!important;left:6px!important;top:6px!important;z-index:12!important;width:30px!important;height:30px!important;font-size:14px!important;background:rgba(8,5,14,.82)!important;border:1.5px solid rgba(255,210,74,.7)!important;color:#ffe49a!important;box-shadow:0 3px 10px rgba(0,0,0,.6),0 0 12px rgba(255,210,74,.25)!important;backdrop-filter:blur(4px)!important;transition:all .15s ease!important}',
    '.bhero .bf-battle-zoom:hover{background:rgba(255,210,74,.35)!important;transform:scale(1.18)!important;box-shadow:0 3px 12px rgba(0,0,0,.7),0 0 20px rgba(255,210,74,.6)!important}',
    '.bhero.active-turn .bf-battle-art{filter:saturate(1.3) contrast(1.16) brightness(1.07)!important}',
    // ---- Campo de batalla épico ----
    '.bhero{position:relative!important;overflow:hidden!important;border-radius:14px!important;padding-left:198px!important;min-height:240px!important;background:linear-gradient(180deg,rgba(8,5,14,.42),rgba(8,5,14,.92))!important;border:1.5px solid rgba(255,210,74,.22)!important;box-shadow:0 6px 16px rgba(0,0,0,.5)!important}',
    '.bhero.active-turn{border-color:rgba(255,210,74,.8)!important;box-shadow:0 0 0 1px rgba(255,210,74,.4),0 0 24px rgba(255,210,74,.3),0 6px 16px rgba(0,0,0,.5)!important}',
    '.army-panel{position:relative;overflow:hidden;background:linear-gradient(180deg,rgba(28,20,46,.92),rgba(12,8,22,.95))!important;border:1.5px solid rgba(255,210,74,.32)!important;box-shadow:0 12px 30px rgba(0,0,0,.55),inset 0 0 40px rgba(0,0,0,.4)!important}',
    '.army-panel::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background:radial-gradient(circle at 50% 0%,rgba(255,210,74,.10),transparent 60%)}',
    '.army-panel>*{position:relative;z-index:1}',
    '.army-name{font-family:Cinzel,serif!important;font-weight:1000!important;letter-spacing:.4px!important;text-shadow:0 2px 6px #000,0 0 14px rgba(255,210,74,.4)!important}'
  ].join('');
  document.head.appendChild(st);
})();
</script>
`;