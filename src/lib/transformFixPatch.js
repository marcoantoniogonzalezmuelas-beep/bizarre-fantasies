// Arreglos del hechizo Transformer:
//
//  1) Solo pueden salir HÉROES BIZARROS (Caja de Zapatos, Lavadora, Butifarra,
//     Bañador, Pez Espada). Las invocaciones (Patito de Goma, Grulla, Unicornio
//     Kamikaze, Pegaso) NO son héroes bizarros y quedan fuera del sorteo.
//
//  2) Al transformarse, el héroe anterior desaparece por completo: se le cambia
//     también su identidad interna (card_id) y se borran las marcas de las
//     habilidades del héroe original, para que en batalla se ejecuten las
//     habilidades del bizarro y no las del héroe sobre el que se transformó.
export const TRANSFORM_FIX_PATCH = `
<script>
(function(){
  if(window.__bfTransformFix) return;
  window.__bfTransformFix = true;

  var BIZARROS = ['tk_caj', 'tk_lav', 'tk_buf', 'tk_ban', 'tk_pez'];
  var STALE = ['_bfRefract', '_bfDuck', '_bfCrane', '_bfTank', '_bfNoElite', '_bfPassive', 'passive_marker'];

  // El sorteo del Transformer lee la lista global TOKENS: durante la tirada se
  // le deja ver solo a los bizarros y luego se restaura la lista completa
  // (las invocaciones siguen disponibles para Patito, Grulla, etc.).
  function onlyBizarros(fn, ctx, args){
    var full = window.TOKENS;
    try{
      var only = (full || []).filter(function(tk){ return tk && BIZARROS.indexOf(tk.id) >= 0; });
      if(only.length) window.TOKENS = only;
      return fn.apply(ctx, args);
    } finally {
      window.TOKENS = full;
    }
  }

  function wrapCast(name, isTransform){
    if(typeof window[name] !== 'function' || window[name].__bfTrFix) return;
    var orig = window[name];
    var w = function(){
      if(!isTransform.apply(null, arguments)) return orig.apply(this, arguments);
      return onlyBizarros(orig, this, arguments);
    };
    w.__bfTrFix = true;
    window[name] = w;
  }

  // Un héroe transformado conserva su identidad interna anterior (cid/card_id),
  // y los parches de habilidades la usan para saber a quién pertenece la
  // habilidad. Se sincroniza con el token para que sea el bizarro quien actúa.
  function fixIdentities(){
    try{
      if(typeof G === 'undefined' || !G || !G.team) return;
      ['p', 'o'].forEach(function(side){
        (G.team[side] || []).forEach(function(h){
          if(!h || !h._token || BIZARROS.indexOf(h._token) < 0) return;
          if(h.cid === h._token && h.card_id === h._token) return;
          h.cid = h._token;
          h.card_id = h._token;
          STALE.forEach(function(k){ delete h[k]; });
        });
      });
    }catch(e){}
  }

  // Otros parches vuelven a envolver castSpell más tarde y dejarían el filtro
  // por debajo: se revisa periódicamente y se vuelve a envolver si hace falta.
  setInterval(function(){
    wrapCast('castSpell', function(id){ return id === 'sp_transform'; });
    wrapCast('castSpell_AI', function(side, h, s){ return s && s.kind === 'transform'; });
  }, 700);
  setInterval(fixIdentities, 500);
})();
</script>
`;