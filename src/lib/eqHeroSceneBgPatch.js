// Parche inyectado en el iframe: en la FASE DE EQUIPAMIENTO, el recuadro de
// cada héroe (.eq-hero, donde van los stats y las ranuras de arma/armadura)
// usa como fondo la ESCENA DE BATALLA del héroe (battle_art_url de la BD, o su
// versión élite), con un velo oscuro en degradado para que el texto siga siendo
// perfectamente legible. Si el héroe no tiene escena de batalla asignada, se
// deja el fondo original del juego.

export const EQ_HERO_SCENE_BG_PATCH = `
<script>
(function(){
  if(window.__bfEqHeroSceneBg) return;
  window.__bfEqHeroSceneBg = true;

  // Mapa card_id -> {base, elite} enviado por la página padre.
  var artMap = window.__bfBattleArtMap || {};
  window.addEventListener('message', function(e){
    if(e.data && e.data.bfBattleArt && typeof e.data.bfBattleArt === 'object'){
      artMap = e.data.bfBattleArt;
      apply();
    }
  });

  var st = document.createElement('style');
  st.textContent = '#s-equip .eq-hero.bf-eq-scene{background-size:cover!important;background-position:center 22%!important;background-repeat:no-repeat!important;border-color:rgba(255,210,74,.4)!important;box-shadow:inset 0 0 40px rgba(0,0,0,.55),0 4px 16px rgba(0,0,0,.5)!important}' +
    '#s-equip .eq-hero.bf-eq-scene>*{position:relative;z-index:2}' +
    '#s-equip .eq-hero.bf-eq-scene{position:relative;isolation:isolate}' +
    '#s-equip .eq-hero.bf-eq-scene::before{content:"";position:absolute;inset:0;border-radius:inherit;z-index:1;background:linear-gradient(180deg,rgba(8,5,14,.12) 0%,rgba(8,5,14,.42) 45%,rgba(8,5,14,.72) 100%)}' +
    '#s-equip .eq-hero.bf-eq-scene .eq-hero-name,#s-equip .eq-hero.bf-eq-scene .eq-extra,#s-equip .eq-hero.bf-eq-scene .eq-slot{text-shadow:0 2px 6px #000,0 0 10px rgba(0,0,0,.9)}' +
    '#s-equip .eq-hero.bf-eq-scene .eq-slot{background:rgba(12,8,20,.72)!important}' +
    // Sin retrato: el contenido aprovecha TODO el ancho del recuadro.
    '#s-equip .eq-hero.bf-eq-scene{padding:14px 16px!important}' +
    '#s-equip .eq-hero.bf-eq-scene .eq-hero-name{font-size:19px!important;width:100%}' +
    '#s-equip .eq-hero.bf-eq-scene .eq-extra{font-size:14px!important;width:100%}' +
    '#s-equip .eq-hero.bf-eq-scene .eq-slot{width:100%!important;box-sizing:border-box;font-size:14px!important;padding:11px 13px!important}';
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
      var entry = artMap[id];
      if(!entry) return;
      var h = heroById(id);
      var url = (h && h.eliteMode) ? (entry.elite || entry.base) : entry.base;
      if(!url) return;
      if(card.dataset.bfScene === url) return;
      card.dataset.bfScene = url;
      card.classList.add('bf-eq-scene');
      card.style.setProperty('background-image', 'url("' + url + '")', 'important');
    });
  }

  setInterval(apply, 500);
  apply();
})();
</script>
`;