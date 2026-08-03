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
  '.bf-tip-pill{position:relative;background:linear-gradient(180deg,rgba(40,28,64,.96),rgba(20,12,38,.97));border:1.5px solid rgba(255,210,74,.5);border-radius:14px;padding:7px 22px 7px 13px;color:#fff0c8;font-weight:700;font-size:13px;line-height:1.35;text-align:center;letter-spacing:.2px;animation:bfTipPulse 2.8s ease-in-out infinite}'+
  '@keyframes bfTipPulse{0%,100%{box-shadow:0 6px 16px rgba(0,0,0,.5),0 0 6px rgba(255,210,74,.18)}50%{box-shadow:0 6px 16px rgba(0,0,0,.5),0 0 14px rgba(255,210,74,.42)}}'+
  '.bf-tip-x{position:absolute;top:-7px;right:-7px;pointer-events:auto;cursor:pointer;color:#3a2600;background:linear-gradient(180deg,#ffe27a,#FFD24A 55%,#c8901f);border:1.5px solid #6f4809;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;line-height:1;box-shadow:0 2px 6px rgba(0,0,0,.5);opacity:1;z-index:2}'+
  '.bf-tip-x:hover{filter:brightness(1.1);transform:scale(1.1)}'+
  '#coach{z-index:100000!important}'+
  '.bf-tip-finger{font-size:26px;line-height:1;filter:drop-shadow(0 3px 6px rgba(0,0,0,.6));animation:bfTipPoke .8s ease-in-out infinite}'+
  '@keyframes bfTipPoke{0%,100%{transform:translate(0,0)}50%{transform:translate(var(--px,0px),var(--py,7px))}}'+
  '.bf-tip-halo{position:fixed;z-index:99994;border-radius:16px;border:2px solid rgba(255,210,74,.55);pointer-events:none;display:none;animation:bfTipHalo 2s ease-out infinite}'+
  '@keyframes bfTipHalo{0%{opacity:.7;transform:scale(1)}100%{opacity:0;transform:scale(1.1)}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  var EN=!!window.__bfLangEn;
  function T(es,en){return EN?en:es;}

  // Tips por pantalla. place:'side' = a un lado del elemento (para los
  // marcadores de monedas, que nunca deben quedar tapados).
  var TIPS={
    's-recruit':[
      {id:'bid',sel:['.hcard-bid-zone'],txt:T('💰 Así se puja: ajusta con − / + y pulsa <b>Pujar</b>. ¡Es secreta!','💰 Bidding: adjust with − / + and press <b>Bid</b>. It\\'s secret!')},
      {id:'bidcalc',always:true,sel:['div[id^="bidcalc_"]'],has:'bonificador|resta',place:'side',txt:T('📊 Debajo de las monedas a pujar: el <b>bonificador</b> (verde, te descuenta) y el <b>restador</b> del rival (rojo, te suma). Abajo del todo, en amarillo, el <b>coste real</b> del héroe si ganas (puja con bonificadores ya aplicados).','📊 Below the coins to bid: your <b>booster</b> (green, discounts) and the rival <b>penalty</b> (red, surcharges). At the very bottom, in yellow, the <b>real cost</b> of the hero if you win (bid with modifiers already applied).')},
      {id:'bonus',sel:['.bf-bonus-card'],place:'side',dyn:function(el){
        var x=(el.textContent||'').replace(/\\s+/g,' ').trim();
        x=x.replace(/^.*?(bonificador de esta ronda|this round.s booster)[:\\s·-]*/i,'');
        if(x.length>120)x=x.slice(0,120)+'…';
        var head=T('🎁 <b>Bonificador de esta ronda</b> (único, cambia en cada ronda).','🎁 <b>This round\\'s booster</b> (unique, changes every round).');
        return x?head+'<br>✨ '+T('Efecto:','Effect:')+' '+x:head;
      }},
      {id:'coins',sel:['.coins-row'],has:'subasta|auction',place:'side',txt:T('🪙 Tus monedas de subasta','🪙 Your auction coins')},
      {id:'eqcoins',sel:['#s-recruit .coins-row'],has:'equipamiento|equipment',place:'left',txt:T('🪙 Monedas de equipamiento: puedes pasarlas a la subasta de 10 en 10','🪙 Equipment coins: you can move them to the auction 10 at a time')}
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
  function hideAll(){nodes.forEach(function(n){n.tip.style.display='none';n.halo.style.display='none';n.tip.__bfLocked=false;n.tip.__bfX=null;n.tip.__bfY=null;});}

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
      var below=hit.y+hit.h+12,above=hit.y-h-12;
      y=(below<=maxY)?below:above;
      if(y<6)return Math.max(6,Math.min(maxY,y));
    }
    return y;
  }

  // Los tips son SOLO de la partida demo. Usamos un flag dedicado
  // (window.__bfDemoOn) en vez de G.demo/G.demoExample, porque esos se quedaban
  // a true tras la demo y hacían que los tips aparecieran en partidas reales.
  // El flag se activa al arrancar la demo (demoAuction) y se desactiva al
  // volver a la portada (s-title) — fin de la demo.
  function tick(){
    // Mientras el body tenga CUALQUIER transform (pellizco activo O la
    // transición de reseteo), los tips se quedan quietos y se mueven/escalan
    // con el body como el resto de la pantalla. Solo reposicionamos cuando el
    // transform computado es 'none' (body sin transformar).
    var bt=getComputedStyle(document.body).transform;
    if(bt&&bt!=='none')return;
    // Durante la resolución de la fase de subasta (coach mostrando el resultado)
    // el flujo de demo activa esta pausa: los tips no cuadran en esa pantalla.
    if(window.__bfDemoTipsPause){hideAll();return;}
    var active=document.querySelector('.screen.active');
    if(active&&active.id==='s-title') window.__bfDemoOn=false;
    var demo=false;
    try{demo=!!window.__bfDemoOn;}catch(e){}
    var list=null;
    if(active&&TIPS[active.id]&&demo) list=TIPS[active.id];
    if(!list||!list.length){hideAll();return;}
    ensureNodes(list.length);
    var placed=[];
    // Reservar la zona del entrenador (botón "Seguir") para que NINGÚN tip la
    // tape: siempre se puede pulsar "Seguir" y siempre se alcanza la × para
    // cerrar los tips.
    var coachEl=document.getElementById('coach');
    if(coachEl){var cr=coachEl.getBoundingClientRect();if(cr.width>4&&cr.height>4)placed.push({x:cr.left-4,y:cr.top-4,w:cr.width+8,h:cr.height+8});}
    // Reservar también el botón "Transferir 10 monedas a la subasta" para que
    // NINGÚN tip lo tape (el de monedas de equipamiento iría encima si no).
    var xferEl=document.querySelector('#s-recruit .bf-xfer-btn');
    if(xferEl){var xr=xferEl.getBoundingClientRect();if(xr.width>4&&xr.height>4)placed.push({x:xr.left-4,y:xr.top-4,w:xr.width+8,h:xr.height+8});}
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
      // Si el elemento no se encuentra en este tick (el juego re-renderiza
      // el DOM constantemente durante la demo), NO ocultamos el tip: lo
      // dejamos en su última posición. Solo se ocultan al cambiar de pantalla
      // o al terminar la demo (hideAll). Esto elimina el parpadeo.
      if(!el)return;
      // Tip ya colocado (mismo ID): posición FIJA. No se recoloca aunque el
      // elemento se mueva por scroll o re-render. Solo actualiza texto
      // dinámico y aporta su zona al solape de tips nuevos.
      if(n.tip.__bfLocked){
        var ltxt=t.dyn?t.dyn(el):t.txt;
        if(n.tip.__bfTxt!==ltxt){n.tip.__bfTxt=ltxt;n.tip.querySelector('.bf-tip-txt').innerHTML=ltxt;}
        if(n.tip.style.display!=='flex')n.tip.style.display='flex';
        placed.push({x:n.tip.__bfX,y:n.tip.__bfY,w:n.tip.offsetWidth||190,h:n.tip.offsetHeight||62});
        return;
      }
      var r=el.getBoundingClientRect();
      // El halo solo se actualiza si cambió de posición (evita reflow).
      var hl=Math.round(r.left-5),ht=Math.round(r.top-5),hw=Math.round(r.width+10),hh=Math.round(r.height+10);
      if(n.halo.__bfL!==hl||n.halo.__bfT!==ht||n.halo.__bfW!==hw||n.halo.__bfH!==hh){
        n.halo.__bfL=hl;n.halo.__bfT=ht;n.halo.__bfW=hw;n.halo.__bfH=hh;
        n.halo.style.display='block';
        n.halo.style.left=hl+'px';n.halo.style.top=ht+'px';
        n.halo.style.width=hw+'px';n.halo.style.height=hh+'px';
      }
      // El texto solo se escribe si cambió (evita parpadeos con el traductor).
      var txt=t.dyn?t.dyn(el):t.txt;
      if(n.tip.__bfId!==t.id||n.tip.__bfTxt!==txt){
        if(n.tip.__bfId!==t.id){n.tip.__bfLocked=false;}
        n.tip.__bfId=t.id;n.tip.__bfTxt=txt;
        n.tip.querySelector('.bf-tip-txt').innerHTML=txt;
        n.tip.querySelector('.bf-tip-finger').style.display='';
      }
      if(n.tip.style.display!=='flex')n.tip.style.display='flex';
      var finger=n.tip.querySelector('.bf-tip-finger');
      var w=n.tip.offsetWidth||190,h=n.tip.offsetHeight||62,x,y;
      // Evita resetear className cada tick: solo cambia la clase de orientación
      // si es distinta a la anterior (elimina reflujo y parpadeo).
      var placeCls='bf-tip-col';
      if(t.place==='over'){
        // Centrado SOBRE el elemento (cartas grandes): no tapa nada de alrededor.
        placeCls='bf-tip-col';finger.textContent='';finger.style.display='none';
        x=r.left+r.width/2-w/2;
        y=Math.max(6,Math.min(window.innerHeight-h-6,r.top+r.height/2-h/2));
      }else if(t.place==='left'){
        // A la izquierda del elemento, centrado en vertical.
        placeCls='bf-tip-row';
        finger.textContent='👉';
        finger.style.setProperty('--px','6px');finger.style.setProperty('--py','0px');
        x=r.left-w-10;
        y=Math.max(6,Math.min(window.innerHeight-h-6,r.top+r.height/2-h/2));
      }else if(t.place==='side'){
        // A un lado del elemento, centrado en vertical: nunca lo tapa.
        var right=r.right+10+w<window.innerWidth-6;
        placeCls=right?'bf-tip-rowr':'bf-tip-row';
        finger.textContent=right?'👈':'👉';
        finger.style.setProperty('--px',right?'-6px':'6px');finger.style.setProperty('--py','0px');
        x=right?r.right+10:r.left-w-10;
        y=Math.max(6,Math.min(window.innerHeight-h-6,r.top+r.height/2-h/2));
      }else if(t.place==='below'){
        // SIEMPRE debajo del elemento: no tapa lo que hay encima (p. ej. el
        // bonificador de la ronda).
        placeCls='bf-tip-colr';finger.textContent='👆';
        finger.style.setProperty('--px','0px');finger.style.setProperty('--py','-7px');
        x=r.left+r.width/2-w/2;y=r.bottom+8;
      }else if(r.top-h-10>4){
        placeCls='bf-tip-col';finger.textContent='👇';
        finger.style.setProperty('--px','0px');finger.style.setProperty('--py','7px');
        x=r.left+r.width/2-w/2;y=r.top-h-8;
      }else{
        placeCls='bf-tip-colr';finger.textContent='👆';
        finger.style.setProperty('--px','0px');finger.style.setProperty('--py','-7px');
        x=r.left+r.width/2-w/2;y=r.bottom+8;
      }
      // Solo actualiza la clase de orientación si cambió (evita reflujo).
      if(n.tip.__bfPlaceCls!==placeCls){
        n.tip.__bfPlaceCls=placeCls;
        n.tip.className='bf-tip '+placeCls;
      }
      x=Math.round(Math.max(6,Math.min(window.innerWidth-w-6,x)));
      y=Math.round(Math.max(6,y));
      y=resolveOverlap(x,y,w,h,placed);
      placed.push({x:x,y:y,w:w,h:h});
      n.tip.__bfX=x;n.tip.__bfY=y;
      n.tip.style.left=x+'px';
      n.tip.style.top=y+'px';
      n.tip.__bfLocked=true;
    });
    // Oculta los nodos sobrantes de la pantalla anterior (evita tips huérfanos).
    for(var k=list.length;k<nodes.length;k++){nodes[k].tip.style.display='none';nodes[k].halo.style.display='none';}
  }
  // Resetea los tips cerrados y oculta todo: lo llama el flujo de demo al
  // arrancar una partida demo nueva, así los tips vuelven a aparecer y no
  // se quedan descartados de una demo anterior.
  window.__bfResetDemoTips=function(){ dismissed={}; hideAll(); };
  setInterval(tick,350);
})();
</script>
`;