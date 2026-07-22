// Parche inyectado en el iframe del juego: efectos de hechizo espectaculares
// en batalla, por elemento. Envuelve flushFx y, al detectar eventos
// {k:'spell'}, superpone VFX propios sobre el panel/ejército rival:
//  - agua (Maremoto): olas gigantes que cubren el panel del rival + salpicaduras
//  - fuego (Bola de Fuego): bola de fuego que crece + anillo de onda + brasas
//  - hielo (Congelación): velo de escarcha + cristales + niebla helada
//  - rayo (Rayo en Cadena): relámpagos zigzag desde arriba + destello
// No toca la lógica del juego: solo añade capas visuales position:fixed.
export const SPELL_FX_PATCH = `
<script>
(function(){
  if (window.__bfSpellFxPatch) return;
  window.__bfSpellFxPatch = true;

  var st = document.createElement('style');
  st.textContent = [
    // ---- Agua: olas gigantes ----
    '.bf-wave-overlay{position:fixed;pointer-events:none;z-index:90021;overflow:hidden;border-radius:12px}',
    '.bf-wave{position:absolute;left:-20%;width:140%;height:55%;border-radius:50% 50% 40% 40%/60% 60% 40% 40%;background:repeating-linear-gradient(90deg,rgba(90,180,255,.6) 0 22px,rgba(40,120,220,.42) 22px 46px);filter:blur(.5px);opacity:.85}',
    '.bf-wave.w1{bottom:-25%;animation:bfWaveRise 1.3s cubic-bezier(.3,.7,.4,1) forwards}',
    '.bf-wave.w2{bottom:-40%;animation:bfWaveRise 1.3s .09s cubic-bezier(.3,.7,.4,1) forwards;opacity:.62;background:repeating-linear-gradient(90deg,rgba(130,205,255,.5) 0 30px,rgba(55,145,230,.35) 30px 60px)}',
    '.bf-wave.w3{bottom:-52%;animation:bfWaveRise 1.3s .18s cubic-bezier(.3,.7,.4,1) forwards;opacity:.4}',
    '@keyframes bfWaveRise{0%{transform:translateY(45%) translateX(-6%);opacity:0}25%{opacity:.85}100%{transform:translateY(-12%) translateX(8%);opacity:0}}',
    '.bf-splash{position:absolute;width:26px;height:26px;border-radius:50%;background:radial-gradient(circle,#cfeaff,rgba(90,180,255,.2) 60%,transparent 70%);animation:bfSplash 1s ease-out forwards}',
    '@keyframes bfSplash{0%{opacity:0;transform:scale(.2)}30%{opacity:1}100%{opacity:0;transform:scale(1.6) translateY(-22px)}}',
    // ---- Fuego: bola de fuego + anillo + brasas ----
    '.bf-fireball{position:fixed;pointer-events:none;z-index:90022;width:10px;height:10px;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,#fff 0%,#ffe27a 22%,#ff8a2a 48%,#ff3a14 70%,transparent 78%);animation:bfFireball 1s ease-out forwards;filter:drop-shadow(0 0 18px rgba(255,120,30,.95))}',
    '@keyframes bfFireball{0%{transform:translate(-50%,-50%) scale(.3);opacity:0}18%{opacity:1}55%{transform:translate(-50%,-50%) scale(9)}72%{transform:translate(-50%,-50%) scale(11.5);opacity:.9}100%{transform:translate(-50%,-50%) scale(14);opacity:0}}',
    '.bf-fire-ring{position:fixed;pointer-events:none;z-index:90021;width:10px;height:10px;border-radius:50%;transform:translate(-50%,-50%);border:4px solid rgba(255,140,40,.9);animation:bfFireRing .9s ease-out forwards}',
    '@keyframes bfFireRing{0%{transform:translate(-50%,-50%) scale(.4);opacity:0}25%{opacity:1}100%{transform:translate(-50%,-50%) scale(12);opacity:0;border-width:1px}}',
    '.bf-ember{position:fixed;pointer-events:none;z-index:90023;width:14px;height:14px;border-radius:50%;background:radial-gradient(circle,#ffe27a,#ff6a14 60%,transparent 70%);animation:bfEmber .9s ease-out forwards}',
    '@keyframes bfEmber{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(calc(-50% + var(--dx,0)),calc(-50% + var(--dy,0))) scale(.2);opacity:0}}',
    // ---- Hielo: escarcha + cristales + niebla ----
    '.bf-frost-overlay{position:fixed;pointer-events:none;z-index:90021;border-radius:12px;background:linear-gradient(180deg,rgba(185,232,255,.45),rgba(120,200,255,.24));box-shadow:inset 0 0 60px rgba(150,220,255,.5),inset 0 0 0 3px rgba(200,240,255,.6);animation:bfFrost 1.3s ease-out forwards}',
    '@keyframes bfFrost{0%{opacity:0}25%{opacity:1}70%{opacity:1}100%{opacity:0}}',
    '.bf-frost-mist{position:fixed;pointer-events:none;z-index:90022;width:200px;height:200px;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(205,238,255,.72),rgba(150,210,255,.2) 55%,transparent 72%);animation:bfFrostMist 1.2s ease-out forwards;filter:blur(3px)}',
    '@keyframes bfFrostMist{0%{transform:translate(-50%,-50%) scale(.3);opacity:0}30%{opacity:.9}100%{transform:translate(-50%,-50%) scale(2.4);opacity:0}}',
    '.bf-ice-shard{position:fixed;pointer-events:none;z-index:90024;width:24px;height:58px;transform:translate(-50%,-50%);background:linear-gradient(180deg,#eaf8ff,#7fc6ff 55%,#3a9fe0);clip-path:polygon(50% 0,72% 30%,72% 70%,50% 100%,28% 70%,28% 30%);filter:drop-shadow(0 0 6px rgba(150,220,255,.85));animation:bfIceShard 1.1s ease-out forwards}',
    '@keyframes bfIceShard{0%{transform:translate(-50%,-50%) scale(.2) rotate(var(--r,0deg));opacity:0}20%{opacity:1}100%{transform:translate(calc(-50% + var(--dx,0)),calc(-50% + var(--dy,0))) scale(.9) rotate(var(--r,0deg));opacity:0}}',
    // ---- Rayo: relámpago zigzag + destello ----
    '.bf-bolt{position:fixed;pointer-events:none;z-index:90025;width:80px;transform:translateX(-50%);background:linear-gradient(180deg,#fff,#ffe14a 30%,#fff 60%,#bfe0ff);filter:drop-shadow(0 0 8px rgba(255,225,74,1)) drop-shadow(0 0 20px rgba(120,200,255,.85));clip-path:polygon(55% 0,78% 16%,45% 30%,70% 48%,38% 64%,62% 80%,38% 100%,28% 80%,52% 64%,28% 48%,55% 30%,28% 16%);animation:bfBolt .7s ease-out forwards}',
    '@keyframes bfBolt{0%{opacity:0}8%{opacity:1}18%{opacity:.3}28%{opacity:1}42%{opacity:.5}100%{opacity:0}}',
    '.bf-flash{position:fixed;pointer-events:none;z-index:90020;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.85),rgba(180,220,255,.3) 50%,transparent 75%);animation:bfFlash .5s ease-out forwards}',
    '@keyframes bfFlash{0%{opacity:0}15%{opacity:.8}100%{opacity:0}}'
  ].join('');
  document.head.appendChild(st);

  function centerOf(side,id){ var el=document.getElementById('b_'+side+'_'+id); if(!el)return null; var r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; }
  function panelRect(side,id){ var el=document.getElementById('b_'+side+'_'+id); if(!el)return null; var p=el.closest('.army-panel'); if(!p)return null; return p.getBoundingClientRect(); }
  function spawn(node,ms){ document.body.appendChild(node); setTimeout(function(){ if(node&&node.parentNode)node.parentNode.removeChild(node); },ms||1300); }

  function fxWater(side,id){
    var r=panelRect(side,id); if(!r)return;
    var ov=document.createElement('div'); ov.className='bf-wave-overlay';
    ov.style.left=r.left+'px'; ov.style.top=r.top+'px'; ov.style.width=r.width+'px'; ov.style.height=r.height+'px';
    ov.innerHTML='<div class="bf-wave w1"></div><div class="bf-wave w2"></div><div class="bf-wave w3"></div>';
    document.body.appendChild(ov);
    for(var i=0;i<8;i++){ var s=document.createElement('div'); s.className='bf-splash'; s.style.left=(Math.random()*r.width)+'px'; s.style.top=(r.height*0.5+Math.random()*r.height*0.4)+'px'; s.style.animationDelay=(Math.random()*0.4)+'s'; ov.appendChild(s); }
    setTimeout(function(){ if(ov.parentNode)ov.parentNode.removeChild(ov); },1400);
  }

  function fxFire(side,id){
    var c=centerOf(side,id); if(!c)return;
    var fb=document.createElement('div'); fb.className='bf-fireball'; fb.style.left=c.x+'px'; fb.style.top=c.y+'px'; spawn(fb,1000);
    var ring=document.createElement('div'); ring.className='bf-fire-ring'; ring.style.left=c.x+'px'; ring.style.top=c.y+'px'; spawn(ring,900);
    for(var i=0;i<14;i++){ var e=document.createElement('div'); e.className='bf-ember'; e.style.left=c.x+'px'; e.style.top=c.y+'px'; var ang=Math.random()*Math.PI*2, dist=60+Math.random()*90; e.style.setProperty('--dx',(Math.cos(ang)*dist)+'px'); e.style.setProperty('--dy',(Math.sin(ang)*dist)+'px'); e.style.animationDelay=(Math.random()*0.15)+'s'; spawn(e,950); }
  }

  function fxIce(side,id){
    var c=centerOf(side,id); if(!c)return;
    var r=panelRect(side,id);
    if(r){ var fo=document.createElement('div'); fo.className='bf-frost-overlay'; fo.style.left=r.left+'px'; fo.style.top=r.top+'px'; fo.style.width=r.width+'px'; fo.style.height=r.height+'px'; spawn(fo,1300); }
    var mist=document.createElement('div'); mist.className='bf-frost-mist'; mist.style.left=c.x+'px'; mist.style.top=c.y+'px'; spawn(mist,1200);
    for(var i=0;i<10;i++){ var sh=document.createElement('div'); sh.className='bf-ice-shard'; sh.style.left=(c.x+(Math.random()*60-30))+'px'; sh.style.top=(c.y+(Math.random()*40-20))+'px'; var ang=Math.random()*Math.PI*2, dist=40+Math.random()*70; sh.style.setProperty('--dx',(Math.cos(ang)*dist)+'px'); sh.style.setProperty('--dy',(Math.sin(ang)*dist)+'px'); sh.style.setProperty('--r',(Math.round(Math.random()*360))+'deg'); sh.style.animationDelay=(Math.random()*0.2)+'s'; spawn(sh,1100); }
  }

  function fxLightning(side,id){
    var c=centerOf(side,id); if(!c)return;
    var b=document.createElement('div'); b.className='bf-bolt'; b.style.left=c.x+'px'; b.style.top='0px'; b.style.height=c.y+'px'; spawn(b,700);
    var fl=document.createElement('div'); fl.className='bf-flash'; fl.style.left=(c.x-210)+'px'; fl.style.top=(c.y-210)+'px'; fl.style.width='420px'; fl.style.height='420px'; spawn(fl,500);
  }

  function hook(){
    if (typeof window.flushFx !== 'function' || window.flushFx.__bfSpellFx) return;
    var orig = window.flushFx;
    window.flushFx = function(list){
      try {
        if (list && list.length) {
          var seen = {};
          list.forEach(function(ev){
            if (!ev || ev.k !== 'spell') return;
            var el = ev.el;
            if (el === 'agua') { var key='w:'+ev.toSide; if(!seen[key]){ seen[key]=1; fxWater(ev.toSide, ev.toId); } }
            else if (el === 'fuego') fxFire(ev.toSide, ev.toId);
            else if (el === 'hielo') fxIce(ev.toSide, ev.toId);
            else if (el === 'rayo') fxLightning(ev.toSide, ev.toId);
            // Remate anime: sprite del hechizo (ola, bola de fuego, cristal,
            // rayo) + estrella de impacto + sacudida del objetivo.
            var A=window.__bfAnime;
            if(A){
              var c=centerOf(ev.toSide, ev.toId);
              if(c&&A.spriteBurst){
                if(el==='fuego')A.spriteFly('sp_fuego',{x:c.x-320,y:c.y-260},c,600,215);
                else if(el==='rayo')A.spriteFly('sp_rayo',{x:c.x,y:Math.max(-80,c.y-340)},c,430,190);
                else if(el==='hielo')A.spriteBurst('sp_hielo',c,215);
                else if(el==='agua'){ var ks='ws:'+ev.toSide; if(!seen[ks]){ seen[ks]=1; A.spriteBurst('sp_agua',c,300,1200); } }
              }
              if(c&&el!=='agua')setTimeout(function(){A.hitStar(c);},260);
              A.shake(ev.toSide, ev.toId);
            }
          });
        }
      } catch(e) {}
      return orig.apply(this, arguments);
    };
    window.flushFx.__bfSpellFx = 1;
  }

  var iv=setInterval(function(){ hook(); if(window.flushFx&&window.flushFx.__bfSpellFx)clearInterval(iv); },200);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook); else hook();
})();
</script>
`;