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
    '.bf-wave.w1{bottom:-25%;animation:bfWaveRise 2.3s cubic-bezier(.3,.7,.4,1) forwards}',
    '.bf-wave.w2{bottom:-40%;animation:bfWaveRise 2.3s .09s cubic-bezier(.3,.7,.4,1) forwards;opacity:.62;background:repeating-linear-gradient(90deg,rgba(130,205,255,.5) 0 30px,rgba(55,145,230,.35) 30px 60px)}',
    '.bf-wave.w3{bottom:-52%;animation:bfWaveRise 2.3s .18s cubic-bezier(.3,.7,.4,1) forwards;opacity:.4}',
    '@keyframes bfWaveRise{0%{transform:translateY(45%) translateX(-6%);opacity:0}25%{opacity:.85}100%{transform:translateY(-12%) translateX(8%);opacity:0}}',
    '.bf-splash{position:absolute;width:26px;height:26px;border-radius:50%;background:radial-gradient(circle,#cfeaff,rgba(90,180,255,.2) 60%,transparent 70%);animation:bfSplash 2s ease-out forwards}',
    '@keyframes bfSplash{0%{opacity:0;transform:scale(.2)}30%{opacity:1}100%{opacity:0;transform:scale(1.6) translateY(-22px)}}',
    // ---- Fuego: bola de fuego + anillo + brasas ----
    '.bf-fireball{position:fixed;pointer-events:none;z-index:90022;width:10px;height:10px;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,#ffe27a 0%,#ff8a2a 42%,#ff3a14 68%,transparent 78%);animation:bfFireball 2s ease-out forwards;filter:drop-shadow(0 0 18px rgba(255,120,30,.95))}',
    '@keyframes bfFireball{0%{transform:translate(-50%,-50%) scale(.3);opacity:0}18%{opacity:1}55%{transform:translate(-50%,-50%) scale(5)}72%{transform:translate(-50%,-50%) scale(6.2);opacity:.9}100%{transform:translate(-50%,-50%) scale(7);opacity:0}}',
    '.bf-fire-ring{position:fixed;pointer-events:none;z-index:90021;width:10px;height:10px;border-radius:50%;transform:translate(-50%,-50%);border:4px solid rgba(255,140,40,.9);animation:bfFireRing 1.9s ease-out forwards}',
    '@keyframes bfFireRing{0%{transform:translate(-50%,-50%) scale(.4);opacity:0}25%{opacity:1}100%{transform:translate(-50%,-50%) scale(12);opacity:0;border-width:1px}}',
    '.bf-ember{position:fixed;pointer-events:none;z-index:90023;width:14px;height:14px;border-radius:50%;background:radial-gradient(circle,#ffe27a,#ff6a14 60%,transparent 70%);animation:bfEmber 1.9s ease-out forwards}',
    '@keyframes bfEmber{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(calc(-50% + var(--dx,0)),calc(-50% + var(--dy,0))) scale(.2);opacity:0}}',
    // ---- Hielo: escarcha + cristales + niebla ----
    '.bf-frost-overlay{position:fixed;pointer-events:none;z-index:90021;border-radius:12px;background:linear-gradient(180deg,rgba(185,232,255,.22),rgba(120,200,255,.12));box-shadow:inset 0 0 40px rgba(150,220,255,.3),inset 0 0 0 3px rgba(200,240,255,.4);animation:bfFrost 2.3s ease-out forwards}',
    '@keyframes bfFrost{0%{opacity:0}25%{opacity:1}70%{opacity:1}100%{opacity:0}}',
    '.bf-frost-mist{position:fixed;pointer-events:none;z-index:90022;width:200px;height:200px;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(205,238,255,.72),rgba(150,210,255,.2) 55%,transparent 72%);animation:bfFrostMist 2.2s ease-out forwards;filter:blur(3px)}',
    '@keyframes bfFrostMist{0%{transform:translate(-50%,-50%) scale(.3);opacity:0}30%{opacity:.9}100%{transform:translate(-50%,-50%) scale(2.4);opacity:0}}',
    '.bf-ice-shard{position:fixed;pointer-events:none;z-index:90024;width:24px;height:58px;transform:translate(-50%,-50%);background:linear-gradient(180deg,#eaf8ff,#7fc6ff 55%,#3a9fe0);clip-path:polygon(50% 0,72% 30%,72% 70%,50% 100%,28% 70%,28% 30%);filter:drop-shadow(0 0 6px rgba(150,220,255,.85));animation:bfIceShard 2.1s ease-out forwards}',
    '@keyframes bfIceShard{0%{transform:translate(-50%,-50%) scale(.2) rotate(var(--r,0deg));opacity:0}20%{opacity:1}100%{transform:translate(calc(-50% + var(--dx,0)),calc(-50% + var(--dy,0))) scale(.9) rotate(var(--r,0deg));opacity:0}}',
    // ---- Rayo: relámpago zigzag + destello ----
    '.bf-bolt{position:fixed;pointer-events:none;z-index:90025;width:80px;transform:translateX(-50%);background:linear-gradient(180deg,#fff,#ffe14a 30%,#fff 60%,#bfe0ff);filter:drop-shadow(0 0 8px rgba(255,225,74,1)) drop-shadow(0 0 20px rgba(120,200,255,.85));clip-path:polygon(55% 0,78% 16%,45% 30%,70% 48%,38% 64%,62% 80%,38% 100%,28% 80%,52% 64%,28% 48%,55% 30%,28% 16%);animation:bfBolt 1.7s ease-out forwards}',
    '@keyframes bfBolt{0%{opacity:0}8%{opacity:1}18%{opacity:.3}28%{opacity:1}42%{opacity:.5}100%{opacity:0}}',
    '.bf-flash{position:fixed;pointer-events:none;z-index:90020;border-radius:50%;background:radial-gradient(circle,rgba(255,225,120,.55),rgba(180,220,255,.22) 50%,transparent 75%);animation:bfFlash 1.5s ease-out forwards}',
    '@keyframes bfFlash{0%{opacity:0}15%{opacity:.55}100%{opacity:0}}',
    // ---- Arcano: explosión mágica violeta + anillo + orbes que ascienden + runas ----
    '.bf-arcane-burst{position:fixed;pointer-events:none;z-index:90022;width:10px;height:10px;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,#f4d6ff,#c084ff 42%,#7a2cff 68%,transparent 78%);animation:bfArcaneBurst 2s ease-out forwards;filter:drop-shadow(0 0 20px rgba(180,90,255,.95))}',
    '@keyframes bfArcaneBurst{0%{transform:translate(-50%,-50%) scale(.3);opacity:0}18%{opacity:1}55%{transform:translate(-50%,-50%) scale(5)}72%{transform:translate(-50%,-50%) scale(6.4);opacity:.9}100%{transform:translate(-50%,-50%) scale(7.2);opacity:0}}',
    '.bf-arcane-ring{position:fixed;pointer-events:none;z-index:90021;width:10px;height:10px;border-radius:50%;transform:translate(-50%,-50%);border:4px solid rgba(190,120,255,.9);animation:bfArcaneRing 1.9s ease-out forwards}',
    '@keyframes bfArcaneRing{0%{transform:translate(-50%,-50%) scale(.4);opacity:0}25%{opacity:1}100%{transform:translate(-50%,-50%) scale(12);opacity:0;border-width:1px}}',
    '.bf-arcane-orb{position:fixed;pointer-events:none;z-index:90023;width:12px;height:12px;border-radius:50%;background:radial-gradient(circle,#f0c8ff,#a85cff 55%,transparent 72%);box-shadow:0 0 14px rgba(180,90,255,.9);animation:bfArcaneOrb 1.9s ease-out forwards}',
    '@keyframes bfArcaneOrb{0%{transform:translate(-50%,-50%) scale(1);opacity:1}100%{transform:translate(calc(-50% + var(--dx,0)),calc(-50% + var(--dy,-120px))) scale(.3);opacity:0}}',
    '.bf-arcane-rune{position:fixed;pointer-events:none;z-index:90024;font-size:22px;color:#e0b8ff;text-shadow:0 0 12px rgba(190,120,255,.95),0 0 20px rgba(140,60,220,.6);animation:bfArcaneRune 2.2s ease-out forwards}',
    '@keyframes bfArcaneRune{0%{opacity:0;transform:translate(-50%,-50%) scale(.4) rotate(0)}20%{opacity:1}100%{opacity:0;transform:translate(calc(-50% + var(--dx,0)),calc(-50% + var(--dy,-90px))) scale(1.3) rotate(60deg)}}',
    // ---- Luz: destello blanco-amarillo a pantalla completa (1s) ----
    '.bf-light-flash{position:fixed;pointer-events:none;z-index:90030;inset:0;background:radial-gradient(circle at 50% 45%,rgba(255,250,210,.88),rgba(255,235,150,.5) 35%,rgba(255,220,90,.18) 60%,transparent 80%);animation:bfLightFlash 1s ease-out forwards}',
    '@keyframes bfLightFlash{0%{opacity:0}12%{opacity:1}100%{opacity:0}}'
  ].join('');
  document.head.appendChild(st);

  function centerOf(side,id){ var el=document.getElementById('b_'+side+'_'+id); if(!el)return null; var r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; }
  function panelRect(side,id){ var el=document.getElementById('b_'+side+'_'+id); if(!el)return null; var p=el.closest('.army-panel'); if(!p)return null; return p.getBoundingClientRect(); }
  function spawn(node,ms){ (window.__bfAppend||function(n){document.body.appendChild(n);})(node); setTimeout(function(){ if(node&&node.parentNode)node.parentNode.removeChild(node); },ms||1300); }

  function fxWater(side,id){
    var r=panelRect(side,id); if(!r)return;
    var ov=document.createElement('div'); ov.className='bf-wave-overlay';
    ov.style.left=r.left+'px'; ov.style.top=r.top+'px'; ov.style.width=r.width+'px'; ov.style.height=r.height+'px';
    ov.innerHTML='<div class="bf-wave w1"></div><div class="bf-wave w2"></div><div class="bf-wave w3"></div>';
    (window.__bfAppend||function(n){document.body.appendChild(n);})(ov);
    for(var i=0;i<8;i++){ var s=document.createElement('div'); s.className='bf-splash'; s.style.left=(Math.random()*r.width)+'px'; s.style.top=(r.height*0.5+Math.random()*r.height*0.4)+'px'; s.style.animationDelay=(Math.random()*0.4)+'s'; ov.appendChild(s); }
    setTimeout(function(){ if(ov.parentNode)ov.parentNode.removeChild(ov); },2400);
  }

  function fxFire(side,id){
    var c=centerOf(side,id); if(!c)return;
    var fb=document.createElement('div'); fb.className='bf-fireball'; fb.style.left=c.x+'px'; fb.style.top=c.y+'px'; spawn(fb,2000);
    var ring=document.createElement('div'); ring.className='bf-fire-ring'; ring.style.left=c.x+'px'; ring.style.top=c.y+'px'; spawn(ring,1900);
    for(var i=0;i<14;i++){ var e=document.createElement('div'); e.className='bf-ember'; e.style.left=c.x+'px'; e.style.top=c.y+'px'; var ang=Math.random()*Math.PI*2, dist=60+Math.random()*90; e.style.setProperty('--dx',(Math.cos(ang)*dist)+'px'); e.style.setProperty('--dy',(Math.sin(ang)*dist)+'px'); e.style.animationDelay=(Math.random()*0.15)+'s'; spawn(e,1950); }
  }

  function fxIce(side,id){
    var c=centerOf(side,id); if(!c)return;
    var r=panelRect(side,id);
    if(r){ var fo=document.createElement('div'); fo.className='bf-frost-overlay'; fo.style.left=r.left+'px'; fo.style.top=r.top+'px'; fo.style.width=r.width+'px'; fo.style.height=r.height+'px'; spawn(fo,2300); }
    var mist=document.createElement('div'); mist.className='bf-frost-mist'; mist.style.left=c.x+'px'; mist.style.top=c.y+'px'; spawn(mist,2200);
    for(var i=0;i<10;i++){ var sh=document.createElement('div'); sh.className='bf-ice-shard'; sh.style.left=(c.x+(Math.random()*60-30))+'px'; sh.style.top=(c.y+(Math.random()*40-20))+'px'; var ang=Math.random()*Math.PI*2, dist=40+Math.random()*70; sh.style.setProperty('--dx',(Math.cos(ang)*dist)+'px'); sh.style.setProperty('--dy',(Math.sin(ang)*dist)+'px'); sh.style.setProperty('--r',(Math.round(Math.random()*360))+'deg'); sh.style.animationDelay=(Math.random()*0.2)+'s'; spawn(sh,2100); }
  }

  function fxLightning(side,id){
    var c=centerOf(side,id); if(!c)return;
    var b=document.createElement('div'); b.className='bf-bolt'; b.style.left=c.x+'px'; b.style.top='0px'; b.style.height=c.y+'px'; spawn(b,1700);
    var fl=document.createElement('div'); fl.className='bf-flash'; fl.style.left=(c.x-210)+'px'; fl.style.top=(c.y-210)+'px'; fl.style.width='420px'; fl.style.height='420px'; spawn(fl,1500);
  }

  function fxArcane(side,id){
    var c=centerOf(side,id); if(!c)return;
    var b=document.createElement('div'); b.className='bf-arcane-burst'; b.style.left=c.x+'px'; b.style.top=c.y+'px'; spawn(b,2000);
    var ring=document.createElement('div'); ring.className='bf-arcane-ring'; ring.style.left=c.x+'px'; ring.style.top=c.y+'px'; spawn(ring,1900);
    for(var i=0;i<16;i++){ var o=document.createElement('div'); o.className='bf-arcane-orb'; o.style.left=c.x+'px'; o.style.top=c.y+'px'; var ang=Math.random()*Math.PI*2, dist=50+Math.random()*100; o.style.setProperty('--dx',(Math.cos(ang)*dist)+'px'); o.style.setProperty('--dy',(-60-Math.random()*100)+'px'); o.style.animationDelay=(Math.random()*0.15)+'s'; spawn(o,1950); }
    var runes=['\\u2726','\\u2727','\\u2731','\\u2734','\\u2735','\\u2748'];
    for(var r=0;r<10;r++){ var ru=document.createElement('div'); ru.className='bf-arcane-rune'; ru.textContent=runes[Math.floor(Math.random()*runes.length)]; ru.style.left=c.x+'px'; ru.style.top=c.y+'px'; var ang2=Math.random()*Math.PI*2, dist2=40+Math.random()*80; ru.style.setProperty('--dx',(Math.cos(ang2)*dist2)+'px'); ru.style.setProperty('--dy',(-50-Math.random()*90)+'px'); ru.style.animationDelay=(Math.random()*0.2)+'s'; spawn(ru,2100); }
  }

  function fxLight(){
    var ov=document.createElement('div'); ov.className='bf-light-flash';
    (window.__bfAppend||function(n){document.body.appendChild(n);})(ov);
    setTimeout(function(){ if(ov.parentNode) ov.parentNode.removeChild(ov); },1100);
  }

  function hook(){
    if (typeof window.flushFx !== 'function' || window.__bfSpellFxDone) return;
    window.__bfSpellFxDone = 1;
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
            else if (el === 'arcano') fxArcane(ev.toSide, ev.toId);
            else if (el === 'luz') fxLight();
            // Remate anime: sprite del hechizo (ola, bola de fuego, cristal,
            // rayo) + estrella de impacto + sacudida del objetivo.
            var A=window.__bfAnime;
            if(A){
              var c=centerOf(ev.toSide, ev.toId);
              if(c&&A.spriteBurst){
                if(el==='fuego')A.spriteFly('sp_fuego',{x:c.x-320,y:c.y-260},c,1600,215);
                else if(el==='rayo')A.spriteFly('sp_rayo',{x:c.x,y:Math.max(-80,c.y-340)},c,1430,190);
                else if(el==='hielo')A.spriteBurst('sp_hielo',c,215);
                else if(el==='agua'){ var ks='ws:'+ev.toSide; if(!seen[ks]){ seen[ks]=1; A.spriteBurst('sp_agua',c,300,2200); } }
              }
              if(c&&el!=='agua')setTimeout(function(){A.hitStar(c);},260);
              A.shake(ev.toSide, ev.toId);
            }
          });
        }
      } catch(e) {}
      // Filtra los hechizos ARCANOS antes de pasarlos al motor nativo: el nativo
      // no conoce 'arcano' y lo renderiza como AGUA por defecto. Así solo se ve
      // nuestro FX mágico violeta (orbes + runas + anillo), sin el agua nativa.
      var args = Array.prototype.slice.call(arguments);
      args[0] = (list || []).filter(function(ev){ return !(ev && ev.k === 'spell' && ev.el === 'arcano'); });
      return orig.apply(this, args);
    };
    window.flushFx.__bfSpellFx = 1;
  }

  var sTries=0;
  var iv=setInterval(function(){ hook(); if(window.__bfSpellFxDone||sTries++>150)clearInterval(iv); },200);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook); else hook();
})();
</script>
`;