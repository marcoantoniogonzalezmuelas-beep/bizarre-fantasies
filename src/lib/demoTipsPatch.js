// Parche inyectado en el iframe: durante "Aprende a jugar" (la demo IA vs IA)
// aparece un TUTORIAL SECUENCIAL tipo vídeo — un tip a la vez, grande y épico,
// con dedo animado y spotlight sobre el elemento. Cada tip se muestra ~5s y
// avanza al siguiente automáticamente (como un vídeo). El usuario puede cerrar
// con ×. Al cambiar de pantalla, empieza la secuencia de esa pantalla desde 0.
export const DEMO_TIPS_PATCH = `
<script>
(function(){
  if(window.__bfDemoTips)return;
  window.__bfDemoTips=true;

  var css=''+
  '#coach{z-index:100000!important}'+
  '.bf-tut-tip{position:fixed;z-index:99995;display:none;flex-direction:column;align-items:center;pointer-events:none;max-width:340px;font-family:Rubik,system-ui,sans-serif;animation:bfTutIn .4s ease-out}'+
  '@keyframes bfTutIn{from{opacity:0;transform:translateY(10px) scale(.92)}to{opacity:1;transform:none}}'+
  '.bf-tut-pill{position:relative;background:linear-gradient(180deg,rgba(40,28,64,.97),rgba(20,12,38,.98));border:2.5px solid rgba(255,210,74,.7);border-radius:18px;padding:14px 32px 14px 18px;color:#fff5dc;font-weight:700;font-size:16px;line-height:1.4;text-align:center;letter-spacing:.3px;box-shadow:0 8px 28px rgba(0,0,0,.7),0 0 24px rgba(255,210,74,.25)}'+
  '.bf-tut-x{position:absolute;top:-10px;right:-10px;pointer-events:auto;cursor:pointer;color:#3a2600;background:linear-gradient(180deg,#ffe27a,#FFD24A 55%,#c8901f);border:2px solid #6f4809;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900;box-shadow:0 3px 8px rgba(0,0,0,.6)}'+
  '.bf-tut-finger{font-size:44px;line-height:1;margin-top:4px;filter:drop-shadow(0 4px 10px rgba(0,0,0,.7));animation:bfTutPoke .7s ease-in-out infinite}'+
  '@keyframes bfTutPoke{0%,100%{transform:translate(0,0)}50%{transform:translate(var(--px,0px),var(--py,12px))}}'+
  '.bf-tut-dots{display:flex;gap:6px;margin-top:8px;justify-content:center}'+
  '.bf-tut-dot{width:8px;height:8px;border-radius:50%;background:rgba(255,210,74,.25);transition:background .3s}'+
  '.bf-tut-dot.active{background:#FFD24A;box-shadow:0 0 8px rgba(255,210,74,.6)}'+
  '.bf-tut-spot{position:fixed;z-index:99991;border-radius:18px;border:3px solid #FFD24A;pointer-events:none;display:none;animation:bfTutSpotGlow 1.5s ease-in-out infinite}'+
  '@keyframes bfTutSpotGlow{0%,100%{box-shadow:0 0 20px rgba(255,210,74,.5),0 0 40px rgba(255,210,74,.2)}50%{box-shadow:0 0 30px rgba(255,210,74,.85),0 0 55px rgba(255,210,74,.4)}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  var EN=!!window.__bfLangEn;
  function T(es,en){return EN?en:es;}

  // Secuencia de tips por pantalla (uno a la vez, como un vídeo)
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
      {id:'ctb',sel:['.ctb-bar'],txt:T('⏳ Barra de turnos: el orden de actuación','⏳ Turn bar: the order heroes will act')},
      {id:'log',sel:['.b-log-wrap'],txt:T('📜 Registro de combate: aquí se narra la batalla','📜 Combat log: everything is narrated here')}
    ]
  };

  // Elementos del DOM
  var tipEl=document.createElement('div');tipEl.className='bf-tut-tip';
  tipEl.innerHTML='<div class="bf-tut-pill"><span class="bf-tut-txt"></span><span class="bf-tut-x">✕</span></div><div class="bf-tut-finger">👇</div><div class="bf-tut-dots"></div>';
  var spotEl=document.createElement('div');spotEl.className='bf-tut-spot';
  document.body.appendChild(spotEl);document.body.appendChild(tipEl);

  // Estado
  var curScreen='';
  var curIdx=0;
  var autoTimer=null;
  var DURATION=5000; // 5s por tip

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

  function showTip(){
    var list=TIPS[curScreen];
    if(!list||curIdx>=list.length){hideTip();return;}
    var t=list[curIdx];
    var el=findEl(t);
    var txt=t.dyn&&el?t.dyn(el):(t.txt||'');

    tipEl.querySelector('.bf-tut-txt').innerHTML=txt;

    // Dots de progreso
    var dh='';
    for(var d=0;d<list.length;d++)dh+='<div class="bf-tut-dot'+(d===curIdx?' active':'')+'"></div>';
    tipEl.querySelector('.bf-tut-dots').innerHTML=dh;

    // Medir tras mostrar
    tipEl.style.display='flex';
    var vw=window.innerWidth,vh=window.innerHeight;
    var tw=tipEl.offsetWidth||300,th=tipEl.offsetHeight||120;
    var x,y,finger='👇',px='0px',py='12px';

    if(el){
      var r=el.getBoundingClientRect();
      // Spotlight sobre el elemento
      spotEl.style.display='block';
      spotEl.style.left=Math.round(r.left-6)+'px';
      spotEl.style.top=Math.round(r.top-6)+'px';
      spotEl.style.width=Math.round(r.width+12)+'px';
      spotEl.style.height=Math.round(r.height+12)+'px';

      // Tip debajo si cabe, si no arriba, si no centrado
      if(r.bottom+th+15<vh){
        y=r.bottom+12;finger='👇';py='12px';
      }else if(r.top-th-15>0){
        y=r.top-th-12;finger='👆';py='-12px';
      }else{
        y=Math.max(20,(vh-th)/2);finger='👇';py='12px';
      }
      x=Math.max(10,Math.min(vw-tw-10,r.left+r.width/2-tw/2));
    }else{
      spotEl.style.display='none';
      x=(vw-tw)/2;
      y=(vh-th)/2;
    }

    var f=tipEl.querySelector('.bf-tut-finger');
    f.textContent=finger;
    f.style.setProperty('--px',px);
    f.style.setProperty('--py',py);
    tipEl.style.left=Math.round(x)+'px';
    tipEl.style.top=Math.round(y)+'px';

    // Auto-avance (como un vídeo)
    if(autoTimer)clearTimeout(autoTimer);
    autoTimer=setTimeout(advance,DURATION);
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
    showTip();
  }

  // Cerrar con ×
  tipEl.querySelector('.bf-tut-x').addEventListener('click',function(e){
    e.stopPropagation();e.preventDefault();
    hideTip();
  });

  // Reposicionar al hacer scroll (seguir al elemento)
  var scrollRAF=null;
  window.addEventListener('scroll',function(){
    if(scrollRAF)return;
    scrollRAF=requestAnimationFrame(function(){
      scrollRAF=null;
      if(tipEl.style.display==='flex')showTip();
    });
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
      curScreen=sid;curIdx=0;
      if(TIPS[sid]&&TIPS[sid].length)showTip();else hideTip();
    }
  }

  window.__bfResetDemoTips=function(){curScreen='';curIdx=0;hideTip();};
  setInterval(tick,350);
})();
</script>
`;