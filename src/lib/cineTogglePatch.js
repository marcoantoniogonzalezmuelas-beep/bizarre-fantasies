// Parche inyectado en el iframe: botón "Desactivar animaciones" solo en batalla.
// Se coloca fijo en la esquina superior derecha, justo debajo del botón "Salir".
// Al pulsarlo, activa/desactiva el flag global window.__bfNoCinematics
// (persistente en localStorage).
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
  // Posición FIJA en el viewport del juego (no depende del rect del botón
  // Salir, que se desplaza al hacer zoom de pellizco en móvil).
  // Escritorio: esquina inferior IZQUIERDA (lejos del botón Salir).
  // Móvil/tablet: centrado en la parte inferior.
  '#bf-cine-toggle{position:fixed;bottom:16px;left:16px;z-index:2147483000;display:none;'+
    'padding:7px 12px;border-radius:10px;font-family:Cinzel,serif;font-weight:900;'+
    'font-size:12px;letter-spacing:.3px;cursor:pointer;touch-action:manipulation;'+
    'pointer-events:auto;-webkit-tap-highlight-color:transparent;'+
    'box-shadow:0 4px 14px rgba(0,0,0,.55);transition:transform .12s ease,background .15s ease;'+
    'white-space:nowrap;line-height:1.1}'+
  '#bf-cine-toggle:active{transform:scale(.94)}'+
  '#bf-cine-toggle.bf-on{border:1px solid rgba(255,240,180,.85);background:linear-gradient(180deg,#ffe27a,#c8901f);color:#3a2600}'+
  '#bf-cine-toggle.bf-off{border:1px solid rgba(255,120,100,.6);background:linear-gradient(180deg,#3a2030,#241018);color:#ffb0a0}'+
  '@media(max-width:1024px){#bf-cine-toggle{bottom:12px;left:50%;right:auto;transform:translateX(-50%);font-size:11px;padding:8px 14px}'+
    '#bf-cine-toggle:active{transform:translateX(-50%) scale(.94)}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

  function isBattle(){
    try{var s=document.querySelector('.screen.active');return !!s&&s.id==='s-battle';}catch(e){return false;}
  }

  function syncButton(){
    var btn=document.getElementById('bf-cine-toggle');
    if(!btn)return;
    btn.style.display=isBattle()?'block':'none';
    var on=!window.__bfNoCinematics;
    btn.className='bf-'+(on?'on':'off');
    btn.textContent=on?'🎬 Desactivar animaciones':'🔇 Activar animaciones';
  }

  function toggle(e){
    if(e){try{e.preventDefault();e.stopPropagation();}catch(x){}}
    window.__bfNoCinematics=!window.__bfNoCinematics;
    try{localStorage.setItem('bfNoCinematics',window.__bfNoCinematics?'1':'0');}catch(x){}
    syncButton();
    try{if(typeof notif==='function')notif(window.__bfNoCinematics?'🔇 Cinemáticas 3D desactivadas':'🎬 Cinemáticas 3D activadas');}catch(x){}
  }

  function ensureButton(){
    var btn=document.getElementById('bf-cine-toggle');
    if(!btn||!btn.isConnected){
      btn=document.createElement('button');
      btn.id='bf-cine-toggle';
      btn.type='button';
      // pointerdown: respuesta inmediata en táctil (el click puede quedar
      // absorbido por las capas de FX/pinch superpuestas en batalla).
      btn.addEventListener('pointerdown',toggle);
      btn.addEventListener('click',function(e){try{e.preventDefault();e.stopPropagation();}catch(x){}});
      // Siempre en <body>: __bfAppend lo metía en contenedores transformados
      // (FX/zoom), donde position:fixed deja de ser fijo y el botón flota.
      document.body.appendChild(btn);
    }
    syncButton();
  }

  setInterval(ensureButton,500);
})();
</script>
`;