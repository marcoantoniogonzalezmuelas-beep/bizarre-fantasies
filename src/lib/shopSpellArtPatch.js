// Parche inyectado en el iframe: el arte de las cartas de la TIENDA DE
// EQUIPAMIENTO viene SIEMPRE de la base de datos (mapa bfArtMap por nombre que
// envía la página padre). Olvidamos los arrays antiguos de arte posicional:
// cualquier carta nueva (Transformer, Reanimación Arcana, o las que vengan)
// sólo necesita su art_url en la BD y su nombre para verse aquí correctamente.
// Sobrescribimos el fill de cada .shop-card cuyo nombre esté en el mapa.
export const SHOP_SPELL_ART_PATCH = `
<script>
(function(){
  if (window.__bfShopSpellArt) return;
  window.__bfShopSpellArt = true;

  var ART_BY_NAME = {};
  window.addEventListener('message', function (e) {
    if (e.data && e.data.bfArtMap) {
      ART_BY_NAME = e.data.bfArtMap || {};
      setTimeout(scan, 0);
    }
  });
  try { window.parent.postMessage({ bfArtMapRequest: 1 }, '*'); } catch (e) {}

  function setArt(card, url) {
    if (!card || !url) return;
    var fill = card.querySelector('.shop-card-fill');
    if (!fill) {
      fill = document.createElement('div');
      fill.className = 'shop-card-fill';
      card.insertBefore(fill, card.firstChild);
    }
    fill.style.backgroundImage = 'url("' + url + '")';
    var sharp = card.querySelector('.shop-card-art-sharp');
    if (!sharp) {
      sharp = document.createElement('div');
      sharp.className = 'shop-card-art-sharp';
      card.insertBefore(sharp, card.firstChild);
    }
    sharp.style.backgroundImage = 'url("' + url + '")';
    card.classList.add('has-art');
    // Oculta cualquier marcador de "sin arte" (interrogante / texto) que el
    // juego base pudiera mostrar encima del fill.
    card.querySelectorAll('.shop-card-art, .shop-card-empty, .shop-card-placeholder').forEach(function (el) {
      el.style.display = 'none';
    });
  }

  function nameOf(card) {
    var nm = card.querySelector('.shop-name') || card.querySelector('.bf-shop-name');
    return nm ? nm.textContent.trim() : '';
  }

  function scan() {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.shop-card').forEach(function (card) {
      var name = nameOf(card);
      if (!name) return;
      var url = ART_BY_NAME[name];
      if (url) setArt(card, url);
    });
  }

  // Re-escanea cada vez que se renderiza la tienda de equipamiento.
  function wrap() {
    if (typeof window.eqShopGrid !== 'function' || window.eqShopGrid.__bfNameArt) return;
    var orig = window.eqShopGrid;
    window.eqShopGrid = function () {
      var html = orig.apply(this, arguments);
      setTimeout(scan, 0);
      return html;
    };
    window.eqShopGrid.__bfNameArt = true;
  }
  wrap();
  setInterval(function () { wrap(); scan(); }, 400);
  document.addEventListener('click', function () { setTimeout(scan, 120); }, true);
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
</script>
`;