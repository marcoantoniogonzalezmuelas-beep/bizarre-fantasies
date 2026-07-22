// Parche inyectado en el iframe: efectos de ATAQUE espectaculares por arma.
// - A distancia: proyectil visible del atacante al objetivo según el arma
//   (Tirachinas→piedra en arco, Ballesta→virote, Pistola/Metralleta→trazadores
//   + fogonazo, Cañón→bala+humo+explosión, Cañón de Plasma→orbe+estela,
//   Arco Élfico→flecha, Rifle de Fotones→rayo instantáneo) + impacto temático.
// - Cuerpo a cuerpo: golpe según el arma (Espada→tajo creciente, Daga→2 pinchazos
//   rápidos, Hacha→hachazo pesado, Maza→grietas+polvo, Espada Plasmática→tajo
//   de energía, Martillo del Trueno→grietas+relámpagos+onda de choque).
// Envuelve pushFx (para añadir el atacante al evento 'slash' vía B.current) y
// flushFx (renderiza proyectiles/golpes propios y filtra el arrow/slash simple
// original). No toca la lógica del juego: solo capas visuales position:fixed.
export const ATTACK_FX_PATCH = `
<script>
(function(){
  if (window.__bfAttackFxPatch) return;
  window.__bfAttackFxPatch = true;

  var st = document.createElement('style');
  st.textContent = [
    '.bf-afx{position:fixed;pointer-events:none;z-index:90026}',
    // ---- proyectiles ----
    '.bf-stone{width:30px;height:30px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#9a9a9a,#5a5a5a 70%,#2a2a2a);box-shadow:0 2px 5px rgba(0,0,0,.55)}',
    '.bf-bolt2{width:56px;height:10px;background:linear-gradient(90deg,#3a2a18,#8a6238 50%,#6b4a2a);border-radius:2px;box-shadow:0 0 4px rgba(0,0,0,.5)}',
    '.bf-tracer{width:50px;height:6px;background:linear-gradient(90deg,transparent,#ffe14a 40%,#fff);border-radius:2px;box-shadow:0 0 8px #ffe14a}',
    '.bf-ball{width:44px;height:44px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#555,#1a1a1a 70%,#000);box-shadow:0 3px 8px rgba(0,0,0,.6)}',
    '.bf-plasma-orb{width:40px;height:40px;border-radius:50%;background:radial-gradient(circle,#fff 0%,#7ad6ff 35%,#3a8fe0 65%,transparent 78%);box-shadow:0 0 18px rgba(90,200,255,.95),0 0 36px rgba(90,200,255,.5)}',
    '.bf-arrow2{width:62px;height:9px;background:linear-gradient(90deg,#3a8f4a,#6fd98a 60%,#fff);border-radius:2px;box-shadow:0 0 6px rgba(120,220,140,.7)}',
    '.bf-beam{height:10px;border-radius:3px;background:linear-gradient(90deg,transparent,#fff 20%,#7ad6ff 50%,#fff 80%,transparent);box-shadow:0 0 14px #7ad6ff,0 0 30px rgba(120,200,255,.6)}',
    '.bf-muzzle{width:58px;height:58px;border-radius:50%;background:radial-gradient(circle,#fff,#ffe14a 40%,transparent 70%);transform:translate(-50%,-50%)}',
    '.bf-smoke-trail{width:12px;height:12px;border-radius:50%;background:radial-gradient(circle,rgba(180,180,180,.7),transparent 70%);transform:translate(-50%,-50%)}',
    '.bf-plasma-trail{width:14px;height:14px;border-radius:50%;background:radial-gradient(circle,rgba(120,200,255,.85),transparent 70%);transform:translate(-50%,-50%)}',
    // ---- impactos ----
    '.bf-dust{width:92px;height:92px;border-radius:50%;background:radial-gradient(circle,rgba(200,180,150,.85),transparent 70%);transform:translate(-50%,-50%);animation:bfPuff 1.5s ease-out forwards}',
    '@keyframes bfPuff{0%{transform:translate(-50%,-50%) scale(.3);opacity:1}100%{transform:translate(-50%,-50%) scale(1.8);opacity:0}}',
    '.bf-spark{width:9px;height:9px;border-radius:50%;background:#ffe14a;box-shadow:0 0 6px #ffe14a;transform:translate(-50%,-50%)}',
    '.bf-boom{width:34px;height:34px;border-radius:50%;background:radial-gradient(circle,#fff 0%,#ffe27a 25%,#ff6a14 55%,transparent 72%);transform:translate(-50%,-50%);animation:bfBoom 1.7s ease-out forwards;filter:drop-shadow(0 0 16px rgba(255,120,30,.9))}',
    '@keyframes bfBoom{0%{transform:translate(-50%,-50%) scale(.3);opacity:0}20%{opacity:1}100%{transform:translate(-50%,-50%) scale(6);opacity:0}}',
    '.bf-boom-ring{width:34px;height:34px;border-radius:50%;border:4px solid rgba(255,140,40,.9);transform:translate(-50%,-50%);animation:bfBoomRing 1.7s ease-out forwards}',
    '@keyframes bfBoomRing{0%{transform:translate(-50%,-50%) scale(.3);opacity:0}25%{opacity:1}100%{transform:translate(-50%,-50%) scale(5);opacity:0;border-width:1px}}',
    '.bf-plasma-boom{width:34px;height:34px;border-radius:50%;background:radial-gradient(circle,#fff,#7ad6ff 40%,transparent 72%);transform:translate(-50%,-50%);animation:bfBoom 1.7s ease-out forwards;filter:drop-shadow(0 0 18px rgba(90,200,255,.95))}',
    // ---- golpes cuerpo a cuerpo ----
    '.bf-slash-arc{width:200px;height:200px;border-radius:50%;transform:translate(-50%,-50%) rotate(var(--rot,30deg));border:10px solid transparent;border-top-color:rgba(255,255,255,.95);border-right-color:rgba(255,255,255,.7);box-shadow:0 0 18px rgba(255,255,255,.6);animation:bfSlash 1.4s ease-out forwards}',
    '@keyframes bfSlash{0%{transform:translate(-50%,-50%) rotate(var(--rot,30deg)) scale(.4);opacity:0}30%{opacity:1}100%{transform:translate(-50%,-50%) rotate(calc(var(--rot,30deg) + 65deg)) scale(1.35);opacity:0}}',
    '.bf-slash-axe{border-top-color:#c8d0d8!important;border-right-color:#8a929c!important;box-shadow:0 0 18px rgba(180,190,200,.6)!important;border-width:14px!important}',
    '.bf-slash-psword{border-top-color:#7ad6ff!important;border-right-color:#3a8fe0!important;box-shadow:0 0 22px rgba(90,200,255,.9)!important}',
    '.bf-crack{width:150px;height:150px;transform:translate(-50%,-50%);background:conic-gradient(from 0deg,transparent 0 10deg,rgba(255,255,255,.85) 11deg 13deg,transparent 14deg 60deg,rgba(255,255,255,.85) 61deg 63deg,transparent 64deg 120deg,rgba(255,255,255,.7) 121deg 123deg,transparent 124deg);animation:bfCrack 1.5s ease-out forwards}',
    '@keyframes bfCrack{0%{transform:translate(-50%,-50%) scale(.2) rotate(0);opacity:1}100%{transform:translate(-50%,-50%) scale(1.5) rotate(20deg);opacity:0}}',
    '.bf-thunder-bolt{position:fixed;width:11px;background:linear-gradient(180deg,#fff,#ffe14a 40%,#bfe0ff);box-shadow:0 0 10px #ffe14a,0 0 22px rgba(120,200,255,.8);transform:translateX(-50%);animation:bfTbolt 1.5s ease-out forwards;clip-path:polygon(60% 0,80% 25%,40% 50%,70% 80%,30% 100%,20% 80%,55% 50%,25% 25%)}',
    '@keyframes bfTbolt{0%{opacity:0}15%{opacity:1}100%{opacity:0}}',
    '.bf-shock-ring{width:52px;height:52px;border-radius:50%;border:8px solid rgba(255,225,74,.9);transform:translate(-50%,-50%);animation:bfShock 1.6s ease-out forwards}',
    '@keyframes bfShock{0%{transform:translate(-50%,-50%) scale(.3);opacity:0}25%{opacity:1}100%{transform:translate(-50%,-50%) scale(3.2);opacity:0;border-width:1px}}',
    // ---- estilo anime ----
    '.bf-wspr{width:185px;height:auto;filter:drop-shadow(0 4px 10px rgba(0,0,0,.65)) drop-shadow(0 0 8px rgba(255,255,255,.22))}',
    '.bf-wpn{width:120px;height:120px;border-radius:18px;border:2.5px solid #ffd24a;background:#0b0714 center/cover no-repeat;box-shadow:0 0 20px rgba(255,210,74,.85),0 8px 22px rgba(0,0,0,.7);transform:translate(-50%,-50%)}',
    '.bf-wpn-emoji{display:flex;align-items:center;justify-content:center;font-size:66px}',
    '.bf-lines{width:290px;height:290px;transform:translate(-50%,-50%);border-radius:50%;background:repeating-conic-gradient(rgba(255,255,255,.95) 0 1.6deg,transparent 1.6deg 13deg);-webkit-mask:radial-gradient(circle,transparent 32%,#000 46%,transparent 74%);mask:radial-gradient(circle,transparent 32%,#000 46%,transparent 74%);animation:bfLines 1.45s ease-out forwards}',
    '@keyframes bfLines{0%{opacity:0;transform:translate(-50%,-50%) scale(.5)}25%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1.65)}}',
    '.bf-hitstar{width:190px;height:190px;transform:translate(-50%,-50%);background:#fff;clip-path:polygon(50% 0,60% 38%,100% 32%,66% 55%,85% 100%,50% 68%,15% 100%,34% 55%,0 32%,40% 38%);filter:drop-shadow(0 0 18px #ffe14a);animation:bfHitStar 1.4s ease-out forwards}',
    '@keyframes bfHitStar{0%{transform:translate(-50%,-50%) scale(.2) rotate(-25deg);opacity:0}20%{opacity:1}60%{transform:translate(-50%,-50%) scale(1.08) rotate(6deg)}100%{transform:translate(-50%,-50%) scale(1.28) rotate(12deg);opacity:0}}',
    '.bf-streak{height:25px;color:#fff;background:linear-gradient(90deg,transparent,currentColor 25%,#fff 50%,currentColor 75%,transparent);border-radius:8px;filter:drop-shadow(0 0 14px currentColor);animation:bfStreak 1.3s ease-out forwards}',
    '@keyframes bfStreak{0%{opacity:0;transform:translate(-50%,-50%) rotate(var(--rot,0deg)) scaleX(.2)}25%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) rotate(var(--rot,0deg)) scaleX(1.55)}}'
  ].join('');
  document.head.appendChild(st);

  function centerOf(side,id){ var el=document.getElementById('b_'+side+'_'+id); if(!el)return null; var r=el.getBoundingClientRect(); return {x:r.left+r.width/2,y:r.top+r.height/2}; }
  function getAttacker(side,id){ try{ return (typeof getHero==='function')?getHero(side,id):null; }catch(e){ return null; } }
  function spawn(node,ms){ document.body.appendChild(node); setTimeout(function(){ if(node&&node.parentNode)node.parentNode.removeChild(node); },ms||800); }
  function angle(a,b){ return Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI; }
  function dist(a,b){ return Math.hypot(b.x-a.x,b.y-a.y); }

  var RANGED_KIND={rw_sling:'sling',rw_cross:'bolt',rw_pistol:'bullet',rw_smg:'bullet',rw_cannon:'cannon',rw_plasma:'plasma',rw_elfbow:'arrow',rw_photon:'photon'};
  var MELEE_KIND={mw_sword:'sword',mw_dagger:'dagger',mw_axe:'axe',mw_mace:'mace',mw_plasma:'psword',mw_thunder:'thunder'};

  function shoot(cls,a,b,ms,arc){
    var p=document.createElement('div'); p.className='bf-afx '+cls;
    p.style.transform='translate(-50%,-50%) rotate('+angle(a,b)+'deg)';
    var kf=[{left:a.x+'px',top:a.y+'px',opacity:1}];
    if(arc){ kf.push({left:((a.x+b.x)/2)+'px',top:((a.y+b.y)/2-60)+'px',opacity:1}); }
    kf.push({left:b.x+'px',top:b.y+'px',opacity:1});
    p.animate(kf,{duration:ms,easing:arc?'ease-in':'linear',fill:'forwards'});
    document.body.appendChild(p);
    setTimeout(function(){ if(p.parentNode)p.parentNode.removeChild(p); },ms+50);
  }
  function trail(cls,a,b,ms,count){
    for(var i=0;i<count;i++){ (function(i){ setTimeout(function(){ var t=document.createElement('div'); t.className='bf-afx '+cls; var f=(i+1)/count; t.style.left=(a.x+(b.x-a.x)*f)+'px'; t.style.top=(a.y+(b.y-a.y)*f)+'px'; t.animate([{opacity:.8},{opacity:0}],{duration:320,fill:'forwards'}); document.body.appendChild(t); setTimeout(function(){ if(t.parentNode)t.parentNode.removeChild(t); },340); }, ms*(i/count)); })(i); }
  }
  function muzzle(a){ var m=document.createElement('div'); m.className='bf-afx bf-muzzle'; m.style.left=a.x+'px'; m.style.top=a.y+'px'; spawn(m,260); }
  function impactSparks(b,n,col){ for(var i=0;i<n;i++){ var s=document.createElement('div'); s.className='bf-afx bf-spark'; if(col){s.style.background=col;s.style.boxShadow='0 0 6px '+col;} s.style.left=b.x+'px'; s.style.top=b.y+'px'; var ang=Math.random()*Math.PI*2, d=50+Math.random()*85; s.animate([{transform:'translate(-50%,-50%)',opacity:1},{transform:'translate(calc(-50% + '+(Math.cos(ang)*d)+'px),calc(-50% + '+(Math.sin(ang)*d)+'px))',opacity:0}],{duration:1620,easing:'ease-out',fill:'forwards'}); spawn(s,1640); } }
  function dustAt(b){ var d=document.createElement('div'); d.className='bf-afx bf-dust'; d.style.left=b.x+'px'; d.style.top=b.y+'px'; spawn(d,1520); }
  function boomAt(b,cls,ringCol){ var bo=document.createElement('div'); bo.className='bf-afx '+cls; bo.style.left=b.x+'px'; bo.style.top=b.y+'px'; spawn(bo,1720); var r=document.createElement('div'); r.className='bf-afx bf-boom-ring'; if(ringCol)r.style.borderColor=ringCol; r.style.left=b.x+'px'; r.style.top=b.y+'px'; spawn(r,1720); }

  // ---- helpers estilo anime ----
  // Arte real de las armas: se pide a la página (base de datos de cartas).
  var __bfWpnArt={};
  window.addEventListener('message',function(e){ if(e.data&&e.data.bfArtMap){ for(var k in e.data.bfArtMap)__bfWpnArt[k]=e.data.bfArtMap[k]; } });
  try{ window.parent.postMessage({bfArtMapRequest:1},'*'); }catch(e){}
  var WPN_EMOJI={sling:'🪨',bolt:'🎯',bullet:'🔫',cannon:'💣',plasma:'🔫',arrow:'🏹',photon:'🔫',sword:'⚔️',dagger:'🗡️',axe:'🪓',mace:'🔨',psword:'⚔️',thunder:'🔨'};
  // Sprites de arma dibujados en estilo anime: el arma en sí se anima haciendo
  // el ataque (apuntar + retroceso a distancia, tajo en cuerpo a cuerpo).
  var SPR='https://base44.app/api/apps/6a39c9aee54efe3a86d6d69a/files/mp/public/6a39c9aee54efe3a86d6d69a/';
  var WPN_SPRITE={
    rw_sling:SPR+'ca9cb3879_rw_sling_sprite.png',
    rw_cross:SPR+'aba935dda_rw_cross_sprite.png',
    rw_pistol:SPR+'d5af8d097_rw_pistol_sprite.png',
    rw_smg:SPR+'c5c045283_rw_smg_sprite.png',
    rw_cannon:SPR+'70d47891a_rw_cannon_sprite.png',
    rw_plasma:SPR+'9a92a0b5f_rw_plasma_sprite.png',
    rw_elfbow:SPR+'403b6de62_rw_elfbow_sprite.png',
    rw_photon:SPR+'de8abfb0c_rw_photon_sprite.png',
    mw_sword:SPR+'e4a5f3efc_mw_sword_sprite.png',
    mw_dagger:SPR+'49c60a8f6_mw_dagger_sprite.png',
    mw_axe:SPR+'5d29f4ee6_mw_axe_sprite.png',
    mw_mace:SPR+'b83ce20a5_mw_mace_sprite.png',
    mw_plasma:SPR+'01bae4d1b_mw_plasma_sprite.png',
    mw_thunder:SPR+'a9d8d0e3e_mw_thunder_sprite.png'
  };
  // Precarga para que el arma aparezca sin retraso en el primer ataque.
  for(var sk in WPN_SPRITE){ var pi=new Image(); pi.src=WPN_SPRITE[sk]; }
  // Arma a distancia: aparece junto al atacante apuntando al objetivo y da un
  // culatazo (retroceso) en el momento del disparo.
  function showRangedWeapon(a,b,wid){
    var url=WPN_SPRITE[wid]; if(!url)return false;
    var ang=angle(a,b);
    var flip=(b.x<a.x)?' scaleY(-1)':'';
    var rad=ang*Math.PI/180, rx=-Math.cos(rad)*14, ry=-Math.sin(rad)*14;
    var img=document.createElement('img'); img.src=url; img.className='bf-afx bf-wspr';
    img.style.left=a.x+'px'; img.style.top=a.y+'px';
    var base='rotate('+ang+'deg)'+flip;
    img.animate([
      {opacity:0,transform:'translate(-50%,-50%) '+base+' scale(.35)'},
      {opacity:1,transform:'translate(-50%,-50%) '+base+' scale(1)',offset:.16},
      {opacity:1,transform:'translate(calc(-50% + '+rx+'px),calc(-50% + '+ry+'px)) rotate('+(ang-6)+'deg)'+flip+' scale(1.04)',offset:.3},
      {opacity:1,transform:'translate(-50%,-50%) '+base,offset:.55},
      {opacity:0,transform:'translate(-50%,-50%) '+base+' scale(.85)'}
    ],{duration:1950,easing:'ease-out',fill:'forwards'});
    document.body.appendChild(img); setTimeout(function(){ if(img.parentNode)img.parentNode.removeChild(img); },1980);
    return true;
  }
  // Arma cuerpo a cuerpo: viaja del atacante al objetivo describiendo un tajo
  // (giro de -80° a +55°) y se desvanece en el impacto.
  function showMeleeWeapon(a,b,wid){
    var url=WPN_SPRITE[wid]; if(!url)return false;
    var t=(b.x>=a.x)?1:-1;
    var flip=(t<0)?' scaleX(-1)':'';
    var mx=a.x+(b.x-a.x)*.82, my=a.y+(b.y-a.y)*.82;
    var img=document.createElement('img'); img.src=url; img.className='bf-afx bf-wspr';
    img.style.transformOrigin='50% 85%';
    img.animate([
      {left:a.x+'px',top:a.y+'px',opacity:0,transform:'translate(-50%,-80%) rotate('+(-85*t)+'deg)'+flip},
      {left:(a.x+(mx-a.x)*.35)+'px',top:(a.y+(my-a.y)*.35)+'px',opacity:1,transform:'translate(-50%,-80%) rotate('+(-45*t)+'deg)'+flip,offset:.35},
      {left:mx+'px',top:my+'px',opacity:1,transform:'translate(-50%,-80%) rotate('+(55*t)+'deg)'+flip,offset:.72},
      {left:mx+'px',top:my+'px',opacity:0,transform:'translate(-50%,-80%) rotate('+(62*t)+'deg)'+flip}
    ],{duration:1430,easing:'cubic-bezier(.4,0,.6,1)',fill:'forwards'});
    document.body.appendChild(img); setTimeout(function(){ if(img.parentNode)img.parentNode.removeChild(img); },1460);
    return true;
  }
  function weaponShow(a,b,wname,kind){
    var w=document.createElement('div'); w.className='bf-afx bf-wpn';
    var url=wname&&__bfWpnArt[wname];
    if(url) w.style.backgroundImage='url("'+url+'")';
    else { w.classList.add('bf-wpn-emoji'); w.textContent=WPN_EMOJI[kind]||'⚔️'; }
    var dx=b.x-a.x, dy=b.y-a.y, d=Math.hypot(dx,dy)||1;
    w.style.left=(a.x+dx/d*46)+'px'; w.style.top=(a.y+dy/d*46-26)+'px';
    var t=dx>=0?1:-1;
    w.animate([
      {opacity:0,transform:'translate(-50%,-50%) scale(.25) rotate('+(-32*t)+'deg)'},
      {opacity:1,transform:'translate(-50%,-50%) scale(1.14) rotate('+(10*t)+'deg)',offset:.22},
      {opacity:1,transform:'translate(-50%,-50%) scale(1) rotate('+(-6*t)+'deg)',offset:.62},
      {opacity:0,transform:'translate(-50%,-50%) scale(.8) rotate(0deg)'}
    ],{duration:1760,easing:'ease-out',fill:'forwards'});
    document.body.appendChild(w); setTimeout(function(){ if(w.parentNode)w.parentNode.removeChild(w); },1790);
  }
  function speedLines(a){ var l=document.createElement('div'); l.className='bf-afx bf-lines'; l.style.left=a.x+'px'; l.style.top=a.y+'px'; spawn(l,1470); }
  function hitStar(b){ var s=document.createElement('div'); s.className='bf-afx bf-hitstar'; s.style.left=b.x+'px'; s.style.top=b.y+'px'; spawn(s,1440); }
  function streak(b,col,rotv,len){ var s=document.createElement('div'); s.className='bf-afx bf-streak'; s.style.color=col||'#fff'; s.style.width=(len||240)+'px'; s.style.left=b.x+'px'; s.style.top=b.y+'px'; s.style.setProperty('--rot',rotv+'deg'); spawn(s,1360); }
  function shake(side,id){
    var el=document.getElementById('b_'+side+'_'+id); if(!el||!el.animate)return;
    el.animate([{transform:'translate(0,0)'},{transform:'translate(-7px,3px)'},{transform:'translate(6px,-4px)'},{transform:'translate(-4px,2px)'},{transform:'translate(3px,-1px)'},{transform:'translate(0,0)'}],{duration:340,easing:'ease-out'});
    el.animate([{filter:'brightness(1)'},{filter:'brightness(2.1) saturate(1.4)'},{filter:'brightness(1)'}],{duration:260});
  }
  function lunge(side,id,to){
    var el=document.getElementById('b_'+side+'_'+id); if(!el||!el.animate)return;
    var r=el.getBoundingClientRect(); var dx=to.x-(r.left+r.width/2), dy=to.y-(r.top+r.height/2);
    var d=Math.hypot(dx,dy)||1; var f=Math.min(54,d*.3)/d;
    el.animate([{transform:'translate(0,0)'},{transform:'translate('+(dx*f)+'px,'+(dy*f)+'px) rotate('+(dx>=0?4:-4)+'deg)',offset:.45},{transform:'translate(0,0)'}],{duration:400,easing:'cubic-bezier(.3,1.3,.4,1)'});
  }
  // Sprites anime para habilidades, hechizos, objetos e invocaciones.
  var FX_SPRITE={
    ab_melee:SPR+'c220f1fe2_ab_melee_sprite.png',
    ab_ranged:SPR+'71f9a35f3_ab_ranged_sprite.png',
    ab_magic:SPR+'15c3c44bc_ab_magic_sprite.png',
    ab_holy:SPR+'63f03f4e5_ab_holy_sprite.png',
    ab_buff:SPR+'b5f91e757_ab_buff_sprite.png',
    ab_debuff:SPR+'4be89ef48_ab_debuff_sprite.png',
    ab_duck:SPR+'f3f3dfbfe_ab_duck_sprite.png',
    ab_reflect:SPR+'adb66bc46_ab_reflect_sprite.png',
    sp_agua:SPR+'141dd9214_sp_agua_sprite.png',
    sp_fuego:SPR+'c7b4ea7b8_sp_fuego_sprite.png',
    sp_hielo:SPR+'35def6d77_sp_hielo_sprite.png',
    sp_rayo:SPR+'fc333ef9e_sp_rayo_sprite.png',
    ob_heal:SPR+'1924fbec9_ob_heal_sprite.png',
    ob_shield:SPR+'1752ced6a_ob_shield_sprite.png',
    ob_cleanse:SPR+'fc4eeefca_ob_cleanse_sprite.png',
    ob_bomb:SPR+'8e99fab3f_ob_bomb_sprite.png',
    ob_mana:SPR+'e8251749e_ob_mana_sprite.png',
    ob_revive:SPR+'702aec3af_ob_revive_sprite.png',
    summon_portal:SPR+'88de6b78e_summon_portal_sprite.png'
  };
  for(var fk in FX_SPRITE){ var fi=new Image(); fi.src=FX_SPRITE[fk]; }
  // Aparición dramática de un sprite sobre un punto (habilidades, objetos,
  // invocaciones): entra con pop + giro, se asienta y se desvanece elevándose.
  function spriteBurst(key,c,size,ms){
    var url=FX_SPRITE[key]; if(!url)return false;
    size=size||210; ms=ms||2050;
    var img=document.createElement('img'); img.src=url; img.className='bf-afx';
    img.style.width=size+'px'; img.style.left=c.x+'px'; img.style.top=c.y+'px';
    img.style.filter='drop-shadow(0 6px 14px rgba(0,0,0,.7)) drop-shadow(0 0 12px rgba(255,255,255,.3))';
    img.animate([
      {opacity:0,transform:'translate(-50%,-58%) scale(.15) rotate(-18deg)'},
      {opacity:1,transform:'translate(-50%,-58%) scale(1.22) rotate(5deg)',offset:.2},
      {opacity:1,transform:'translate(-50%,-58%) scale(.98) rotate(-2deg)',offset:.38},
      {opacity:1,transform:'translate(-50%,-58%) scale(1.05) rotate(0deg)',offset:.72},
      {opacity:0,transform:'translate(-50%,-70%) scale(1.25)'}
    ],{duration:ms,easing:'ease-out',fill:'forwards'});
    document.body.appendChild(img); setTimeout(function(){ if(img.parentNode)img.parentNode.removeChild(img); },ms+40);
    return true;
  }
  // Sprite que vuela girando hasta el objetivo (hechizos ofensivos).
  function spriteFly(key,a,b,ms,size){
    var url=FX_SPRITE[key]; if(!url)return false;
    ms=ms||1620; size=size||190;
    var img=document.createElement('img'); img.src=url; img.className='bf-afx';
    img.style.width=size+'px';
    img.style.filter='drop-shadow(0 0 16px rgba(255,255,255,.4))';
    img.animate([
      {left:a.x+'px',top:a.y+'px',opacity:0,transform:'translate(-50%,-50%) scale(.3) rotate(-30deg)'},
      {left:(a.x+(b.x-a.x)*.25)+'px',top:(a.y+(b.y-a.y)*.25)+'px',opacity:1,transform:'translate(-50%,-50%) scale(.9) rotate(-8deg)',offset:.25},
      {left:b.x+'px',top:b.y+'px',opacity:1,transform:'translate(-50%,-50%) scale(1.2) rotate(10deg)',offset:.88},
      {left:b.x+'px',top:b.y+'px',opacity:0,transform:'translate(-50%,-50%) scale(1.5) rotate(14deg)'}
    ],{duration:ms,easing:'ease-in',fill:'forwards'});
    document.body.appendChild(img); setTimeout(function(){ if(img.parentNode)img.parentNode.removeChild(img); },ms+40);
    return true;
  }
  // Ayudantes compartidos con los demás parches (hechizos, habilidades, objetos).
  window.__bfAnime={hitStar:hitStar,speedLines:speedLines,streak:streak,shake:shake,lunge:lunge,spriteBurst:spriteBurst,spriteFly:spriteFly};

  function rangedFx(ev){
    var a=centerOf(ev.fromSide,ev.fromId), b=centerOf(ev.toSide,ev.toId); if(!a||!b)return;
    var h=getAttacker(ev.fromSide,ev.fromId); var w=h&&h.rwep; var wid=(w&&w.id)||'';
    var kind=RANGED_KIND[wid]||'arrow';
    var hits=ev.hits||1;
    // Compás anime: primero aparece el arma apuntando (sprite animado con
    // retroceso; si no hay sprite, la carta), luego el disparo.
    if(!showRangedWeapon(a,b,wid))weaponShow(a,b,w&&w.name,kind);
    speedLines(a);
    function impact(extra){ hitStar(b); shake(ev.toSide,ev.toId); if(extra)extra(); }
    var L=200;
    if(kind==='sling'){ setTimeout(function(){ shoot('bf-stone',a,b,1520,true); setTimeout(function(){ impact(function(){ dustAt(b); }); },1520); },L); }
    else if(kind==='bolt'){ setTimeout(function(){ shoot('bf-bolt2',a,b,1430,false); setTimeout(function(){ impact(function(){ impactSparks(b,5,'#c8a060'); dustAt(b); }); },1430); },L); }
    else if(kind==='bullet'){ setTimeout(function(){ muzzle(a); for(var i=0;i<hits;i++){ (function(i){ setTimeout(function(){ shoot('bf-tracer',a,b,480,false); setTimeout(function(){ impact(function(){ impactSparks(b,7,'#ffe14a'); }); },480); }, i*300); })(i); } },L); }
    else if(kind==='cannon'){ setTimeout(function(){ shoot('bf-ball',a,b,1640,false); trail('bf-smoke-trail',a,b,1640,6); setTimeout(function(){ impact(function(){ boomAt(b,'bf-boom',null); impactSparks(b,10,'#ff8a2a'); }); },1640); },L); }
    else if(kind==='plasma'){ setTimeout(function(){ shoot('bf-plasma-orb',a,b,1560,false); trail('bf-plasma-trail',a,b,1560,6); setTimeout(function(){ impact(function(){ boomAt(b,'bf-plasma-boom','rgba(90,200,255,.9)'); }); },1560); },L); }
    else if(kind==='photon'){ setTimeout(function(){ var d=dist(a,b),ang=angle(a,b); var be=document.createElement('div'); be.className='bf-afx bf-beam'; be.style.left=a.x+'px'; be.style.top=a.y+'px'; be.style.width=d+'px'; be.style.transform='rotate('+ang+'deg)'; be.style.transformOrigin='0 50%'; be.animate([{opacity:0},{opacity:1,offset:.2},{opacity:0}],{duration:1380,fill:'forwards'}); document.body.appendChild(be); spawn(be,1400); setTimeout(function(){ impact(function(){ boomAt(b,'bf-plasma-boom','rgba(90,200,255,.9)'); impactSparks(b,8,'#7ad6ff'); }); },400); },L); }
    else { setTimeout(function(){ shoot('bf-arrow2',a,b,1460,false); setTimeout(function(){ impact(function(){ impactSparks(b,6,'#6fd98a'); }); },1460); },L); }
  }

  function meleeFx(ev){
    var b=centerOf(ev.toSide,ev.toId); if(!b)return;
    var h=ev.fromSide?getAttacker(ev.fromSide,ev.fromId):null; var w=h&&h.mwep; var wid=(w&&w.id)||'';
    var kind=MELEE_KIND[wid]||'sword';
    var a=ev.fromSide?centerOf(ev.fromSide,ev.fromId):null;
    // Compás anime: el arma aparece junto al atacante, que embiste hacia el
    // objetivo; el golpe (tajos + estrella de impacto + sacudida) llega después.
    if(a){ if(!showMeleeWeapon(a,b,wid))weaponShow(a,b,w&&w.name,kind); lunge(ev.fromSide,ev.fromId,b); }
    var D=a?1040:0;
    setTimeout(function(){
      hitStar(b); shake(ev.toSide,ev.toId);
      if(kind==='dagger'){ streak(b,'#dff3ff',-25,190); setTimeout(function(){ streak(b,'#dff3ff',35,190); },90); setTimeout(function(){ streak(b,'#fff',5,225); },180); }
      else if(kind==='axe'){ streak(b,'#c8d0d8',78,280); dustAt(b); impactSparks(b,6,'#c8d0d8'); }
      else if(kind==='mace'){ var c=document.createElement('div'); c.className='bf-afx bf-crack'; c.style.left=b.x+'px'; c.style.top=b.y+'px'; spawn(c,1520); dustAt(b); var r0=document.createElement('div'); r0.className='bf-afx bf-shock-ring'; r0.style.borderColor='rgba(200,180,150,.85)'; r0.style.left=b.x+'px'; r0.style.top=b.y+'px'; spawn(r0,1620); }
      else if(kind==='psword'){ streak(b,'#7ad6ff',-30,280); setTimeout(function(){ streak(b,'#a5e4ff',40,280); },110); impactSparks(b,8,'#7ad6ff'); }
      else if(kind==='thunder'){ var c=document.createElement('div'); c.className='bf-afx bf-crack'; c.style.left=b.x+'px'; c.style.top=b.y+'px'; spawn(c,1520); var r=document.createElement('div'); r.className='bf-afx bf-shock-ring'; r.style.left=b.x+'px'; r.style.top=b.y+'px'; spawn(r,1620); for(var i=0;i<5;i++){ (function(i){ var bl=document.createElement('div'); bl.className='bf-afx bf-thunder-bolt'; var len=130; bl.style.left=b.x+'px'; bl.style.top=(b.y-len/2)+'px'; bl.style.height=len+'px'; bl.style.transform='translateX(-50%) rotate('+(i*72)+'deg)'; bl.style.transformOrigin='50% 100%'; spawn(bl,1520); })(i); } }
      else { streak(b,'#fff',-35,280); setTimeout(function(){ streak(b,'#ffe9c0',35,280); },110); impactSparks(b,5,'#fff'); }
    },D);
  }

  // 1) Enriquecer 'slash' con el atacante (B.current) al encolar.
  function hookPush(){
    if(typeof window.pushFx!=='function'||window.pushFx.__bfAfx)return;
    var orig=window.pushFx;
    window.pushFx=function(ev){ try{ if(ev&&ev.k==='slash'&&!ev.fromSide&&typeof B!=='undefined'&&B.current){ ev.fromSide=B.current.side; ev.fromId=B.current.id; } }catch(e){} return orig.apply(this,arguments); };
    window.pushFx.__bfAfx=1;
  }
  // 2) flushFx: renderizar proyectiles/golpes propios y filtrar arrow/slash simple.
  function hookFlush(){
    if(typeof window.flushFx!=='function'||window.flushFx.__bfAfx)return;
    var orig=window.flushFx;
    window.flushFx=function(list){
      try{ if(list&&list.length){ var filtered=[]; list.forEach(function(ev){ if(!ev)return; if(ev.k==='arrow'){rangedFx(ev);return;} if(ev.k==='slash'){meleeFx(ev);return;} filtered.push(ev); }); if(filtered.length)return orig.call(this,filtered); return; } }catch(e){}
      return orig.apply(this,arguments);
    };
    window.flushFx.__bfAfx=1;
  }
  function hook(){ hookPush(); hookFlush(); }
  var iv=setInterval(function(){ hook(); if(window.pushFx&&window.pushFx.__bfAfx&&window.flushFx&&window.flushFx.__bfAfx)clearInterval(iv); },200);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hook); else hook();
})();
</script>
`;