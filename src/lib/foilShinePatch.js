// Cartas FOIL en BATALLA: el mismo efecto holográfico que en el Oráculo y en la
// fase de equipamiento — capa de tinte multicolor girando (bfFoilShift) + el
// destello diagonal que recorre la carta (bfFoilShine).
//
// El juego no marcaba las cartas foil en batalla, así que aquí se recibe del
// padre la lista de card_id foil (postMessage bfFoilCards) y se inyecta la capa
// sobre el recuadro de cada héroe foil en cada repintado del tablero.
export const FOIL_SHINE_PATCH = `
<script>
(function(){
  if(window.__bfBattleFoil) return;
  window.__bfBattleFoil = true;

  var css = ''
    + '.bf-epic-foil{position:absolute;inset:0;z-index:9;pointer-events:none;border-radius:inherit;overflow:hidden}'
    + '.bf-epic-foil-tint{position:absolute;inset:0;border-radius:inherit;background:linear-gradient(125deg,#ffd24a,#ff7adf 18%,#7ad6ff 38%,#9dff8a 56%,#ffe27a 72%,#ff7adf 88%,#ffd24a);background-size:300% 300%;mix-blend-mode:soft-light;opacity:.4;animation:bfFoilShift 9s linear infinite}'
    + '.bf-epic-foil-shine{position:absolute;inset:0;border-radius:inherit;background:linear-gradient(110deg,transparent 42%,rgba(255,255,255,.35) 49%,rgba(255,255,255,.5) 50%,rgba(255,255,255,.35) 51%,transparent 58%);background-size:250% 250%;mix-blend-mode:screen;opacity:.6;animation:bfFoilShine 5.5s ease-in-out infinite}';
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  var FOIL = {};
  window.addEventListener('message', function(e){
    if(e.data && e.data.bfFoilCards){
      FOIL = {};
      (e.data.bfFoilCards || []).forEach(function(id){ FOIL[String(id)] = 1; });
      apply();
    }
  });

  function baseId(id){ return String(id || '').replace(/_\\d{6,}$/, ''); }

  function apply(){
    document.querySelectorAll('.bhero[id^="b_"]').forEach(function(card){
      var m = String(card.id || '').match(/^b_[po]_(.+)$/);
      var isFoil = m && FOIL[baseId(m[1])];
      var layer = card.querySelector('.bf-epic-foil');
      if(isFoil && !layer){
        layer = document.createElement('div');
        layer.className = 'bf-epic-foil';
        layer.innerHTML = '<div class="bf-epic-foil-tint"></div><div class="bf-epic-foil-shine"></div>';
        card.appendChild(layer);
      } else if(!isFoil && layer){
        layer.remove();
      } else if(isFoil && layer && card.lastChild !== layer){
        // El juego repinta el recuadro: la capa debe quedar siempre encima.
        card.appendChild(layer);
      }
    });
  }

  function hookRender(){
    if(typeof window.renderBattle !== 'function' || window.renderBattle.__bfFoil) return;
    var o = window.renderBattle;
    window.renderBattle = function(){ o.apply(this, arguments); try{ apply(); }catch(e){} };
    window.renderBattle.__bfFoil = 1;
  }
  var t = 0, iv = setInterval(function(){ hookRender(); apply(); if(t++ > 40) clearInterval(iv); }, 300);
  setInterval(apply, 2000);
})();
</script>
`;