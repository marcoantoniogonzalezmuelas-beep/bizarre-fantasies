// Seguridad del iframe del juego. Nick, avatar y nombres de sala los controla
// el jugador (o la base de datos, donde cualquiera puede escribir), y antes se
// insertaban con innerHTML sin escapar: XSS almacenado, y el iframe comparte
// origen con la app (alcanza el token de sesión). Tres ayudantes globales:
//   bfEscH(texto)        -> texto seguro para innerHTML
//   bfAvUrl(url)         -> URL segura para src="..." ('' si no es https o relativa)
//   bfCleanIncoming(msg) -> limpia in situ nick/nombre/avatar de un mensaje de red
export const HTML_SAFETY_PATCH = `
<script>
(function(){
  if(window.bfEscH)return;
  window.bfEscH=function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return c==='&'?'&amp;':c==='<'?'&lt;':c==='>'?'&gt;':c==='"'?'&quot;':'&#39;';});};
  window.bfAvUrl=function(u){
    u=String(u==null?'':u);
    var https=u.slice(0,8).toLowerCase()==='https://', rel=u.charAt(0)==='/'&&u.charAt(1)!=='/';
    if(!https&&!rel)return '';
    var o='';
    try{
      for(var i=0;i<u.length;i++){
        var c=u.charCodeAt(i);
        o+=c===39?'%27':(c<=32||c===34||c===60||c===62||c===92||c===96||c>126)?encodeURIComponent(u.charAt(i)):u.charAt(i);
      }
    }catch(e){return '';}
    return o.slice(0,1200);
  };
  // Una clave tipo nick / name / names / avatar marca como "nombre" (o "avatar")
  // TODO lo que cuelga de ella: names:{p:'..'} y nicks:['..','..'] también se limpian.
  var KEY=/nick|avatar|names?$/i;
  function cleanStr(mode,s){return mode==='avatar'?window.bfAvUrl(s):s.split('<').join('').split('>').join('');}
  window.bfCleanIncoming=function(v,d,mode){
    d=d||0;
    if(!v||typeof v!=='object'||d>8)return v;
    for(var k in v){
      if(!Object.prototype.hasOwnProperty.call(v,k))continue;
      var x=v[k],m=mode;
      if(KEY.test(k))m=/avatar/i.test(k)?'avatar':'name';
      if(typeof x==='string'){if(m)v[k]=cleanStr(m,x);}
      else if(x&&typeof x==='object')window.bfCleanIncoming(x,d+1,m);
    }
    return v;
  };
})();
</script>
`;
