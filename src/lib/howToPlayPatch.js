// Parche inyectado en el iframe: sustituye window.rulesBody() (el contenido de
// "Cómo se juega") por una guía más clara, actualizada y visual: pasos con
// emblemas, panel de acciones ilustrado, economía de monedas, forma Élite y
// una rejilla de fichas de colores con TODOS los estados de combate.
const CC_EMB = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/ab147bafb_generated_image.png';
const AD_EMB = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/fd388871c_generated_image.png';
const HE_EMB = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/cfd5e317c_generated_image.png';
const ACT_MELEE = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/fefda0ace_generated_image.png';
const ACT_SHOT = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/210f89d43_generated_image.png';
const ACT_SPELL = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/7c59e1ff7_generated_image.png';
const ACT_OBJ = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/90ff926d5_generated_image.png';
const ACT_DEF = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/1d9e5fb8f_generated_image.png';
const ACT_TANK = 'https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/b5ca5c078_generated_image.png';

export const HOW_TO_PLAY_PATCH = `
<script>
(function(){
  if(window.__bfHowToPlay)return;
  window.__bfHowToPlay=true;

  var CSS='<style>'+
  '.rules-body{font-size:15px;line-height:1.55;color:#f1ead9}'+
  '.rules-body p{font-size:14.5px;line-height:1.6;margin:10px 0}'+
  '.rules-body b{color:#ffe9a8}'+
  '.rb-step{display:flex;gap:12px;align-items:flex-start;background:linear-gradient(135deg,rgba(28,16,46,.7),rgba(12,7,20,.85));border:1px solid rgba(255,210,74,.28);border-radius:14px;padding:12px 14px;margin:10px 0;box-shadow:0 6px 16px rgba(0,0,0,.4)}'+
  '.rb-step-n{flex:0 0 34px;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:Cinzel,serif;font-weight:1000;font-size:16px;color:#3a2600;background:radial-gradient(circle at 35% 30%,#ffeaa6,#FFD24A 50%,#a9771f);border:2px solid #7c5410;box-shadow:0 2px 8px rgba(0,0,0,.5)}'+
  '.rb-step-b{flex:1}'+
  '.rb-step-t{font-family:Cinzel,serif;font-weight:900;color:#ffd24a;font-size:14.5px;letter-spacing:.3px;margin-bottom:3px;text-shadow:0 1px 3px #000}'+
  '.rb-step-x{color:#efe9dc;font-size:12.5px;line-height:1.45}'+
  '.rb-emb{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:50%;border:1.5px solid rgba(255,210,74,.6);box-shadow:0 0 8px rgba(255,210,74,.4);overflow:hidden;background:radial-gradient(circle at 40% 30%,#1a0a00,#0a0500);vertical-align:middle;flex:0 0 30px}'+
  '.rb-emb img{width:100%;height:100%;object-fit:cover;display:block}'+
  '.rb-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:10px 0 4px}'+
  '.rb-act{display:flex;flex-direction:column;align-items:center;gap:5px;text-align:center;background:linear-gradient(180deg,rgba(20,10,35,.85),rgba(10,5,15,.95));border:1px solid rgba(255,210,74,.4);border-radius:12px;padding:9px 6px}'+
  '.rb-act-im{width:42px;height:42px;border-radius:50%;border:2px solid rgba(255,210,74,.6);box-shadow:0 0 10px rgba(255,210,74,.5);overflow:hidden;background:radial-gradient(circle at 40% 30%,#1a0a00,#0a0500)}'+
  '.rb-act-im img{width:100%;height:100%;object-fit:cover;display:block}'+
  '.rb-act-t{font-family:Cinzel,serif;font-weight:900;color:#ffd24a;font-size:11.5px;letter-spacing:.2px}'+
  '.rb-act-x{color:#d8d0e4;font-size:10px;line-height:1.25}'+
  '.rb-act-ab{grid-column:1/-1;flex-direction:row;text-align:left;gap:11px;border:2px solid rgba(255,210,74,.7);background:linear-gradient(135deg,rgba(28,16,46,.96),rgba(12,7,20,.98))}'+
  '.rb-act-ab .rb-act-im{width:46px;height:46px;flex:0 0 46px}'+
  '.rb-act-ab .rb-act-b{flex:1}'+
  '.rb-cap{font-size:10.5px;color:#b8aacb;text-align:center;margin:2px 0 8px;font-style:italic}'+
  '.rb-coin{display:flex;gap:8px;margin:8px 0;flex-wrap:wrap}'+
  '.rb-coin-c{flex:1;min-width:150px;background:linear-gradient(180deg,rgba(20,10,35,.85),rgba(10,5,15,.95));border:1px solid rgba(255,210,74,.4);border-radius:12px;padding:9px 11px}'+
  '.rb-coin-t{font-family:Cinzel,serif;font-weight:900;color:#ffd24a;font-size:12px;margin-bottom:2px}'+
  '.rb-coin-x{color:#d8d0e4;font-size:11px;line-height:1.35}'+
  '.rb-states{display:grid;grid-template-columns:repeat(auto-fill,minmax(215px,1fr));gap:7px;margin-top:8px}'+
  '.rb-st{display:flex;align-items:flex-start;gap:8px;background:linear-gradient(180deg,rgba(20,10,35,.85),rgba(10,5,15,.95));border-radius:11px;padding:8px 10px;border:1px solid var(--stc,rgba(255,210,74,.4));box-shadow:inset 0 0 14px -8px var(--stc,transparent)}'+
  '.rb-st-i{flex:0 0 26px;width:26px;height:26px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:14px;background:rgba(0,0,0,.45);border:1.5px solid var(--stc,#ffd24a);box-shadow:0 0 8px var(--stc,transparent)}'+
  '.rb-st-b{flex:1}'+
  '.rb-st-t{font-weight:900;font-size:11.5px;color:var(--stc,#ffd24a);letter-spacing:.3px}'+
  '.rb-st-x{color:#d8d0e4;font-size:10.5px;line-height:1.3}'+
  // Tipografías más grandes y legibles en todo el modal de Reglas.
  '.rules-body .rb-step-t{font-size:18px;letter-spacing:.5px}'+
  '.rules-body .rb-step-x{font-size:14.5px;line-height:1.6}'+
  '.rules-body .rb-step-n{flex:0 0 40px;width:40px;height:40px;font-size:19px}'+
  '.rules-body .rb-coin-c{min-width:190px;padding:12px 14px}'+
  '.rules-body .rb-coin-t{font-size:15px;margin-bottom:4px}'+
  '.rules-body .rb-coin-x{font-size:13.5px;line-height:1.55;color:#e6dff2}'+
  '.rules-body .rb-act-t{font-size:13.5px}'+
  '.rules-body .rb-act-x{font-size:12.5px;line-height:1.4;color:#e6dff2}'+
  '.rules-body .rb-act-im{width:52px;height:52px}'+
  '.rules-body .rb-cap{font-size:12.5px}'+
  '.rules-body .rb-states{grid-template-columns:repeat(auto-fill,minmax(255px,1fr));gap:9px}'+
  '.rules-body .rb-st-t{font-size:14px}'+
  '.rules-body .rb-st-x{font-size:12.5px;line-height:1.45;color:#e6dff2}'+
  '.rules-body .rb-st-i{flex:0 0 32px;width:32px;height:32px;font-size:17px}'+
  '.rules-body .rb-emb{width:34px;height:34px;flex:0 0 34px}'+
  '</style>';

  function st(color,icon,name,text){
    return '<div class="rb-st" style="--stc:'+color+'"><div class="rb-st-i">'+icon+'</div><div class="rb-st-b"><div class="rb-st-t">'+name+'</div><div class="rb-st-x">'+text+'</div></div></div>';
  }

  function bodyHtml(){
    return '<div class="rules-body">'+CSS+
    '<p><b>🎯 Objetivo:</b> arma un equipo de <b>3 héroes</b>, equípalos bien y derrota a los 3 héroes del rival en un combate por turnos.</p>'+

    '<div class="rb-step"><div class="rb-step-n">1</div><div class="rb-step-b"><div class="rb-step-t">Subasta · 3 fases</div><div class="rb-step-x">'+
    'Una fase por tipo de héroe: <span class="rb-emb"><img src="${CC_EMB}"></span> <b>cuerpo a cuerpo (CC)</b>, <span class="rb-emb"><img src="${AD_EMB}"></span> <b>distancia (AD)</b> y <span class="rb-emb"><img src="${HE_EMB}"></span> <b>magia (HE)</b>. '+
    'En cada fase salen <b>6 héroes, uno por raza</b> (cada raza con su color y símbolo). Elige uno, escribe tu puja con <b>− / +</b> y pulsa <b>Pujar</b>: la puja es <b>sellada</b> (a ciegas) y gana quien ofrezca más. Si los dos pujáis por el <b>mismo héroe</b>, se abre una nueva tanda de pujas. '+
    'Cada ronda trae un <b>bonificador único</b> (no se repite en la partida): más monedas, ventajas… o un castigo al rival.</div></div></div>'+

    '<div class="rb-coin">'+
    '<div class="rb-coin-c"><div class="rb-coin-t">🪙 Monedas</div><div class="rb-coin-x">Empiezas con <b>100 de subasta</b> y <b>100 de equipamiento</b>. Si te quedas corto pujando, puedes <b>transferir</b> monedas del equipamiento a la subasta <b>de 10 en 10</b>. Al acabar toda la subasta, las monedas de subasta que te sobren se <b>suman</b> a tu presupuesto de equipamiento, junto con los <b>bonificadores positivos de equipamiento</b> que te hayan salido durante la subasta.</div></div>'+
    '<div class="rb-coin-c"><div class="rb-coin-t">✦ Cartas Épicas</div><div class="rb-coin-x">Las más poderosas: cuestan <b>+20 monedas</b>. No salen normalmente; ciertos bonificadores hacen que tú (o tu rival) recibáis una oferta Épica extra.</div></div>'+
    '<div class="rb-coin-c"><div class="rb-coin-t">🏦 ¿Sin monedas al final?</div><div class="rb-coin-x">Nunca te quedas sin tu tercer héroe: reclutas <b>con deuda</b> y lo que falte se resta de tu presupuesto de equipamiento.</div></div>'+
    '</div>'+

    '<div class="rb-step"><div class="rb-step-n">2</div><div class="rb-step-b"><div class="rb-step-t">Equipamiento</div><div class="rb-step-x">'+
    'Con tu presupuesto equipas a cada héroe con <b>1 arma</b> (cuerpo a cuerpo <i>o</i> distancia) y <b>1 armadura</b>: verás cómo cambian sus stats al momento. '+
    'Los <b>hechizos</b> (carta única, gastan maná) y los <b>objetos</b> (hasta 3 copias) van a tu <b>mano</b> para usarlos en batalla. Puedes quitar una carta comprada (×) y recuperar sus monedas.</div></div></div>'+

    '<div class="rb-step"><div class="rb-step-n">3</div><div class="rb-step-b"><div class="rb-step-t">Combate por rondas</div><div class="rb-step-x">'+
    'Orden de turnos: <b>distancia → hechizos → cuerpo a cuerpo</b> (si empatan, va antes quien tenga más velocidad). En cada carta: barra <b style="color:#7ce287">verde = vida</b> y barra <b style="color:#6ec6ff">azul = maná</b>. En el turno de cada héroe verás este <b>panel de acciones</b>:</div></div></div>'+

    '<div class="rb-actions">'+
    '<div class="rb-act"><div class="rb-act-im"><img src="${ACT_MELEE}"></div><div class="rb-act-t">Cuerpo a cuerpo</div><div class="rb-act-x">Golpe melé: daño = tu <b>CC</b> + arma.</div></div>'+
    '<div class="rb-act"><div class="rb-act-im"><img src="${ACT_SHOT}"></div><div class="rb-act-t">Disparo</div><div class="rb-act-x">Necesita arma a distancia; daño por potencia × tu <b>AD</b>.</div></div>'+
    '<div class="rb-act"><div class="rb-act-im"><img src="${ACT_SPELL}"></div><div class="rb-act-t">Hechizo</div><div class="rb-act-x">Usa <b>HE</b> y gasta <b>maná</b> 🔵.</div></div>'+
    '<div class="rb-act rb-act-ab"><div class="rb-act-im"><img src="${HE_EMB}"></div><div class="rb-act-b"><div class="rb-act-t">Habilidad del héroe</div><div class="rb-act-x">El poder especial propio de ese héroe (cada uno el suyo). Se lee en la franja dorada del panel; en forma Élite mejora.</div></div></div>'+
    '<div class="rb-act"><div class="rb-act-im"><img src="${ACT_OBJ}"></div><div class="rb-act-t">Objeto</div><div class="rb-act-x">Juega un objeto de tu mano (poción, maná…).</div></div>'+
    '<div class="rb-act"><div class="rb-act-im"><img src="${ACT_DEF}"></div><div class="rb-act-t">Defender</div><div class="rb-act-x">Te cubres: recibes menos daño este turno.</div></div>'+
    '<div class="rb-act"><div class="rb-act-im"><img src="${ACT_TANK}"></div><div class="rb-act-t">Tanquear</div><div class="rb-act-x">Atraes los ataques rivales para proteger al equipo.</div></div>'+
    '</div>'+
    '<div class="rb-cap">Así se ve el panel del héroe activo en batalla. Cada acción gasta el turno.</div>'+

    '<p style="margin:8px 0"><b>⚡ Maná:</b> es una reserva fija para toda la batalla que <b>no se regenera</b>. Recupéralo con el Cristal o el Orbe de Maná.</p>'+
    '<p style="margin:8px 0"><b>🛡️ Armaduras:</b> reducen el daño de golpes, disparos y hechizos. Las <b>elementales</b> anulan por completo su elemento contrario (agua↔fuego, rayo↔agua, hielo↔rayo, fuego↔hielo). La <b>Barrera Arcana</b> protege del daño mágico.</p>'+
    '<p style="margin:8px 0"><b style="color:#ffaa00">⭐ Forma Élite:</b> cuando un héroe cae por primera vez, <b>renace en Élite</b> con parte de su vida y stats mejorados según su raza (los No-muertos renacen con más). Si vuelve a caer, muere de verdad — salvo que uses <b>Pluma Fénix</b> (revive a un héroe) o <b>Ave Fénix</b> (cura a dos héroes a vida completa).</p>'+

    '<div style="margin:12px 0;padding:12px 14px;border-radius:14px;background:linear-gradient(135deg,rgba(28,16,46,.8),rgba(12,7,20,.9));border:1px solid rgba(255,210,74,.35)">'+
    '<div class="rb-step-t">✨ Estados de combate</div>'+
    '<div class="rb-states">'+
    st('#9b8cff','💤','Dormido','Pierde su próximo turno.')+
    st('#ffe14a','⚡','Paralizado','Pierde su próximo turno.')+
    st('#6ec6ff','❄️','Congelado','Actúa con velocidad reducida (va más tarde).')+
    st('#b05cff','☠️','Maldito','Reducción temporal de sus atributos.')+
    st('#ffd24a','✦','Bendito','Aumento temporal de sus atributos.')+
    st('#7ce287','🛡','Tanqueando','Intercepta los ataques a sus aliados hasta su próximo turno.')+
    st('#ff9c40','★','Confuso','2 turnos (3 en Élite): 50% de perder cada acción.')+
    st('#ff7ad9','🍺','Borracho','Recibe 3 de daño, −3 CC/AD/HE durante 2 turnos (3 en Élite) y 35% de fallar cada acción.')+
    st('#8fe3d9','💫','Mareado','−4 CC/AD/HE durante 2 turnos (3 con Gases Tóxicos Élite).')+
    '</div></div>'+

    '<p style="margin:8px 0 2px"><b>Consulta también las</b> <span class="rules-link" onclick="racesModal()">🧬 razas</span> y sus ventajas.</p>'+
    '</div>';
  }

  function install(){
    if(typeof window.rulesBody!=='function'||window.rulesBody.__bfHow)return false;
    window.rulesBody=function(){return bodyHtml();};
    window.rulesBody.__bfHow=1;
    return true;
  }
  var tries=0,iv=setInterval(function(){if(install()||tries++>100)clearInterval(iv);},200);
  install();

  // Título del modal: "Cómo se juega" → "Reglas".
  var TITLE=window.__bfLangEn?'Rules':'Reglas';
  function renameTitle(){
    document.querySelectorAll('.modal-title,.modal h3,.modal-head,.mdl-title,h3,h2').forEach(function(el){
      var t=(el.textContent||'').replace(/\\s+/g,' ').trim();
      if(/^[^A-Za-zÀ-ÿ]*(c[óo]mo se juega|how to play)[^A-Za-zÀ-ÿ]*$/i.test(t)){
        el.innerHTML=el.innerHTML.replace(/C[óo]mo se juega|How to play/i,TITLE);
      }
    });
  }
  setInterval(renameTitle,300);
  new MutationObserver(renameTitle).observe(document.documentElement,{childList:true,subtree:true});
})();
</script>
`;