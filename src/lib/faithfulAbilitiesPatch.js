// Habilidades fieles al texto de la carta.
//
// El motor del juego resuelve las habilidades con mecánicas genéricas
// ("debuff", "self-buff", "big-he"…) cuyos valores no siempre coinciden con lo
// que promete el texto de la carta. Este parche sustituye la resolución de los
// héroes afectados por una implementación exacta y añade los efectos que el
// motor no tenía (robo de vida en CC, intercambio de stats, parálisis en área,
// escudo regenerativo, igualar la vida del grupo, conjuro aleatorio…).
//
// Cada entrada de IMPL recibe el contexto del motor y resuelve la habilidad
// completa. Los héroes que no están en la tabla siguen usando el motor original.
export const FAITHFUL_ABILITIES_PATCH = `
<script>
(function(){
  if(window.__bfFaithfulAbilities) return;
  window.__bfFaithfulAbilities = true;

  function hid(h){ return String((h && (h.cardId || h.card_id || h.id)) || '').replace(/_\\d{6,}$/, ''); }
  function L(side){ return (typeof living === 'function' ? living(side) : []); }
  function mods(x){ return (x._mods = x._mods || []); }
  function fx(o){ if(typeof pushFx === 'function') pushFx(o); }
  function log(c,m){ if(typeof pushLog === 'function') pushLog(c,m); }
  function side_(x){ return typeof tSide === 'function' ? tSide(x) : 'o'; }

  // ---- efectos añadidos que el motor no tenía ----------------------------
  // Robo de vida en cuerpo a cuerpo (Hildra élite): al causar daño melee, el
  // héroe con el flag se cura la mitad.
  function hookLifesteal(){
    if(window.__bfLsHook || typeof window.dealDamage !== 'function') return;
    window.__bfLsHook = true;
    var orig = window.dealDamage;
    window.dealDamage = function(target, amount, opts){
      var d = orig.apply(this, arguments);
      try{
        if(d > 0 && opts && opts.type === 'melee' && typeof B !== 'undefined' && B.current){
          var a = getHero(B.current.side, B.current.id);
          if(a && a._bfLifestealCC && a !== target && typeof heal === 'function'){
            var g = heal(a, Math.round(d * 0.5));
            if(g){ fx({k:'heal', side:B.current.side, id:a.id, amt:g}); log('lh', a.name + ' roba ' + g + ' de vida.'); }
          }
        }
      }catch(e){}
      return d;
    };
  }

  // Escudo regenerativo (Batu élite): se rellena al final de cada turno, pero
  // cada vez con la MITAD del valor anterior (22 → 11 → 6 → 3 → 2 → 1 → 0), para
  // que no sea un muro eterno.
  function hookShieldRegen(){
    if(window.__bfSrHook || typeof window.endTurn !== 'function') return;
    window.__bfSrHook = true;
    var orig = window.endTurn;
    window.endTurn = function(){
      try{
        ['p','o'].forEach(function(s){
          L(s).forEach(function(x){
            if(!x._bfShieldRegen) return;
            var next = x._bfShieldRegen <= 1 ? 0 : Math.ceil(x._bfShieldRegen / 2);
            x._bfShieldRegen = next;
            if(!next){ delete x._bfShieldRegen; log('li', x.name + ': su escudo ancestral se agota.'); return; }
            if(x.shield < next){
              x.shield = next;
              fx({ k:'shieldup', toSide: side_(x), toId: x.id });
              log('lg', x.name + ' regenera su escudo ancestral a ' + next + '.');
            }
          });
        });
      }catch(e){}
      return orig.apply(this, arguments);
    };
  }

  // Maestría (Edredon): sin penalización por atacar fuera de su tipo. El motor
  // usa el stat correspondiente al tipo de ataque, así que mientras el flag esté
  // activo sus tres stats de combate valen lo mismo que su stat principal.
  function hookNoTypePen(){
    if(window.__bfNtpHook || typeof window.stat !== 'function') return;
    window.__bfNtpHook = true;
    var orig = window.stat;
    window.stat = function(h, k){
      if(h && h._bfNoTypePen && (k === 'cc' || k === 'ad' || k === 'he')){
        return Math.max(orig(h,'cc'), orig(h,'ad'), orig(h,'he'));
      }
      return orig.apply(this, arguments);
    };
  }

  // Vacío Mental (Coffetath élite): bloquea la mano del HÉROE RIVAL objetivo —
  // mientras dura, ese héroe no puede jugar ninguna carta de la mano (ni
  // hechizos ni objetos). Los demás héroes de su equipo sí pueden.
  function hookHandBlock(){
    ['castSpell','useItem','castSpell_AI','useItem_AI'].forEach(function(fn){
      if(typeof window[fn] !== 'function' || window[fn].__bfHb) return;
      var orig = window[fn];
      var wrapped = function(){
        try{
          if(typeof B !== 'undefined' && B.current){
            var a = getHero(B.current.side, B.current.id);
            if(a && a._bfHandBlock > 0){
              log('li', '\\ud83d\\udeab ' + a.name + ' tiene la mano bloqueada: no puede jugar hechizos ni objetos.');
              return;
            }
          }
        }catch(e){}
        return orig.apply(this, arguments);
      };
      wrapped.__bfHb = true;
      window[fn] = wrapped;
    });
    if(typeof window.nextRound === 'function' && !window.nextRound.__bfHb){
      var on = window.nextRound;
      var wr = function(){
        try{
          ['p','o'].forEach(function(s){ L(s).forEach(function(x){ if(x._bfHandBlock > 0 && !--x._bfHandBlock) log('li', x.name + ' recupera el control de su mano.'); }); });
        }catch(e){}
        return on.apply(this, arguments);
      };
      wr.__bfHb = true;
      window.nextRound = wr;
    }
  }

  // Efecto visual de Coffetath sobre el héroe objetivo: un cortado (normal) o un
  // café con leche (élite) dibujado sobre su retrato durante ~3,5 s.
  function coffeeFx(target, elite){
    try{
      if(!window.__bfCoffeeCss){
        window.__bfCoffeeCss = 1;
        var st = document.createElement('style');
        st.textContent = '.bf-coffee-fx{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);z-index:34;pointer-events:none;display:flex;flex-direction:column;align-items:center;gap:3px;filter:drop-shadow(0 4px 10px rgba(0,0,0,.75))}'
          + '.bf-coffee-cup{width:64px;height:52px;border-radius:6px 6px 26px 26px;border:3px solid #f4e3c8;background:linear-gradient(180deg,#f6ead6 0 26%,#5b3418 26%);position:relative}'
          + '.bf-coffee-cup.bf-coffee-elite{background:linear-gradient(180deg,#fdf6ea 0 46%,#9c6b3f 46%)}'
          + '.bf-coffee-cup:after{content:"";position:absolute;right:-19px;top:12px;width:20px;height:22px;border:3px solid #f4e3c8;border-left:none;border-radius:0 14px 14px 0}'
          + '.bf-coffee-cup:before{content:"";position:absolute;left:12px;top:-14px;width:16px;height:14px;border-radius:50%;background:rgba(255,255,255,.35)}'
          + '.bf-coffee-lbl{padding:2px 8px;border-radius:999px;background:rgba(8,5,14,.9);border:1.5px solid #d9b877;color:#ffe9c2;font-family:Cinzel,serif;font-size:10px;font-weight:1000;letter-spacing:.6px;white-space:nowrap}';
        document.head.appendChild(st);
      }
      // Se pinta tras el repintado del tablero para que no lo borre.
      setTimeout(function(){
        var card = document.getElementById('b_' + side_(target) + '_' + target.id);
        if(!card) return;
        var el = document.createElement('div');
        el.className = 'bf-coffee-fx';
        el.innerHTML = '<div class="bf-coffee-cup' + (elite ? ' bf-coffee-elite' : '') + '"></div><div class="bf-coffee-lbl">' + (elite ? 'CAF\\u00c9 CON LECHE' : 'CORTADO') + '</div>';
        card.appendChild(el);
        setTimeout(function(){ if(el.parentNode) el.remove(); }, 3500);
      }, 120);
    }catch(e){}
  }

  // Marcador flotante (estilo pifia / daño / curación) sobre el retrato del
  // objetivo: indica pérdidas de habilidad, fase élite anulada, etc. Se pinta
  // FUERA del recuadro (fixed en el body) para que los parches de congelado
  // del héroe no le quiten la animación.
  function lossPop(t, txt, color){
    try{
      if(!window.__bfLossPopCss){
        window.__bfLossPopCss = 1;
        var st = document.createElement('style');
        st.textContent = '@keyframes bfLossPop{0%{opacity:0;transform:translate(-50%,-40%) scale(.6)}15%{opacity:1;transform:translate(-50%,-60%) scale(1.18)}30%{transform:translate(-50%,-58%) scale(1)}100%{opacity:0;transform:translate(-50%,-170%) scale(.95)}}'
          + '.bf-loss-pop{position:fixed;z-index:99999;pointer-events:none;font-family:Cinzel,serif;font-weight:1000;font-size:15px;letter-spacing:.4px;white-space:nowrap;padding:5px 14px;border-radius:999px;background:rgba(8,5,14,.92);border:2px solid currentColor;text-shadow:0 0 10px currentColor,0 2px 4px #000;box-shadow:0 4px 14px rgba(0,0,0,.6),0 0 18px currentColor;animation:bfLossPop 2s ease-out forwards}';
        document.head.appendChild(st);
      }
      var tgt = t;
      setTimeout(function(){
        var card = document.getElementById('b_' + side_(tgt) + '_' + tgt.id);
        var r = card ? card.getBoundingClientRect() : null;
        var el = document.createElement('div');
        el.className = 'bf-loss-pop';
        el.style.color = color || '#ff7a7a';
        el.textContent = txt;
        // Si no se encuentra la carta o su rect es 0 (repintado en curso),
        // se muestra en el centro de la pantalla para no perder el aviso.
        if(r && r.width > 0){ el.style.left = (r.left + r.width / 2) + 'px'; el.style.top = (r.top + r.height * 0.42) + 'px'; }
        else { el.style.left = '50%'; el.style.top = '42%'; }
        document.body.appendChild(el);
        setTimeout(function(){ if(el.parentNode) el.remove(); }, 2600);
      }, 140);
    }catch(e){}
  }

  // ---- implementaciones fieles ------------------------------------------
  var IMPL = {
    // Boss — texto: -3 (1 turno) / -5 (2 turnos) a todos los rivales
    bos: function(c){
      var a = c.el ? 5 : 3, tn = c.el ? 2 : 1;
      L(c.foes).forEach(function(x){ mods(x).push({cc:-a, ad:-a, he:-a, turns:tn}); fx({k:'status', side:side_(x), id:x.id, txt:'\\u25bc'}); });
      log('li', c.h.name + ' \\u2192 -' + a + ' a todos los rivales (' + tn + ' turno' + (tn>1?'s':'') + ').');
    },
    // Narbon élite — además paraliza 2 turnos a los 3 héroes rivales
    nar: function(c){
      var t = c.t; t.mwep = null; t.rwep = null;
      var had = !!t.armor;
      if(t.armor){ t.maxHp = Math.max(1, t.maxHp - t.armor.hp); t.hp = Math.min(t.hp, t.maxHp); t.armor = null; }
      t.shield = 0;
      fx({k:'slash', toSide:side_(t), toId:t.id});
      var d = dealDamage(t, stat(c.h,'cc'), {type:'melee'});
      log('lx', c.h.name + ' DESTRUYE el equipo de ' + t.name + (had ? ' (armadura rota)' : '') + ' (-' + d + ').');
      if(c.el){
        L(c.foes).forEach(function(x){ x.para = Math.max(x.para || 0, 2); fx({k:'status', side:side_(x), id:x.id, txt:'\\u26a1'}); });
        log('li', c.h.name + ' paraliza 2 turnos a todo el equipo rival.');
      }
    },
    // Hildra — +6 CC / +4 vel (élite: +9 CC, +6 vel y robo de vida en CC)
    hil: function(c){
      var cc = c.el ? 9 : 6, vel = c.el ? 6 : 4;
      mods(c.h).push({cc:cc, vel:vel, turns:99});
      if(c.el) c.h._bfLifestealCC = 1;
      fx({k:'status', side:c.side, id:c.h.id, txt:'\\u25b2'});
      log('lg', c.h.name + ' entra en furia (+' + cc + ' CC, +' + vel + ' velocidad' + (c.el ? ' y robo de vida' : '') + ').');
    },
    // Renhubero — solo debuff, sin daño extra
    renhu: function(c){
      var a = c.el ? 8 : 6;
      mods(c.t).push({cc:-a, ad:-a, he:-a, turns: c.el ? 99 : 2});
      fx({k:'status', side:side_(c.t), id:c.t.id, txt:'\\u25bc'});
      log('li', c.h.name + ' enreda a ' + c.t.name + ' (-' + a + (c.el ? ' permanente' : ' durante 2 turnos') + ').');
    },
    // Boskimano — cura 12 (élite: 18 y +2 stats a los aliados)
    boski: function(c){
      var g = heal(c.h, c.el ? 18 : 12);
      log('lh', c.h.name + ' se cura (+' + g + ').');
      if(c.el){
        L(c.allies).forEach(function(x){ if(x !== c.h){ mods(x).push({cc:2, ad:2, he:2, turns:99}); fx({k:'status', side:side_(x), id:x.id, txt:'\\u25b2'}); } });
        log('lg', c.h.name + ' otorga +2 a sus aliados.');
      }
    },
    // Morthex élite — roba toda la vida infligida y +3 CC
    mor: function(c){
      if(!c.el) return false;
      fx({k:'slash', toSide:side_(c.t), toId:c.t.id});
      var d = dealDamage(c.t, stat(c.h,'cc'), {type:'melee'});
      var g = heal(c.h, d);
      mods(c.h).push({cc:3, turns:99});
      log('ld', c.h.name + ' drena a ' + c.t.name + ' (-' + d + ', +' + g + ') y gana +3 CC.');
    },
    // Hannai Boa élite — esquiva 2 ataques y +5 solo al siguiente golpe
    hannai: function(c){
      c.h.evade = c.el ? 2 : 1;
      if(c.el) mods(c.h).push({cc:5, ad:5, turns:1});
      fx({k:'status', side:c.side, id:c.h.id, txt:'\\ud83d\\udca8'});
      log('li', c.h.name + ' se vuelve evasiva' + (c.el ? ' (2 ataques) y su siguiente golpe hace +5.' : '.'));
    },
    // El Pijo — -4 a un rival (élite: -6 a TODOS y +3 CC propio)
    pij: function(c){
      if(c.el){
        L(c.foes).forEach(function(x){ mods(x).push({cc:-6, ad:-6, he:-6, turns:2}); fx({k:'status', side:side_(x), id:x.id, txt:'\\u25bc'}); });
        mods(c.h).push({cc:3, turns:99});
        log('li', c.h.name + ' humilla a todos los rivales (-6) y gana +3 CC.');
      } else {
        mods(c.t).push({cc:-4, ad:-4, he:-4, turns:2});
        fx({k:'status', side:side_(c.t), id:c.t.id, txt:'\\u25bc'});
        log('li', c.h.name + ' humilla a ' + c.t.name + ' (-4 durante 2 turnos).');
      }
    },
    // Patrón — ignora MEDIA defensa (élite: toda y atraviesa a un segundo rival)
    pat: function(c){
      fx({k:'arrow', fromSide:c.side, fromId:c.h.id, toSide:side_(c.t), toId:c.t.id, hits:1});
      var d = dealDamage(c.t, Math.round(stat(c.h,'ad')*1.2) + (c.el ? 5 : 0), {type:'ranged', pierce: c.el ? 1 : 0.5});
      log('ld', c.h.name + ' dispara a ' + c.t.name + ' (-' + d + ').');
      if(c.el){
        var o2 = L(c.foes).filter(function(x){ return x !== c.t; })[0];
        if(o2){ var d2 = dealDamage(o2, Math.round(stat(c.h,'ad')*0.7), {type:'ranged', pierce:1}); log('ld', '\\u2026la flecha atraviesa hasta ' + o2.name + ' (-' + d2 + ').'); }
      }
    },
    // Elderbar — marca +5 (élite +8 persistente), sin daño directo
    elder: function(c){
      c.t.mark = { dmg: c.el ? 8 : 5, turns: c.el ? 99 : 3 };
      fx({k:'status', side:side_(c.t), id:c.t.id, txt:'\\ud83c\\udfaf'});
      log('li', c.h.name + ' marca a ' + c.t.name + ': recibir\\u00e1 +' + (c.el ? 8 : 5) + ' de da\\u00f1o.');
    },
    // Zarmanda — disparo imbloqueable (élite: dos disparos y +6 AD el combate)
    zar: function(c){
      var shots = c.el ? 2 : 1;
      for(var i = 0; i < shots; i++){
        if(!c.t.alive) break;
        fx({k:'arrow', fromSide:c.side, fromId:c.h.id, toSide:side_(c.t), toId:c.t.id, hits:1});
        var d = dealDamage(c.t, Math.round(stat(c.h,'ad') * (c.el ? 0.9 : 1.2)) + (c.el ? 3 : 0), {type:'ranged', ignoreShield:true});
        log('ld', c.h.name + ' dispara sin ser bloqueada a ' + c.t.name + ' (-' + d + ').');
      }
      if(c.el){ mods(c.h).push({ad:6, turns:99}); log('lg', c.h.name + ' brilla con aura dorada (+6 AD este combate).'); }
    },
    // Alfredinho — segundo disparo a -3 de potencia
    alf: function(c){
      if(c.el) return false;
      for(var i = 0; i < 2; i++){
        if(!c.t.alive) break;
        fx({k:'arrow', fromSide:c.side, fromId:c.h.id, toSide:side_(c.t), toId:c.t.id, hits:1});
        var v = Math.round(stat(c.h,'ad') * 0.9) - (i === 1 ? 3 : 0);
        var d = dealDamage(c.t, v, {type:'ranged'});
        log('ld', c.h.name + ' dispara a ' + c.t.name + ' (-' + d + ')' + (i === 1 ? ' (segundo disparo -3)' : '') + '.');
      }
    },
    // Dixie Plasma — normal: disparo que ignora la armadura defensiva.
    // Élite: ignora equipo y pega al 50% de la vida del rival.
    // (Las dos versiones se resuelven aquí para no pedir el objetivo dos veces.)
    dix: function(c){
      fx({k:'arrow', fromSide:c.side, fromId:c.h.id, toSide:side_(c.t), toId:c.t.id, hits:1});
      if(c.el){
        var half = Math.max(1, Math.round(c.t.hp * 0.5));
        var dh = dealDamage(c.t, half, {type:'ranged', pierce:1, ignoreShield:true, ignoreArmor:true});
        log('ld', c.h.name + ' fulmina a ' + c.t.name + ' al 50% de su vida (-' + dh + ').');
        return;
      }
      var d = dealDamage(c.t, Math.round(stat(c.h,'ad') * 1.2), {type:'ranged', pierce:1, ignoreArmor:true});
      log('ld', c.h.name + ' dispara al punto d\\u00e9bil de ' + c.t.name + ' ignorando su armadura (-' + d + ').');
    },
    // AchuchaMoto — +6 CC / +4 vel. Élite: +9 CC, +6 vel, robo de vida en CC y
    // drenaje inmediato a un rival vivo al azar.
    achucm: function(c){
      var cc = c.el ? 9 : 6, vel = c.el ? 6 : 4;
      mods(c.h).push({cc:cc, vel:vel, turns:99});
      fx({k:'status', side:c.side, id:c.h.id, txt:'\\u25b2'});
      log('lg', c.h.name + ' entra en furia (+' + cc + ' CC, +' + vel + ' velocidad).');
      if(!c.el) return;
      c.h._bfLifestealCC = 1;
      var pool = L(c.foes);
      if(!pool.length) return;
      var t = pool[Math.floor(Math.random() * pool.length)];
      fx({k:'slash', toSide:side_(t), toId:t.id});
      var d = dealDamage(t, Math.round(stat(c.h,'cc') * 0.6), {type:'melee'});
      var g = heal(c.h, d);
      if(g) fx({k:'heal', side:c.side, id:c.h.id, amt:g});
      log('ld', c.h.name + ' drena la vida de ' + t.name + ' (-' + d + ', +' + g + ') y roba vida en cuerpo a cuerpo.');
    },
    // Sylvex — +4 a todos sus stats (élite: +6 y cura 10)
    syx: function(c){
      var a = c.el ? 6 : 4;
      mods(c.h).push({cc:a, ad:a, he:a, vel:a, turns:99});
      fx({k:'status', side:c.side, id:c.h.id, txt:'\\u25b2'});
      var extra = '';
      if(c.el){ var g = heal(c.h, 10); extra = ' y se cura +' + g; }
      log('lg', c.h.name + ' muta: +' + a + ' a todos sus stats' + extra + '.');
    },
    // Serafis — golpe mágico que intercambia CC y HE del rival (élite: dos rivales)
    ser: function(c){
      var targets = [c.t];
      if(c.el){ var o2 = L(c.foes).filter(function(x){ return x !== c.t; })[0]; if(o2) targets.push(o2); }
      targets.forEach(function(x){
        fx({k:'spell', toSide:side_(x), toId:x.id, el:'fuego'});
        var d = dealDamage(x, Math.round(stat(c.h,'he') * 1.5) + (c.el ? 6 : 0), {type:'spell', element:'fuego'});
        var cc = stat(x,'cc'), he = stat(x,'he');
        mods(x).push({cc: he - cc, he: cc - he, turns:99});
        fx({k:'status', side:side_(x), id:x.id, txt:'\\ud83d\\udd04'});
        log('li', c.h.name + ' golpea a ' + x.name + ' (-' + d + ') e intercambia su CC y su HE.');
      });
    },
    // Batu élite — escudo de 22 que se regenera cada turno
    bat: function(c){
      var v = c.el ? 22 : 14;
      c.t.shield += v;
      fx({k:'shieldup', toSide:side_(c.t), toId:c.t.id});
      if(c.el){ c.t._bfShieldRegen = v; log('lg', c.h.name + ' da a ' + c.t.name + ' un escudo regenerativo de ' + v + ' (cada turno se regenera a la mitad).'); }
      else log('lg', c.h.name + ' escuda ' + v + ' a ' + c.t.name + '.');
    },
    // Nixara — drena vida del rival y ESA vida se la suma ella misma.
    // Élite: drena más y, además de curarse, reparte la mitad entre sus aliados.
    nix: function(c){
      fx({k:'spell', toSide:side_(c.t), toId:c.t.id, el:'agua'});
      var d = dealDamage(c.t, Math.round(stat(c.h,'he') * (c.el ? 1.25 : 1.1)) + (c.el ? 6 : 0), {type:'spell', element:'agua'});
      var g = heal(c.h, d);
      if(g) fx({k:'heal', side:c.side, id:c.h.id, amt:g});
      log('ld', c.h.name + ' drena a ' + c.t.name + ' (-' + d + ') y absorbe esa vida (+' + g + ').');
      if(c.el){
        var others = L(c.allies).filter(function(x){ return x !== c.h; });
        var each = Math.max(1, Math.round(d / 2 / Math.max(1, others.length)));
        others.forEach(function(x){ var gg = heal(x, each); if(gg){ fx({k:'heal', side:side_(x), id:x.id, amt:gg}); log('lh', x.name + ' +' + gg + '.'); } });
      }
    },
    // Mantenimiento — iguala la vida del grupo (élite: cura a todos al máximo)
    man: function(c){
      var al = L(c.allies);
      if(c.el){
        al.forEach(function(x){ var g = heal(x, x.maxHp); if(g) log('lh', x.name + ' +' + g + '.'); });
        log('lh', c.h.name + ' repara al grupo entero: todos a vida completa.');
      } else {
        var top = al.reduce(function(m,x){ return Math.max(m, x.hp); }, 0);
        al.forEach(function(x){ var g = heal(x, Math.max(0, top - x.hp)); if(g) log('lh', x.name + ' +' + g + '.'); });
        log('lh', c.h.name + ' iguala la vida del grupo a ' + top + ' HP.');
      }
    },
    // Pacopiton — golpe mágico que además maldice (-stats)
    pac: function(c){
      fx({k:'spell', toSide:side_(c.t), toId:c.t.id, el:'fuego'});
      var d = dealDamage(c.t, Math.round(stat(c.h,'he') * 1.5) + (c.el ? 6 : 0), {type:'spell', element:'fuego'});
      var a = c.el ? 6 : 4;
      mods(c.t).push({cc:-a, ad:-a, he:-a, turns: c.el ? 99 : 2});
      fx({k:'status', side:side_(c.t), id:c.t.id, txt:'\\u25bc'});
      log('li', c.h.name + ' maldice a ' + c.t.name + ' (-' + d + ', -' + a + (c.el ? ' permanente' : '') + ').');
    },
    // Reverendo Sapis — golpe mágico y -3 a los stats del objetivo
    rev: function(c){
      if(c.el) return false;
      var d = dealDamage(c.t, Math.round(stat(c.h, primKey(c.h.type)) * 0.6), {type: c.h.type === 'HE' ? 'spell' : c.h.type === 'AD' ? 'ranged' : 'melee', element:'agua'});
      mods(c.t).push({cc:-3, ad:-3, he:-3, turns:2});
      fx({k:'status', side:side_(c.t), id:c.t.id, txt:'\\u25bc'});
      log('li', c.h.name + ' maldice a ' + c.t.name + ' (-' + d + ', -3).');
    },
    // Edredon — Ráfaga del Veterano: 3 flechas certeras a un rival elegido.
    // Élite — Tormenta de Flechas: lluvia de flechas sobre TODOS los rivales.
    edre: function(c){
      if(c.el){
        var foes = L(c.foes);
        foes.forEach(function(x, i){
          setTimeout(function(){ fx({k:'arrow', fromSide:c.side, fromId:c.h.id, toSide:side_(x), toId:x.id, hits:1}); }, i * 180);
        });
        foes.forEach(function(x){
          var d = dealDamage(x, Math.round(stat(c.h,'ad') * 0.7) + 3, {type:'ranged'});
          log('ld', '\\ud83c\\udff9 La lluvia de flechas de ' + c.h.name + ' alcanza a ' + x.name + ' (-' + d + ').');
        });
        log('lx', '\\ud83c\\udff9 ' + c.h.name + ' desata la TORMENTA DE FLECHAS sobre todo el equipo rival.');
        return;
      }
      var total = 0;
      for(var i = 0; i < 3; i++){
        if(!c.t.alive) break;
        fx({k:'arrow', fromSide:c.side, fromId:c.h.id, toSide:side_(c.t), toId:c.t.id, hits:1});
        total += dealDamage(c.t, Math.round(stat(c.h,'ad') * 0.45) + 1, {type:'ranged'});
      }
      log('ld', '\\ud83c\\udff9 ' + c.h.name + ' acribilla a ' + c.t.name + ' con una r\\u00e1faga de 3 flechas (-' + total + ').');
    },
    // Vexal — Interferencia: anula la habilidad de un rival y hace daño.
    // Élite — Silencio Total: anula la habilidad y golpe mágico fuerte.
    vex: function(c){
      fx({k:'spell', toSide:side_(c.t), toId:c.t.id, el:'arcano'});
      var d = dealDamage(c.t, Math.round(stat(c.h,'he') * (c.el ? 1.6 : 1.1)), {type:'spell', element:'arcano'});
      c.t.silence = 99; c.t.abilityUsed = true;
      fx({k:'status', side:side_(c.t), id:c.t.id, txt:'\\ud83d\\udeab'});
      lossPop(c.t, '\\ud83d\\udeab HABILIDAD ANULADA', '#ff7a7a');
      log('li', c.h.name + ' anula la habilidad de ' + c.t.name + ' (-' + d + ').');
    },
    // Fas Everest Panzer — Compresor Roto: desactiva la habilidad del rival
    // elegido O su Fase Élite (a elección). Élite — Monedero Roto: -15 stats
    // repartidos al azar. Con marcador flotante sobre el objetivo.
    Faseve: function(c){
      if(c.el){
        var r = {cc:0, ad:0, he:0}, keys = ['cc','ad','he'];
        for(var i = 0; i < 15; i++) r[keys[Math.floor(Math.random()*3)]]++;
        mods(c.t).push({cc:-r.cc, ad:-r.ad, he:-r.he, turns:99});
        fx({k:'status', side:side_(c.t), id:c.t.id, txt:'\\u25bc'});
        lossPop(c.t, '\\u25bc -15 A SUS STATS', '#ffb43a');
        log('li', c.h.name + ' rompe el monedero de ' + c.t.name + ': -' + r.cc + ' CC, -' + r.ad + ' AD y -' + r.he + ' HE.');
        return;
      }
      var blockElite;
      if(typeof humanCtl === 'function' && humanCtl(c.side)){
        blockElite = window.confirm('COMPRESOR ROTO sobre ' + c.t.name + ':\\n\\nAceptar = anular su FASE \\u00c9LITE\\nCancelar = anular su HABILIDAD');
      } else {
        // IA: aleatorio 50/50 — anula la HABILIDAD o bloquea la FASE ÉLITE.
        blockElite = Math.random() < 0.5;
      }
      if(blockElite){
        c.t.eliteUsed = true; c.t._bfNoElite = 1;
        fx({k:'status', side:side_(c.t), id:c.t.id, txt:'\\u26d4'});
        lossPop(c.t, '\\u26d4 FASE \\u00c9LITE ANULADA', '#c79bff');
        log('li', c.h.name + ' desactiva la FASE \\u00c9LITE de ' + c.t.name + ': ya no podr\\u00e1 renacer.');
      } else {
        c.t.silence = 99; c.t.abilityUsed = true;
        fx({k:'status', side:side_(c.t), id:c.t.id, txt:'\\ud83d\\udeab'});
        lossPop(c.t, '\\ud83d\\udeab HABILIDAD ANULADA', '#ff7a7a');
        log('li', c.h.name + ' desactiva la habilidad de ' + c.t.name + '.');
      }
    },
    // Coffetath — normal: golpe mágico brutal a un objetivo.
    // Élite: golpe mágico que además bloquea la mano rival un turno.
    caoffe: function(c){
      if(!c.el){
        fx({k:'spell', toSide:side_(c.t), toId:c.t.id, el:'arcano'});
        var dn = dealDamage(c.t, Math.round(stat(c.h,'he') * 1.8), {type:'spell', element:'arcano'});
        coffeeFx(c.t, false);
        log('ld', c.h.name + ' provoca un colapso mental en ' + c.t.name + ' (-' + dn + ') y le sirve un cortado.');
        return;
      }
      fx({k:'spell', toSide:side_(c.t), toId:c.t.id, el:'rayo'});
      var d = dealDamage(c.t, Math.round(stat(c.h,'he') * 1.5) + 6, {type:'spell', element:'rayo'});
      c.t._bfHandBlock = 2;
      fx({k:'status', side:side_(c.t), id:c.t.id, txt:'\\ud83d\\udeab'});
      coffeeFx(c.t, true);
      log('li', c.h.name + ' golpea a ' + c.t.name + ' (-' + d + ') y le BLOQUEA LA MANO: no podr\\u00e1 jugar hechizos ni objetos.');
    },
    // El Rolero — conjuro aleatorio (élite: crítico garantizado)
    rol: function(c){
      var roll = c.el ? 20 : (1 + Math.floor(Math.random() * 20));
      var mult = 0.9 + (roll / 20) * 1.1;
      fx({k:'spell', toSide:side_(c.t), toId:c.t.id, el:'rayo'});
      var d = dealDamage(c.t, Math.round(stat(c.h,'he') * mult) + (c.el ? 6 : 0), {type:'spell', element:'rayo', pierce: c.el ? 1 : 0});
      log('ld', c.h.name + ' tira el dado (' + roll + '/20) y su conjuro golpea a ' + c.t.name + ' (-' + d + ')' + (c.el ? ' \\u00a1CR\\u00cdTICO!' : '') + '.');
    }
  };

  var NEEDS_ENEMY = { edre:1, vex:1, Faseve:1, caoffe:1, bos:0, nar:1, hil:0, renhu:1, boski:0, mor:1, hannai:0, pij:1, pat:1, elder:1, zar:1, alf:1, dix:1, syx:0, ser:1, bat:0, nix:1, man:0, pac:1, rev:1, rol:1 };
  var NEEDS_ALLY = { bat:1 };

  function hook(){
    if(window.__bfFaHooked || typeof window.useAbility !== 'function') return false;
    window.__bfFaHooked = true;
    hookLifesteal();
    hookShieldRegen();
    hookNoTypePen();
    hookHandBlock();
    var orig = window.useAbility;
    window.useAbility = function(side, h, done){
      var id = hid(h), impl = IMPL[id];
      if(!impl) return orig.apply(this, arguments);
      var self = this, args = arguments;
      var foes = enemySide(side), allies = side;
      var ctx = { side:side, h:h, el:!!h.eliteMode, foes:foes, allies:allies, t:null };
      var run = function(t){
        ctx.t = t;
        var res;
        try { res = impl(ctx); } catch(e){ res = false; }
        if(res === false){ orig.apply(self, args); return; }
        h.abilityUsed = true;
        if(typeof window.__bfPlayAbilityAnim === 'function') window.__bfPlayAbilityAnim(side, h);
        if(typeof renderBattle === 'function') renderBattle();
        if(typeof netSync === 'function') netSync('s-battle');
        if(typeof done === 'function') done(); else if(typeof finishAct === 'function') finishAct();
      };
      var need = NEEDS_ENEMY[id] ? foes : NEEDS_ALLY[id] ? allies : null;
      if(!need){ run(null); return; }
      if(typeof humanCtl === 'function' && humanCtl(side)){
        pendTarget('Objetivo de ' + (h.eliteMode ? h.eAbility : h.ability), need, run);
      } else {
        var t = need === foes
          ? L(foes).sort(function(a,b){ return a.hp - b.hp; })[0]
          : L(allies).sort(function(a,b){ return a.hp/a.maxHp - b.hp/b.maxHp; })[0];
        run(t);
      }
    };
    return true;
  }

  var tries = 0, iv = setInterval(function(){ if(hook() || tries++ > 160) clearInterval(iv); }, 150);
})();
</script>
`;