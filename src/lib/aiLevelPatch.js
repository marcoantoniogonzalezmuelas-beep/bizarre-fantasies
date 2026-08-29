// Parche inyectado en el iframe: selector de Nivel de IA en la pantalla de
// "vs IA" con SISTEMA DE DESBLOQUEO por victorias.
//
// Niveles y requisitos de desbloqueo:
//   - IA Novata     → SIEMPRE disponible
//   - IA Bersérker  → desbloqueada al ganar 2 partidas vs IA Novata
//   - IA Estratega  → desbloqueada al ganar 3 partidas vs IA Bersérker
//   - IA Némesis    → desbloqueada al ganar 5 partidas vs IA Estratega
//
// El contador de victorias se guarda en localStorage (bfAiWins_{levelId}) y
// se incrementa al ganar una partida contra la IA (hook sobre showResult).
// El nivel seleccionado sobreescribe los parámetros de agresividad de la
// estrategia (aiStrategyPatch), conservando las preferencias de héroes del
// análisis de logs.
export const AI_LEVEL_PATCH = `
<script>
(function(){
  if (window.__bfAiLevelPatch) return;
  window.__bfAiLevelPatch = true;

  var isEn = function(){ try { return localStorage.getItem('bfLang') === 'en'; } catch(e) { return false; } };

  var LEVELS = [
    { id: 'novice',     name: 'IA Novata',    name_en: 'AI Novice',    desc: 'Puja bajo, usa pocas habilidades',       desc_en: 'Low bids, rarely uses abilities',          bidAggression: 0.30, abilityUsage: 0.30, targetPriority: 'weakest',   purchaseTiming: 'late',     unlockReq: 0, prevId: null, avatar: 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/ac6f97a53_generated_image.png' },
    { id: 'berserker',  name: 'IA Bersérker', name_en: 'AI Berserker', desc: 'Agresiva al máximo, sin piedad',           desc_en: 'Max aggression, no mercy',                 bidAggression: 0.90, abilityUsage: 0.95, targetPriority: 'strongest', purchaseTiming: 'early',    unlockReq: 2, prevId: 'novice', avatar: 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/274f7a3e2_generated_image.png' },
    { id: 'strategist', name: 'IA Estratega', name_en: 'AI Strategist', desc: 'Equilibrada y táctica (recomendada)',       desc_en: 'Balanced and tactical (recommended)',       bidAggression: 0.70, abilityUsage: 0.75, targetPriority: 'balanced',  purchaseTiming: 'balanced', unlockReq: 3, prevId: 'berserker', avatar: 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/88ab0dd62_generated_image.png' },
    { id: 'nemesis',    name: 'IA Némesis',   name_en: 'AI Nemesis',   desc: 'Roba tus héroes, juega casi perfecto',      desc_en: 'Steals your heroes, near-perfect play',      bidAggression: 1.0,  abilityUsage: 1.0,  targetPriority: 'healer',    purchaseTiming: 'balanced', unlockReq: 5, prevId: 'strategist', avatar: 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/fd6b3a75e_generated_image.png' },
    { id: 'bizarra',    name: 'IA Bizarra',   name_en: 'Bizarre AI',   desc: 'El caos hecho IA: junta todo lo aprendido. Gánale 10 veces para pasarte el juego', desc_en: 'Chaos made AI: all knowledge combined. Beat it 10 times to beat the game', bidAggression: 1.0, abilityUsage: 1.0, targetPriority: 'healer', purchaseTiming: 'balanced', unlockReq: 5, prevId: 'nemesis', avatar: 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/c2af32041_generated_image.png' },
  ];

  var KEY = 'bfAiLevel';
  function getLevelId(){ try { return localStorage.getItem(KEY) || 'novice'; } catch(e) { return 'novice'; } }
  function getMeta(){ var id = getLevelId(); return LEVELS.find(function(l){ return l.id === id; }) || LEVELS[0]; }
  // Victorias guardadas en la BD por nick (recibidas del padre): persistentes
  // entre dispositivos. localStorage sirve de caché inmediata y fallback.
  window.__bfAiWinsDb = {};
  function getCurrentNick(){
    try {
      var ids = ['p1name','hname','jname'];
      for (var k = 0; k < ids.length; k++) { var el = document.getElementById(ids[k]); if (el && el.value && el.value.trim()) return el.value.trim(); }
      var n = localStorage.getItem('bfMyNick'); if (n) return n;
    } catch(e) {}
    return '';
  }
  function getWins(levelId){
    var lsW = 0; try { lsW = parseInt(localStorage.getItem('bfAiWins_' + levelId) || '0', 10); } catch(e) {}
    var nick = getCurrentNick(); var dbW = 0;
    if (nick && window.__bfAiWinsDb[nick]) dbW = window.__bfAiWinsDb[nick][levelId] || 0;
    return Math.max(lsW, dbW);
  }
  function addWin(levelId){
    var w = getWins(levelId) + 1;
    try { localStorage.setItem('bfAiWins_' + levelId, String(w)); } catch(e) {}
    var nick = getCurrentNick();
    if (nick) { window.__bfAiWinsDb[nick] = window.__bfAiWinsDb[nick] || {}; window.__bfAiWinsDb[nick][levelId] = w; }
    return w;
  }
  function isUnlocked(lvl){ if (!lvl || lvl.unlockReq === 0) return true; return getWins(lvl.prevId) >= lvl.unlockReq; }

  function setLevel(id){
    var lvl = LEVELS.find(function(l){ return l.id === id; }) || LEVELS[0];
    if (!isUnlocked(lvl)) return false;
    try { localStorage.setItem(KEY, id); } catch(e) {}
    window.__bfAiLevelMeta = lvl;
    if (window.__bfAiStrat) {
      window.__bfAiStrat.bidAggression = lvl.bidAggression;
      window.__bfAiStrat.abilityUsage = lvl.abilityUsage;
      window.__bfAiStrat.targetPriority = lvl.targetPriority;
      window.__bfAiStrat.purchaseTiming = lvl.purchaseTiming;
    }
    return true;
  }

  // Al cargar: si el nivel guardado está bloqueado, bajar al más alto disponible.
  (function validate(){
    var lvl = getMeta();
    if (!isUnlocked(lvl)) {
      for (var i = LEVELS.length - 1; i >= 0; i--) {
        if (isUnlocked(LEVELS[i])) { try { localStorage.setItem(KEY, LEVELS[i].id); } catch(e) {} break; }
      }
    }
  })();

  window.__bfAiLevelMeta = getMeta();
  window.__bfAiLevels = LEVELS;
  window.__bfAiGetWins = getWins;
  window.__bfAiIsUnlocked = isUnlocked;

  // Recibe del padre el mapa de victorias por nick (desde la BD) para que los
  // desbloqueos de niveles funcionen entre dispositivos, no solo en este.
  window.addEventListener('message', function(e){
    if (e.data && e.data.bfAiWins && typeof e.data.bfAiWins === 'object') {
      window.__bfAiWinsDb = e.data.bfAiWins;
      lastRenderKey = ''; // fuerza re-render del selector con las victorias de la BD
      injectLevelPicker();
    }
  });

  // ---- CSS ----
  var st = document.createElement('style');
  st.textContent = [
    '.bf-level-pick{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0 4px}',
    '@media(max-width:520px){.bf-level-pick{grid-template-columns:1fr}}',
    '.bf-level-opt{cursor:pointer;text-align:center;padding:11px 8px;border-radius:13px;background:linear-gradient(180deg,rgba(20,14,38,.7),rgba(10,7,20,.8));border:2px solid rgba(255,210,74,.24);transition:transform .14s ease,border-color .14s ease,box-shadow .14s ease;position:relative}',
    '.bf-level-opt:hover{transform:translateY(-2px);border-color:rgba(255,210,74,.5)}',
    '.bf-level-opt.active{border-color:#ffd24a;box-shadow:0 8px 22px rgba(0,0,0,.5),0 0 22px rgba(255,210,74,.4);background:linear-gradient(180deg,rgba(48,34,84,.78),rgba(20,13,38,.86))}',
    '.bf-level-opt.locked{opacity:.5;cursor:not-allowed;filter:grayscale(.5)}',
    '.bf-level-opt.locked:hover{transform:none;border-color:rgba(255,100,100,.4)}',
    '.bf-level-t{font-family:"Cinzel",serif;font-weight:800;font-size:14px;color:#fff5dc;text-shadow:0 2px 4px #000}',
    '.bf-level-s{margin-top:3px;font-size:10px;color:#cfc6dd;line-height:1.25}',
    '.bf-level-lock{margin-top:4px;font-size:11px;color:#ff7a7a;font-weight:700}',
    '.bf-level-wins{margin-top:4px;font-size:11px;color:#ffd24a;font-weight:700}',
    '.bf-level-bar{margin-top:6px;height:5px;border-radius:3px;background:rgba(255,255,255,.1);overflow:hidden}',
    '.bf-level-bar-fill{height:100%;background:linear-gradient(90deg,#ffd24a,#ff9a3c);border-radius:3px;transition:width .3s ease}',
    '.bf-level-av{width:42px;height:42px;border-radius:50%;border:2px solid rgba(255,210,74,.3);overflow:hidden;margin:0 auto 6px;object-fit:cover}',
    '.bf-level-av img{width:100%;height:100%;object-fit:cover}',
    '.bf-level-opt.active .bf-level-av{border-color:#ffd24a;box-shadow:0 0 14px rgba(255,210,74,.45)}',
    '.bf-level-opt.locked .bf-level-av{filter:grayscale(.75) brightness(.45)}',
  ].join('');
  document.head.appendChild(st);

  // ---- Inyecta el selector en la pantalla de "vs IA" ----
  // Es idempotente: crea la estructura una vez y re-renderiza el contenido
  // (victorias, candados) cuando cambian los datos — así refleja el progreso
  // de la BD cuando llega por postMessage o cuando el jugador escribe su nick.
  var lastRenderKey = '';
  function injectLevelPicker() {
    var input = document.getElementById('p1name');
    if (!input) return;
    var box = input.closest('.setup-box') || input.closest('.screen') || input.parentElement;
    if (!box) return;
    if (box.querySelector('#p2name')) return; // No en local

    var grid = box.querySelector('.bf-level-pick');
    if (!grid) {
      // Primera vez: crea el contenedor con el grid.
      var ig = input.closest('.ig') || input.parentElement;
      if (!ig) return;
      var wrap = document.createElement('div');
      wrap.className = 'ig';
      var label = isEn() ? 'AI Difficulty' : 'Nivel de la IA';
      wrap.innerHTML = '<label>' + label + '</label><div class="bf-level-pick"></div>';
      ig.parentNode.insertBefore(wrap, ig.nextSibling);
      grid = wrap.querySelector('.bf-level-pick');
      // Re-renderiza cuando el jugador escribe su nick (las victorias son
      // por nick, así que al cambiar el nick cambian los desbloqueos).
      input.addEventListener('input', function(){ lastRenderKey = ''; injectLevelPicker(); });
    }

    // Solo re-renderiza si cambió el nick o las victorias (evita parpadeo).
    var nick = getCurrentNick();
    var renderKey = nick + '|' + LEVELS.map(function(l){ return l.id + ':' + getWins(l.id) + (isUnlocked(l) ? 'u' : 'l'); }).join(',');
    if (renderKey === lastRenderKey) return;
    lastRenderKey = renderKey;

    var cur = getLevelId();
    grid.innerHTML = '';

    LEVELS.forEach(function(lvl){
      var unlocked = isUnlocked(lvl);
      var opt = document.createElement('div');
      opt.className = 'bf-level-opt' + (cur === lvl.id && unlocked ? ' active' : '') + (unlocked ? '' : ' locked');

      var name = isEn() ? lvl.name_en : lvl.name;
      var desc = isEn() ? lvl.desc_en : lvl.desc;

      var html = '<div class="bf-level-av"><img src="' + lvl.avatar + '"></div>';
      html += '<div class="bf-level-t">' + name + (unlocked ? '' : ' 🔒') + '</div>';
      html += '<div class="bf-level-s">' + desc + '</div>';

      if (unlocked) {
        var w = getWins(lvl.id);
        if (w > 0) html += '<div class="bf-level-wins">' + (isEn() ? 'Wins: ' : 'Victorias: ') + w + '</div>';
      } else {
        var prev = LEVELS.find(function(l){ return l.id === lvl.prevId; });
        var prevName = prev ? (isEn() ? prev.name_en : prev.name) : '';
        var have = getWins(lvl.prevId);
        html += '<div class="bf-level-lock">' + (isEn() ? 'Win ' : 'Gana ') + have + '/' + lvl.unlockReq + ' vs ' + prevName + '</div>';
        html += '<div class="bf-level-bar"><div class="bf-level-bar-fill" style="width:' + Math.min(100, Math.round(have / lvl.unlockReq * 100)) + '%"></div></div>';
      }

      opt.innerHTML = html;
      opt.onclick = function(){
        if (!unlocked) {
          if (typeof notif === 'function') {
            var prev2 = LEVELS.find(function(l){ return l.id === lvl.prevId; });
            var prev2Name = prev2 ? (isEn() ? prev2.name_en : prev2.name) : '';
            notif(isEn() ? ('Locked. Win ' + lvl.unlockReq + ' vs ' + prev2Name + ' first') : ('Bloqueada. Gana ' + lvl.unlockReq + ' vs ' + prev2Name + ' primero'));
          }
          return;
        }
        grid.querySelectorAll('.bf-level-opt').forEach(function(o){ o.classList.remove('active'); });
        opt.classList.add('active');
        setLevel(lvl.id);
      };
      grid.appendChild(opt);
    });
  }

  new MutationObserver(injectLevelPicker).observe(document.documentElement, { childList:true, subtree:true });
  if (document.readyState !== 'loading') injectLevelPicker();
  else document.addEventListener('DOMContentLoaded', injectLevelPicker);
  setInterval(injectLevelPicker, 400);

  // ---- Detectar victorias contra la IA y contarlas ----
  function isAiGame(){
    try {
      if (typeof G === 'undefined' || !G || G.demo) return false;
      if (typeof online === 'function' && online()) return false;
      return !!G.oppHuman ? false : (G.oppHuman === false || (typeof NET === 'undefined' || !NET || !NET.role));
    } catch(e) { return false; }
  }

  function installWinHook(){
    if (typeof window.showResult !== 'function' || window.showResult.__bfWinCount) return;
    var orig = window.showResult;
    window.showResult = function(youWin){
      try {
        if (youWin && isAiGame() && typeof G !== 'undefined' && !G.__bfWinCounted) {
          G.__bfWinCounted = true;
          var lvl = window.__bfAiLevelMeta;
          if (lvl) {
            var newWins = addWin(lvl.id);
            // ¿Se desbloquea un nivel nuevo?
            var nextLvl = LEVELS.find(function(l){ return l.prevId === lvl.id; });
            if (nextLvl && newWins >= nextLvl.unlockReq && getWins(lvl.id) === nextLvl.unlockReq) {
              if (typeof notif === 'function') {
                var nm = isEn() ? nextLvl.name_en : nextLvl.name;
                setTimeout(function(){ notif((isEn() ? 'Unlocked: ' : 'Desbloqueada: ') + nm + ' ⚡'); }, 1200);
              }
              // Cinemática bizarra al PASAR cada nivel de IA (desbloquea el siguiente).
              if (typeof window.__bfBizarreCelebration === 'function') {
                setTimeout(function(){ window.__bfBizarreCelebration(lvl.id + '_complete'); }, 1600);
              }
            }
            // Fin del juego: 10 victorias vs IA Bizarra (cinemática final, más larga).
            if (lvl.id === 'bizarra' && newWins === 10 && typeof window.__bfBizarreCelebration === 'function') {
              setTimeout(function(){ window.__bfBizarreCelebration('game_complete'); }, 1600);
            }
          }
        }
      } catch(e) {}
      return orig.apply(this, arguments);
    };
    window.showResult.__bfWinCount = 1;
  }
  setInterval(installWinHook, 300);

  // ---- Sobreescribe el nombre de la IA con el del nivel ----
  function installAiName(){
    if (typeof window.startVsAI !== 'function' || window.startVsAI.__bfLvlName) return;
    var orig = window.startVsAI;
    window.startVsAI = function(){
      if (typeof G !== 'undefined') G.__bfWinCounted = false;
      var r = orig.apply(this, arguments);
      setTimeout(function(){
        if (typeof G !== 'undefined' && G && G.names) {
          var lvl = window.__bfAiLevelMeta;
          if (lvl) { G.names.o = isEn() ? lvl.name_en : lvl.name; if (lvl.avatar) window.bfOppAvatar = { id: 'ai_' + lvl.id, name: isEn() ? lvl.name_en : lvl.name, url: lvl.avatar }; }
        }
      }, 200);
      return r;
    };
    window.startVsAI.__bfLvlName = 1;
  }
  setInterval(installAiName, 300);

  // Mantiene el nombre del nivel y el avatar durante la partida.
  setInterval(function(){
    if (!isAiGame()) return;
    if (typeof G === 'undefined' || !G || !G.names) return;
    var lvl = window.__bfAiLevelMeta;
    var expected = lvl ? (isEn() ? lvl.name_en : lvl.name) : '';
    // Si el nivel está activo, fuerza su nombre Y su avatar.
    if (lvl && expected && G.names.o && G.names.o !== expected && G.names.o !== (isEn() ? lvl.name : lvl.name_en)) {
      G.names.o = expected;
      if (lvl.avatar) window.bfOppAvatar = { id: 'ai_' + lvl.id, name: expected, url: lvl.avatar };
    }
  }, 2000);

  // Avisa al padre del nivel actual y las victorias (para posible persistencia).
  function notifyParent(){
    try {
      var payload = { bfAiProgress: { level: getLevelId(), nick: getCurrentNick(), wins: {} } };
      LEVELS.forEach(function(l){ payload.bfAiProgress.wins[l.id] = getWins(l.id); });
      window.parent.postMessage(payload, '*');
    } catch(e) {}
  }
  setInterval(notifyParent, 3000);
})();
</script>
`;