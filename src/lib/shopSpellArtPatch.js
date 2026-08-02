// Parche inyectado en el iframe: el ARTE, el maná y el texto de las cartas de la
// tienda de equipamiento se resuelven por NOMBRE desde la base de datos (mapas
// bfArtMap y bfCardInfo que envía la página padre). Olvidamos las referencias
// antiguas (SPELL_ART/OBJECT_ART/MELEE_ART/... por índice y SPELL_MANA): cada
// carta nueva (Transformer, Reanimación Arcana, o las que vengan) sólo necesita
// su art_url, mana y texto en la BD para verse en la rejilla Y en el modal de
// compra. El coste en monedas y el botón de comprar los sigue gestionando el
// propio juego — no los tocamos.
export const SHOP_SPELL_ART_PATCH = `
<script>
(function(){
  if (window.__bfShopSpellArt) return;
  window.__bfShopSpellArt = true;

  var ART_BY_NAME = {};
  var INFO_BY_NAME = {};
  window.addEventListener('message', function (e) {
    if (!e.data) return;
    if (e.data.bfArtMap)  ART_BY_NAME  = e.data.bfArtMap  || {};
    if (e.data.bfCardInfo) INFO_BY_NAME = e.data.bfCardInfo || {};
    if (e.data.bfArtMap || e.data.bfCardInfo) { setTimeout(function(){ syncDb(); scan(); }, 0); }
  });
  try { window.parent.postMessage({ bfArtMapRequest: 1 }, '*'); } catch (e) {}

  // ---- Arte en la rejilla (.shop-card) por nombre ----
  function setArt(card, url) {
    if (!card || !url) return;
    var fill = card.querySelector('.shop-card-fill');
    if (!fill) { fill = document.createElement('div'); fill.className = 'shop-card-fill'; card.insertBefore(fill, card.firstChild); }
    fill.style.backgroundImage = 'url("' + url + '")';
    var sharp = card.querySelector('.shop-card-art-sharp');
    if (!sharp) { sharp = document.createElement('div'); sharp.className = 'shop-card-art-sharp'; card.insertBefore(sharp, card.firstChild); }
    sharp.style.backgroundImage = 'url("' + url + '")';
    card.classList.add('has-art');
  }
  function nameOf(card) { var nm = card.querySelector('.shop-name'); return nm ? nm.textContent.trim() : ''; }
  function scan() {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.shop-card').forEach(function (card) {
      var name = nameOf(card); if (!name) return;
      var url = ART_BY_NAME[name]; if (url) setArt(card, url);
    });
  }

  // ---- Sincroniza arte (arrays posicionales + NUM_ART), maná y texto desde la BD ----
  // El modal de compra (bfConfirm) resuelve el arte como
  //   SPELL_ART[idx] || NUM_ART[num]   (hechizos)
  //   OBJECT_ART[idx] || NUM_ART[num]   (objetos)
  //   artFor(kind, idx) = MELEE/RANGED/ARMOR_ART[idx]   (armas/armaduras)
  // y el maná vía bfManaFor(item) → item.mana. Sobreescribimos estos arrays y
  // el campo mana/txt de cada entrada con los valores de la BD, por nombre, así
  // el modal muestra siempre el arte, maná y texto reales de la carta.
  function syncDb() {
    function upd(list, artArr) {
      if (!list) return;
      for (var i = 0; i < list.length; i++) {
        var it = list[i]; if (!it || !it.name) continue;
        var url = ART_BY_NAME[it.name], info = INFO_BY_NAME[it.name];
        if (url) {
          if (artArr) { try { artArr[i] = url; } catch (e) {} }
          var n = String(it.num || 0);
          if (n !== '0' && typeof NUM_ART !== 'undefined') { try { NUM_ART[n] = url; } catch (e) {} }
        }
        if (info) {
          if (info.mana != null) it.mana = info.mana;
          if (info.text) it.txt = info.text;
        }
      }
    }
    try { upd(typeof SPELLS !== 'undefined' ? SPELLS : null, typeof SPELL_ART !== 'undefined' ? SPELL_ART : null); } catch (e) {}
    try { upd(typeof OBJECTS !== 'undefined' ? OBJECTS : null, typeof OBJECT_ART !== 'undefined' ? OBJECT_ART : null); } catch (e) {}
    try { upd(typeof MELEE !== 'undefined' ? MELEE : null, typeof MELEE_ART !== 'undefined' ? MELEE_ART : null); } catch (e) {}
    try { upd(typeof RANGED !== 'undefined' ? RANGED : null, typeof RANGED_ART !== 'undefined' ? RANGED_ART : null); } catch (e) {}
    try { upd(typeof ARMORS !== 'undefined' ? ARMORS : null, typeof ARMOR_ART !== 'undefined' ? ARMOR_ART : null); } catch (e) {}
  }

  function wrap() {
    if (typeof window.eqShopGrid !== 'function' || window.eqShopGrid.__bfNameArt) return;
    var orig = window.eqShopGrid;
    window.eqShopGrid = function () { var html = orig.apply(this, arguments); setTimeout(function(){ syncDb(); scan(); }, 0); return html; };
    window.eqShopGrid.__bfNameArt = true;
  }
  wrap();
  setInterval(function () { if (typeof window.eqShopGrid === 'function' && !window.eqShopGrid.__bfNameArt) wrap(); syncDb(); scan(); }, 600);
  new MutationObserver(function(){ requestAnimationFrame(scan); }).observe(document.documentElement, { childList: true, subtree: true });
})();
</script>
`;