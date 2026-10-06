// Arreglo del "héroe sin foto" en batalla (Batu pierde su imagen y luego vuelve).
//
// Al re-renderizar el tablero, el juego reconstruye las tarjetas de héroe y con
// ellas se pierde la capa de arte inyectada; además, cuando un héroe pasa a
// ÉLITE se cambia la imagen y, si esa imagen tarda o falla en cargar, la
// tarjeta se queda NEGRA hasta el siguiente ciclo.
//
// Este parche recuerda la última imagen buena de cada tarjeta y la restaura al
// instante si la tarjeta se queda sin imagen, y precarga la nueva imagen antes
// de aplicarla (si falla, se mantiene la anterior).
export const BATTLE_ART_FIX_PATCH = `
<script>
(function(){
  if(window.__bfBattleArtFix) return;
  window.__bfBattleArtFix = true;

  function urlOf(el){
    var b = el && el.style && el.style.backgroundImage;
    if(!b || b === 'none') return '';
    var m = b.match(/url\\(["']?([^"')]+)["']?\\)/);
    return m ? m[1] : '';
  }

  var checking = {};
  var lastGood = {};

  function guard(){
    document.querySelectorAll('.bhero[id^="b_"]').forEach(function(card){
      var art = card.querySelector('.bf-battle-art');
      if(!art){
        // Capa perdida en el render: se recrea al momento con la última imagen
        // buena, sin esperar al ciclo del observador.
        var prev = lastGood[card.id];
        if(!prev) return;
        var a = document.createElement('div');
        a.className = 'bf-battle-art';
        a.style.backgroundImage = 'url("' + prev.url + '")';
        a.style.backgroundSize = 'cover';
        a.style.backgroundPosition = prev.pos || 'center 18%';
        card.insertBefore(a, card.firstChild);
        return;
      }
      var u = urlOf(art);
      if(u){
        // Solo se guarda como "buena" cuando la imagen carga de verdad.
        // (Una sola comprobación por imagen a la vez: si no cargaba, se repetía en cada vuelta creando imágenes sin fin.)
        if((!lastGood[card.id] || lastGood[card.id].url !== u) && checking[card.id] !== u){
          checking[card.id] = u;
          var img = new Image();
          img.onload = function(){ lastGood[card.id] = { url: u, pos: art.style.backgroundPosition }; };
          setTimeout(function(){ if(checking[card.id] === u) checking[card.id] = null; }, 15000);   // reintento como mucho cada 15 s
          img.onerror = function(){
            var prev = lastGood[card.id];
            if(prev){ art.style.backgroundImage = 'url("' + prev.url + '")'; art.style.backgroundPosition = prev.pos || 'center 18%'; }
          };
          img.src = u;
        }
      } else {
        var p = lastGood[card.id];
        if(p){ art.style.backgroundImage = 'url("' + p.url + '")'; art.style.backgroundSize = 'cover'; art.style.backgroundPosition = p.pos || 'center 18%'; }
      }
    });
  }

  var tries = 0, iv = setInterval(function(){
    if(typeof window.renderBattle === 'function' && !window.renderBattle.__bfArtFix){
      var orig = window.renderBattle;
      var w = function(){ var r = orig.apply(this, arguments); try{ guard(); }catch(e){} return r; };
      w.__bfArtFix = true;
      window.renderBattle = w;
      clearInterval(iv);
    }
    if(++tries > 300) clearInterval(iv);
  }, 150);

  setInterval(function(){ try{ if(document.getElementById('s-battle') && document.getElementById('s-battle').classList.contains('active')) guard(); }catch(e){} }, 500);
})();
</script>
`;