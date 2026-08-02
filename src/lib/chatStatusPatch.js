// Parche inyectado en el iframe: vigila el estado multiplayer (código de sala,
// conexión P2P, nicks, pantalla actual) y lo reenvía a la página padre para que
// el componente ChatOverlay sepa cuándo mostrar el chat y a qué sala suscribirse.
export const CHAT_STATUS_PATCH = `
<script>
(function(){
  if(window.__bfChatStatus)return;
  window.__bfChatStatus=true;
  var last={};
  function get(){
    var inBattle=!!(document.getElementById('s-battle')&&document.getElementById('s-battle').classList.contains('active'));
    var roomCode=(typeof NET!=='undefined'&&NET.code)||'';
    var isHost=(typeof NET!=='undefined'&&NET.role==='host');
    var connOpen=(typeof NET!=='undefined'&&NET.conn&&NET.conn.open);
    var playerNick='',opponentNick='';
    try{
      if(typeof NET!=='undefined'){
        playerNick=NET.names_self||'';
        opponentNick=NET.names_opp||'';
      }
      if(!playerNick&&typeof G!=='undefined'&&G.names){
        playerNick=G.names.p||'';
        opponentNick=G.names.o||'';
      }
      if(!playerNick){try{playerNick=localStorage.getItem('bfMyNick')||'';}catch(e){}}
    }catch(e){}
    return {inBattle:inBattle,roomCode:roomCode,isHost:isHost,connOpen:connOpen,playerNick:playerNick,opponentNick:opponentNick};
  }
  function tick(){
    var s=get();
    var changed=(s.roomCode!==last.roomCode||s.connOpen!==last.connOpen||s.inBattle!==last.inBattle||s.playerNick!==last.playerNick);
    if(changed){last=s;window.parent.postMessage({bfChatStatus:s},'*');}
  }
  setInterval(tick,800);
  setTimeout(tick,400);
})();
</script>
`;