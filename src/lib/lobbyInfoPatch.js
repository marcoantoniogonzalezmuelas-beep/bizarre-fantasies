// Parche independiente: muestra la info de reanudación de partidas en la
// pantalla de "Salas online" del lobby. No depende de ninguna función del
// juego ni de otros parches — solo busca #s-lobby .setup-box e inyecta el
// cartel informativo. Así funciona aunque NET/LOBBY no estén definidos
// (que es justo el caso cuando el jugador entra a navegar salas).
export const LOBBY_INFO_PATCH = `
<script>
(function(){
  if(window.__bfLobbyInfoPatch)return;
  window.__bfLobbyInfoPatch=true;

  var INFO_HTML =
    '<div style="font-family:Cinzel,serif;font-weight:900;color:#ffd24a;font-size:13px;margin-bottom:6px;letter-spacing:.3px">ℹ️ Reanudación de partidas</div>'+
    'Si se cae tu conexión o sales por error, la sala <b style="color:#ffe49a">sigue abierta</b> como "Partida en curso" durante <b style="color:#ffe49a">5 minutos</b>. '+
    'Solo los dos jugadores originales pueden reanudar: entra en <b style="color:#ffe49a">Salas online</b>, busca tu sala y pulsa <b style="color:#ffe49a">Reanudar</b>. '+
    'La sala se cierra al terminar la partida o si nadie vuelve en 5 minutos.';

  function inject(){
    try{
      var box=document.querySelector('#s-lobby .setup-box');
      if(!box)return;
      if(document.getElementById('bf-lobby-info'))return;
      // Solo en la vista de lista de salas (h2 = "Salas online"), no en formularios
      var h=box.querySelector('h2');
      if(h&&!/Salas online/i.test(h.textContent))return;
      var div=document.createElement('div');
      div.id='bf-lobby-info';
      div.style.cssText='margin:10px 0 14px;padding:12px 14px;border-radius:12px;background:linear-gradient(135deg,rgba(28,16,46,.7),rgba(12,7,20,.85));border:1px solid rgba(255,210,74,.3);font-family:Rubik,sans-serif;font-size:12.5px;line-height:1.5;color:#cfc6dd;box-shadow:0 4px 14px rgba(0,0,0,.3)';
      div.innerHTML=INFO_HTML;
      box.insertBefore(div,box.firstChild);
    }catch(e){}
  }

  // Intervalo dedicado: re-inyecta si el juego re-renderiza el lobby.
  setInterval(inject,500);
  inject();
})();
</script>
`;