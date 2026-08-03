// Parche inyectado en el iframe: selector de Nivel de IA en la pantalla de
// "vs IA". El jugador elige el nivel antes de arrancar la partida y la
// estrategia de la IA (aiStrategyPatch) se ajusta según el nivel elegido.
//
// Niveles:
//   - IA Novata     → puja baja, usa pocas habilidades, ataca al más débil
//   - IA Bersérker  → agresiva al máximo, sin estrategia, ataca al más fuerte
//   - IA Estratega  → equilibrada y táctica (recomendada)
//   - IA Némesis    → puja calculada, roba tus héroes, sin piedad
//
// El nivel se guarda en localStorage y sobreescribe los parámetros de
// agresividad/frecuencia de la estrategia recibida del análisis de logs,
// conservando las preferencias de héroes (preferHeroes/avoidHeroes) que sí
// dependen del análisis y mejoran con más partidas.
export const AI_LEVEL_PATCH = `
<script>
(function(){
  if (window.__bfAiLevelPatch) return;
  window.__bfAiLevelPatch = true;

  var isEn = function(){ try { return localStorage.getItem('bfLang') === 'en'; } catch(e) { return false; } };

  var LEVELS = [
    { id: 'novice',     name: 'IA Novata',    name_en: 'AI Novice',    desc: 'Puja bajo, usa pocas habilidades', desc_en: 'Low bids, rarely uses abilities',  bidAggression: 0.30, abilityUsage: 0.30, targetPriority: 'weakest',   purchaseTiming: 'late' },
    { id: 'berserker',  name: 'IA Bersérker', name_en: 'AI Berserker', desc: 'Agresiva al máximo, sin piedad',     desc_en: 'Max aggression, no mercy',          bidAggression: 0.90, abilityUsage: 0.95, targetPriority: 'strongest', purchaseTiming: 'early' },
    { id: 'strategist', name: 'IA Estratega', name_en: 'AI Strategist', desc: 'Equilibrada y táctica (recomendada)', desc_en: 'Balanced and tactical (recommended)', bidAggression: 0.70, abilityUsage: 0.75, targetPriority: 'balanced',  purchaseTiming: 'balanced' },
    { id: 'nemesis',    name: 'IA Némesis',   name_en: 'AI Nemesis',   desc: 'Roba tus héroes, juega perfecto',    desc_en: 'Steals your heroes, plays perfectly', bidAggression: 1.0,  abilityUsage: 1.0,  targetPriority: 'healer',    purchaseTiming: 'balanced' },
  ];

  var KEY = 'bfAiLevel';
  function getLevelId(){ try { return localStorage.getItem(KEY) || 'strategist'; } catch(e) { return 'strategist'; } }
  function getMeta(){ var id = getLevelId(); return LEVELS.find(function(l){ return l.id === id; }) || LEVELS[2]; }
  function setLevel(id){
    try { localStorage.setItem(KEY, id); } catch(e) {}
    var lvl = LEVELS.find(function(l){ return l.id === id; }) || LEVELS[2];
    window.__bfAiLevelMeta = lvl;
    // Aplica el nivel sobre la estrategia ya recibida (si existe).
    if (window.__bfAiStrat) {
      window.__bfAiStrat.bidAggression = lvl.bidAggression;
      window.__bfAiStrat.abilityUsage = lvl.abilityUsage;
      window.__bfAiStrat.targetPriority = lvl.targetPriority;
      window.__bfAiStrat.purchaseTiming = lvl.purchaseTiming;
    }
  }
  window.__bfAiLevelMeta = getMeta();
  window.__bfAiLevels = LEVELS;

  // ---- CSS ----
  var st = document.createElement('style');
  st.textContent = [
    '.bf-level-pick{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:8px 0 4px}',
    '@media(max-width:520px){.bf-level-pick{grid-template-columns:1fr}}',
    '.bf-level-opt{cursor:pointer;text-align:center;padding:11px 8px;border-radius:13px;background:linear-gradient(180deg,rgba(20,14,38,.7),rgba(10,7,20,.8));border:2px solid rgba(255,210,74,.24);transition:transform .14s ease,border-color .14s ease,box-shadow .14s ease}',
    '.bf-level-opt:hover{transform:translateY(-2px);border-color:rgba(255,210,74,.5)}',
    '.bf-level-opt.active{border-color:#ffd24a;box-shadow:0 8px 22px rgba(0,0,0,.5),0 0 22px rgba(255,210,74,.4);background:linear-gradient(180deg,rgba(48,34,84,.78),rgba(20,13,38,.86))}',
    '.bf-level-t{font-family:"Cinzel",serif;font-weight:800;font-size:14px;color:#fff5dc;text-shadow:0 2px 4px #000}',
    '.bf-level-s{margin-top:3px;font-size:10px;color:#cfc6dd;line-height:1.25}',
  ].join('');
  document.head.appendChild(st);

  // ---- Inyecta el selector en la pantalla de "vs IA" ----
  function injectLevelPicker() {
    var input = document.getElementById('p1name');
    if (!input) return;
    var box = input.closest('.setup-box') || input.closest('.screen') || input.parentElement;
    if (!box || box.dataset.bfLevel === '1') return;
    // No inyectar en la pantalla local (tiene p2name)
    if (box.querySelector('#p2name')) return;
    box.dataset.bfLevel = '1';

    var ig = input.closest('.ig') || input.parentElement;
    if (!ig) return;

    var wrap = document.createElement('div');
    wrap.className = 'ig';
    var label = isEn() ? 'AI Difficulty' : 'Nivel de la IA';
    wrap.innerHTML = '<label>' + label + '</label><div class="bf-level-pick"></div>';
    var grid = wrap.querySelector('.bf-level-pick');
    var cur = getLevelId();
    LEVELS.forEach(function(lvl){
      var opt = document.createElement('div');
      opt.className = 'bf-level-opt' + (cur === lvl.id ? ' active' : '');
      opt.innerHTML = '<div class="bf-level-t">' + (isEn() ? lvl.name_en : lvl.name) + '</div>' +
        '<div class="bf-level-s">' + (isEn() ? lvl.desc_en : lvl.desc) + '</div>';
      opt.onclick = function(){
        grid.querySelectorAll('.bf-level-opt').forEach(function(o){ o.classList.remove('active'); });
        opt.classList.add('active');
        setLevel(lvl.id);
      };
      grid.appendChild(opt);
    });
    ig.parentNode.insertBefore(wrap, ig.nextSibling);
  }

  new MutationObserver(injectLevelPicker).observe(document.documentElement, { childList:true, subtree:true });
  if (document.readyState !== 'loading') injectLevelPicker();
  else document.addEventListener('DOMContentLoaded', injectLevelPicker);
  setInterval(injectLevelPicker, 400);

  // ---- Sobreescribe el nombre de la IA con el del nivel ----
  function isAiGame(){
    try {
      if (typeof G === 'undefined' || !G || G.demo) return false;
      if (typeof online === 'function' && online()) return false;
      return !!G.oppHuman ? false : (G.oppHuman === false || (typeof NET === 'undefined' || !NET || !NET.role));
    } catch(e) { return false; }
  }

  function installAiName(){
    if (typeof window.startVsAI !== 'function' || window.startVsAI.__bfLvlName) return;
    var orig = window.startVsAI;
    window.startVsAI = function(){
      var r = orig.apply(this, arguments);
      setTimeout(function(){
        if (typeof G !== 'undefined' && G && G.names) {
          var lvl = window.__bfAiLevelMeta;
          if (lvl) G.names.o = isEn() ? lvl.name_en : lvl.name;
        }
      }, 200);
      return r;
    };
    window.startVsAI.__bfLvlName = 1;
  }
  setInterval(installAiName, 300);

  // Mantiene el nombre del nivel durante la partida (por si el juego lo reescribe).
  setInterval(function(){
    if (!isAiGame()) return;
    if (typeof G === 'undefined' || !G || !G.names) return;
    var lvl = window.__bfAiLevelMeta;
    if (!lvl) return;
    var expected = isEn() ? lvl.name_en : lvl.name;
    if (G.names.o && G.names.o !== expected && G.names.o !== (isEn() ? lvl.name : lvl.name_en)) {
      G.names.o = expected;
    }
  }, 2000);
})();
</script>
`;