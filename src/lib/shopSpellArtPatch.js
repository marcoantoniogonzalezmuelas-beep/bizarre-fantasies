// Parche inyectado en el iframe: resuelve el arte de las cartas de la TIENDA
// DE EQUIPAMIENTO por NOMBRE desde la base de datos (mapa bfArtMap que envía la
// página padre). entry.ts ya rellena el arte por número/posición, pero los
// hechizos inyectados cuyo id no conoce cardNo (p.ej. Reanimación Arcana) se
// renderizan con "Nº 000" y sin fill, así que nunca reciben su imagen. Este
// parche añade el fill a cualquier .shop-card que se quede sin arte, buscándolo
// por el nombre que muestra la carta.
export const SHOP_SPELL_ART_PATCH = `
<script>
(function(){
  if (window.__bfShopSpellArt) return;
  window.__bfShopSpellArt = true;

  var ART_BY_NAME = {};
  window.addEventListener('message', function (e) {
    if (e.data && e.data.bfArtMap) ART_BY_NAME = e.data.bfArtMap || {};
  });
  try { window.parent.postMessage({ bfArtMapRequest: 1 }, '*'); } catch (e) {}

  function fillCard(card) {
    if (!card || card.dataset.bfNameArt === '1') return;
    if (card.querySelector('.shop-card-fill')) { card.dataset.bfNameArt = '1'; return; }
    var nm = card.querySelector('.shop-name') || card.querySelector('.bf-shop-name');
    if (!nm) return;
    var name = nm.textContent.trim();
    var url = ART_BY_NAME[name];
    if (!url) return;
    var fill = document.createElement('div');
    fill.className = 'shop-card-fill';
    fill.style.backgroundImage = 'url("' + url + '")';
    card.insertBefore(fill, card.firstChild);
    var sharp = document.createElement('div');
    sharp.className = 'shop-card-art-sharp';
    sharp.style.backgroundImage = 'url("' + url + '")';
    card.insertBefore(sharp, card.firstChild);
    card.classList.add('has-art');
    card.dataset.bfShopArt = '1';
    card.dataset.bfNameArt = '1';
  }

  function scan() {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.shop-card').forEach(fillCard);
  }

  // Re-escanea cada vez que se renderiza la tienda de equipamiento.
  function wrap() {
    if (typeof window.eqShopGrid !== 'function' || window.eqShopGrid.__bfNameArt) return;
    var orig = window.eqShopGrid;
    window.eqShopGrid = function () {
      var html = orig.apply(this, arguments);
      // El HTML devuelto todavía no está en el DOM; escaneamos tras inyectar.
      setTimeout(scan, 0);
      return html;
    };
    window.eqShopGrid.__bfNameArt = true;
  }
  wrap();
  setInterval(function () { wrap(); scan(); }, 500);
  // Re-escanea al hacer clic en las pestañas de la tienda (Hechizos/Armas/...),
  // que cambian el contenido del grid sin pasar por eqShopGrid.
  document.addEventListener('click', function () { setTimeout(scan, 120); }, true);
  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
})();
</script>
`;