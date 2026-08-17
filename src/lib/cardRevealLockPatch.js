// Parche inyectado en el iframe: la carta jugada (revelación central) ya no se
// solapa con nada.
//
// 1) CANDADO DE ACCIONES: mientras la carta está en el centro de la pantalla,
//    ninguna acción de batalla se ejecuta (ataques, habilidades, hechizos,
//    objetos, fin de turno y turno de la IA se posponen hasta que termina).
//
// 2) REUBICACIÓN: si la carta jugada genera además una animación 3D (Ave
//    Fénix, Reanimación Arcana, Tanque, Transformer, habilidades de héroe…),
//    la carta se aparta a un lado y la criatura 3D al otro. En pantallas
//    estrechas se separan en vertical (carta arriba, animación abajo).
export const CARD_REVEAL_LOCK_PATCH = `
<style id="bf-reveal-lock">
/* Carta jugada + animación 3D a la vez: se reparten la pantalla. */
body.bf-cine-active .bf-reveal{transform:translateX(-27vw) scale(.82)!important}
body.bf-cine-active #bf-abil-anim .bf-aa-img,
body.bf-cine-active #bf-spec-cine .bf-sc-img{left:70%!important}
body.bf-cine-active #bf-abil-anim .bf-aa-glowdisc{left:70%!important}
@media(max-width:900px){
  /* En móvil/tablet no hay sitio en horizontal: carta arriba, criatura abajo. */
  body.bf-cine-active .bf-reveal{transform:translateY(-25vh) scale(.68)!important}
  body.bf-cine-active #bf-abil-anim .bf-aa-img,
  body.bf-cine-active #bf-spec-cine .bf-sc-img{left:50%!important;top:74%!important}
  body.bf-cine-active #bf-abil-anim .bf-aa-glowdisc{top:74%!important}
}
</style>
<script>
(function(){
  if(window.__bfRevealLock)return;
  window.__bfRevealLock=true;

  var until=0;   // instante hasta el que la batalla está en pausa
  function locked(){ return Date.now()<until; }
  window.__bfBattlePaused=locked;

  // ---- 1) Candado: la carta en pantalla pausa la batalla ----
  // La revelación dura ~5 s; se pausa un poco menos para que la siguiente
  // acción arranque justo cuando la carta empieza a desvanecerse.
  function hookReveal(){
    if(typeof window.__bfShowCardReveal!=='function'||window.__bfShowCardReveal.__bfLock)return false;
    var orig=window.__bfShowCardReveal;
    window.__bfShowCardReveal=function(){
      until=Date.now()+4200;
      document.body.classList.add('bf-card-reveal');
      setTimeout(function(){document.body.classList.remove('bf-card-reveal');},4200);
      return orig.apply(this,arguments);
    };
    window.__bfShowCardReveal.__bfLock=1;
    return true;
  }

  // Aplaza una función mientras el candado esté activo (reintenta al soltarse).
  function defer(name){
    var fn=window[name];
    if(typeof fn!=='function'||fn.__bfLock)return false;
    var wrapped=function(){
      if(locked()){
        var self=this,args=arguments;
        // Espera acotada: nunca puede quedarse encadenando esperas (eso dejaba
        // el turno colgado si una revelación renovaba el candado).
        var wait=Math.min(4300,Math.max(60,until-Date.now()+40));
        setTimeout(function(){
          until=0;   // el candado no puede volver a aplazar esta misma acción
          try{ fn.apply(self,args); }catch(e){}
        }, wait);
        return;
      }
      return fn.apply(this,arguments);
    };
    wrapped.__bfLock=1;
    window[name]=wrapped;
    return true;
  }

  var TARGETS=['attack','useAbility','endTurn','aiTurn','aiPlay','castSpell','useItem','useItem_AI'];
  var done={};
  function hookAll(){
    var all=hookReveal();
    TARGETS.forEach(function(n){
      if(done[n])return;
      if(defer(n))done[n]=1; else all=false;
    });
    return all;
  }

  // ---- 2) Reubicación: detecta si hay una animación 3D en pantalla ----
  function syncCine(){
    var on=!!(document.getElementById('bf-abil-anim')||document.getElementById('bf-spec-cine'));
    document.body.classList.toggle('bf-cine-active',on);
  }

  var tries=0,iv=setInterval(function(){
    syncCine();
    hookAll();
    if(++tries>400)clearInterval(iv);
  },200);
  hookAll();
})();
</script>
`;