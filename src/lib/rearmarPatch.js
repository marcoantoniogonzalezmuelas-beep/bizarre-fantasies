// Parche inyectado en el iframe: objeto "Rearmar".
// - Solo se puede jugar si hay armas en la pila de descartes Y al menos un
//   héroe vivo con el hueco libre para alguna de esas armas. Si no cumple
//   ambas condiciones, la carta se muestra en gris y no se puede jugar.
// - Al hacer clic se lanza una cinemática 3D (imagen spectral armory) y luego
//   se elige al héroe que la equipará.
// - Al elegir héroe: efecto visual de la carta del arma recuperada volando
//   desde el centro hasta el recuadro del héroe y un flash de equipamiento.
export const REARMAR_PATCH = `
<script>
(function(){
  if (window.__bfRearmarPatch) return;
  window.__bfRearmarPatch = true;

  // Imagen 3D de la cinemática de Rearmar (armería espectral).
  // Imagen de la cinemática: la que tiene asignada Rearmar en el EDITOR (animación de su ficha, ob_rearm), que llega
  // con el mapa de animaciones de la página. La fija de antes queda solo como respaldo si no tiene ninguna asignada
  // (antes se usaba SIEMPRE la fija y se ignoraba la del editor).
  var CINE_URL = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/5e19f1cf9_generated_image.png';
  // Recorte del fondo negro (igual que el resto de animaciones de habilidad).
  var CUT = {};
  function cutout(url){
    if(!url || CUT[url] !== undefined) return;
    CUT[url] = false;
    var img = new Image(); img.crossOrigin = 'anonymous';
    img.onload = function(){
      try{
        var c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
        var x = c.getContext('2d'); x.drawImage(img, 0, 0);
        var d = x.getImageData(0, 0, c.width, c.height), p = d.data, kept = 0, total = p.length / 4;
        for(var i = 0; i < p.length; i += 4){ var m = Math.max(p[i], p[i+1], p[i+2]); if(m < 22) p[i+3] = 0; else kept++; }
        if(kept < total * 0.15){ CUT[url] = false; return; }
        x.putImageData(d, 0, 0);
        CUT[url] = c.toDataURL('image/png');
      }catch(e){ CUT[url] = false; }
    };
    img.onerror = function(){ CUT[url] = false; };
    img.src = url;
  }
  cutout(CINE_URL);
  window.addEventListener('message', function(e){
    if(e.data && e.data.bfAbilityAnim && typeof e.data.bfAbilityAnim === 'object'){
      var ent = e.data.bfAbilityAnim['ob_rearm'];
      var url = ent && (ent.base || ent.elite);
      if(url){ CINE_URL = url; cutout(CINE_URL); }
    }
  });

  var REARMAR_NAMES = ['Rearmar', 'Rearmar'];

  // ---- CSS: chip grisearlo + cinemática 3D + efecto de carta volando ----
  var css = [
    // Chip Rearmar deshabilitado: mismo estilo que bf-chip-no-mana (gris + sin
    // botón de jugar). El selector coincide con los chips reales del juego
    // (.chip.bf-chip-card) y se aplica solo cuando la pila de descartes no
    // tiene armas o ningún héroe vivo con hueco libre.
    '.chip.bf-chip-card.bf-chip-no-rearm{filter:grayscale(.9) brightness(.5)!important;opacity:.55!important}',
    '.chip.bf-chip-card.bf-chip-no-rearm .bf-chip-play{display:none!important}',
    // Cinemática 3D de Rearmar (mismo estilo que abilityAnimPatch).
    '#bf-rearm-cine{position:fixed;inset:0;z-index:100007;pointer-events:none;overflow:hidden;perspective:900px;animation:bfRmIn .3s ease-out}',
    '#bf-rearm-cine.bf-rc-out{transition:opacity .4s;opacity:0}',
    '@keyframes bfRmIn{from{opacity:0}to{opacity:1}}',
    '#bf-rearm-cine .bf-rc-dim{position:absolute;inset:0;background:radial-gradient(circle at 50% 52%,transparent 24%,rgba(0,0,0,.55) 62%,rgba(0,0,0,.78) 100%);animation:bfRcDim .5s ease-out both}',
    '@keyframes bfRcDim{from{opacity:0}to{opacity:1}}',
    '#bf-rearm-cine .bf-rc-glow{position:absolute;top:50%;left:50%;width:min(80vmin,700px);height:min(80vmin,700px);transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,rgba(255,210,74,.22) 0%,transparent 68%);opacity:0;animation:bfRcGlow .6s ease-out .05s both}',
    '@keyframes bfRcGlow{0%{opacity:0;transform:translate(-50%,-50%) scale(.6)}100%{opacity:1;transform:translate(-50%,-50%) scale(1)}}',
    '#bf-rearm-cine .bf-rc-img{position:absolute;top:50%;left:50%;width:min(74vmin,640px);height:min(78vmin,680px);object-fit:contain;transform-origin:center;transform-style:preserve-3d;margin:calc(min(78vmin,680px)/-2) 0 0 calc(min(74vmin,640px)/-2);opacity:1;z-index:5;filter:drop-shadow(0 16px 38px rgba(0,0,0,.8));animation:bfRmImg 4.5s cubic-bezier(.2,.85,.3,1) forwards}',
    '@keyframes bfRmImg{0%{opacity:0;transform:translateZ(-400px) rotateY(-25deg) scale(.5)}15%{opacity:1;transform:translateZ(0) rotateY(0deg) scale(1.1)}30%{transform:translateZ(0) rotateY(0deg) scale(1)}82%{opacity:1;transform:translateZ(0) rotateY(0deg) scale(1.02)}100%{opacity:0;transform:translateZ(-200px) rotateY(15deg) scale(1.15)}}',
    '@media(max-width:900px){#bf-rearm-cine .bf-rc-img{width:min(60vmin,460px);height:min(64vmin,480px);margin:calc(min(64vmin,480px)/-2) 0 0 calc(min(60vmin,460px)/-2)}}',
    '#bf-rearm-cine .bf-rc-ttl{position:absolute;top:7%;left:50%;transform:translateX(-50%);font-family:Cinzel,serif;font-weight:1000;font-size:clamp(22px,5vw,48px);letter-spacing:4px;white-space:nowrap;opacity:0;animation:bfRmTtl 4.2s ease-out .3s forwards;color:#ffd24a;text-shadow:0 0 28px rgba(255,210,74,.6),0 4px 12px #000}',
    '@keyframes bfRmTtl{0%{opacity:0;transform:translateX(-50%) scale(2)}15%{opacity:1;transform:translateX(-50%) scale(1)}82%{opacity:1}100%{opacity:0;transform:translateX(-50%) scale(1.1)}}',
    '#bf-rearm-cine .bf-rc-flash{position:absolute;inset:0;background:radial-gradient(circle,rgba(255,210,74,.7),transparent 65%);animation:bfRmFlash .7s ease-out .25s both}',
    '@keyframes bfRmFlash{0%{opacity:0}30%{opacity:1}100%{opacity:0}}',
    '.bf-rc-spark{position:absolute;bottom:10%;width:4px;height:4px;border-radius:50%;background:#ffd24a;box-shadow:0 0 8px #ffd24a,0 0 14px rgba(255,210,74,.6);opacity:0;animation:bfRmSpark 2s ease-out forwards}',
    '@keyframes bfRmSpark{0%{opacity:0;transform:translateY(0) scale(.3)}15%{opacity:1}100%{opacity:0;transform:translateY(-85vh) scale(1.4) translateX(var(--dx,0px))}}',
    // Carta del arma volando hacia el héroe.
    '.bf-fly-card{position:fixed;z-index:100008;pointer-events:none;width:140px;height:196px;border-radius:14px;border:3px solid #ffd24a;background:#0b0714 center/cover no-repeat;box-shadow:0 0 28px rgba(255,210,74,.9),0 12px 30px rgba(0,0,0,.8);transform:translate(-50%,-50%)}',
    '.bf-equip-flash{position:fixed;z-index:100006;pointer-events:none;width:200px;height:200px;border-radius:50%;transform:translate(-50%,-50%);background:radial-gradient(circle,rgba(255,210,74,.85),transparent 65%);animation:bfEquipFlash 1.2s ease-out forwards}',
    '@keyframes bfEquipFlash{0%{opacity:0;transform:translate(-50%,-50%) scale(.3)}30%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(2.2)}}'
  ].join('');
  var st = document.createElement('style');
  st.textContent = css;
  document.head.appendChild(st);

  // Añade el objeto "Rearmar" al array OBJECTS del juego.
  function ensureRearmarObject(){
    if (typeof OBJECTS === 'undefined' || !OBJECTS) return false;
    if (OBJECTS.some(function(o){ return o && o.id === 'ob_rearm'; })) return true;
    OBJECTS.push({
      id: 'ob_rearm',
      name: 'Rearmar',
      kind: 'bf_rearm',
      element: 'arcano',
      type: 'arcano',
      tag: 'arcano',
      cost: 8,
      num: 118,
      txt: 'Coge un arma de tu pila de descartes y la equipa en el h\\u00e9roe que elijas.',
      desc: 'Coge un arma de tu pila de descartes y la equipa en el h\\u00e9roe que elijas.'
    });
    try {
      if (typeof G !== 'undefined' && G && G.eqSide && typeof window.renderEquip === 'function') {
        window.renderEquip(G.eqSide);
      }
    } catch(e){}
    return true;
  }
  var objTries = 0, objIv = setInterval(function(){ if(ensureRearmarObject() || objTries++ > 160) clearInterval(objIv); }, 200);

  function clone(o){ try{ return (typeof deep==='function')?deep(o):JSON.parse(JSON.stringify(o)); }catch(e){ return null; } }
  function team(side){ try{ return (G && G.team && G.team[side]) || []; }catch(e){ return []; } }
  function alive(side){ return team(side).filter(function(h){ return h && h.alive; }); }
  function freeSlot(h, slot){ return !!(h && h.alive && !h[slot]); }
  function hasWeapon(h){ return !!(h && (h.mwep || h.rwep)); }
  // UN SOLO ARMA por héroe (de momento ningún héroe puede llevar dos): al ponerle un arma, la que llevara —sea
  // cuerpo a cuerpo o a distancia— va a la pila de descartes.
  function dropWeapons(side, hero){
    ['mwep','rwep'].forEach(function(s){
      var old = hero && hero[s];
      if(!old) return;
      try{ if(!G.itemDescarte) G.itemDescarte = {p:[],o:[]}; if(!G.itemDescarte[side]) G.itemDescarte[side] = []; G.itemDescarte[side].push({ id:old.id, kind:s, name:old.name, num:old.num||0 }); }catch(e){}
      hero[s] = null;
      if(typeof pushLog==='function') pushLog('li', hero.name + ' deja ' + (old.name||'su arma') + ' en los descartes (solo se puede llevar un arma).');
    });
  }

  function tplFor(slot, id){
    var arr = slot==='mwep' ? (typeof MELEE!=='undefined'?MELEE:[])
            : slot==='rwep' ? (typeof RANGED!=='undefined'?RANGED:[])
            : (typeof ARMORS!=='undefined'?ARMORS:[]);
    return (typeof byId==='function') ? byId(arr, id) : null;
  }
  function refreshGear(side, id){
    try{
      var card = document.getElementById('b_' + side + '_' + id);
      if(!card) return;
      card.removeAttribute('data-bf-gear');
      var row = card.querySelector('.bf-battle-gear');
      if(row) row.remove();
    }catch(e){}
  }

  // ¿Hay armas en la pila de descartes del lado?
  function discardHasWeapons(side){
    try{
      var pile = (G.itemDescarte && G.itemDescarte[side]) || [];
      for(var i = 0; i < pile.length; i++){
        if(pile[i] && (pile[i].kind === 'mwep' || pile[i].kind === 'rwep')) return true;
      }
    }catch(e){}
    return false;
  }

  // ¿Se PUEDE jugar Rearmar? Necesita: armas en el descarte Y al menos un
  // héroe vivo con el hueco libre para alguna de esas armas.
  function canRearmar(side){
    try{
      var pile = (G.itemDescarte && G.itemDescarte[side]) || [];
      var heroes = alive(side);
      if(!pile.length || !heroes.length) return false;
      for(var i = 0; i < pile.length; i++){
        var entry = pile[i];
        if(!entry || (entry.kind !== 'mwep' && entry.kind !== 'rwep')) continue;
        // Cualquier héroe vivo puede recibirla: si ya lleva un arma, la cambia por esta.
        return true;
      }
    }catch(e){}
    return false;
  }

  // ---- GRISEARLO: marca el chip Rearmar de la mano como deshabilitado ----
  function updateChipState(){
    try{
      var side = (pSide)();
      var can = canRearmar(side);
      var chips = document.querySelectorAll('#hand_'+side+' .chip.bf-chip-card');
      chips.forEach(function(chip){
        var nameEl = chip.querySelector('.bf-chip-name');
        var name = nameEl ? nameEl.textContent.trim() : '';
        if(REARMAR_NAMES.indexOf(name) >= 0){
          if(can) chip.classList.remove('bf-chip-no-rearm');
          else chip.classList.add('bf-chip-no-rearm');
        }
      });
    }catch(e){}
  }
  function pSide(){ try{ if(typeof NET!=='undefined'&&NET&&NET.role==='client'&&NET.mySide) return NET.mySide; }catch(e){} return (typeof B!=='undefined'&&B&&B.current)?B.current.side:'p'; }
  setInterval(updateChipState, 400);

  // ---- Cinemática 3D de Rearmar ----
  function playRearmarCinematic(cb){
    // Si hay una cinemática ya en curso, espera.
    if(document.querySelector('#bf-rearm-cine')){ setTimeout(function(){ playRearmarCinematic(cb); }, 500); return; }
    // Respeta el flag global de cinemáticas desactivadas: sin cinemática 3D,
    // se muestra la carta revelada en el centro del tablero (como cualquier
    // otra carta jugada) antes de continuar con la elección de héroe.
    if(window.__bfNoCinematics){
      try{
        var side = (typeof B!=='undefined' && B && B.current) ? B.current.side : 'p';
        if(typeof pushFx==='function') pushFx({ k:'bfcard', name:'Rearmar', kind:'object', side:side });
      }catch(e){}
      setTimeout(cb, 1100);
      return;
    }
    var ov = document.createElement('div');
    ov.id = 'bf-rearm-cine';
    var html = '<div class="bf-rc-dim"></div><div class="bf-rc-glow"></div><div class="bf-rc-flash"></div>';
    for(var sp = 0; sp < 14; sp++) html += '<span class="bf-rc-spark" style="left:'+(4+Math.random()*92).toFixed(0)+'%;--dx:'+((Math.random()*100-50).toFixed(0))+'px;animation-delay:'+(Math.random()*1.2).toFixed(2)+'s"></span>';
    html += '<img class="bf-rc-img" src="'+(CUT[CINE_URL] || CINE_URL)+'" alt="">';
    html += '<div class="bf-rc-ttl">REARMAR</div>';
    ov.innerHTML = html;
    (window.__bfAppend || function(n){ document.body.appendChild(n); })(ov);
    // Fija __bfCardCineName para que cardPlayRevealPatch no solape la carta revelada.
    window.__bfCardCineName = 'Rearmar';
    setTimeout(function(){ window.__bfCardCineName = null; }, 4200);
    setTimeout(function(){ ov.classList.add('bf-rc-out'); }, 4000);
    setTimeout(function(){
      if(ov.parentNode) ov.parentNode.removeChild(ov);
      cb();
    }, 4500);
  }

  // ---- Efecto visual: carta del arma volando hacia el héroe + flash ----
  function weaponArtUrl(entry){
    try{
      // Busca el arte del arma en el mapa de arte del padre o en los arrays del juego.
      if(window.__bfWpnArt && window.__bfWpnArt[entry.name]) return window.__bfWpnArt[entry.name];
      var slot = entry.kind;
      var arr = slot==='mwep' ? (typeof MELEE!=='undefined'?MELEE:[]) : (typeof RANGED!=='undefined'?RANGED:[]);
      var tpl = (typeof byId==='function') ? byId(arr, entry.id) : null;
      if(tpl && tpl.art_url) return tpl.art_url;
      // Fallback: mapa de arte de cartas (art_url por nombre).
      if(window.__bfCardArtMap && window.__bfCardArtMap[entry.name]) return window.__bfCardArtMap[entry.name];
    }catch(e){}
    return null;
  }
  function flyWeaponToHero(side, hero, entry, onDone){
    var art = weaponArtUrl(entry);
    var target = document.getElementById('b_' + side + '_' + hero.id);
    if(!target){ onDone(); return; }
    var tr = target.getBoundingClientRect();
    var tx = tr.left + tr.width/2, ty = tr.top + tr.height/2;
    var cx = window.innerWidth/2, cy = window.innerHeight/2;

    var card = document.createElement('div');
    card.className = 'bf-fly-card';
    if(art){ card.style.backgroundImage = 'url("'+art+'")'; }
    else { card.style.background = 'linear-gradient(135deg,#3c3158,#1a0f2e)'; card.style.display = 'flex'; card.style.alignItems = 'center'; card.style.justifyContent = 'center'; card.style.fontSize = '40px'; card.textContent = entry.kind==='mwep' ? '⚔️' : '🏹'; }
    card.style.left = cx + 'px';
    card.style.top = cy + 'px';
    (window.__bfAppend || function(n){ document.body.appendChild(n); })(card);

    // Animación: la carta crece, gira y vuela hacia el héroe.
    card.animate([
      { left: cx+'px', top: cy+'px', opacity: 0, transform: 'translate(-50%,-50%) scale(.3) rotate(-20deg)' },
      { left: cx+'px', top: cy+'px', opacity: 1, transform: 'translate(-50%,-50%) scale(1.2) rotate(8deg)', offset: .2 },
      { left: cx+'px', top: cy+'px', opacity: 1, transform: 'translate(-50%,-50%) scale(1) rotate(0deg)', offset: .35 },
      { left: tx+'px', top: ty+'px', opacity: 1, transform: 'translate(-50%,-50%) scale(.7) rotate(15deg)', offset: .85 },
      { left: tx+'px', top: ty+'px', opacity: 0, transform: 'translate(-50%,-50%) scale(.5) rotate(25deg)' }
    ], { duration: 1800, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' });

    setTimeout(function(){
      if(card.parentNode) card.parentNode.removeChild(card);
      // Flash de equipamiento en el héroe.
      var flash = document.createElement('div');
      flash.className = 'bf-equip-flash';
      flash.style.left = tx + 'px';
      flash.style.top = ty + 'px';
      (window.__bfAppend || function(n){ document.body.appendChild(n); })(flash);
      setTimeout(function(){ if(flash.parentNode) flash.parentNode.removeChild(flash); }, 1200);
      onDone();
    }, 1800);
  }

  function equipOn(side, hero, entry){
    var slot = entry.kind;
    var tpl = tplFor(slot, entry.id);
    var gear = tpl ? clone(tpl) : null;
    if(!gear){ if(typeof notif==='function') notif('No se pudo equipar el arma recuperada.'); return false; }
    dropWeapons(side, hero);
    hero[slot] = gear;
    if(typeof pushLog==='function') pushLog('lg', '\\u2694\\ufe0f Rearmar: ' + hero.name + ' se equipa ' + gear.name + ' (de la pila de descartes).');
    if(typeof pushFx==='function') pushFx({ k:'shieldup', toSide:side, toId:hero.id });
    if(typeof notif==='function') notif(gear.name + ' \\u2192 ' + hero.name);
    refreshGear(side, hero.id);
    if(typeof renderBattle==='function') renderBattle();
    if(typeof netSync==='function') netSync('s-battle');
    return true;
  }

  // Saca un ARMA de la pila de descartes del jugador (la primera que encuentre).
  function popWeaponFromDiscard(side){
    try{
      if(typeof window.bfDiscardPop !== 'function') return null;
      var pile = (G.itemDescarte && G.itemDescarte[side]) || [];
      var idx = -1;
      for(var i = 0; i < pile.length; i++){
        if(pile[i] && (pile[i].kind === 'mwep' || pile[i].kind === 'rwep')){ idx = i; break; }
      }
      if(idx < 0) return null;
      var entry = pile[idx];
      pile.splice(idx, 1);
      window.__bfDiscardJust = side;
      return entry;
    }catch(e){ return null; }
  }

  function hook(){
    if(typeof window.useItem !== 'function' || window.useItem.__bfRearmar) return false;
    var orig = window.useItem;
    var wrapped = function(idx){
      try{
        var side = (typeof B!=='undefined' && B && B.current) ? B.current.side : 'p';
        var item = ((typeof G!=='undefined' && G.items && G.items[side]) || [])[idx];
        if(item && item.kind === 'bf_rearm'){
          // El invitado no resuelve nada: el original manda la intención al host.
          if(typeof NET!=='undefined' && NET && NET.role==='client') return orig.apply(this, arguments);

          // Doble check: necesita armas en el descarte Y un héroe con hueco libre.
          if(!discardHasWeapons(side)){
            if(typeof notif==='function') notif('No hay armas en tu pila de descartes.');
            return;
          }
          if(!canRearmar(side)){
            if(typeof notif==='function') notif('No tienes h\\u00e9roes vivos a los que ponerle el arma.');
            return;
          }
          var entry = popWeaponFromDiscard(side);
          if(!entry){
            if(typeof notif==='function') notif('No hay armas en tu pila de descartes.');
            return;
          }
          var slot = entry.kind;
          var hero = (typeof getHero==='function') ? getHero(side, B.current.id) : null;
          var cands = alive(side);
          if(!cands.length){
            if(typeof notif==='function') notif('No tienes h\\u00e9roes vivos a los que ponerle el arma.');
            if(G.itemDescarte && G.itemDescarte[side]) G.itemDescarte[side].push(entry);
            return;
          }

          // Resuelve la equipación (con efecto visual de carta volando).
          var resolveEquip = function(t){
            if(!t || !t.alive || cands.indexOf(t) < 0){
              if(typeof notif==='function') notif('Elige a un h\\u00e9roe vivo de tu equipo.');
              if(G.itemDescarte && G.itemDescarte[side]) G.itemDescarte[side].push(entry);
              return;
            }
            flyWeaponToHero(side, t, entry, function(){
              if(equipOn(side, t, entry)){
                var arr = (G.items && G.items[side]) || [];
                var i2 = arr.indexOf(item);
                if(i2 >= 0) arr.splice(i2, 1);
                if(typeof finishAct==='function') finishAct();
              }
            });
          };

          // Lanza la cinemática 3D PRIMERO, luego elige héroe.
          playRearmarCinematic(function(){
            // El héroe activo no lleva arma → se la queda él mismo.
            if(hero && hero.alive && !hasWeapon(hero)){ resolveEquip(hero); return; }
            if(cands.length === 1){ resolveEquip(cands[0]); return; }
            if(((typeof window.bfAbilityHuman==='function' && window.bfAbilityHuman(side)) || (typeof humanCtl==='function' && humanCtl(side))) && typeof pendTarget==='function'){
              pendTarget('\\u00bfA qui\\u00e9n le pones el arma recuperada? (si ya lleva una, la cambia)', side, resolveEquip);
            } else {
              // IA: mejor un héroe SIN arma (el más sano); si todos llevan, el más sano (cambia la suya).
              var unarmed = cands.filter(function(h){ return !hasWeapon(h); });
              resolveEquip((unarmed.length ? unarmed : cands).slice().sort(function(a,b){ return (b.hp||0) - (a.hp||0); })[0]);
            }
          });
          return;
        }
      }catch(e){}
      return orig.apply(this, arguments);
    };
    wrapped.__bfRearmar = 1;
    window.useItem = wrapped;
    return true;
  }

  var tries = 0, iv = setInterval(function(){ if(hook() || tries++ > 400) clearInterval(iv); }, 200);
})();
</script>
`;