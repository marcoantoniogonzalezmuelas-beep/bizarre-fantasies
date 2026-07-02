// Parche inyectado en el iframe: overridea el arte de héroes regenerados como
// full-art (sin borde). Cubre: retratos de batalla (por id), miniaturas de orden
// de turno (por nombre), cartas de héroe cardFace (por nombre, subasta/zoom/
// oráculo) y retrato de equipamiento. Los héroes sin borde se dejan como están.
export const HERO_ART_OVERRIDE_PATCH = `
<script>
(function(){
  if (window.__bfArtOverridePatch) return;
  window.__bfArtOverridePatch = true;

  var IMG = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/';
  var OVERRIDE = {
    kru: { n: IMG+'276a7b158_generated_image.png', e: IMG+'927ffc827_generated_image.png' },
    nar: { n: IMG+'22d98cf6e_generated_image.png', e: IMG+'023da8a01_generated_image.png' },
    hil: { n: IMG+'28129e547_generated_image.png', e: IMG+'36f4b41dc_generated_image.png' },
    tor: { n: IMG+'06119cd60_generated_image.png', e: IMG+'e961e34a3_generated_image.png' },
    bra: { n: IMG+'46731be45_generated_image.png', e: IMG+'b4a355b4b_generated_image.png' },
    vra: { n: IMG+'166727ba9_generated_image.png', e: IMG+'c562e1830_generated_image.png' },
    hev: { n: IMG+'45ce0f135_generated_image.png', e: IMG+'0fb2d9ce0_generated_image.png' },
    syl: { n: IMG+'122d2a463_generated_image.png', e: IMG+'938064d16_generated_image.png' },
    zar: { n: IMG+'d2ea825f7_generated_image.png', e: IMG+'0f4e74e0d_generated_image.png' },
    ere: { n: IMG+'7d2b9c3f9_generated_image.png', e: IMG+'b4133a944_generated_image.png' },
    syx: { n: IMG+'ff652a33d_generated_image.png', e: IMG+'0e34ca88f_generated_image.png' },
    ret: { n: IMG+'df9a108a5_generated_image.png', e: IMG+'a9d3fea95_generated_image.png' },
    ser: { n: IMG+'59aed8957_generated_image.png', e: IMG+'8f5612437_generated_image.png' },
    vex: { n: IMG+'6a68b95c8_generated_image.png', e: IMG+'222653944_generated_image.png' },
    chi: { n: IMG+'786d9a5d9_generated_image.png', e: IMG+'f26659e0d_generated_image.png' },
    man: { n: IMG+'43b4d55e6_generated_image.png', e: IMG+'d0e15feb4_generated_image.png' },
    pac: { n: IMG+'d9a306f6c_generated_image.png', e: IMG+'17c4ad974_generated_image.png' },
    doc: { n: IMG+'f8573b278_generated_image.png', e: IMG+'393cbc51d_generated_image.png' },
    aje: { n: IMG+'0b8c4d069_generated_image.png', e: IMG+'5bbd13d6c_generated_image.png' },
    rol: { n: IMG+'1de790e63_generated_image.png', e: IMG+'e7779bf69_generated_image.png' },
    mor: { n: IMG+'44d09cf98_generated_image.png', e: IMG+'8da13d36f_generated_image.png' },
    ska: { n: IMG+'85fcc4f77_generated_image.png', e: IMG+'7ada7e4d4_generated_image.png' },
    kre: { n: IMG+'d31d5f27b_generated_image.png', e: IMG+'8597b20d0_generated_image.png' }
  };
  var NAME_TO_ID = {
    'Krunder':'kru','Narbon':'nar','Hildra':'hil','Torax':'tor','Bramblok':'bra',
    'Vragnar':'vra','El Heavy':'hev','Sylvara':'syl','Zarmanda':'zar','Eredon':'ere',
    'Sylvex':'syx','Retropoeta':'ret','Serafis':'ser','Vexal':'vex','Chivo':'chi',
    'Mantenimiento':'man','Pacopiton':'pac','Doc Radiante':'doc','El Ajedrecista':'aje',
    'El Rolero':'rol','Morthex':'mor','Skarla':'ska','Krunder Mec.':'kre'
  };

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