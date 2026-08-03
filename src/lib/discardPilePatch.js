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

  // La pila de descartes es una carta boca abajo igual que las del rival:
  // mismo reverso, mismo borde violeta, mismo shadow. Selector de alta
  // especificidad #s-battle #hand_p .bf-discard-card + !important para
  // pisar el CSS del juego. El badge y la etiqueta van fuera de la carta
  // (siblings, no children) para que no los oculte el display:none.
  var css = ''+
  '.bf-discard-pile{display:inline-flex;flex-direction:column;align-items:center;gap:4px;margin:6px 0 0 10px;vertical-align:top;cursor:help;user-select:none;position:relative}'+
  '#s-battle .bf-discard-card{position:relative!important;border-radius:10px!important;overflow:hidden!important;background-image:url("'+CARD_BACK+'")!important;background-size:cover!important;background-position:center!important;background-color:#120a1e!important;border:1.5px solid rgba(192,107,255,.65)!important;box-shadow:0 4px 12px rgba(0,0,0,.6),0 0 10px rgba(160,80,255,.28)!important;pointer-events:none!important;outline:none!important;cursor:default!important}'+
  // Tamaño FIJO igual que una carta de la mano (.chip.bf-chip-card). Antes se
  // medía el chip de la mano en cada tick: al principio (mano vacía) el chip de
  // referencia era el placeholder "—" y luego pasaba a ser una carta real, así
  // que la pila cambiaba de tamaño en mitad de la partida y el reverso se veía
  // recortado/estirado de forma distinta. Con medidas fijas el arte es siempre
  // el mismo.
  '#s-battle .bf-discard-card{width:88px!important;height:120px!important}'+
  '@media(min-width:641px) and (max-width:1024px){#s-battle .bf-discard-card{width:96px!important;height:131px!important}}'+
  '@media(max-width:420px){#s-battle .bf-discard-card{width:76px!important;height:104px!important}}'+
  '#s-battle .bf-discard-card > *:not(.bf-discard-back){display:none!important}'+
  '#s-battle .bf-discard-back{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}'+
  '.bf-discard-badge{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;border-radius:50%;background:linear-gradient(180deg,#ff8c32,#d4601a);border:1.5px solid #1a0e04;color:#fff;font-family:Rubik,sans-serif;font-size:10px;font-weight:900;display:flex;align-items:center;justify-content:center;padding:0 4px;box-shadow:0 2px 6px rgba(0,0,0,.6),0 0 8px rgba(255,140,50,.5);z-index:5;pointer-events:none}'+
  '.bf-discard-lbl{font-family:Cinzel,serif;font-size:8px;font-weight:900;color:rgba(192,107,255,.95);letter-spacing:.6px;text-transform:uppercase;text-shadow:0 1px 2px #000;white-space:nowrap}'+
  '@keyframes bfDiscardIn{from{opacity:0;transform:translateY(-16px) rotate(10deg) scale(.8)}to{opacity:1;transform:none}}.bf-discard-card.bf-just{animation:bfDiscardIn .45s ease-out}';
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
  var lastItemsRef={p:null,o:null};
  function diffObjects(side){
    var pile=ensurePile(side); if(!pile||!G.items||!G.items[side]) return;
    var arr=G.items[side];
    var cur=idCounts(arr);
    // Si el ARRAY ha sido sustituido (snapshot de red, reinicio de partida,
    // paso de equipamiento a batalla), no es un descarte real: solo
    // rebasamos la referencia. Antes esto contaba decenas de cartas
    // fantasma en el contador aunque no se hubiera usado ninguna.
    if(lastItemsRef[side]!==arr){ lastItemsRef[side]=arr; lastItems[side]=cur; return; }
    if(!lastItems[side]){ lastItems[side]=cur; return; }
    var prev=lastItems[side];
    Object.keys(prev).forEach(function(id){
      var n=(prev[id]||0)-(cur[id]||0);
      if(n>3) n=0; // caída masiva = resincronización, no consumo real
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
  var lastEqRef={p:null,o:null};
  function heroById(side,hid){
    var t=(G&&G.team)?(G.team[side]||[]):[];
    for(var i=0;i<t.length;i++) if(t[i]&&t[i].id===hid) return t[i];
    return null;
  }
  function diffEq(side){
    var pile=ensurePile(side); var cur=snapshotEq(side);
    var teamRef=(G&&G.team)?G.team[side]:null;
    // Igual que con los objetos: si el array de héroes se ha sustituido
    // (snapshot de red / nueva partida) no hay descarte real.
    if(lastEqRef[side]!==teamRef){ lastEqRef[side]=teamRef; lastEq[side]=cur; return; }
    if(!lastEq[side]){ lastEq[side]=cur; return; }
    var prev=lastEq[side]||{};
    Object.keys(prev).forEach(function(hid){
      var hero=heroById(side,hid);
      // Solo van a la pila las armas/armaduras de héroes MUERTOS. Si el héroe
      // sigue vivo, perder un slot es una transformación/reequipamiento y no
      // cuenta como descarte.
      if(!hero||hero.alive) return;
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
  function renderPile(side){
    var inB=!!(document.getElementById('s-battle')&&document.getElementById('s-battle').classList.contains('active'));
    var hand=document.getElementById('hand_'+side);
    if(!inB||!hand){ var e0=document.querySelector('.bf-discard-pile'); if(e0)e0.remove(); lastCount[side]=-1; return; }
    var count=ensurePile(side)?G.itemDescarte[side].length:0;
    if(count===lastCount[side]) { var ex=hand.querySelector('.bf-discard-pile'); if(ex) return; }
    lastCount[side]=count;
    var ex=hand.querySelector('.bf-discard-pile'); if(ex)ex.remove();
    var pile=document.createElement('div'); pile.className='bf-discard-pile';
    pile.title='Pila de descartes · '+count+(count===1?' carta':' cartas');
    var just=(window.__bfDiscardJust===side);
    var cardStyle='background-image:url("'+CARD_BACK+'")!important;background-size:cover!important;background-position:center!important;background-color:#120a1e!important;border:1.5px solid rgba(192,107,255,.65)!important;border-radius:10px!important;overflow:hidden!important;box-shadow:0 4px 12px rgba(0,0,0,.6),0 0 10px rgba(160,80,255,.28)!important;position:relative!important;pointer-events:none!important;cursor:default!important';
    var imgStyle='position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important;display:block!important;pointer-events:none!important';
    var html='<div class="bf-discard-card'+(just?' bf-just':'')+'" style="'+cardStyle+'"><img class="bf-discard-back" src="'+CARD_BACK+'" alt="" style="'+imgStyle+'" /></div>';
    if(count>0) html+='<div class="bf-discard-badge">'+(count>99?'99+':count)+'</div>';
    html+='<div class="bf-discard-lbl">Descartes</div>';
    pile.innerHTML=html;
    var chips=hand.querySelectorAll('.hand-chips'); var ref=chips[chips.length-1];
    if(ref&&ref.parentNode===hand) hand.insertBefore(pile,ref.nextSibling); else hand.appendChild(pile);
    if(just) window.__bfDiscardJust=null;
    forceDiscardBack();
  }

  // ---- Guardián: fuerza el reverso en la pila de descartes ----
  // Otros parches (injectHandArt, applyArtToChips) pueden poner background-image
  // inline con !important sobre .bf-discard-card, pisando el reverso. Este
  // guardián re-aplica TODOS los estilos del reverso sin condiciones (no basta
  // comparar el valor inline: otras clases CSS con !important también pisan y
  // no se ven en .style). Sin MutationObserver (el interval es suficiente) y
  // solo cuando hay cartas que vigilar — así no alimenta cascadas de repintado.
  function forceDiscardBack(){
    var cards=document.querySelectorAll('.bf-discard-card');
    if(!cards.length)return;
    cards.forEach(function(card){
      card.style.setProperty('background-image','url("'+CARD_BACK+'")','important');
      card.style.setProperty('background-size','cover','important');
      card.style.setProperty('background-position','center','important');
      card.style.setProperty('background-color','#120a1e','important');
      card.style.setProperty('border','1.5px solid rgba(192,107,255,.65)','important');
      card.style.setProperty('border-radius','10px','important');
      card.style.setProperty('overflow','hidden','important');
      card.style.setProperty('box-shadow','0 4px 12px rgba(0,0,0,.6),0 0 10px rgba(160,80,255,.28)','important');
      card.style.setProperty('position','relative','important');
      card.style.setProperty('pointer-events','none','important');
      var img=card.querySelector('.bf-discard-back');
      if(!img){img=document.createElement('img');img.className='bf-discard-back';img.src=CARD_BACK;img.alt='';card.appendChild(img);}
      img.style.setProperty('position','absolute','important');
      img.style.setProperty('inset','0','important');
      img.style.setProperty('width','100%','important');
      img.style.setProperty('height','100%','important');
      img.style.setProperty('object-fit','cover','important');
      img.style.setProperty('display','block','important');
      img.style.setProperty('pointer-events','none','important');
    });
  }

  // ---- API para Reanimación Arcana: saca una carta aleatoria del descarte ----
  // (objetos, armas o armaduras — cualquier tipo de carta descartada).
  window.bfDiscardPop=function(side){
    var pile=ensurePile(side); if(!pile||!pile.length) return null;
    var entry=pile[Math.floor(Math.random()*pile.length)];
    var idx=pile.indexOf(entry); if(idx>=0) pile.splice(idx,1);
    return entry;
  };

  function tick(){
    var inB=!!(document.getElementById('s-battle')&&document.getElementById('s-battle').classList.contains('active'));
    if(!inB){
      lastItems={p:null,o:null}; lastEq={p:null,o:null};
      lastItemsRef={p:null,o:null}; lastEqRef={p:null,o:null};
      var el=document.querySelector('.bf-discard-pile'); if(el)el.remove();
      lastCount={p:-1,o:-1}; return;
    }
    var side=mySide();
    try{ diffObjects(side); diffEq(side); }catch(e){}
    renderPile(side);
    forceDiscardBack();
  }

  setInterval(tick,1000);
})();
</script>
`;