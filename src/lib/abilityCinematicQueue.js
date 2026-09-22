// Serialized into the game iframe; keep this factory self-contained.
export function createAbilityCinematicQueue(options) {
  var pending = [], played = {}, recent = {}, timer = null;
  function reset() {
    if (timer !== null) options.cancel(timer);
    timer = null; pending = []; played = {}; recent = {};
  }
  function drain() {
    timer = null;
    if (!options.enabled()) { pending = []; return; }
    if (!pending.length) return;
    if (options.blocked()) { timer = options.schedule(drain, 200); return; }
    var entry = pending.shift();
    if (entry.once) played[entry.key] = true;
    recent[entry.key] = options.now();
    options.play(entry);
    if (pending.length) timer = options.schedule(drain, 200);
  }
  function enqueue(entry) {
    if (!options.enabled()) return false;
    if (entry.once && played[entry.key]) return false;
    if (pending.some(function(q) { return q.key === entry.key; })) return false;
    if (!entry.once && recent[entry.key] != null && options.now() - recent[entry.key] < 5500) return false;
    pending.push(entry);
    if (timer === null) drain();
    return true;
  }
  return { enqueue: enqueue, reset: reset, busy: function() { return pending.length > 0 || timer !== null; } };
}