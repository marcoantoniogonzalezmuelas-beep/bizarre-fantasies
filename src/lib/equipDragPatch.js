// Parche inyectado en el iframe: arrastrar cartas de la tienda (fase de
// equipamiento). Armas C/C, a distancia y armaduras se arrastran sobre un
// héroe (se abre el modal de compra y, al confirmar, se equipa). Hechizos y
// objetos se arrastran a la mano (mismo modal de compra que al hacer clic).
// Ratón: arrastrar directamente. Táctil: mantener pulsado ~0,2s y arrastrar.
export const EQUIP_DRAG_PATCH = `
<script>
(function(){
  if (window.__bfEquipDragPatch) return;
  window.__bfEquipDragPatch = true;

  var style = document.createElement('style');
  style.textContent = '#s-equip .shop-card.has-art{cursor:grab}' +
    '.bf-drag-ghost{position:fixed;z-index:100300;pointer-events:none;opacity:.92;transform:rotate(3deg) scale(.85);transform-origin:top left;box-shadow:0 18px 44px rgba(0,0,0,.7),0 0 26px rgba(255,210,74,.45);border-radius:12px;transition:none!important}' +
    '.bf-drop-target{outline:2.5px dashed rgba(255,210,74,.85)!important;outline-offset:3px;animation:bfDropPulse 1.1s ease-in-out infinite}' +
    '.bf-drop-hover{outline:3px solid #ffd24a!important;outline-offset:3px;box-shadow:0 0 26px rgba(255,210,74,.75)!important;animation:none!important}' +
    '@keyframes bfDropPulse{0%,100%{outline-color:rgba(255,210,74,.55)}50%{outline-color:rgba(255,210,74,1)}}' +
    '.bf-drag-src{opacity:.35!important}';
  document.head.appendChild(style);

  function mySide(){ return (typeof NET !== 'undefined' && NET.role === 'client') ? NET.mySide : ((typeof G !== 'undefined' && G.eqSide) || 'p'); }

  function resolveByName(name){
    var sets = [
      [typeof MELEE !== 'undefined' ? MELEE : [], 'melee'],
      [typeof RANGED !== 'undefined' ? RANGED : [], 'ranged'],
      [typeof ARMORS !== 'undefined' ? ARMORS : [], 'armor'],
      [typeof SPELLS !== 'undefined' ? SPELLS : [], 'spell'],
      [typeof OBJECTS !== 'undefined' ? OBJECTS : [], 'object']
    ];
    for (var s = 0; s < sets.length; s++) {
      var list = sets[s][0];
      for (var i = 0; i < list.length; i++) if (list[i] && list[i].name === name) return { item: list[i], kind: sets[s][1] };
    }
    return null;
  }

  function cardName(card){
    var n = card.querySelector('.bf-shop-name') || card.querySelector('.shop-name');
    return n ? n.textContent.trim() : '';
  }

  var st = null; // { card, found, x, y, dragging, ghost, gear, holdTimer, offX, offY }

  function pt(e){ return e.touches && e.touches[0] ? e.touches[0] : (e.changedTouches && e.changedTouches[0] ? e.changedTouches[0] : e); }

  function targetsFor(gear){
    return document.querySelectorAll(gear ? '#s-equip .eq-hero' : '#s-equip .eq-hand-box');
  }

  function beginDrag(){
    if (!st || st.dragging) return;
    st.dragging = true;
    var r = st.card.getBoundingClientRect();
    st.offX = Math.min(st.x - r.left, r.width * .5); st.offY = Math.min(st.y - r.top, 30);
    var g = st.card.cloneNode(true);
    g.querySelectorAll('.bf-buy-btn,.bf-view-btn').forEach(function(b){ b.remove(); });
    g.className = st.card.className + ' bf-drag-ghost';
    g.style.width = r.width + 'px'; g.style.height = r.height + 'px';
    g.style.left = (st.x - st.offX) + 'px'; g.style.top = (st.y - st.offY) + 'px';
    g.style.margin = '0'; g.style.maxWidth = 'none';
    document.body.appendChild(g);
    st.ghost = g;
    st.card.classList.add('bf-drag-src');
    targetsFor(st.gear).forEach(function(t){ t.classList.add('bf-drop-target'); });
  }

  function hoveredDrop(){
    if (!st) return null;
    var el = document.elementFromPoint(st.x, st.y);
    if (!el) return null;
    return st.gear ? el.closest('.eq-hero') : el.closest('.eq-hand-box');
  }

  function moveDrag(){
    if (!st || !st.dragging) return;
    st.ghost.style.left = (st.x - st.offX) + 'px';
    st.ghost.style.top = (st.y - st.offY) + 'px';
    var over = hoveredDrop();
    targetsFor(st.gear).forEach(function(t){ t.classList.toggle('bf-drop-hover', t === over); });
  }

  function cleanup(){
    if (!st) return;
    if (st.holdTimer) clearTimeout(st.holdTimer);
    if (st.ghost && st.ghost.parentNode) st.ghost.remove();
    st.card.classList.remove('bf-drag-src');
    document.querySelectorAll('.bf-drop-target,.bf-drop-hover').forEach(function(t){ t.classList.remove('bf-drop-target', 'bf-drop-hover'); });
    st = null;
  }

  function drop(){
    if (!st || !st.dragging) { cleanup(); return; }
    var over = hoveredDrop(), found = st.found, side = mySide();
    cleanup();
    window.__bfDragEndAt = Date.now();
    if (!over || !found) return;
    var it = found.item;
    if (found.kind === 'spell') { if (typeof window.buySpell === 'function') window.buySpell(side, it.id); return; }
    if (found.kind === 'object') { if (typeof window.buyObject === 'function') window.buyObject(side, it.id); return; }
    // Arma/armadura soltada sobre un héroe → mismo flujo que clicar: modal de compra y equipar.
    var m = String(over.id || '').match(/^eqh_(.+)$/); if (!m) return;
    var heroId = m[1];
    var hero = ((typeof G !== 'undefined' && G.team && G.team[side]) || []).find(function(x){ return x && x.id === heroId; });
    var assign = { kind: found.kind, id: it.id, cost: it.cost, name: it.name };
    if (hero && typeof canAssign === 'function' && !canAssign(hero, assign)) { if (typeof notif === 'function') notif('No se puede equipar ' + it.name + ' a ' + hero.name + '.'); return; }
    G.assign = assign;
    if (typeof window.doAssign === 'function') window.doAssign(side, heroId);
  }

  function onStart(e){
    var scr = document.getElementById('s-equip');
    if (!scr || !scr.classList.contains('active')) return;
    var t = e.target;
    if (t.closest && (t.closest('.bf-buy-btn') || t.closest('.bf-view-btn') || t.closest('button'))) return;
    var card = t.closest && t.closest('#s-equip .shop-card');
    if (!card) return;
    var found = resolveByName(cardName(card));
    if (!found) return;
    var p = pt(e);
    st = { card: card, found: found, x: p.clientX, y: p.clientY, sx: p.clientX, sy: p.clientY, dragging: false, ghost: null, gear: found.kind !== 'spell' && found.kind !== 'object', holdTimer: null };
    if (e.type === 'touchstart') {
      // Táctil: mantener pulsado para "levantar" la carta; mover antes = scroll normal.
      st.holdTimer = setTimeout(function(){ if (st && !st.dragging) beginDrag(); }, 220);
    }
  }

  function onMove(e){
    if (!st) return;
    var p = pt(e);
    st.x = p.clientX; st.y = p.clientY;
    if (!st.dragging) {
      var d = Math.abs(st.x - st.sx) + Math.abs(st.y - st.sy);
      if (e.type === 'mousemove') { if (d > 7) beginDrag(); }
      else if (d > 12) { cleanup(); return; } // el dedo se movió antes del hold: es scroll
    }
    if (st && st.dragging) { moveDrag(); if (e.cancelable) e.preventDefault(); }
  }

  function onEnd(){ drop(); }

  document.addEventListener('mousedown', onStart, true);
  document.addEventListener('touchstart', onStart, { capture: true, passive: true });
  document.addEventListener('mousemove', onMove, true);
  document.addEventListener('touchmove', onMove, { capture: true, passive: false });
  document.addEventListener('mouseup', onEnd, true);
  document.addEventListener('touchend', onEnd, true);
  document.addEventListener('touchcancel', function(){ cleanup(); }, true);

  // Tras un arrastre real, tragar el click que dispara el navegador para no
  // ejecutar además la selección/compra por clic de la carta.
  document.addEventListener('click', function(e){
    if (window.__bfDragEndAt && Date.now() - window.__bfDragEndAt < 350) { e.preventDefault(); e.stopPropagation(); window.__bfDragEndAt = 0; }
  }, true);
})();
</script>
`;