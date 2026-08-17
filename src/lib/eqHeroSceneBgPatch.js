// Parche inyectado en el iframe: en la FASE DE EQUIPAMIENTO, el recuadro de
// cada héroe (.eq-hero) muestra PRIMERO el retrato del héroe (art_url de la
// carta, el mismo que en la batalla) sangrando por el lateral izquierdo, y
// LUEGO la escena de batalla (battle_art_url) como fondo del recuadro, con un
// velo oscuro para que el texto siga legible. Reproduce el mismo encuadre que
// el retrato de batalla (.bf-battle-art): anclado arriba, sin recorte de
// cabeza, fundido en gradiente hacia el panel de stats.

export const EQ_HERO_SCENE_BG_PATCH = `
<script>
(function(){
  if(window.__bfEqHeroSceneBg) return;
  window.__bfEqHeroSceneBg = true;

  // Mapa card_id -> {base, elite} de ESCENAS DE BATALLA (battle_art_url).
  var artMap = window.__bfBattleArtMap || {};
  // Mapa card_id -> {base, elite} de RETRATOS de carta (art_url).
  var portraitMap = window.__bfCardArtMap || {};

  window.addEventListener('message', function(e){
    if(e.data && e.data.bfBattleArt && typeof e.data.bfBattleArt === 'object'){
      artMap = e.data.bfBattleArt;
      apply();
    }
    if(e.data && e.data.bfCardArt && typeof e.data.bfCardArt === 'object'){
      portraitMap = e.data.bfCardArt;
      apply();
    }
  });

  var st = document.createElement('style');
  st.textContent =
    '#s-equip .eq-hero.bf-eq-scene{background-size:cover!important;background-position:center 22%!important;background-repeat:no-repeat!important;border-color:rgba(255,210,74,.4)!important;box-shadow:inset 0 0 40px rgba(0,0,0,.55),0 4px 16px rgba(0,0,0,.5)!important;position:relative;isolation:isolate}' +
    // Velo oscuro de la escena de batalla (z-index:1).
    '#s-equip .eq-hero.bf-eq-scene::before{content:"";position:absolute;inset:0;border-radius:inherit;z-index:1;background:linear-gradient(180deg,rgba(8,5,14,.12) 0%,rgba(8,5,14,.42) 45%,rgba(8,5,14,.72) 100%)}' +
    // Retrato del héroe (art_url): sangra por la izquierda, anclado arriba,
    // mismo encuadre que .bf-battle-art en batalla. z-index:2 (sobre el velo,
    // bajo el texto/slots que van a z-index:3).
    '#s-equip .eq-hero.bf-eq-scene .bf-eq-portrait{position:absolute!important;left:-14px!important;top:-14px!important;bottom:-14px!important;width:150px!important;height:auto!important;aspect-ratio:auto!important;background-size:cover!important;background-position:center 8%!important;background-repeat:no-repeat!important;background-color:#0a0710!important;border:0!important;border-radius:0!important;overflow:hidden!important;box-shadow:none!important;filter:saturate(1.14) contrast(1.1)!important;z-index:2!important;pointer-events:none}' +
    '#s-equip .eq-hero.bf-eq-scene .bf-eq-portrait::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,0) 0%,rgba(0,0,0,.04) 48%,rgba(14,9,26,.95) 100%)!important;pointer-events:none}' +
    // Contenido (nombre, stats, slots) por encima del retrato y del velo.
    '#s-equip .eq-hero.bf-eq-scene>*:not(.bf-eq-portrait){position:relative;z-index:3}' +
    '#s-equip .eq-hero.bf-eq-scene .eq-hero-name,#s-equip .eq-hero.bf-eq-scene .eq-extra,#s-equip .eq-hero.bf-eq-scene .eq-slot{text-shadow:0 2px 6px #000,0 0 10px rgba(0,0,0,.9)}' +
    '#s-equip .eq-hero.bf-eq-scene .eq-slot{background:rgba(12,8,20,.72)!important}';
  document.head.appendChild(st);

  function heroById(id){
    try{
      if(typeof G === 'undefined' || !G || !G.team) return null;
      var sides = ['p','o'];
      for(var s=0;s<sides.length;s++){
        var arr = G.team[sides[s]] || [];
        for(var i=0;i<arr.length;i++){ if(arr[i] && arr[i].id === id) return arr[i]; }
      }
    }catch(e){}
    return null;
  }

  function apply(){
    var scr = document.getElementById('s-equip');
    if(!scr || !scr.classList.contains('active')) return;
    scr.querySelectorAll('.eq-hero[id^="eqh_"]').forEach(function(card){
      var id = card.id.slice(4);
      var scene = artMap[id];
      var portrait = portraitMap[id];
      var h = heroById(id);
      var elite = !!(h && h.eliteMode);

      // Fondo: escena de batalla.
      if(scene){
        var url = elite ? (scene.elite || scene.base) : scene.base;
        if(url && card.dataset.bfScene !== url){
          card.dataset.bfScene = url;
          card.classList.add('bf-eq-scene');
          card.style.setProperty('background-image', 'url("' + url + '")', 'important');
        }
      }

      // Retrato: art_url de la carta (como en batalla).
      if(portrait){
        var pUrl = elite ? (portrait.elite || portrait.base) : portrait.base;
        if(pUrl){
          card.classList.add('bf-eq-scene');
          var p = card.querySelector('.bf-eq-portrait');
          if(!p){
            p = document.createElement('div');
            p.className = 'bf-eq-portrait';
            card.insertBefore(p, card.firstChild);
          }
          if(p.dataset.bfPortrait !== pUrl){
            p.dataset.bfPortrait = pUrl;
            p.style.setProperty('background-image', 'url("' + pUrl + '")', 'important');
          }
        }
      }
    });
  }

  setInterval(apply, 500);
  apply();
})();
</script>
`;