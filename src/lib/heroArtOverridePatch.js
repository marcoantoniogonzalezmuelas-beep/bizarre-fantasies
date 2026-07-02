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
    kru: { n: IMG+'276a7b158_generated_image.png', e: IMG+'fd49123bf_generated_image.png' },
    nar: { n: IMG+'22d98cf6e_generated_image.png', e: IMG+'70894c9d6_generated_image.png' },
    hil: { n: IMG+'28129e547_generated_image.png', e: IMG+'19b2b5de7_generated_image.png' },
    tor: { n: IMG+'06119cd60_generated_image.png', e: IMG+'1af37e5ac_generated_image.png' },
    bra: { n: IMG+'46731be45_generated_image.png', e: IMG+'fce0055d4_generated_image.png' },
    vra: { n: IMG+'166727ba9_generated_image.png', e: IMG+'6681b9e24_generated_image.png' },
    hev: { n: IMG+'45ce0f135_generated_image.png', e: IMG+'c1842b70d_generated_image.png' },
    syl: { n: IMG+'122d2a463_generated_image.png', e: IMG+'b1bb43386_generated_image.png' },
    zar: { n: IMG+'d2ea825f7_generated_image.png', e: IMG+'7f2be747c_generated_image.png' },
    ere: { n: IMG+'7d2b9c3f9_generated_image.png', e: IMG+'b2c88a4f3_generated_image.png' },
    syx: { n: IMG+'ff652a33d_generated_image.png', e: IMG+'0e1364909_generated_image.png' },
    ret: { n: IMG+'df9a108a5_generated_image.png', e: IMG+'c51b8635f_generated_image.png' },
    ser: { n: IMG+'59aed8957_generated_image.png', e: IMG+'78acde616_generated_image.png' },
    vex: { n: IMG+'6a68b95c8_generated_image.png', e: IMG+'599fa3ffd_generated_image.png' },
    chi: { n: IMG+'786d9a5d9_generated_image.png', e: IMG+'29639ea8c_generated_image.png' },
    man: { n: IMG+'43b4d55e6_generated_image.png', e: IMG+'40da003e0_generated_image.png' },
    pac: { n: IMG+'d9a306f6c_generated_image.png', e: IMG+'fb7cf139d_generated_image.png' },
    doc: { n: IMG+'915466286_generated_image.png', e: IMG+'393cbc51d_generated_image.png' },
    aje: { n: IMG+'0b8c4d069_generated_image.png', e: IMG+'f4a4881f0_generated_image.png' },
    rol: { n: IMG+'1de790e63_generated_image.png', e: IMG+'dbdafe025_generated_image.png' },
    mor: { n: IMG+'44d09cf98_generated_image.png', e: IMG+'9e9a24959_generated_image.png' },
    ska: { n: IMG+'85fcc4f77_generated_image.png', e: IMG+'8e8986b7d_generated_image.png' },
    kre: { n: IMG+'d31d5f27b_generated_image.png', e: IMG+'e28b4d8ea_generated_image.png' }
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