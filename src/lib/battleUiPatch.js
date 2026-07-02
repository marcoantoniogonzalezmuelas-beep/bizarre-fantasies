// Parche inyectado en el HTML del juego (iframe) para la fase de batalla:
// 1) Miniaturas del "Orden de turno": redondas (círculo con borde dorado),
//    sin solaparse con el nombre y con recorte que elimina bordes blancos.
// 2) Retratos de los héroes en batalla: mismo marco uniforme que en la fase
//    de equipamiento (rectángulo fijo, esquinas redondeadas, zoom de recorte).
// 3) 3 vs 3 garantizado: al terminar la subasta, cualquier equipo con menos
//    de 3 héroes se completa automáticamente con héroes Bizarros.
export const BATTLE_UI_PATCH = `
<script>
(function(){
  if (window.__bfBattleUiPatch) return;
  window.__bfBattleUiPatch = true;

  var st = document.createElement('style');
  st.textContent = [
    // ---- 1) Miniaturas del orden de turno: circulares y sin solapar el nombre ----
    '.ctb-slot{min-width:112px!important;padding-left:54px!important}',
    '.bf-ctb-thumb{left:6px!important;top:50%!important;bottom:auto!important;transform:translateY(-50%)!important;width:38px!important;height:38px!important;border-radius:50%!important;overflow:hidden!important;border:1.5px solid rgba(255,210,74,.55)!important;background-color:#0a0710!important;background-size:cover!important}',
    '.bf-ctb-thumb::before{content:"";position:absolute;inset:-26%;background-image:inherit;background-size:cover;background-position:inherit;background-repeat:no-repeat}',
    // ---- 2) Retrato de héroe en batalla: mismo marco que en equipamiento ----
    '.bhero{padding-left:134px!important}',
    '.bf-battle-art{left:6px!important;top:6px!important;bottom:6px!important;width:116px!important;border-radius:12px!important;overflow:hidden!important;border:1.5px solid rgba(255,210,74,.45)!important;box-shadow:0 5px 12px rgba(0,0,0,.45)!important;opacity:1!important;transform:none!important}',
    '.bf-battle-art::before{content:"";position:absolute;inset:-26%;background-image:inherit;background-size:cover;background-position:inherit;background-repeat:no-repeat}',
    '.bf-battle-art::after{display:none!important}',
    '.bhero.active-turn .bf-battle-art{width:116px!important;transform:none!important;filter:saturate(1.3) contrast(1.14) brightness(1.06)!important;border-color:rgba(255,210,74,.85)!important;box-shadow:0 5px 12px rgba(0,0,0,.45),0 0 16px rgba(255,210,74,.55)!important}'
  ].join('');
  document.head.appendChild(st);

  // ---- 3) 3 vs 3 garantizado: completar con héroes Bizarros al cerrar la subasta ----
  function bfFillBizarros(){
    try{
      if (typeof G === 'undefined' || !G || !G.team) return;
      ['p','o'].forEach(function(side){
        var guard = 0;
        while (((G.team[side] || []).length) < 3 && guard++ < 5) {
          var inTeam = {};
          (G.team[side] || []).forEach(function(h){ if (h) { inTeam[h.id] = true; if (h._token) inTeam[h._token] = true; } });
          var pool = (window.HEROES || []).filter(function(h){
            return h && String(h.id || '').indexOf('tk_') === 0 && !inTeam[h.id];
          });
          if (!pool.length) pool = (window.HEROES || []).filter(function(h){ return h && String(h.id || '').indexOf('tk_') === 0; });
          if (!pool.length) break;
          var tk = pool[Math.floor(Math.random() * pool.length)];
          var inst = (typeof makeInstance === 'function') ? makeInstance(tk) : JSON.parse(JSON.stringify(tk));
          inst.boughtFor = 0; inst._token = tk.id;
          if (!G.team[side]) G.team[side] = [];
          G.team[side].push(inst);
          if (typeof pushLog === 'function') pushLog('lx', '⚠️ Equipo incompleto: '+((G.names && G.names[side]) || side)+' recibe al héroe Bizarro «'+tk.name+'» para jugar 3 vs 3.');
        }
      });
    }catch(e){}
  }

  var tries = 0;
  var iv = setInterval(function(){
    tries++;
    if (typeof window.finishAuction === 'function' && !window.finishAuction.__bf3v3) {
      var orig = window.finishAuction;
      window.finishAuction = function(){ if (typeof NET === 'undefined' || NET.role !== 'client') bfFillBizarros(); return orig.apply(this, arguments); };
      window.finishAuction.__bf3v3 = 1;
      clearInterval(iv);
    }
    if (tries > 120) clearInterval(iv);
  }, 150);
})();
</script>
`;