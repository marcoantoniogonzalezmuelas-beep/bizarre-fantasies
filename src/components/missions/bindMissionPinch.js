// Scale only the touched card grid, never the sticky army summary.
export default function bindMissionPinch(shell) {
  const scroller = shell.parentElement;
  let pinch = null;
  const distance = t => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
  const middle = t => ({ x: (t[0].clientX + t[1].clientX) / 2, y: (t[0].clientY + t[1].clientY) / 2 });
  const start = e => {
    if (e.touches.length !== 2) return;
    const grid = e.target.closest?.('.mission-heroes, .pack-selection-grid');
    if (!grid || !shell.contains(grid) || !distance(e.touches)) return;
    e.preventDefault();
    e.stopPropagation();
    const z = Number(grid.style.zoom) || 1, rect = grid.getBoundingClientRect(), m = middle(e.touches);
    // Lock the unscaled grid width so zoom cannot reflow/shrink its columns.
    grid.style.width = `${rect.width / z}px`;
    pinch = { grid, pan: grid.closest('.mission-grid-viewport') || scroller, z, d: distance(e.touches), x: (m.x - rect.left) / z, y: (m.y - rect.top) / z };
  };
  const move = e => {
    if (!pinch || e.touches.length !== 2) return;
    e.preventDefault();
    e.stopPropagation();
    const { grid, pan, z, d, x, y } = pinch, m = middle(e.touches);
    const next = Math.max(1, Math.min(3, z * distance(e.touches) / d));
    grid.style.zoom = String(next);
    const rect = grid.getBoundingClientRect();
    pan.scrollLeft += rect.left + x * next - m.x;
    scroller.scrollTop += rect.top + y * next - m.y;
  };
  const end = e => {
    if (!pinch || e.touches.length >= 2) return;
    e.preventDefault();
    e.stopPropagation();
    if (Number(pinch.grid.style.zoom) === 1) { pinch.grid.style.zoom = ''; pinch.grid.style.width = ''; }
    pinch = null;
  };
  const handlers = { touchstart: start, touchmove: move, touchend: end, touchcancel: end };
  Object.entries(handlers).forEach(([type, handler]) => scroller.addEventListener(type, handler, { capture: true, passive: false }));
  return () => Object.entries(handlers).forEach(([type, handler]) => scroller.removeEventListener(type, handler, true));
}