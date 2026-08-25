// VELOCIDAD REAL DE LA CARTA.
//
// El motor original calculaba la velocidad de un héroe como su STAT PRINCIPAL
// (CC/AD/HE) + modificadores de raza y equipo. Por eso Fas Everest Panzer, que
// en su carta tiene velocidad 1, aparecía en batalla con 40: 40 es su HE, no su
// velocidad.
//
// Este parche hace que la velocidad de la carta (campo "velocidad" /
// "elite_velocidad" del backoffice) sea la BASE real, conservando los
// modificadores del juego (raza, Daga Veloz +3, arma pesada −2, hechizos…).
// Así el número que se ve en el retrato de batalla, en la barra de turnos, en
// el equipamiento y en la carta ampliada es el de la carta, y el orden de
// turnos coincide con lo que muestra.
export const HERO_VEL_PATCH = `
<script>
(function(){
  if(window.__bfHeroVel)return;
  window.__bfHeroVel=true;

  var VEL={};
  window.__bfHeroVelMap=VEL;
  window.addEventListener('message',function(e){
    if(e.data&&e.data.bfHeroVel&&typeof e.data.bfHeroVel==='object'){
      VEL=e.data.bfHeroVel;window.__bfHeroVelMap=VEL;
    }
  });

  function key(h){ return String((h&&(h.cid||h.cardId||h.card_id||h.id))||'').replace(/_\\d{6,}$/,''); }
  function cardVel(h){
    if(!h)return null;
    var e=VEL[key(h)]||(h.name?VEL[String(h.name).toLowerCase()]:null);
    if(!e)return null;
    var v=h.eliteMode?(e.elite!=null?e.elite:e.base):e.base;
    return (v==null||isNaN(Number(v)))?null:Number(v);
  }
  window.__bfCardVel=cardVel;

  function install(){
    var ok=false;
    if(typeof window.velocity==='function'&&!window.velocity.__bfVel){
      var ov=window.velocity;
      var wv=function(h){
        var base=ov.apply(this,arguments),cv=cardVel(h);
        if(cv==null)return base;
        // Se sustituye SOLO la base (stat principal) por la velocidad de la
        // carta; los modificadores siguen sumando igual.
        try{ return Math.max(1,base-stat(h,primKey(h.type))+cv); }catch(e){ return cv; }
      };
      wv.__bfVel=1;window.velocity=wv;ok=true;
    }
    if(typeof window.eqVelVal==='function'&&!window.eqVelVal.__bfVel){
      var oe=window.eqVelVal;
      var we=function(h){
        var base=oe.apply(this,arguments),cv=cardVel(h);
        if(cv==null)return base;
        try{ return Math.max(1,base-eqStat(h,primKey(h.type))+cv); }catch(e){ return cv; }
      };
      we.__bfVel=1;window.eqVelVal=we;ok=true;
    }
    return ok;
  }

  var tries=0,iv=setInterval(function(){ install(); if(tries++>200)clearInterval(iv); },200);
  install();
})();
</script>
`;