// Parche INDEPENDIENTE y robusto: garantiza que la sala NO se elimine del
// backend central cuando empieza la partida (leaveLobbyForGame llama a
// dirUnregister). CENTRAL_LOBBY_PATCH ya gestiona el registro, el listing,
// el polling y el cartel informativo — este parche SOLO evita que
// dirUnregister borre la sala del backend si la partida está en curso,
// para que el rival pueda reanudar tras una desconexión.
//
// No define bfLobbyRequest, no toca refreshList ni lobbyConnect: todo eso
// lo hace CENTRAL_LOBBY_PATCH. Si CENTRAL_LOBBY_PATCH no estuviera activo,
// este parche no hace nada (no hay nada que registrar/listar).
export const LOBBY_INFO_PATCH = `
<script>
(function(){
  if(window.__bfLobbyInfoPatch)return;
  window.__bfLobbyInfoPatch=true;

  // Envolver dirUnregister: NO eliminar del backend central si la partida
  // ya empezó (G.online es true). El motor nativo llama a dirUnregister al
  // empezar la partida (leaveLobbyForGame), pero necesitamos que la sala
  // siga en el backend como "playing" para que el rival pueda reanudar.
  // Si la partida NO ha empezado (cancelar sala antes de que nadie se una),
  // sí llamamos al original para limpiar el backend.
  function wrapDirUnregister(){
    if(window.__bfDirUnregGuarded)return;
    if(typeof window.dirUnregister!=='function')return;
    window.__bfDirUnregGuarded=true;
    var orig=window.dirUnregister;
    window.dirUnregister=function(){
      try{
        var gameStarted=(typeof G!=='undefined'&&G.online);
        if(gameStarted){
          // La partida ha empezado: NO eliminar la sala del backend.
          // netReconnectPatch la marca como "playing" via register_playing.
          return Promise.resolve();
        }
      }catch(e){}
      return orig.apply(this,arguments);
    };
  }

  var tries=0;
  var iv=setInterval(function(){
    wrapDirUnregister();
    tries++;
    if(tries>100)clearInterval(iv);
  },200);
  wrapDirUnregister();
})();
</script>
`;