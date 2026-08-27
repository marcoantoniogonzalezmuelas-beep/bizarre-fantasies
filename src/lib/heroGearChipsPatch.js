// Batalla: el arma y la armadura del héroe solo se veían como iconos diminutos
// dentro de la barra de atributos. Este parche añade CHAPAS GRANDES y legibles
// con el nombre del equipo (dorado = arma, azul = armadura) en cada carta.
//
// Se pintan como capa ABSOLUTA dentro de la carta, así que no pueden mover el
// nombre, la barra de atributos ni los rótulos de estado.
export const HERO_GEAR_CHIPS_PATCH = `
<script>
(function(){
  if(window.__bfGearChips) return;
  window.__bfGearChips = true;

  var st = document.createElement('style');
  st.textContent =
    '.bf-gear-chips{position:absolute!important;right:9px!important;bottom:32px!important;top:auto!important;left:auto!important;z-index:15!important;display:flex!important;flex-direction:column!important;align-items:flex-end!important;gap:4px!important;max-width:70%!important;pointer-events:none!important;contain:layout style!important}' +
    '.bf-gear-chip{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;font-family:Rubik,sans-serif;font-weight:900;font-size:12.5px;line-height:1.2;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis;background:linear-gradient(180deg,#4a3208,#1d1304);border:2px solid #ffd24a;color:#ffe9a8;text-shadow:0 1px 2px rgba(0,0,0,.9);box-shadow:0 3px 10px rgba(0,0,0,.6),0 0 10px rgba(255,210,74,.3)}' +
    '.bf-gear-chip.arm{background:linear-gradient(180deg,#0e2c4d,#04121f);border-color:#7fd0ff;color:#d6f0ff;box-shadow:0 3px 10px rgba(0,0,0,.6),0 0 10px rgba(127,208,255,.3)}' +
    '.bf-gear-chip i{font-style:normal;font-size:14px;line-height:1}';
  document.head.appendChild(st);

  function esc(s){ return String(s == null ? '' : s).replace(/[<>&]/g, function(c){ return c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&amp;'; }); }

  function chipsHtml(h){
    var out = '';
    if(h.mwep) out += '<span class="bf-gear-chip"><i>\\u2694\\ufe0f</i>' + esc(h.mwep.name) + (h.mwep.cc ? ' +' + h.mwep.cc + ' CC' : '') + '</span>';
    if(h.rwep) out += '<span class="bf-gear-chip"><i>\\ud83c\\udfaf</i>' + esc(h.rwep.name) + (h.rwep.power ? ' \\u00d7' + h.rwep.power : '') + '</span>';
    if(h.armor) out += '<span class="bf-gear-chip arm"><i>\\ud83d\\udee1\\ufe0f</i>' + esc(h.armor.name) + (h.armor.hp ? ' +' + h.armor.hp + ' HP' : '') + '</span>';
    return out;
  }

  function paint(){
    if(typeof G === 'undefined' || !G || !G.team) return;
    document.querySelectorAll('.bhero[id^="b_"]').forEach(function(card){
      var m = String(card.id || '').match(/^b_([po])_(.+)$/);
      if(!m) return;
      var h = (G.team[m[1]] || []).find(function(x){ return x && x.id === m[2]; });
      if(!h) return;
      var html = h.alive === false ? '' : chipsHtml(h);
      var box = card.querySelector('.bf-gear-chips');
      if(!html){ if(box) box.remove(); return; }
      if(!box){
        box = document.createElement('div');
        box.className = 'bf-gear-chips';
        box.innerHTML = html;
        box.__bfHtml = html;
        card.appendChild(box);
        return;
      }
      if(box.__bfHtml !== html){ box.__bfHtml = html; box.innerHTML = html; }
    });
  }

  function hookRender(){
    if(typeof window.renderBattle !== 'function' || window.renderBattle.__bfGearChips) return false;
    var orig = window.renderBattle;
    window.renderBattle = function(){ var r = orig.apply(this, arguments); paint(); return r; };
    window.renderBattle.__bfGearChips = 1;
    return true;
  }

  var tries = 0, iv = setInterval(function(){ if(hookRender() || tries++ > 200) clearInterval(iv); }, 150);
  setInterval(paint, 600);
  paint();
})();
</script>
`;