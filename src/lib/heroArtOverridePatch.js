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
    kru: { n: IMG+'f17d5c977_generated_image.png', e: IMG+'8878e6eb5_generated_image.png' },
    nar: { n: IMG+'62f9663a5_generated_image.png', e: IMG+'b74370e3d_generated_image.png' },
    hil: { n: IMG+'c9217f524_generated_image.png', e: IMG+'b77f308a0_generated_image.png' },
    tor: { n: IMG+'158df5c10_generated_image.png', e: IMG+'c87690d66_generated_image.png' },
    bra: { n: IMG+'6e11de221_generated_image.png', e: IMG+'419a811e4_generated_image.png' },
    vra: { n: IMG+'5bfd28d84_generated_image.png', e: IMG+'a1d4b3660_generated_image.png' },
    hev: { n: IMG+'8bc2d231f_generated_image.png', e: IMG+'9ca8e83c0_generated_image.png' },
    syl: { n: IMG+'a9dacd8cf_generated_image.png', e: IMG+'417c65076_generated_image.png' },
    zar: { n: IMG+'dfbe2f583_generated_image.png', e: IMG+'3ede902a9_generated_image.png' },
    ere: { n: IMG+'6d1c2951b_generated_image.png', e: IMG+'1c0ebda6f_generated_image.png' },
    syx: { n: IMG+'c3dfcb71a_generated_image.png', e: IMG+'22bd00012_generated_image.png' },
    ret: { n: IMG+'aee628d73_generated_image.png', e: IMG+'339834d4b_generated_image.png' },
    ser: { n: IMG+'5f3b7a6b8_generated_image.png', e: IMG+'0336ca4bf_generated_image.png' },
    vex: { n: IMG+'35c834f77_generated_image.png', e: IMG+'a2a02a360_generated_image.png' },
    chi: { n: IMG+'f50fc78cb_generated_image.png', e: IMG+'4ff1a2cdf_generated_image.png' },
    man: { n: IMG+'a59ac569e_generated_image.png', e: IMG+'79bb0c673_generated_image.png' },
    pac: { n: IMG+'59595c6ab_generated_image.png', e: IMG+'409e38fed_generated_image.png' },
    doc: { n: IMG+'fe3e30b86_generated_image.png', e: IMG+'1fb7dfede_generated_image.png' },
    aje: { n: IMG+'b77079650_generated_image.png', e: IMG+'51bf1d866_generated_image.png' },
    rol: { n: IMG+'299659633_generated_image.png', e: IMG+'1359d8cef_generated_image.png' },
    mor: { n: IMG+'09d57c426_generated_image.png', e: IMG+'a985d1609_generated_image.png' },
    ska: { n: IMG+'d9b05ff2b_generated_image.png', e: IMG+'6050a95bd_generated_image.png' },
    kre: { n: IMG+'23f47aa38_generated_image.png', e: IMG+'e8b808828_generated_image.png' }
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