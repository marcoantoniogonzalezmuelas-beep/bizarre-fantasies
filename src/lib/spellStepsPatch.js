// HECHIZOS Y OBJETOS CON EFECTO DEFINIDO EN LA BASE DE DATOS (kind "bf_steps").
// Una carta de hechizo u objeto cuyo parámetro del motor es { kind: "bf_steps", steps: [...] } se ejecuta con el
// mismo ejecutor de pasos que las habilidades de los héroes (abilityImplPatch): daño, curas, escudos, estados,
// resucitar, etc. Así un hechizo u objeto con un efecto nuevo se crea solo con datos, sin código.
//   - Hechizo: gasta el maná de la carta y escala con la Magia del lanzador con "magic_base" en los pasos.
//   - Objeto: se consume al usarse con efecto.
// El invitado de una partida en línea manda su intención al anfitrión (lo hace el motor), que lo ejecuta aquí.
export const SPELL_STEPS_PATCH = `<script>
(function(){
  if(window.__bfSpellStepsPatch) return; window.__bfSpellStepsPatch = true;
  function stepsOf(it){ return (it && it.kind === 'bf_steps' && Array.isArray(it.steps) && it.steps.length) ? it.steps : null; }
  function exec(){ return typeof window.__bfExecuteSteps === 'function' ? window.__bfExecuteSteps : null; }
  function note(m){ try{ if(typeof notif === 'function') notif(m); }catch(e){} }
  function isClient(){ return typeof NET !== 'undefined' && NET && NET.role === 'client'; }
  var H = {};

  function castSteps(side, h, s, endFn){
    h.mana -= s.mana;
    if(typeof pushLog === 'function') pushLog('li', h.name + ' lanza ' + s.name + '.');
    exec()(side, h, s.steps, s.name, function(){ endFn(); }, function(){
      h.mana += s.mana;
      if(typeof pushLog === 'function') pushLog('li', s.name + ' no tiene efecto ahora.');
      note('El hechizo no tiene efecto ahora.');
      if(endFn.ai) endFn();
    });
  }

  function hookSpell(){
    if(typeof window.castSpell !== 'function' || H.cast) return false;
    H.cast = 1;
    var orig = window.castSpell;
    window.castSpell = function(id){
      var s = (typeof SPELLS !== 'undefined') ? byId(SPELLS, id) : null;
      if(!stepsOf(s) || !exec() || isClient()) return orig.apply(this, arguments);
      var side = B.current.side, h = getHero(side, B.current.id);
      if(!h) return;
      if(h.mana < s.mana){ note('Man\\\\u00e1 insuficiente'); return; }
      castSteps(side, h, s, function(){ if(typeof finishAct === 'function') finishAct(); });
    };
    return true;
  }

  function hookItem(){
    if(typeof window.useItem !== 'function' || H.item) return false;
    H.item = 1;
    var orig = window.useItem;
    window.useItem = function(idx){
      var side = (typeof B !== 'undefined' && B && B.current) ? B.current.side : 'p';
      var o = (G.items && G.items[side]) ? G.items[side][idx] : null;
      if(!stepsOf(o) || !exec() || isClient()) return orig.apply(this, arguments);
      var h = getHero(side, B.current.id);
      if(!h) return;
      exec()(side, h, o.steps, o.name, function(){
        if(typeof pushLog === 'function') pushLog('lg', o.name + ' usado por ' + h.name + '.');
        var arr = G.items[side], k = arr.indexOf(o); if(k >= 0) arr.splice(k, 1);
        if(typeof finishAct === 'function') finishAct();
      }, function(){ note('El objeto no tiene efecto ahora.'); });
    };
    return true;
  }

  // La IA: a veces usa un objeto o un hechizo de pasos en vez de su acción habitual (el motor solo conoce los suyos).
  function hookAI(){
    if(typeof window.aiTurn !== 'function' || H.ai) return false;
    H.ai = 1;
    var orig = window.aiTurn;
    window.aiTurn = function(h, side){
      try{
        if(!B.over && exec() && h && h.alive && Math.random() < 0.4){
          var items = (G.items && G.items[side]) || [];
          var ii = -1; for(var i = 0; i < items.length; i++){ if(stepsOf(items[i])){ ii = i; break; } }
          if(ii >= 0 && Math.random() < 0.5){
            var o = items[ii];
            exec()(side, h, o.steps, o.name, function(){
              var k = G.items[side].indexOf(o); if(k >= 0) G.items[side].splice(k, 1);
              if(typeof pushLog === 'function') pushLog('lg', o.name + ' usado por ' + h.name + '.');
              if(typeof endTurn === 'function') endTurn();
            }, function(){ if(typeof endTurn === 'function') endTurn(); });
            return;
          }
          if(h.silence <= 0 && (h.type === 'HE' || h.maxMana > 0)){
            var sp = ((G.spellbook && G.spellbook[side]) || []).map(function(id){ return byId(SPELLS, id); }).filter(function(s){ return stepsOf(s) && h.mana >= s.mana; });
            if(sp.length){
              var s = sp[Math.floor(Math.random() * sp.length)];
              var endAI = function(){ if(typeof endTurn === 'function') endTurn(); }; endAI.ai = true;
              castSteps(side, h, s, endAI);
              return;
            }
          }
        }
      }catch(e){}
      return orig.apply(this, arguments);
    };
    return true;
  }

  function hook(){ hookSpell(); hookItem(); hookAI(); }
  hook();
  var iv = setInterval(function(){ hook(); if(H.cast && H.item && H.ai) clearInterval(iv); }, 300);
  setTimeout(function(){ clearInterval(iv); }, 15000);
})();
</script>
`;
