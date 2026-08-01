// Parche inyectado en el iframe: juego directo de cartas de la mano en batalla.
//  - Hechizos: si el héroe activo no tiene maná suficiente, la carta se atenúa
//    (gris + candado 🔒) y no se puede jugar. Con maná suficiente, al pulsar el
//    icono la carta se lanza DIRECTO con castSpell(id) (sin pasar por el menú de
//    hechizos): los hechizos con objetivo abren el picker del juego y los
//    automáticos (cura, escudo, bendición…) se aplican solos.
//  - Objetos: siempre jugables; abren el menú de objetos del juego (algunos
//    necesitan elegir aliado).
//  - Animación: la carta vuela desde la mano al centro del campo de batalla al
//    jugarse. La cinemática 3D (fénix, transformer…) y la exhibición de la carta
//    en el centro las gestionan los parches existentes al detectarse el efecto.
export const HAND_DIRECT_PLAY_PATCH = `
<script>
(function(){
  if (window.__bfHandDirectPlay) return;
  window.__bfHandDirectPlay = true;

  var css = ''+
  '.bf-fly-card{position:fixed;z-index:10050;border-radius:12px;background-size:cover;background-position:center;background-color:#07050b;border:2px solid rgba(255,210,74,.85);box-shadow:0 14px 34px rgba(0,0,0,.7),0 0 26px rgba(255,210,74,.5);pointer-events:none;transition:left .72s cubic-bezier(.2,.7,.3,1),top .72s cubic-bezier(.2,.7,.3,1),transform .72s ease,opacity .72s ease;will-change:left,top,transform,opacity}'+
  '.chip.bf-chip-card.bf-chip-no-mana{filter:grayscale(.9) brightness(.5);opacity:.55}'+
  '.chip.bf-chip-card.bf-chip-no-mana .bf-chip-art-layer,.chip.bf-chip-card.bf-chip-no-mana .bf-chip-fill{filter:grayscale(1) brightness(.45)!important}'+
  '.chip.bf-chip-card.bf-chip-no-mana .bf-chip-play{display:none!important}'+
  '.chip.bf-chip-card.bf-chip-no-mana::after{content:"\\1F512";position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:26px;z-index:6;filter:drop-shadow(0 2px 5px #000);pointer-events:none}'+
  '.chip.bf-chip-card .bf-chip-play.bf-chip-play-new{background:linear-gradient(180deg,#ffe27a,#FFD24A 55%,#c8901f)!important;border:2px solid #7c5410!important;color:#3a2600!important;box-shadow:0 4px 14px rgba(255,210,74,.55),inset 0 1px 2px rgba(255,255,255,.5)!important;width:40px!important;height:40px!important;font-weight:1000;animation:bfHandPlayPulse 1.8s ease-in-out infinite}'+
  '.chip.bf-chip-card .bf-chip-play.bf-chip-play-new .bf-chip-play-ico{font-size:18px;line-height:1;text-shadow:0 1px 1px rgba(255,255,255,.4)}'+
  '.chip.bf-chip-card.bf-chip-no-mana .bf-chip-play.bf-chip-play-new{animation:none}'+
  '@keyframes bfHandPlayPulse{0%,100%{box-shadow:0 4px 14px rgba(255,210,74,.55),inset 0 1px 2px rgba(255,255,255,.5)}50%{box-shadow:0 4px 22px rgba(255,210,74,.95),inset 0 1px 2px rgba(255,255,255,.6),0 0 20px rgba(255,210,74,.65)}}'+
  // Pila de objetos usados (descartes): mazo boca abajo junto a la mano.
  '.bf-discard-pile{display:inline-flex;flex-direction:column;align-items:center;gap:3px;margin:2px 0 0 10px;vertical-align:top;cursor:default}'+
  '.bf-discard-stack{position:relative;width:40px;height:56px}'+
  '.bf-discard-card{position:absolute;width:40px;height:56px;border-radius:6px;border:1.5px solid #5a3a0a;background:linear-gradient(135deg,#1c1230,#0a0512);box-shadow:0 2px 6px rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center}'+
  '.bf-discard-card::after{content:"\\2726";color:rgba(255,210,74,.3);font-size:16px}'+
  '.bf-discard-count{position:absolute;right:-7px;bottom:-7px;min-width:19px;height:19px;border-radius:10px;background:#FFD24A;color:#3a2600;font-size:11px;font-weight:900;display:flex;align-items:center;justify-content:center;padding:0 5px;box-shadow:0 2px 5px rgba(0,0,0,.6);border:1px solid #7c5410}'+
  '.bf-discard-lbl{font-size:8.5px;font-weight:800;color:#a78be0;letter-spacing:.5px;text-transform:uppercase;text-shadow:0 1px 2px #000;white-space:nowrap}'+
  '@keyframes bfDiscardIn{from{opacity:0;transform:translateY(-14px) rotate(8deg) scale(.8)}to{opacity:1;transform:none}}.bf-discard-stack.bf-just{animation:bfDiscardIn .4s ease-out}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  function mySide(){ try{ if(typeof NET!=='undefined'&&NET.role==='client'&&NET.mySide) return NET.mySide; }catch(e){} return 'p'; }
  function activeMana(){ var a=document.querySelector('.bhero.active-turn'); if(!a) return null; var mp=a.querySelector('.mp-num'); var m=mp?String(mp.textContent).match(/-?\\d+/):null; return m?parseInt(m[0],10):null; }
  function activeSide(){ var a=document.querySelector('.bhero.active-turn'); return a?(String(a.id||'').split('_')[1]||'p'):null; }
  function findByName(name){ var key=(name||'').trim(); if(!key) return null; var sp=(typeof SPELLS!=='undefined'?SPELLS:[]).find(function(s){return s&&s.name===key;}); if(sp) return {item:sp,kind:'spell'}; var ob=(typeof OBJECTS!=='undefined'?OBJECTS:[]).find(function(o){return o&&o.name===key;}); if(ob) return {item:ob,kind:'object'}; return null; }
  function manaOf(it){ try{ if(typeof window.bfManaFor==='function') return window.bfManaFor(it); }catch(e){} return (it&&it.mana!=null)?it.mana:null; }

  function flyChip(chip){
    var art=chip.querySelector('.bf-chip-art-layer');
    var bg=art&&art.style.backgroundImage;
    var m=bg?bg.match(/url\\(["']?(.*?)["']?\\)/):null;
    var url=m?m[1]:'';
    var r=chip.getBoundingClientRect();
    var fly=document.createElement('div');fly.className='bf-fly-card';
    if(url) fly.style.backgroundImage='url("'+url+'")';
    fly.style.left=r.left+'px';fly.style.top=r.top+'px';fly.style.width=r.width+'px';fly.style.height=r.height+'px';
    document.body.appendChild(fly);
    var battle=document.getElementById('s-battle');var tx=window.innerWidth/2,ty=window.innerHeight*0.42;
    if(battle){var br=battle.getBoundingClientRect();tx=br.left+br.width/2;ty=br.top+br.height*0.42;}
    void fly.offsetWidth;
    requestAnimationFrame(function(){fly.style.left=(tx-70)+'px';fly.style.top=(ty-95)+'px';fly.style.transform='scale(1.45) rotate('+(Math.random()*20-10)+'deg)';fly.style.opacity='0';});
    setTimeout(function(){if(fly.parentNode)fly.parentNode.removeChild(fly);},820);
  }

  // ---- Pila de descartes (objetos usados) ----
  // Cuando un objeto se consume (desaparece de G.items[side]) se mueve a
  // G.itemDescarte[side] (array de ids). Se sincroniza por diff de G.items
  // (que ya viaja en el snapshot online), así no hace falta tocar netSync.
  function idCounts(arr){var c={};(arr||[]).forEach(function(it){if(!it)return;var k=it.id||it.name;c[k]=(c[k]||0)+1;});return c;}
  var dBattle=false,lastCounts=null,dJustSide=null;
  function syncDiscard(){
    if(typeof G==='undefined'||!G||!G.items) return;
    var inB=!!(document.getElementById('s-battle')&&document.getElementById('s-battle').classList.contains('active'));
    if(!inB){dBattle=false;lastCounts=null;return;}
    if(!dBattle){
      if(!G.itemDescarte) G.itemDescarte={p:[],o:[]};
      lastCounts={p:idCounts(G.items.p),o:idCounts(G.items.o)};
      dBattle=true; return;
    }
    if(!G.itemDescarte) G.itemDescarte={p:[],o:[]};
    ['p','o'].forEach(function(sd){
      var cur=idCounts(G.items[sd]),prev=lastCounts[sd]||{};
      Object.keys(prev).forEach(function(id){var c=prev[id]-(cur[id]||0);if(c>0){for(var i=0;i<c;i++)G.itemDescarte[sd].push(id);dJustSide=sd;}});
      lastCounts[sd]=cur;
    });
  }
  // Caché del último conteo pintado por lado: solo tocamos el DOM cuando
  // cambia. Si reescribimos la pila en cada callback del MutationObserver de
  // documentElement, el propio observer se dispara por nuestras mutaciones y
  // entra en un bucle de retroalimentación que congela la página al arrancar
  // la batalla.
  var lastDiscardCount={p:-1,o:-1};
  function renderDiscardPile(side){
    var hand=document.getElementById('hand_'+side); if(!hand){ lastDiscardCount[side]=-1; return; }
    if(typeof G==='undefined'||!G||!G.itemDescarte){ var ex0=hand.querySelector('.bf-discard-pile'); if(ex0)ex0.remove(); lastDiscardCount[side]=-1; return; }
    var count=(G.itemDescarte[side]||[]).length;
    if(count<=0){
      var ex=hand.querySelector('.bf-discard-pile'); if(ex)ex.remove();
      lastDiscardCount[side]=-1; return;
    }
    if(count===lastDiscardCount[side]) return; // sin cambios → no mutamos
    lastDiscardCount[side]=count;
    var ex2=hand.querySelector('.bf-discard-pile'); if(ex2)ex2.remove();
    var pile=document.createElement('div'); pile.className='bf-discard-pile'; pile.title='Objetos usados · '+count;
    pile.innerHTML='<div class="bf-discard-stack'+(dJustSide===side?' bf-just':'')+'"><div class="bf-discard-card" style="top:3px;left:3px"></div><div class="bf-discard-card" style="top:0;left:0"></div><span class="bf-discard-count">'+count+'</span></div><div class="bf-discard-lbl">Usados</div>';
    var chips=hand.querySelectorAll('.hand-chips'); var ref=chips[chips.length-1];
    if(ref&&ref.parentNode===hand) hand.insertBefore(pile,ref.nextSibling); else hand.appendChild(pile);
  }
  // Hook para una futura habilidad de "recuperar objeto": saca el último objeto
  // descartado del lado indicado y devuelve su id para re-añadirlo a la mano.
  window.bfDiscardPop=function(side){ if(typeof G==='undefined'||!G||!G.itemDescarte) return null; var arr=G.itemDescarte[side]||[]; return arr.length?arr.pop():null; };

  function process(){
    var side=mySide();
    var inBattle=!!(document.getElementById('s-battle')&&document.getElementById('s-battle').classList.contains('active'));
    var mana=activeMana(),aSide=activeSide();
    document.querySelectorAll('#hand_'+side+' .chip.bf-chip-card').forEach(function(chip){
      var nameEl=chip.querySelector('.bf-chip-name');
      var name=nameEl?nameEl.textContent.trim():(chip.title||'');
      var found=findByName(name);
      var kind=found?found.kind:'spell';
      // Maná: atenuiza los hechizos cuando es el turno del jugador y falta maná.
      if(kind==='spell'){
        var cost=found?manaOf(found.item):null;
        if(inBattle&&aSide===side&&mana!=null&&cost!=null&&Number(cost)>Number(mana)) chip.classList.add('bf-chip-no-mana');
        else chip.classList.remove('bf-chip-no-mana');
      } else chip.classList.remove('bf-chip-no-mana');
      // Sustituye el botón de jugar por uno propio (sin listeners del juego) que
      // lanza directo con castSpell(id), saltándose el menú de hechizos.
      var play=chip.querySelector('.bf-chip-play');
      if(play&&play.dataset.bfDirect!=='1'){
        var np=play.cloneNode(true);
        np.dataset.bfDirect='1';
        np.classList.add('bf-chip-play-new');
        np.innerHTML='<span class="bf-chip-play-ico">▶</span>';
        np.addEventListener('click',function(e){
          e.stopPropagation();e.preventDefault();
          if(chip.classList.contains('bf-chip-no-mana')){ if(typeof notif==='function') notif('Maná insuficiente para lanzar este hechizo.'); return; }
          var f2=findByName(name);var id=f2&&f2.item?f2.item.id:'';
          flyChip(chip);
          if(kind==='spell'&&typeof window.castSpell==='function'){
            setTimeout(function(){ try{window.castSpell(id);}catch(err){} },340);
          } else if(kind==='object'){
            // Objetos: siempre jugables. Se usan directo con useItem(idx) (índice
            // en G.items[side]); el juego elige objetivo si lo necesita y
            // consume la carta (desaparece de la mano al re-renderizar).
            var bSide=(typeof B!=='undefined'&&B&&B.current)?(B.current.side||side):side;
            if(bSide!==side){ if(typeof notif==='function') notif('Espera tu turno para usar objetos.'); return; }
            var items=(typeof G!=='undefined'&&G&&G.items)?(G.items[side]||[]):[];
            var oIdx=-1;
            for(var k=0;k<items.length;k++){ if(items[k]&&items[k].name===name){ oIdx=k; break; } }
            if(oIdx>=0&&typeof window.useItem==='function'){
              setTimeout(function(){ try{window.useItem(oIdx);}catch(err){ if(typeof window.actItemMenu==='function')window.actItemMenu(); } },340);
            } else if(typeof window.actItemMenu==='function'){
              setTimeout(function(){ window.actItemMenu(); },340);
            }
          }
        });
        play.parentNode.replaceChild(np,play);
      }
    });
    if(inBattle){ syncDiscard(); renderDiscardPile(side); if(dJustSide) dJustSide=null; }
  }

  new MutationObserver(function(){ requestAnimationFrame(process); }).observe(document.documentElement,{childList:true,subtree:true});
  setInterval(process,600);
})();
</script>
`;