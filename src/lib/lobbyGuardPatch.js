// Parche inyectado en el iframe: impide que el creador de una sala se una a
// su propia sala. Registramos los códigos de sala que este navegador ha
// creado como anfitrión (vía dirRegister, que recibe el código definitivo,
// incluso tras reintentos por id ocupado) y bloqueamos clientJoin con ellos.
export const LOBBY_GUARD_PATCH = `
<script>
(function(){
  if (window.__bfLobbyGuardPatch) return;
  window.__bfLobbyGuardPatch = true;

  function hostedCodes(){
    try { return JSON.parse(sessionStorage.getItem('bfHostedCodes') || '[]'); } catch (e) { return []; }
  }
  function rememberCode(code){
    if (!code) return;
    var list = hostedCodes();
    if (list.indexOf(code) < 0) { list.push(code); try { sessionStorage.setItem('bfHostedCodes', JSON.stringify(list)); } catch (e) {} }
  }

  function install(){
    if (window.__bfLobbyGuardDone) return true;
    if (typeof window.dirRegister !== 'function' || typeof window.clientJoin !== 'function') return false;
    window.__bfLobbyGuardDone = true;

    var origReg = window.dirRegister;
    window.dirRegister = function(code){ rememberCode(String(code || '').toUpperCase()); return origReg.apply(this, arguments); };

    var origJoin = window.clientJoin;
    window.clientJoin = function(code, pass, name){
      var c = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (c && hostedCodes().indexOf(c) >= 0) {
        if (typeof lobbyError === 'function') lobbyError('No puedes unirte a tu propia sala: tú creaste la sala ' + c + '. Comparte el código con otro jugador.');
        return;
      }
      return origJoin.apply(this, arguments);
    };
    return true;
  }

  var iv = setInterval(function(){ if (install()) clearInterval(iv); }, 300);
  install();
})();
</script>
`;