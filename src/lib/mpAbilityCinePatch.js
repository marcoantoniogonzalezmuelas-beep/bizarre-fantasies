// Parche inyectado en el iframe: sincroniza las cinemáticas de habilidades
// (abilityAnimPatch 3D, epicAbilityFxPatch temáticas y abilityFxPatch genéricas)
// del anfitrión al cliente en partidas multiplayer.
//
// El host detecta el uso de habilidad (hook useAbility) y envía un mensaje por
// la conexión de datos (PeerJS); el cliente lo recibe y dispara la misma
// cinemática. Así ambos jugadores ven TODAS las animaciones, igual que los
// patitos de goma / fénix (que viajan por flushFx o estado permanente).
export const MP_ABILITY_CINE_PATCH = `
<script>
(function(){
  if(window.__bfMpAbilCine)return;
  window.__bfMpAbilCine=true;

  function isHost(){ try{return typeof NET!=='undefined'&&NET.role==='host'&&NET.conn&&NET.conn.open;}catch(e){return false;} }
  function isClient(){ try{return typeof NET!=='undefined'&&NET.role==='client';}catch(e){return false;} }

  // Serializa solo los campos planos que las cinemáticas necesitan para buscar
  // el arte (animMap / battleArtMap) y decidir si reproducen. PeerJS no puede
  // serializar las referencias circulares del objeto héroe del juego.
  function serializeHero(h){
    if(!h)return null;
    return {
      id:h.id, cid:h.cid, card_id:h.card_id, _token:h._token,
      name:h.name, eliteMode:!!h.eliteMode,
      ability:h.ability, eAbility:h.eAbility,
      akind:h.akind,
      clanColor:h.clanColor||h.clan_color
    };
  }

  // HOST: hook useAbility para enviar al cliente cuando se usa una habilidad.
  // Se instala DESPUÉS de los demás parches (abilityAnimPatch, epicAbilityFxPatch,
  // abilityFxPatch) para que envuelva sus hooks y el mensaje se envíe antes de
  // que la cadena reproduzca la cinemática en el host.
  function hookHost(){
    if(typeof window.useAbility!=='function'||window.useAbility.__bfMpAbilCine)return;
    var orig=window.useAbility;
    window.useAbility=function(side,h){
      try{
        if(isHost()){
          var k=h&&h.akind;
          // Los tokens (patitos, etc.) los gestiona tokenAbilitiesPatch: se saltan.
          if(!(k&&String(k).indexOf('tk_')===0)){
            // Reset del flag de pifia antes de llamar al original. El original
            // (envuelto por fumbleRollPatch) hace la tirada de pifia y pone
            // __bfFumbleThisAct=true si pifica. Si pifica, NO enviamos la
            // cinemática al invitado (no se ejecutó la habilidad → no hay
            // animación que sincronizar). Si no pifica, enviamos después.
            window.__bfFumbleThisAct=false;
            var res=orig.apply(this,arguments);
            if(!window.__bfFumbleThisAct){
              NET.conn.send({t:'bfAbilCine',side:side,hero:serializeHero(h)});
            }
            return res;
          }
        }
      }catch(e){}
      return orig.apply(this,arguments);
    };
    window.useAbility.__bfMpAbilCine=1;
  }

  // CLIENTE: escucha los mensajes bfAbilCine en la conexión de datos y
  // dispara las cinemáticas con los play functions expuestos por los parches.
  // Cada uno comprueba internamente si le toca reproducir (animMap, HERO_IDS…)
  // y tiene su propio anti-duplicado, así que llamar a los tres es seguro.
  var lastConn=null;
  function bindClient(){
    if(!isClient()||!NET.conn||NET.conn===lastConn)return;
    lastConn=NET.conn;
    try{
      NET.conn.on('data',function(m){
        if(!m||m.t!=='bfAbilCine')return;
        var side=m.side,hero=m.hero;
        if(!hero)return;
        // Cinemática 3D genérica (abilityAnimPatch): reproduce si el héroe
        // tiene ability_anim_url asignado en la BD.
        if(typeof window.__bfPlayAbilityAnim==='function'){
          try{window.__bfPlayAbilityAnim(side,hero);}catch(e){}
        }
        // Cinemática temática de héroes épicos (epicAbilityFxPatch).
        if(typeof window.__bfPlayEpicCine==='function'){
          try{window.__bfPlayEpicCine(side,hero);}catch(e){}
        }
        // FX genéricos de habilidad (abilityFxPatch): banners, tajos, etc.
        if(typeof window.__bfPlayAbilityFx==='function'){
          try{window.__bfPlayAbilityFx(side,hero);}catch(e){}
        }
      });
    }catch(e){}
  }

  hookHost();
  setInterval(function(){ hookHost(); bindClient(); },300);
})();
</script>
`;