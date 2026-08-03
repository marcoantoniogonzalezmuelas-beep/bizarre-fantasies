// Parche inyectado en el iframe: selector de AVATAR del catálogo de avatares
// generados por IA. El jugador elige uno de la galería (enviada por el padre
// vía postMessage como bfAvatarCatalog). El avatar seleccionado se guarda en
// localStorage y se asocia al nick en la BD (PlayerAvatar) al terminar la
// partida, para que el Top Ranking lo muestre siempre.
export const AVATAR_PATCH = `
<script>
(function(){
  if (window.__bfAvatarPatch) return;
  window.__bfAvatarPatch = true;

  var isEn = function(){ try { return localStorage.getItem('bfLang') === 'en'; } catch(e) { return false; } };
  var L = function(es, en){ return isEn() ? en : es; };

  // ---- Catálogo de avatares (recibido del padre) ----
  window.__bfAvatarCatalog = window.__bfAvatarCatalog || [];

  // ---- Avatar guardado (sesión actual) ----
  var KEY = 'bfMyAvatar';
  function loadAv(){ try { var s = localStorage.getItem(KEY); if (s) return JSON.parse(s); } catch(e) {} return null; }
  function saveAv(av){ try { localStorage.setItem(KEY, JSON.stringify(av)); } catch(e) {} window.bfMyAvatar = av; }
  window.bfMyAvatar = loadAv();
  window.bfOppAvatar = null;

  // ---- CSS ----
  var st = document.createElement('style');
  st.textContent = [
    '.bf-av-pick{display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;width:34px;height:34px;border-radius:50%;border:2px solid rgba(255,210,74,.5);background:rgba(20,14,38,.7);cursor:pointer;overflow:hidden;flex-shrink:0;margin-right:6px;transition:transform .15s ease,border-color .15s ease}',
    '.bf-av-pick:hover{transform:scale(1.1);border-color:#ffd24a}',
    '.bf-av-pick img{width:100%;height:100%;object-fit:cover}',
    '.bf-av-pick .bf-av-ph{color:#8a7ca0;font-size:16px;line-height:1}',
    '.bf-av-score{width:22px;height:22px;border-radius:50%;border:1.5px solid rgba(255,210,74,.5);overflow:hidden;flex-shrink:0;object-fit:cover}',
    '@media(max-width:600px){.bf-av-score{width:17px;height:17px}}',
    '.bf-av-result{width:44px;height:44px;border-radius:50%;border:2px solid rgba(255,210,74,.5);overflow:hidden;margin:0 auto 6px;object-fit:cover;display:block}',
    '.bf-av-modal{position:fixed;inset:0;z-index:999999;background:rgba(8,5,16,.94);display:flex;flex-direction:column;align-items:center;padding:50px 16px 20px;overflow-y:auto;-webkit-overflow-scrolling:touch}',
    '.bf-av-modal-title{font-family:"Cinzel",serif;font-weight:800;font-size:20px;color:#FFD24A;margin-bottom:14px;text-shadow:0 2px 6px #000}',
    '.bf-av-grid{display:grid;grid-template-columns:repeat(6,1fr);gap:10px;max-width:560px;width:100%}',
    '@media(max-width:600px){.bf-av-grid{grid-template-columns:repeat(4,1fr);gap:8px}}',
    '.bf-av-item{cursor:pointer;text-align:center}',
    '.bf-av-item img{width:100%;aspect-ratio:1;border-radius:50%;object-fit:cover;border:2.5px solid rgba(255,210,74,.25);transition:transform .14s ease,border-color .14s ease,box-shadow .14s ease;background:#180f2a}',
    '.bf-av-item:hover img{transform:scale(1.12);border-color:rgba(255,210,74,.7)}',
    '.bf-av-item.selected img{border-color:#FFD24A;box-shadow:0 0 14px rgba(255,210,74,.5)}',
    '.bf-av-item-name{font-size:9px;color:#cfc6dd;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.bf-av-close{position:fixed;top:14px;right:14px;cursor:pointer;color:#FFD24A;font-size:22px;background:rgba(20,14,38,.85);border:1.5px solid rgba(255,210,74,.4);border-radius:50%;width:38px;height:38px;display:flex;align-items:center;justify-content:center;z-index:1000000;line-height:1;user-select:none}',
    '.bf-av-close:hover{background:rgba(255,210,74,.15)}',
  ].join('');
  document.head.appendChild(st);

  // ---- Modal del selector ----
  function openModal() {
    closeModal();
    var catalog = window.__bfAvatarCatalog || [];
    if (!catalog.length) {
      if (typeof notif === 'function') notif(L('Cargando avatares…', 'Loading avatars…'));
      return;
    }
    var overlay = document.createElement('div');
    overlay.className = 'bf-av-modal';
    overlay.id = 'bf-av-modal';
    var title = document.createElement('div');
    title.className = 'bf-av-modal-title';
    title.textContent = L('Elige tu avatar', 'Choose your avatar');
    overlay.appendChild(title);
    var grid = document.createElement('div');
    grid.className = 'bf-av-grid';
    var cur = window.bfMyAvatar;
    catalog.forEach(function(av) {
      var item = document.createElement('div');
      item.className = 'bf-av-item' + (cur && cur.url === av.url ? ' selected' : '');
      var img = document.createElement('img');
      img.src = av.url; img.alt = av.name || ''; img.loading = 'lazy';
      item.appendChild(img);
      if (av.name) {
        var nm = document.createElement('div');
        nm.className = 'bf-av-item-name';
        nm.textContent = av.name;
        item.appendChild(nm);
      }
      item.onclick = function() {
        saveAv({ url: av.url, name: av.name || '' });
        closeModal();
        renderPickers();
        injectScoreAvatars();
        injectResultAvatars();
      };
      grid.appendChild(item);
    });
    overlay.appendChild(grid);
    var closeBtn = document.createElement('div');
    closeBtn.className = 'bf-av-close';
    closeBtn.textContent = '×';
    closeBtn.onclick = closeModal;
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function(e) { if (e.target === overlay) closeModal(); });
  }
  function closeModal() {
    var ex = document.getElementById('bf-av-modal');
    if (ex) ex.remove();
  }

  // ---- Recibe el catálogo del padre ----
  window.addEventListener('message', function(e){
    if (e.data && Array.isArray(e.data.bfAvatarCatalog)) {
      window.__bfAvatarCatalog = e.data.bfAvatarCatalog;
    }
  });

  // ---- Botón de avatar junto a los campos de nick ----
  function renderPickers() {
    ['p1name','hname','jname'].forEach(function(id){
      var input = document.getElementById(id);
      if (!input || input.dataset.bfAv === '1') return;
      input.dataset.bfAv = '1';
      var row = input.closest('.ig') || input.parentElement;
      if (!row || row.dataset.bfAvRow === '1') return;
      row.dataset.bfAvRow = '1';
      var btn = document.createElement('div');
      btn.className = 'bf-av-pick';
      function refresh(){
        var av = window.bfMyAvatar;
        if (av && av.url) btn.innerHTML = '<img src="' + av.url + '">';
        else btn.innerHTML = '<span class="bf-av-ph">?</span>';
      }
      refresh();
      btn.title = L('Elige tu avatar', 'Choose your avatar');
      btn.onclick = function(e){ e.preventDefault(); e.stopPropagation(); openModal(); };
      row.insertBefore(btn, row.firstChild);
    });
  }
  new MutationObserver(renderPickers).observe(document.documentElement, { childList:true, subtree:true });
  setInterval(renderPickers, 600);

  // ---- Avatares en la barra de marcador ----
  function injectScoreAvatars() {
    var bar = document.getElementById('bf-score-bar');
    if (!bar) return;
    var pName = bar.querySelector('.bf-score-p-name');
    var oName = bar.querySelector('.bf-score-o-name');
    function addToSide(sideEl, av) {
      if (!sideEl || !av) return;
      var existing = sideEl.querySelector('.bf-av-score');
      if (existing) { existing.src = av.url; return; }
      var img = document.createElement('img');
      img.className = 'bf-av-score'; img.src = av.url;
      sideEl.insertBefore(img, sideEl.firstChild);
    }
    if (window.bfMyAvatar) addToSide(pName ? pName.parentElement : null, window.bfMyAvatar);
    if (window.bfOppAvatar) addToSide(oName ? oName.parentElement : null, window.bfOppAvatar);
  }

  // ---- Avatares en la pantalla de resultado ----
  function injectResultAvatars() {
    var rs = document.getElementById('s-result');
    if (!rs) return;
    var cols = rs.querySelectorAll('.bf-score-col');
    if (cols.length < 2) return;
    var avs = [window.bfMyAvatar, window.bfOppAvatar];
    for (var i = 0; i < 2; i++) {
      var col = cols[i]; var av = avs[i];
      if (!col || !av) continue;
      var existing = col.querySelector('.bf-av-result');
      if (existing) { existing.src = av.url; continue; }
      var img = document.createElement('img');
      img.className = 'bf-av-result'; img.src = av.url;
      col.insertBefore(img, col.firstChild);
    }
  }
  setInterval(function(){ injectScoreAvatars(); injectResultAvatars(); }, 800);

  // ---- Sincronización multijugador ----
  if (typeof window.netSend === 'function' && !window.netSend.__bfAv) {
    var origSend = window.netSend;
    window.netSend = function(obj){
      try { if (obj && obj.t === 'welcome' && window.bfMyAvatar) obj.myAvatar = window.bfMyAvatar; } catch(e) {}
      return origSend.apply(this, arguments);
    };
    window.netSend.__bfAv = 1;
  }
  setInterval(function(){
    var n = typeof NET !== 'undefined' ? NET : null;
    if (!n || !n.conn || n.conn.__bfAvL) return;
    n.conn.__bfAvL = 1;
    try {
      n.conn.on('data', function(msg){
        if (!msg || typeof msg !== 'object') return;
        if ((msg.t === 'welcome' || msg.t === 'bfavatar') && msg.myAvatar) {
          window.bfOppAvatar = msg.myAvatar;
          injectScoreAvatars(); injectResultAvatars();
        }
      });
    } catch(e) {}
  }, 500);
  setInterval(function(){
    var n = typeof NET !== 'undefined' ? NET : null;
    if (!n || !n.conn || n.role !== 'client' || n.conn.__bfAvSent) return;
    if (window.bfMyAvatar) {
      try { netSend({ t: 'bfavatar', myAvatar: window.bfMyAvatar }); n.conn.__bfAvSent = 1; } catch(e) {}
    }
  }, 1000);
})();
</script>
`;