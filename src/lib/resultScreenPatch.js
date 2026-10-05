// PANTALLA DE RESULTADO ORDENADA.
//  · Se repara sola: si se muestra vacía (cuando el final se fuerza por el rescate y la función normal falla), se
//    rellena con el trofeo o la calavera, VICTORIA/DERROTA y su frase.
//  · Botones centrados en UNA fila: "🔁 Volver a jugar" (contra la IA vuelve a la subasta; en línea pide la revancha;
//    las misiones traen su "Volver a las misiones") y "📸 Compartir resultado".
//  · Sin un segundo "Salir": ya está el "⌂ Salir" fijo de arriba.
export const RESULT_SCREEN_PATCH = `
<script>
(function(){
  if(window.__bfResultScreen)return;
  window.__bfResultScreen=true;
  var css=document.createElement('style');
  css.textContent='#s-result .bf-res-actions{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:12px;margin:6px auto 0;max-width:640px}'
    +'#s-result .bf-res-actions .btn{margin:0!important;display:inline-flex;align-items:center;justify-content:center;gap:8px}'
    +'#s-result .bf-res-content{text-align:center;display:flex;flex-direction:column;align-items:center}';
  document.head.appendChild(css);
  function online(){ try{ return typeof NET!=='undefined'&&(NET.role==='host'||NET.role==='client'); }catch(e){ return false; } }
  function myWin(){
    try{ var r=G._result||{}; if(typeof NET!=='undefined'&&NET.role==='client')return r.pWin===(NET.mySide==='p'); return !!r.pWin; }catch(e){ return false; }
  }
  function heal(s){
    if(s.querySelector('.gtitle')||typeof G==='undefined'||!G||!G._result)return;
    var win=myWin(),on=online(),mission=!!G.bfMission;
    var sub=on?(win?'Has ganado la partida online':'Tu rival ha ganado'):(win?'Has derrotado a la IA':'La IA te ha derrotado');
    var keep=Array.prototype.slice.call(s.children);   // botones que otros parches ya hubieran puesto
    var box=document.createElement('div');box.className='bf-res-content';
    box.innerHTML='<div style="font-size:72px;margin-bottom:10px">'+(win?'\\u{1F3C6}':'\\u{1F480}')+'</div>'
      +'<div class="gtitle" style="font-size:clamp(34px,7vw,64px)">'+(win?'\\u00a1VICTORIA!':'DERROTA')+'</div>'
      +'<div style="font-size:18px;color:var(--gold);margin:8px 0 30px">'+sub+'</div>'
      +(mission?'':'<button class="btn primary big" id="bf-rematch-btn" onclick="'+(on?'bfMatchRematch()':'bfRematch()')+'">\\u{1F501} Volver a jugar</button>');
    s.insertBefore(box,s.firstChild);
    keep.forEach(function(k){ if(k.tagName==='BUTTON')box.appendChild(k); });
    try{ window.parent.postMessage({bfRelayError:{room_code:'',side:'',nick:'',error_type:'result_healed',action:'resultScreen',error_message:'pantalla de resultado vac\\u00eda: rellenada'}},'*'); }catch(e){}
  }
  function tidy(){
    var s=document.getElementById('s-result');
    if(!s||!s.classList.contains('active'))return;
    heal(s);
    // Fuera el segundo "Salir" (ya está el fijo de arriba).
    var ex=document.getElementById('bf-exit-btn');if(ex&&ex.parentNode)ex.parentNode.removeChild(ex);
    var content=s.querySelector('.gtitle');content=content?content.parentNode:s;
    var row=s.querySelector('.bf-res-actions');
    if(!row){ row=document.createElement('div');row.className='bf-res-actions';content.appendChild(row); }
    // Volver a jugar (o la revancha en línea) y Volver a las misiones, en la fila; con el mismo texto en todos los modos.
    Array.prototype.forEach.call(s.querySelectorAll('button'),function(b){
      if(b.parentNode===row)return;
      var oc=b.getAttribute('onclick')||'',t=String(b.textContent||'').toLowerCase();
      var isReplay=b.id==='bf-rematch-btn'||oc.indexOf('bfMatchRematch')>=0||oc.indexOf('bfRematch')>=0||t.indexOf('jugar otra vez')>=0;
      var isMissions=t.indexOf('misiones')>=0;
      if(isReplay){ if(!b.disabled)b.textContent='\\u{1F501} Volver a jugar'; row.insertBefore(b,row.firstChild); }
      else if(isMissions){ row.insertBefore(b,row.firstChild); }
    });
    var share=document.getElementById('bf-share-result');
    if(share&&share.parentNode!==row)row.appendChild(share);
  }
  setInterval(tidy,400);
})();
</script>
`;
