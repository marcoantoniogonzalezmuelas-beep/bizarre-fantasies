// SOLO MÓVIL/TABLET: el panel de acciones, las manos de cartas y el registro de
// batalla se convierten en paneles DESPLEGABLES anclados abajo, para que el
// campo de batalla (los recuadros de los héroes) ocupe toda la pantalla.
//
//  · Panel de acciones → se despliega SOLO cuando le toca a un héroe del
//    jugador (turno leído del propio motor: B.queue[B.qi].side) y su pestaña
//    parpadea en dorado mientras dura el turno.
//  · Tus cartas → el jugador las abre y cierra en todo momento.
//  · Mano del rival y registro de batalla → desplegables a mano.
export const MOBILE_BATTLE_DRAWERS_PATCH = `
<script>
(function(){
  if(window.__bfMobDrawers)return;
  window.__bfMobDrawers=true;

  var css=[
    // ---- Botonera fija abajo -------------------------------------------------
    '.bf-drw-tabs{position:fixed;left:0;right:0;bottom:0;z-index:9500;display:flex;gap:10px;padding:12px 12px 14px;background:linear-gradient(180deg,rgba(10,7,16,0),rgba(10,7,16,.82) 40%,rgba(10,7,16,.98));pointer-events:none}',
    '.bf-drw-tab{pointer-events:auto;position:relative;flex:1 1 0;min-height:74px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;border-radius:18px;border:2px solid rgba(255,210,74,.35);background:linear-gradient(180deg,#2a1f42,#140e22);box-shadow:0 6px 18px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.06);padding:8px 6px;overflow:hidden}',
    '.bf-drw-tab .bf-drw-ic{font-size:26px;line-height:1;filter:drop-shadow(0 2px 4px rgba(0,0,0,.8))}',
    '.bf-drw-tab .bf-drw-lb{font:800 14px/1 Rubik,system-ui,sans-serif;letter-spacing:.5px;color:#e9dcff;text-shadow:0 2px 4px #000}',
    '.bf-drw-tab.on{border-color:rgba(255,210,74,.95);background:linear-gradient(180deg,#ffe27a,#c8901f)}',
    '.bf-drw-tab.on .bf-drw-lb{color:#3a2600;text-shadow:none}',
    '.bf-drw-tab.alert{animation:bfDrwPulse 1.05s ease-in-out infinite}',
    '@keyframes bfDrwPulse{0%,100%{box-shadow:0 6px 18px rgba(0,0,0,.7),0 0 0 0 rgba(255,210,74,.55);border-color:rgba(255,210,74,.6)}50%{box-shadow:0 6px 22px rgba(0,0,0,.7),0 0 26px 6px rgba(255,210,74,.75);border-color:#ffe27a}}',
    // ---- Paneles desplegables ----------------------------------------------
    '#s-battle .active-hero-panel,#s-battle .hand-under-action,#s-battle .b-log-wrap{position:fixed!important;left:10px!important;right:10px!important;bottom:100px!important;z-index:9400!important;max-height:56vh!important;overflow:auto!important;margin:0!important;border-radius:16px!important;box-shadow:0 -12px 44px rgba(0,0,0,.9)!important}',
    'html:not(.bf-drw-act) #s-battle .active-hero-panel{display:none!important}',
    'html:not(.bf-drw-hand) #s-battle #hand_p{display:none!important}',
    'html:not(.bf-drw-rival) #s-battle #hand_o{display:none!important}',
    'html:not(.bf-drw-log) #s-battle .b-log-wrap{display:none!important}',
    // ---- Campo de batalla más grande ---------------------------------------
    '#s-battle .bf-hands-row{min-height:0!important;margin:0!important;display:block!important}',
    '#s-battle .bhero{min-height:210px!important}',
    '#s-battle{padding-bottom:108px!important}'
  ].join('');
  var st=document.createElement('style');
  st.textContent=css;
  document.head.appendChild(st);

  var root=document.documentElement;
  var KEYS={act:'bf-drw-act',hand:'bf-drw-hand',rival:'bf-drw-rival',log:'bf-drw-log'};

  function tabs(){
    var s=document.getElementById('s-battle');
    if(!s||!s.classList.contains('active')){
      var old=document.querySelector('.bf-drw-tabs');
      if(old)old.remove();
      return null;
    }
    var t=document.querySelector('.bf-drw-tabs');
    if(t)return t;
    t=document.createElement('div');
    t.className='bf-drw-tabs';
    t.innerHTML=[['act','⚔️','Acciones'],['hand','🖐','Mis cartas'],['rival','🎴','Rival'],['log','📜','Registro']]
      .map(function(k){return '<button type="button" class="bf-drw-tab" data-k="'+k[0]+'"><span class="bf-drw-ic">'+k[1]+'</span><span class="bf-drw-lb">'+k[2]+'</span></button>';}).join('');
    t.addEventListener('click',function(e){
      var b=e.target.closest('.bf-drw-tab');
      if(!b)return;
      var cls=KEYS[b.dataset.k];
      var wasOpen=root.classList.contains(cls);
      // Solo un panel abierto a la vez: no se solapan entre ellos.
      Object.keys(KEYS).forEach(function(k){root.classList.remove(KEYS[k]);});
      if(!wasOpen)root.classList.add(cls);
      paint();
    });
    document.body.appendChild(t);
    return t;
  }

  // Turno del jugador leído del motor: la cola de turnos (B.queue[B.qi]) dice
  // de qué bando es el héroe activo. En online, el bando propio es NET.mySide.
  function myTurn(){
    try{
      if(typeof B==='undefined'||!B||B.over||!B.queue)return false;
      var slot=B.queue[B.qi];
      if(!slot)return false;
      var mine='p';
      if(typeof online==='function'&&online()&&typeof NET!=='undefined'&&NET.mySide)mine=NET.mySide;
      return slot.side===mine;
    }catch(e){return false;}
  }

  function paint(){
    var t=document.querySelector('.bf-drw-tabs');
    if(!t)return;
    var turn=myTurn();
    t.querySelectorAll('.bf-drw-tab').forEach(function(b){
      var open=root.classList.contains(KEYS[b.dataset.k]);
      b.classList.toggle('on',open);
      b.classList.toggle('alert',b.dataset.k==='act'&&turn&&!open);
    });
  }

  var wasTurn=null;
  function sync(){
    if(!tabs())return;
    var turn=myTurn();
    if(turn!==wasTurn){
      wasTurn=turn;
      if(turn){
        Object.keys(KEYS).forEach(function(k){root.classList.remove(KEYS[k]);});
        root.classList.add('bf-drw-act');
      }else{
        root.classList.remove('bf-drw-act');
      }
    }
    paint();
  }

  setInterval(sync,300);
  sync();
})();
</script>
`;