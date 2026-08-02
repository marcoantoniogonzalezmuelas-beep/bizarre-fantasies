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

  var css = ''+
  '#bf-discard-pile-fixed{position:fixed;left:10px;bottom:10px;z-index:10090;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:help;user-select:none}'+
  '.bf-discard-stack{position:relative;width:46px;height:64px}'+
  '.bf-discard-card{position:absolute;width:46px;height:64px;border-radius:7px;border:1.5px solid #4a3210;background:url("'+CARD_BACK+'") center/cover #120a1e;box-shadow:0 2px 7px rgba(0,0,0,.6)}'+
  '.bf-discard-count{position:absolute;right:-8px;bottom:-8px;min-width:21px;height:21px;border-radius:11px;background:#FFD24A;color:#3a2600;font-size:12px;font-weight:900;display:flex;align-items:center;justify-content:center;padding:0 5px;box-shadow:0 2px 5px rgba(0,0,0,.6);border:1px solid #7c5410}'+
  '.bf-discard-lbl{font-size:9px;font-weight:800;color:#a78be0;letter-spacing:.5px;text-transform:uppercase;text-shadow:0 1px 2px #000;white-space:nowrap}'+
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

  // ---- Render fijo (idempotente: sólo repecta cuando cambia el conteo) ----
  var lastCount={p:-1,o:-1};
  function renderPile(side){
    var inB=!!(document.getElementById('s-battle')&&document.getElementById('s-battle').classList.contains('active'));
    var el=document.getElementById('bf-discard-pile-fixed');
    if(!inB){ if(el)el.remove(); lastCount[side]=-1; return; }
    var count=ensurePile(side)?G.itemDescarte[side].length:0;
    if(count===lastCount[side]&&el) return;
    lastCount[side]=count;
    if(!el){
      el=document.createElement('div'); el.id='bf-discard-pile-fixed';
      document.body.appendChild(el);
    }
    var just=(window.__bfDiscardJust===side);
    var html='<div class="bf-discard-stack'+(just?' bf-just':'')+'">';
    var shown=Math.min(count,3);
    for(var i=0;i<shown;i++) html+='<div class="bf-discard-card" style="top:'+(i*2)+'px;left:'+(i*2)+'px"></div>';
    if(count===0) html+='<div class="bf-discard-card" style="top:0;left:0;opacity:.45"></div>';
    html+='<span class="bf-discard-count">'+count+'</span></div><div class="bf-discard-lbl">Descartes</div>';
    el.innerHTML=html;
    el.title='Pila de descartes · '+count+(count===1?' carta':' cartas');
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
      var el=document.getElementById('bf-discard-pile-fixed'); if(el)el.remove();
      lastCount={p:-1,o:-1}; return;
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