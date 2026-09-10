// Preserva los elementos .bf-battle-art entre repintados de renderBattle.
//
// CAUSA del movimiento de retratos: renderBattle reconstruye TODO el HTML de
// la batalla (innerHTML) en cada cambio de estado (daño, turno, equipo…). Al
// reemplazarse el HTML, los div .bf-battle-art se destruyen y se crean de nuevo.
// Aunque el CSS fija su posición y tamaño, el navegador tiene un instante en
// el que el elemento nuevo existe pero su background-image aún no se ha pintado
// → el retrato "parpadea" o se reposiciona en cada repintado.
//
// SOLUCIÓN: antes de renderBattle, guardamos los elementos .bf-battle-art
// (se desprenden del DOM para que sobrevivan al innerHTML). Después de
// renderBattle, si el héroe es el mismo (mismo background-image), se
// reemplaza el .bf-battle-art nuevo por el guardado (que ya tiene la imagen
// pintada en la GPU). Solo se usa el nuevo si el héroe cambió de modo
// (normal→élite) o es la primera renderización.
export const PORTRAIT_PRESERVE_PATCH = `
<script>
(function(){
  if(window.__bfPortraitPreserve) return;
  window.__bfPortraitPreserve = true;

  function install(){
    if(typeof window.renderBattle!=='function' || window.renderBattle.__bfPP) return false;
    var original = window.renderBattle;
    window.renderBattle = function(){
      // 1) Guardar los .bf-battle-art actuales + su padre, keyed por posición.
      var saved = {};
      try{
        document.querySelectorAll('.bhero').forEach(function(hero){
          var art = hero.querySelector('.bf-battle-art');
          if(art && hero.id){
            var parts = hero.id.replace(/^b_/,'').split('_');
            if(parts.length >= 2){
              saved[parts[0]+'_'+parts[1]] = {
                el: art,
                parent: hero,
                bg: art.style.backgroundImage || art.dataset.bg || ''
              };
              // Desprender para que sobreviva al innerHTML del contenedor.
              if(art.parentNode) art.parentNode.removeChild(art);
            }
          }
        });
      }catch(e){}

      // 2) Repintado real del juego (puede saltarlo renderBattleDedupePatch).
      var result = original.apply(this, arguments);

      // 3) Reincorporar los .bf-battle-art guardados.
      try{
        Object.keys(saved).forEach(function(key){
          var entry = saved[key];
          if(!entry || !entry.el) return;
          // Si el padre original sigue en el DOM → el dedupe saltó el repintado:
          // el elemento desprendido debe volver a su sitio.
          if(entry.parent && entry.parent.parentNode){
            var existing = entry.parent.querySelector('.bf-battle-art');
            if(!existing){
              try{ entry.parent.appendChild(entry.el); }catch(e2){}
            } else if(existing !== entry.el){
              try{ entry.parent.replaceChild(entry.el, existing); }catch(e2){}
            }
            return;
          }
          // Si el padre original ya no está → el repintado reconstruyó el DOM:
          // buscar el héroe nuevo por id y reemplazar su .bf-battle-art.
          var parts = key.split('_');
          var newHero = document.getElementById('b_' + parts[0] + '_' + parts[1]);
          if(!newHero) return;
          var newArt = newHero.querySelector('.bf-battle-art');
          if(!newArt || newArt === entry.el) return;
          // Solo se reutiliza si el background-image es el mismo (mismo héroe,
          // mismo modo). Si cambió (transformación élite), se usa el nuevo.
          var newBg = newArt.style.backgroundImage || '';
          if(entry.bg && newBg && entry.bg === newBg){
            try{ newHero.replaceChild(entry.el, newArt); }catch(e2){}
          }
        });
      }catch(e){}

      return result;
    };
    window.renderBattle.__bfPP = 1;
    return true;
  }

  var tries = 0, iv = setInterval(function(){ if(install() || tries++ > 200) clearInterval(iv); }, 150);
  install();
})();
</script>
`;