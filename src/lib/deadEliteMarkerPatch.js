// Parche inyectado en el iframe: cuando un héroe en forma ÉLITE muere
// definitivamente, deja de mostrar cualquier marcador de élite (★ junto al
// nombre, borde/brillo dorado, aura y marcador pasivo élite).
export const DEAD_ELITE_MARKER_PATCH = `
<script>
(function(){
  if(window.__bfDeadEliteMarkerPatch) return;
  window.__bfDeadEliteMarkerPatch = true;
  var st = document.createElement('style');
  st.textContent =
    'html body .bhero.bhero.bhero.dead.elite-mode,html body .bhero.bhero.bhero.dead.bf-auto-elite,html body .bhero.bhero.bhero.bf-truedead{border-color:#3a3048!important;background:linear-gradient(180deg,#1c1824,#141018)!important;box-shadow:none!important}' +
    'html body .bhero.dead .bhero-aura,html body .bhero.dead .bf-passive-mark,html body .bhero.bf-truedead .bf-passive-mark,html body .bhero.dead .bf-fx-elite-aura{display:none!important}' +
    'html body .bhero.dead.bf-auto-elite .bf-battle-art,html body .bhero.bf-truedead .bf-battle-art{filter:grayscale(1) brightness(.45)!important}';
  document.head.appendChild(st);
  // Quita la estrella ★ del nombre de los héroes muertos.
  function clean(){
    // Sello flotante "★ ÉLITE" (y su aura) que se queda pegado en héroes muertos.
    document.querySelectorAll('.bhero.dead, .bhero.bf-dead, .bhero.bf-truedead').forEach(function(c){
      c.querySelectorAll('.bf-fx-elite-flip, .bf-fx-elite-aura, .bf-fx-status-txt').forEach(function(n){
        if(!n.classList.contains('bf-fx-status-txt') || /LITE/i.test(n.textContent)) n.remove();
      });
    });
    document.querySelectorAll('.bhero.dead .bhero-name, .bhero.bf-truedead .bhero-name').forEach(function(n){
      var w = document.createTreeWalker(n, NodeFilter.SHOW_TEXT), t;
      while((t = w.nextNode())){ if(t.nodeValue.indexOf('\\u2605') !== -1) t.nodeValue = t.nodeValue.replace(/\\s*\\u2605/g, ''); }
    });
  }
  setInterval(clean, 250);
})();
</script>
`;