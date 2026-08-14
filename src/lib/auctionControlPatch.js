// Control de subastas (backoffice → /admin/subastas): permite decidir qué
// héroes salen en las subastas, bien eligiéndolos a mano (modo "direct"), bien
// por porcentajes de probabilidad de grupos (modo "weights": por raza, rol o
// rango de coste). Sirve para probar héroes nuevos y para misiones con
// unidades de un tipo concreto (p. ej. solo héroes de coste < 20).
export const AUCTION_CONTROL_PATCH = `
<script>
(function(){
  if(window.__bfAuctionCtl) return;
  window.__bfAuctionCtl = true;

  var CFG = null;
  window.addEventListener('message', function(e){
    if(e.data && e.data.bfAuctionConfig !== undefined) CFG = e.data.bfAuctionConfig;
  });

  function pool(){
    return (typeof HEROES !== 'undefined' ? HEROES : []).filter(function(h){
      return h && h.type && h.clan !== 'Bizarros' && String(h.id || '').indexOf('tk_') !== 0;
    });
  }

  function num(v){ return (v === null || v === undefined || v === '') ? null : Number(v); }

  function matches(h, r){
    if(r.clan && String(h.clan || '') !== r.clan) return false;
    if(r.type && String(h.type || '') !== r.type) return false;
    var c = Number(h.cost || 0);
    var mn = num(r.cost_min), mx = num(r.cost_max);
    if(mn !== null && c < mn) return false;
    if(mx !== null && c > mx) return false;
    return true;
  }

  function shuf(a){
    a = a.slice();
    for(var i = a.length - 1; i > 0; i--){ var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  // Ordena los héroes sorteando primero el GRUPO según su porcentaje y luego
  // un héroe al azar de ese grupo: los grupos con más % salen antes y más.
  function weighted(list, rules){
    var groups = (rules || []).map(function(r){
      return { w: Math.max(0, Number(r.percent) || 0), items: shuf(list.filter(function(h){ return matches(h, r); })) };
    }).filter(function(g){ return g.w > 0 && g.items.length; });
    var out = [];
    while(groups.some(function(g){ return g.items.length; })){
      var avail = groups.filter(function(g){ return g.items.length; });
      var total = avail.reduce(function(s, g){ return s + g.w; }, 0);
      var r = Math.random() * total, pick = avail[0];
      for(var i = 0; i < avail.length; i++){ r -= avail[i].w; if(r <= 0){ pick = avail[i]; break; } }
      var h = pick.items.shift();
      if(out.indexOf(h) < 0) out.push(h);
    }
    return out;
  }

  // La configuración se aplica si está activada o si simplemente hay héroes
  // marcados en elección directa (evita que el control parezca no funcionar
  // por tener el interruptor apagado).
  function isOn(){
    if(!CFG) return false;
    if(CFG.active) return true;
    return CFG.mode !== 'weights' && (CFG.hero_ids || []).length > 0;
  }

  function buildPools(){
    if(!isOn()) return null;
    var list = pool();
    var by = { CC: [], AD: [], HE: [] };

    // ELECCIÓN DIRECTA: los héroes marcados salen SIEMPRE (van primeros en su
    // rol) y el resto de la subasta se sortea con normalidad detrás de ellos.
    // Así se puede probar una carta concreta sin limitar la subasta entera.
    if(CFG.mode !== 'weights'){
      var ids = CFG.hero_ids || [];
      if(!ids.length) return null;
      ['CC','AD','HE'].forEach(function(t){
        var role = list.filter(function(h){ return h.type === t; });
        var forced = shuf(role.filter(function(h){ return ids.indexOf(h.id) >= 0; }));
        var rest = shuf(role.filter(function(h){ return ids.indexOf(h.id) < 0; }));
        by[t] = forced.concat(rest);
      });
      return by;
    }

    var sel = weighted(list, CFG.rules);
    if(!sel.length) return null;
    sel.forEach(function(h){ if(by[h.type]) by[h.type].push(h); });
    // Si un rol se queda sin candidatos, se rellena con el reparto normal para
    // que la subasta no se quede bloqueada.
    ['CC','AD','HE'].forEach(function(t){
      if(!by[t].length) by[t] = shuf(list.filter(function(h){ return h.type === t; }));
    });
    return by;
  }

  // El juego elige los candidatos de cada subasta con drawRaceSlate(): un héroe
  // AL AZAR de cada raza del pool, por lo que ordenar el pool no bastaba (los
  // héroes marcados salían solo por suerte). Aquí forzamos que los héroes
  // marcados en "elección directa" entren SIEMPRE en la tanda de candidatos,
  // sustituyendo al héroe elegido de su misma raza. El resto sigue igual.
  function hookSlate(){
    if(window.__bfSlateHooked || typeof window.drawRaceSlate !== 'function') return;
    window.__bfSlateHooked = true;
    var origSlate = window.drawRaceSlate;
    window.drawRaceSlate = function(p){
      var out = origSlate.apply(this, arguments) || [];
      try{
        if(isOn() && CFG.mode !== 'weights'){
          var ids = CFG.hero_ids || [];
          (p || []).forEach(function(h){
            if(ids.indexOf(h.id) < 0) return;
            for(var k = 0; k < out.length; k++){ if(out[k] && out[k].id === h.id) return; }
            var same = -1, free = -1;
            for(var i = 0; i < out.length; i++){
              if(same < 0 && out[i] && out[i].clan === h.clan) same = i;
              if(free < 0 && out[i] && ids.indexOf(out[i].id) < 0) free = i;
            }
            if(same >= 0) out[same] = h;
            else if(free >= 0) out[free] = h;
            else out.push(h);
          });
        }
      }catch(e){}
      return out;
    };
  }

  function install(){
    hookSlate();
    if(window.__bfAuctionHooked || typeof window.startAuctionPhase !== 'function') return false;
    window.__bfAuctionHooked = true;
    var orig = window.startAuctionPhase;
    window.startAuctionPhase = function(){
      var host = (typeof NET === 'undefined' || NET.role !== 'client');
      try{
        // Los pools se reconstruyen al empezar CADA partida (primera fase de
        // subasta), no solo una vez: así la configuración del backoffice sigue
        // aplicándose en todas las partidas siguientes hasta que se cambie.
        var fresh = (typeof G !== 'undefined') && (!(G.pools && G.pools.__bfCfg) || !G.aIndex);
        if(host && typeof G !== 'undefined' && fresh){
          var p = buildPools();
          if(p){ p.__bfCfg = true; G.pools = p; }
        }
      }catch(e){}
      var res = orig.apply(this, arguments);
      // Rol elegido para esta fase desde el backoffice (fase 1, 2 y 3).
      try{
        if(host && isOn() && CFG.phase_types){
          var want = CFG.phase_types[G.aIndex];
          if(want && ['CC','AD','HE'].indexOf(want) >= 0 && want !== G.curType){
            G.curType = want;
            if(typeof beginBidRound === 'function') beginBidRound();
          }
        }
      }catch(e){}
      return res;
    };
    return true;
  }

  var n = 0, t = setInterval(function(){ if(install() || n++ > 160) clearInterval(t); }, 150);
})();
</script>
`;