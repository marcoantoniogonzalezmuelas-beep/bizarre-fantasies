// Parche inyectado en el iframe: hechizo "Reanimación Arcana" (nº 109).
// Recupera un objeto aleatorio del mazo de usados (G.itemDescarte[side]) y lo
// devuelve a la mano. Se inyecta en SPELLS (comprable en la tienda de equipo),
// engancha castSpell para su kind 'bf_recover', y reproduce una cinemática 3D
// arcano-necromántica que se ve en ambos jugadores online (via flushFx).
export const RECOVER_SPELL_PATCH = `
<script>
(function(){
  if (window.__bfRecoverSpell) return;
  window.__bfRecoverSpell = true;

  var CINE_ART = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/41f320812_generated_image.png';

  var css = ''+
  '#bf-rec-cine{position:fixed;inset:0;z-index:100006;pointer-events:none;overflow:hidden;perspective:900px;animation:bfRcIn .3s ease-out}'+
  '#bf-rec-cine.bf-rc-out{transition:opacity .4s;opacity:0}'+
  '@keyframes bfRcIn{from{opacity:0}to{opacity:1}}'+
  '#bf-rec-cine .bf-rc-img{position:absolute;top:50%;left:50%;width:min(72vmin,600px);height:min(72vmin,600px);object-fit:contain;transform-style:preserve-3d;margin:calc(min(72vmin,600px)/-2) 0 0 calc(min(72vmin,600px)/-2);filter:drop-shadow(0 0 60px rgba(150,90,255,.85)) saturate(1.3) brightness(1.15);animation:bfRcImg 3s cubic-bezier(.2,.85,.3,1) forwards}'+
  '@media(max-width:900px){#bf-rec-cine .bf-rc-img{width:min(56vmin,440px);height:min(56vmin,440px);margin:calc(min(56vmin,440px)/-2) 0 0 calc(min(56vmin,440px)/-2)}}'+
  '@keyframes bfRcImg{0%{transform:rotateY(-90deg) translateZ(-700px) scale(.15);opacity:0}14%{opacity:1}32%{transform:rotateY(25deg) translateZ(-200px) scale(.7) translateY(8vh)}48%{transform:rotateY(-15deg) scale(1.15) translateY(-2vh)}62%{transform:rotateY(8deg) scale(1.1)}78%{transform:rotateY(-4deg) scale(1.18)}100%{transform:rotateY(0) scale(1.22) translateY(-6vh);opacity:1}}'+
  '#bf-rec-cine .bf-rc-ttl{position:absolute;top:8%;left:50%;transform:translateX(-50%);font-family:Cinzel,serif;font-weight:1000;font-size:clamp(22px,5vw,48px);letter-spacing:3px;white-space:nowrap;opacity:0;animation:bfRcTtl 2.8s ease-out .3s forwards;color:#c79bff;text-shadow:0 0 30px rgba(150,90,255,.95),0 4px 12px #000}'+
  '@keyframes bfRcTtl{0%{opacity:0;transform:translateX(-50%) scale(2)}15%{opacity:1;transform:translateX(-50%) scale(1)}82%{opacity:1}100%{opacity:0}}'+
  '#bf-rec-cine .bf-rc-flash{position:absolute;inset:0;background:radial-gradient(circle,rgba(180,120,255,.65),transparent 65%);animation:bfRcFlash .7s ease-out .25s both}'+
  '@keyframes bfRcFlash{0%{opacity:0}30%{opacity:1}100%{opacity:0}}'+
  '#bf-rec-cine .bf-rc-veil{position:absolute;inset:0;background:linear-gradient(180deg,transparent,rgba(0,0,0,.4),transparent);animation:bfRcVeil 2s ease-out forwards}'+
  '@keyframes bfRcVeil{0%{opacity:0}30%{opacity:.6}100%{opacity:0}}'+
  '.bf-rc-ring{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);border-radius:50%;border:3px solid #a06bff;box-shadow:0 0 22px rgba(160,107,255,.8);opacity:0;animation:bfRcRing 1.5s ease-out forwards}'+
  '@keyframes bfRcRing{0%{width:10%;height:10%;opacity:1;border-width:4px}100%{width:260%;height:260%;opacity:0;border-width:1px}}'+
  '.bf-rc-ember{position:absolute;bottom:-4%;width:8px;height:8px;border-radius:50%;background:#c06bff;box-shadow:0 0 12px rgba(160,107,255,.9);animation:bfRcEmber 1.8s ease-out infinite}'+
  '@keyframes bfRcEmber{0%{opacity:0;transform:translateY(0) scale(1)}20%{opacity:1}100%{opacity:0;transform:translateY(-80vh) translateX(var(--dx,0px)) scale(.3)}}'+
  '.bf-rc-chain{position:absolute;font-size:24px;opacity:0;animation:bfRcChain 1.8s ease-out forwards;filter:drop-shadow(0 0 10px rgba(120,255,160,.9))}'+
  '@keyframes bfRcChain{0%{opacity:0;transform:scale(.3) rotate(0)}25%{opacity:1;transform:scale(1.2) rotate(45deg)}100%{opacity:0;transform:scale(1.5) rotate(360deg)}}'+
  '.bf-rc-spark{position:absolute;bottom:10%;width:4px;height:4px;border-radius:50%;background:#bfffaa;box-shadow:0 0 10px #bfffaa,0 0 16px rgba(160,255,120,.8);opacity:0;animation:bfRcSpark 2s ease-out forwards}'+
  '@keyframes bfRcSpark{0%{opacity:0;transform:translateY(0) scale(.3)}15%{opacity:1}100%{opacity:0;transform:translateY(-90vh) scale(1.4) translateX(var(--dx,0px))}}'+
  '.bf-rc-beam{position:absolute;left:50%;top:-30%;width:55%;height:140%;transform:translateX(-50%);background:linear-gradient(180deg,transparent 0%,rgba(160,107,255,.55) 45%,rgba(160,107,255,.55) 55%,transparent 100%);filter:blur(6px);opacity:0;animation:bfRcBeam 2.4s ease-out forwards}'+
  '@keyframes bfRcBeam{0%{opacity:0;transform:translateX(-50%) scaleY(0)}20%{opacity:1;transform:translateX(-50%) scaleY(1)}75%{opacity:.8}100%{opacity:0;transform:translateX(-50%) scaleY(1.1)}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  function playRecoverCine(){
    var now=Date.now();
    if (document.getElementById('bf-rec-cine') || (window.__bfRecLast && now-window.__bfRecLast<3000)) return;
    window.__bfRecLast=now;
    var ov=document.createElement('div'); ov.id='bf-rec-cine';
    var html='<div class="bf-rc-veil"></div><div class="bf-rc-flash"></div><div class="bf-rc-beam"></div>';
    for (var r=0;r<4;r++) html+='<div class="bf-rc-ring" style="animation-delay:'+(r*0.22).toFixed(2)+'s"></div>';
    for (var i=0;i<20;i++) html+='<span class="bf-rc-ember" style="left:'+(4+Math.random()*92)+'%;--dx:'+((Math.random()*120-60).toFixed(0))+'px;animation-delay:'+(Math.random()*1.4).toFixed(2)+'s;width:'+(5+Math.random()*7)+'px;height:'+(5+Math.random()*7)+'px"></span>';
    for (var c=0;c<10;c++) html+='<span class="bf-rc-chain" style="left:'+(8+Math.random()*84)+'%;top:'+(12+Math.random()*70)+'%;animation-delay:'+(Math.random()*1).toFixed(2)+'s">⛓</span>';
    for (var s=0;s<14;s++) html+='<span class="bf-rc-spark" style="left:'+(4+Math.random()*92)+'%;--dx:'+((Math.random()*100-50).toFixed(0))+'px;animation-delay:'+(Math.random()*1.2).toFixed(2)+'s"></span>';
    html+='<img class="bf-rc-img" src="'+CINE_ART+'" alt="">';
    html+='<div class="bf-rc-ttl">¡REANIMACIÓN ARCANA!</div>';
    ov.innerHTML=html;
    document.body.appendChild(ov);
    setTimeout(function(){ov.classList.add('bf-rc-out');},2700);
    setTimeout(function(){if(ov.parentNode)ov.parentNode.removeChild(ov);},3150);
    var A=window.__bfAnime; if(A){var r2=ov.getBoundingClientRect(),c2={x:r2.left+r2.width/2,y:r2.top+r2.height/2}; if(A.speedLines)A.speedLines(c2);}
  }
  window.__bfPlayRecoverCine=playRecoverCine;

  // --- Inyecta el hechizo en SPELLS (comprable en la tienda de equipo) ---
  function injectSpell(){
    if (typeof SPELLS==='undefined' || !SPELLS) return false;
    if (SPELLS.some(function(s){return s&&s.id==='sp_recover';})) return true;
    // El nº/maná/texto los aporta la BD (Oráculo) via bfCardInfo; aquí sólo
    // se inyecta el hechizo con valores por defecto y syncRecover los actualiza.
    SPELLS.push({ id:'sp_recover', name:'Reanimación Arcana', element:'arcano', kind:'bf_recover', base:1, mana:12, cost:16, foil:true, num:0, txt:'Recupera un objeto aleatorio de tu mazo de usados y lo devuelve a tu mano.' });
    return true;
  }

  // Arte y datos de la BD (número/mana/texto/coste reales de la carta).
  // Se pide el mapa nombre → arte y nombre → info a la página padre, y se
  // registran en NUM_ART / SPELL_ART / CARD_NO por nº de BD para que el
  // hechizo inyectado dinámicamente se renderice igual que las cartas nativas.
  var RECOVER_ART = '', RECOVER_NUM = 0;
  window.addEventListener('message', function (e) {
    if (!e.data) return;
    if (e.data.bfArtMap && e.data.bfArtMap['Reanimación Arcana']) RECOVER_ART = e.data.bfArtMap['Reanimación Arcana'];
    if (e.data.bfCardInfo) { var info = e.data.bfCardInfo['Reanimación Arcana']; if (info && info.number != null) RECOVER_NUM = info.number; }
    if (e.data.bfArtMap || e.data.bfCardInfo) setTimeout(syncRecoverArt, 0);
  });
  try { window.parent.postMessage({ bfArtMapRequest: 1 }, '*'); } catch (e) {}

  // Sincroniza el arte del hechizo con la BD: registra el arte por nº de carta
  // único en NUM_ART, en SPELL_ART por índice y en CARD_NO por id, para que las
  // tres vías de lookup del juego (injectEquipArt, bfConfirm, handArtByName)
  // encuentren el arte igual que con las cartas nativas.
  function syncRecoverArt() {
    if (typeof SPELLS === 'undefined' || !SPELLS) return;
    var sp = null, spIdx = -1;
    for (var i = 0; i < SPELLS.length; i++) { if (SPELLS[i] && SPELLS[i].id === 'sp_recover') { sp = SPELLS[i]; spIdx = i; break; } }
    if (!sp) return;
    if (RECOVER_NUM) sp.num = RECOVER_NUM;
    if (RECOVER_ART && RECOVER_NUM && typeof NUM_ART !== 'undefined') { try { NUM_ART[String(RECOVER_NUM)] = RECOVER_ART; } catch (e) {} }
    if (RECOVER_ART && spIdx >= 0 && typeof SPELL_ART !== 'undefined') { try { SPELL_ART[spIdx] = RECOVER_ART; } catch (e) {} }
    if (sp.id && typeof CARD_NO !== 'undefined' && RECOVER_NUM) { try { CARD_NO[sp.id] = String(RECOVER_NUM).padStart(3, '0'); } catch (e) {} }
    if (RECOVER_ART) applyArtToChips();
    if (typeof window.injectHandArt === 'function') { try { window.injectHandArt(); } catch (e) {} }
  }

  // Aplica el arte directamente a los chips de la mano (fallback si el juego no
  // re-renderiza tras registrar el arte).
  function applyArtToChips() {
    document.querySelectorAll('.chip').forEach(function (chip) {
      var nameEl = chip.querySelector('.bf-chip-name');
      var name = nameEl ? nameEl.textContent.trim() : (chip.title || '');
      if (name !== 'Reanimación Arcana') return;
      chip.classList.add('bf-chip-card');
      var artLayer = chip.querySelector('.bf-chip-art-layer');
      if (!artLayer) { artLayer = document.createElement('div'); artLayer.className = 'bf-chip-art-layer'; chip.insertBefore(artLayer, chip.firstChild); }
      var cur = artLayer.style.backgroundImage || '';
      if (cur.indexOf(RECOVER_ART) < 0) { artLayer.style.backgroundImage = 'url("' + RECOVER_ART + '")'; artLayer.style.backgroundSize = 'cover'; artLayer.style.backgroundPosition = 'center'; }
    });
  }

  // --- Hook castSpell: maneja 'bf_recover' (recuperar objeto del descarte) ---
  var H={};
  function hookCast(){
    if (typeof window.castSpell!=='function' || H.cast) return;
    H.cast=1;
    var orig=window.castSpell;
    window.castSpell=function(id){
      try {
        var s=(typeof SPELLS!=='undefined')?byId(SPELLS,id):null;
        if (s && s.kind==='bf_recover') {
          if (typeof NET!=='undefined' && NET.role==='client') { sendIntent('castSpell',{id}); return; }
          var side=(typeof B!=='undefined'&&B&&B.current)?B.current.side:'p';
          var h=(typeof getHero==='function')?getHero(side,(B&&B.current)?B.current.id:null):null;
          if (!h) return;
          if (h.mana<s.mana) { if(typeof notif==='function')notif('Maná insuficiente'); return; }
          if (typeof G==='undefined'||!G) return;
          if (!G.itemDescarte) G.itemDescarte={p:[],o:[]};
          if (!G.itemDescarte[side]) G.itemDescarte[side]=[];
          // La pila de descartes guarda entradas {id,kind,name,num}. Sólo se
          // pueden reanimar objetos; bfDiscardPop saca uno aleatorio de la pila.
          var entry=(typeof window.bfDiscardPop==='function')?window.bfDiscardPop(side):null;
          if (!entry) { if(typeof notif==='function')notif('El mazo de usados está vacío.'); return; }
          h.mana-=s.mana;
          var recName=entry.name||'Objeto';
          if (entry.kind==='object') {
            // Objeto consumible: lo devuelve a la mano como objeto usable.
            var tmpl=(typeof OBJECTS!=='undefined')?byId(OBJECTS,entry.id):null;
            if (tmpl) { recName=tmpl.name; G.items[side].push((typeof deep==='function')?deep(tmpl):JSON.parse(JSON.stringify(tmpl))); }
          } else {
            // Equipo (arma/armadura): lo devuelve a la mano como objeto
            // recuperable — al usarlo se equipa gratis en el héroe actual.
            var arr=entry.kind==='mwep'?(typeof MELEE!=='undefined'?MELEE:[]):entry.kind==='rwep'?(typeof RANGED!=='undefined'?RANGED:[]):(typeof ARMORS!=='undefined'?ARMORS:[]);
            var eq=(typeof byId==='function')?byId(arr,entry.id):null;
            if (eq) {
              recName=eq.name;
              var rec=(typeof deep==='function')?deep(eq):JSON.parse(JSON.stringify(eq));
              rec._bfRecoveredEq=true; rec._bfSlot=entry.kind; rec.kind='object'; rec.num=entry.num||0;
              G.items[side].push(rec);
            }
          }
          if (typeof pushLog==='function') pushLog('lg',h.name+' reanima '+recName+' del mazo de usados.');
          if (typeof pushFx==='function') {
            pushFx({k:'bfcard',name:s.name,kind:'spell',side:side});
            pushFx({k:'bfrecover',side:side,name:recName,id:entry.id});
          }
          if (typeof notif==='function') notif(recName+' → mano');
          if (typeof finishAct==='function') finishAct();
          return;
        }
      } catch(e) {}
      return orig.apply(this,arguments);
    };
  }

  // --- Hook flushFx: cinemática + sync del descarte en el cliente ---
  function hookFlush(){
    if (typeof window.flushFx!=='function' || H.flush) return;
    H.flush=1;
    var orig=window.flushFx;
    window.flushFx=function(list){
      try {
        (list||[]).forEach(function(ev){
          if (!ev) return;
          if (ev.k==='bfrecover') {
            // Cliente: el descarte es local-derivado; el host ya quitó el objeto
            // al reanimarlo, así que quitamos de la pila local la entrada con ese id.
            if (typeof NET!=='undefined' && NET.role==='client' && typeof G!=='undefined' && G && G.itemDescarte && G.itemDescarte[ev.side]) {
              var arr=G.itemDescarte[ev.side];
              for(var j=0;j<arr.length;j++){ if(arr[j]&&arr[j].id===ev.id){ arr.splice(j,1); break; } }
            }
            try { playRecoverCine(); } catch(e){}
          }
        });
      } catch(e) {}
      return orig.apply(this,arguments);
    };
  }

  function hook(){ hookCast(); hookFlush(); }
  hook();
  var iv=setInterval(function(){ injectSpell(); hook(); },300);
  setTimeout(function(){ if (H.cast && H.flush) clearInterval(iv); }, 12000);
  // Sigue sincronizando el arte del hechizo periódicamente (cubre el caso en
  // que la mano se re-renderiza después de que llegaron los datos de la BD).
  setInterval(syncRecoverArt, 500);
})();
</script>
`;