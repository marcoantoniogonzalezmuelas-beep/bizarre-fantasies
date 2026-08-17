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

  // Mapas de arte. Se leen SIEMPRE de los globales que mantienen
  // endGameFixPatch (__bfBattleArtMap, escenas) y cardArtMapPatch
  // (__bfCardArtMap, retratos). Antes este parche solo escuchaba el
  // postMessage del padre y, como los mapas ya se habían enviado antes de que
  // arrancara, se quedaba con los mapas vacíos y nunca pintaba el fondo.
  // Este parche guarda sus PROPIAS copias de los mapas al recibirlos del padre
  // (el padre los reenvía en cada cambio de pantalla) y además cae a los
  // globales que mantienen endGameFixPatch / cardArtMapPatch. Antes solo
  // escuchaba el mensaje y si llegaba antes de arrancar se quedaba sin mapas.
  var ownScene = null, ownPortrait = null;
  function maps(){
    return {
      scene: ownScene || window.__bfBattleArtMap || {},
      portrait: ownPortrait || window.__bfCardArtMap || {},
    };
  }

  window.addEventListener('message', function(e){
    if(!e.data) return;
    if(e.data.bfBattleArt && typeof e.data.bfBattleArt === 'object') ownScene = e.data.bfBattleArt;
    if(e.data.bfCardArt && typeof e.data.bfCardArt === 'object') ownPortrait = e.data.bfCardArt;
    if(e.data.bfBattleArt || e.data.bfCardArt){ preload(); apply(); }
  });

  // Precarga de escenas y retratos: las imágenes se descargan en cuanto llegan
  // los mapas, así que al entrar en batalla ya están en caché y el recuadro se
  // pinta de golpe con su escena (antes iban apareciendo una a una).
  var PRE = {};
  function preload(){
    var M = maps();
    [M.scene, M.portrait].forEach(function(m){
      Object.keys(m || {}).forEach(function(k){
        var e = m[k]; if(!e) return;
        [e.base, e.elite].forEach(function(u){
          if(u && !PRE[u]){ PRE[u] = 1; var im = new Image(); im.src = u; }
        });
      });
    });
  }
  preload();

  var st = document.createElement('style');
  st.textContent =
    // Escena de batalla como fondo del recuadro del héroe (mismo encuadre que
    // la fase de equipamiento: cover + center 22%).
    '#s-battle .bhero.bf-bscene{background-size:cover!important;background-position:center 22%!important;background-repeat:no-repeat!important;isolation:isolate}' +
    // SIN velo: la escena se ve con sus colores originales, a plena luz. La
    // legibilidad del texto se consigue solo con text-shadow (más abajo).
    '#s-battle .bhero.bf-bscene::before{display:none!important}' +
    // Ocultar la tira original del juego (.bf-battle-art): ahora la escena es
    // el fondo de todo el recuadro, no una franja lateral.
    '#s-battle .bhero.bf-bscene .bf-battle-art{display:none!important}' +
    // ESTE era el "velo": battleAnimePatch pinta .bf-bhero-bgart encima con la
    // escena difuminada (blur 3px), oscurecida (brightness .82) y con un
    // degradado lateral muy opaco. Tapaba por completo el fondo nítido de este
    // parche, así que la batalla se veía igual que antes. Se le quita la
    // imagen, el desenfoque y el degradado, pero se MANTIENE el elemento porque
    // su ::before es el que pinta los tintes de estado (maldito, congelado,
    // agonizando…). Se estira a toda la caja para que esos tintes cubran igual.
    '#s-battle .bhero.bf-bscene .bf-bhero-bgart{left:0!important;background-image:none!important;filter:none!important;opacity:1!important}' +
    '#s-battle .bhero.bf-bscene .bf-bhero-bgart::after{display:none!important}' +
    // Retrato del héroe (art_url): sangra por la izquierda, anclado arriba,
    // mismo encuadre que .bf-eq-portrait en la fase de equipamiento. z-index:2.
    '#s-battle .bhero.bf-bscene .bf-bscene-portrait{position:absolute!important;left:-14px!important;top:-14px!important;bottom:-14px!important;width:150px!important;height:auto!important;aspect-ratio:auto!important;background-size:cover!important;background-position:center 8%!important;background-repeat:no-repeat!important;background-color:#0a0710!important;border:0!important;border-radius:0!important;overflow:hidden!important;box-shadow:none!important;filter:saturate(1.14) contrast(1.1)!important;z-index:2!important;pointer-events:none}' +
    '#s-battle .bhero.bf-bscene .bf-bscene-portrait::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,0) 0%,rgba(0,0,0,.04) 48%,rgba(14,9,26,.95) 100%)!important;pointer-events:none}' +
    // Contenido (nombre, stats, slots, aura…) por encima del retrato y del
    // velo. Se excluyen el retrato, la tira original (oculta) y la lupa de
    // zoom (conserva su position:absolute y z-index:12 de battlePortraitPatch).
    '#s-battle .bhero.bf-bscene>*:not(.bf-bscene-portrait):not(.bf-battle-art):not(.bf-battle-zoom){position:relative;z-index:3}' +
    // Héroe caído: escena y retrato en escala de grises (sigue legible).
    '#s-battle .bhero.bf-bscene.bf-truedead{filter:grayscale(1) brightness(.72)!important}' +
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
    if(!scr) return;
    var M = maps();
    var artMap = M.scene, portraitMap = M.portrait;
    scr.querySelectorAll('.bhero[id^="b_"]').forEach(function(card){
      // id formato: b_p_<card_id> o b_o_<card_id> → slice(4) quita el prefijo.
      var id = (card.id || '').slice(4);
      if(!id) return;
      var scene = artMap[id];
      var portrait = portraitMap[id];
      var h = heroById(id);
      var elite = !!(h && h.eliteMode);

      // HÉROE TRANSFORMADO (hechizo Transformer): el héroe conserva su id pero
      // ahora es un bizarro/token, así que la escena y el retrato de la BD (que
      // van por card_id) serían los del héroe ORIGINAL. Se devuelve el recuadro
      // al arte propio del juego, que ya apunta al token transformado.
      if(h && h._token){
        if(card.classList.contains('bf-bscene')){
          card.classList.remove('bf-bscene');
          card.style.removeProperty('background-image');
          delete card.dataset.bfBscene;
          var op = card.querySelector('.bf-bscene-portrait');
          if(op) op.remove();
        }
        return;
      }

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

  // Al empezar la partida los recuadros se pintaban primero "en crudo" y la
  // escena/retrato entraban hasta medio segundo después (sondeo de 500 ms), y
  // eso es lo que hacía que todo diera un salto. Enganchándose a renderBattle
  // se aplican en el MISMO frame en que el juego dibuja los héroes, así que
  // aparecen ya con su escena. El sondeo se mantiene solo como respaldo.
  function hookRender(){
    if(typeof window.renderBattle !== 'function' || window.renderBattle.__bfBscene) return false;
    var orig = window.renderBattle;
    window.renderBattle = function(){
      var r = orig.apply(this, arguments);
      try{ apply(); }catch(e){}
      return r;
    };
    window.renderBattle.__bfBscene = 1;
    return true;
  }
  var tries = 0, hk = setInterval(function(){ if(hookRender() || tries++ > 150) clearInterval(hk); }, 120);
  hookRender();

  setInterval(apply, 500);
  apply();
})();
</script>
`;