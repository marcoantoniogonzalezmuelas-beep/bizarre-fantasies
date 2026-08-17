// Parche inyectado en el iframe: en la BATALLA, el recuadro de cada héroe
// (.bhero) muestra la ESCENA DE BATALLA (battle_art_url) como fondo a toda
// caja (cover) y el RETRATO del héroe (art_url) sangrando por la izquierda,
// igual que en la fase de equipamiento (eqHeroSceneBgPatch). Así la batalla
// se ve tan "chula" como el equipamiento: escena épica llenando el recuadro
// + retrato del personaje a la izquierda, con un velo oscuro para que el
// texto sea legible.
//
// Cuando un héroe tiene battle_art_url, se oculta la tira original del juego
// (.bf-battle-art) y se reemplaza por la escena a pantalla completa + retrato.
// Los héroes sin battle_art_url conservan el aspecto original (tira + panel).

export const BATTLE_SCENE_BG_PATCH = `
<script>
(function(){
  if(window.__bfBattleSceneBg) return;
  window.__bfBattleSceneBg = true;

  // Mapa card_id -> {base, elite} de ESCENAS DE BATALLA (battle_art_url).
  var artMap = {};
  // Mapa card_id -> {base, elite} de RETRATOS de carta (art_url).
  var portraitMap = {};

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
    // Escena de batalla como fondo del recuadro del héroe (mismo encuadre que
    // la fase de equipamiento: cover + center 22%).
    '#s-battle .bhero.bf-bscene{background-size:cover!important;background-position:center 22%!important;background-repeat:no-repeat!important;isolation:isolate}' +
    // Velo oscuro vertical (z-index:1) — idéntico al de la fase de equipamiento.
    '#s-battle .bhero.bf-bscene::before{content:"";position:absolute;inset:0;border-radius:inherit;z-index:1;background:linear-gradient(180deg,rgba(8,5,14,.12) 0%,rgba(8,5,14,.42) 45%,rgba(8,5,14,.72) 100%);pointer-events:none}' +
    // Ocultar la tira original del juego (.bf-battle-art): ahora la escena es
    // el fondo de todo el recuadro, no una franja lateral.
    '#s-battle .bhero.bf-bscene .bf-battle-art{display:none!important}' +
    // Retrato del héroe (art_url): sangra por la izquierda, anclado arriba,
    // mismo encuadre que .bf-eq-portrait en la fase de equipamiento. z-index:2.
    '#s-battle .bhero.bf-bscene .bf-bscene-portrait{position:absolute!important;left:-14px!important;top:-14px!important;bottom:-14px!important;width:150px!important;height:auto!important;aspect-ratio:auto!important;background-size:cover!important;background-position:center 8%!important;background-repeat:no-repeat!important;background-color:#0a0710!important;border:0!important;border-radius:0!important;overflow:hidden!important;box-shadow:none!important;filter:saturate(1.14) contrast(1.1)!important;z-index:2!important;pointer-events:none}' +
    '#s-battle .bhero.bf-bscene .bf-bscene-portrait::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,0) 0%,rgba(0,0,0,.04) 48%,rgba(14,9,26,.95) 100%)!important;pointer-events:none}' +
    // Contenido (nombre, stats, slots, aura…) por encima del retrato y del
    // velo. Se excluyen el retrato, la tira original (oculta) y la lupa de
    // zoom (conserva su position:absolute y z-index:12 de battlePortraitPatch).
    '#s-battle .bhero.bf-bscene>*:not(.bf-bscene-portrait):not(.bf-battle-art):not(.bf-battle-zoom){position:relative;z-index:3}' +
    // Sombra de texto para legibilidad sobre la escena.
    '#s-battle .bhero.bf-bscene .bhero-name,#s-battle .bhero.bf-bscene .bhero-stats,#s-battle .bhero.bf-bscene .bf-status-aura{text-shadow:0 2px 6px #000,0 0 10px rgba(0,0,0,.9)}';
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
    var scr = document.getElementById('s-battle');
    if(!scr || !scr.classList.contains('active')) return;
    scr.querySelectorAll('.bhero[id^="b_"]').forEach(function(card){
      // id formato: b_p_<card_id> o b_o_<card_id> → slice(4) quita el prefijo.
      var id = (card.id || '').slice(4);
      if(!id) return;
      var scene = artMap[id];
      var portrait = portraitMap[id];
      var h = heroById(id);
      var elite = !!(h && h.eliteMode);

      // Fondo: escena de batalla (battle_art_url).
      if(scene){
        var url = elite ? (scene.elite || scene.base) : scene.base;
        if(url && card.dataset.bfBscene !== url){
          card.dataset.bfBscene = url;
          card.classList.add('bf-bscene');
          card.style.setProperty('background-image', 'url("' + url + '")', 'important');
        }
      }

      // Retrato: art_url de la carta (como en la fase de equipamiento).
      if(portrait){
        var pUrl = elite ? (portrait.elite || portrait.base) : portrait.base;
        if(pUrl){
          card.classList.add('bf-bscene');
          var p = card.querySelector('.bf-bscene-portrait');
          if(!p){
            p = document.createElement('div');
            p.className = 'bf-bscene-portrait';
            card.insertBefore(p, card.firstChild);
          }
          if(p.dataset.bfBscenePortrait !== pUrl){
            p.dataset.bfBscenePortrait = pUrl;
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