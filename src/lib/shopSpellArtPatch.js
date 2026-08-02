// Parche inyectado en el iframe: ARTE de la rejilla de la tienda por NOMBRE
// desde la BD (mapa bfArtMap). El arte del MODAL de compra se resuelve como
//   SPELL_ART[indexInList(SPELLS,id)] || NUM_ART[String(numFor(item))]
// así que para el hechizo nuevo "Reanimación Arcana" (inyectado por
// recoverSpellPatch, sin entrada en SPELL_ART) sólo necesitamos asegurar
// NUM_ART con un num ÚNICO que no colisione con ningún nº de carta de la BD,
// y traer su maná/texto desde la BD. NO tocamos los arrays posicionales de las
// cartas nativas (SPELL_ART/OBJECT_ART/MELEE_ART...) para no cruzar arte.
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
    if (e.data.bfArtMap || e.data.bfCardInfo) { setTimeout(function(){ syncRecover(); scan(); }, 0); }
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

  // ---- Hechizo "Reanimación Arcana" (id sp_recover): arte del modal + maná + texto desde la BD ----
  // Usa un num único (999) para NUM_ART → sin colisión con los nºs reales (1..117).
  function syncRecover() {
    if (typeof SPELLS === 'undefined' || !SPELLS) return;
    var sp = null;
    for (var i = 0; i < SPELLS.length; i++) { if (SPELLS[i] && SPELLS[i].id === 'sp_recover') { sp = SPELLS[i]; break; } }
    if (!sp) return;
    var art = ART_BY_NAME[sp.name], info = INFO_BY_NAME[sp.name];
    if (art) {
      sp.num = 999;
      if (typeof NUM_ART !== 'undefined') {
        try { NUM_ART['999'] = art; } catch (e) {}
        // Por si cardNo('sp_recover') devolviera algo, lo cubrimos también.
        try { if (typeof cardNo === 'function') { var cn = cardNo('sp_recover'); if (cn) NUM_ART[String(cn)] = art; } } catch (e) {}
      }
    }
    if (info) {
      if (info.mana != null) sp.mana = info.mana;
      if (info.text) sp.txt = info.text;
    }
  }

  function wrap() {
    if (typeof window.eqShopGrid !== 'function' || window.eqShopGrid.__bfNameArt) return;
    var orig = window.eqShopGrid;
    window.eqShopGrid = function () { var html = orig.apply(this, arguments); setTimeout(function(){ syncRecover(); scan(); }, 0); return html; };
    window.eqShopGrid.__bfNameArt = true;
  }
  wrap();
  setInterval(function () { if (typeof window.eqShopGrid === 'function' && !window.eqShopGrid.__bfNameArt) wrap(); syncRecover(); scan(); }, 600);
  new MutationObserver(function(){ requestAnimationFrame(scan); }).observe(document.documentElement, { childList: true, subtree: true });
})();
</script>
`;