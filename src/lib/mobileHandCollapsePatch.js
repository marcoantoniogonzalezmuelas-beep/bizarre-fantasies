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
    // Rótulo de la mano: chapa clara con borde luminoso, imposible de pasar por alto.
    '.hand-under-action .hand-under-title{display:flex!important;align-items:center;gap:8px;justify-content:space-between;font-family:Cinzel,serif!important;font-weight:1000!important;font-size:13px!important;letter-spacing:.6px;text-transform:uppercase;padding:5px 8px 5px 10px!important;border-radius:10px;border:1.5px solid rgba(255,210,74,.65);background:linear-gradient(90deg,rgba(255,210,74,.22),rgba(255,210,74,.04));color:#ffe49a!important;box-shadow:0 2px 10px rgba(0,0,0,.5),inset 0 0 14px rgba(255,210,74,.12);text-shadow:0 2px 6px #000}',
    '.hand-under-action.hand-rival .hand-under-title{border-color:rgba(138,160,255,.65);background:linear-gradient(90deg,rgba(138,160,255,.22),rgba(138,160,255,.04));color:#cdd8ff!important;box-shadow:0 2px 10px rgba(0,0,0,.5),inset 0 0 14px rgba(138,160,255,.12)}',
    // Botón de desplegar: chapa dorada con flecha; parpadea mientras está recogida
    // para que se vea que hay cartas debajo que se pueden mostrar.
    '.bf-hand-toggle{float:none!important;margin:0!important;display:inline-flex;align-items:center;gap:5px;border:1.5px solid rgba(255,210,74,.85);background:linear-gradient(180deg,#ffe27a,#c8901f);color:#3a2600;border-radius:999px;padding:4px 11px;font-family:Rubik,sans-serif;font-size:12px;font-weight:900;letter-spacing:.4px;cursor:pointer;box-shadow:0 3px 10px rgba(0,0,0,.5)}',
    '.hand-rival .bf-hand-toggle{border-color:rgba(138,160,255,.85);background:linear-gradient(180deg,#cfd9ff,#5a6bc8);color:#0d1030}',
    '.bf-hand-collapsed .bf-hand-toggle{animation:bfHandPulse 1.5s ease-in-out infinite}',
    '@keyframes bfHandPulse{0%,100%{box-shadow:0 3px 10px rgba(0,0,0,.5),0 0 0 0 rgba(255,210,74,0);transform:scale(1)}50%{box-shadow:0 3px 10px rgba(0,0,0,.5),0 0 14px 3px rgba(255,210,74,.75);transform:scale(1.06)}}'
  ].join('');
  document.head.appendChild(st);

  function key(hand){ return 'bfHandOpen_'+hand.id; }
  function isOpen(hand){ try{ return sessionStorage.getItem(key(hand))==='1'; }catch(e){ return false; } }

  function apply(hand,open){
    hand.classList.toggle('bf-hand-collapsed',!open);
    var b=hand.querySelector('.bf-hand-toggle');
    if(b)b.innerHTML=open?'▲ Recoger cartas':'▼ Ver cartas ('+Math.max(0,hand.querySelectorAll('.hand .card, .card').length)+')';
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
      // Reaplica el estado guardado (recogidas por defecto). Se llama en el
      // hook de renderBattle y en el MutationObserver, NUNCA por intervalo:
      // el intervalo provocaba que, tras cada repintado del juego (que
      // reconstruye la mano SIN la clase de recogida), las cartas se vieran
      // desplegadas hasta el siguiente tick (parpadeo cada 4-5 s).
      apply(hand,isOpen(hand));
    });
  }

  // Aplica el estado de forma SINCRONA tras cada repintado del juego: la clase
  // de "recogida" se añade antes de que el navegador pinte, así la mano nunca
  // llega a verse desplegada salvo que el jugador la haya abierto.
  function hookRender(){
    if(typeof window.renderBattle!=='function'||window.renderBattle.__bfHandCollapse)return false;
    var original=window.renderBattle;
    window.renderBattle=function(){ var r=original.apply(this,arguments); try{decorate();}catch(e){} return r; };
    window.renderBattle.__bfHandCollapse=1;
    return true;
  }

  // Red de seguridad ligera (por si el juego reconstruye la mano fuera de
  // renderBattle). No se usa MutationObserver: decorate() modifica el DOM, así
  // que el observador se disparaba a sí mismo en bucle y colgaba la batalla.
  setInterval(function(){ try{ decorate(); }catch(e){} },500);

  var _bfHcT=0; (function wait(){ if(hookRender()||_bfHcT++>120)return; setTimeout(wait,200); })();
  decorate();
})();
</script>
`;