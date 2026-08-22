// Lupa en el retrato de los héroes durante la BATALLA: cada recuadro de héroe
// (.bhero) lleva un botón 🔍 arriba-izquierda que abre la ilustración a pantalla
// completa (overlay montado en el body para que quede centrado y nítido aunque
// el tablero esté escalado por el pellizco). El estilo del botón ya está
// definido en battlePortraitPatch (.bf-battle-zoom).
export const BATTLE_ZOOM_PATCH = `
<script>
(function(){
  if(window.__bfBattleZoom) return;
  window.__bfBattleZoom = true;

  var st = document.createElement('style');
  st.textContent = ''+
    '.bf-battle-zoom{display:flex;align-items:center;justify-content:center;border-radius:50%;cursor:pointer;user-select:none}'+
    '.bf-zoom-ov{position:fixed;inset:0;z-index:100600;display:flex;align-items:center;justify-content:center;background:rgba(4,2,8,.9);backdrop-filter:blur(6px)}'+
    '.bf-zoom-ov img{max-width:88vw;max-height:86vh;border-radius:16px;border:2px solid rgba(255,210,74,.75);box-shadow:0 20px 60px rgba(0,0,0,.85),0 0 34px rgba(255,210,74,.35)}'+
    '.bf-zoom-ov .bf-zoom-x{position:absolute;top:14px;right:16px;width:42px;height:42px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:900;color:#ffe49a;background:rgba(8,5,14,.9);border:2px solid rgba(255,210,74,.7);cursor:pointer}';
  document.head.appendChild(st);

  function urlOf(el){
    var b = el && el.style && el.style.backgroundImage;
    var m = b && b.match(/url\\(["']?([^"')]+)["']?\\)/);
    return m ? m[1] : '';
  }

  function open(url){
    if(!url) return;
    var ov = document.createElement('div');
    ov.className = 'bf-zoom-ov';
    ov.innerHTML = '<div class="bf-zoom-x">✕</div><img src="'+url+'" alt="">';
    ov.addEventListener('click', function(){ if(ov.parentNode) ov.parentNode.removeChild(ov); });
    document.body.appendChild(ov);
  }

  function decorate(){
    var scr = document.getElementById('s-battle');
    if(!scr || !scr.classList.contains('active')) return;
    scr.querySelectorAll('.bhero[id^="b_"]').forEach(function(card){
      if(card.querySelector('.bf-battle-zoom')) return;
      var btn = document.createElement('div');
      btn.className = 'bf-battle-zoom';
      btn.textContent = '🔍';
      btn.title = 'Ver la carta';
      btn.addEventListener('click', function(e){
        e.stopPropagation(); e.preventDefault();
        // Igual que en la fase de equipamiento: se abre la CARTA completa
        // (con stats, habilidad y giro Normal/Élite). Si por lo que sea no
        // está disponible, se muestra la ilustración como respaldo.
        // id formato b_p_<id> / b_o_<id>: antes se recortaba mal (slice(2)
        // dejaba "p_<id>") y la carta nunca se encontraba → la lupa no abría.
        var m = String(card.id || '').match(/^b_([po])_(.+)$/);
        var side = m ? m[1] : '', id = m ? m[2] : '', h = null;
        try{
          h = (G.team[side] || []).find(function(x){ return x && x.id === id; }) || null;
        }catch(e2){}
        if(typeof window.bfZoomCard === 'function'){
          window.bfZoomCard(id, (h && h.eliteMode) ? 'elite' : 'normal', side);
          return;
        }
        if(typeof window.zoomCard === 'function'){ window.zoomCard(id); return; }
        open(urlOf(card.querySelector('.bf-battle-art')));
      });
      card.appendChild(btn);
    });
  }

  setInterval(decorate, 500);
  decorate();
})();
</script>
`;