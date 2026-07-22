// Parche inyectado en el iframe: en la PORTADA, el Punkito guía arranca
// recogido (solo el botón circular) y a su lado aparece un rótulo animado
// "¡AYUDA!" con un dedo que apunta al botón y un halo pulsante alrededor.
// El indicador desaparece en cuanto el jugador abre la guía o sale de la
// portada, y no vuelve a salir en esa sesión.
export const GUIDE_HELP_BADGE_PATCH = `
<script>
(function(){
  if (window.__bfGuideHelpBadge) return;
  window.__bfGuideHelpBadge = true;

  var st = document.createElement('style');
  st.textContent = [
    '#bf-help-badge{position:fixed;z-index:99997;display:none;align-items:center;gap:9px;cursor:pointer;font-family:Rubik,system-ui,sans-serif;animation:bfHelpFloat 2.2s ease-in-out infinite}',
    '@keyframes bfHelpFloat{0%,100%{margin-top:0}50%{margin-top:-6px}}',
    '#bf-help-badge .bf-help-finger{font-size:32px;line-height:1;filter:drop-shadow(0 3px 6px rgba(0,0,0,.6));animation:bfHelpPoke .75s ease-in-out infinite}',
    '@keyframes bfHelpPoke{0%,100%{transform:translateX(0) rotate(0)}50%{transform:translateX(-11px) rotate(-6deg)}}',
    '#bf-help-badge.bf-help-flip .bf-help-finger{animation:bfHelpPokeR .75s ease-in-out infinite}',
    '@keyframes bfHelpPokeR{0%,100%{transform:translateX(0) rotate(0)}50%{transform:translateX(11px) rotate(6deg)}}',
    '#bf-help-badge .bf-help-pill{background:linear-gradient(180deg,#33205c,#150d2a);border:2px solid #ffd24a;border-radius:999px;padding:8px 16px;color:#ffe9a8;font-weight:900;font-size:15px;letter-spacing:1px;white-space:nowrap;animation:bfHelpPulse 1.5s ease-in-out infinite}',
    '@keyframes bfHelpPulse{0%,100%{box-shadow:0 6px 16px rgba(0,0,0,.55),0 0 12px rgba(255,210,74,.35)}50%{box-shadow:0 6px 16px rgba(0,0,0,.55),0 0 28px rgba(255,210,74,.9)}}',
    '#bf-help-halo{position:fixed;z-index:99996;border-radius:50%;border:3px solid rgba(255,210,74,.9);pointer-events:none;display:none;animation:bfHelpHalo 1.3s ease-out infinite}',
    '@keyframes bfHelpHalo{0%{transform:scale(.85);opacity:.95}100%{transform:scale(1.8);opacity:0}}'
  ].join('');
  document.head.appendChild(st);

  var badge = document.createElement('div');
  badge.id = 'bf-help-badge';
  badge.innerHTML = '<span class="bf-help-finger">👈</span><span class="bf-help-pill">¡AYUDA!</span>';
  var halo = document.createElement('div');
  halo.id = 'bf-help-halo';
  document.body.appendChild(badge);
  document.body.appendChild(halo);

  function dismiss(){ window.__bfHelpDone = true; badge.style.display = 'none'; halo.style.display = 'none'; }

  badge.onclick = function(e){
    e.preventDefault(); e.stopPropagation();
    var show = document.getElementById('bf-guide-show');
    dismiss();
    if (show) show.click();
  };

  // Si el jugador abre la guía tocando directamente el botón, también se retira.
  document.addEventListener('click', function(e){
    if (e.target && e.target.closest && e.target.closest('#bf-guide-show')) dismiss();
  }, true);

  function visibleEl(el){
    if (!el) return false;
    var cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return false;
    return el.offsetWidth > 0 || el.offsetHeight > 0;
  }

  function tick(){
    var wrap = document.getElementById('bf-guide');
    var show = document.getElementById('bf-guide-show');
    var active = document.querySelector('.screen.active');
    var onTitle = !active || active.id === 's-title';

    // Al inicio (portada): recoger el Punkito guía una sola vez.
    if (!window.__bfHelpCollapsed && wrap && show && onTitle) {
      window.__bfHelpCollapsed = true;
      window.__bfGuideHidden = true;
      wrap.style.display = 'none';
      show.classList.add('bf-guide-visible');
    }

    var on = !window.__bfHelpDone && window.__bfHelpCollapsed && onTitle && window.__bfGuideHidden && visibleEl(show);
    if (!on) { badge.style.display = 'none'; halo.style.display = 'none'; return; }

    var r = show.getBoundingClientRect();
    // Halo pulsante alrededor del botón de Punkito.
    halo.style.display = 'block';
    halo.style.left = (r.left - 6) + 'px';
    halo.style.top = (r.top - 6) + 'px';
    halo.style.width = (r.width + 12) + 'px';
    halo.style.height = (r.height + 12) + 'px';
    // Rótulo: a la derecha del botón si hay sitio (dedo 👈 apuntándole);
    // si no, a la izquierda con el dedo 👉.
    badge.style.display = 'flex';
    var bw = badge.offsetWidth || 170, bh = badge.offsetHeight || 48;
    var y = Math.max(6, Math.min(window.innerHeight - bh - 6, r.top + r.height/2 - bh/2));
    if (r.right + bw + 26 < window.innerWidth) {
      badge.classList.remove('bf-help-flip');
      badge.querySelector('.bf-help-finger').textContent = '👈';
      badge.style.left = (r.right + 16) + 'px';
      badge.firstChild === badge.querySelector('.bf-help-finger') || badge.insertBefore(badge.querySelector('.bf-help-finger'), badge.firstChild);
    } else {
      badge.classList.add('bf-help-flip');
      badge.querySelector('.bf-help-finger').textContent = '👉';
      badge.appendChild(badge.querySelector('.bf-help-finger'));
      badge.style.left = (r.left - bw - 16) + 'px';
    }
    badge.style.top = y + 'px';
  }

  setInterval(tick, 250);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  else tick();
})();
</script>
`;