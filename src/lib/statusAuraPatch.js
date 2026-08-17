// Estados de batalla visuales ÉPICOS: degradado temático + etiqueta + patrones
// SVG (telarañas, cadenas, noche estrellada, escarcha...) en CSS puro sobre las
// clases nativas del juego (s-cursed, s-paralyzed, s-sleeping...), siempre
// presentes en cada repintado. Además, decoraciones animadas (arañas, velas,
// Zzz, osito, grilletes, copos...) gestionadas por JS y repuestas al instante
// por el hook a renderBattle. Agonía ≤10% → velo rojo.
export const STATUS_AURA_PATCH = `
<script>
(function(){
  if(window.__bfStatusAuraPatch)return;
  window.__bfStatusAuraPatch=true;

  // Patrones SVG (data-URI) reutilizables. Encode: < > #.
  var WEB_TL = "url(\\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='110' height='110'%3E%3Cg stroke='%23ff45c8' stroke-width='.9' fill='none' opacity='.55'%3E%3Cpath d='M0,0 L110,0 M0,0 L0,110 M0,0 L110,110 M0,0 L55,110 M0,0 L110,55'/%3E%3Cpath d='M24,0 Q24,24 0,24 M48,0 Q48,48 0,48 M74,0 Q74,74 0,74 M98,0 Q98,98 0,98'/%3E%3C/g%3E%3C/svg%3E\\")";
  var WEB_BR = "url(\\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='110' height='110'%3E%3Cg stroke='%23ff45c8' stroke-width='.9' fill='none' opacity='.45'%3E%3Cpath d='M110,110 L0,110 M110,110 L110,0 M110,110 L0,0 M110,110 L55,0 M110,110 L0,55'/%3E%3Cpath d='M86,110 Q86,86 110,86 M62,110 Q62,62 110,62 M36,110 Q36,36 110,36 M12,110 Q12,12 110,12'/%3E%3C/g%3E%3C/svg%3E\\")";
  var CHAIN = "url(\\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='46' height='18'%3E%3Cg fill='none' stroke='%23bde8ff' stroke-width='2.4' opacity='.55'%3E%3Cellipse cx='12' cy='9' rx='8.5' ry='5'/%3E%3Cellipse cx='34' cy='9' rx='8.5' ry='5'/%3E%3C/g%3E%3C/svg%3E\\")";
  var STARS = "url(\\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Cg fill='%23c792ff' opacity='.55'%3E%3Ccircle cx='12' cy='12' r='1.1'/%3E%3Ccircle cx='50' cy='24' r='1.4'/%3E%3Ccircle cx='30' cy='52' r='.9'/%3E%3Ccircle cx='64' cy='60' r='1'/%3E%3Ccircle cx='18' cy='68' r='.8'/%3E%3C/g%3E%3C/svg%3E\\")";
  var FROST = "url(\\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cg stroke='%2375e8ff' stroke-width='.8' opacity='.5'%3E%3Cpath d='M20,4 L20,36 M4,20 L36,20 M8,8 L32,32 M32,8 L8,32'/%3E%3C/g%3E%3C/svg%3E\\")";
  var HOLY = "url(\\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cg stroke='%23ffe58a' stroke-width='1' opacity='.55'%3E%3Cpath d='M20,6 L20,34 M6,20 L34,20 M10,10 L30,30 M30,10 L10,30'/%3E%3C/g%3E%3C/svg%3E\\")";

  // Estados: clase, color, icono, etiqueta, degradado, filtro del arte, patrón
  // de fondo (::before) y decoraciones animadas (JS, repuestas por el hook).
  var STATES=[
    {cls:'s-cursed',c:'#ff45c8',d:'#4e063b',ic:'☠',lb:'MALDITO',
     grad:'linear-gradient(135deg,rgba(78,6,59,.55),rgba(28,4,22,.78))',
     filt:'saturate(1.25) hue-rotate(260deg) drop-shadow(0 0 15px #ff45c8)',
     pat:WEB_TL+' left top/110px 110px no-repeat,'+WEB_BR+' right bottom/110px 110px no-repeat,'+'radial-gradient(circle at 50% 60%,rgba(255,69,200,.2),transparent 65%)',
     decor:[{t:'spider',e:'🕷',x:'10%',y:'22%'},{t:'spider',e:'🕷',x:'82%',y:'68%'},{t:'candle',e:'🕯',x:'6%',y:'80%'},{t:'candle',e:'🕯',x:'90%',y:'34%'},{t:'bug',e:'🦋',x:'70%',y:'12%'}]},
    {cls:'s-paralyzed',c:'#bde8ff',d:'#14324b',ic:'⛓',lb:'PARALIZADO',
     grad:'linear-gradient(135deg,rgba(20,50,75,.5),rgba(8,18,32,.78))',
     filt:'saturate(.55) brightness(.92) drop-shadow(0 0 14px #bde8ff)',
     pat:CHAIN+' left center/46px 18px repeat-x,'+CHAIN+' right center/46px 18px repeat-x,'+'linear-gradient(180deg,rgba(189,232,255,.08),transparent 40%)',
     decor:[{t:'chain',e:'⛓',x:'48%',y:'-8%'},{t:'shackle',e:'🔒',x:'8%',y:'84%'},{t:'shackle',e:'🔒',x:'86%',y:'84%'}]},
    {cls:'s-sleeping',c:'#c792ff',d:'#31145b',ic:'💤',lb:'DORMIDO',
     grad:'linear-gradient(135deg,rgba(49,20,91,.5),rgba(20,10,40,.78))',
     filt:'saturate(.65) brightness(.72) drop-shadow(0 0 13px #c792ff)',
     pat:STARS+' left top/80px 80px no-repeat,'+STARS+' right bottom/80px 80px no-repeat,'+'radial-gradient(circle at 50% 40%,rgba(199,146,255,.15),transparent 70%)',
     decor:[{t:'zzz',e:'Z',x:'62%',y:'28%',sz:18,d:0},{t:'zzz',e:'z',x:'70%',y:'20%',sz:14,d:.8},{t:'zzz',e:'z',x:'76%',y:'13%',sz:11,d:1.6},{t:'bear',e:'🧸',x:'14%',y:'74%'}]},
    {cls:'s-blessed',c:'#ffe58a',d:'#55400b',ic:'✦',lb:'BENDITO',
     grad:'linear-gradient(135deg,rgba(85,64,11,.42),rgba(40,30,5,.72))',
     filt:'saturate(1.2) brightness(1.16) drop-shadow(0 0 16px #ffe58a)',
     pat:HOLY+' center/40px 40px no-repeat,'+HOLY+' left top/40px 40px no-repeat,'+HOLY+' right bottom/40px 40px no-repeat',
     decor:[{t:'sparkle',e:'✨',x:'18%',y:'20%'},{t:'sparkle',e:'✨',x:'82%',y:'70%'}]},
    {cls:'s-frozen',c:'#75e8ff',d:'#073a53',ic:'❄',lb:'CONGELADO',
     grad:'linear-gradient(135deg,rgba(7,58,83,.5),rgba(10,30,45,.78))',
     filt:'saturate(.7) brightness(.95) hue-rotate(-12deg) drop-shadow(0 0 15px #75e8ff)',
     pat:FROST+' left top/40px 40px no-repeat,'+FROST+' right bottom/40px 40px no-repeat,'+FROST+' center/60px 60px no-repeat,'+'repeating-linear-gradient(45deg,rgba(160,230,255,.16) 0 6px,transparent 6px 18px)',
     decor:[{t:'snow',e:'❄',x:'24%',y:'16%'},{t:'snow',e:'❄',x:'72%',y:'62%'},{t:'snow',e:'❄',x:'44%',y:'82%'}]},
    {cls:'s-tank',c:'#ffb43a',d:'#5a3f04',ic:'🛡',lb:'TANQUEANDO',
     grad:'linear-gradient(135deg,rgba(255,140,30,.42),rgba(80,40,5,.72))',
     filt:'saturate(1.15) contrast(1.08) drop-shadow(0 0 16px #ffb43a)',
     pat:'radial-gradient(circle,rgba(255,170,60,.5) 1.5px,transparent 2px) center/22px 22px,'+'linear-gradient(135deg,rgba(255,140,30,.42),rgba(80,40,5,.72))',
     decor:[{t:'shield',e:'🛡',x:'50%',y:'50%',sz:22}]},
    {cls:'bf-state-confused',c:'#ffe65a',d:'#544405',ic:'★',lb:'CONFUSO',
     grad:'linear-gradient(135deg,rgba(84,68,5,.45),rgba(40,32,4,.72))',
     filt:'saturate(.85) sepia(.35) drop-shadow(0 0 15px #ffe65a)',
     pat:'repeating-conic-gradient(from 0deg at 50% 50%,rgba(255,230,90,.12),transparent 30deg)',
     decor:[{t:'star',e:'★',x:'24%',y:'24%'},{t:'star',e:'★',x:'76%',y:'74%'}]},
    {cls:'bf-state-drunk',c:'#b8ec72',d:'#29470b',ic:'◉',lb:'BORRACHO',
     grad:'linear-gradient(135deg,rgba(41,71,11,.45),rgba(20,34,6,.72))',
     filt:'saturate(1.25) hue-rotate(18deg) drop-shadow(0 0 15px #b8ec72)',
     pat:'radial-gradient(circle,rgba(184,236,114,.35) 2px,transparent 3px) center/26px 26px',
     decor:[{t:'bubble',e:'🍺',x:'18%',y:'72%'},{t:'bubble',e:'💧',x:'78%',y:'22%'}]},
    {cls:'bf-state-dizzy',c:'#72f0b5',d:'#0b4934',ic:'🌀',lb:'MAREADO',
     grad:'linear-gradient(135deg,rgba(11,73,52,.45),rgba(6,34,24,.72))',
     filt:'saturate(.7) hue-rotate(65deg) blur(.35px) drop-shadow(0 0 16px #72f0b5)',
     pat:'repeating-conic-gradient(from 0deg at 50% 50%,rgba(114,240,181,.14),transparent 20deg)',
     decor:[{t:'spiral',e:'🌀',x:'50%',y:'50%',sz:20}]}
  ];

  var css='.bhero{position:relative!important}';
  STATES.forEach(function(s){
    css+=
      '.bhero.'+s.cls+'{--bf-state:'+s.c+';--bf-state-dark:'+s.d+';box-shadow:0 0 0 3px '+s.c+',0 0 28px '+s.c+'99,0 0 52px '+s.c+'55!important}'+
      '.bhero.'+s.cls+' .bf-battle-art{filter:'+s.filt+'!important}'+
      '.bhero.'+s.cls+'::before{content:"";position:absolute;inset:0;z-index:4;pointer-events:none;border-radius:inherit;background:'+s.grad+';mix-blend-mode:normal;opacity:.82}'+
      '.bhero.'+s.cls+' .bf-pat{position:absolute;inset:0;z-index:5;pointer-events:none;border-radius:inherit;background:'+s.pat+';opacity:.9}'+
      '.bhero.'+s.cls+'::after{content:"'+s.ic+' '+s.lb+'";position:absolute;top:6px;right:8px;left:auto;z-index:16;display:inline-flex;align-items:center;gap:5px;padding:3px 12px;border-radius:999px;background:linear-gradient(180deg,#141026f2,#05040be6);border:2px solid '+s.c+';color:'+s.c+';font-family:Cinzel,serif;font-size:12px;font-weight:1000;letter-spacing:.4px;text-transform:uppercase;text-shadow:0 0 10px '+s.c+',0 2px 4px #000;box-shadow:0 2px 10px rgba(0,0,0,.6),0 0 16px '+s.c+',inset 0 0 12px '+s.d+';white-space:nowrap}';
  });
  // Animación de borde de estado + scanlines deslizantes
  css+='@keyframes bfStateEdge{0%,100%{box-shadow:0 0 0 3px var(--bf-state),0 0 20px var(--bf-state)77,0 0 40px var(--bf-state)44!important}50%{box-shadow:0 0 0 3px var(--bf-state),0 0 36px var(--bf-state)cc,0 0 64px var(--bf-state)66!important}}@keyframes bfScanMove{0%{background-position:0 0,0 0,0 0,0 0,0 0,0 0}100%{background-position:0 40px,0 40px,0 40px,0 40px,0 40px,0 40px}}';
  // Ocultar badge nativo duplicado.
  css+='.bhero.s-cursed>.bf-status-badge,.bhero.s-paralyzed>.bf-status-badge,.bhero.s-sleeping>.bf-status-badge,.bhero.s-blessed>.bf-status-badge,.bhero.s-frozen>.bf-status-badge,.bhero.s-tank>.bf-status-badge,.bhero.bf-state-confused>.bf-status-badge,.bhero.bf-state-drunk>.bf-status-badge,.bhero.bf-state-dizzy>.bf-status-badge{display:none!important}';

  // ---- Decoraciones animadas (capa JS) ----
  css+=
    '.bf-decor-layer{position:absolute;inset:0;z-index:6;pointer-events:none;overflow:hidden;border-radius:inherit}'+
    '.bf-decor{position:absolute;transform:translate(-50%,-50%);line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.7))}'+
    '.bf-decor-spider{animation:bfCrawl 5s ease-in-out infinite}'+
    '.bf-decor-bug{animation:bfBug 6s ease-in-out infinite}'+
    '.bf-decor-candle{animation:bfFlicker 1.3s ease-in-out infinite}'+
    '.bf-decor-chain{font-size:26px;transform-origin:top center;animation:bfSway 3.2s ease-in-out infinite}'+
    '.bf-decor-shackle{font-size:20px;animation:bfClink 2.5s ease-in-out infinite}'+
    '.bf-decor-zzz{font-weight:900;color:#fff;text-shadow:0 0 8px #c792ff,0 2px 4px #000;animation:bfFloatZ 3.4s ease-out infinite}'+
    '.bf-decor-bear{font-size:24px;animation:bfBob 3.2s ease-in-out infinite}'+
    '.bf-decor-sparkle{font-size:18px;animation:bfTwinkle 2.2s ease-in-out infinite}'+
    '.bf-decor-snow{font-size:18px;animation:bfSnow 4s ease-in-out infinite}'+
    '.bf-decor-shield{animation:bfShieldPulse 2s ease-in-out infinite}'+
    '.bf-decor-star{font-size:20px;color:#ffe65a;text-shadow:0 0 8px #ffe65a;animation:bfSpin 3s linear infinite}'+
    '.bf-decor-bubble{font-size:18px;animation:bfRise 4s ease-in-out infinite}'+
    '.bf-decor-spiral{font-size:22px;animation:bfSpin 2.4s linear infinite}'+
    '@keyframes bfCrawl{0%,100%{transform:translate(-50%,-50%) rotate(0)}25%{transform:translate(calc(-50% + 10px),calc(-50% + 5px)) rotate(18deg)}50%{transform:translate(calc(-50% + 5px),calc(-50% + 12px)) rotate(-12deg)}75%{transform:translate(calc(-50% - 8px),calc(-50% + 7px)) rotate(22deg)}}'+
    '@keyframes bfBug{0%,100%{transform:translate(-50%,-50%) rotate(0)}33%{transform:translate(calc(-50% + 14px),calc(-50% - 8px)) rotate(20deg)}66%{transform:translate(calc(-50% - 6px),calc(-50% + 10px)) rotate(-15deg)}}'+
    '@keyframes bfFlicker{0%,100%{opacity:.7;transform:translate(-50%,-50%) scale(1)}45%{opacity:1;transform:translate(-50%,-50%) scale(1.18)}55%{opacity:.8;transform:translate(-50%,-50%) scale(.95)}}'+
    '@keyframes bfSway{0%,100%{transform:translateX(-50%) rotate(-7deg)}50%{transform:translateX(-50%) rotate(7deg)}}'+
    '@keyframes bfClink{0%,100%{transform:translate(-50%,-50%) rotate(-4deg)}50%{transform:translate(-50%,-50%) rotate(4deg)}}'+
    '@keyframes bfFloatZ{0%{transform:translate(-50%,-50%) scale(.5);opacity:0}25%{opacity:1}100%{transform:translate(-50%,calc(-50% - 44px)) scale(1.3);opacity:0}}'+
    '@keyframes bfBob{0%,100%{transform:translate(-50%,-50%) rotate(-6deg)}50%{transform:translate(-50%,-50%) rotate(6deg)}}'+
    '@keyframes bfTwinkle{0%,100%{opacity:.4;transform:translate(-50%,-50%) scale(.8)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.2)}}'+
    '@keyframes bfSnow{0%,100%{transform:translate(-50%,-50%) rotate(0)}50%{transform:translate(calc(-50% + 6px),calc(-50% + 10px)) rotate(180deg)}}'+
    '@keyframes bfShieldPulse{0%,100%{opacity:.55;transform:translate(-50%,-50%) scale(.92)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.08)}}'+
    '@keyframes bfSpin{from{transform:translate(-50%,-50%) rotate(0)}to{transform:translate(-50%,-50%) rotate(360deg)}}'+
    '@keyframes bfRise{0%{transform:translate(-50%,-50%) translateY(0);opacity:.5}50%{opacity:1}100%{transform:translate(-50%,-50%) translateY(-20px);opacity:0}}'+
    '@keyframes bfAuraPulse{0%,100%{opacity:.6}50%{opacity:1}}@keyframes bfStateBanner{0%,100%{box-shadow:0 2px 10px rgba(0,0,0,.6),0 0 12px var(--bf-state),inset 0 0 12px var(--bf-state-dark);filter:brightness(1)}50%{box-shadow:0 2px 10px rgba(0,0,0,.6),0 0 28px var(--bf-state),0 0 44px var(--bf-state),inset 0 0 16px var(--bf-state-dark);filter:brightness(1.25)}}';
  // Agonía
  css+=
    ''+
    '.bhero.bf-agonizing .bf-agonize-badge{position:absolute;left:150px;bottom:7px;z-index:17;display:inline-flex;align-items:center;gap:5px;padding:2px 9px;border-radius:999px;font-family:Cinzel,serif;font-size:10px;font-weight:1000;letter-spacing:.5px;text-transform:uppercase;color:#ffd0d0;background:linear-gradient(180deg,#3a0606f2,#1a0202e6);border:1.5px solid #ff4040;box-shadow:0 0 12px rgba(255,40,40,.7),inset 0 0 8px rgba(120,0,0,.6)}'+
    '@keyframes bfAgonPulse{0%,100%{opacity:.6;filter:brightness(1)}50%{opacity:1;filter:brightness(1.12)}}@keyframes bfAgonBadge{0%,100%{box-shadow:0 0 8px rgba(255,40,40,.5);transform:scale(1)}50%{box-shadow:0 0 18px rgba(255,40,40,.95);transform:scale(1.06)}}';
  // Ability burst
  css+='.bf-ability-burst{position:absolute;inset:0;z-index:30;pointer-events:none;display:flex;align-items:center;justify-content:center;border-radius:inherit;overflow:hidden;background:radial-gradient(circle,rgba(255,255,255,.42),rgba(114,240,181,.2) 35%,transparent 70%);animation:bfAbilityBurst 1.25s ease-out forwards}.bf-ability-burst b{padding:8px 13px;border-radius:999px;background:#080711e8;border:2px solid currentColor;font-family:Cinzel,serif;font-size:14px;color:#ffe27a;text-shadow:0 0 10px currentColor;box-shadow:0 0 22px currentColor}.bf-ability-burst i{position:absolute;font-style:normal;font-size:28px;animation:bfAbilityOrbit 1.1s ease-out forwards}.bf-ability-burst i:nth-child(2){transform:rotate(120deg) translateX(58px)}.bf-ability-burst i:nth-child(3){transform:rotate(240deg) translateX(58px)}@keyframes bfAbilityBurst{0%{opacity:0;transform:scale(.55)}25%{opacity:1;transform:scale(1.04)}100%{opacity:0;transform:scale(1.18)}}@keyframes bfAbilityOrbit{0%{opacity:0;filter:blur(5px)}35%{opacity:1}100%{opacity:0;transform:rotate(420deg) translateX(78px)}}';
  // ---- ESTABILIDAD EN TABLET ----
  // Las decoraciones de estado (arañas, copos, Zzz, grilletes…) se quedan
  // QUIETAS: sus animaciones infinitas repintaban el recuadro del héroe sin
  // parar y provocaban parpadeo en tablet. Se mantienen visibles, sin moverse.
  // Igual con las transiciones del recuadro al cambiar de turno/estado: nada
  // de crecer/encogerse continuamente.
  css+='.bf-decor{animation:none!important}'+
       '.bhero,.bhero .bf-battle-art,.bhero .bf-bscene-portrait{transition:none!important}'+
       '.bhero .bf-battle-art,.bhero .bf-bscene-portrait{transform:none!important}';
  // Retrato del héroe LO MÁS GRANDE posible dentro del recuadro. Ya no se
  // reajusta con el turno ni con los estados, así que puede ocupar todo el
  // ancho que cabe sin pisar el nombre, los stats ni las ranuras.
  css+='#s-battle .bhero{padding-left:236px!important}'+
       '#s-battle .bhero .bf-battle-art{width:222px!important}'+
       '#s-battle .bhero.active-turn .bf-battle-art{width:222px!important}'+
       '#s-battle .bhero.bf-bscene .bf-bscene-portrait{width:228px!important;background-position:center 6%!important}'+
       '#s-battle .bhero.bf-agonizing .bf-agonize-badge{left:228px!important}';
  var style=document.createElement('style');
  style.textContent=css;
  document.head.appendChild(style);

  var STATE_BY_CLS={}; STATES.forEach(function(s){STATE_BY_CLS[s.cls]=s;});

  function heroFor(card){var m=String(card.id||'').match(/^b_([po])_(.+)$/);return m&&typeof G!=='undefined'&&G.team?(G.team[m[1]]||[]).find(function(h){return h&&h.id===m[2];}):null;}
  function hpRatio(card){var h=heroFor(card);if(h&&h.maxHp>0)return Math.max(0,Math.min(1,h.hp/h.maxHp));var m=String((card.querySelector('.bhero-hpnum')||{}).textContent||'').match(/(\\d+)\\s*\\/\\s*(\\d+)/);if(m)return Math.max(0,Math.min(1,parseInt(m[1],10)/Math.max(1,parseInt(m[2],10))));return 1;}

  function activeStateClass(card){
    var order=['s-cursed','s-paralyzed','s-sleeping','s-blessed','s-frozen','s-tank','bf-state-confused','bf-state-drunk','bf-state-dizzy'];
    for(var i=0;i<order.length;i++) if(card.classList.contains(order[i])) return order[i];
    return '';
  }

  // Crea/actualiza la capa de patrón SVG (.bf-pat) + decoraciones animadas.
  // Solo para la clase activa; se repone tras cada renderBattle vía hook.
  function buildLayer(card,cls){
    var s=cls&&STATE_BY_CLS[cls]; if(!s){ return; }
    // patrón
    var pat=card.querySelector('.bf-pat'); if(!pat){ pat=document.createElement('div'); pat.className='bf-pat'; card.appendChild(pat); }
    // decoraciones
    var layer=card.querySelector('.bf-decor-layer');
    if(!layer){ layer=document.createElement('div'); layer.className='bf-decor-layer'; card.appendChild(layer); }
    else layer.innerHTML='';
    (s.decor||[]).forEach(function(d){
      var el=document.createElement('div');
      el.className='bf-decor bf-decor-'+d.t;
      el.textContent=d.e;
      el.style.left=d.x; el.style.top=d.y;
      if(d.sz) el.style.fontSize=d.sz+'px';
      if(d.d) el.style.animationDelay=d.d+'s';
      layer.appendChild(el);
    });
  }
  function clearLayer(card){
    var pat=card.querySelector('.bf-pat'); if(pat)pat.remove();
    var layer=card.querySelector('.bf-decor-layer'); if(layer)layer.remove();
  }

  function decorate(){
    document.querySelectorAll('.bhero[id^="b_"]').forEach(function(card){
      var h=heroFor(card);
      var odd = h&&h._bfConfused>0?'bf-state-confused':h&&h._bfDrunk>0?'bf-state-drunk':h&&h._bfDizzy>0?'bf-state-dizzy':'';
      ['bf-state-confused','bf-state-drunk','bf-state-dizzy'].forEach(function(c){ if(c===odd)return; if(card.classList.contains(c))card.classList.remove(c); });
      if(odd&&!card.classList.contains(odd))card.classList.add(odd);
      // patrón + decoraciones según estado activo
      var cls=activeStateClass(card);
      var hasLayer=!!card.querySelector('.bf-pat');
      if(cls && !hasLayer) buildLayer(card,cls);
      else if(!cls && hasLayer) clearLayer(card);
      else if(cls && hasLayer && card.querySelector('.bf-pat').dataset.bfFor!==cls){ clearLayer(card); buildLayer(card,cls); }
      if(cls && card.querySelector('.bf-pat')) card.querySelector('.bf-pat').dataset.bfFor=cls;
      // Agonía
      var alive=h?h.alive:!card.classList.contains('dead');
      var r=hpRatio(card), agonizing=alive&&r>0&&r<=0.10;
      if(agonizing)card.classList.add('bf-agonizing');else if(card.classList.contains('bf-agonizing'))card.classList.remove('bf-agonizing');
      var ab=card.querySelector('.bf-agonize-badge');
      if(agonizing&&!ab){ab=document.createElement('div');ab.className='bf-agonize-badge';ab.innerHTML='🩸 AGONIZANDO';card.appendChild(ab);}
      else if(!agonizing&&ab)ab.remove();
    });
  }

  function hookRender(){ if(typeof window.renderBattle!=='function'||window.renderBattle.__bfAura)return; var o=window.renderBattle; window.renderBattle=function(){ o.apply(this,arguments); try{decorate();}catch(e){} }; window.renderBattle.__bfAura=1; }

  function abilityBurst(side,hero,label,icons,color){var card=document.getElementById('b_'+side+'_'+hero.id);if(!card)return;var fx=document.createElement('div');fx.className='bf-ability-burst';fx.style.color=color||'#ffe27a';fx.innerHTML='<b>'+label+'</b><i>'+icons[0]+'</i><i>'+icons[1]+'</i><i>'+icons[2]+'</i>';card.appendChild(fx);setTimeout(function(){if(fx.parentNode)fx.remove();},1300);}
  function installAbilities(){
    if(typeof window.useAbility!=='function')return false;
    if(window.useAbility.__bfOddStates)return true;
    var original=window.useAbility;
    window.useAbility=function(side,hero,done){
      var kind=hero&&hero.akind,isNoEffect=kind==='tk_none'||(kind==='tk_dizzy'&&!hero.eliteMode);
      if(!hero||(!isNoEffect&&kind!=='tk_confuse'&&kind!=='tk_drunk'&&kind!=='tk_dizzy'))return original.apply(this,arguments);
      function complete(){hero.abilityUsed=true;decorate();if(typeof done==='function')done();else if(typeof finishAct==='function')finishAct();}
      if(isNoEffect){abilityBurst(side,hero,'✦ '+(hero.eliteMode?(hero.eAbility||hero.ability):(hero.ability||'HABILIDAD')),['✨','👞','💫'],'#ffe27a');if(typeof pushLog==='function')pushLog('li','✦ '+hero.name+' usa '+(hero.eliteMode?(hero.eAbility||hero.ability):hero.ability)+'. Es espectacular, pero no altera la batalla.');complete();return;}
      var foes=typeof enemySide==='function'?enemySide(side):(side==='p'?'o':'p');
      if(kind==='tk_dizzy'){var turns=hero.eliteMode?3:2,targets=(typeof G!=='undefined'&&G.team&&G.team[foes]||[]).filter(function(h){return h&&h.alive;});targets.forEach(function(target){target._bfDizzy=Math.max(target._bfDizzy||0,turns);target._mods=target._mods||[];target._mods.push({cc:-4,ad:-4,he:-4,turns:turns});if(typeof pushFx==='function')pushFx({k:'status',side:foes,id:target.id,txt:'🌀'});});abilityBurst(side,hero,'☣ GASES TÓXICOS',['☁','☣','🌀'],'#72f0b5');if(typeof pushLog==='function')pushLog('li','☣ '+hero.name+' marea a todos los rivales: -4 a CC, AD y HE durante '+turns+' turnos.');complete();return;}
      var label=kind==='tk_confuse'?'Rival a confundir':'Rival que beberá el licor';
      if(typeof pendTarget!=='function')return original.apply(this,arguments);
      pendTarget(label,foes,function(target){var turns=hero.eliteMode?3:2;if(kind==='tk_confuse'){target._bfConfused=Math.max(target._bfConfused||0,turns);if(typeof pushLog==='function')pushLog('li','★ '+hero.name+' deja CONFUSO a '+target.name+' durante '+turns+' turnos.');if(typeof pushFx==='function')pushFx({k:'status',side:typeof tSide==='function'?tSide(target):foes,id:target.id,txt:'★'});}else{target._bfDrunk=Math.max(target._bfDrunk||0,turns);target._mods=target._mods||[];target._mods.push({cc:-3,ad:-3,he:-3,turns:turns});if(typeof dealDamage==='function')dealDamage(target,3,{type:'true'});if(typeof pushLog==='function')pushLog('li','◉ '+hero.name+' emborracha a '+target.name+': -3 a sus atributos y 3 de daño.');if(typeof pushFx==='function')pushFx({k:'status',side:typeof tSide==='function'?tSide(target):foes,id:target.id,txt:'◉'});}complete();});
    };
    window.useAbility.__bfOddStates=1;return true;
  }
  function installTurns(){
    if(typeof window.stepTurn!=='function')return false;
    if(window.stepTurn.__bfOddStates)return true;
    var original=window.stepTurn;
    window.stepTurn=function(){if(typeof B!=='undefined'&&B&&!B.over&&B.queue&&B.qi<B.queue.length){var slot=B.queue[B.qi],h=typeof getHero==='function'?getHero(slot.side,slot.id):null;if(h&&h.alive){if(h._bfConfused>0){h._bfConfused--;if(Math.random()<.5){h.skip=Math.max(h.skip||0,1);if(typeof pushLog==='function')pushLog('li','★ '+h.name+' está CONFUSO y pierde el turno.');}}if(h._bfDrunk>0){h._bfDrunk--;if(Math.random()<.35){h.skip=Math.max(h.skip||0,1);if(typeof pushLog==='function')pushLog('li','◉ '+h.name+' está BORRACHO y falla su acción.');}}if(h._bfDizzy>0)h._bfDizzy--;}}return original.apply(this,arguments);};
    window.stepTurn.__bfOddStates=1;return true;
  }

  // Hook a renderBattle + interval de respaldo SUAVE (sin MutationObserver
  // del documento entero — eso causaba parpadeo en móvil/tablet al dispararse
  // con cualquier cambio de DOM y re-inyectar decoraciones).
  var t=0,timer=setInterval(function(){t++;hookRender();installAbilities();installTurns();decorate();if(t>40)clearInterval(timer);},300);
  hookRender();installAbilities();installTurns();decorate();
  setInterval(decorate,2000);
})();
</script>
`;