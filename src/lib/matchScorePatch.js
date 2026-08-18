// Parche inyectado en el iframe: MARCADOR GENERAL ÚNICO entre dos jugadores.
//
// Hay un solo marcador en todo el juego: acumula TODAS las victorias y derrotas
// históricas entre los dos mismos jugadores (por nick, no por sala), suma
// exactamente +1 por partida ganada y se muestra tanto en la barra superior
// como en la pantalla final (matchModePatch lee este mismo dato).
//
// API expuesta para el resto de parches:
//   window.bfSeriesScore.get()            -> {self, opp, selfNick, oppNick}
//   window.bfSeriesScore.addWin(nick)     -> suma 1 victoria a ese nick
//   window.bfSeriesScore.render()         -> repinta la barra
export const MATCH_SCORE_PATCH = `
<script>
(function(){
  if(window.__bfMatchScore)return;
  window.__bfMatchScore=true;

  // ---- Nicks de los dos jugadores ----
  function nicks(){
    var self='Tú',opp='Rival';
    try{
      if(typeof online==='function'&&online()&&typeof NET!=='undefined'){
        self=NET.names_self||'Tú'; opp=NET.names_opp||'Rival';
      }else if(typeof G!=='undefined'&&G.names){
        self=G.names.p||'Tú'; opp=G.names.o||'Rival';
      }
    }catch(e){}
    return {self:String(self),opp:String(opp)};
  }
  function pairKey(n){
    var a=[n.self,n.opp].map(function(s){return s.toLowerCase();}).sort();
    return a[0]+'||'+a[1];
  }

  // ---- Almacén persistente por pareja de nicks ----
  function readAll(){
    try{ return JSON.parse(localStorage.getItem('bfScoreByNick')||'{}')||{}; }catch(e){ return {}; }
  }
  function writeAll(d){ try{ localStorage.setItem('bfScoreByNick',JSON.stringify(d)); }catch(e){} }

  // El marcador general vive en la BASE DE DATOS (entidad HeadToHead): la
  // página padre nos envía el histórico por parejas de nicks al cargar, de modo
  // que al usar el mismo nick el marcador nunca se resetea, en cualquier
  // dispositivo. (El marcador de series al mejor de 3/5 sigue reseteándose:
  // eso lo gestiona matchModePatch, aquí no se toca.)
  window.addEventListener('message',function(e){
    if(!e.data||!e.data.bfScoreDb)return;
    var db=e.data.bfScoreDb,all=readAll();
    Object.keys(db).forEach(function(k){
      var rec=all[k]||{},src=db[k]||{};
      Object.keys(src).forEach(function(n){ rec[n]=Math.max(rec[n]||0,src[n]||0); });
      all[k]=rec;
    });
    writeAll(all);
    try{ render(null); }catch(err){}
  });

  // Reset general único: pone a cero todos los marcadores históricos.
  try{
    if(localStorage.getItem('bfScoreReset')!=='v3'){
      localStorage.removeItem('bfScoreByNick');
      localStorage.setItem('bfScoreReset','v3');
    }
  }catch(e){}

  function get(){
    var n=nicks(),all=readAll(),rec=all[pairKey(n)]||{};
    return {self:rec[n.self.toLowerCase()]||0,opp:rec[n.opp.toLowerCase()]||0,selfNick:n.self,oppNick:n.opp};
  }
  function addWin(winnerNick){
    if(!winnerNick)return get();
    var n=nicks(),all=readAll(),k=pairKey(n),rec=all[k]||{};
    var w=String(winnerNick).toLowerCase();
    rec[w]=(rec[w]||0)+1;   // una victoria = +1 punto
    all[k]=rec; writeAll(all);
    // Persiste la victoria en la base de datos solo si NO somos cliente
    // online: el anfitrión es la fuente autoritativa y escribe en la BD; el
    // cliente solo actualiza su localStorage local. Así evitamos registros
    // duplicados cuando ambos dispositivos enviaban bfScoreWin a la vez
    // (condición de carrera que creaba filas repetidas para la misma
    // pareja+nick y desincronizaba el marcador entre los dos jugadores).
    var isOnlineClient=false;
    try{ isOnlineClient=(typeof online==='function'&&online()&&typeof NET!=='undefined'&&NET.role==='client'); }catch(e){}
    if(!isOnlineClient){
      try{ parent.postMessage({bfScoreWin:{pair_key:k,nick:w,wins:rec[w]}},'*'); }catch(e){}
    }
    return get();
  }

  // ---- CSS de la barra ----
  var css=''+
  '#bf-score-bar{position:fixed;top:6px;left:50%;transform:translateX(-50%);z-index:100040;display:none;align-items:center;gap:8px;padding:5px 14px;border-radius:999px;background:linear-gradient(180deg,#1b1430,#120d22);border:1.5px solid rgba(255,210,74,.5);box-shadow:0 4px 18px rgba(0,0,0,.5),0 0 12px rgba(255,210,74,.15);font-family:Cinzel,serif;font-weight:900;color:#ffe49a;pointer-events:none;transition:box-shadow .3s,transform .3s}'+
  '#bf-score-bar.bf-score-show{display:flex}'+
  '#bf-score-bar.bf-score-flash{box-shadow:0 4px 28px rgba(0,0,0,.6),0 0 34px rgba(255,210,74,.75),0 0 60px rgba(255,190,40,.4);transform:translateX(-50%) scale(1.06)}'+
  '.bf-score-side{display:flex;align-items:center;gap:5px}'+
  '.bf-score-name{font-size:10px;color:#cfc6dd;font-weight:600;max-width:55px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
  '.bf-score-num{font-size:20px;color:#FFD24A;text-shadow:0 0 10px rgba(255,210,74,.5);min-width:16px;text-align:center;display:inline-block}'+
  '.bf-score-num.bf-score-pop{animation:bfScorePop .9s cubic-bezier(.2,.9,.3,1.6)}'+
  '@keyframes bfScorePop{0%{transform:scale(.1);color:#fff}35%{transform:scale(1.9);color:#fff;text-shadow:0 0 28px rgba(255,255,255,.95),0 0 14px rgba(255,210,74,.8)}65%{transform:scale(.85)}100%{transform:scale(1);color:#FFD24A}}'+
  '.bf-score-vs{color:#8a7ca0;font-size:11px;margin:0 1px}'+
  '.bf-score-spark{position:fixed;width:4px;height:4px;border-radius:50%;background:#FFD24A;box-shadow:0 0 8px #FFD24A,0 0 14px rgba(255,210,74,.6);pointer-events:none;z-index:100041;animation:bfScoreSpark .9s ease-out forwards}'+
  '@keyframes bfScoreSpark{0%{opacity:1;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--sx,0px),var(--sy,-40px)) scale(.2)}}'+
  '@media(max-width:600px){#bf-score-bar{font-size:12px;padding:4px 10px;gap:5px}.bf-score-num{font-size:16px;min-width:12px}.bf-score-name{font-size:9px;max-width:38px}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  var barEl=null;
  function ensureBar(){
    if(barEl)return barEl;
    barEl=document.createElement('div');barEl.id='bf-score-bar';
    barEl.innerHTML='<div class="bf-score-side"><span class="bf-score-name bf-score-p-name">Tú</span><span class="bf-score-num bf-score-p-num">0</span></div><span class="bf-score-vs">·</span><div class="bf-score-side"><span class="bf-score-num bf-score-o-num">0</span><span class="bf-score-name bf-score-o-name">Rival</span></div>';
    document.body.appendChild(barEl);
    return barEl;
  }
  function shortName(s){ s=String(s||''); return s.length>10?s.slice(0,9)+'…':s; }

  function sparksAt(el){
    if(!el)return;
    var r=el.getBoundingClientRect();if(!r.width)return;
    var cx=r.left+r.width/2,cy=r.top+r.height/2;
    for(var i=0;i<14;i++){
      var sp=document.createElement('div');sp.className='bf-score-spark';
      sp.style.left=(cx-2)+'px';sp.style.top=(cy-2)+'px';
      var ang=(Math.PI*2*i)/14+Math.random()*0.4;
      var dist=28+Math.random()*34;
      sp.style.setProperty('--sx',(Math.cos(ang)*dist).toFixed(0)+'px');
      sp.style.setProperty('--sy',((Math.sin(ang)*dist)-18).toFixed(0)+'px');
      sp.style.animationDelay=(Math.random()*0.18).toFixed(2)+'s';
      sp.style.width=(3+Math.random()*4).toFixed(0)+'px';sp.style.height=sp.style.width;
      document.body.appendChild(sp);
      (function(s){setTimeout(function(){if(s.parentNode)s.parentNode.removeChild(s);},1200);})(sp);
    }
  }

  // Nicks genéricos que el juego asigna por defecto. Si alguno de los dos
  // jugadores tiene un nick genérico, el marcador no se muestra.
  var GENERIC=/^(tú|tu|rival|jugador\\s*\\d*|player\\s*\\d*|player|cpu|ia|bot|oponente|opponent)$/i;
  function isGeneric(s){ return !s || GENERIC.test(String(s).trim()); }
  // El marcador solo se muestra a partir de la subasta (no en la portada).
  function isOnTitle(){
    try{ var a=document.querySelector('.screen.active'); return !a||a.id==='s-title'; }catch(e){ return true; }
  }
  function render(animateSide){
    var s=get();var bar=ensureBar();
    bar.querySelector('.bf-score-p-name').textContent=shortName(s.selfNick);
    bar.querySelector('.bf-score-o-name').textContent=shortName(s.oppNick);
    var pNum=bar.querySelector('.bf-score-p-num'),oNum=bar.querySelector('.bf-score-o-num');
    var pOld=parseInt(pNum.textContent)||0,oOld=parseInt(oNum.textContent)||0;
    if(isOnTitle()||isGeneric(s.selfNick)||isGeneric(s.oppNick)){bar.classList.remove('bf-score-show');return;}
    if(s.self===0&&s.opp===0){bar.classList.remove('bf-score-show');return;}
    pNum.textContent=s.self;oNum.textContent=s.opp;
    bar.classList.add('bf-score-show');
    function pop(el,changed){
      if(!changed)return;
      el.classList.remove('bf-score-pop');void el.offsetWidth;el.classList.add('bf-score-pop');
      sparksAt(el);
      bar.classList.remove('bf-score-flash');void bar.offsetWidth;bar.classList.add('bf-score-flash');
      setTimeout(function(){bar.classList.remove('bf-score-flash');},800);
    }
    if(animateSide==='self')pop(pNum,s.self!==pOld);
    if(animateSide==='opp')pop(oNum,s.opp!==oOld);
  }

  window.bfSeriesScore={
    get:get,
    render:render,
    addWin:function(nick){
      var n=nicks(),s=addWin(nick);
      render(String(nick).toLowerCase()===n.self.toLowerCase()?'self':'opp');
      return s;
    },
    // Suma la victoria de la partida actual una ÚNICA vez (a prueba de
    // envoltorios múltiples de showResult y de reenvíos por red).
    scoreOnce:function(winnerNick){
      try{
        if(typeof G==='undefined'||!G||G.demo)return;
        if(G.__bfScoredOnce)return;
        G.__bfScoredOnce=true;
        window.bfSeriesScore.addWin(winnerNick);
      }catch(e){}
    }
  };

  // ---- Hook showResult: solo suma el bando local (o el host en online) ----
  function install(){
    if(typeof window.showResult!=='function'||window.showResult.__bfScore)return false;
    var orig=window.showResult;
    window.showResult=function(youWin){
      try{
        if(typeof G!=='undefined'&&G&&!G.demo){
          var isOnline=(typeof online==='function')?online():false;
          // En online, el marcador general lo gestiona matchModePatch: el
          // anfitrión suma la victoria (scoreOnce) y la replica al cliente
          // vía bfsync. Aquí NO sumamos en online para evitar un doble
          // scoring con un youWin que, en ciertas condiciones de red, llegaba
          // invertido y sumaba la victoria al jugador equivocado.
          if(!isOnline){
            var n=nicks();
            window.bfSeriesScore.scoreOnce(youWin?n.self:n.opp);
          }
        }
      }catch(e){}
      return orig.apply(this,arguments);
    };
    window.showResult.__bfScore=1;
    return true;
  }

  // Render periódico: muestra el marcador general en cuanto hay victorias.
  var lastRender=0;
  setInterval(function(){
    if(typeof G==='undefined'||!G||G.demo)return;
    var s=get();
    if(s.self>0||s.opp>0){
      if(Date.now()-lastRender>2000){render(null);lastRender=Date.now();}
    }
  },1500);

  setTimeout(function(){try{render(null);}catch(e){}},3000);
  setInterval(function(){install();},200);
})();
</script>
`;