// "FAROL DE HABILIDAD": efecto visual bizarro para las habilidades que no hacen nada (La Butifarra, La Lavadora y
// La Caja de Zapatos). Carga épica (anillos dorados y "¡¡HABILIDAD DEFINITIVA!!"), se desinfla (humo, "…pfff. Nada."
// y un grillo que cruza) y remata con un sello "¡FAROL!". Lo dispara el paso "noop" del ejecutor con el efecto
// "bfbluff"; viaja al invitado como cualquier efecto, así que lo ven los dos jugadores.
export const BLUFF_FX_PATCH = `
<script>
(function(){
  if(window.__bfBluffFx)return;
  window.__bfBluffFx=true;
  var st=document.createElement('style');
  st.textContent=''
    +'.bf-bluff{position:fixed;z-index:100004;pointer-events:none;width:0;height:0}'
    +'.bf-bluff .bfb-ring{position:absolute;left:0;top:0;width:150px;height:150px;margin:-75px 0 0 -75px;border-radius:50%;border:4px solid #ffd24a;box-shadow:0 0 30px #ffd24a,inset 0 0 26px rgba(255,210,74,.7);opacity:0;animation:bfbRing 1s ease-out 2}'
    +'.bf-bluff .bfb-ring.r2{animation-delay:.35s}'
    +'.bf-bluff .bfb-big{position:absolute;left:0;top:-118px;white-space:nowrap;font-family:Cinzel,serif;font-weight:900;font-size:30px;color:#ffe49a;text-shadow:0 0 18px #ffb000,0 3px 8px #000;opacity:0;animation:bfbBig 2.6s ease-in-out forwards}'
    +'.bf-bluff .bfb-puff{position:absolute;left:0;top:0;width:96px;height:96px;margin:-48px 0 0 -48px;border-radius:50%;background:radial-gradient(circle,rgba(220,220,220,.9),rgba(150,150,150,.45) 55%,transparent 70%);opacity:0;animation:bfbPuff 1.3s ease-out 1.35s forwards}'
    +'.bf-bluff .bfb-meh{position:absolute;left:0;top:-66px;white-space:nowrap;font-family:Cinzel,serif;font-style:italic;font-weight:800;font-size:22px;color:#d8d0e4;text-shadow:0 2px 6px #000;opacity:0;animation:bfbMeh 1.4s ease-out 1.5s forwards}'
    +'.bf-bluff .bfb-stamp{position:absolute;left:0;top:14px;font-family:Cinzel,serif;font-weight:900;font-size:26px;color:#ff4d6d;border:3px solid #ff4d6d;border-radius:8px;padding:2px 12px;white-space:nowrap;text-shadow:0 0 10px rgba(255,77,109,.7);box-shadow:0 0 14px rgba(255,77,109,.45);background:rgba(20,6,12,.55);opacity:0;animation:bfbStamp .45s cubic-bezier(.2,1.6,.4,1) 2s forwards}'
    +'.bf-bluff .bfb-cricket{position:absolute;left:-40px;top:-14px;font-size:28px;opacity:0;animation:bfbHop 1.3s ease-out 1.75s forwards}'
    +'@keyframes bfbRing{0%{opacity:0;transform:scale(.4)}35%{opacity:1}100%{opacity:0;transform:scale(1.6)}}'
    +'@keyframes bfbBig{0%{opacity:0;transform:translateX(-50%) scale(.5)}14%{opacity:1;transform:translateX(-50%) scale(1.18)}30%{transform:translateX(-50%) scale(1)}46%{transform:translateX(-50%) scale(1.06)}58%{opacity:1;transform:translateX(-50%) translateY(6px) rotate(4deg) scale(.96)}78%{opacity:.7;transform:translateX(-50%) translateY(46px) rotate(14deg) scale(.82)}100%{opacity:0;transform:translateX(-50%) translateY(120px) rotate(26deg) scale(.7)}}'
    +'@keyframes bfbPuff{0%{opacity:0;transform:scale(.3)}30%{opacity:1}100%{opacity:0;transform:scale(2.3) translateY(-18px)}}'
    +'@keyframes bfbMeh{0%{opacity:0;transform:translateX(-50%) translateY(10px)}35%{opacity:1;transform:translateX(-50%)}100%{opacity:1;transform:translateX(-50%)}}'
    +'@keyframes bfbStamp{0%{opacity:0;transform:translate(-50%,0) rotate(-14deg) scale(2.4)}100%{opacity:1;transform:translate(-50%,0) rotate(-14deg) scale(1)}}'
    +'@keyframes bfbHop{0%{opacity:0;transform:translate(0,0)}15%{opacity:1}40%{transform:translate(30px,-30px)}60%{transform:translate(52px,0)}80%{opacity:1;transform:translate(74px,-18px)}100%{opacity:0;transform:translate(96px,0)}}';
  document.head.appendChild(st);

  function paint(side,id){
    var el=document.getElementById('b_'+side+'_'+id);
    if(!el)return;
    var r=el.getBoundingClientRect();
    var n=document.createElement('div');
    n.className='bf-bluff';
    n.style.left=(r.left+r.width/2)+'px';
    n.style.top=(r.top+r.height*0.45)+'px';
    n.innerHTML='<div class="bfb-ring"></div><div class="bfb-ring r2"></div><div class="bfb-big">¡¡HABILIDAD DEFINITIVA!!</div>'
      +'<div class="bfb-puff"></div><div class="bfb-meh">…pfff. Nada.</div><div class="bfb-cricket">🦗</div><div class="bfb-stamp">¡FAROL!</div>';
    (window.__bfAppend||function(x){document.body.appendChild(x);})(n);
    setTimeout(function(){ if(n.parentNode)n.parentNode.removeChild(n); },3600);
    return [n];
  }
  function show(side,id){
    // El turno espera a que se vea entero, como el resto de carteles del combate.
    if(typeof window.__bfQueueIndicator==='function')window.__bfQueueIndicator(function(){return paint(side,id);},4700);
    else paint(side,id);
  }
  var hookedFx=false;
  function hook(){
    if(hookedFx)return true;
    if(typeof window.flushFx!=='function')return false;
    hookedFx=true;
    var orig=window.flushFx;
    window.flushFx=function(list){
      try{(list||[]).forEach(function(ev){ if(ev&&ev.k==='bfbluff')show(ev.side,ev.id); });}catch(e){}
      return orig.apply(this,arguments);
    };
    window.flushFx.__bfBluff=1;
    return true;
  }
  if(!hook()){var iv=setInterval(function(){ if(hook())clearInterval(iv); },300);setTimeout(function(){clearInterval(iv);},15000);}
})();
</script>
`;
