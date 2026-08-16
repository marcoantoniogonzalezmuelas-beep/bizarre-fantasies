// Parche inyectado en el iframe: botón "Desactivar animaciones" solo en batalla.
// Se coloca justo DEBAJO del botón "Salir" (homeBtn). Al pulsarlo, activa/desactiva
// el flag global window.__bfNoCinematics (persistente en localStorage).
//
// Cuando el flag está activo, las cinemáticas 3D (abilityAnimPatch para
// habilidades de héroes, hechizos y objetos; specialCardCinematicPatch para
// fénix/transformer/tanque/patitos) se saltan. En su lugar se muestra la carta
// revelada en el centro de la pantalla (cardPlayRevealPatch) y los FX 2D
// habituales (rayo en cadena, tormenta ígnea, banners de habilidad, etc.).
export const CINE_TOGGLE_PATCH = `
<script>
(function(){
  if(window.__bfCineToggle)return;
  window.__bfCineToggle=true;

  try{ window.__bfNoCinematics = localStorage.getItem('bfNoCinematics')==='1'; }catch(e){ window.__bfNoCinematics=false; }

  var css=''+
  '#bf-cine-toggle{position:fixed;z-index:100004;display:none;'+
    'padding:7px 12px;border-radius:10px;font-family:Cinzel,serif;font-weight:900;'+
    'font-size:12px;letter-spacing:.3px;cursor:pointer;touch-action:manipulation;'+
    'box-shadow:0 4px 14px rgba(0,0,0,.55);transition:transform .12s ease,background .15s ease;'+
    'white-space:nowrap;line-height:1.1}'+
  '#bf-cine-toggle:active{transform:scale(.94)}'+
  '#bf-cine-toggle.bf-on{border:1px solid rgba(255,240,180,.85);background:linear-gradient(180deg,#ffe27a,#c8901f);color:#3a2600}'+
  '#bf-cine-toggle.bf-off{border:1px solid rgba(255,120,100,.6);background:linear-gradient(180deg,#3a2030,#241018);color:#ffb0a0}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  function isBattle(){
    try{var s=document.querySelector('.screen.active');return !!s&&s.id==='s-battle';}catch(e){return false;}
  }

  function syncButton(){
    var btn=document.getElementById('bf-cine-toggle');
    if(!btn)return;
    var home=document.getElementById('homeBtn');
    if(!home||!isBattle()){btn.style.display='none';return;}
    var r=home.getBoundingClientRect();
    if(!r||!r.width){btn.style.display='none';return;}
    btn.style.display='block';
    // Misma columna que el botón Salir, justo debajo.
    btn.style.right=Math.max(4,(window.innerWidth-r.right))+'px';
    btn.style.top=(r.bottom+6)+'px';
    var on=!window.__bfNoCinematics;
    btn.className='bf-'+(on?'on':'off');
    btn.textContent=on?'🎬 Desactivar animaciones':'🔇 Activar animaciones';
  }

  function ensureButton(){
    var btn=document.getElementById('bf-cine-toggle');
    if(!btn){
      btn=document.createElement('button');
      btn.id='bf-cine-toggle';
      btn.addEventListener('click',function(){
        window.__bfNoCinematics=!window.__bfNoCinematics;
        try{localStorage.setItem('bfNoCinematics',window.__bfNoCinematics?'1':'0');}catch(e){}
        syncButton();
        try{if(typeof notif==='function')notif(window.__bfNoCinematics?'🔇 Cinemáticas 3D desactivadas':'🎬 Cinemáticas 3D activadas');}catch(e){}
      });
      (window.__bfAppend||function(n){document.body.appendChild(n);})(btn);
    }
    syncButton();
  }

  setInterval(ensureButton,500);
})();
</script>
`;