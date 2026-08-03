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
    if (e.data.bfArtMap || e.data.bfCardInfo) { setTimeout(function(){ syncAllEquip(); scan(); rerenderShop(); }, 0); }
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

  function mySide(){ try{ if(typeof NET!=='undefined'&&NET.role==='client'&&NET.mySide) return NET.mySide; }catch(e){} return 'p'; }
  // ---- Fallback genérico: aplica arte a chips de la mano por NOMBRE ----
  // Si injectHandArt() no pinta una carta (p.ej. hechizos inyectados
  // dinámicamente), este fallback aplica el arte directamente sobre el chip
  // buscando el nombre en ART_BY_NAME. Funciona para CUALQUIER carta de la BD
  // — sin necesitar un parche dedicado por carta.
  // SOLO se aplica a la mano del jugador (mySide): la del rival se muestra
  // boca abajo con el reverso del pollito (rivalHandBackPatch).
  function applyArtToChips() {
    if (!ART_BY_NAME) return;
    var names = Object.keys(ART_BY_NAME);
    if (!names.length) return;
    var side = mySide();
    var rivalSide = side === 'p' ? 'o' : 'p';
    var hand = document.getElementById('hand_' + side);
    if (hand) {
      hand.querySelectorAll('.chip').forEach(function (chip) {
        if (chip.dataset.bfArtDone === '1') return;
        // Saltar si el juego ya pintó el arte (injectHandArt pone background-image inline)
        var bg = chip.style.backgroundImage;
        if (bg && bg !== 'none' && bg.indexOf('url') === 0) { chip.dataset.bfArtDone = '1'; return; }
        // Matching por SUBSTRING: los chips contienen texto extra (maná, nº…)
        var txt = (chip.textContent || '').trim();
        var title = chip.title || '';
        var matched = null;
        for (var n = 0; n < names.length; n++) {
          if (txt.indexOf(names[n]) >= 0 || title.indexOf(names[n]) >= 0) { matched = names[n]; break; }
        }
        if (!matched) return;
        var art = ART_BY_NAME[matched];
        chip.classList.add('bf-chip-card');
        chip.style.setProperty('background-image', 'url("' + art + '")', 'important');
        chip.style.setProperty('background-size', 'cover', 'important');
        chip.style.setProperty('background-position', 'center', 'important');
        chip.style.setProperty('background-color', '#120a1e', 'important');
        chip.dataset.bfArtDone = '1';
      });
    }
    // Limpia cualquier arte inline que injectHandArt u otra función haya puesto
    // en la mano del rival — el reverso del pollito lo pinta rivalHandBackPatch.
    var rivalHand = document.getElementById('hand_' + rivalSide);
    if (rivalHand) {
      rivalHand.querySelectorAll('.chip').forEach(function (chip) {
        chip.style.removeProperty('background-image');
        chip.style.removeProperty('background-size');
        chip.style.removeProperty('background-position');
        chip.style.removeProperty('background-color');
      });
    }
  }

  // ---- Sincronización genérica: el juego siempre busca arte por nº de BD ----
  // El juego usa tres vías para buscar el arte de equipo:
  //   · injectEquipArt(): NUM_ART[cardNo(id)]  — cardNo devuelve el nº secuencial
  //   · bfConfirm modal:  SPELL_ART[idx] || NUM_ART[numFor(item)]  — idx/sequential
  //   · handArtByName():  SPELL_ART[idx] || NUM_ART[s.num]  — s.num = nº de BD
  //
  // NUM_ART se rellena desde la BD por nº de carta (buildArtScript + Home.jsx).
  // El problema es que cardNo() asigna nº SECUENCIALES (1,2,3…) que no siempre
  // coinciden con el nº de BD — sobre todo en cartas añadidas dinámicamente
  // (p.ej. sp_recover).  En lugar de registrar el arte en varias claves, basta
  // con asegurar que cardNo(id) devuelva siempre el nº de BD real de cada carta:
  // así las tres vías convergen en NUM_ART[nº_BD] y cualquier carta nueva de la
  // BD funciona sin casos especiales ni parches por carta.
  function syncAllEquip() {
    if (typeof SPELLS === 'undefined' || !SPELLS) return;
    var changed = false;
    var arrs = [SPELLS, (typeof OBJECTS !== 'undefined') ? OBJECTS : []];
    for (var a = 0; a < arrs.length; a++) {
      var arr = arrs[a]; if (!arr) continue;
      for (var i = 0; i < arr.length; i++) {
        var item = arr[i]; if (!item || !item.name) continue;
        var info = INFO_BY_NAME[item.name]; if (!info || info.number == null || info.number === 0) continue;
        // 1) Asegura que item.num = nº de BD (lo usa handArtByName)
        if (item.num !== info.number) { item.num = info.number; changed = true; }
        // 2) Asegura que CARD_NO[id] = nº de BD padded (lo usa cardNo → injectEquipArt, numFor, bfConfirm)
        if (item.id && typeof CARD_NO !== 'undefined') {
          var padded = String(info.number).padStart(3, '0');
          if (CARD_NO[item.id] !== padded) { CARD_NO[item.id] = padded; changed = true; }
        }
        // 3) Si el juego no tiene el arte en NUM_ART (carta nueva dinámica), lo registra por nº de BD
        var art = ART_BY_NAME[item.name];
        if (art && typeof NUM_ART !== 'undefined' && !NUM_ART[String(info.number)]) {
          try { NUM_ART[String(info.number)] = art; changed = true; } catch (e) {}
        }
        // 4) SPELL_ART[idx] — la PRIMERA vía de lookup de injectHandArt para
        //    hechizos. Sin esto, los hechizos inyectados dinámicamente no
        //    muestran arte en la mano (el fallback NUM_ART[s.num] puede fallar
        //    si s.num aún es 0 o si el índice no coincide).
        if (a === 0 && art && typeof SPELL_ART !== 'undefined') {
          if (SPELL_ART[i] !== art) { try { SPELL_ART[i] = art; changed = true; } catch (e) {} }
        }
      }
    }
    // Propaga mana/texto/coste desde la BD (para hechizos inyectados dinámicamente)
    if (typeof SPELLS !== 'undefined') {
      for (var s = 0; s < SPELLS.length; s++) {
        var sp = SPELLS[s]; if (!sp || !sp.name) continue;
        var si = INFO_BY_NAME[sp.name]; if (!si) continue;
        if (si.mana != null) sp.mana = si.mana;
        if (si.text) sp.txt = si.text;
        if (si.cost != null) sp.cost = si.cost;
      }
    }
    if (changed) {
      try { if (typeof window.__bfHandArtByName !== 'undefined') window.__bfHandArtByName = null; } catch (e) {}
      if (typeof window.injectHandArt === 'function') { try { window.injectHandArt(); } catch (e) {} }
      applyArtToChips();
    }
  }

  // Re-renderiza la tienda de equipo tras sincronizar, para que el botón
  // "Comprar" y el arte aparezcan aunque la tienda ya se hubiera renderizado
  // antes de llegar los datos de la BD (Oráculo).
  function rerenderShop(){ if (typeof window.renderEquip === 'function' && typeof G !== 'undefined' && G && G.eqSide) { try { window.renderEquip(G.eqSide); } catch (e) {} } }
  function wrap() {
    if (typeof window.eqShopGrid !== 'function' || window.eqShopGrid.__bfNameArt) return;
    var orig = window.eqShopGrid;
    window.eqShopGrid = function () { try { syncAllEquip(); } catch(e){} var html = orig.apply(this, arguments); setTimeout(function(){ syncAllEquip(); scan(); }, 0); return html; };
    window.eqShopGrid.__bfNameArt = true;
  }
  // Hook renderBattle: tras cada repintado de batalla, re-aplica el arte a los
  // chips de la mano inmediatamente (sin esperar al MutationObserver de 500ms).
  // Es vital para que los hechizos inyectados dinámicamente (como sp_recover)
  // muestren su arte en la mano durante la batalla, no el placeholder "F###".
  function hookRender() {
    if (typeof window.renderBattle !== 'function' || window.renderBattle.__bfShopArt) return;
    var orig = window.renderBattle;
    window.renderBattle = function() {
      var r = orig.apply(this, arguments);
      setTimeout(function() {
        try { if (typeof window.injectHandArt === 'function') window.injectHandArt(); } catch(e) {}
        applyArtToChips();
      }, 30);
      return r;
    };
    window.renderBattle.__bfShopArt = 1;
  }
  wrap();
  hookRender();
  setInterval(function () { if (typeof window.eqShopGrid === 'function' && !window.eqShopGrid.__bfNameArt) wrap(); if (typeof window.renderBattle === 'function' && !window.renderBattle.__bfShopArt) hookRender(); syncAllEquip(); scan(); }, 1000);
  var _bfSt=0;
  new MutationObserver(function(){ var n=Date.now(); if(n-_bfSt<500)return; _bfSt=n; requestAnimationFrame(scan); applyArtToChips(); }).observe(document.documentElement, { childList: true, subtree: true });
})();
</script>
`;