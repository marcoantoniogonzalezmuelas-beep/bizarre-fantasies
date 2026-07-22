// Parche inyectado en el iframe: efecto de TANQUEAR (escudo/barrera) espectacular.
// Cuando un héroe protege a un aliado (eventos 'shieldup' / 'wardup'), renderiza:
//  - cúpula protectora brillante sobre el aliado (dorada para escudo, arcana para barrera)
//  - anillos expansivos desde el aliado
//  - haz de energía desde el protector (B.current) hasta el aliado
//  - chispas ascendentes
// Envuelve pushFx (añade el protector vía B.current) y flushFx (filtra el anillo
// simple original y pinta el efecto épico). No toca la lógica del juego.
export const SHIELD_FX_PATCH = `
<script>
(function(){
  if (window.__bfShieldFxPatch) return;
  window.__bfShieldFxPatch = true;

  var st = document.createElement('style');
  st.textContent = [
    '.bf-shield-dome{position:fixed;pointer-events:none;z-index:90024;border-radius:16px;border:3px solid rgba(255,210,74,.95);background:linear-gradient(180deg,rgba(255,225,140,.28),rgba(255,200,80,.1));box-shadow:0 0 26px rgba(255,210,74,.8),inset 0 0 34px rgba(255,225,140,.4);animation:bfDome 2s ease-out forwards}',
    '@keyframes bfDome{0%{opacity:0;transform:scale(.6)}25%{opacity:1;transform:scale(1.06)}60%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.12)}}',
    '.bf-shield-dome.ward{border-color:rgba(186,140,255,.95);background:linear-gradient(180deg,rgba(196,158,255,.28),rgba(150,110,240,.1));box-shadow:0 0 26px rgba(180,130,255,.8),inset 0 0 34px rgba(196,158,255,.4)}',
    '.bf-shield-ring{position:fixed;pointer-events:none;z-index:90023;width:70px;height:70px;border-radius:50%;border:7px solid rgba(255,210,74,.9);transform:translate(-50%,-50%);animation:bfSRing 2s ease-out forwards}',
    '@keyframes bfSRing{0%{transform:translate(-50%,-50%) scale(.3);opacity:0}25%{opacity:1}100%{transform:translate(-50%,-50%) scale(2.8);opacity:0;border-width:1px}}',
    '.bf-shield-ring.ward{border-color:rgba(180,130,255,.9)}',
    '.bf-shield-beam{position:fixed;pointer-events:none;z-index:90023;height:10px;border-radius:3px;background:linear-gradient(90deg,transparent,rgba(255,225,140,.95) 50%,transparent);box-shadow:0 0 12px rgba(255,210,74,.85);transform-origin:0 50%;animation:bfBeam 2s ease-out forwards}',
    '@keyframes bfBeam{0%{opacity:0}20%{opacity:1}80%{opacity:.8}100%{opacity:0}}',
    '.bf-shield-beam.ward{background:linear-gradient(90deg,transparent,rgba(196,158,255,.95) 50%,transparent);box-shadow:0 0 12px rgba(180,130,255,.85)}',
    '.bf-shield-spark{position:fixed;pointer-events:none;z-index:90025;width:12px;height:12px;border-radius:50%;background:radial-gradient(circle,#fff6c8,#ffd24a 60%,transparent 70%);transform:translate(-50%,-50%);animation:bfSSpark 2.1s ease-out forwards}',
    '@keyframes bfSSpark{0%{opacity:0;transform:translate(-50%,-50%) scale(.5)}30%{opacity:1}100%{opacity:0;transform:translate(-50%,-34px) scale(.2)}}',
    '.bf-shield-spark.ward{background:radial-gradient(circle,#f2e6ff,#c79bff 60%,transparent 70%)}'
  ].join('');
  document.head.appendChild(st);

  function centerOf(side,id){ var el=document.getElementById('b_'+side+'_'+id); if(!el)return null; var r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; }
  function spawn(node,ms){ document.body.appendChild(node); setTimeout(function(){ if(node&&node.parentNode)node.parentNode.removeChild(node); },ms||1000); }

  function shieldFx(ev){
    var el=document.getElementById('b_'+ev.toSide+'_'+ev.toId); if(!el)return;
    var r=el.getBoundingClientRect();
    var ward=ev.k==='wardup'; var cls=ward?'ward':'';
    var cx=r.left+r.width/2, cy=r.top+r.height/2;
    // cúpula
    var dome=document.createElement('div'); dome.className='bf-shield-dome '+cls;
    dome.style.left=(r.left-12)+'px'; dome.style.top=(r.top-12)+'px'; dome.style.width=(r.width+24)+'px'; dome.style.height=(r.height+24)+'px';
    spawn(dome,2000);
    // anillos expansivos
    for(var i=0;i<2;i++){ (function(i){ setTimeout(function(){ var rg=document.createElement('div'); rg.className='bf-shield-ring '+cls; rg.style.left=cx+'px'; rg.style.top=cy+'px'; spawn(rg,2000); }, i*180); })(i); }
    // haz de energía desde el protector
    if(ev.fromSide){ var a=centerOf(ev.fromSide,ev.fromId); if(a){ var d=Math.hypot(cx-a.x,cy-a.y), ang=Math.atan2(cy-a.y,cx-a.x)*180/Math.PI; var be=document.createElement('div'); be.className='bf-shield-beam '+cls; be.style.left=a.x+'px'; be.style.top=a.y+'px'; be.style.width=d+'px'; be.style.transform='rotate('+ang+'deg)'; be.style.transformOrigin='0 50%'; spawn(be,2000); } }
    // chispas ascendentes
    for(var i=0;i<8;i++){ (function(i){ setTimeout(function(){ var sp=document.createElement('div'); sp.className='bf-shield-spark '+cls; sp.style.left=(cx+(Math.random()*r.width-r.width/2))+'px'; sp.style.top=(r.bottom-6-Math.random()*r.height*0.3)+'px'; spawn(sp,2100); }, i*70); })(i); }
  }

  // 1) Añadir el protector (B.current) a shieldup/wardup al encolar.
  function hookPush(){
    if(typeof window.pushFx!=='function'||window.pushFx.__bfShield)return;
    var orig=window.pushFx;
    window.pushFx=function(ev){ try{ if(ev&&(ev.k==='shieldup'||ev.k==='wardup')&&!ev.fromSide&&typeof B!=='undefined'&&B.current){ ev.fromSide=B.current.side; ev.fromId=B.current.id; } }catch(e){} return orig.apply(this,arguments); };
    window.pushFx.__bfShield=1;
  }
  // 2) flushFx: pintar cúpula épica y filtrar el anillo simple original.
  function hookFlush(){
    if(typeof window.flushFx!=='function'||window.flushFx.__bfShield)return;
    var orig=window.flushFx;
    window.flushFx=function(list){
      try{ if(list&&list.length){ var filtered=[]; list.forEach(function(ev){ if(!ev)return; if(ev.k==='shieldup'||ev.k==='wardup'){ shieldFx(ev); return; } filtered.push(ev); }); if(filtered.length)return orig.call(this,filtered); return; } }catch(e){}
      return orig.apply(this,arguments);
    };
    window.flushFx.__bfShield=1;
  }
  function hook(){ hookPush(); hookFlush(); }
  var iv=setInterval(function(){ hook(); if(window.pushFx&&window.pushFx.__bfShield&&window.flushFx&&window.flushFx.__bfShield)clearInterval(iv); },200);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook); else hook();
})();
</script>
`;