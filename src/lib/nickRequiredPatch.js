// Parche inyectado en el iframe: obliga a escribir un nick propio antes de
// poder jugar (IA, local u online). Sin nick válido no arranca la partida ni
// se crea/une sala, así el ranking siempre refleja nombres reales.
export const NICK_REQUIRED_PATCH = `
<script>
(function(){
  if(window.__bfNickRequired)return;
  window.__bfNickRequired=true;

  var st=document.createElement('style');
  st.textContent='.bf-nick-bad{border-color:#ff5a5a!important;box-shadow:0 0 0 2px rgba(255,90,90,.45)!important;animation:bfNickShake .3s}@keyframes bfNickShake{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}';
  document.head.appendChild(st);

  // Palabras obscenas/soeces prohibidas en los nicks (ES + EN). Se comparan
  // sobre el texto normalizado (sin acentos, ñ→n, números tipo leet → letras)
  // y por palabra completa para no bloquear nicks legítimos (ej. "Computadora").
  var BAD_WORDS=['cono','polla','picha','joder','jodido','jodida','puta','puto','putas','putos','mierda','cabron','cabrona','cabrones','gilipollas','follar','follada','follador','zorra','zorron','maricon','marica','mariconazo','verga','chocho','cipote','pene','culo','culos','tetas','cojones','cojon','pichabrava','subnormal','mongolo','mongola','retrasado','retrasada','pendejo','pendeja','concha','conchatumadre','hijoputa','hijaputa','hijodeputa','malfollada','malfollado','nazi','hitler','fuck','fucker','fucking','shit','bitch','cunt','dick','pussy','asshole','whore','slut','nigger','nigga','faggot'];
  function obsceneNick(v){
    var s=String(v==null?'':v).toLowerCase();
    try{s=s.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'');}catch(e){}
    s=s.replace(/ñ/g,'n');
    // Se comprueban dos variantes: con dígitos/símbolos como separadores
    // ("coño123" → "cono") y con sustituciones tipo leet ("c0ñ0" → "cono").
    var leet=s.replace(/0/g,'o').replace(/1/g,'i').replace(/3/g,'e').replace(/4/g,'a').replace(/5/g,'s').replace(/@/g,'a').replace(/\\$/g,'s');
    var words=s.split(/[^a-z]+/).concat(leet.split(/[^a-z]+/));
    for(var i=0;i<words.length;i++){
      if(words[i]&&BAD_WORDS.indexOf(words[i])!==-1)return true;
    }
    return false;
  }
  // Un nick es válido si no está vacío, no es el genérico "Jugador 1/2" y no
  // contiene palabras malsonantes.
  var GENERIC=/^(tú|tu|rival|jugador(\\s*\\d+)?|player(\\s*\\d+)?|player|cpu|ia|bot|oponente|opponent)$/i;
  function badNick(v){
    var s=String(v==null?'':v).trim();
    return !s||GENERIC.test(s)||obsceneNick(s);
  }
  // Mensaje adecuado: distinto si el nick está vacío o si es malsonante.
  function nickMsg(v,fallback){
    return obsceneNick(v)?'Ese nick no está permitido: elige otro sin palabras malsonantes':fallback;
  }
  function warn(msg,input){
    try{if(typeof notif==='function')notif(msg);else alert(msg);}catch(e){}
    if(input){
      input.classList.add('bf-nick-bad');
      try{input.focus();}catch(e){}
      setTimeout(function(){input.classList.remove('bf-nick-bad');},1600);
    }
  }
  function el(id){return document.getElementById(id);}

  // Partida contra la IA y partida local: valida los campos de nombre.
  // Registro global: cada función se envuelve UNA sola vez. Antes se comprobaba
  // el flag en la propia función (window[name].__bfNick), pero si otro parche
  // (contraseña, avatar) envolvía por encima, el flag desaparecía y este parche
  // volvía a envolver → decenas de capas anidadas que bloqueaban el arranque
  // de las partidas online ("Verificando nick…" en bucle).
  window.__bfNickWrapped=window.__bfNickWrapped||{};
  function wrap(name,check){
    if(typeof window[name]!=='function'||window.__bfNickWrapped[name])return false;
    window.__bfNickWrapped[name]=1;
    var orig=window[name];
    window[name]=function(){
      var block=check(arguments);
      if(block)return;
      return orig.apply(this,arguments);
    };
    window[name].__bfNick=1;
    return true;
  }

  function hookAll(){
    wrap('startVsAI',function(){
      var i=el('p1name');
      if(!i||badNick(i.value)){warn(nickMsg(i&&i.value,'Escribe tu nick para poder jugar'),i);return true;}
      return false;
    });
    wrap('localStart',function(){
      var i1=el('p1name'),i2=el('p2name');
      if(!i1||badNick(i1.value)){warn(nickMsg(i1&&i1.value,'Escribe el nick del Jugador 1'),i1);return true;}
      if(!i2||badNick(i2.value)){warn(nickMsg(i2&&i2.value,'Escribe el nick del Jugador 2'),i2);return true;}
      return false;
    });
    // Online: hostCreate(name,pass,roomName) y clientJoin(code,pass,name).
    wrap('hostCreate',function(args){
      if(badNick(args[0])){
        var i=el('hname')||document.querySelector('#s-lobby input[id*="name" i]');
        warn(nickMsg(args[0],'Escribe tu nick para crear la sala'),i);
        return true;
      }
      return false;
    });
    wrap('clientJoin',function(args){
      if(badNick(args[2])){
        var i=el('jname')||document.querySelector('#s-lobby input[id*="name" i]');
        warn(nickMsg(args[2],'Escribe tu nick para unirte a la sala'),i);
        return true;
      }
      return false;
    });
  }

  // Los campos vienen prellenados con "Jugador 1/2": se vacían para que el
  // jugador escriba su propio nick (el genérico ya no vale para jugar).
  function clearGeneric(){
    ['p1name','p2name','hname','jname'].forEach(function(id){
      var i=el(id);
      if(!i||i.dataset.bfNickClean==='1')return;
      i.dataset.bfNickClean='1';
      if(GENERIC.test(String(i.value).trim()))i.value='';
      i.placeholder='Escribe tu nick';
    });
  }
  clearGeneric();
  new MutationObserver(clearGeneric).observe(document.documentElement,{childList:true,subtree:true});

  hookAll();
  // Reintenta por si otras envolturas (reconexión, lobby) redefinen funciones.
  var tries=0,iv=setInterval(function(){hookAll();if(tries++>100)clearInterval(iv);},200);
})();
</script>
`;