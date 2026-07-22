// Parche inyectado en el iframe: lupa automática al pasar el ratón por las
// cartas de la mano (hechizos/objetos). Muestra una vista ampliada de la carta
// junto al cursor. Solo en dispositivos con puntero (hover); en táctil no aplica.
export const CARD_MAGNIFIER_PATCH = `
<script>
(function(){
  if (window.__bfCardMagnifier) return;
  window.__bfCardMagnifier = true;
  if (window.matchMedia && window.matchMedia('(hover: none)').matches) return;

  var style = document.createElement('style');
  style.textContent = '.bf-magnifier{position:fixed;z-index:100500;pointer-events:none;width:250px;aspect-ratio:3/4.1;border-radius:14px;overflow:hidden;border:2px solid rgba(255,210,74,.75);background:#07050b;box-shadow:0 18px 50px rgba(0,0,0,.8),0 0 26px rgba(255,210,74,.35);opacity:0;transform:scale(.92);transition:opacity .12s ease,transform .12s ease}' +
    '.bf-magnifier.show{opacity:1;transform:scale(1)}' +
    '.bf-magnifier .bf-mag-fill{position:absolute;inset:0;background-size:cover;background-position:center;filter:blur(16px) saturate(1.3) brightness(.8);transform:scale(1.3)}' +
    '.bf-magnifier .bf-mag-art{position:absolute;inset:-10%;background-size:cover;background-position:center;background-repeat:no-repeat}' +
    '.bf-magnifier .bf-mag-name{position:absolute;left:0;right:0;bottom:0;padding:6px 8px 9px;font-family:Cinzel,serif;font-weight:900;font-size:15px;color:#fff5dc;text-align:center;text-transform:uppercase;text-shadow:0 2px 4px #000;background:linear-gradient(0deg,rgba(8,5,14,.95),rgba(8,5,14,.55) 65%,transparent);z-index:3}' +
    '.bf-magnifier .bf-mag-txt{position:absolute;left:8px;right:8px;bottom:44px;padding:5px 8px;border-radius:8px;background:rgba(8,5,14,.85);border:1px solid rgba(255,210,74,.3);color:#fff7ea;font-size:11px;font-weight:700;line-height:1.25;text-align:center;z-index:3}' +
    '.bf-magnifier .bf-mag-mana{position:absolute;top:8px;right:8px;z-index:4;width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:1000;font-size:17px;color:#eaf4ff;background:radial-gradient(circle at 34% 28%,#bfe3ff,#3a8bff 46%,#103a8a);border:2px solid #8fc4ff;box-shadow:0 3px 8px rgba(0,0,0,.55),inset 0 1px 2px rgba(255,255,255,.5);text-shadow:0 1px 2px rgba(0,0,0,.5)}' +
    '.bf-magnifier .bf-mag-mana small{position:absolute;bottom:-15px;left:50%;transform:translateX(-50%);font-size:8px;font-weight:900;letter-spacing:.5px;color:#8fc4ff;text-shadow:0 1px 3px #000}';
  document.head.appendChild(style);

  var mag = null;
  function ensure(){
    if (mag) return mag;
    mag = document.createElement('div');
    mag.className = 'bf-magnifier';
    mag.innerHTML = '<div class="bf-mag-fill"></div><div class="bf-mag-art"></div><div class="bf-mag-txt"></div><div class="bf-mag-name"></div><div class="bf-mag-mana"><small>MANÁ</small></div>';
    document.body.appendChild(mag);
    return mag;
  }
  function artOf(chip){
    var l = chip.querySelector('.bf-chip-art-layer');
    var bg = l && l.style.backgroundImage;
    var m = bg && bg.match(/url\\(["']?(.*?)["']?\\)/);
    return m ? m[1] : '';
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
    var nameEl = chip.querySelector('.bf-chip-name');
    mag.querySelector('.bf-mag-name').textContent = nameEl ? nameEl.textContent : (chip.title || '');
    var info = chip.querySelector('.bf-chip-info');
    var t = mag.querySelector('.bf-mag-txt');
    if (info && info.textContent) { t.textContent = info.textContent; t.style.display = ''; }
    else t.style.display = 'none';
    // Coste de maná (hechizos): mismo orbe azul que en la carta pequeña.
    var manaBadge = chip.querySelector('.bf-chip-cost.bf-mana-cost');
    var mm = mag.querySelector('.bf-mag-mana');
    if (manaBadge && manaBadge.textContent) {
      mm.childNodes[0] && mm.removeChild(mm.childNodes[0]);
      mm.insertBefore(document.createTextNode(manaBadge.textContent), mm.firstChild);
      mm.style.display = 'flex';
    } else mm.style.display = 'none';
    place(chip);
    mag.classList.add('show');
  }
  function hide(){ if (mag) mag.classList.remove('show'); }

  document.addEventListener('mouseover', function(e){
    var chip = e.target.closest && e.target.closest('.chip.bf-chip-card');
    if (chip) show(chip); else hide();
  });
  window.addEventListener('scroll', hide, true);
})();
</script>
`;