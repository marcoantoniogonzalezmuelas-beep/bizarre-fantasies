// Serialized into the iframe. Keep exactly one mission-return control even
// when another result renderer rebuilds its buttons.
export function reconcileMissionResultControls(result, openMissions) {
  var doc = result.ownerDocument;
  var floating = doc.getElementById('bf-mission-result-back');
  if (floating && !result.contains(floating)) floating.remove();
  var buttons = Array.prototype.filter.call(result.querySelectorAll('button'), function(button) {
    return button.id === 'bf-mission-result-back' ||
      /bfRematch|bfMatchRematch|location.reload|bfOpenMissions/.test(button.getAttribute('onclick') || '') ||
      /Volver a (las )?misiones/i.test(button.textContent);
  });
  var button = buttons.shift();
  buttons.forEach(function(extra) { extra.remove(); });
  if (!button) {
    button = doc.createElement('button');
    button.className = 'btn primary big';
    result.appendChild(button);
  }
  button.id = 'bf-mission-result-back';
  button.removeAttribute('onclick');
  button.disabled = false;
  button.textContent = 'Volver a las Misiones';
  button.onclick = openMissions;
  // SIEMPRE centrado. En solitario el botón vive dentro del contenedor del resultado nativo y sale
  // bien; en multijugador (la pantalla de resultado se reconstruye) quedaba colgando directamente de la
  // pantalla, sin nada que lo centrara: arriba a la izquierda.
  if (button.style) { button.style.display = 'block'; button.style.margin = '0 auto'; button.style.position = 'static'; button.style.pointerEvents = 'auto'; }
  if (button.parentNode === result) {
    var wrap = doc.getElementById('bf-mission-result-wrap');
    if (!wrap) {
      wrap = doc.createElement('div');
      wrap.id = 'bf-mission-result-wrap';
      wrap.style.cssText = 'position:absolute;left:0;right:0;bottom:16%;display:flex;justify-content:center;pointer-events:none;z-index:6';
      result.appendChild(wrap);
    }
    wrap.appendChild(button);
  }
}