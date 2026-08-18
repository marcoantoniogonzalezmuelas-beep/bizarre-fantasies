// Números de STATS siempre visibles: igual que el rojo del daño y el verde de
// la curación, cuando un héroe sube o baja un stat (CC, AD, HE, ESCUDO, MANÁ)
// aparece sobre su retrato el número y el stat afectado (p. ej. "+3 CC" en
// dorado o "-2 AD" en rojo).
//
// No toca la lógica del juego: vigila los stats efectivos de cada héroe en
// batalla y, cuando cambian, muestra el aviso.
export const STAT_NUMBER_PATCH = `
<script>
(function(){
  if(window.__bfStatNum) return;
  window.__bfStatNum = true;

  var st = document.createElement('style');
  st.textContent = ''
    + '.bf-stat-pop{position:fixed;z-index:100004;pointer-events:none;transform:translate(-50%,-50%);'
    + 'display:flex;align-items:center;gap:5px;padding:4px 12px;border-radius:999px;'
    + "font-family:'Cinzel',serif;font-weight:900;font-size:28px;line-height:1;"
    + 'animation:bfStatPop 3.2s cubic-bezier(.2,.8,.3,1) forwards}'
    // Verde = curación, rojo = daño, AZUL = cambios de stats (sube con + y baja con −).
    + '.bf-stat-pop.up{color:#6fc8ff;background:radial-gradient(circle,rgba(6,32,60,.7),rgba(6,32,60,0) 72%);'
    + 'text-shadow:0 0 12px rgba(90,180,255,.95),0 3px 8px #000}'
    + '.bf-stat-pop.down{color:#6fc8ff;background:radial-gradient(circle,rgba(6,32,60,.7),rgba(6,32,60,0) 72%);'
    + 'text-shadow:0 0 12px rgba(90,180,255,.95),0 3px 8px #000}'
    + '.bf-stat-pop small{font-size:15px;font-weight:800;letter-spacing:.5px;color:#fff6df;text-shadow:0 2px 6px #000}'
    + '@keyframes bfStatPop{0%{opacity:0;transform:translate(-50%,10%) scale(.6)}'
    + '14%{opacity:1;transform:translate(-50%,-24%) scale(1.1)}'
    + '24%{transform:translate(-50%,-28%) scale(1)}'
    + '72%{opacity:1;transform:translate(-50%,-64%) scale(1)}'
    + '100%{opacity:0;transform:translate(-50%,-112%) scale(1.04)}}';
  document.head.appendChild(st);

  var STATS = [
    { key:'cc', label:'CC' },
    { key:'ad', label:'AD' },
    { key:'he', label:'HE' },
    { key:'shield', label:'ESCUDO' },
    { key:'mana', label:'MANÁ' }
  ];

  var queue = [], showing = 0;

  function render(job){
    var el = document.getElementById('b_' + job.side + '_' + job.id);
    if(!el) return;
    var r = el.getBoundingClientRect();
    var n = document.createElement('div');
    n.className = 'bf-stat-pop ' + (job.delta > 0 ? 'up' : 'down');
    n.style.left = (r.left + r.width / 2) + 'px';
    n.style.top = (r.top + r.height * 0.24) + 'px';
    n.innerHTML = (job.delta > 0 ? '+' : '−') + Math.abs(job.delta) + ' <small>' + job.label + '</small>';
    (window.__bfAppend || function(x){ document.body.appendChild(x); })(n);
    setTimeout(function(){ if(n.parentNode) n.parentNode.removeChild(n); }, 3300);
  }

  // Los avisos se muestran de uno en uno (300 ms entre ellos) para que varios
  // cambios simultáneos se lean bien y no se pisen sobre el retrato.
  setInterval(function(){
    if(!queue.length || showing > Date.now()) return;
    showing = Date.now() + 500;
    render(queue.shift());
  }, 100);

  function valueOf(hero, key){
    try{
      if(key === 'shield') return Number(hero.shield || 0);
      if(key === 'mana') return Number(hero.mana || 0);
      if(typeof stat === 'function') return Number(stat(hero, key) || 0);
    }catch(e){}
    return null;
  }

  var prev = {};
  setInterval(function(){
    var scr = document.getElementById('s-battle');
    if(!scr || !scr.classList.contains('active')) return;
    if(typeof G === 'undefined' || !G || !G.team) return;
    ['p','o'].forEach(function(side){
      (G.team[side] || []).forEach(function(h){
        if(!h || !h.id) return;
        STATS.forEach(function(s){
          var v = valueOf(h, s.key);
          if(v === null) return;
          var key = side + '_' + h.id + '_' + s.key;
          var old = prev[key];
          prev[key] = v;
          // Los héroes muertos y el primer muestreo no generan aviso.
          if(old === undefined || !h.alive || v === old) return;
          queue.push({ side:side, id:h.id, label:s.label, delta:v - old });
        });
      });
    });
  }, 300);
})();
</script>
`;