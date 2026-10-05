// Parche inyectado en el iframe: OBJETO "Drenaje" (nº 125).
//
// Pócima de la bruja bizarra y gótica: roba 15 de vida al héroe rival elegido y
// se la da al héroe que usa el objeto (misma mecánica que la habilidad de
// Nixara). Coste 15 monedas (1 moneda por 1 de vida).
//
// El arte, nº, coste y texto se sincronizan desde la BD (Oráculo) mediante
// shopSpellArtPatch.syncAllEquip(). La cinemática 3D usa la imagen de la bruja
// volando en escoba (ability_anim_url de la carta), recortando su fondo negro.
export const DRAIN_OBJECT_PATCH = `
<script>
(function(){
  if (window.__bfDrainObject) return;
  window.__bfDrainObject = true;

  var CINE_ART = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/2f1d55b92_generated_image.png';

  // Recorta el fondo negro de la imagen (transparente con canvas).
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
      var ent = e.data.bfAbilityAnim['ob_drain'];
      if(ent && ent.base){ CINE_ART = ent.base; cutout(CINE_ART); }
    }
  });

  var css = ''+
  '#bf-drain-cine{position:fixed;inset:0;z-index:100006;pointer-events:none;overflow:hidden;animation:bfDrIn .25s ease-out}'+
  '#bf-drain-cine.bf-dr-out{transition:opacity .4s;opacity:0}'+
  '@keyframes bfDrIn{from{opacity:0}to{opacity:1}}'+
  '#bf-drain-cine .bf-dr-veil{position:absolute;inset:0;background:radial-gradient(circle at 50% 45%,rgba(70,10,60,.45),rgba(4,2,10,.78));animation:bfDrVeil 3s ease-out forwards}'+
  '@keyframes bfDrVeil{0%{opacity:0}20%{opacity:1}80%{opacity:.9}100%{opacity:0}}'+
  '#bf-drain-cine .bf-dr-witch{position:absolute;top:14%;left:-38vw;width:min(46vmin,380px);object-fit:contain;filter:drop-shadow(0 0 48px rgba(190,70,255,.9)) saturate(1.25) brightness(1.08);animation:bfDrFly 3.1s cubic-bezier(.36,.05,.5,1) forwards}'+
  '@keyframes bfDrFly{0%{transform:translate(0,0) rotate(-14deg) scale(.6);opacity:0}12%{opacity:1}30%{transform:translate(45vw,16vh) rotate(-6deg) scale(1.05)}52%{transform:translate(78vw,2vh) rotate(6deg) scale(1.15)}72%{transform:translate(48vw,22vh) rotate(-8deg) scale(1.1)}100%{transform:translate(150vw,6vh) rotate(-3deg) scale(.85);opacity:0}}'+
  '#bf-drain-cine .bf-dr-ttl{position:absolute;top:5%;left:50%;transform:translateX(-50%);font-family:Cinzel,serif;font-weight:1000;font-size:clamp(22px,5vw,48px);letter-spacing:3px;white-space:nowrap;color:#ff6ad5;text-shadow:0 0 30px rgba(220,60,200,.95),0 4px 12px #000;opacity:0;animation:bfDrTtl 2.9s ease-out .3s forwards}'+
  '@keyframes bfDrTtl{0%{opacity:0;transform:translateX(-50%) scale(2)}15%{opacity:1;transform:translateX(-50%) scale(1)}82%{opacity:1}100%{opacity:0}}'+
  // Partículas MÁGICAS (orbes arcanos violetas que ascienden + runas brillantes)
  // en vez de gotas de agua/sangre cayendo: el drenaje es un hechizo, no líquido.
  '#bf-drain-cine .bf-dr-rune{position:absolute;font-size:24px;color:#d9a8ff;opacity:0;text-shadow:0 0 14px rgba(180,90,255,.95),0 0 22px rgba(140,50,220,.6);animation:bfDrRune 2.6s ease-out forwards}'+
  '@keyframes bfDrRune{0%{opacity:0;transform:translateY(10px) rotate(0) scale(.4)}22%{opacity:1}60%{transform:translateY(-20vh) rotate(40deg) scale(1.25)}100%{opacity:0;transform:translateY(-44vh) rotate(80deg) scale(.8)}}'+
  '#bf-drain-cine .bf-dr-spark{position:absolute;width:11px;height:11px;border-radius:50%;background:radial-gradient(circle,#f0c8ff,#b06bff 52%,#7a2cff 72%,transparent 78%);box-shadow:0 0 16px rgba(180,90,255,.95),0 0 30px rgba(140,50,220,.55);opacity:0;animation:bfDrSpark 2.4s ease-out forwards}'+
  '@keyframes bfDrSpark{0%{opacity:0;transform:translateY(18px) scale(.4)}18%{opacity:1}55%{transform:translateY(-18vh) scale(1.35)}100%{opacity:0;transform:translateY(-42vh) scale(.7)}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  function playDrainCine(){
    var now = Date.now();
    if(document.getElementById('bf-drain-cine') || (window.__bfDrainLast && now - window.__bfDrainLast < 3000)) return;
    window.__bfDrainLast = now;
    // El objeto se resuelve en este parche (no pasa por el hook de useItem), así
    // que la cinemática 3D de la BD no se lanzaba sola: se pide al motor común
    // (la misma que se ve en el editor). Si no está disponible, se usa el
    // overlay propio como respaldo.
    try{ if(typeof window.__bfPlayItemCine === 'function' && window.__bfPlayItemCine('Drenaje')) return; }catch(e){}
    var ov = document.createElement('div'); ov.id = 'bf-drain-cine';
    var html = '<div class="bf-dr-veil"></div>';
    for(var n = 0; n < 14; n++) html += '<span class="bf-dr-rune" style="left:' + (6 + Math.random()*88) + '%;top:' + (28 + Math.random()*46) + '%;animation-delay:' + (Math.random()*1.6).toFixed(2) + 's">' + (Math.random() < 0.5 ? '\\u2726' : '\\u2727') + '</span>';
    for(var d = 0; d < 22; d++) html += '<span class="bf-dr-spark" style="left:' + (4 + Math.random()*92) + '%;top:' + (16 + Math.random()*44) + '%;animation-delay:' + (Math.random()*1.5).toFixed(2) + 's"></span>';
    html += '<img class="bf-dr-witch" src="' + (CUT[CINE_ART] || CINE_ART) + '" alt="">';
    html += '<div class="bf-dr-ttl">\\u00a1DRENAJE!</div>';
    ov.innerHTML = html;
    document.body.appendChild(ov);
    setTimeout(function(){ ov.classList.add('bf-dr-out'); }, 2800);
    setTimeout(function(){ if(ov.parentNode) ov.parentNode.removeChild(ov); }, 3250);
  }
  window.__bfPlayDrainCine = playDrainCine;

  // --- Inyecta el objeto en OBJECTS (comprable en la tienda de equipo) ---
  function injectObject(){
    if(typeof OBJECTS === 'undefined' || !OBJECTS) return false;
    if(OBJECTS.some(function(o){ return o && o.id === 'ob_drain'; })) return true;
    OBJECTS.push({ id:'ob_drain', name:'Drenaje', kind:'bf_drain', cost:15, num:125, drain:15, txt:'Roba 15 de vida al h\\u00e9roe rival seleccionado y se la da al h\\u00e9roe que utiliza el objeto.' });
    return true;
  }

  function alive(side){
    try{ return (typeof living === 'function') ? living(side) : ((G.team[side]||[]).filter(function(h){ return h && h.alive; })); }
    catch(e){ return []; }
  }

  function resolveDrain(side, item, user){
    var foes = (typeof enemySide === 'function') ? enemySide(side) : (side === 'p' ? 'o' : 'p');
    var pool = alive(foes);
    if(!pool.length){ if(typeof notif === 'function') notif('No hay h\\u00e9roes rivales a los que drenar.'); return; }
    var apply = function(t){
      if(!t || !t.alive) return;
      var amount = Number(item.drain || 15);
      var dealt = (typeof dealDamage === 'function') ? dealDamage(t, amount, { type:'spell', element:'arcano', ignoreShield:true }) : amount;
      var gained = (typeof heal === 'function') ? heal(user, dealt) : 0;
      if(typeof pushFx === 'function'){
        pushFx({ k:'spell', toSide:foes, toId:t.id, el:'arcano' });
        pushFx({ k:'bfdrain', side:side });
        if(gained) pushFx({ k:'heal', side:side, id:user.id, amt:gained });
      }
      if(typeof pushLog === 'function') pushLog('ld', '\\ud83e\\uddea ' + item.name + ': ' + user.name + ' drena ' + dealt + ' de vida a ' + t.name + ' y la absorbe (+' + gained + ').');
      // Consume el objeto de la mano.
      var idx = (G.items[side] || []).indexOf(item);
      if(idx >= 0){
        G.items[side].splice(idx, 1);
        if(typeof window.bfDiscardPush === 'function'){ try{ window.bfDiscardPush(side, { id:item.id, kind:'object', name:item.name, num:item.num }); }catch(e){} }
      }
      playDrainCine();
      if(typeof renderBattle === 'function') renderBattle();
      if(typeof netSync === 'function') netSync('s-battle');
      if(typeof finishAct === 'function') finishAct();
    };
    var human = (typeof window.bfAbilityHuman === 'function') ? window.bfAbilityHuman(side) : (typeof humanCtl === 'function' && humanCtl(side));
    if(human && typeof pendTarget === 'function'){
      pendTarget('Rival al que drenar la vida', foes, apply);
    } else {
      apply(pool.sort(function(a, b){ return a.hp - b.hp; })[0]);
    }
  }

  function hookUse(){
    if(window.__bfOnce__bfDrain_useItem||typeof window.useItem!=='function')return false; window.__bfOnce__bfDrain_useItem=1;   /* instalación única: reinstalarse apilaba capas sin fin ("Maximum call stack") */
    var orig = window.useItem;
    var wrapped = function(idx){
      try{
        var side = (typeof B !== 'undefined' && B && B.current) ? B.current.side : 'p';
        var item = ((typeof G !== 'undefined' && G.items && G.items[side]) || [])[idx];
        if(item && item.kind === 'bf_drain'){
          // El invitado no resuelve: el original manda la intenci\\u00f3n al host.
          if(typeof NET !== 'undefined' && NET && NET.role === 'client') return orig.apply(this, arguments);
          var user = (typeof getHero === 'function') ? getHero(side, B.current.id) : null;
          if(!user) return;
          resolveDrain(side, item, user);
          return;
        }
      }catch(e){}
      return orig.apply(this, arguments);
    };
    wrapped.__bfDrain = 1;
    window.useItem = wrapped;
    return true;
  }

  function hookUseAI(){
    if(window.__bfOnce__bfDrain_useItem_AI||typeof window.useItem_AI!=='function')return false; window.__bfOnce__bfDrain_useItem_AI=1;   /* instalación única: reinstalarse apilaba capas sin fin ("Maximum call stack") */
    var orig = window.useItem_AI;
    var wrapped = function(side, idx){
      try{
        var item = ((typeof G !== 'undefined' && G.items && G.items[side]) || [])[idx];
        if(item && item.kind === 'bf_drain'){
          var user = (typeof B !== 'undefined' && B && B.current && B.current.side === side && typeof getHero === 'function') ? getHero(side, B.current.id) : alive(side)[0];
          if(!user) return;
          resolveDrain(side, item, user);
          return;
        }
      }catch(e){}
      return orig.apply(this, arguments);
    };
    wrapped.__bfDrain = 1;
    window.useItem_AI = wrapped;
    return true;
  }

  // Cinemática también en el rival online (llega por flushFx).
  function hookFlush(){
    if(window.__bfOnce__bfDrain_flushFx||typeof window.flushFx!=='function')return false; window.__bfOnce__bfDrain_flushFx=1;   /* instalación única: reinstalarse apilaba capas sin fin ("Maximum call stack") */
    var orig = window.flushFx;
    window.flushFx = function(list){
      try{ (list || []).forEach(function(ev){ if(ev && ev.k === 'bfdrain') playDrainCine(); }); }catch(e){}
      return orig.apply(this, arguments);
    };
    window.flushFx.__bfDrain = 1;
    return true;
  }

  var tries = 0, iv = setInterval(function(){
    injectObject(); hookUse(); hookUseAI(); hookFlush();
    if(tries++ > 200) clearInterval(iv);
  }, 300);
})();
</script>
`;