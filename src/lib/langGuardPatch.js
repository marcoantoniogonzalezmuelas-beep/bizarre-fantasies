// GUARDA DE IDIOMA para partidas en CASTELLANO (solo se inyecta cuando el selector no está en inglés).
// El jugador vio de repente textos en inglés (sobre todo habilidades de héroes) en una partida en castellano.
// Mientras no se localiza el origen:
//   1) DEFENSA: la página padre manda el diccionario inverso de la BD (texto inglés -> castellano de cada
//      campo bilingüe de las cartas). Un nodo de texto que coincide EXACTAMENTE con un texto inglés de ese
//      diccionario se sustituye por su castellano.
//   2) DETECTOR: un texto que parece inglés (varias palabras vacías inglesas y casi ninguna española) se
//      registra en los diagnósticos (tipo lang_leak) con una muestra, para ver qué es y de dónde sale.
export const LANG_GUARD_PATCH = `
<script>
(function(){
  if(window.__bfLangGuard)return;
  window.__bfLangGuard=1;
  var REV={},reported={},nReports=0;
  var DICE_EN=[
    ['EPIC FAIL! (a 1 on a d30 confirmed with a 1 on a d6 \\u2248 0.5%): the action does nothing and the effect backfires.','\\u00a1FALLO \\u00c9PICO! (1 en d30 confirmado con 1 en d6 \\u2248 0,5%): la acci\\u00f3n no hace nada y el efecto se vuelve en su contra.'],
    ['FUMBLE! (a 1 on a d30 not confirmed on the d6): the action does nothing.','\\u00a1PIFIA! (1 en d30 no confirmado en el d6): la acci\\u00f3n no hace nada.'],
    ['FUMBLE! (20 on a d30 \\u2248 3%): the action does nothing.','\\u00a1PIFIA! (20 en d30 \\u2248 3%): la acci\\u00f3n no hace nada.'],
    ['this ability had no visible effect this time.','esta vez la habilidad no ha tenido efecto visible.'],
    ['hits itself for','se golpea a s\\u00ed mismo por'],
    ['d30 roll','Tirada d30'],['(AI ranged)','(IA disparo)'],['(AI melee)','(IA cuerpo a cuerpo)'],['(AI spell)','(IA hechizo)'],['(AI item)','(IA objeto)'],
    ['(ranged)','(disparo)'],['(melee)','(cuerpo a cuerpo)'],['(ability)','(habilidad)'],['(spell)','(hechizo)'],['(item)','(objeto)'],
    ['EPIC FAIL','FALLO \\u00c9PICO'],['FUMBLE','PIFIA']
  ];
  var EN=('the and to of with deals damage target hero heroes all each turn is are your enemy enemies ally allies health attack ability card cards gain gains when after before for on in at by from this that it its their his her can cannot will may must per every one two three'+' ').split(' ');
  var ES=('el la los las de del y en un una con por para que se su sus al es lo m\\u00e1s da\\u00f1o h\\u00e9roe h\\u00e9roes turno enemigo enemigos aliado aliados vida o ni como sin sobre entre pero cuando despu\\u00e9s antes cada').split(' ');
  var ENS={},ESS={};EN.forEach(function(w){if(w)ENS[w]=1;});ES.forEach(function(w){if(w)ESS[w]=1;});
  window.bfLooksEnglish=function(t){
    var w=String(t||'').toLowerCase().replace(/[^a-z\\u00e1\\u00e9\\u00ed\\u00f3\\u00fa\\u00f1\\u00fc ]+/g,' ').split(/\\s+/).filter(Boolean);
    if(w.length<4)return false;
    var e=0,s=0;w.forEach(function(x){if(ENS[x])e++;if(ESS[x])s++;});
    return e>=3&&e>2*s;
  };
  window.addEventListener('message',function(ev){
    var d=ev.data&&ev.data.bfCardDictRev;
    if(d&&typeof d==='object'){REV=d;scan();}
  });
  function report(t){
    var k=t.slice(0,60);
    if(reported[k]||nReports>=8)return;
    reported[k]=1;nReports++;
    try{window.parent.postMessage({bfRelayError:{room_code:'',side:'',nick:'',error_type:'lang_leak',action:'langGuard',error_message:'texto en ingl\\u00e9s en partida en castellano: '+t.slice(0,160)}},'*');}catch(e){}
  }
  var SKIP={SCRIPT:1,STYLE:1,INPUT:1,TEXTAREA:1,NOSCRIPT:1};
  function scan(){
    try{
      if(document.hidden||!document.body)return;
      var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null),n,k=0;
      while((n=w.nextNode())&&k++<4000){
        var raw=n.nodeValue;if(!raw||raw.length<8)continue;
        if(n.__bfLg===raw)continue;
        var p=n.parentNode;if(!p||SKIP[p.nodeName])continue;
        var t=raw.trim(),es=REV[t];
        if(es){n.nodeValue=raw.replace(t,es);n.__bfLg=n.nodeValue;continue;}
        // Mensajes de las TIRADAS escritos por un anfitrión con el juego en inglés (el registro se copia tal cual al
        // invitado): se pasan al castellano con las mismas frases que usa el juego en castellano.
        if(/d30 roll|FUMBLE!|EPIC FAIL!|hits itself for|this ability had no visible effect/.test(raw)){
          var tr=raw;DICE_EN.forEach(function(pr){tr=tr.split(pr[0]).join(pr[1]);});
          if(tr!==raw){n.nodeValue=tr;n.__bfLg=tr;continue;}
        }
        n.__bfLg=raw;
        if(window.bfLooksEnglish(t))report(t);
      }
    }catch(e){}
  }
  window.__bfLangGuardScan=scan;
  var last=0;
  function throttled(){var n=Date.now();if(n-last<700)return;last=n;scan();}
  if(window.bfDom)window.bfDom.on(throttled);else new MutationObserver(throttled).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  setInterval(scan,2500);
})();
</script>
`;
