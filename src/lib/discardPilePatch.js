// Parche inyectado en el iframe: pila ÚNICA de descartes en batalla.
// Se ancla a posición FIJA (abajo-izquierda) durante la batalla para que sea
// siempre visible. Muestra un mazo boca abajo con el reverso del juego + contador
// + tooltip. Hoy se descartan:
//  - Objetos consumidos (diff de G.items[side]).
//  - Armas/armaduras que un héroe pierde (diff de mwep/rwep/armor en
//    G.team[side] — p.ej. al transformarse un héroe en token).
// G.itemDescarte[side] = array de entradas { id, kind, name, num }.
export const DISCARD_PILE_PATCH = `
<script>
(function(){
  if (window.__bfDiscardPile) return;
  window.__bfDiscardPile = true;

  var CARD_BACK = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/47cb4e9b0_generated_image.png';

  // La pila de descartes es una carta más boca abajo (mismo reverso que la
  // mano del rival) con un borde de color distinto (naranja/ámbar) para
  // distinguirla de las cartas del jugador (dorado) y del rival (violeta).
  // Un pequeño badge muestra el nº de cartas descartadas.
  var css = ''+
  '.bf-discard-pile{display:inline-flex;flex-direction:column;align-items:center;gap:4px;margin:6px 0 0 10px;vertical-align:top;cursor:help;user-select:none;position:relative}'+
  '.bf-discard-stack{position:relative;border-radius:10px;overflow:hidden;background-image:url("'+CARD_BACK+'");background-size:cover;background-position:center;background-color:#120a1e;border:1.5px solid rgba(255,140,50,.7);box-shadow:0 4px 12px rgba(0,0,0,.6),0 0 10px rgba(255,140,50,.3);pointer-events:none}'+
  '.bf-discard-badge{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;border-radius:50%;background:linear-gradient(180deg,#ff8c32,#d4601a);border:1.5px solid #1a0e04;color:#fff;font-family:Rubik,sans-serif;font-size:10px;font-weight:900;display:flex;align-items:center;justify-content:center;padding:0 4px;box-shadow:0 2px 6px rgba(0,0,0,.6),0 0 8px rgba(255,140,50,.5);z-index:5;pointer-events:none}'+
  '.bf-discard-lbl{font-family:Cinzel,serif;font-size:8px;font-weight:900;color:rgba(255,140,50,.95);letter-spacing:.6px;text-transform:uppercase;text-shadow:0 1px 2px #000;white-space:nowrap}'+
  '@keyframes bfDiscardIn{from{opacity:0;transform:translateY(-16px) rotate(10deg) scale(.8)}to{opacity:1;transform:none}}.bf-discard-stack.bf-just{animation:bfDiscardIn .45s ease-out}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  function mySide(){ try{ if(typeof NET!=='undefined'&&NET.role==='client'&&NET.mySide) return NET.mySide; }catch(e){} return 'p'; }

  function ensurePile(side){
    if(typeof G==='undefined'||!G) return null;
    if(!G.itemDescarte) G.itemDescarte={p:[],o:[]};
    if(!G.itemDescarte[side]) G.itemDescarte[side]=[];
    return G.itemDescarte[side];
  }
  function findInList(list,id){ if(!list)return null; for(var i=0;i<list.length;i++) if(list[i]&&list[i].id===id) return list[i]; return null; }

  // ---- Diff de objetos consumidos (G.items) ----
  function idCounts(arr){var c={};(arr||[]).forEach(function(it){if(!it)return;var k=it.id||it.name;c[k]=(c[k]||0)+1;});return c;}
  var lastItems={p:null,o:null};
  function diffObjects(side){
    var pile=ensurePile(side); if(!pile||!G.items||!G.items[side]) return;
    var cur=idCounts(G.items[side]);
    if(!lastItems[side]){ lastItems[side]=cur; return; }
    var prev=lastItems[side];
    Object.keys(prev).forEach(function(id){
      var n=(prev[id]||0)-(cur[id]||0);
      if(n>0){
        var obj=findInList((typeof OBJECTS!=='undefined'?OBJECTS:[]),id);
        for(var k=0;k<n;k++) pile.push({id:id,kind:'object',name:obj?obj.name:'Objeto',num:(obj&&obj.num)||0});
        window.__bfDiscardJust=side;
      }
    });
    lastItems[side]=cur;
  }

  // ---- Diff de equipo (mwep/rwep/armor) por héroe ----
  function snapshotEq(side){
    var t=(typeof G!=='undefined'&&G&&G.team)?G.team[side]:null; if(!t) return null;
    var snap={};
    t.forEach(function(h){ if(!h)return; snap[h.id]={mwep:h.mwep?h.mwep.id:null,rwep:h.rwep?h.rwep.id:null,armor:h.armor?h.armor.id:null}; });
    return snap;
  }
  var lastEq={p:null,o:null};
  function diffEq(side){
    var pile=ensurePile(side); var cur=snapshotEq(side);
    if(!lastEq[side]){ lastEq[side]=cur; return; }
    var prev=lastEq[side]||{};
    Object.keys(prev).forEach(function(hid){
      var p=prev[hid]||{}, c=(cur&&cur[hid])||{};
      ['mwep','rwep','armor'].forEach(function(slot){
        if(p[slot]&&!c[slot]){
          var oldId=p[slot], item=null;
          if(slot==='mwep') item=findInList((typeof MELEE!=='undefined'?MELEE:[]),oldId);
          else if(slot==='rwep') item=findInList((typeof RANGED!=='undefined'?RANGED:[]),oldId);
          else item=findInList((typeof ARMORS!=='undefined'?ARMORS:[]),oldId);
          pile.push({id:oldId,kind:slot,name:item?item.name:'Equipo',num:(item&&item.num)||0});
          window.__bfDiscardJust=side;
        }
      });
    });
    lastEq[side]=cur;
  }

  // ---- Render fijo (idempotente: repecta al cambiar el conteo O el tamaño) ----
  var lastCount={p:-1,o:-1};
  var lastSize={p:0,o:0};
  // Las cartas de la mano se encogen cuando no es tu turno: la pila de
  // descartes ha de verse SIEMPRE al tamaño completo de carta de mano, así
  // que cacheamos el tamaño más grande medido y no dejamos que encoja.
  var maxW=0,maxH=0;
  function renderPile(side){
    var inB=!!(document.getElementById('s-battle')&&document.getElementById('s-battle').classList.contains('active'));
    var hand=document.getElementById('hand_'+side);
    if(!inB||!hand){ var e0=document.querySelector('.bf-discard-pile'); if(e0)e0.remove(); lastCount[side]=-1; lastSize[side]=0; return; }
    var count=ensurePile(side)?G.itemDescarte[side].length:0;
    var cw=0,ch=0;
    var refChip=hand.querySelector('.chip.bf-chip-card')||hand.querySelector('.chip');
    if(refChip){ var r=refChip.getBoundingClientRect(); if(r.width) cw=Math.round(r.width); if(r.height) ch=Math.round(r.height); }
    if(cw>maxW)maxW=cw; if(ch>maxH)maxH=ch;
    cw=maxW||cw||80; ch=maxH||ch||110;
    var sizeKey=cw*1000+ch;
    if(count===lastCount[side] && sizeKey===lastSize[side]) { var ex=hand.querySelector('.bf-discard-pile'); if(ex) return; }
    lastCount[side]=count; lastSize[side]=sizeKey;
    var ex=hand.querySelector('.bf-discard-pile'); if(ex)ex.remove();
    var pile=document.createElement('div'); pile.className='bf-discard-pile';
    pile.title='Pila de descartes · '+count+(count===1?' carta':' cartas');
    var just=(window.__bfDiscardJust===side);
    var html='<div class="bf-discard-stack'+(just?' bf-just':'')+'" style="width:'+cw+'px;height:'+ch+'px">';
    if(count===0) html+='<div style="position:absolute;inset:0;opacity:.45"></div>';
    html+='</div>';
    if(count>0) html+='<div class="bf-discard-badge">'+(count>99?'99+':count)+'</div>';
    html+='<div class="bf-discard-lbl">Descartes</div>';
    pile.innerHTML=html;
    var chips=hand.querySelectorAll('.hand-chips'); var ref=chips[chips.length-1];
    if(ref&&ref.parentNode===hand) hand.insertBefore(pile,ref.nextSibling); else hand.appendChild(pile);
    if(just) window.__bfDiscardJust=null;
  }

  // ---- API para Reanimación Arcana: saca un objeto aleatorio del descarte ----
  window.bfDiscardPop=function(side){
    var pile=ensurePile(side); if(!pile) return null;
    var objs=[]; pile.forEach(function(e){ if(e&&e.kind==='object') objs.push(e); });
    if(!objs.length) return null;
    var entry=objs[Math.floor(Math.random()*objs.length)];
    var idx=pile.indexOf(entry); if(idx>=0) pile.splice(idx,1);
    return entry;
  };

  function tick(){
    var inB=!!(document.getElementById('s-battle')&&document.getElementById('s-battle').classList.contains('active'));
    if(!inB){
      lastItems={p:null,o:null}; lastEq={p:null,o:null};
      var el=document.querySelector('.bf-discard-pile'); if(el)el.remove();
      lastCount={p:-1,o:-1}; lastSize={p:0,o:0}; return;
    }
    var side=mySide();
    try{ diffObjects(side); diffEq(side); }catch(e){}
    renderPile(side);
  }

  setInterval(tick,500);
  new MutationObserver(function(){ requestAnimationFrame(tick); }).observe(document.documentElement,{childList:true,subtree:true});
})();
</script>
`;