// ESCENAS NUEVAS para la animación final (se suman a los vídeos y salen al azar): se dibujan con CSS, así que no
// pesan nada y van en cualquier dispositivo. El título y los héroes van encima, como con los vídeos.
//   Victoria: fuegos artificiales · lluvia de oro · desfile de patitos.
//   Derrota:  tormenta · tomatazos · murciélagos y niebla.
export const END_SCENES_PATCH = `
<script>
(function(){
  if(window.__bfEndScenesReady)return;
  window.__bfEndScenesReady=true;
  window.__bfEndScenes={win:['fireworks','goldrain','ducks'],lose:['storm','tomatoes','bats']};
  var css=''
    +'#bf-end-cine .bf-scene{position:absolute;inset:0;z-index:0;overflow:hidden;pointer-events:none}'
    +'#bf-end-cine .bf-scene i,#bf-end-cine .bf-scene b{position:absolute;display:block;font-style:normal;font-weight:400}'
    // FUEGOS ARTIFICIALES
    +'.bf-sc-fireworks{background:radial-gradient(ellipse at 50% 120%,#3a1d5c 0%,#140a26 45%,#05030b 100%)}'
    +'.bf-sc-fireworks i{width:7px;height:7px;border-radius:50%;opacity:0;animation:bfEsFwSpark 1.7s ease-out infinite}'
    +'@keyframes bfEsFwSpark{0%{opacity:0;transform:translate(0,0) scale(.4)}12%{opacity:1}100%{opacity:0;transform:translate(var(--dx),var(--dy)) scale(1)}}'
    +'.bf-sc-fireworks b{width:3px;height:90px;bottom:-90px;opacity:0;background:linear-gradient(to top,transparent,rgba(255,235,180,.9));animation:bfEsFwRise 1.7s ease-in infinite}'
    +'@keyframes bfEsFwRise{0%{opacity:0;transform:translateY(0)}20%{opacity:1}55%{opacity:0;transform:translateY(-55vh)}100%{opacity:0;transform:translateY(-55vh)}}'
    // LLUVIA DE ORO
    +'.bf-sc-goldrain{background:radial-gradient(ellipse at 50% 30%,#5a3a07 0%,#241404 55%,#0a0602 100%)}'
    +'.bf-sc-goldrain::before{content:"";position:absolute;left:50%;top:20%;width:180vmax;height:180vmax;transform:translate(-50%,-50%);background:repeating-conic-gradient(rgba(255,210,74,.16) 0deg 8deg,transparent 8deg 22deg);animation:bfEsGrRays 18s linear infinite}'
    +'@keyframes bfEsGrRays{to{transform:translate(-50%,-50%) rotate(360deg)}}'
    +'.bf-sc-goldrain i{top:-8vh;font-size:clamp(18px,3vw,30px);animation:bfEsGrFall linear infinite}'
    +'.bf-sc-goldrain b{top:-6vh;width:8px;height:14px;border-radius:2px;animation:bfEsGrFall linear infinite}'
    +'@keyframes bfEsGrFall{0%{transform:translateY(0) rotate(0)}100%{transform:translateY(118vh) rotate(var(--rot))}}'
    // DESFILE DE PATITOS
    +'.bf-sc-ducks{background:linear-gradient(180deg,#ff9e5e 0%,#ffcf7a 35%,#7bc8ff 36%,#2f6fb3 100%)}'
    +'.bf-sc-ducks::after{content:"";position:absolute;left:0;right:0;bottom:0;height:22%;background:repeating-linear-gradient(90deg,rgba(255,255,255,.15) 0 40px,transparent 40px 80px),#2a5d97}'
    +'.bf-sc-ducks i{top:24%;font-size:clamp(30px,5vw,54px);animation:bfEsDuckWalk 9s linear infinite}'   // en el horizonte: no los tapan los héroes
    +'.bf-sc-ducks i::before{content:"\\\\1F451";position:absolute;left:50%;top:-55%;transform:translateX(-50%);font-size:.5em}'
    +'@keyframes bfEsDuckWalk{0%{transform:translateX(-12vw) translateY(0)}25%{transform:translateX(25vw) translateY(-6px)}50%{transform:translateX(60vw) translateY(0)}75%{transform:translateX(95vw) translateY(-6px)}100%{transform:translateX(122vw) translateY(0)}}'
    +'.bf-sc-ducks b{top:-6vh;width:8px;height:12px;border-radius:2px;animation:bfEsGrFall linear infinite}'
    // TORMENTA
    +'.bf-sc-storm{background:linear-gradient(180deg,#0b0d16 0%,#1a1f30 60%,#0a0b12 100%)}'
    +'.bf-sc-storm::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 30% 0%,rgba(80,90,120,.6),transparent 55%),radial-gradient(ellipse at 75% 5%,rgba(70,80,110,.55),transparent 50%)}'
    +'.bf-sc-storm::after{content:"";position:absolute;inset:0;background:#dfe8ff;opacity:0;animation:bfEsStFlash 4.2s steps(1,end) infinite}'
    +'@keyframes bfEsStFlash{0%,58%,64%,100%{opacity:0}60%{opacity:.28}62%{opacity:.08}63%{opacity:.2}}'
    +'.bf-sc-storm i{top:-20vh;width:2px;height:70px;background:linear-gradient(to bottom,transparent,rgba(180,200,255,.55));transform:rotate(12deg);animation:bfEsStRain linear infinite}'
    +'@keyframes bfEsStRain{0%{transform:translate(0,0) rotate(12deg)}100%{transform:translate(-22vh,130vh) rotate(12deg)}}'
    // TOMATAZOS
    +'.bf-sc-tomatoes{background:radial-gradient(ellipse at 50% 40%,#3a1212 0%,#1a0707 60%,#080303 100%)}'
    +'.bf-sc-tomatoes i{font-size:clamp(30px,5vw,56px);opacity:0;animation:bfEsTmFly 2.6s cubic-bezier(.3,.6,.4,1) infinite}'
    +'@keyframes bfEsTmFly{0%{opacity:0;transform:translate(var(--fx),var(--fy)) scale(.4) rotate(0)}10%{opacity:1}55%{opacity:1;transform:translate(0,0) scale(1.1) rotate(320deg)}60%{opacity:0;transform:translate(0,0) scale(1.4)}100%{opacity:0}}'
    +'.bf-sc-tomatoes b{width:90px;height:70px;margin:-35px 0 0 -45px;opacity:0;background:radial-gradient(circle at 50% 50%,#d61f1f 0 30%,rgba(214,31,31,.85) 31% 45%,transparent 46%),radial-gradient(circle at 20% 30%,#c41818 0 10%,transparent 11%),radial-gradient(circle at 80% 70%,#c41818 0 9%,transparent 10%);animation:bfEsTmSplat 2.6s ease-out infinite}'
    +'@keyframes bfEsTmSplat{0%,54%{opacity:0;transform:scale(.3)}60%{opacity:.95;transform:scale(1)}100%{opacity:0;transform:scale(1.05)}}'
    // MURCIÉLAGOS Y NIEBLA
    +'.bf-sc-bats{background:linear-gradient(180deg,#120b1d 0%,#1f1630 55%,#0b0712 100%)}'
    +'.bf-sc-bats::before,.bf-sc-bats::after{content:"";position:absolute;left:-50%;width:200%;height:40%;background:radial-gradient(ellipse at 25% 50%,rgba(170,160,200,.22),transparent 60%),radial-gradient(ellipse at 70% 60%,rgba(150,140,190,.2),transparent 60%);animation:bfEsFog 14s linear infinite}'
    +'.bf-sc-bats::before{bottom:18%}.bf-sc-bats::after{bottom:-4%;animation-duration:20s;animation-direction:reverse}'
    +'@keyframes bfEsFog{0%{transform:translateX(0)}100%{transform:translateX(25%)}}'
    +'.bf-sc-bats i{font-size:clamp(22px,3.6vw,40px);opacity:.9;animation:bfEsBatFly linear infinite}'
    +'@keyframes bfEsBatFly{0%{transform:translate(-15vw,0)}25%{transform:translate(20vw,-6vh)}50%{transform:translate(55vw,2vh)}75%{transform:translate(90vw,-5vh)}100%{transform:translate(125vw,0)}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  function r(a,b){ return a+Math.random()*(b-a); }
  var COLORS=['#ffd24a','#ff5ab8','#5ae0ff','#9dff6a','#ff8a3d','#c79bff','#ffffff'];
  window.__bfEndSceneHtml=function(name){
    var h='<div class="bf-scene bf-sc-'+name+'">',i,k;
    if(name==='fireworks'){
      for(k=0;k<6;k++){ var cx=r(12,88),cy=r(12,48),d=r(0,1.6),col=COLORS[k%COLORS.length];
        h+='<b style="left:'+cx+'%;animation-delay:'+(d-0.5).toFixed(2)+'s"></b>';
        for(i=0;i<14;i++){ var a=i/14*Math.PI*2,rr=r(60,130);
          h+='<i style="left:'+cx+'%;top:'+cy+'%;background:'+col+';box-shadow:0 0 8px '+col+';--dx:'+Math.round(Math.cos(a)*rr)+'px;--dy:'+Math.round(Math.sin(a)*rr)+'px;animation-delay:'+d.toFixed(2)+'s"></i>'; } }
    } else if(name==='goldrain'){
      for(i=0;i<22;i++)h+='<i style="left:'+r(0,98).toFixed(1)+'%;animation-duration:'+r(3,6).toFixed(2)+'s;animation-delay:-'+r(0,6).toFixed(2)+'s;--rot:'+Math.round(r(-540,540))+'deg">\\u{1FA99}</i>';
      for(i=0;i<36;i++)h+='<b style="left:'+r(0,99).toFixed(1)+'%;background:'+COLORS[i%COLORS.length]+';animation-duration:'+r(2.5,5).toFixed(2)+'s;animation-delay:-'+r(0,5).toFixed(2)+'s;--rot:'+Math.round(r(-720,720))+'deg"></b>';
    } else if(name==='ducks'){
      for(i=0;i<6;i++)h+='<i style="animation-delay:-'+(i*1.5).toFixed(2)+'s">\\u{1F986}</i>';
      for(i=0;i<30;i++)h+='<b style="left:'+r(0,99).toFixed(1)+'%;background:'+COLORS[i%COLORS.length]+';animation-duration:'+r(3,6).toFixed(2)+'s;animation-delay:-'+r(0,6).toFixed(2)+'s;--rot:'+Math.round(r(-720,720))+'deg"></b>';
    } else if(name==='storm'){
      for(i=0;i<60;i++)h+='<i style="left:'+r(0,130).toFixed(1)+'%;animation-duration:'+r(.7,1.2).toFixed(2)+'s;animation-delay:-'+r(0,1.2).toFixed(2)+'s"></i>';
    } else if(name==='tomatoes'){
      for(i=0;i<7;i++){ var tx=r(12,88),ty=r(14,60),dl=(i*0.37).toFixed(2),fx=(Math.random()<.5?-1:1)*Math.round(r(40,60))+'vw',fy=Math.round(r(10,40))+'vh';
        h+='<i style="left:'+tx+'%;top:'+ty+'%;--fx:'+fx+';--fy:'+fy+';animation-delay:'+dl+'s">\\u{1F345}</i><b style="left:'+tx+'%;top:'+ty+'%;animation-delay:'+dl+'s"></b>'; }
    } else if(name==='bats'){
      for(i=0;i<8;i++)h+='<i style="top:'+r(8,55).toFixed(1)+'%;animation-duration:'+r(5,9).toFixed(2)+'s;animation-delay:-'+r(0,9).toFixed(2)+'s">\\u{1F987}</i>';
    }
    return h+'</div>';
  };
})();
</script>
`;
