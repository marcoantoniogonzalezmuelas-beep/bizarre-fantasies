// Móvil: las manos de cartas de la batalla se muestran RECOGIDAS (solo el
// título con un botón para desplegar). Al desplegar, las cartas aparecen en la
// misma posición que siempre. Menos superficie animada en pantalla = menos
// parpadeo al hacer zoom en móvil.
export const MOBILE_HAND_COLLAPSE_PATCH = `
<script>
(function(){
  if(window.__bfHandCollapsePatch)return;
  window.__bfHandCollapsePatch=true;

  var st=document.createElement('style');
  st.textContent=[
    '.bf-hands-row{min-height:0!important}',
    '.hand-under-action.bf-hand-collapsed{min-height:0!important;padding-bottom:6px!important}',
    '.hand-under-action.bf-hand-collapsed>*:not(.hand-under-title){display:none!important}',
    '.bf-hand-toggle{float:right;margin-left:8px;border:1px solid rgba(255,210,74,.6);background:rgba(255,210,74,.14);color:var(--gold2);border-radius:8px;padding:1px 8px;font-size:11px;font-weight:800;cursor:pointer}',
    '.hand-rival .bf-hand-toggle{border-color:rgba(138,160,255,.6);background:rgba(138,160,255,.14);color:var(--he)}'
  ].join('');
  document.head.appendChild(st);

  function key(hand){ return 'bfHandOpen_'+hand.id; }
  function isOpen(hand){ try{ return sessionStorage.getItem(key(hand))==='1'; }catch(e){ return false; } }

  function apply(hand,open){
    hand.classList.toggle('bf-hand-collapsed',!open);
    var b=hand.querySelector('.bf-hand-toggle');
    if(b)b.textContent=open?'▲ Recoger':'▼ Desplegar';
    try{ sessionStorage.setItem(key(hand),open?'1':'0'); }catch(e){}
  }

  function decorate(){
    document.querySelectorAll('#s-battle.active .hand-under-action').forEach(function(hand){
      var title=hand.querySelector('.hand-under-title');
      if(!title)return;
      if(!hand.querySelector('.bf-hand-toggle')){
        var b=document.createElement('button');
        b.type='button';
        b.className='bf-hand-toggle';
        b.onclick=function(e){ e.preventDefault(); e.stopPropagation(); apply(hand,hand.classList.contains('bf-hand-collapsed')); };
        title.appendChild(b);
      }
      // Tras cada repintado del juego se vuelve a aplicar el estado guardado
      // (recogidas por defecto).
      apply(hand,isOpen(hand));
    });
  }

  setInterval(function(){ try{ decorate(); }catch(e){} },500);
  decorate();
})();
</script>
`;