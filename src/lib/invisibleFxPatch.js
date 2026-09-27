// Parche inyectado en el iframe: efecto visual de INVISIBILIDAD en el retrato
// del héroe (Monkgeta élite y el objeto "El Anillo"). El retrato se vuelve
// translúcido y fantasmal, con un velo de ondas que se desliza suavemente y un
// halo del color de la fuente (violeta = Monkgeta, dorado = El Anillo). Solo se
// animan transform/opacity para no provocar parpadeos en móvil/tablet.
export const INVISIBLE_FX_PATCH = `
<script>
(function(){
  if(window.__bfInvisibleFx) return;
  window.__bfInvisibleFx = true;

  var css =
    '#s-battle .bhero.bf-invis{--bf-ic:#c05bff;box-shadow:0 0 0 2px var(--bf-ic),0 0 18px var(--bf-ic)!important}' +
    '#s-battle .bhero.bf-invis.bf-invis-ring{--bf-ic:#ffd24a}' +
    '#s-battle .bhero.bf-invis .bf-bscene-portrait,#s-battle .bhero.bf-invis .bf-battle-art{opacity:.28!important;transition:opacity .5s ease}' +
    '#s-battle .bhero .bf-invis-veil{position:absolute!important;inset:0;z-index:2!important;pointer-events:none;overflow:hidden;border-radius:inherit;background:radial-gradient(circle at 30% 45%,rgba(200,220,255,.10),rgba(10,6,22,.55) 75%)}' +
    '#s-battle .bhero .bf-invis-veil::before{content:"";position:absolute;top:0;bottom:0;left:-60%;width:60%;background:linear-gradient(100deg,transparent,rgba(230,240,255,.22) 45%,rgba(255,255,255,.35) 50%,rgba(230,240,255,.22) 55%,transparent);animation:bfInvSweep 3.2s ease-in-out infinite}' +
    '#s-battle .bhero .bf-invis-veil::after{content:"";position:absolute;inset:-20%;background:repeating-linear-gradient(0deg,transparent 0 9px,rgba(200,220,255,.07) 9px 11px);animation:bfInvWave 5s linear infinite}' +
    '#s-battle .bhero .bf-invis-veil i{position:absolute;width:5px;height:5px;border-radius:50%;background:var(--bf-ic);box-shadow:0 0 8px var(--bf-ic);opacity:0;animation:bfInvMote 2.8s ease-in-out infinite}' +
    '@keyframes bfInvSweep{0%{transform:translateX(0)}60%,100%{transform:translateX(270%)}}' +
    '@keyframes bfInvWave{from{transform:translateY(0)}to{transform:translateY(22px)}}' +
    '@keyframes bfInvMote{0%{opacity:0;transform:translateY(8px) scale(.5)}40%{opacity:.9}100%{opacity:0;transform:translateY(-34px) scale(1)}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var MOTES = '<i style="left:18%;top:62%;animation-delay:0s"></i><i style="left:42%;top:74%;animation-delay:.9s"></i><i style="left:66%;top:58%;animation-delay:1.7s"></i><i style="left:30%;top:40%;animation-delay:2.3s"></i>';

  function heroFor(card){
    var parts = String(card.id || '').split('_');
    if(parts.length < 3 || typeof getHero !== 'function') return null;
    try{ return getHero(parts[1], parts.slice(2).join('_')); }catch(e){ return null; }
  }

  function scan(){
    var scr = document.getElementById('s-battle');
    if(!scr || !scr.classList.contains('active')) return;
    scr.querySelectorAll('.bhero').forEach(function(card){
      var h = heroFor(card);
      var on = !!(h && h.alive && h._bfInvisible);
      card.classList.toggle('bf-invis', on);
      card.classList.toggle('bf-invis-ring', on && h._bfInvisSrc === 'ring');
      var veil = card.querySelector(':scope > .bf-invis-veil');
      if(on && !veil){ veil = document.createElement('div'); veil.className = 'bf-invis-veil'; veil.innerHTML = MOTES; card.appendChild(veil); }
      else if(!on && veil) veil.remove();
    });
  }
  setInterval(scan, 300);
})();
</script>
`;