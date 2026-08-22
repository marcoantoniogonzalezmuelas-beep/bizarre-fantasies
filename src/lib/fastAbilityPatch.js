// Habilidad de Fast Everest Panzer (card_id "Fast").
//
// NORMAL — "Compresor Roto": tras la cinemática 3D se pide tarjetear a un rival
// y después se elige una de dos sabotajes:
//   · Bloquear su fase ÉLITE  → se marca eliteUsed, así que al morir cae de
//     verdad (el motor solo renace en élite si eliteUsed es false).
//   · Anular su habilidad     → abilityUsed = true en su forma actual (si algún
//     día renace élite, recupera habilidad, como pide la carta).
//
// ÉLITE — "Monedero Roto": rival vivo AL AZAR (no se elige) con −15 a todos sus
// stats durante todo el combate.
export const FAST_ABILITY_PATCH = `
<script>
(function(){
  if(window.__bfFastAbil) return;
  window.__bfFastAbil = true;

  function isFast(h){
    if(!h) return false;
    var id = String(h.id || h.cid || h.card_id || '').toLowerCase();
    return id === 'fast' || String(h.name || '') === 'Fast Everest Panzer';
  }

  var CSS = '#bf-fast-pick{position:fixed;inset:0;z-index:100000;display:flex;align-items:center;justify-content:center;background:rgba(6,4,12,.82)}'
    + '#bf-fast-pick .bx{width:min(92vw,420px);border-radius:20px;border:2px solid #ffd24a;background:linear-gradient(180deg,#1d1330,#120c1f);padding:18px;box-shadow:0 18px 50px rgba(0,0,0,.75);text-align:center}'
    + '#bf-fast-pick h3{margin:0 0 4px;font-size:18px;font-weight:900;color:#fff5dc}'
    + '#bf-fast-pick p{margin:0 0 14px;font-size:13px;color:#cfc6dd}'
    + '#bf-fast-pick button{display:block;width:100%;margin-top:10px;padding:13px 12px;border-radius:14px;border:2px solid #8a5f10;font-size:14px;font-weight:900;color:#3a2600;background:linear-gradient(180deg,#ffe27a,#c8901f);cursor:pointer}'
    + '#bf-fast-pick button.alt{border-color:#7a4bb0;color:#f4e8ff;background:linear-gradient(180deg,#6f3fb0,#3d1f66)}';

  function askChoice(foeName, cb){
    var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    var ov = document.createElement('div'); ov.id = 'bf-fast-pick';
    ov.innerHTML = '<div class="bx"><h3>\\u2699\\ufe0f Compresor Roto</h3><p>Sabotaje contra <b>' + foeName + '</b>. Elige qué le rompes:</p>'
      + '<button data-k="elite">\\u26D4 Bloquear su fase \\u00c9LITE</button>'
      + '<button class="alt" data-k="abil">\\u2728 Anular su habilidad actual</button></div>';
    ov.addEventListener('click', function(e){
      var b = e.target.closest && e.target.closest('button');
      if(!b) return;
      ov.remove(); st.remove();
      cb(b.getAttribute('data-k'));
    });
    document.body.appendChild(ov);
  }

  function install(){
    if(typeof window.useAbility !== 'function' || window.__bfFastHooked) return false;
    if(typeof pendTarget !== 'function' || typeof G === 'undefined') return false;
    window.__bfFastHooked = true;
    var orig = window.useAbility;

    window.useAbility = function(side, h, done){
      if(!isFast(h)) return orig.apply(this, arguments);

      var foesSide = (typeof enemySide === 'function') ? enemySide(side) : (side === 'p' ? 'o' : 'p');
      function livingFoes(){
        var arr = (G.team && G.team[foesSide]) || [];
        return (typeof living === 'function') ? living(arr) : arr.filter(function(x){ return x && x.alive; });
      }
      function finish(){
        h.abilityUsed = true;
        if(typeof renderBattle === 'function') renderBattle();
        if(typeof netSync === 'function') netSync('s-battle');
        if(typeof done === 'function') done(); else if(typeof finishAct === 'function') finishAct();
      }

      try{
        // ÉLITE: rival vivo al azar, −15 a todos sus stats el resto del combate.
        if(h.eliteMode){
          var pool = livingFoes();
          if(!pool.length){ finish(); return; }
          var t = pool[Math.floor(Math.random() * pool.length)];
          t._mods = t._mods || [];
          t._mods.push({ cc:-15, ad:-15, he:-15, turns:99 });
          if(typeof pushFx === 'function') pushFx({ k:'status', side: foesSide, id: t.id, txt:'\\u25bc' });
          if(typeof pushLog === 'function') pushLog('li', h.name + ' \\u2014 Monedero Roto: ' + t.name + ' pierde 15 en todos sus stats.');
          finish();
          return;
        }

        function apply(foe, kind){
          if(kind === 'elite'){
            foe.eliteUsed = true;
            foe._bfNoElite = 1;
            if(typeof pushLog === 'function') pushLog('li', h.name + ' bloquea la fase \\u00c9LITE de ' + foe.name + ': cuando caiga, morir\\u00e1 definitivamente.');
          } else {
            foe.abilityUsed = true;
            if(typeof pushLog === 'function') pushLog('li', h.name + ' anula la habilidad de ' + foe.name + ' en su forma actual.');
          }
          if(typeof pushFx === 'function') pushFx({ k:'status', side: foesSide, id: foe.id, txt:'\\u2699\\ufe0f' });
          finish();
        }

        // IA: elige rival y sabotaje al azar, sin diálogo.
        if(typeof humanCtl === 'function' && !humanCtl(side)){
          var p2 = livingFoes();
          if(!p2.length){ finish(); return; }
          apply(p2[Math.floor(Math.random() * p2.length)], Math.random() < 0.5 ? 'elite' : 'abil');
          return;
        }

        pendTarget('Rival a sabotear (Compresor Roto)', foesSide, function(foe){
          askChoice(foe.name, function(kind){ apply(foe, kind); });
        });
      }catch(e){ finish(); }
    };
    return true;
  }

  var n = 0, iv = setInterval(function(){ if(install() || n++ > 200) clearInterval(iv); }, 150);
  install();
})();
</script>
`;