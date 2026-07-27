// Parche inyectado en el iframe: durante "Aprende a jugar" (la demo IA vs IA)
// aparecen tips visuales flotantes — píldora dorada con dedo animado y halo —
// anclados a los controles reales de cada pantalla: cómo se puja en la
// subasta, cómo se compra/equipa, y qué mirar en el combate.
export const DEMO_TIPS_PATCH = `
<script>
(function(){
  if(window.__bfDemoTips)return;
  window.__bfDemoTips=true;

  var css=''+
  '.bf-tip{position:fixed;z-index:99995;display:none;flex-direction:column;align-items:center;pointer-events:none;max-width:230px;font-family:Rubik,system-ui,sans-serif}'+
  '.bf-tip-pill{background:linear-gradient(180deg,#33205c,#150d2a);border:2px solid #ffd24a;border-radius:12px;padding:6px 12px;color:#ffe9a8;font-weight:800;font-size:12.5px;line-height:1.3;text-align:center;animation:bfTipPulse 1.6s ease-in-out infinite}'+
  '@keyframes bfTipPulse{0%,100%{box-shadow:0 6px 16px rgba(0,0,0,.55),0 0 10px rgba(255,210,74,.35)}50%{box-shadow:0 6px 16px rgba(0,0,0,.55),0 0 24px rgba(255,210,74,.85)}}'+
  '.bf-tip-finger{font-size:26px;line-height:1;filter:drop-shadow(0 3px 6px rgba(0,0,0,.6));animation:bfTipPoke .8s ease-in-out infinite}'+
  '@keyframes bfTipPoke{0%,100%{transform:translateY(0)}50%{transform:translateY(7px)}}'+
  '.bf-tip-halo{position:fixed;z-index:99994;border-radius:14px;border:3px solid rgba(255,210,74,.85);pointer-events:none;display:none;animation:bfTipHalo 1.4s ease-out infinite}'+
  '@keyframes bfTipHalo{0%{opacity:.95;transform:scale(1)}100%{opacity:0;transform:scale(1.12)}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  // Tips por pantalla: selectores candidatos (se usa el primero visible) + texto.
  var TIPS={
    's-recruit':[
      {sel:['.hcard-bid-zone'],txt:'💰 Así se puja: ajusta con − / + y pulsa <b>Pujar</b>. ¡Es secreta!'},
      {sel:['.bf-bonus-card'],txt:'🎁 Bonificador de la ronda: único por partida'},
      {sel:['.coins-row'],txt:'🪙 Tus monedas de subasta'}
    ],
    's-equip':[
      {sel:['.bf-slot-buy'],txt:'⚔️ Equipa aquí: 1 arma y 1 armadura por héroe'},
      {sel:['.bf-buy-btn'],txt:'🛒 Compra hechizos y objetos: van a tu mano'},
      {sel:['.shop-coin'],txt:'🪙 Tu presupuesto de equipamiento'}
    ],
    's-battle':[
      {sel:['#hand_p'],txt:'🃏 Tu mano: los hechizos y objetos que compraste'},
      {sel:['[id^=b_p_]'],txt:'❤️ Barra verde = vida · 🔵 azul = maná'}
    ]
  };

  var nodes=[];
  function ensureNodes(n){
    while(nodes.length<n){
      var tip=document.createElement('div');tip.className='bf-tip';
      tip.innerHTML='<div class="bf-tip-pill"></div><div class="bf-tip-finger">👇</div>';
      var halo=document.createElement('div');halo.className='bf-tip-halo';
      document.body.appendChild(halo);document.body.appendChild(tip);
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

  function tick(){
    var demo=false;
    try{demo=typeof G!=='undefined'&&G&&(G.demo||G.demoExample);}catch(e){}
    var active=document.querySelector('.screen.active');
    var list=demo&&active?TIPS[active.id]:null;
    if(!list){hideAll();return;}
    ensureNodes(list.length);
    list.forEach(function(t,i){
      var el=null;
      for(var s=0;s<t.sel.length&&!el;s++){
        var cands=document.querySelectorAll(t.sel[s]);
        for(var c=0;c<cands.length;c++){if(visible(cands[c])){el=cands[c];break;}}
      }
      var n=nodes[i];
      if(!el){n.tip.style.display='none';n.halo.style.display='none';return;}
      var r=el.getBoundingClientRect();
      n.halo.style.display='block';
      n.halo.style.left=(r.left-5)+'px';n.halo.style.top=(r.top-5)+'px';
      n.halo.style.width=(r.width+10)+'px';n.halo.style.height=(r.height+10)+'px';
      n.tip.style.display='flex';
      n.tip.querySelector('.bf-tip-pill').innerHTML=t.txt;
      var w=n.tip.offsetWidth||190,h=n.tip.offsetHeight||62;
      var x=Math.max(6,Math.min(window.innerWidth-w-6,r.left+r.width/2-w/2));
      var finger=n.tip.querySelector('.bf-tip-finger');
      if(r.top-h-10>4){
        // encima del elemento, dedo apuntando hacia abajo
        n.tip.style.flexDirection='column';finger.textContent='👇';
        n.tip.style.top=(r.top-h-8)+'px';
      }else{
        // debajo, dedo arriba apuntando al elemento
        n.tip.style.flexDirection='column-reverse';finger.textContent='👆';
        n.tip.style.top=(r.bottom+8)+'px';
      }
      n.tip.style.left=x+'px';
    });
    // Oculta los nodos sobrantes de la pantalla anterior (evita tips huérfanos).
    for(var k=list.length;k<nodes.length;k++){nodes[k].tip.style.display='none';nodes[k].halo.style.display='none';}
  }
  setInterval(tick,350);
})();
</script>
`;