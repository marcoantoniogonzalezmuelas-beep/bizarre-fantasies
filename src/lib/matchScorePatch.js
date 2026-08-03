// Parche inyectado en el iframe: marcador de partidas múltiples (series).
// Cuando dos jugadores juegan varias partidas seguidas (online o local),
// lleva un conteo de victorias que se muestra en la UI con animación al
// cambiar. El marcador se resetea automáticamente cuando cambian los
// jugadores o el código de sala.
export const MATCH_SCORE_PATCH = `
<script>
(function(){
  if(window.__bfMatchScore)return;
  window.__bfMatchScore=true;

  // --- Identificador del emparejamiento (para resetear al cambiar) ---
  function matchupId(){
    if(typeof G==='undefined'||!G)return 'bf:none';
    var isOnline=(typeof online==='function')?online():false;
    if(isOnline&&typeof NET!=='undefined'&&NET.code)return 'bf:online:'+NET.code;
    if(G.oppHuman&&G.names)return 'bf:local:'+(G.names.p||'')+'_'+(G.names.o||'');
    return 'bf:none';
  }

  function getStored(){
    try{
      var d=JSON.parse(localStorage.getItem('bfSeriesScore')||'null');
      if(d&&d.m===matchupId())return d.s;
    }catch(e){}
    return null;
  }
  function setStored(s){
    try{localStorage.setItem('bfSeriesScore',JSON.stringify({m:matchupId(),s:s}));}catch(e){}
  }
  function curScore(){return getStored()||{p:0,o:0};}

  // --- CSS del marcador ---
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

  function names(){
    var pName='Tú',oName='Rival';
    if(typeof online==='function'&&online()&&typeof NET!=='undefined'){
      pName=(NET.names_self||'Tú');oName=(NET.names_opp||'Rival');
    }else if(typeof G!=='undefined'&&G.names){
      pName=G.names.p||'Tú';oName=G.names.o||'Rival';
    }
    if(pName.length>10)pName=pName.slice(0,9)+'…';
    if(oName.length>10)oName=oName.slice(0,9)+'…';
    return {p:pName,o:oName};
  }

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

  function render(animateSide){
    var s=curScore();var bar=ensureBar();var nm=names();
    bar.querySelector('.bf-score-p-name').textContent=nm.p;
    bar.querySelector('.bf-score-o-name').textContent=nm.o;
    var pNum=bar.querySelector('.bf-score-p-num'),oNum=bar.querySelector('.bf-score-o-num');
    var pOld=parseInt(pNum.textContent)||0,oOld=parseInt(oNum.textContent)||0;
    if(s.p===0&&s.o===0){bar.classList.remove('bf-score-show');return;}
    pNum.textContent=s.p;oNum.textContent=s.o;
    bar.classList.add('bf-score-show');
    if(animateSide==='p'&&s.p!==pOld){
      pNum.classList.remove('bf-score-pop');void pNum.offsetWidth;pNum.classList.add('bf-score-pop');
      sparksAt(pNum);
      bar.classList.remove('bf-score-flash');void bar.offsetWidth;bar.classList.add('bf-score-flash');
      setTimeout(function(){bar.classList.remove('bf-score-flash');},800);
    }
    if(animateSide==='o'&&s.o!==oOld){
      oNum.classList.remove('bf-score-pop');void oNum.offsetWidth;oNum.classList.add('bf-score-pop');
      sparksAt(oNum);
      bar.classList.remove('bf-score-flash');void bar.offsetWidth;bar.classList.add('bf-score-flash');
      setTimeout(function(){bar.classList.remove('bf-score-flash');},800);
    }
  }

  // --- Hook showResult: actualiza el marcador al terminar cada partida ---
  function install(){
    if(typeof window.showResult!=='function'||window.showResult.__bfScore)return false;
    var orig=window.showResult;
    window.showResult=function(youWin){
      try{
        if(typeof G==='undefined'||!G||G.demo){}
        else{
          var s=curScore();
          if(youWin)s.p++;else s.o++;
          setStored(s);
          render(youWin?'p':'o');
        }
      }catch(e){}
      return orig.apply(this,arguments);
    };
    window.showResult.__bfScore=1;
    return true;
  }

  // Render periódico: muestra el marcador al iniciar una partida nueva sin
  // esperar a que termine (solo si ya hay victorias acumuladas).
  var lastRender=0;
  setInterval(function(){
    if(typeof G==='undefined'||!G||G.demo)return;
    var s=curScore();
    if(s.p>0||s.o>0){
      if(Date.now()-lastRender>2000){render(null);lastRender=Date.now();}
    }
  },1500);

  // Render inicial tras retardo (para que NET/G estén listos).
  setTimeout(function(){try{render(null);}catch(e){}},3000);

  var t=setInterval(function(){install();},200);
})();
</script>
`;