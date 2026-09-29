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
}