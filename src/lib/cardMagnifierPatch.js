// Parche inyectado en el iframe: lupa automática al pasar el ratón por las
// cartas de la mano (hechizos/objetos). Muestra una vista ampliada de la carta
// junto al cursor. Solo en dispositivos con puntero (hover); en táctil no aplica.
export const CARD_MAGNIFIER_PATCH = `
<script>
(function(){
  if (window.__bfCardMagnifier) return;
  window.__bfCardMagnifier = true;
  if (window.matchMedia && window.matchMedia('(hover: none)').matches) return;

  // La página padre envía un mapa nombre → { text, mana, category } con la
  // descripción real de cada carta (sacada de la base de datos). Es la fuente
  // fiable del texto de habilidad, ya que los arrays SPELLS/OBJECTS del juego
  // no siempre incluyen la descripción legible.
  var __bfMagInfo = {};
  window.addEventListener('message', function(e){
    if (e.data && e.data.bfCardInfo) __bfMagInfo = e.data.bfCardInfo || {};
  });
  function requestInfo(){ try { window.parent.postMessage({bfArtMapRequest: 1}, '*'); } catch(e) {} }
  requestInfo();
  setInterval(function(){ if (!Object.keys(__bfMagInfo).length) requestInfo(); }, 1500);

  var style = document.createElement('style');
  style.textContent = '.bf-magnifier{position:fixed;z-index:100500;pointer-events:none;width:250px;aspect-ratio:3/4.1;border-radius:14px;overflow:hidden;border:2px solid rgba(255,210,74,.75);background:#07050b;box-shadow:0 18px 50px rgba(0,0,0,.8),0 0 26px rgba(255,210,74,.35);opacity:0;transform:scale(.92);transition:opacity .12s ease,transform .12s ease}' +
    '.bf-magnifier.show{opacity:1;transform:scale(1)}' +
    '.bf-magnifier .bf-mag-fill{position:absolute;inset:0;background-size:cover;background-position:center;filter:blur(16px) saturate(1.3) brightness(.8);transform:scale(1.3)}' +
    '.bf-magnifier .bf-mag-art{position:absolute;inset:-10%;background-size:cover;background-position:center;background-repeat:no-repeat}' +
    '.bf-magnifier .bf-mag-name{position:absolute;left:0;right:0;bottom:0;padding:6px 8px 9px;font-family:Cinzel,serif;font-weight:900;font-size:15px;color:#fff5dc;text-align:center;text-transform:uppercase;text-shadow:0 2px 4px #000;background:linear-gradient(0deg,rgba(8,5,14,.95),rgba(8,5,14,.55) 65%,transparent);z-index:3}' +
    '.bf-magnifier .bf-mag-txt{position:absolute;left:8px;right:8px;bottom:44px;padding:5px 8px;border-radius:8px;background:rgba(8,5,14,.85);border:1px solid rgba(255,210,74,.3);color:#fff7ea;font-size:11px;font-weight:700;line-height:1.25;text-align:center;z-index:3}' +
    '.bf-magnifier .bf-mag-mana{position:absolute;top:8px;right:8px;z-index:4;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:1000;font-size:17px;color:#eaf4ff;background:radial-gradient(circle at 34% 28%,#bfe3ff,#3a8bff 46%,#103a8a);border:2px solid #8fc4ff;box-shadow:0 3px 8px rgba(0,0,0,.55),inset 0 1px 2px rgba(255,255,255,.5);text-shadow:0 1px 2px rgba(0,0,0,.5)}' +
    '.bf-magnifier .bf-mag-mana small{position:absolute;bottom:-15px;left:50%;transform:translateX(-50%);font-size:8px;font-weight:900;letter-spacing:.5px;color:#8fc4ff;text-shadow:0 1px 3px #000}' +
    '.bf-magnifier .bf-mag-gold{position:absolute;top:8px;left:8px;z-index:4;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:1000;font-size:17px;color:#3a2600;background:radial-gradient(circle at 34% 28%,#ffe27a,#d4a017 46%,#8a5a00);border:2px solid #ffd24a;box-shadow:0 3px 8px rgba(0,0,0,.55),inset 0 1px 2px rgba(255,255,255,.5);text-shadow:0 1px 2px rgba(255,255,255,.4)}' +
    '.bf-magnifier .bf-mag-gold small{position:absolute;bottom:-15px;left:50%;transform:translateX(-50%);font-size:8px;font-weight:900;letter-spacing:.5px;color:#ffd24a;text-shadow:0 1px 3px #000}' +
    // La lupa (botón de zoom) de las cartas de la mano ya no es necesaria: el
    // magnifier muestra el texto y el coste al pasar el ratón por encima. Solo
    // se oculta en dispositivos con hover (donde el magnifier funciona).
    '.chip.bf-chip-card .bf-chip-zoom{display:none!important}';
  document.head.appendChild(style);

  var mag = null;
  function ensure(){
    if (mag) return mag;
    mag = document.createElement('div');
    mag.className = 'bf-magnifier';
    mag.innerHTML = '<div class="bf-mag-fill"></div><div class="bf-mag-art"></div><div class="bf-mag-txt"></div><div class="bf-mag-name"></div><div class="bf-mag-mana"><small>MANÁ</small></div><div class="bf-mag-gold"><small>ORO</small></div>';
    document.body.appendChild(mag);
    return mag;
  }
  function artOf(el){
    var sels = ['.bf-chip-art-layer','.shop-card-art-sharp','.bf-quick-art','.bf-bonus-art'];
    for (var i=0;i<sels.length;i++){
      var l = el.querySelector(sels[i]); if (!l) continue;
      var bg = l.style.backgroundImage || getComputedStyle(l).backgroundImage;
      var m = bg && bg.match(/url\\(["']?(.*?)["']?\\)/);
      if (m && m[1]) return m[1];
    }
    return '';
  }
  function nameOf(el){
    var sels = ['.bf-chip-name','.bf-shop-name','.bf-quick-name','.bf-bonus-name','.shop-name'];
    for (var i=0;i<sels.length;i++){
      var n = el.querySelector(sels[i]); if (n && n.textContent && n.textContent.trim()) return n.textContent.trim();
    }
    return '';
  }
  function place(chip){
    var r = chip.getBoundingClientRect(), w = 250, h = w * 4.1 / 3;
    var x = r.right + 10;
    if (x + w > window.innerWidth - 8) x = r.left - w - 10;
    if (x < 8) x = Math.min(window.innerWidth - w - 8, Math.max(8, r.left));
    var y = Math.max(8, Math.min(window.innerHeight - h - 8, r.top + r.height / 2 - h / 2));
    mag.style.left = x + 'px';
    mag.style.top = y + 'px';
  }
  function show(chip){
    var url = artOf(chip);
    if (!url) return;
    ensure();
    mag.querySelector('.bf-mag-fill').style.backgroundImage = 'url("' + url + '")';
    mag.querySelector('.bf-mag-art').style.backgroundImage = 'url("' + url + '")';
    var nm = nameOf(chip);
    mag.querySelector('.bf-mag-name').textContent = nm || (chip.title || '');
    // Busca la carta por nombre en hechizos/objetos/equipo para sacar su texto
    // y su maná aunque la carta pequeña (chip) no los lleve (p.ej. la mano en
    // batalla, donde el chip solo muestra nombre y arte).
    var found = null;
    if (nm) {
      ['SPELLS','OBJECTS','MELEE','RANGED','ARMORS'].forEach(function(arr){
        if (found) return;
        var A = (typeof window[arr] !== 'undefined') ? window[arr] : null;
        if (A) found = A.find(function(x){ return x && x.name === nm; });
      });
    }
    var t = mag.querySelector('.bf-mag-txt');
    // Prioridad: mapa de la BD (bfCardInfo) → chip .bf-chip-info → campos del
    // array del juego (txt/description/abilityTxt/text). Así el texto aparece
    // tanto en batalla (chip sin info) como en equipo.
    var infoTxt = '';
    if (nm && __bfMagInfo[nm] && __bfMagInfo[nm].text) infoTxt = __bfMagInfo[nm].text;
    if (!infoTxt) { var info2 = chip.querySelector('.bf-chip-info'); if (info2 && info2.textContent) infoTxt = info2.textContent; }
    if (!infoTxt && found) infoTxt = found.txt || found.description || found.abilityTxt || found.text || '';
    if (!infoTxt && nm) requestInfo();
    if (infoTxt) { t.textContent = infoTxt; t.style.display = ''; } else t.style.display = 'none';
    // Coste de maná (hechizos/objetos): mismo orbe azul que en la carta pequeña.
    // Si el chip no lleva el orbe, se busca por nombre en la lista del juego.
    var manaBadge = chip.querySelector('.bf-chip-cost.bf-mana-cost');
    var manaTxt = manaBadge && manaBadge.textContent ? manaBadge.textContent : '';
    if (!manaTxt && found) {
      var mv = (typeof window.bfManaFor === 'function') ? window.bfManaFor(found) : (found.mana != null ? found.mana : null);
      if (mv != null) manaTxt = String(mv);
    }
    if (!manaTxt) {
      var sp = (typeof SPELLS !== 'undefined' && nm) ? SPELLS.find(function(s){ return s && s.name === nm; }) : null;
      if (sp) {
        var mv2 = (typeof window.bfManaFor === 'function') ? window.bfManaFor(sp) : (sp.mana != null ? sp.mana : null);
        if (mv2 != null) manaTxt = String(mv2);
      }
    }
    var mm = mag.querySelector('.bf-mag-mana');
    if (manaTxt) {
      mm.childNodes[0] && mm.childNodes[0].nodeType === 3 && mm.removeChild(mm.childNodes[0]);
      mm.insertBefore(document.createTextNode(manaTxt), mm.firstChild);
      mm.style.display = 'flex';
    } else mm.style.display = 'none';
    // Coste de oro (equipo/objetos): orbe dorado arriba-izquierda.
    var goldTxt = '';
    if (nm && __bfMagInfo[nm] && __bfMagInfo[nm].cost != null) goldTxt = String(__bfMagInfo[nm].cost);
    if (!goldTxt && found && found.cost != null) goldTxt = String(found.cost);
    var gd = mag.querySelector('.bf-mag-gold');
    if (goldTxt) {
      gd.childNodes[0] && gd.childNodes[0].nodeType === 3 && gd.removeChild(gd.childNodes[0]);
      gd.insertBefore(document.createTextNode(goldTxt), gd.firstChild);
      gd.style.display = 'flex';
    } else gd.style.display = 'none';
    place(chip);
    mag.classList.add('show');
  }
  function hide(){ if (mag) mag.classList.remove('show'); }

  document.addEventListener('mouseover', function(e){
    if (!e.target.closest) { hide(); return; }
    var el = e.target.closest('.chip.bf-chip-card') || e.target.closest('.shop-card.has-art') || e.target.closest('.bf-quick-card');
    if (el) show(el); else hide();
  });
  var _bfSc=0;
  window.addEventListener('scroll', function(){ var n=Date.now(); if(n-_bfSc<100)return; _bfSc=n; hide(); }, { passive: true, capture: true });
})();
</script>
`;