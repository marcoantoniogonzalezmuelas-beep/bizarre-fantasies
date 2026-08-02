// Parche inyectado en el iframe: TIENDA DE EQUIPAMIENTO desde la BD.
// La BD (Oráculo) es la fuente de verdad para el arte, nº, coste, maná, stats
// y texto de TODAS las cartas de equipo (hechizos/objetos/armas/armaduras).
// El padre (Home.jsx) envía dos mapas por nombre:
//   bfArtMap   -> { nombre: art_url }
//   bfCardInfo -> { nombre: { text, mana, category, number, cost, cc, ad, he, hp, power, ability } }
// Para cada .shop-card de la pantalla de equipo:
//   · pone el arte (fill blur + sharp) por nombre,
//   · rellena nombre, nº, maná (hechizos), coste y texto de habilidad legible,
//   · añade una línea de stats (CC/AD/HE/HP/Pot) cuando procede.
// Así añadir una carta nueva en la BD basta para que se vea bien en la tienda,
// sin tocar los arrays posicionales nativos del juego (SPELL_ART etc.).
export const SHOP_SPELL_ART_PATCH = `
<script>
(function(){
  if (window.__bfShopSpellArt) return;
  window.__bfShopSpellArt = true;

  var ART_BY_NAME = {};
  var INFO_BY_NAME = {};
  window.addEventListener('message', function (e) {
    if (!e.data) return;
    if (e.data.bfArtMap)   ART_BY_NAME  = e.data.bfArtMap  || {};
    if (e.data.bfCardInfo) INFO_BY_NAME = e.data.bfCardInfo || {};
    if (e.data.bfArtMap || e.data.bfCardInfo) { setTimeout(function(){ syncRecover(); scan(); }, 0); }
  });
  try { window.parent.postMessage({ bfArtMapRequest: 1 }, '*'); } catch (e) {}

  var css = ''+
  '.shop-card.has-art .bf-shop-name{font-size:12.5px!important;bottom:88px!important;padding:3px 5px!important}'+
  '.shop-card.has-art .bf-shop-txt{font-size:10.5px!important;line-height:1.28!important;max-height:62px!important;bottom:40px!important;padding:6px 7px!important;overflow:hidden!important}'+
  '.shop-card.has-art .bf-shop-mana{top:6px!important;right:6px!important}'+
  '.shop-card.has-art .bf-shop-num{top:42px!important;right:6px!important;left:auto!important;bottom:auto!important;font-size:9px!important}'+
  '.shop-card.has-art .bf-shop-stat{position:absolute;left:6px;top:6px;z-index:6;display:inline-flex;gap:3px;flex-wrap:wrap}'+
  '.bf-shop-stat span{display:inline-flex;align-items:center;gap:2px;font-size:9px;font-weight:900;padding:2px 5px;border-radius:999px;background:rgba(8,5,14,.82);border:1px solid rgba(255,210,74,.32);color:#fff7ea;text-shadow:0 1px 2px #000;line-height:1}'+
  '.bf-shop-stat .bf-s-cc{color:#ff8a85!important}.bf-shop-stat .bf-s-ad{color:#7af09a!important}.bf-shop-stat .bf-s-he{color:#c79bff!important}.bf-shop-stat .bf-s-hp{color:#ffd24a!important}.bf-shop-stat .bf-s-pw{color:#9dff8a!important}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

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
  function nameOf(card) {
    var nm = card.querySelector('.shop-name'); var n = nm ? nm.textContent.trim() : '';
    if (!n) { var fn = card.querySelector('.bf-shop-name'); n = fn ? fn.textContent.trim() : ''; }
    return n;
  }
  function ensureEl(card, cls, html) {
    var el = card.querySelector('.' + cls.replace(/\\//g, ''));
    if (!el) { el = document.createElement('div'); el.className = cls; card.appendChild(el); }
    if (html != null) el.innerHTML = html;
    return el;
  }

  function statLine(info) {
    if (!info) return '';
    var parts = [];
    if (info.cc != null && info.cc !== 0) parts.push('<span class="bf-s-cc">CC +' + info.cc + '</span>');
    if (info.ad != null && info.ad !== 0) parts.push('<span class="bf-s-ad">AD +' + info.ad + '</span>');
    if (info.he != null && info.he !== 0) parts.push('<span class="bf-s-he">HE +' + info.he + '</span>');
    if (info.hp != null && info.hp !== 0) parts.push('<span class="bf-s-hp">HP +' + info.hp + '</span>');
    if (info.power != null && info.power !== 0) parts.push('<span class="bf-s-pw">Pot. ' + info.power + '</span>');
    return parts.join('');
  }

  function fillCard(card, name) {
    var info = INFO_BY_NAME[name]; if (!info) return;
    ensureEl(card, 'bf-shop-name', '');
    var nm = card.querySelector('.bf-shop-name'); if (nm) nm.textContent = name;
    if (info.number != null) ensureEl(card, 'bf-shop-num', 'Nº ' + info.number);
    if (info.category === 'spell' && info.mana != null) ensureEl(card, 'bf-shop-mana', info.mana);
    // El texto de habilidad y los stats no se muestran en la carta de la tienda
    // (no caben / no se leen): se ven al pasar el ratón con el card magnifier.
    var oldTxt = card.querySelector('.bf-shop-txt'); if (oldTxt) oldTxt.remove();
    var oldStat = card.querySelector('.bf-shop-stat'); if (oldStat) oldStat.remove();
  }

  function scan() {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.shop-card').forEach(function (card) {
      var name = nameOf(card); if (!name) return;
      var url = ART_BY_NAME[name]; if (url) setArt(card, url);
      fillCard(card, name);
    });
  }

  // ---- Hechizo "Reanimación Arcana" (id sp_recover): arte del modal + maná + texto desde la BD ----
  function syncRecover() {
    if (typeof SPELLS === 'undefined' || !SPELLS) return;
    var sp = null;
    for (var i = 0; i < SPELLS.length; i++) { if (SPELLS[i] && SPELLS[i].id === 'sp_recover') { sp = SPELLS[i]; break; } }
    if (!sp) return;
    var art = ART_BY_NAME[sp.name], info = INFO_BY_NAME[sp.name];
    // El nº real lo aporta la BD (info.number); el arte se indexa por ese nº.
    if (info && info.number != null) {
      sp.num = info.number;
      if (art && typeof NUM_ART !== 'undefined') { try { NUM_ART[String(info.number)] = art; } catch (e) {} }
    }
    if (info) {
      if (info.mana != null) sp.mana = info.mana;
      if (info.text) sp.txt = info.text;
      if (info.cost != null) sp.cost = info.cost;
    }
  }

  function wrap() {
    if (typeof window.eqShopGrid !== 'function' || window.eqShopGrid.__bfNameArt) return;
    var orig = window.eqShopGrid;
    window.eqShopGrid = function () { var html = orig.apply(this, arguments); setTimeout(function(){ syncRecover(); scan(); }, 0); return html; };
    window.eqShopGrid.__bfNameArt = true;
  }
  wrap();
  setInterval(function () { if (typeof window.eqShopGrid === 'function' && !window.eqShopGrid.__bfNameArt) wrap(); syncRecover(); scan(); }, 500);
  new MutationObserver(function(){ requestAnimationFrame(scan); }).observe(document.documentElement, { childList: true, subtree: true });
})();
</script>
`;