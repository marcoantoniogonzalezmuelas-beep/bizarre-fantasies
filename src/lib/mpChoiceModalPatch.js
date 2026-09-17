// Parche inyectado en el iframe: sincroniza el modal de elección (bfChoiceModal)
// del HOST al CLIENTE en partidas online.
//
// PROBLEMA: la habilidad "Compresor Roto" (sabotaje) pide al jugador que elija
// entre dos opciones mediante bfChoiceModal. El modal se muestra SOLO en el
// HOST, pero si la habilidad la usa el CLIENTE (side 'o'), es el cliente quien
// debería elegir. Sin este parche, el cliente no ve el modal y la partida se
// queda colgada esperando.
//
// SOLUCIÓN (sin envolver handleIntent — envolverlo rompía la sincronización
// de pujas en la subasta):
//  · HOST: cuando bfChoiceModal se llama durante el turno del cliente (side
//    'o'), no lo muestra localmente; envía la config al cliente por la
//    conexión relay y guarda el callback.
//  · CLIENTE: recibe la config, muestra el modal localmente y, al elegir,
//    envía sendIntent('choice', {key}) al host.
//  · HOST: un listener en NET.conn('data') intercepta el op 'choice' y llama
//    al callback guardado. NO envuelve handleIntent.
export const MP_CHOICE_MODAL_PATCH = `
<script>
(function(){
  if (window.__bfMpChoiceModal) return;
  window.__bfMpChoiceModal = true;

  var pendingChoiceCb = null;

  function isOnlineHost(){
    try { return typeof NET !== 'undefined' && NET && NET.role === 'host'; }
    catch(e) { return false; }
  }
  function isOnlineClient(){
    try { return typeof NET !== 'undefined' && NET && NET.role === 'client'; }
    catch(e) { return false; }
  }
  function isClientTurn(){
    try { return typeof B !== 'undefined' && B && B.current && B.current.side === 'o'; }
    catch(e) { return false; }
  }

  // Envolver bfChoiceModal: en el host durante el turno del cliente, reenviar
  // la config al cliente en vez de mostrarla localmente.
  function wrapChoiceModal(){
    if (typeof window.bfChoiceModal !== 'function' || window.bfChoiceModal.__bfMpChoice) return false;
    var orig = window.bfChoiceModal;
    window.bfChoiceModal = function(cfg, cb){
      if (isOnlineHost() && isClientTurn()){
        pendingChoiceCb = cb;
        try { if (typeof netSend === 'function') netSend({ t:'bfChoice', cfg: cfg }); }catch(e){}
        return;
      }
      return orig.apply(this, arguments);
    };
    window.bfChoiceModal.__bfMpChoice = 1;
    return true;
  }

  // HOST: listener en NET.conn para interceptar op 'choice' SIN envolver
  // handleIntent (envolver handleIntent rompía la sincronización de pujas).
  var hostConnection = null;
  function installHostHandler(){
    if (typeof NET !== 'undefined' && NET.conn && NET.conn === hostConnection) return true;
    if (!isOnlineHost()) return false;
    if (typeof NET === 'undefined' || !NET || !NET.conn) return false;
    if (typeof NET.conn.on !== 'function') return false;
    NET.conn.on('data', function(msg){
      if (!msg || msg.t !== 'intent' || msg.op !== 'choice' || !pendingChoiceCb) return;
      var cb = pendingChoiceCb;
      pendingChoiceCb = null;
      try { cb(msg.key); }catch(e){}
    });
    hostConnection = NET.conn;
    return true;
  }

  // CLIENTE: interceptar mensajes entrantes con t:'bfChoice' y mostrar el modal.
  var clientConnection = null;
  function installClientHandler(){
    if (typeof NET !== 'undefined' && NET.conn && NET.conn === clientConnection) return true;
    if (!isOnlineClient()) return false;
    if (typeof NET === 'undefined' || !NET || !NET.conn) return false;
    if (typeof NET.conn.on !== 'function') return false;
    NET.conn.on('data', function(msg){
      if (!msg || msg.t !== 'bfChoice' || !msg.cfg) return;
      if (typeof window.bfChoiceModal !== 'function') return;
      window.bfChoiceModal(msg.cfg, function(key){
        try { if (typeof sendIntent === 'function') sendIntent('choice', { key: key }); }catch(e){}
      });
    });
    clientConnection = NET.conn;
    return true;
  }

  setInterval(function(){
    wrapChoiceModal();
    installHostHandler();
    installClientHandler();
  }, 300);
})();
</script>
`;