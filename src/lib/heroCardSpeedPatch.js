// Sello de VELOCIDAD (⚡) en la carta ampliada del héroe: al pulsar la lupa del
// retrato (equipamiento y batalla) la carta se abre con el mismo marcador de
// velocidad que en el Oráculo. La velocidad base es el stat principal del héroe
// según su rol (CC/AD/HE); a partir de 21 el sello es dorado con "RÁPIDO".
export const HERO_CARD_SPEED_PATCH = `
<script>
(function(){
  if(window.__bfHeroCardSpeed)return;
  window.__bfHeroCardSpeed=true;

  var st=document.createElement('style');
  st.textContent=''+
    '.bf-vel-card{position:absolute;top:9px;left:50%;transform:translateX(-50%);z-index:12;display:inline-flex;align-items:center;gap:3px;padding:3px 9px;border-radius:999px;font-family:Rubik,sans-serif;font-size:13px;font-weight:900;line-height:1;letter-spacing:.3px;white-space:nowrap;background:rgba(8,5,16,.85);border:1.5px solid rgba(255,210,74,.55);color:#ffd24a}'+
    '.bf-vel-card.bf-vel-fast{background:radial-gradient(circle at 34% 28%,#fff0ae,#FFD24A 45%,#b77614);border:2px solid #6f4809;color:#4a2e03;box-shadow:0 0 16px rgba(255,210,74,.85),0 2px 8px rgba(0,0,0,.55);animation:bfVelPulse 1.8s ease-in-out infinite}'+
    '.bf-vel-card .bf-vel-lbl{font-size:8px;letter-spacing:1.2px;font-weight:1000}';
  document.head.appendChild(st);

  function num(t){var m=String(t||'').match(/-?\\d+(\\.\\d+)?/);return m?parseFloat(m[0]):null;}

  function decorate(){
    document.querySelectorAll('#bf-zoom-flip .cardface.bf-hero-card').forEach(function(card){
      if(card.querySelector('.bf-vel-card'))return;
      var medal=card.querySelector('.bf-type-medal span');
      var role=medal?String(medal.textContent||'').trim().toUpperCase():'';
      var key=role==='CC'?'cc':role==='AD'?'ad':role==='HE'?'he':'';
      if(!key)return;
      var statEl=card.querySelector('.bf-stat-'+key);
      var v=statEl?num(statEl.textContent):null;
      if(v==null)return;
      var fast=v>=21;
      var g=document.createElement('span');
      g.className='bf-vel-card'+(fast?' bf-vel-fast':'');
      g.innerHTML='<span class="bf-vel-ico">⚡</span>'+v+(fast?'<span class="bf-vel-lbl">RÁPIDO</span>':'');
      card.appendChild(g);
    });
  }

  setInterval(decorate,300);
  decorate();
})();
</script>
`;