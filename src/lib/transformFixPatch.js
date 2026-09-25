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


  var morphSerial = 0;
  function morph(target, by){
    var pool = (typeof TOKENS !== 'undefined' ? TOKENS : []).filter(function(x){ return x && BIZARROS.indexOf(x.id) >= 0; });
    if(!pool.length) return;
    var tk = pool[Math.floor(Math.random() * pool.length)];
    var oldName = target.name, oldId = target.id, side = tSide(target);
    // Preserve only the team's object reference. A fresh engine hero replaces
    // every ability, passive, used flag, equipment item and old portrait key.
    var fresh = makeInstance(tk);
    Object.keys(target).forEach(function(key){ delete target[key]; });
    Object.assign(target, fresh);
    target.id = tk.id + '_m' + (++morphSerial);
    target.cid = tk.id; target.card_id = tk.id; target._token = tk.id;
    battlePrep(target);
    if(typeof B !== 'undefined' && B){
      (B.queue || []).forEach(function(turn){ if(turn.side === side && turn.id === oldId) turn.id = target.id; });
      if(B.current && B.current.side === side && B.current.id === oldId) B.current.id = target.id;
    }
    if(typeof pushFx === 'function') pushFx({k:'transform', side:side, id:target.id, tokenId:tk.id});
    if(typeof pushLog === 'function') pushLog('lx', by + ': ¡' + oldName + ' se transforma en ' + tk.name + '!');
  }

  function wrapCast(name, isTransform){
    if(typeof window[name] !== 'function' || window[name].__bfTrFix) return;
    var orig = window[name];
    var w = function(){
      if(!isTransform.apply(null, arguments)) return orig.apply(this, arguments);
      if(name === 'castSpell'){
        if(typeof NET !== 'undefined' && NET.role === 'client'){
          if(typeof sendIntent === 'function') sendIntent('castSpell', {id:'sp_transform'});
          return;
        }
        var caster = getHero(B.current.side, B.current.id), spell = byId(SPELLS, 'sp_transform');
        if(!caster || !spell || caster.mana < spell.mana){ if(typeof notif === 'function') notif('Maná insuficiente'); return; }
        var pool = living('p').concat(living('o'));
        if(!pool.length) return;
        caster.mana -= spell.mana;
        morph(pool[Math.floor(Math.random() * pool.length)], caster.name + ' lanza Transformer');
        if(typeof finishAct === 'function') finishAct();
      } else {
        var side = arguments[0], caster = arguments[1], spell = arguments[2], choice = arguments[3];
        caster.mana -= spell.mana;
        var pool = living('p').concat(living('o'));
        var target = choice || pool[Math.floor(Math.random() * pool.length)];
        if(target) morph(target, caster.name + ' lanza Transformer');
        if(typeof endTurn === 'function') endTurn();
      }
    };
    w.__bfTrFix = true;
    window[name] = w;
  }

  // Intercept before the old Transformer implementation can reuse its hero.
  setInterval(function(){
    wrapCast('castSpell', function(id){ return id === 'sp_transform'; });
    wrapCast('castSpell_AI', function(side, h, s){ return s && s.kind === 'transform'; });
  }, 700);
})();
</script>
`;