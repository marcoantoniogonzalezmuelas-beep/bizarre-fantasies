// Parche inyectado en el iframe: selector de AVATAR por foto subida por el jugador.
//
// El jugador sube cualquier foto; se recorta a círculo (256×256) en canvas y se
// envía al padre (Home.jsx), que la sube a almacenamiento y devuelve la URL.
// El avatar se guarda en localStorage (sesión actual) y se asocia al nick en la
// BD (PlayerAvatar) al terminar la partida, para que el Top Ranking lo muestre
// siempre — independientemente del dispositivo o de que el jugador lo cambie.
export const AVATAR_PATCH = `
<script>
(function(){
  if (window.__bfAvatarPatch) return;
  window.__bfAvatarPatch = true;

  var isEn = function(){ try { return localStorage.getItem('bfLang') === 'en'; } catch(e) { return false; } };
  var L = function(es, en){ return isEn() ? en : es; };

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
  ].join('');
  document.head.appendChild(st);

  // ---- Subida de foto: recorta a círculo en canvas y la envía al padre ----
  function uploadPhoto() {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
      var file = e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function(ev) {
        var img = new Image();
        img.onload = function() {
          // Recorta a cuadrado centrado (cover) y escala a 256×256
          var canvas = document.createElement('canvas');
          canvas.width = 256; canvas.height = 256;
          var ctx = canvas.getContext('2d');
          var minDim = Math.min(img.width, img.height);
          var sx = (img.width - minDim) / 2;
          var sy = (img.height - minDim) / 2;
          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 256, 256);
          canvas.toBlob(function(blob) {
            if (!blob) return;
            var r2 = new FileReader();
            r2.onload = function(ev2) {
              // Estado de carga: muestra "…" mientras se sube
              document.querySelectorAll('.bf-av-pick').forEach(function(b){ b.innerHTML = '<span class="bf-av-ph">…</span>'; });
              window.parent.postMessage({ bfAvatarUpload: ev2.target.result }, '*');
            };
            r2.readAsDataURL(blob);
          }, 'image/jpeg', 0.85);
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  // ---- Recibe la URL del avatar subido desde el padre ----
  window.addEventListener('message', function(e){
    if (e.data && typeof e.data.bfAvatarUrl === 'string') {
      var url = e.data.bfAvatarUrl;
      saveAv({ url: url });
      document.querySelectorAll('.bf-av-pick').forEach(function(btn){ btn.innerHTML = '<img src="' + url + '">'; });
      injectScoreAvatars();
      injectResultAvatars();
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
      btn.title = L('Sube tu foto de avatar', 'Upload your avatar photo');
      btn.onclick = function(e){
        e.preventDefault(); e.stopPropagation();
        uploadPhoto();
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