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
  function saveAv(av){
    try { localStorage.setItem(KEY, JSON.stringify(av)); } catch(e) {}
    window.bfMyAvatar = av;
    // Si hay un nick escrito en cualquiera de los campos, avisa al padre para
    // que guarde/actualice el avatar en la BD (PlayerAvatar) inmediatamente.
    var nick = '';
    ['p1name','hname','jname','jlname','p2name'].forEach(function(id){
      var i = document.getElementById(id);
      if (i && i.value && String(i.value).trim() && !/^jugador\s*\d*$/i.test(String(i.value).trim())) nick = String(i.value).trim();
    });
    if (nick && av && av.url) {
      try { parent.postMessage({ bfSaveAvatar: { nick: nick, avatar_url: av.url } }, '*'); } catch(e) {}
    }
  }
  window.bfMyAvatar = loadAv();
  window.bfOppAvatar = null;

  // Avatares asociados a nicks en la BD (PlayerAvatar) y mapa de héroes,
  // recibidos del padre para auto-rellenar el avatar según el nick.
  window.__bfPlayerAvatars = window.__bfPlayerAvatars || {};
  window.__bfHeroAvatars = window.__bfHeroAvatars || [];

  // ---- CSS ----
  var st = document.createElement('style');
  st.textContent = [
    '.bf-av-pick{display:inline-flex;align-items:center;justify-content:center;vertical-align:middle;width:42px;height:42px;border-radius:50%;border:2.5px solid rgba(255,210,74,.5);background:rgba(20,14,38,.7);cursor:pointer;overflow:hidden;flex-shrink:0;margin-right:8px;transition:transform .15s ease,border-color .15s ease,box-shadow .15s ease}',
    '.bf-av-pick:hover{transform:scale(1.1);border-color:#ffd24a}',
    '.bf-av-pick img{width:100%;height:100%;object-fit:cover}',
    '.bf-av-pick .bf-av-ph{color:#8a7ca0;font-size:18px;line-height:1}',
    // Móvil/tablet: avatar GRANDE y resaltado para que se vea claro.
    '@media(max-width:1024px){.bf-av-pick{width:64px;height:64px;border-width:3px;margin-right:10px;box-shadow:0 0 16px rgba(255,210,74,.35)}.bf-av-pick .bf-av-ph{font-size:28px}.bf-av-pick.bf-av-empty{border-color:#FFD24A;animation:bfAvPulse 1.4s ease-in-out infinite}}',
    '@keyframes bfAvPulse{0%,100%{box-shadow:0 0 12px rgba(255,210,74,.3);border-color:rgba(255,210,74,.6)}50%{box-shadow:0 0 26px rgba(255,210,74,.7);border-color:#FFD24A}}',
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
    '.bf-av-tabs{display:flex;gap:6px;margin-bottom:12px;justify-content:center}',
    '.bf-av-tab{padding:7px 18px;border-radius:20px;border:1.5px solid rgba(255,210,74,.35);background:rgba(20,14,38,.6);color:#cfc6dd;font-size:12px;font-weight:700;cursor:pointer;transition:all .15s ease;letter-spacing:.3px}',
    '.bf-av-tab:hover{border-color:rgba(255,210,74,.6);color:#FFD24A}',
    '.bf-av-tab.active{background:linear-gradient(180deg,#ffe27a,#c8901f);color:#3a2600;border-color:#FFD24A}',
    '.bf-av-pane{display:none;max-width:560px;width:100%}',
    '.bf-av-pane.active{display:block}',
  ].join('');
  document.head.appendChild(st);

  // ---- Modal del selector ----
  function buildAvatarGrid(items, cur) {
    var grid = document.createElement('div');
    grid.className = 'bf-av-grid';
    items.forEach(function(av) {
      if (!av || !av.url) return;
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
        document.querySelectorAll('.bf-av-pick').forEach(function(b){
          var a = window.bfMyAvatar;
          if (a && a.url) { b.innerHTML = '<img src="' + a.url + '">'; b.classList.remove('bf-av-empty'); }
          else { b.innerHTML = '<span class="bf-av-ph">?</span>'; b.classList.add('bf-av-empty'); }
        });
        injectScoreAvatars();
        injectResultAvatars();
      };
      grid.appendChild(item);
    });
    return grid;
  }

  function openModal() {
    closeModal();
    var catalog = window.__bfAvatarCatalog || [];
    var heroes = window.__bfHeroAvatars || [];
    if (!catalog.length && !heroes.length) {
      if (typeof notif === 'function') notif(L('Cargando avatares…', 'Loading avatars…'));
      return;
    }
    var cur = window.bfMyAvatar;
    var overlay = document.createElement('div');
    overlay.className = 'bf-av-modal';
    overlay.id = 'bf-av-modal';

    var title = document.createElement('div');
    title.className = 'bf-av-modal-title';
    title.textContent = L('Elige tu avatar', 'Choose your avatar');
    overlay.appendChild(title);

    // Pestañas: Catálogo / Héroes
    var tabsWrap = document.createElement('div');
    tabsWrap.className = 'bf-av-tabs';
    var tabCat = document.createElement('div');
    tabCat.className = 'bf-av-tab active';
    tabCat.textContent = L('Catálogo', 'Catalog');
    var tabHero = document.createElement('div');
    tabHero.className = 'bf-av-tab';
    tabHero.textContent = L('Héroes', 'Heroes');
    tabsWrap.appendChild(tabCat);
    tabsWrap.appendChild(tabHero);
    overlay.appendChild(tabsWrap);

    var paneCat = document.createElement('div');
    paneCat.className = 'bf-av-pane active';
    paneCat.appendChild(buildAvatarGrid(catalog, cur));

    var paneHero = document.createElement('div');
    paneHero.className = 'bf-av-pane';
    paneHero.appendChild(buildAvatarGrid(heroes, cur));

    overlay.appendChild(paneCat);
    overlay.appendChild(paneHero);

    tabCat.onclick = function() {
      tabCat.classList.add('active'); tabHero.classList.remove('active');
      paneCat.classList.add('active'); paneHero.classList.remove('active');
    };
    tabHero.onclick = function() {
      tabHero.classList.add('active'); tabCat.classList.remove('active');
      paneHero.classList.add('active'); paneCat.classList.remove('active');
    };

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
  // Expone el modal para que otros parches (Habitación Bizarra) abran el mismo
  // selector de avatares (catálogo + héroes, 100+ avatares).
  window.__bfOpenAvatarModal = openModal;

  // ---- Recibe catálogo, héroes y avatares-por-nick del padre ----
  window.addEventListener('message', function(e){
    if (!e.data) return;
    if (Array.isArray(e.data.bfAvatarCatalog)) window.__bfAvatarCatalog = e.data.bfAvatarCatalog;
    if (Array.isArray(e.data.bfAvatarMap)) window.__bfHeroAvatars = e.data.bfAvatarMap;
    if (e.data.bfPlayerAvatars && typeof e.data.bfPlayerAvatars === 'object') {
      window.__bfPlayerAvatars = e.data.bfPlayerAvatars;
      window.__bfPlayerAvatarsLoaded = true;
      // Re-comprueba los nicks ya escritos para auto-rellenar el avatar.
      ['p1name','hname','jname','jlname'].forEach(function(id){
        var input = document.getElementById(id);
        if (input) { input.dataset.bfLastNick = ''; checkNickAvatar(input); }
      });
    }
  });

  // ---- Limpia el avatar guardado (forzar elección de uno nuevo) ----
  function clearAv(){
    try { localStorage.removeItem(KEY); } catch(e) {}
    window.bfMyAvatar = null;
    document.querySelectorAll('.bf-av-pick').forEach(function(b){
      b.innerHTML = '<span class="bf-av-ph">?</span>';
      b.classList.add('bf-av-empty');
    });
  }

  // ---- Auto-rellena el avatar según el nick escrito ----
  // Si el nick tiene avatar en la BD → lo auto-rellena. Si NO lo tiene (y la
  // BD ya se cargó) → limpia el avatar anterior para que el jugador elija uno
  // nuevo: no puede entrar a la sala con el avatar de otro nick.
  function checkNickAvatar(input) {
    var nick = (input.value || '').trim();
    if (!nick) { input.dataset.bfLastNick = ''; return; }
    if (nick === input.dataset.bfLastNick) return;
    input.dataset.bfLastNick = nick;
    var pa = window.__bfPlayerAvatars || {};
    // Búsqueda case-insensitive: la BD puede tener "Congresito" y el jugador
    // escribir "congresito".
    var avUrl = pa[nick] || pa[nick.toLowerCase()] || pa[nick.toUpperCase()];
    if (!avUrl) {
      for (var k in pa) { if (k.toLowerCase() === nick.toLowerCase()) { avUrl = pa[k]; break; } }
    }
    if (avUrl) {
      saveAv({ url: avUrl, name: '' });
      document.querySelectorAll('.bf-av-pick').forEach(function(b){
        var av = window.bfMyAvatar;
        if (av && av.url) { b.innerHTML = '<img src="' + av.url + '">'; b.classList.remove('bf-av-empty'); }
        else { b.innerHTML = '<span class="bf-av-ph">?</span>'; b.classList.add('bf-av-empty'); }
      });
      injectScoreAvatars();
      injectResultAvatars();
    } else if (window.__bfPlayerAvatarsLoaded) {
      // El nick no tiene avatar en la BD: limpia el avatar anterior para que
      // el jugador elija uno nuevo (no puede entrar con el avatar de otro nick).
      clearAv();
    }
  }

  // ---- Botón de avatar junto a los campos de nick ----
  function renderPickers() {
    ['p1name','hname','jname','jlname'].forEach(function(id){
      var input = document.getElementById(id);
      if (!input) return;
      checkNickAvatar(input);
      if (input.dataset.bfAv === '1') return;
      input.dataset.bfAv = '1';
      input.addEventListener('input', function(){ checkNickAvatar(input); });
      var row = input.closest('.ig') || input.parentElement;
      if (!row || row.dataset.bfAvRow === '1') return;
      row.dataset.bfAvRow = '1';
      var btn = document.createElement('div');
      btn.className = 'bf-av-pick';
      function refresh(){
        var av = window.bfMyAvatar;
        if (av && av.url) { btn.innerHTML = '<img src="' + av.url + '">'; btn.classList.remove('bf-av-empty'); }
        else { btn.innerHTML = '<span class="bf-av-ph">?</span>'; btn.classList.add('bf-av-empty'); }
      }
      refresh();
      btn.title = L('Elige tu avatar', 'Choose your avatar');
      btn.onclick = function(e){ e.preventDefault(); e.stopPropagation(); openModal(); };
      row.insertBefore(btn, row.firstChild);
      // Resalta el botón con pulso dorado cuando no hay avatar elegido.
      if (!window.bfMyAvatar || !window.bfMyAvatar.url) btn.classList.add('bf-av-empty');
      else btn.classList.remove('bf-av-empty');
    });
  }
  new MutationObserver(renderPickers).observe(document.documentElement, { childList:true, subtree:true });
  setInterval(renderPickers, 600);

  // ---- Avatar OBLIGATORIO: bloquea startVsAI, localStart, hostCreate,
  // clientJoin si no hay avatar elegido. Se instala después de nickRequired
  // (que envuelve las mismas funciones con su flag __bfNick), así ambos
  // chequeos (nick + avatar) deben pasar para continuar.
  // Registro global: cada función se envuelve UNA sola vez, aunque otros
  // parches (nick, contraseña) envuelvan por encima y oculten el flag.
  window.__bfAvReqWrapped=window.__bfAvReqWrapped||{};
  function hookRequired(){
    function wrap(name, getInput){
      if(typeof window[name]!=='function'||window.__bfAvReqWrapped[name])return false;
      window.__bfAvReqWrapped[name]=1;
      var orig=window[name];
      window[name]=function(){
        // El avatar NO es obligatorio para empezar a jugar: si el jugador no
        // eligió uno, se auto-asigna el primero del catálogo (para que el
        // ranking siga mostrando un avatar) y se prosigue directo a la subasta,
        // sin abrir el modal que bloqueaba el inicio.
        if(!window.bfMyAvatar||!window.bfMyAvatar.url){
          var pool=(window.__bfAvatarCatalog||[]).length?window.__bfAvatarCatalog:(window.__bfHeroAvatars||[]);
          if(pool.length&&pool[0]&&pool[0].url){ saveAv({url:pool[0].url,name:pool[0].name||''}); }
        }
        return orig.apply(this,arguments);
      };
      window[name].__bfAvReq=1;
      return true;
    }
    wrap('startVsAI',function(){return document.getElementById('p1name');});
    wrap('localStart',function(){return document.getElementById('p1name');});
    wrap('hostCreate',function(){return document.getElementById('hname')||document.querySelector('#s-lobby input[id*="name" i]');});
    wrap('clientJoin',function(){return document.getElementById('jname')||document.getElementById('jlname')||document.querySelector('#s-lobby input[id*="name" i]');});
    // doJoinFromList es el botón "Entrar" del modal al unirse desde la lista
    // de salas. Lo envolvemos para que NO cierre el modal antes de que el
    // jugador elija avatar: sin esto, el modal se cierra y abre el de avatar
    // encima, perdiendo el contexto de la sala.
    wrap('doJoinFromList',function(){return document.getElementById('jlname');});
  }
  hookRequired();
  var _bfAvReqTries=0,_bfAvReqIv=setInterval(function(){hookRequired();if(_bfAvReqTries++>100)clearInterval(_bfAvReqIv);},200);

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