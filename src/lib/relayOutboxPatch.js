// Each connection has one ordered, retryable outbox; no action or FX is dropped.
export const RELAY_OUTBOX_PATCH = `
<script>
window.bfCreateRelayOutbox = function(request, side, code, report) {
  var queue = [], batch = null, timer = null, stopped = false, busy = false;
  var session = crypto.randomUUID(), serial = 0, failures = 0;
  function schedule(delay) {
    if (!stopped && !timer) timer = setTimeout(function(){ timer = null; flush(); }, delay);
  }
  function flush() {
    if (stopped || busy || (!batch && !queue.length)) return;
    if (!batch) batch = { batch_id: session + '-' + (++serial), messages: queue.splice(0, 50) };
    busy = true;
    request('sendBatch', { code: code, side: side, batch_id: batch.batch_id, messages: batch.messages }).then(function(res){
      if (!res || !res.ok) throw new Error((res && res.error) || 'Envío no confirmado');
      batch = null;
      if (failures && typeof notif === 'function') notif('Conexión recuperada. Acciones sincronizadas.');
      failures = 0;
    }).catch(function(err){
      failures++;
      report('server_error', 'sendBatch', err && err.message);
      if (failures === 1 && typeof notif === 'function') notif('Reconectando: tu acción sigue pendiente y se reenviará.');
    }).finally(function(){
      busy = false;
      if (batch || queue.length) schedule(failures ? Math.min(8000, 1000 * Math.pow(2, failures - 1)) : 80);
    });
  }
  return {
    send: function(msg) {
      if (stopped) return;
      // Freeze at send time: queued snapshots must not reference mutable G/B.
      queue.push(JSON.parse(JSON.stringify(msg)));
      schedule(80);
    },
    close: function() { stopped = true; clearTimeout(timer); queue = []; }
  };
};
</script>
`;