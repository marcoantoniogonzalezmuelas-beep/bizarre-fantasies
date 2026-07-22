// Parche inyectado en el iframe: al jugar una carta concreta desde la mano
// (botón ✦ de un hechizo u objeto), el menú que se abre resalta visualmente
// esa carta concreta (borde dorado con brillo, etiqueta "CARTA ELEGIDA" y
// desplazamiento hasta ella).
export const HAND_PICK_HIGHLIGHT_PATCH = `
<script>
(function(){
  if(window.__bfHandPickHl)return;
  window.__bfHandPickHl=true;

  var st=document.createElement('style');
  st.textContent=''+
  '.pick-row.bf-pick-sel{position:relative;border:2px solid #ffd24a!important;background:linear-gradient(90deg,rgba(255,210,74,.18),rgba(255,210,74,.05))!important;box-shadow:0 0 16px rgba(255,210,74,.55),inset 0 0 12px rgba(255,210,74,.12)!important;animation:bfPickPulse 1.4s ease-in-out infinite}'+
  '@keyframes bfPickPulse{0%,100%{box-shadow:0 0 12px rgba(255,210,74,.4),inset 0 0 10px rgba(255,210,74,.08)}50%{box-shadow:0 0 22px rgba(255,210,74,.8),inset 0 0 16px rgba(255,210,74,.18)}}'+
  '.bf-pick-tag{position:absolute;top:-9px;right:10px;font-size:9px;font-weight:1000;letter-spacing:.6px;color:#3a2600;background:linear-gradient(180deg,#ffe27a,#e0a92e);border:1px solid rgba(255,240,180,.8);border-radius:8px;padding:2px 8px;box-shadow:0 2px 6px rgba(0,0,0,.5);pointer-events:none}';
  document.head.appendChild(st);

  // Al pulsar el botón "jugar" (✦) de una carta de la mano, se apunta su
  // nombre; el menú se abre justo después y se resalta la fila coincidente.
  document.addEventListener('click',function(e){
    var btn=e.target.closest&&e.target.closest('.bf-chip-play');
    if(!btn)return;
    var chip=btn.closest('.bf-chip-card');
    if(!chip)return;
    var nm=chip.querySelector('.bf-chip-name');
    var name=(nm&&nm.textContent)||chip.title||'';
    if(name)window.__bfHandPick={name:name.trim(),t:Date.now()};
  },true);

  function highlight(){
    var p=window.__bfHandPick;
    if(!p||Date.now()-p.t>1500)return;
    var rows=document.querySelectorAll('#modalRoot .pick-row');
    if(!rows.length)return;
    var target=null;
    rows.forEach(function(r){
      if(target)return;
      var span=r.querySelector('span');
      var txt=(span?span.textContent:r.textContent)||'';
      if(txt.trim().indexOf(p.name)===0)target=r;
    });
    if(!target)return;
    window.__bfHandPick=null;
    target.classList.add('bf-pick-sel');
    var tag=document.createElement('span');
    tag.className='bf-pick-tag';
    tag.textContent='CARTA ELEGIDA';
    target.appendChild(tag);
    setTimeout(function(){try{target.scrollIntoView({block:'nearest'});}catch(e){}},30);
  }

  function hookModal(){
    if(typeof window.modal!=='function'||window.modal.__bfPickHl)return;
    var orig=window.modal;
    window.modal=function(){
      var r=orig.apply(this,arguments);
      try{highlight();}catch(e){}
      return r;
    };
    window.modal.__bfPickHl=1;
  }
  hookModal();
  var iv=setInterval(function(){hookModal();if(window.modal&&window.modal.__bfPickHl)clearInterval(iv);},200);
})();
</script>
`;