// Parche inyectado en el iframe: durante "Aprende a jugar" (la demo IA vs IA)
// aparece un TUTORIAL SECUENCIAL tipo vídeo — un tip a la vez, grande y épico,
// con dedo gótico con anillos y spotlight sobre el elemento. Cada tip se muestra
// ~5s y avanza al siguiente automáticamente. El tip se reposiciona en cada tick
// y al hacer scroll para seguir a su elemento.
export const DEMO_TIPS_PATCH = `
<script>
(function(){
  if(window.__bfDemoTips)return;
  window.__bfDemoTips=true;

  var css=''+
  '#coach{z-index:100000!important}'+
  // Tip container
  '.bf-tut-tip{position:fixed;z-index:99995;display:none;flex-direction:column;align-items:center;pointer-events:none;max-width:360px;font-family:Rubik,system-ui,sans-serif}'+
  '.bf-tut-tip.bf-tut-anim{animation:bfTutIn .45s ease-out}'+
  '@keyframes bfTutIn{from{opacity:0;transform:translateY(12px) scale(.9)}to{opacity:1;transform:none}}'+
  // Pill (gothic: doble borde dorado+púrpura, fondo oscuro, tipografía Cinzel)
  '.bf-tut-pill{position:relative;background:linear-gradient(160deg,rgba(38,24,60,.98),rgba(16,10,32,.99));border:2.5px solid rgba(255,210,74,.65);border-radius:16px;padding:15px 34px 15px 20px;color:#fff5dc;font-weight:700;font-size:16px;line-height:1.45;text-align:center;letter-spacing:.3px;box-shadow:0 10px 30px rgba(0,0,0,.75),0 0 26px rgba(255,210,74,.22),0 0 0 1px rgba(192,107,255,.45);text-shadow:0 1px 4px rgba(0,0,0,.6)}'+
  '.bf-tut-pill b{color:#FFD24A;text-shadow:0 0 8px rgba(255,210,74,.4)}'+
  // Esquinas decorativas góticas
  '.bf-tut-pill::before,.bf-tut-pill::after{content:"";position:absolute;width:14px;height:14px;border:2px solid rgba(255,210,74,.6);pointer-events:none}'+
  '.bf-tut-pill::before{top:-2px;left:-2px;border-right:none;border-bottom:none;border-radius:6px 0 0 0}'+
  '.bf-tut-pill::after{bottom:-2px;right:-2px;border-left:none;border-top:none;border-radius:0 0 6px 0}'+
  // Close button
  '.bf-tut-x{position:absolute;top:-11px;right:-11px;pointer-events:auto;cursor:pointer;color:#2a1800;background:linear-gradient(180deg,#ffe27a,#FFD24A 55%,#c8901f);border:2px solid #6f4809;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900;box-shadow:0 3px 8px rgba(0,0,0,.6),0 0 10px rgba(255,210,74,.4);transition:transform .15s,filter .15s;z-index:5}'+
  '.bf-tut-x:hover{transform:scale(1.15);filter:brightness(1.15)}'+
  // Finger wrap con anillos góticos
  '.bf-tut-finger-wrap{position:relative;display:inline-flex;justify-content:center;align-items:center;animation:bfTutPoke .75s ease-in-out infinite;margin-top:6px}'+
  '.bf-tut-finger-emoji{font-size:48px;line-height:1;filter:drop-shadow(0 5px 12px rgba(0,0,0,.8)) drop-shadow(0 0 8px rgba(255,210,74,.5));position:relative;z-index:2}'+
  // Anillo dorado exterior
  '.bf-tut-ring1{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:46px;height:46px;border:3px solid #FFD24A;border-radius:50%;box-shadow:0 0 14px rgba(255,210,74,.6),inset 0 0 8px rgba(255,210,74,.15);z-index:1;pointer-events:none}'+
  // Anillo púrpura interior con gema
  '.bf-tut-ring2{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:38px;height:38px;border:2px solid rgba(192,107,255,.9);border-radius:50%;box-shadow:0 0 12px rgba(192,107,255,.5);z-index:1;pointer-events:none}'+
  // Gema del anillo (punto brillante)
  '.bf-tut-gem{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) translateY(-19px);width:7px;height:7px;background:radial-gradient(circle,#fff5dc,#FFD24A 50%,#c8901f);border-radius:50%;box-shadow:0 0 10px rgba(255,210,74,.9),0 0 4px #fff;z-index:3;pointer-events:none;animation:bfGemPulse 1.8s ease-in-out infinite}'+
  '@keyframes bfGemPulse{0%,100%{opacity:.6;transform:translate(-50%,-50%) translateY(-19px) scale(.8)}50%{opacity:1;transform:translate(-50%,-50%) translateY(-19px) scale(1.3)}}'+
  '@keyframes bfTutPoke{0%,100%{transform:translate(0,0)}50%{transform:translate(var(--px,0px),var(--py,14px))}}'+
  // Progress dots
  '.bf-tut-dots{display:flex;gap:7px;margin-top:9px;justify-content:center}'+
  '.bf-tut-dot{width:8px;height:8px;border-radius:50%;background:rgba(255,210,74,.2);transition:all .3s}'+
  '.bf-tut-dot.active{background:linear-gradient(180deg,#ffe27a,#FFD24A);box-shadow:0 0 10px rgba(255,210,74,.7);width:22px;border-radius:4px}'+
  // Spotlight
  '.bf-tut-spot{position:fixed;z-index:99991;border-radius:16px;border:3px solid #FFD24A;pointer-events:none;display:none;animation:bfTutSpotGlow 1.5s ease-in-out infinite}'+
  '@keyframes bfTutSpotGlow{0%,100%{box-shadow:0 0 20px rgba(255,210,74,.5),0 0 40px rgba(255,210,74,.2)}50%{box-shadow:0 0 34px rgba(255,210,74,.9),0 0 60px rgba(255,210,74,.4)}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  var EN=!!window.__bfLangEn;
  function T(es,en){return EN?en:es;}

  // Secuencia de tips por pantalla
  var TIPS={
    's-recruit':[
      {id:'bid',sel:['.hcard-bid-zone'],txt:T('💰 Así se puja: ajusta con − / + y pulsa <b>Pujar</b>. ¡Es secreta!','💰 Bidding: adjust with − / + and press <b>Bid</b>. It\\'s secret!')},
      {id:'bidcalc',sel:['div[id^="bidcalc_"]'],has:'bonificador|resta',txt:T('📊 Debajo de las monedas: el <b>bonificador</b> (verde) y el <b>restador</b> del rival (rojo). Abajo, en amarillo, el <b>coste real</b>.','📊 Below the coins: your <b>booster</b> (green) and rival <b>penalty</b> (red). Below in yellow, the <b>real cost</b>.')},
      {id:'bonus',sel:['.bf-bonus-card'],dyn:function(el){
        var x=(el.textContent||'').replace(/\\s+/g,' ').trim();
        x=x.replace(/^.*?(bonificador de esta ronda|this round.s booster)[:\\s·-]*/i,'');
        if(x.length>100)x=x.slice(0,100)+'…';
        var head=T('🎁 <b>Bonificador de esta ronda</b>','🎁 <b>This round\\'s booster</b>');
        return x?head+'<br>'+x:head;
      }},
      {id:'coins',sel:['.coins-row'],has:'subasta|auction',txt:T('🪙 Tus monedas de subasta','🪙 Your auction coins')},
      {id:'eqcoins',sel:['#s-recruit .coins-row'],has:'equipamiento|equipment',txt:T('🪙 Monedas de equipamiento: pásalas a la subasta de 10 en 10','🪙 Equipment coins: move them to the auction 10 at a time')}
    ],
    's-equip':[
      {id:'slot',sel:['.bf-slot-buy'],txt:T('⚔️ Equipa aquí: 1 arma y 1 armadura por héroe','⚔️ Equip here: 1 weapon and 1 armor per hero')},
      {id:'buy',sel:['.bf-buy-btn'],txt:T('🛒 Compra hechizos y objetos: van a tu mano','🛒 Buy spells and items: they go to your hand')},
      {id:'budget',sel:['#s-equip .coins-row'],txt:T('🪙 Tu presupuesto de equipamiento','🪙 Your equipment budget')},
      {id:'eqhand',sel:['.eq-hand-box'],txt:T('🃏 Estas cartas estarán en tu mano durante la batalla','🃏 These cards will be in your hand during battle')}
    ],
    's-battle':[
      {id:'hand',sel:['#hand_p'],txt:T('🃏 Tu mano: los hechizos y objetos que compraste','🃏 Your hand: the spells and items you bought')},
      {id:'bars',sel:['[id^=b_p_]'],txt:T('❤️ Barra verde = vida · 🔵 azul = maná','❤️ Green = health · 🔵 blue = mana')},
      {id:'log',sel:['.b-log-wrap'],txt:T('📜 Registro de combate: aquí se narra la batalla','📜 Combat log: everything is narrated here')}
    ]
  };

  // DOM
  var tipEl=document.createElement('div');tipEl.className='bf-tut-tip';
  tipEl.innerHTML='<div class="bf-tut-pill"><span class="bf-tut-txt"></span><span class="bf-tut-x">✕</span></div><div class="bf-tut-finger-wrap"><div class="bf-tut-ring1"></div><div class="bf-tut-ring2"></div><div class="bf-tut-gem"></div><span class="bf-tut-finger-emoji">👇</span></div><div class="bf-tut-dots"></div>';
  var spotEl=document.createElement('div');spotEl.className='bf-tut-spot';
  var fingerWrap=tipEl.querySelector('.bf-tut-finger-wrap');
  var fingerEmoji=tipEl.querySelector('.bf-tut-finger-emoji');
  document.body.appendChild(spotEl);document.body.appendChild(tipEl);

  // Estado
  var curScreen='';
  var curIdx=0;
  var autoTimer=null;
  var DURATION=10000;
  var lastTxt='';
  var lastDots='';
  // Registro de tips ya mostrados: cada tip se ve UNA sola vez por sesión.
  // Al volver de la resolución de subasta a la pantalla de subastas no se
  // vuelven a enseñar los tips ya vistos.
  var seenTips={};

  function visible(el){
    if(!el)return false;
    var r=el.getBoundingClientRect();
    if(r.width<4||r.height<4)return false;
    if(r.bottom<0||r.top>window.innerHeight||r.right<0||r.left>window.innerWidth)return false;
    var cs=getComputedStyle(el);
    return cs.display!=='none'&&cs.visibility!=='hidden';
  }

  function findEl(t){
    if(!t.sel)return null;
    for(var s=0;s<t.sel.length;s++){
      var cands=document.querySelectorAll(t.sel[s]);
      for(var c=0;c<cands.length;c++){
        if(!visible(cands[c]))continue;
        if(t.has&&!new RegExp(t.has,'i').test(cands[c].textContent))continue;
        return cands[c];
      }
    }
    return null;
  }

  function positionTip(el){
    var vw=window.innerWidth,vh=window.innerHeight;
    var tw=tipEl.offsetWidth||320,th=tipEl.offsetHeight||130;
    var x,y,finger='👇',py='14px';

    if(el){
      var r=el.getBoundingClientRect();
      spotEl.style.display='block';
      spotEl.style.left=Math.round(r.left-7)+'px';
      spotEl.style.top=Math.round(r.top-7)+'px';
      spotEl.style.width=Math.round(r.width+14)+'px';
      spotEl.style.height=Math.round(r.height+14)+'px';

      if(r.bottom+th+20<vh){
        y=r.bottom+14;finger='👆';py='-14px';
      }else if(r.top-th-20>0){
        y=r.top-th-14;finger='👇';py='14px';
      }else{
        y=Math.max(20,(vh-th)/2);finger='👆';py='-14px';
      }
      x=Math.max(10,Math.min(vw-tw-10,r.left+r.width/2-tw/2));
    }else{
      spotEl.style.display='none';
      x=(vw-tw)/2;
      y=(vh-th)/2;
      finger='👇';py='14px';
    }

    fingerEmoji.textContent=finger;
    fingerWrap.style.setProperty('--px','0px');
    fingerWrap.style.setProperty('--py',py);
    tipEl.style.left=Math.round(x)+'px';
    tipEl.style.top=Math.round(y)+'px';
  }

  // Avanza hasta el primer tip no visto de la pantalla actual (o lo deja
  // donde está si ya está sobre uno no visto).
  function firstUnseenIdx(list,from){
    if(!list)return -1;
    for(var i=from;i<list.length;i++){ if(!seenTips[list[i].id]) return i; }
    return -1;
  }

  function showTip(animate){
    var list=TIPS[curScreen];
    if(!list||curIdx>=list.length){hideTip();return;}
    var t=list[curIdx];
    // Marca este tip como visto para que no se repita tras la resolución.
    seenTips[t.id]=true;
    var el=findEl(t);
    var txt=t.dyn&&el?t.dyn(el):(t.txt||'');

    if(lastTxt!==txt){lastTxt=txt;tipEl.querySelector('.bf-tut-txt').innerHTML=txt;}

    var dh='';
    for(var d=0;d<list.length;d++)dh+='<div class="bf-tut-dot'+(d===curIdx?' active':'')+'"></div>';
    if(lastDots!==dh){lastDots=dh;tipEl.querySelector('.bf-tut-dots').innerHTML=dh;}

    tipEl.style.display='flex';
    positionTip(el);

    if(animate){
      tipEl.classList.remove('bf-tut-anim');
      void tipEl.offsetWidth;
      tipEl.classList.add('bf-tut-anim');
    }

    if(autoTimer)clearTimeout(autoTimer);
    autoTimer=setTimeout(advance,DURATION);
  }

  function repositionTip(){
    if(tipEl.style.display!=='flex')return;
    var list=TIPS[curScreen];
    if(!list||curIdx>=list.length)return;
    var el=findEl(list[curIdx]);
    positionTip(el);
  }

  function hideTip(){
    tipEl.style.display='none';
    spotEl.style.display='none';
    if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}
  }

  function advance(){
    var list=TIPS[curScreen];
    if(!list)return;
    curIdx++;
    if(curIdx>=list.length){hideTip();return;}
    showTip(true);
  }

  tipEl.querySelector('.bf-tut-x').addEventListener('click',function(e){
    e.stopPropagation();e.preventDefault();hideTip();
  });

  // Reposicionar al hacer scroll
  var scrollRAF=null;
  window.addEventListener('scroll',function(){
    if(scrollRAF)return;
    scrollRAF=requestAnimationFrame(function(){scrollRAF=null;repositionTip();});
  },true);

  function tick(){
    if(window.__bfDemoTipsPause){if(curScreen!=='__pause'){curScreen='__pause';hideTip();}return;}
    var bt=getComputedStyle(document.body).transform;
    if(bt&&bt!=='none'){if(curScreen!=='__zoom'){curScreen='__zoom';hideTip();}return;}
    var active=document.querySelector('.screen.active');
    if(active&&active.id==='s-title')window.__bfDemoOn=false;
    var demo=false;
    try{demo=!!window.__bfDemoOn;}catch(e){}
    if(!demo){if(curScreen!=='__off'){curScreen='__off';hideTip();}return;}
    if(!active)return;
    var sid=active.id;
    if(sid!==curScreen){
      curScreen=sid;lastTxt='';lastDots='';
      // Empieza en el primer tip de la pantalla que no se haya mostrado aún.
      var start=firstUnseenIdx(TIPS[sid]||[],0);
      curIdx=start<0?(TIPS[sid]&&TIPS[sid].length?TIPS[sid].length:0):start;
      if(TIPS[sid]&&TIPS[sid].length&&start>=0)showTip(true);else hideTip();
    }else{
      repositionTip();
    }
  }

  window.__bfResetDemoTips=function(){curScreen='';curIdx=0;lastTxt='';lastDots='';seenTips={};hideTip();};
  setInterval(tick,350);
})();
</script>
`;