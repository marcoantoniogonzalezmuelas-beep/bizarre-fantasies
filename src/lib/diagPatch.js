// MODO DIAGNÓSTICO (solo si la web se abre con ?diag=1): panel pequeño con el estado del equipo dentro del juego
// (versión cargada, parámetros recibidos, si la tienda se construyó desde la base de datos, errores y qué cartas hay
// en cada pestaña). Sirve para averiguar desde el navegador del jugador por qué una carta no sale en la tienda.
export const DIAG_PATCH = `
<script>
(function(){
  if(window.__bfDiagPatch)return;
  window.__bfDiagPatch=true;
  var on=false,box=null,ver='';
  // Errores de código al cargar el juego (también de sintaxis en bloques posteriores): se guardan, se muestran en el
  // panel y los primeros se mandan a los diagnósticos de "Red" del backoffice.
  window.__bfScriptErrors=window.__bfScriptErrors||[];
  window.addEventListener('error',function(ev){
    try{
      if(window.__bfScriptErrors.length>=6)return;
      var msg=String((ev&&ev.message)||'error')+' @ l\u00ednea '+((ev&&ev.lineno)||'?')+':'+((ev&&ev.colno)||'?');
      window.__bfScriptErrors.push(msg);
      if(window.__bfScriptErrors.length<=3)window.parent.postMessage({bfRelayError:{room_code:'',side:'',nick:'',error_type:'script_error',action:'gameLoad',error_message:msg.slice(0,400)}},'*');
    }catch(e){}
  },true);
  function version(){
    if(ver)return ver;
    try{ var m=/bf-\\d{4}-\\d{2}-\\d{2}-[a-z0-9]+-v\\d+/.exec(document.documentElement.innerHTML); ver=m?m[0]:'?'; }catch(e){ ver='?'; }
    return ver;
  }
  function list(arr){ try{ return (arr||[]).map(function(x){ return (x&&x.num?x.num:'·')+' '+(x&&x.name||'?'); }).join(', '); }catch(e){ return '?'; } }
  function paint(){
    if(!box){ box=document.createElement('div'); box.id='bf-diag';
      box.style.cssText='position:fixed;left:6px;bottom:6px;z-index:2147483000;max-width:min(560px,96vw);max-height:46vh;overflow:auto;background:rgba(0,0,0,.88);color:#cfe;font:11px/1.35 monospace;padding:8px 10px;border:1px solid #7ab8ff;border-radius:8px;pointer-events:auto;white-space:pre-wrap';
      document.body.appendChild(box); }
    var info=window.__bfEquipParamsInfo||{};
    var dbEq=(typeof DB_EQUIP!=='undefined'&&DB_EQUIP)?DB_EQUIP:null;
    // Estado del turno EN DIRECTO: qué está esperando el juego para pasar al siguiente turno.
    var turn='-',waits=[],fxN=0,layers='';
    try{
      if(typeof B!=='undefined'&&B){
        var hh=B.current&&typeof getHero==='function'?getHero(B.current.side,B.current.id):null;
        turn=(B.current?(B.current.side+':'+(hh?hh.name:B.current.id)):'sin turno')+' · ronda '+B.round+' · pendiente: '+(B.pending?(B.pending.kind||'s\\u00ed'):'no')+(B.over?' · TERMINADA':'');
      }
      if(typeof window.__bfCinematicBusy==='function'&&window.__bfCinematicBusy())waits.push('CINEM\\u00c1TICA');
      if(typeof window.__bfIndicatorsBusy==='function'&&window.__bfIndicatorsBusy())waits.push('CARTELES');
      if(typeof window.__bfKillCinePending==='function'&&window.__bfKillCinePending())waits.push('GOLPE MORTAL');
      var fl=document.getElementById('bf-fx-layer');fxN=fl?fl.children.length:0;
      layers=Array.prototype.map.call(document.querySelectorAll('[id^="bf-"]'),function(el){return el.id;}).filter(function(id){return /cine|anim|ov|kill|dice|roll|bluff|confirm|pick|target|modal/.test(id);}).slice(0,8).join(',');
    }catch(e){}
    var lines=[
      'TURNO: '+turn,
      'Esperando para pasar turno: '+(waits.join(', ')||'nada')+' · efectos en pantalla: '+fxN+' · capas: '+(layers||'ninguna'),
      'DIAGN\\u00d3STICO \\u00b7 versi\\u00f3n '+version(),
      'Par\\u00e1metros que ley\\u00f3 el servidor: '+(info.count!=null?info.count:'?')+(info.error?' \\u00b7 error: '+info.error:''),
      'Tienda construida desde la base de datos: '+(window.__bfEquipFromDb?'S\\u00cd':'NO')+' \\u00b7 intentos: '+(window.__bfEquipTries||0)+(window.__bfEquipFromPage?' \\u00b7 completadas desde la p\\u00e1gina: '+window.__bfEquipFromPage:''),
      'Error de la reconstrucci\\u00f3n: '+(window.__bfEquipSyncError||'ninguno'),
      'Errores de c\\u00f3digo al cargar: '+((window.__bfScriptErrors&&window.__bfScriptErrors.length)?window.__bfScriptErrors.join(' | '):'ninguno'),
      'Hechizos ('+(typeof SPELLS!=='undefined'?SPELLS.length:'?')+'): '+(typeof SPELLS!=='undefined'?list(SPELLS):'?'),
      'Armas C/C ('+(typeof MELEE!=='undefined'?MELEE.length:'?')+'): '+(typeof MELEE!=='undefined'?list(MELEE):'?'),
      'Armas distancia ('+(typeof RANGED!=='undefined'?RANGED.length:'?')+'): '+(typeof RANGED!=='undefined'?list(RANGED):'?'),
      'Armaduras ('+(typeof ARMORS!=='undefined'?ARMORS.length:'?')+'): '+(typeof ARMORS!=='undefined'?list(ARMORS):'?'),
      'Objetos ('+(typeof OBJECTS!=='undefined'?OBJECTS.length:'?')+'): '+(typeof OBJECTS!=='undefined'?list(OBJECTS):'?')
    ];
    box.textContent=lines.join('\\n');
  }
  window.addEventListener('message',function(e){ if(e&&e.data&&e.data.bfDiag){ on=true; paint(); } });
  // Además del aviso de la página, el propio juego mira si la dirección lleva ?diag=1 (el aviso podía no llegar).
  function wanted(){ try{ return /[?&]diag=/.test(window.parent.location.search)||/[?&]diag=/.test(window.location.search); }catch(e){ return false; } }
  setInterval(function(){ if(!on&&wanted())on=true; if(on)paint(); },1500);
})();
</script>
`;
