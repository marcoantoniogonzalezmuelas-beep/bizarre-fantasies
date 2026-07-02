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
    '.bf-battle-art{position:absolute!important;left:6px!important;top:6px!important;bottom:auto!important;width:128px!important;height:auto!important;aspect-ratio:3/4.1!important;border-radius:12px!important;overflow:hidden!important;background-size:contain!important;background-position:center top!important;background-repeat:no-repeat!important;background-color:#0a0710!important;border:1.5px solid rgba(255,210,74,.55)!important;box-shadow:0 6px 18px rgba(0,0,0,.6),0 0 16px rgba(255,210,74,.22),inset 0 0 0 1px rgba(255,255,255,.07),inset 0 -30px 32px -18px rgba(0,0,0,.72)!important;filter:saturate(1.16) contrast(1.1)!important;transform:none!important;opacity:1!important}',
    '.bf-battle-art::before{display:none!important}',
    '.bf-battle-art::after{content:"";position:absolute;inset:0;z-index:2;pointer-events:none;border-radius:12px;background:linear-gradient(180deg,rgba(255,255,255,.12) 0%,transparent 16%,transparent 68%,rgba(0,0,0,.5) 100%);mix-blend-mode:overlay!important}',
    '.bhero.active-turn .bf-battle-art{filter:saturate(1.32) contrast(1.16) brightness(1.07)!important;border-color:#ffd24a!important;box-shadow:0 6px 18px rgba(0,0,0,.6),0 0 28px rgba(255,210,74,.7),inset 0 0 0 1px rgba(255,245,200,.5)!important}',
    // ---- Campo de batalla épico ----
    '.bhero{padding-left:146px!important;min-height:188px!important;background:linear-gradient(135deg,rgba(34,24,58,.96),rgba(14,9,26,.98))!important;border:1.5px solid rgba(255,210,74,.22)!important;box-shadow:0 6px 16px rgba(0,0,0,.5)!important}',
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