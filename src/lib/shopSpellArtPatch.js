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
    if (e.data.bfArtMap || e.data.bfCardInfo) { setTimeout(function(){ syncRecover(); scan(); rerenderShop(); }, 0); }
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
  // El juego busca el arte de tres formas distintas y todas fallan para
  // sp_recover porque su nº secuencial (cardNo) no coincide con su nº de BD:
  //   · injectEquipArt(): NUM_ART[cardNo('sp_recover')] → nº secuencial "060"
  //   · bfConfirm modal:  SPELL_ART[idx] || NUM_ART[numFor(item)] → idx 14 / "060"
  //   · handArtByName():  SPELL_ART[idx] || NUM_ART[s.num||0] → idx 14 / "0" o "117"
  // syncRecover registra el arte en TODAS las claves que usa el juego y
  // invalida el caché de handArtByName para que la mano pinte el arte.
  function syncRecover() {
    if (typeof SPELLS === 'undefined' || !SPELLS) return;
    var sp = null, spIdx = -1;
    for (var i = 0; i < SPELLS.length; i++) { if (SPELLS[i] && SPELLS[i].id === 'sp_recover') { sp = SPELLS[i]; spIdx = i; break; } }
    if (!sp) return;
    var art = ART_BY_NAME[sp.name], info = INFO_BY_NAME[sp.name];
    var dbNum = (info && info.number != null) ? info.number : sp.num;
    if (dbNum != null && dbNum !== 0) sp.num = dbNum;
    // 1) NUM_ART por nº de BD (lo usa handArtByName con s.num)
    if (art && typeof NUM_ART !== 'undefined' && dbNum != null && dbNum !== 0) {
      try { NUM_ART[String(dbNum)] = art; } catch (e) {}
    }
    // 2) NUM_ART por nº secuencial cardNo (lo usa injectEquipArt y numFor).
    //    También actualiza CARD_NO para que cardNo('sp_recover') devuelva el
    //    nº real de la BD en vez de "000" (CARD_NO se cachea al primer uso y
    //    no se reconstruye cuando se añade sp_recover a SPELLS después).
    if (typeof cardNo === 'function') {
      try {
        if (dbNum != null && dbNum !== 0 && typeof CARD_NO !== 'undefined') {
          CARD_NO['sp_recover'] = String(dbNum).padStart(3, '0');
        }
        if (art && typeof NUM_ART !== 'undefined') {
          var seq = cardNo('sp_recover'); if (seq) NUM_ART[String(seq)] = art;
        }
      } catch (e) {}
    }
    // 3) SPELL_ART por índice en SPELLS (lo usa bfConfirm y handArtByName)
    if (art && spIdx >= 0 && typeof SPELL_ART !== 'undefined') {
      try { SPELL_ART[spIdx] = art; } catch (e) {}
    }
    if (info) {
      if (info.mana != null) sp.mana = info.mana;
      if (info.text) sp.txt = info.text;
      if (info.cost != null) sp.cost = info.cost;
    }
    // 4) Invalida el caché de handArtByName para que la mano repinte el arte
    try { if (typeof window.__bfHandArtByName !== 'undefined') window.__bfHandArtByName = null; } catch (e) {}
    if (typeof window.injectHandArt === 'function') { try { window.injectHandArt(); } catch (e) {} }
  }

  // Re-renderiza la tienda de equipo tras sincronizar el hechizo de la BD, para
  // que el botón "Comprar" y el arte del modal aparezcan aunque la tienda ya
  // se hubiera renderizado antes de llegar los datos de la BD (Oráculo).
  function rerenderShop(){ if (typeof window.renderEquip === 'function' && typeof G !== 'undefined' && G && G.eqSide) { try { window.renderEquip(G.eqSide); } catch (e) {} } }
  function wrap() {
    if (typeof window.eqShopGrid !== 'function' || window.eqShopGrid.__bfNameArt) return;
    var orig = window.eqShopGrid;
    window.eqShopGrid = function () { try { syncRecover(); } catch(e){} var html = orig.apply(this, arguments); setTimeout(function(){ syncRecover(); scan(); }, 0); return html; };
    window.eqShopGrid.__bfNameArt = true;
  }
  wrap();
  setInterval(function () { if (typeof window.eqShopGrid === 'function' && !window.eqShopGrid.__bfNameArt) wrap(); syncRecover(); scan(); }, 500);
  new MutationObserver(function(){ requestAnimationFrame(scan); }).observe(document.documentElement, { childList: true, subtree: true });
})();
</script>
`;