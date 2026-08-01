// Parche inyectado en el iframe: el arte, nombre, texto y maná de las cartas de
// la TIENDA DE EQUIPAMIENTO vienen SIEMPRE de la base de datos (mapas bfArtMap
// y bfCardInfo por nombre que envía la página padre). Olvidamos los arrays
// antiguos: cualquier carta nueva (Transformer, Reanimación Arcana, o las que
// vengan) sólo necesita su art_url + description + mana en la BD para verse
// aquí correctamente, con su nombre, texto y orbe de maná.
export const SHOP_SPELL_ART_PATCH = `
<script>
(function(){
  if (window.__bfShopSpellArt) return;
  window.__bfShopSpellArt = true;

  var ART_BY_NAME = {};
  var INFO_BY_NAME = {};
  window.addEventListener('message', function (e) {
    if (e.data && e.data.bfArtMap) ART_BY_NAME = e.data.bfArtMap || {};
    if (e.data && e.data.bfCardInfo) INFO_BY_NAME = e.data.bfCardInfo || {};
    if (e.data && (e.data.bfArtMap || e.data.bfCardInfo)) setTimeout(scan, 0);
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
    card.querySelectorAll('.shop-card-art, .shop-card-empty, .shop-card-placeholder').forEach(function (el) {
      el.style.display = 'none';
    });
  }

  function ensureName(card, name) {
    if (card.querySelector('.bf-shop-name')) return;
    var nm = document.createElement('div');
    nm.className = 'bf-shop-name';
    nm.textContent = name;
    card.appendChild(nm);
  }

  function ensureText(card, text) {
    if (!text || card.querySelector('.bf-shop-txt')) return;
    var txt = document.createElement('div');
    txt.className = 'bf-shop-txt';
    txt.textContent = text;
    card.appendChild(txt);
  }

  function ensureMana(card, mana) {
    if (mana == null || card.querySelector('.bf-shop-mana')) return;
    var mb = document.createElement('div');
    mb.className = 'bf-shop-mana';
    mb.textContent = String(mana);
    card.appendChild(mb);
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
      var info = INFO_BY_NAME[name];
      if (info) {
        ensureName(card, name);
        if (info.text) ensureText(card, info.text);
        if (info.mana != null) ensureMana(card, info.mana);
      }
    });
  }

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