// Parche inyectado en el iframe: botón "Desactivar animaciones" solo en batalla.
// Se coloca fijo en la esquina SUPERIOR IZQUIERDA (igual en todos los dispositivos).
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
  // Botón compacto (solo icono + estado) en la esquina SUPERIOR IZQUIERDA
  // de la batalla, igual en todos los dispositivos. No se solapa con el
  // botón Salir (que vive arriba a la derecha) ni con retratos/mano.
  '#bf-cine-toggle{position:fixed;top:10px;left:10px;z-index:2147483000;display:none;'+
    'display:inline-flex;align-items:center;gap:5px;'+
    'padding:5px 9px;border-radius:999px;font-family:Rubik,sans-serif;font-weight:700;'+
    'font-size:11px;letter-spacing:.2px;cursor:pointer;touch-action:manipulation;'+
    'pointer-events:auto;-webkit-tap-highlight-color:transparent;'+
    'box-shadow:0 3px 10px rgba(0,0,0,.5);transition:transform .12s ease,background .15s ease;'+
    'white-space:nowrap;line-height:1;backdrop-filter:blur(6px)}'+
  '#bf-cine-toggle:active{transform:scale(.92)}'+
  '#bf-cine-toggle .bf-cine-ico{font-size:13px;line-height:1}'+
  '#bf-cine-toggle.bf-on{border:1px solid rgba(255,240,180,.7);background:linear-gradient(180deg,rgba(255,226,122,.92),rgba(200,144,31,.92));color:#3a2600}'+
  '#bf-cine-toggle.bf-off{border:1px solid rgba(255,120,100,.55);background:linear-gradient(180deg,rgba(58,32,48,.9),rgba(36,16,24,.9));color:#ffb0a0}';
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
    btn.innerHTML='<span class="bf-cine-ico">'+(on?'🎬':'🔇')+'</span>'+(on?'Anim ON':'Anim OFF');
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