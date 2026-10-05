// MANO DE LA FASE DE EQUIPAMIENTO.
//  · Sin destellos al comprar: cada compra rehace toda la pantalla y las cartas de la mano volvían a ser una
//    etiqueta con el nombre antes de recuperar su imagen. Ahora las que ya estaban se conservan tal cual (con su
//    imagen) y la recién comprada recibe su arte al instante.
//  · En ordenador, la mano se estira hasta la altura de la última fila de la tienda.
//  · Tapete más claro y ligero, con dibujitos discretos y rótulos con humor.
export const EQUIP_HAND_PATCH = `
<script>
(function(){
  if(window.__bfEquipHand)return;
  window.__bfEquipHand=true;
  var DOODLES='data:image/svg+xml;utf8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220" viewBox="0 0 220 220" font-size="26" opacity=".14"><text x="14" y="40">\u{1F3B2}</text><text x="120" y="58">\u{1F345}</text><text x="62" y="118">\u{1F986}</text><text x="160" y="140">\u{1FA99}</text><text x="20" y="190">\u2728</text><text x="110" y="200">\u{1F9E6}</text></svg>');
  var css=document.createElement('style');
  css.textContent=''
    // Tapete ligero (más específico que el tapete oscuro anterior, que sigue en la batalla)
    +'#s-equip .eq-grid .eq-hand-box{background:url("'+DOODLES+'") repeat, radial-gradient(circle at 18% 12%,rgba(255,255,255,.14),transparent 45%), linear-gradient(160deg,#3f3266 0%,#2f4a6b 100%) !important;'
    +'border:2px dashed rgba(255,214,120,.55) !important;border-radius:16px !important;box-shadow:inset 0 0 0 4px rgba(255,255,255,.04),0 6px 18px rgba(0,0,0,.35) !important;padding:10px 12px !important}'
    +'#s-equip .eq-grid .eq-hand-box .hand-lbl{display:inline-block;background:rgba(20,12,36,.55);border:1px solid rgba(255,214,120,.35);border-radius:999px;padding:2px 10px;margin:2px 0 6px;font-size:12px}'
    +'#s-equip .eq-grid .eq-hand-box .bf-hand-empty{color:#e9e2ff;opacity:.75;font-style:italic;font-size:12px;padding:6px 2px}'
    +'#s-equip .eq-grid .eq-hand-box .chip.bf-chip-card{animation:bfHandIn .28s ease-out}'
    +'@keyframes bfHandIn{from{transform:translateY(8px) scale(.94);opacity:0}to{transform:none;opacity:1}}'
    +'#s-equip .eq-grid .eq-hand-box .chip.bf-kept{animation:none!important}'
    // En ordenador: la columna izquierda llega hasta la última fila de la tienda y la mano ocupa el espacio que sobra.
    +'@media (min-width:761px){#s-equip .eq-grid{align-items:stretch!important}#s-equip .eq-grid .eq-heroes{display:flex;flex-direction:column}#s-equip .eq-grid .eq-hand-box{flex:1 1 auto}}';
  document.head.appendChild(css);
  var EMPTY=['Aqu\\u00ed no hay nada\\u2026 ni polvo m\\u00e1gico.','Vac\\u00edo. Como la cartera tras la subasta.','Ni un chicle. Compra algo, valiente.'];
  function chipKey(ch,count){
    var name=(ch.title||(ch.childNodes[0]&&ch.childNodes[0].textContent)||'').trim();
    var k=(ch.classList.contains('chip-spell')?'s':'o')+'|'+name;
    count[k]=(count[k]||0)+1;
    return k+'#'+count[k];
  }
  function snapshot(){
    var box=document.querySelector('#s-equip .eq-hand-box');if(!box)return null;
    var m={},count={};
    box.querySelectorAll('.chip-spell.bf-chip-card,.chip-object.bf-chip-card').forEach(function(ch){ m[chipKey(ch,count)]=ch; });
    return m;
  }
  function restore(old){
    var box=document.querySelector('#s-equip .eq-hand-box');if(!box)return;
    if(old){
      var count={};
      box.querySelectorAll('.chip-spell,.chip-object').forEach(function(ch){
        var o=old[chipKey(ch,count)];if(!o||o===ch||!ch.parentNode)return;
        // El botón de devolver lleva el índice de la carta en la mano: se copia el del recién pintado.
        var nx=ch.querySelector('.chip-x'),ox=o.querySelector('.chip-x');
        if(nx&&ox)ox.setAttribute('onclick',nx.getAttribute('onclick')||'');
        o.classList.add('bf-kept');
        ch.parentNode.replaceChild(o,ch);
      });
    }
    // La recién comprada: su arte al instante (sin pasar por la etiqueta con el nombre).
    if(typeof window.__bfInjectHandArt==='function')window.__bfInjectHandArt();
    // Rótulos con humor y mano vacía con gracia.
    var lbls=box.querySelectorAll('.hand-lbl');
    if(lbls[0])lbls[0].textContent='\\u2728 Hechizos en la manga (\\u00d7 para devolver)';
    if(lbls[1])lbls[1].textContent='\\u{1F392} Cachivaches del bolsillo (\\u00d7 para devolver)';
    box.querySelectorAll('.hand-chips').forEach(function(hc,i){
      var only=hc.children.length===1&&hc.children[0].tagName==='SPAN'&&!hc.querySelector('.chip');
      if(only){ hc.innerHTML='<div class="bf-hand-empty">'+EMPTY[(i+(G&&G.equipCoins?0:1))%EMPTY.length]+'</div>'; }
    });
  }
  var depth=0;
  function hook(){
    if(typeof window.renderEquip!=='function'||window.renderEquip.__bfHand)return;
    var orig=window.renderEquip;
    var w=function(){
      if(depth>0)return orig.apply(this,arguments);
      depth++;var old=null,out;
      try{ old=snapshot(); }catch(e){}
      try{ out=orig.apply(this,arguments); } finally { depth--; }
      try{ restore(old); }catch(e){}
      return out;
    };
    w.__bfHand=1;window.renderEquip=w;
  }
  hook();setInterval(hook,700);
})();
</script>
`;
