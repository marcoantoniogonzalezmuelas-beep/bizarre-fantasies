// Parche inyectado en el iframe: overridea el arte de héroes regenerados como
// full-art (sin borde). Se va rellenando OVERRIDE a medida que se regeneran más.
// Cubre: retratos de batalla (por id), miniaturas de orden de turno (por nombre),
// cartas de héroe cardFace (por nombre, subasta/zoom/oráculo) y retrato de equip.
export const HERO_ART_OVERRIDE_PATCH = `
<script>
(function(){
  if (window.__bfArtOverridePatch) return;
  window.__bfArtOverridePatch = true;

  var IMG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/';
  var OVERRIDE = {
    mor: { n: IMG+'09d57c426_generated_image.png', e: IMG+'a985d1609_generated_image.png' },
    ska: { n: IMG+'d9b05ff2b_generated_image.png', e: IMG+'6050a95bd_generated_image.png' },
    kre: { n: IMG+'23f47aa38_generated_image.png', e: IMG+'e8b808828_generated_image.png' }
  };
  var NAME_TO_ID = { 'Morthex':'mor', 'Skarla':'ska', 'Krunder Mec.':'kre' };

  function nameToId(txt){ if(!txt) return null; var t = txt.replace(/★/g,'').trim(); return NAME_TO_ID[t] || null; }

  function applyOverride(){
    // 1) Retratos de batalla — por id en #b_{side}_{id}
    document.querySelectorAll('.bhero[id^="b_"]').forEach(function(card){
      var m = String(card.id||'').match(/^b_[po]_(.+)$/); if(!m) return;
      var ov = OVERRIDE[m[1]]; if(!ov) return;
      var elite = card.classList.contains('elite-mode') || card.classList.contains('bf-auto-elite');
      var url = elite ? ov.e : ov.n;
      var art = card.querySelector('.bf-battle-art');
      if (art && art.dataset.bfOv !== url) { art.style.backgroundImage = 'url("'+url+'")'; art.style.backgroundSize = 'cover'; art.dataset.bfOv = url; }
    });

    // 2) Miniaturas del orden de turno — por nombre
    document.querySelectorAll('.ctb-slot').forEach(function(slot){
      var n = slot.querySelector('.ctb-hero-name'); if(!n) return;
      var id = nameToId(n.textContent); if(!id) return;
      var ov = OVERRIDE[id]; if(!ov) return;
      var t = slot.querySelector('.bf-ctb-thumb'); if(t && t.dataset.bfOv !== ov.n){ t.style.backgroundImage='url("'+ov.n+'")'; t.dataset.bfOv = ov.n; }
    });

    // 3) Cartas de héroe (cardFace) — por nombre en .bf-hero-name
    document.querySelectorAll('.bf-hero-card').forEach(function(card){
      var n = card.querySelector('.bf-hero-name'); if(!n) return;
      var id = nameToId(n.textContent); if(!id) return;
      var ov = OVERRIDE[id]; if(!ov) return;
      var elite = card.classList.contains('cf-elite');
      var url = elite ? ov.e : ov.n;
      if (card.dataset.bfOv !== url) {
        card.style.setProperty('--bf-art', "url('"+url+"')");
        var bg = card.querySelector('.bf-hero-bg'); if(bg){ bg.style.backgroundImage = 'url("'+url+'")'; bg.style.backgroundSize='cover'; }
        // fallback cf-art
        var cf = card.querySelector('.cf-art.has-art'); if(cf){ cf.style.setProperty('--bf-art', "url('"+url+"')"); }
        card.dataset.bfOv = url;
      }
    });

    // 4) Retrato de equip — por nombre en el .eq-hero contenedor
    document.querySelectorAll('.bf-eq-hero-art').forEach(function(art){
      var host = art.closest('.eq-hero') || art.parentElement; if(!host) return;
      var id = nameToId(host.textContent); if(!id) return;
      var ov = OVERRIDE[id]; if(!ov) return;
      if (art.dataset.bfOv !== ov.n){ art.style.backgroundImage='url("'+ov.n+'")'; art.style.backgroundPosition='center 10%'; art.dataset.bfOv = ov.n; }
    });
  }

  setInterval(applyOverride, 500);
  applyOverride();
})();
</script>
`;