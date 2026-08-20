// SOLO MÓVIL/TABLET: el panel de acciones y las manos de cartas se convierten en
// paneles DESPLEGABLES anclados abajo de la pantalla, para que el campo de
// batalla ocupe toda la altura visible.
//
//  · Panel de acciones → se despliega solo cuando le toca al héroe del jugador
//    (y se recoge al pasar el turno al rival / a la IA).
//  · Tu mano → el jugador puede abrirla y cerrarla EN TODO MOMENTO.
//  · Mano del rival → cerrada por defecto, se abre a mano.
//
// El enfoque al campo de batalla al jugar cartas/acciones sigue funcionando
// igual: las pestañas van fijas abajo y no tapan la acción.
export const MOBILE_BATTLE_DRAWERS_PATCH = `
<script>
(function(){
  if(window.__bfMobDrawers)return;
  window.__bfMobDrawers=true;

  var css=[
    // Pestañas fijas abajo (siempre visibles, por encima del tablero).
    '.bf-drw-tabs{position:fixed;left:0;right:0;bottom:0;z-index:9500;display:flex;gap:8px;padding:8px 10px;background:linear-gradient(180deg,rgba(10,7,16,.2),rgba(10,7,16,.96));pointer-events:none}',
    '.bf-drw-tab{pointer-events:auto;flex:1 1 0;min-height:64px;font:800 22px/1.1 Rubik,system-ui,sans-serif;color:#3a2600;border:2px solid rgba(255,210,74,.85);border-radius:14px;background:linear-gradient(180deg,#ffe27a,#c8901f);box-shadow:0 4px 14px rgba(0,0,0,.6);padding:6px 8px}',
    '.bf-drw-tab.off{color:#e7d9ff;background:linear-gradient(180deg,#241a38,#150f22);border-color:rgba(192,107,255,.7)}',
    // Contenedor desplegable de cada panel.
    '#s-battle .active-hero-panel,#s-battle .hand-under-action{position:fixed!important;left:8px!important;right:8px!important;bottom:88px!important;z-index:9400!important;max-height:52vh!important;overflow:auto!important;margin:0!important;box-shadow:0 -10px 40px rgba(0,0,0,.85)!important}',
    'html:not(.bf-drw-act) #s-battle .active-hero-panel{display:none!important}',
    'html:not(.bf-drw-hand) #s-battle #hand_p{display:none!important}',
    'html:not(.bf-drw-rival) #s-battle #hand_o{display:none!important}',
    // La fila de manos ya no reserva altura: el campo de batalla se estira.
    '#s-battle .bf-hands-row{min-height:0!important;margin:0!important;display:block!important}',
    // Hueco inferior para que las pestañas no tapen el registro de batalla.
    '#s-battle{padding-bottom:96px!important}'
  ].join('');
  var st=document.createElement('style');
  st.textContent=css;
  document.head.appendChild(st);

  var root=document.documentElement;
  var manual={act:false};

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
    t.innerHTML='<button type="button" class="bf-drw-tab" data-k="act">⚔️ Acciones</button>'
      +'<button type="button" class="bf-drw-tab" data-k="hand">🖐 Mis cartas</button>'
      +'<button type="button" class="bf-drw-tab" data-k="rival">🎴 Rival</button>';
    t.addEventListener('click',function(e){
      var b=e.target.closest('.bf-drw-tab');
      if(!b)return;
      var k=b.dataset.k;
      var cls={act:'bf-drw-act',hand:'bf-drw-hand',rival:'bf-drw-rival'}[k];
      root.classList.toggle(cls);
      if(k==='act')manual.act=root.classList.contains(cls);
      paint();
    });
    document.body.appendChild(t);
    return t;
  }

  function paint(){
    var t=document.querySelector('.bf-drw-tabs');
    if(!t)return;
    var map={act:'bf-drw-act',hand:'bf-drw-hand',rival:'bf-drw-rival'};
    t.querySelectorAll('.bf-drw-tab').forEach(function(b){
      b.classList.toggle('off',!root.classList.contains(map[b.dataset.k]));
    });
  }

  // ¿Le toca a un héroe del jugador? El panel de acciones del juego solo trae
  // botones habilitados cuando el turno es del jugador humano.
  function myTurn(){
    var p=document.querySelector('#s-battle .active-hero-panel');
    if(!p)return false;
    var btns=p.querySelectorAll('button:not([disabled])');
    return btns.length>0;
  }

  var wasTurn=null;
  function sync(){
    if(!tabs())return;
    var turn=myTurn();
    if(turn!==wasTurn){
      wasTurn=turn;
      manual.act=false;
      root.classList.toggle('bf-drw-act',turn);
      if(turn)root.classList.add('bf-drw-hand');
    }
    paint();
  }

  setInterval(sync,400);
  sync();
})();
</script>
`;