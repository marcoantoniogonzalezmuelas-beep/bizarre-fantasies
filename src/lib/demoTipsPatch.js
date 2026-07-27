// Parche inyectado en el iframe: durante "Aprende a jugar" (la demo IA vs IA)
// aparecen tips visuales flotantes — píldora dorada con dedo animado y halo —
// anclados a los controles reales de cada pantalla. Cada tip se puede cerrar
// (×), los de los marcadores de monedas se colocan A UN LADO para no taparlos,
// y los textos son bilingües (ES/EN según el idioma activo) para que no
// parpadeen con el traductor en vivo.
export const DEMO_TIPS_PATCH = `
<script>
(function(){
  if(window.__bfDemoTips)return;
  window.__bfDemoTips=true;

  var css=''+
  '.bf-tip{position:fixed;z-index:99995;display:none;align-items:center;pointer-events:none;max-width:230px;font-family:Rubik,system-ui,sans-serif}'+
  '.bf-tip.bf-tip-col{flex-direction:column}.bf-tip.bf-tip-colr{flex-direction:column-reverse}'+
  '.bf-tip.bf-tip-row{flex-direction:row}.bf-tip.bf-tip-rowr{flex-direction:row-reverse}'+
  '.bf-tip-pill{position:relative;background:linear-gradient(180deg,#33205c,#150d2a);border:2px solid #ffd24a;border-radius:12px;padding:6px 22px 6px 12px;color:#ffe9a8;font-weight:800;font-size:12.5px;line-height:1.3;text-align:center;animation:bfTipPulse 1.6s ease-in-out infinite}'+
  '@keyframes bfTipPulse{0%,100%{box-shadow:0 6px 16px rgba(0,0,0,.55),0 0 10px rgba(255,210,74,.35)}50%{box-shadow:0 6px 16px rgba(0,0,0,.55),0 0 24px rgba(255,210,74,.85)}}'+
  '.bf-tip-x{position:absolute;top:-1px;right:2px;pointer-events:auto;cursor:pointer;color:#ffd24a;font-size:14px;font-weight:900;line-height:1;padding:3px 4px;opacity:.85}'+
  '.bf-tip-x:hover{opacity:1;color:#fff}'+
  '.bf-tip-finger{font-size:26px;line-height:1;filter:drop-shadow(0 3px 6px rgba(0,0,0,.6));animation:bfTipPoke .8s ease-in-out infinite}'+
  '@keyframes bfTipPoke{0%,100%{transform:translate(0,0)}50%{transform:translate(var(--px,0px),var(--py,7px))}}'+
  '.bf-tip-halo{position:fixed;z-index:99994;border-radius:14px;border:3px solid rgba(255,210,74,.85);pointer-events:none;display:none;animation:bfTipHalo 1.4s ease-out infinite}'+
  '@keyframes bfTipHalo{0%{opacity:.95;transform:scale(1)}100%{opacity:0;transform:scale(1.12)}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  var EN=!!window.__bfLangEn;
  function T(es,en){return EN?en:es;}

  // Tips por pantalla. place:'side' = a un lado del elemento (para los
  // marcadores de monedas, que nunca deben quedar tapados).
  var TIPS={
    's-recruit':[
      {id:'bid',sel:['.hcard-bid-zone'],txt:T('💰 Así se puja: ajusta con − / + y pulsa <b>Pujar</b>. ¡Es secreta!','💰 Bidding: adjust with − / + and press <b>Bid</b>. It\\'s secret!')},
      {id:'bonus',sel:['.bf-bonus-card'],place:'over',txt:T('🎁 Bonificador: único, y hay uno distinto en cada ronda de subasta','🎁 Booster: unique, and each auction round brings a different one')},
      {id:'coins',sel:['.coins-row'],has:'subasta|auction',place:'side',txt:T('🪙 Tus monedas de subasta','🪙 Your auction coins')},
      {id:'eqcoins',sel:['#s-recruit .coins-row'],has:'equipamiento|equipment',txt:T('🪙 Monedas de equipamiento: puedes pasarlas a la subasta de 10 en 10','🪙 Equipment coins: you can move them to the auction 10 at a time')}
    ],
    's-equip':[
      {id:'slot',sel:['.bf-slot-buy'],txt:T('⚔️ Equipa aquí: 1 arma y 1 armadura por héroe','⚔️ Equip here: 1 weapon and 1 armor per hero')},
      {id:'buy',sel:['.bf-buy-btn'],txt:T('🛒 Compra hechizos y objetos: van a tu mano','🛒 Buy spells and items: they go to your hand')},
      {id:'budget',sel:['#s-equip .coins-row'],place:'side',txt:T('🪙 Tu presupuesto de equipamiento','🪙 Your equipment budget')},
      {id:'eqhand',sel:['.eq-hand-box'],txt:T('🃏 Estas cartas estarán en tu mano durante la batalla','🃏 These cards will be in your hand during battle')}
    ],
    's-battle':[
      {id:'hand',sel:['#hand_p'],txt:T('🃏 Tu mano: los hechizos y objetos que compraste','🃏 Your hand: the spells and items you bought')},
      {id:'bars',sel:['[id^=b_p_]'],txt:T('❤️ Barra verde = vida · 🔵 azul = maná','❤️ Green bar = health · 🔵 blue = mana')},
      {id:'ctb',sel:['.ctb-bar'],txt:T('⏳ Barra de turnos: el orden en que actuarán los héroes','⏳ Turn bar: the order in which the heroes will act')},
      {id:'log',sel:['.b-log-wrap'],txt:T('📜 Registro de combate: aquí se narra todo lo que ocurre en la batalla','📜 Combat log: everything that happens in battle is narrated here')}
    ]
  };

  var dismissed={};
  var nodes=[];
  function ensureNodes(n){
    while(nodes.length<n){
      var tip=document.createElement('div');tip.className='bf-tip bf-tip-col';
      tip.innerHTML='<div class="bf-tip-pill"><span class="bf-tip-txt"></span><span class="bf-tip-x">✕</span></div><div class="bf-tip-finger">👇</div>';
      var halo=document.createElement('div');halo.className='bf-tip-halo';
      document.body.appendChild(halo);document.body.appendChild(tip);
      (function(t,h){
        t.querySelector('.bf-tip-x').addEventListener('click',function(e){
          e.stopPropagation();
          if(t.__bfId)dismissed[t.__bfId]=1;
          t.style.display='none';h.style.display='none';
        });
      })(tip,halo);
      nodes.push({tip:tip,halo:halo});
    }
  }
  function hideAll(){nodes.forEach(function(n){n.tip.style.display='none';n.halo.style.display='none';});}

  function visible(el){
    if(!el)return false;
    var r=el.getBoundingClientRect();
    if(r.width<4||r.height<4)return false;
    if(r.bottom<0||r.top>window.innerHeight||r.right<0||r.left>window.innerWidth)return false;
    var cs=getComputedStyle(el);
    return cs.display!=='none'&&cs.visibility!=='hidden';
  }

  // Rectángulos de tips ya colocados en esta pasada: si uno nuevo se solapa
  // con alguno, se desplaza en vertical hasta quedar libre (nunca se solapan).
  function resolveOverlap(x,y,w,h,placed){
    var maxY=window.innerHeight-h-6,guard=0;
    while(guard++<10){
      var hit=null;
      for(var i=0;i<placed.length;i++){
        var p=placed[i];
        if(!(x+w<p.x||x>p.x+p.w||y+h<p.y||y>p.y+p.h)){hit=p;break;}
      }
      if(!hit)return y;
      var below=hit.y+hit.h+6,above=hit.y-h-6;
      y=(below<=maxY)?below:above;
      if(y<6)return Math.max(6,Math.min(maxY,y));
    }
    return y;
  }

  function tick(){
    var demo=false;
    try{demo=typeof G!=='undefined'&&G&&(G.demo||G.demoExample);}catch(e){}
    var active=document.querySelector('.screen.active');
    var list=demo&&active?TIPS[active.id]:null;
    if(!list){hideAll();return;}
    ensureNodes(list.length);
    var placed=[];
    list.forEach(function(t,i){
      var n=nodes[i];
      if(dismissed[t.id]){n.tip.style.display='none';n.halo.style.display='none';return;}
      var el=null;
      for(var s=0;s<t.sel.length&&!el;s++){
        var cands=document.querySelectorAll(t.sel[s]);
        for(var c=0;c<cands.length;c++){
          if(!visible(cands[c]))continue;
          if(t.has&&!new RegExp(t.has,'i').test(cands[c].textContent))continue;
          el=cands[c];break;
        }
      }
      if(!el){n.tip.style.display='none';n.halo.style.display='none';return;}
      var r=el.getBoundingClientRect();
      n.halo.style.display='block';
      n.halo.style.left=(r.left-5)+'px';n.halo.style.top=(r.top-5)+'px';
      n.halo.style.width=(r.width+10)+'px';n.halo.style.height=(r.height+10)+'px';
      // El texto solo se escribe si cambió (evita parpadeos con el traductor).
      if(n.tip.__bfId!==t.id){
        n.tip.__bfId=t.id;
        n.tip.querySelector('.bf-tip-txt').innerHTML=t.txt;
        n.tip.querySelector('.bf-tip-finger').style.display='';
      }
      n.tip.style.display='flex';
      var finger=n.tip.querySelector('.bf-tip-finger');
      var w=n.tip.offsetWidth||190,h=n.tip.offsetHeight||62,x,y;
      n.tip.className='bf-tip';
      if(t.place==='over'){
        // Centrado SOBRE el elemento (cartas grandes): no tapa nada de alrededor.
        n.tip.classList.add('bf-tip-col');finger.textContent='';finger.style.display='none';
        x=r.left+r.width/2-w/2;
        y=Math.max(6,Math.min(window.innerHeight-h-6,r.top+r.height/2-h/2));
      }else if(t.place==='side'){
        // A un lado del elemento, centrado en vertical: nunca lo tapa.
        var right=r.right+10+w<window.innerWidth-6;
        n.tip.classList.add(right?'bf-tip-rowr':'bf-tip-row');
        finger.textContent=right?'👈':'👉';
        finger.style.setProperty('--px',right?'-6px':'6px');finger.style.setProperty('--py','0px');
        x=right?r.right+10:r.left-w-10;
        y=Math.max(6,Math.min(window.innerHeight-h-6,r.top+r.height/2-h/2));
      }else if(r.top-h-10>4){
        n.tip.classList.add('bf-tip-col');finger.textContent='👇';
        finger.style.setProperty('--px','0px');finger.style.setProperty('--py','7px');
        x=r.left+r.width/2-w/2;y=r.top-h-8;
      }else{
        n.tip.classList.add('bf-tip-colr');finger.textContent='👆';
        finger.style.setProperty('--px','0px');finger.style.setProperty('--py','-7px');
        x=r.left+r.width/2-w/2;y=r.bottom+8;
      }
      x=Math.max(6,Math.min(window.innerWidth-w-6,x));
      y=Math.max(6,y);
      y=resolveOverlap(x,y,w,h,placed);
      placed.push({x:x,y:y,w:w,h:h});
      n.tip.style.left=x+'px';
      n.tip.style.top=y+'px';
    });
    // Oculta los nodos sobrantes de la pantalla anterior (evita tips huérfanos).
    for(var k=list.length;k<nodes.length;k++){nodes[k].tip.style.display='none';nodes[k].halo.style.display='none';}
  }
  setInterval(tick,350);
})();
</script>
`;