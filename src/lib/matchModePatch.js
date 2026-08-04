// Patch inyectado en el HTML del juego (iframe) para añadir MODALIDADES de
// partida en multijugador online: Match a 3, Match a 5 y Libre, con marcador,
// "volver a jugar" sin recargar y animación de campeón.
//
// Se inyecta como <script> antes de </body>. No toca la lógica del juego: solo
// añade un selector de modalidad en "crear sala", envuelve showResult, y usa un
// segundo listener sobre la conexión PeerJS (NET.conn) para sincronizar el
// marcador entre host y cliente con mensajes propios ({t:'bfsync'/'bfrematch'}).
export const MATCH_MODE_PATCH = `
<script>
(function(){
  if (window.__bfMatchModePatch) return;
  window.__bfMatchModePatch = true;

  // ---- estilos: selector de modalidad, marcador y animación de campeón ----
  var st = document.createElement('style');
  st.textContent = [
    '.bf-mode-pick{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:6px 0 4px}',
    '@media(max-width:520px){.bf-mode-pick{grid-template-columns:1fr}}',
    '.bf-mode-opt{cursor:pointer;text-align:center;padding:11px 8px;border-radius:13px;background:linear-gradient(180deg,rgba(20,14,38,.7),rgba(10,7,20,.8));border:2px solid rgba(255,210,74,.24);transition:transform .14s ease,border-color .14s ease,box-shadow .14s ease}',
    '.bf-mode-opt:hover{transform:translateY(-2px);border-color:rgba(255,210,74,.5)}',
    '.bf-mode-opt.active{border-color:#ffd24a;box-shadow:0 8px 22px rgba(0,0,0,.5),0 0 22px rgba(255,210,74,.4);background:linear-gradient(180deg,rgba(48,34,84,.78),rgba(20,13,38,.86))}',
    '.bf-mode-t{font-family:"Cinzel",serif;font-weight:1000;font-size:15px;color:#fff5dc;text-shadow:0 2px 4px #000}',
    '.bf-mode-s{margin-top:3px;font-size:11px;color:#cfc6dd;line-height:1.25}',
    '.bf-score-box{margin:14px auto 4px;max-width:340px;display:flex;justify-content:center;gap:18px;align-items:center;padding:12px 16px;border-radius:14px;background:rgba(8,5,14,.55);border:1px solid rgba(255,210,74,.3)}',
    '.bf-score-col{text-align:center}',
    '.bf-score-name{font-size:12px;font-weight:800;color:#cfc6dd;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.bf-score-num{font-family:"Cinzel",serif;font-weight:1000;font-size:40px;color:#ffd24a;line-height:1;text-shadow:0 2px 8px #000,0 0 16px rgba(255,210,74,.4)}',
    '.bf-score-sep{font-family:"Cinzel",serif;font-weight:1000;font-size:26px;color:#8a8099}',
    '.bf-mode-lbl{font-size:13px;color:#a89fbb;margin-top:8px}',
    '.bf-champ-wrap{position:fixed;inset:0;z-index:100050;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 50% 40%,rgba(40,28,70,.9),rgba(6,4,12,.96));animation:bfFadeIn .4s ease;overflow:hidden}',
    '.bf-champ-crown{font-size:96px;animation:bfChampCrown 2.4s ease-in-out infinite;filter:drop-shadow(0 0 24px rgba(255,210,74,.8))}',
    '.bf-champ-ttl{font-family:"Cinzel",serif;font-weight:1000;font-size:clamp(30px,8vw,64px);color:#ffd24a;text-shadow:0 0 30px rgba(255,210,74,.7),0 4px 10px #000;letter-spacing:2px;animation:bfChampTtl 1s cubic-bezier(.2,.8,.3,1)}',
    '.bf-champ-name{font-family:"Cinzel",serif;font-weight:1000;font-size:clamp(26px,7vw,52px);color:#fff5dc;text-shadow:0 0 24px rgba(255,210,74,.6),0 3px 8px #000;margin-top:6px;animation:bfChampName 1.2s cubic-bezier(.2,.8,.3,1)}',
    '.bf-champ-sub{font-size:17px;color:#ffe49a;margin:10px 0 26px;font-weight:700}',
    '.bf-champ-confetti{position:absolute;top:-20px;width:12px;height:18px;border-radius:2px;opacity:.95;animation:bfConfetti linear forwards}',
    '@keyframes bfChampCrown{0%,100%{transform:translateY(0) rotate(-6deg)}50%{transform:translateY(-16px) rotate(6deg)}}',
    '@keyframes bfChampTtl{0%{opacity:0;transform:scale(.4)}60%{opacity:1;transform:scale(1.15)}100%{transform:scale(1)}}',
    '@keyframes bfChampName{0%{opacity:0;transform:translateY(20px)}100%{opacity:1;transform:translateY(0)}}',
    '@keyframes bfConfetti{0%{transform:translateY(0) rotate(0)}100%{transform:translateY(105vh) rotate(720deg)}}'
  ].join('');
  document.head.appendChild(st);

  function modeMeta(m){
    if(m==='m3') return {label:'Match a 3 · primero en llegar a 2 victorias', target:2};
    if(m==='m5') return {label:'Match a 5 · primero en llegar a 3 victorias', target:3};
    return {label:'Libre · marcador global entre los dos jugadores', target:0};
  }
  function ns(){ return (typeof NET!=='undefined') ? NET : null; }
  function ensureState(){ var n=ns(); if(!n) return null; if(!n.score) n.score={p:0,o:0}; if(!n.matchMode) n.matchMode='free'; return n; }

  // ---- 1) Selector de modalidad en la pantalla de "crear sala" ----
  function injectModePicker(){
    var room = document.getElementById('hroom');
    if(!room) return;
    var box = room.closest('.setup-box');
    if(!box || box.dataset.bfMode==='1') return;
    box.dataset.bfMode='1';
    var n=ns(); if(n && !n.matchMode) n.matchMode='free';
    var wrap = document.createElement('div');
    wrap.className='ig';
    wrap.innerHTML = '<label>Modalidad de la partida</label>'+
      '<div class="bf-mode-pick">'+
        '<div class="bf-mode-opt" data-m="m3"><div class="bf-mode-t">Match a 3</div><div class="bf-mode-s">Empieza 0-0 · gana quien llegue a 2 victorias</div></div>'+
        '<div class="bf-mode-opt" data-m="m5"><div class="bf-mode-t">Match a 5</div><div class="bf-mode-s">Empieza 0-0 · gana quien llegue a 3 victorias</div></div>'+
        '<div class="bf-mode-opt active" data-m="free"><div class="bf-mode-t">Libre</div><div class="bf-mode-s">Marcador global de todas vuestras partidas</div></div>'+
      '</div>';
    var roomIg = room.closest('.ig');
    roomIg.parentNode.insertBefore(wrap, roomIg.nextSibling);
    wrap.querySelectorAll('.bf-mode-opt').forEach(function(opt){
      opt.addEventListener('click', function(){
        wrap.querySelectorAll('.bf-mode-opt').forEach(function(o){o.classList.remove('active');});
        opt.classList.add('active');
        var nn=ns(); if(nn) nn.matchMode = opt.dataset.m;
      });
    });
  }
  new MutationObserver(injectModePicker).observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState!=='loading') injectModePicker(); else document.addEventListener('DOMContentLoaded', injectModePicker);

  // ---- 2) Segundo listener sobre NET.conn para mensajes propios ----
  // PeerJS admite varios listeners 'data'; añadimos el nuestro sin tocar el
  // handler interno del juego. Esperamos a que exista NET.conn.
  var hooked = null;
  setInterval(function(){
    var n=ns(); if(!n || !n.conn || n.conn===hooked) return;
    hooked = n.conn;
    try{
      n.conn.on('data', function(msg){
        if(!msg || typeof msg!=='object') return;
        if(msg.t==='welcome' && msg.matchMode){ ensureState(); n.matchMode = msg.matchMode; }
        if(msg.t==='bfsync'){
          ensureState(); n.matchMode = msg.matchMode||n.matchMode; n.score = msg.score||n.score;
          // El marcador general lo suma también el cliente, con el nick del
          // ganador que envía el anfitrión (una sola vez por partida).
          try{ if(msg.winnerNick && window.bfSeriesScore) window.bfSeriesScore.scoreOnce(msg.winnerNick); }catch(e){}
          renderResultScreen(msg);
        }
        // bfrematch: el cliente solo espera; el host ya reinicia con initGame.
      });
    }catch(e){}
  }, 250);

  // ---- 3) host: adjuntar la modalidad al 'welcome' ----
  if(typeof window.netSend==='function' && !window.netSend.__bfMode){
    var origSend = window.netSend;
    window.netSend = function(obj){
      try{ if(obj && obj.t==='welcome'){ ensureState(); obj.matchMode = (ns()&&ns().matchMode)||'free'; } }catch(e){}
      return origSend.apply(this, arguments);
    };
    window.netSend.__bfMode = 1;
  }

  // ---- animación de campeón ----
  function championAnimation(name){
    var wrap = document.createElement('div');
    wrap.className='bf-champ-wrap';
    var colors=['#ffd24a','#ff7adf','#7ad6ff','#9dff8a','#ffe27a','#c79bff'], confetti='';
    for(var i=0;i<60;i++){
      var left=Math.random()*100, dur=2.4+Math.random()*2.6, delay=Math.random()*2.2, col=colors[i%colors.length];
      confetti+='<div class="bf-champ-confetti" style="left:'+left+'vw;background:'+col+';animation-duration:'+dur+'s;animation-delay:'+delay+'s"></div>';
    }
    wrap.innerHTML = confetti +
      '<div class="bf-champ-crown">👑</div>'+
      '<div class="bf-champ-ttl">¡CAMPEÓN!</div>'+
      '<div class="bf-champ-name">'+name+'</div>'+
      '<div class="bf-champ-sub">Ha ganado el match</div>'+
      '<button class="btn primary big" id="bf-champ-end">Terminar</button>';
    document.body.appendChild(wrap);
    var btn = wrap.querySelector('#bf-champ-end');
    if(btn) btn.onclick = function(){ try{ location.reload(); }catch(e){} };
  }

  // ---- volver a jugar sin recargar (reusa la conexión P2P) ----
  function rematch(){
    var n=ns(); if(!n){ location.reload(); return; }
    if(n.role==='host'){
      try{ netSend({t:'bfrematch'}); }catch(e){}
      if(typeof initGame==='function') initGame(n.names_self, n.names_opp, true);
    } else if(n.role==='client'){
      try{ if(typeof notif==='function') notif('Esperando a que el anfitrión reinicie…'); }catch(e){}
    } else { location.reload(); }
  }
  window.bfMatchRematch = rematch;

  // ---- pintar la pantalla de resultado con marcador ----
  // data: { myWin, score:{p,o}, matchMode, names:{p,o}, champSide }
  function renderResultScreen(data){
    var n=ensureState(); if(!n) return;
    var meta = modeMeta(data.matchMode||n.matchMode||'free');
    // Marcador de la pantalla final = EL MISMO marcador general (por nicks)
    // que se ve en la barra superior: tus victorias · las del rival.
    var gen = (window.bfSeriesScore&&window.bfSeriesScore.get)?window.bfSeriesScore.get():null;
    var nameP = gen?gen.selfNick:(n.names_self||'Tú'), nameO = gen?gen.oppNick:(n.names_opp||'Rival');
    // En modo libre el marcador de la pantalla final ES el global (histórico).
    // En Match a 3 / 5 se muestra el marcador del match (empieza 0-0) y debajo
    // una línea con el global, porque estas partidas también suman al general.
    var mySideR = n.mySide || (n.role==='client' ? 'o' : 'p');
    var ms = data.score || n.score || {p:0,o:0};
    var isMatch = (data.matchMode||n.matchMode)!=='free';
    var sp = gen?gen.self:0, so = gen?gen.opp:0;
    if(isMatch){
      sp = (mySideR==='p')?(ms.p||0):(ms.o||0);
      so = (mySideR==='p')?(ms.o||0):(ms.p||0);
    }
    var genLine = (isMatch&&gen)?('<div class="bf-mode-lbl">Marcador global: '+gen.selfNick+' '+gen.self+' — '+gen.opp+' '+gen.oppNick+'</div>'):'';
    var myWin = !!data.myWin;
    var champSide = data.champSide || null;

    if(typeof coachHide==='function') coachHide();
    if(typeof show==='function') show('s-result');
    if(typeof G!=='undefined') G._gameOver = true;

    var title = myWin ? '¡VICTORIA!' : 'DERROTA';
    var sub = myWin ? 'Has ganado la partida' : 'Tu rival ha ganado';
    var btns;
    if(champSide){
      btns = '<button class="btn primary big" onclick="location.reload()">Terminar</button>';
    } else if(n.role==='host'){
      btns = '<button class="btn primary big" onclick="bfMatchRematch()">Jugar otra vez</button>'+
             '<button class="btn big" style="margin-left:10px" onclick="location.reload()">Terminar</button>';
    } else {
      btns = '<div class="bf-mode-lbl">Esperando a que el anfitrión decida si jugar otra vez…</div>'+
             '<div style="margin-top:14px"><button class="btn big" onclick="location.reload()">Terminar</button></div>';
    }
    var rs = document.getElementById('s-result');
    if(rs){
      rs.innerHTML = '<div style="text-align:center">'+
        '<div style="font-size:64px;margin-bottom:6px">'+(myWin?'🏆':'💀')+'</div>'+
        '<div class="gtitle" style="font-size:clamp(30px,6vw,56px)">'+title+'</div>'+
        '<div style="font-size:17px;color:var(--gold);margin:6px 0 4px">'+sub+'</div>'+
        '<div class="bf-score-box">'+
          '<div class="bf-score-col"><div class="bf-score-name">'+nameP+'</div><div class="bf-score-num">'+sp+'</div></div>'+
          '<div class="bf-score-sep">—</div>'+
          '<div class="bf-score-col"><div class="bf-score-name">'+nameO+'</div><div class="bf-score-num">'+so+'</div></div>'+
        '</div>'+
        '<div class="bf-mode-lbl">'+meta.label+'</div>'+ genLine +
        '<div style="margin-top:22px">'+btns+'</div>'+
      '</div>';
    }
    setTimeout(function(){ if(typeof window.bfEndCinematic==='function') window.bfEndCinematic(myWin); }, 80);
    if(champSide){
      var champName = (champSide===mySideR)?nameP:nameO;
      setTimeout(function(){ championAnimation(champName); }, 1100);
    }
  }

  // ---- 4) interceptar el fin de partida ----
  var origShowResult = window.showResult;
  window.showResult = function(youWin){
    var isOnline = (typeof online==='function') && online();
    if(!isOnline || (typeof G!=='undefined' && G.demo)) return origShowResult.apply(this, arguments);

    var n=ensureState(); if(!n) return origShowResult.apply(this, arguments);
    var myWin = !!youWin;
    // El anfitrión SIEMPRE es 'p' y el invitado 'o'. Antes se leía n.mySide a
    // secas: si venía vacío, ganador y perdedor salían invertidos (pantalla y
    // cinemática equivocadas para los dos jugadores).
    var mySide = n.mySide || (n.role==='client' ? 'o' : 'p');
    var winnerSide = (myWin === (mySide==='p')) ? 'p' : 'o';
    var winnerNick = (winnerSide==='p') ? (n.names_self||'Anfitrión') : (n.names_opp||'Rival');

    // Solo el HOST es autoritativo con el marcador. El cliente espera el bfsync.
    if(n.role==='host'){
      if(typeof G!=='undefined' && !G.__bfScored){ G.__bfScored = true; n.score[winnerSide] = (n.score[winnerSide]||0)+1; }
      // Marcador general único (+1 por victoria, una sola vez por partida).
      try{ if(window.bfSeriesScore) window.bfSeriesScore.scoreOnce(winnerNick); }catch(e){}
      var meta = modeMeta(n.matchMode||'free');
      var champSide=null;
      if(meta.target>0){ if((n.score.p||0)>=meta.target) champSide='p'; else if((n.score.o||0)>=meta.target) champSide='o'; }
      var names = (typeof G!=='undefined'?G.names:{p:n.names_self,o:n.names_opp});
      // El host gana si winnerSide==='p' (host siempre es 'p').
      try{ netSend({ t:'bfsync', matchMode:n.matchMode||'free', score:{p:n.score.p||0,o:n.score.o||0}, names:names, champSide:champSide, winnerNick:winnerNick, myWin:(winnerSide==='o') }); }catch(e){}
      renderResultScreen({ myWin: (winnerSide===mySide), score:{p:n.score.p||0,o:n.score.o||0}, matchMode:n.matchMode, names:names, champSide:champSide });
    } else if(n.role==='client'){
      // El cliente renderiza SU pantalla de resultado inmediatamente con los
      // datos que tiene (youWin llega vía el mensaje 'end' del juego). Así el
      // jugador siempre puede salir aunque el bfsync del host se pierda o
      // tarde en llegar. Cuando bfsync llegue, actualizará el marcador.
      renderResultScreen({ myWin: !!youWin, score: n.score||{p:0,o:0}, matchMode: n.matchMode||'free' });
    }
  };
})();
</script>
`;