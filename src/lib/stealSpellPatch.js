// Parche inyectado en el iframe: hechizo "El Ladrón Enmascarado" (nº 124).
// Roba una carta AL AZAR de la mano del rival (hechizo u objeto) y la añade a
// tu mano. Se inyecta en SPELLS (comprable en la tienda de equipamiento),
// engancha castSpell para su kind 'bf_steal' y lanza una cinemática 3D que se
// ve en los dos jugadores online (vía flushFx).
//
// El arte, nº, maná, coste y texto se sincronizan desde la BD (Oráculo) con
// shopSpellArtPatch.syncAllEquip() — sistema genérico para cualquier carta.
export const STEAL_SPELL_PATCH = `
<script>
(function(){
  if (window.__bfStealSpell) return;
  window.__bfStealSpell = true;

  var CINE_ART = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/f40d33dc7_generated_image.png';

  // Recorta el fondo negro (canvas → transparente) para que solo quede la
  // figura, igual que Transformer / Reanimación Arcana.
  var CUT = {};
  function cutout(url){
    if(!url || CUT[url] !== undefined) return;
    CUT[url] = false;
    var img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = function(){
      try{
        var c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
        var x = c.getContext('2d'); x.drawImage(img, 0, 0);
        var d = x.getImageData(0, 0, c.width, c.height), p = d.data;
        for(var i = 0; i < p.length; i += 4){
          var m = Math.max(p[i], p[i+1], p[i+2]);
          if(m < 32) p[i+3] = 0;
          else if(m < 90) p[i+3] = Math.round(p[i+3] * (m - 32) / 58);
        }
        x.putImageData(d, 0, 0);
        CUT[url] = c.toDataURL('image/png');
      }catch(e){ CUT[url] = false; }
    };
    img.onerror = function(){ CUT[url] = false; };
    img.src = url;
  }
  cutout(CINE_ART);
  window.addEventListener('message', function(e){
    if(e.data && e.data.bfAbilityAnim && typeof e.data.bfAbilityAnim === 'object'){
      var ent = e.data.bfAbilityAnim['sp_steal'];
      if(ent && ent.base){ CINE_ART = ent.base; cutout(CINE_ART); }
    }
  });

  var css = ''+
  '#bf-steal-cine{position:fixed;inset:0;z-index:100006;pointer-events:none;overflow:hidden;perspective:900px;animation:bfStIn .3s ease-out}'+
  '#bf-steal-cine.bf-st-out{transition:opacity .4s;opacity:0}'+
  '@keyframes bfStIn{from{opacity:0}to{opacity:1}}'+
  '#bf-steal-cine .bf-st-img{position:absolute;top:22%;left:50%;width:min(48vmin,400px);height:min(48vmin,400px);object-fit:contain;transform-style:preserve-3d;margin:0 0 0 calc(min(48vmin,400px)/-2);filter:drop-shadow(0 0 60px rgba(120,255,190,.8)) saturate(1.3) brightness(1.12);animation:bfStImg 3s cubic-bezier(.2,.85,.3,1) forwards}'+
  '@media(max-width:900px){#bf-steal-cine .bf-st-img{width:min(40vmin,300px);height:min(40vmin,300px);margin:0 0 0 calc(min(40vmin,300px)/-2)}}'+
  '@keyframes bfStImg{0%{transform:translateX(-60vw) rotateY(38deg) scale(.5);opacity:0}18%{opacity:1}42%{transform:translateX(0) rotateY(-12deg) scale(1.12)}64%{transform:translateX(3vw) rotateY(6deg) scale(1.16)}100%{transform:translateX(0) rotateY(0) scale(1.2);opacity:1}}'+
  '#bf-steal-cine .bf-st-ttl{position:absolute;top:4%;left:50%;transform:translateX(-50%);font-family:Cinzel,serif;font-weight:1000;font-size:clamp(20px,4.6vw,44px);letter-spacing:3px;white-space:nowrap;opacity:0;animation:bfStTtl 2.8s ease-out .3s forwards;color:#8affc4;text-shadow:0 0 28px rgba(90,255,180,.9),0 4px 12px #000}'+
  '@keyframes bfStTtl{0%{opacity:0;transform:translateX(-50%) scale(2)}15%{opacity:1;transform:translateX(-50%) scale(1)}82%{opacity:1}100%{opacity:0}}'+
  '#bf-steal-cine .bf-st-flash{position:absolute;inset:0;background:radial-gradient(circle,rgba(120,255,190,.5),transparent 65%);animation:bfStFlash .7s ease-out .25s both}'+
  '@keyframes bfStFlash{0%{opacity:0}30%{opacity:1}100%{opacity:0}}'+
  '#bf-steal-cine .bf-st-veil{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.55),rgba(0,0,0,.15),rgba(0,0,0,.55));animation:bfStVeil 2.4s ease-out forwards}'+
  '@keyframes bfStVeil{0%{opacity:0}25%{opacity:.85}100%{opacity:0}}'+
  '.bf-st-card{position:absolute;width:46px;height:64px;border-radius:6px;background:linear-gradient(160deg,#2b1c4a,#120a20);border:2px solid rgba(150,255,205,.85);box-shadow:0 0 16px rgba(120,255,190,.7);opacity:0;animation:bfStCard 1.8s cubic-bezier(.25,.8,.3,1) forwards}'+
  '@keyframes bfStCard{0%{opacity:0;transform:translate(0,0) rotate(0) scale(.6)}20%{opacity:1}100%{opacity:0;transform:translate(var(--dx,0px),var(--dy,-40vh)) rotate(var(--rot,240deg)) scale(1.1)}}'+
  '.bf-st-spark{position:absolute;width:5px;height:5px;border-radius:50%;background:#c7ffe6;box-shadow:0 0 12px #8affc4;opacity:0;animation:bfStSpark 2s ease-out forwards}'+
  '@keyframes bfStSpark{0%{opacity:0;transform:translateY(0) scale(.4)}18%{opacity:1}100%{opacity:0;transform:translateY(-70vh) translateX(var(--dx,0px)) scale(1.3)}}'+
  '.bf-st-ring{position:absolute;left:50%;top:22%;transform:translate(-50%,-50%);border-radius:50%;border:3px solid #7affc0;box-shadow:0 0 22px rgba(120,255,190,.8);opacity:0;animation:bfStRing 1.5s ease-out forwards}'+
  '@keyframes bfStRing{0%{width:10%;height:10%;opacity:1;border-width:4px}100%{width:250%;height:250%;opacity:0;border-width:1px}}'+
  '#bf-steal-cine .bf-st-loot{position:absolute;left:50%;bottom:14%;transform:translateX(-50%);padding:7px 18px;border-radius:999px;background:rgba(8,5,14,.9);border:2px solid #7affc0;color:#eafff5;font-family:Cinzel,serif;font-weight:1000;font-size:clamp(12px,2.4vw,18px);letter-spacing:.6px;white-space:nowrap;opacity:0;animation:bfStLoot 2.6s ease-out .55s forwards;text-shadow:0 2px 6px #000}'+
  '@keyframes bfStLoot{0%{opacity:0;transform:translateX(-50%) translateY(14px) scale(.85)}18%{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}84%{opacity:1}100%{opacity:0}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function playStealCine(loot){
    var now = Date.now();
    if(document.getElementById('bf-steal-cine') || (window.__bfStealLast && now - window.__bfStealLast < 3000)) return;
    window.__bfStealLast = now;
    var ov = document.createElement('div'); ov.id = 'bf-steal-cine';
    var html = '<div class="bf-st-veil"></div><div class="bf-st-flash"></div>';
    for(var r = 0; r < 4; r++) html += '<div class="bf-st-ring" style="animation-delay:' + (r*0.22).toFixed(2) + 's"></div>';
    for(var c = 0; c < 12; c++) html += '<span class="bf-st-card" style="left:' + (8+Math.random()*84) + '%;top:' + (35+Math.random()*40) + '%;--dx:' + ((Math.random()*260-130)|0) + 'px;--dy:-' + (30+Math.random()*40) + 'vh;--rot:' + ((Math.random()*520-260)|0) + 'deg;animation-delay:' + (Math.random()*1.1).toFixed(2) + 's"></span>';
    for(var s = 0; s < 16; s++) html += '<span class="bf-st-spark" style="left:' + (4+Math.random()*92) + '%;bottom:6%;--dx:' + ((Math.random()*120-60)|0) + 'px;animation-delay:' + (Math.random()*1.2).toFixed(2) + 's"></span>';
    html += '<img class="bf-st-img" src="' + (CUT[CINE_ART] || CINE_ART) + '" alt="">';
    html += '<div class="bf-st-ttl">\\u00a1EL LADR\\u00d3N ENMASCARADO!</div>';
    if(loot) html += '<div class="bf-st-loot">\\ud83c\\udccf Carta robada: ' + loot + '</div>';
    ov.innerHTML = html;
    document.body.appendChild(ov);
    setTimeout(function(){ ov.classList.add('bf-st-out'); }, 2700);
    setTimeout(function(){ if(ov.parentNode) ov.parentNode.removeChild(ov); }, 3150);
  }
  window.__bfPlayStealCine = playStealCine;

  function injectSpell(){
    if(typeof SPELLS === 'undefined' || !SPELLS) return false;
    if(SPELLS.some(function(s){ return s && s.id === 'sp_steal'; })) return true;
    SPELLS.push({ id:'sp_steal', name:'El Ladr\\u00f3n Enmascarado', element:'arcano', kind:'bf_steal', base:1, mana:12, cost:18, foil:true, num:124, txt:'Roba una carta al azar de la mano del rival y la a\\u00f1ade a tu mano.' });
    return true;
  }

  // Roba una carta al azar de la mano rival: hechizos (G.spellbook) u objetos
  // (G.items). Devuelve el nombre de la carta robada, o '' si no había ninguna.
  function stealRandom(side){
    var foe = side === 'p' ? 'o' : 'p';
    var pool = [];
    ((G.spellbook && G.spellbook[foe]) || []).forEach(function(id, i){ pool.push({ t:'s', i:i, id:id }); });
    ((G.items && G.items[foe]) || []).forEach(function(o, i){ if(o) pool.push({ t:'o', i:i, o:o }); });
    if(!pool.length) return '';
    var pick = pool[Math.floor(Math.random() * pool.length)];
    if(pick.t === 's'){
      G.spellbook[foe].splice(pick.i, 1);
      if(!G.spellbook[side]) G.spellbook[side] = [];
      G.spellbook[side].push(pick.id);
      var sp = (typeof byId === 'function' && typeof SPELLS !== 'undefined') ? byId(SPELLS, pick.id) : null;
      return (sp && sp.name) || 'Hechizo';
    }
    G.items[foe].splice(pick.i, 1);
    if(!G.items[side]) G.items[side] = [];
    G.items[side].push(pick.o);
    return pick.o.name || 'Objeto';
  }
  window.__bfStealFromRival = stealRandom;

  var H = {};
  function hookCast(){
    if(typeof window.castSpell !== 'function' || H.cast) return;
    H.cast = 1;
    var orig = window.castSpell;
    window.castSpell = function(id){
      try{
        var s = (typeof SPELLS !== 'undefined') ? byId(SPELLS, id) : null;
        if(s && s.kind === 'bf_steal'){
          if(typeof NET !== 'undefined' && NET.role === 'client'){ sendIntent('castSpell', { id: id }); return; }
          var side = (typeof B !== 'undefined' && B && B.current) ? B.current.side : 'p';
          var h = (typeof getHero === 'function') ? getHero(side, (B && B.current) ? B.current.id : null) : null;
          if(!h) return;
          if(h.mana < s.mana){ if(typeof notif === 'function') notif('Man\\u00e1 insuficiente'); return; }
          if(typeof G === 'undefined' || !G) return;
          var loot = stealRandom(side);
          if(!loot){ if(typeof notif === 'function') notif('El rival no tiene cartas en la mano.'); return; }
          h.mana -= s.mana;
          if(typeof pushLog === 'function') pushLog('lx', '\\ud83c\\udccf ' + h.name + ' roba ' + loot + ' de la mano del rival.');
          if(typeof pushFx === 'function'){
            pushFx({ k:'bfcard', name:s.name, kind:'spell', side:side });
            pushFx({ k:'bfsteal', side:side, name:loot });
          }
          if(typeof notif === 'function') notif(loot + ' \\u2192 tu mano');
          if(typeof finishAct === 'function') finishAct();
          return;
        }
      }catch(e){}
      return orig.apply(this, arguments);
    };
  }

  function hookFlush(){
    if(typeof window.flushFx !== 'function' || H.flush) return;
    H.flush = 1;
    var orig = window.flushFx;
    window.flushFx = function(list){
      try{
        (list || []).forEach(function(ev){ if(ev && ev.k === 'bfsteal'){ try{ playStealCine(ev.name); }catch(e){} } });
      }catch(e){}
      return orig.apply(this, arguments);
    };
  }

  function hook(){ hookCast(); hookFlush(); }
  hook();
  var iv = setInterval(function(){ injectSpell(); hook(); }, 300);
  setTimeout(function(){ if(H.cast && H.flush) clearInterval(iv); }, 12000);
})();
</script>
`;