// Parche SOLO móvil/tablet: cuando se abre cualquier "ventanita" centrada en
// la pantalla (modal de compra, confirmación de salir, habitación bizarra,
// zoom de carta, etc.), lleva el foco visual hasta ella.
//
// PROBLEMA: con el zoom de pellizco activo, las ventanas centradas (position
// fixed respecto al body escalado) quedan fuera de la vista y el jugador
// tenía que hacer mucho scroll y pellizco para desplazarse hasta la ventana.
//
// SOLUCIÓN: al detectar una ventanita centrada, se resetea el zoom de
// pellizco (z=1, sin desplazamiento) y se centra el scroll en la ventana.
// Así la ventanita aparece siempre en el centro de la pantalla, lista para
// interactuar. El foco de teclado también se mueve a su primer botón/input.
//
// NOTA: el juego ya resetea el zoom para sus propios modales (.mo) en
// mobilePinchZoomPatch. Este parche extiende el comportamiento a TODAS las
// ventanitas (confirmación de salir, habitación bizarra, y cualquier diálogo
// centrado genérico) y además centra el scroll y mueve el foco de teclado.
export const MODAL_FOCUS_PATCH = `
<script>
(function(){
  if(window.__bfModalFocus) return;
  window.__bfModalFocus = true;

  // Selectores conocidos de ventanas centradas del juego y los parches.
  // .mo = modales nativos del juego (compra, zoom de carta, confirmaciones…)
  var KNOWN = '.mo, .bf-confirm-overlay, #bf-bizarre-overlay';

  function visible(el){
    if(!el) return false;
    var cs = getComputedStyle(el);
    if(cs.display === 'none' || cs.visibility === 'hidden') return false;
    if(parseFloat(cs.opacity || '1') === 0) return false;
    var r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  }

  // Devuelve la "caja de diálogo" centrada: si el elemento es un backdrop a
  // pantalla completa, busca su hijo centrado (la ventanita real) para
  // poder hacer scrollIntoView sobre el contenido, no sobre el backdrop.
  function dialogBox(el){
    if(!el) return null;
    var r = el.getBoundingClientRect();
    var vw = window.innerWidth, vh = window.innerHeight;
    if(r.width >= 0.9 * vw && r.height >= 0.9 * vh){
      var child = el.querySelector('.bf-confirm-box, .bf-biz-panel, .bf-biz-body, .mo-inner, .modal-box, .modal-content, [class*="box" i], [class*="panel" i]');
      if(child && visible(child)) return child;
      var kids = el.children;
      for(var i=0;i<kids.length;i++){
        if(visible(kids[i])){
          var kr = kids[i].getBoundingClientRect();
          if(kr.width > 120 && kr.height > 80 && kr.width < 0.95*vw) return kids[i];
        }
      }
      return el;
    }
    return el;
  }

  function isDialog(el){
    if(!el || el.nodeType !== 1) return false;
    try{ if(el.matches && el.matches(KNOWN)) return true; }catch(e){}
    if(el.querySelector && el.querySelector(KNOWN)) return true;
    // Genérico: fixed/absolute, z-index alto, tamaño de ventanita, centrado.
    var cs = getComputedStyle(el);
    if(cs.position !== 'fixed' && cs.position !== 'absolute') return false;
    var zi = parseInt(cs.zIndex || '0', 10);
    if(zi < 1000) return false;
    if(!visible(el)) return false;
    var r = el.getBoundingClientRect();
    var vw = window.innerWidth, vh = window.innerHeight;
    if(r.width < 140 || r.height < 90) return false;
    if(r.width >= 0.92*vw && r.height >= 0.92*vh) return false;
    var cx = r.left + r.width/2, cy = r.top + r.height/2;
    return Math.abs(cx - vw/2) < vw*0.3 && Math.abs(cy - vh/2) < vh*0.4;
  }

  var lastKey = null;
  function keyOf(el){ return el && (el.id || el.className || el.tagName); }

  function focusDialog(el){
    if(!el) return;
    var box = dialogBox(el);
    var key = keyOf(box) || keyOf(el);
    if(key && lastKey === key) return; // ya centrada esta ventanita
    lastKey = key;
    // Resetea el zoom de pellizco para que la ventanita qude centrada.
    try{ if(typeof window.__bfPinchReset === 'function') window.__bfPinchReset(); }catch(e){}
    // Lleva el scroll a la ventana (para position:absolute en contenedores
    // con scroll). En fixed ya está centrada tras el reset → no-op.
    try{
      if(box && box.scrollIntoView){
        box.scrollIntoView({block:'center', inline:'center', behavior:'smooth'});
      }
    }catch(e){}
    // Mueve el foco de teclado al primer control interactivo.
    try{
      var f = box && box.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if(f) f.focus({preventScroll:true});
    }catch(e){}
  }

  function checkNode(node){
    if(!node || node.nodeType !== 1) return;
    if(isDialog(node)){ focusDialog(node); return; }
    if(node.querySelector){
      var inner = node.querySelector(KNOWN);
      if(inner) focusDialog(inner);
    }
  }

  // Observa el DOM: cuando se añade una ventanita, lleva el foco hasta ella.
  var mo = new MutationObserver(function(muts){
    for(var i=0;i<muts.length;i++){
      var added = muts[i].addedNodes;
      for(var j=0;j<added.length;j++) checkNode(added[j]);
    }
  });
  function install(){ try{ mo.observe(document.body, {childList:true, subtree:true}); }catch(e){} }
  if(document.body) install();
  else document.addEventListener('DOMContentLoaded', install);

  // Sondeo periódico: algunas ventanitas se muestran/ocultan sin añadirse de
  // nuevo (display:none → block). Si hay una ventanita visible y el zoom no
  // está reseteado, la centra. Cuando no hay ventanita, se resetea lastKey.
  setInterval(function(){
    try{
      var found = null;
      document.querySelectorAll(KNOWN).forEach(function(n){ if(!found && visible(n)) found = n; });
      if(!found){ lastKey = null; return; }
      var st = window.__bfPinchState ? window.__bfPinchState() : null;
      if(st && (st.z > 1.02 || st.tx || st.ty)) focusDialog(found);
    }catch(e){}
  }, 600);
})();
</script>
`;