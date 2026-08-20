// Parche inyectado en el iframe: recuerda el nick del jugador en este
// navegador (localStorage) y lo autocompleta en los campos de nombre de las
// pantallas de IA, local y online. Se guarda al arrancar cualquier partida.
export const NICK_MEMORY_PATCH = `
<script>
(function(){
  if(window.__bfNickMemory)return;
  window.__bfNickMemory=true;

  var KEY='bfMyNick';
  function getNick(){try{return localStorage.getItem(KEY)||'';}catch(e){return '';}}
  function saveNick(v){
    var s=String(v==null?'':v).trim();
    if(!s||/^jugador(\\s*\\d+)?$/i.test(s))return;
    try{localStorage.setItem(KEY,s);}catch(e){}
  }

  // Autocompleta el nick guardado en los campos propios (no en el del J2).
  // Se rellena SIEMPRE que el campo esté vacío o con el genérico "Jugador N",
  // incluidos los formularios que el juego dibuja después (crear/unirse a sala),
  // para que el jugador no tenga que volver a escribir su nick.
  function prefill(){
    var saved=getNick();
    if(!saved)return;
    // 'jlname' = campo de nick del formulario "Unirse" que abre una sala de la
    // lista (puede vivir fuera de #s-lobby, en un modal).
    var fields=['p1name','hname','jname','jlname'].map(function(id){return document.getElementById(id);});
    document.querySelectorAll('#s-lobby input[id*="name" i]').forEach(function(i){
      if(i.id!=='p2name'&&fields.indexOf(i)===-1)fields.push(i);
    });
    fields.forEach(function(i){
      if(!i||i===document.activeElement)return;
      var cur=String(i.value).trim();
      if(!cur||/^jugador(\\s*\\d+)?$/i.test(cur))i.value=saved;
    });
  }

  // Guarda el nick cuando arranca una partida. Se envuelve una sola vez por
  // función (registro propio), aunque otros parches la redefinan después.
  var wrapped={};
  function wrap(name,getVal){
    if(typeof window[name]!=='function'||wrapped[name])return;
    var orig=window[name];
    window[name]=function(){
      try{saveNick(getVal(arguments));}catch(e){}
      return orig.apply(this,arguments);
    };
    wrapped[name]=1;
  }
  function val(id){var i=document.getElementById(id);return i?i.value:'';}
  function hookAll(){
    wrap('startVsAI',function(){return val('p1name');});
    wrap('localStart',function(){return val('p1name');});
    wrap('hostCreate',function(a){return a[0];});
    wrap('clientJoin',function(a){return a[2];});
  }

  prefill();
  hookAll();
  new MutationObserver(prefill).observe(document.documentElement,{childList:true,subtree:true});
  var tries=0,iv=setInterval(function(){hookAll();if(tries++>100)clearInterval(iv);},200);
})();
</script>
`;