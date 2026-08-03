// Parche inyectado en el iframe: selector de AVATAR de héroe junto al nick.
//
// El jugador elige un avatar de héroe de la BD (el arte de carta se envía desde
// Home.jsx via postMessage). El avatar se guarda en localStorage y se muestra:
//  - Junto al nick en la barra de marcador (matchScorePatch)
//  - En la pantalla de resultado (matchModePatch)
//  - Se sincroniza al rival en multijugador (welcome + mensaje propio)
export const AVATAR_PATCH = `
<script>
(function(){
  if (window.__bfAvatarPatch) return;
  window.__bfAvatarPatch = true;

  var isEn = function(){ try { return localStorage.getItem('bfLang') === 'en'; } catch(e) { return false; } };
  var L = function(es, en){ return isEn() ? en : es; };

  // ---- Lista de héroes recibida del padre (arte de la BD) ----
  var HEROES = [];
  window.addEventListener('message', function(e){
    if (e.data && Array.isArray(e.data.bfAvatarMap)) {
      HEROES = e.data.bfAvatarMap;
      window.__bfAvatarHeroes = HEROES;
      renderPickers();
    }
  });

  // ---- Avatar guardado ----
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
    '.bf-av-modal{position:fixed;inset:0;z-index:100060;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.8)}',
    '.bf-av-modal-inner{background:linear-gradient(180deg,#1b1430,#0a0712);border:2px solid rgba(255,210,74,.4);border-radius:16px;padding:18px;max-width:min(90vw,460px);max-height:80vh;overflow-y:auto}',
    '.bf-av-modal-title{font-family:"Cinzel",serif;font-weight:800;font-size:17px;color:#ffd24a;text-align:center;margin-bottom:14px}',
    '.bf-av-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(56px,1fr));gap:10px}',
    '.bf-av-opt{cursor:pointer;border-radius:50%;overflow:hidden;border:2px solid transparent;width:52px;height:52px;margin:0 auto;transition:transform .12s ease,border-color .12s ease}',
    '.bf-av-opt:hover{transform:scale(1.12)}',
    '.bf-av-opt.active{border-color:#ffd24a;box-shadow:0 0 12px rgba(255,210,74,.5)}',
    '.bf-av-opt img{width:100%;height:100%;object-fit:cover}',
    '.bf-av-opt-name{font-size:8px;color:#cfc6dd;text-align:center;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:60px;margin:0 auto}',
    '.bf-av-opt-wrap{display:flex;flex-direction:column;align-items:center}',
    '.bf-av-score{width:22px;height:22px;border-radius:50%;border:1.5px solid rgba(255,210,74,.5);overflow:hidden;flex-shrink:0;object-fit:cover}',
    '@media(max-width:600px){.bf-av-score{width:17px;height:17px}}',
    '.bf-av-result{width:44px;height:44px;border-radius:50%;border:2px solid rgba(255,210,74,.5);overflow:hidden;margin:0 auto 6px;object-fit:cover;display:block}',
  ].join('');
  document.head.appendChild(st);

  function defaultAv(){ return HEROES.length ? HEROES[Math.floor(Math.random()*HEROES.length)] : null; }

  // ---- Modal selector de avatar ----
  function openPicker(onSelect) {
    if (!HEROES.length) return;
    var modal = document.createElement('div');
    modal.className = 'bf-av-modal';
    var cur = window.bfMyAvatar;
    modal.innerHTML = '<div class="bf-av-modal-inner"><div class="bf-av-modal-title">' + L('Elige tu avatar','Choose your avatar') + '</div><div class="bf-av-grid"></div></div>';
    var grid = modal.querySelector('.bf-av-grid');
    HEROES.forEach(function(h){
      var wrap = document.createElement('div');
      wrap.className = 'bf-av-opt-wrap';
      var opt = document.createElement('div');
      opt.className = 'bf-av-opt' + (cur && cur.id === h.id ? ' active' : '');
      opt.innerHTML = '<img src="' + h.url + '" loading="lazy">';
      var nm = document.createElement('div');
      nm.className = 'bf-av-opt-name';
      nm.textContent = h.name;
      opt.onclick = function(){
        grid.querySelectorAll('.bf-av-opt').forEach(function(o){ o.classList.remove('active'); });
        opt.classList.add('active');
        onSelect(h);
        setTimeout(function(){ if (modal.parentNode) modal.parentNode.removeChild(modal); }, 120);
      };
      wrap.appendChild(opt);
      wrap.appendChild(nm);
      grid.appendChild(wrap);
    });
    modal.addEventListener('click', function(e){ if (e.target === modal) { modal.parentNode.removeChild(modal); } });
    document.body.appendChild(modal);
  }

  // ---- Botón de avatar junto a los campos de nick ----
  function renderPickers() {
    if (!HEROES.length) return;
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
        var av = window.bfMyAvatar || defaultAv();
        if (av) btn.innerHTML = '<img src="' + av.url + '">';
        else btn.innerHTML = '<span class="bf-av-ph">?</span>';
      }
      refresh();
      btn.onclick = function(){
        openPicker(function(av){
          saveAv(av);
          refresh();
          injectScoreAvatars();
        });
      };
      row.insertBefore(btn, row.firstChild);
    });
  }
  new MutationObserver(renderPickers).observe(document.documentElement, { childList:true, subtree:true });
  setInterval(renderPickers, 600);

  // ---- Avatares en la barra de marcador (matchScorePatch) ----
  function injectScoreAvatars() {
    var bar = document.getElementById('bf-score-bar');
    if (!bar) return;
    var pName = bar.querySelector('.bf-score-p-name');
    var oName = bar.querySelector('.bf-score-o-name');
    var myAv = window.bfMyAvatar;
    var oppAv = window.bfOppAvatar;
    function addToSide(sideEl, av) {
      if (!sideEl || !av) return;
      var existing = sideEl.querySelector('.bf-av-score');
      if (existing) { existing.src = av.url; return; }
      var img = document.createElement('img');
      img.className = 'bf-av-score';
      img.src = av.url;
      sideEl.insertBefore(img, sideEl.firstChild);
    }
    if (myAv) addToSide(pName ? pName.parentElement : null, myAv);
    if (oppAv) addToSide(oName ? oName.parentElement : null, oppAv);
  }

  // ---- Avatares en la pantalla de resultado (matchModePatch) ----
  function injectResultAvatars() {
    var rs = document.getElementById('s-result');
    if (!rs) return;
    var cols = rs.querySelectorAll('.bf-score-col');
    if (cols.length < 2) return;
    var avs = [window.bfMyAvatar, window.bfOppAvatar];
    for (var i = 0; i < 2; i++) {
      var col = cols[i];
      var av = avs[i];
      if (!col || !av) continue;
      var existing = col.querySelector('.bf-av-result');
      if (existing) { existing.src = av.url; continue; }
      var img = document.createElement('img');
      img.className = 'bf-av-result';
      img.src = av.url;
      col.insertBefore(img, col.firstChild);
    }
  }

  setInterval(function(){ injectScoreAvatars(); injectResultAvatars(); }, 800);

  // ---- Sincronización multijugador: enviar avatar en el welcome ----
  if (typeof window.netSend === 'function' && !window.netSend.__bfAv) {
    var origSend = window.netSend;
    window.netSend = function(obj){
      try { if (obj && obj.t === 'welcome' && window.bfMyAvatar) obj.myAvatar = window.bfMyAvatar; } catch(e) {}
      return origSend.apply(this, arguments);
    };
    window.netSend.__bfAv = 1;
  }

  // Escucha el avatar del rival en el welcome y en mensajes propios
  setInterval(function(){
    var n = typeof NET !== 'undefined' ? NET : null;
    if (!n || !n.conn || n.conn.__bfAvL) return;
    n.conn.__bfAvL = 1;
    try {
      n.conn.on('data', function(msg){
        if (!msg || typeof msg !== 'object') return;
        if ((msg.t === 'welcome' || msg.t === 'bfavatar') && msg.myAvatar) {
          window.bfOppAvatar = msg.myAvatar;
          injectScoreAvatars();
          injectResultAvatars();
        }
      });
    } catch(e) {}
  }, 500);

  // El cliente envía su avatar al host tras conectarse
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