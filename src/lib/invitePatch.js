// INVITAR Y COMPARTIR.
//  · "🔗 Invitar con enlace" en la espera de la sala: comparte (móvil) o copia (ordenador) un enlace
//    https://<tu web>/?sala=CODIGO. Quien lo abre entra en el juego y se le abre directamente la ventana de unirse a
//    esa sala (la contraseña, si la tiene, la escribe él: el enlace no la lleva).
//  · "📸 Compartir resultado" en la pantalla final: imagen con VICTORIA/DERROTA, los dos jugadores y los 3 + 3
//    héroes; se comparte (móvil) o se descarga (ordenador).
export const INVITE_PATCH = `
<script>
(function(){
  if(window.__bfInvite)return;
  window.__bfInvite=true;
  // Dirección PÚBLICA del juego (la que ven los jugadores), no la interna de la plataforma.
  var PUBLIC_URL='https://bizarrefantasies.cronicasvetustas.com';
  function origin(){ return PUBLIC_URL; }
  function nav(){ try{ return window.parent.navigator; }catch(e){ return navigator; } }
  function say(t){ if(typeof notif==='function')notif(t); }

  // ---------- Invitar con enlace ----------
  window.bfInvite=function(){
    var code=(typeof NET!=='undefined'&&NET.code)||'';
    if(!code)return;
    var link=origin()+'/?sala='+encodeURIComponent(code);
    var text='\\u00a1Juega conmigo a Bizarre Fantasies! Sala '+code+(NET.pass?' (te dir\\u00e9 la contrase\\u00f1a)':'')+': ';
    var n=nav();
    if(n&&typeof n.share==='function'){ n.share({title:'Bizarre Fantasies',text:text,url:link}).catch(function(){}); return; }
    var done=function(){ say('\\u{1F517} Enlace copiado: p\\u00e9galo en WhatsApp o donde quieras.'); };
    try{ if(n&&n.clipboard){ n.clipboard.writeText(text+link).then(done,function(){ window.prompt('Copia el enlace:',link); }); return; } }catch(e){}
    window.prompt('Copia el enlace:',link);
  };
  // Se instala UNA sola vez: reinstalarse cada medio segundo apilaba capas sin fin con otros parches (miles en una partida larga → "too much recursion" y turnos atascados).
  var hookedLobby=false;
  function hookLobby(){
    if(hookedLobby||typeof window.renderLobby!=='function')return false;
    hookedLobby=true;
    var o=window.renderLobby;
    var w=function(stage){
      var r=o.apply(this,arguments);
      try{
        if(stage==='hostwait'){
          var code=document.querySelector('#s-lobby .room-code');
          if(code&&!document.getElementById('bf-invite-btn')){
            var b=document.createElement('button');
            b.id='bf-invite-btn';b.className='btn primary';b.style.margin='10px auto 4px';b.style.display='block';
            b.textContent='\\u{1F517} Invitar con enlace';b.onclick=function(){ window.bfInvite(); };
            code.parentNode.insertBefore(b,code.nextSibling);
          }
        }
      }catch(e){}
      return r;
    };
    w.__bfInvite=1;window.renderLobby=w;return true;
  }
  // Abrir el juego con ?sala=CODIGO: busca la sala en la lista y abre la ventana de unirse.
  function joinByLink(code){
    code=String(code||'').trim().toUpperCase();
    if(!code)return;
    try{ if(typeof show==='function')show('s-lobby'); if(typeof renderLobby==='function')renderLobby('browse'); }catch(e){}
    var tries=0;
    var iv=setInterval(function(){
      tries++;
      var rooms=(typeof LOBBY!=='undefined'&&LOBBY.rooms)||[];
      var room=rooms.find(function(r){ return r&&String(r.id||'').toUpperCase()===code; });
      if(room){ clearInterval(iv); if(typeof joinRoomFromList==='function')joinRoomFromList(room.id,!!room.hasPass); return; }
      if(tries%8===0&&typeof window.lobbyConnect==='function'){ try{ window.lobbyConnect(); }catch(e){} }
      if(tries>=40){ clearInterval(iv); say('No encuentro la sala '+code+': puede que ya haya empezado o se haya cerrado.'); }
    },500);
  }
  window.addEventListener('message',function(e){
    if(e&&e.data&&e.data.bfJoinRoom)joinByLink(e.data.bfJoinRoom);
    if(e&&e.data&&e.data.bfOpenBizarreRoom){ var tries=0; (function open(){ if(typeof window.bfOpenBizarreRoom==='function'){ try{ if(typeof show==='function')show('s-home'); }catch(x){} window.bfOpenBizarreRoom(); return; } if(++tries<40)setTimeout(open,250); })(); }
  });
  // Habitación Bizarra: enlace que la abre directamente a quien lo recibe.
  window.bfInviteBizarre=function(){
    var link=origin()+'/?habitacion=bizarra',text='\u00a1Ven a la Habitaci\u00f3n Bizarra de Bizarre Fantasies y echamos una partida!';
    var n=nav();
    if(n&&typeof n.share==='function'){ n.share({title:'Bizarre Fantasies',text:text,url:link}).catch(function(){}); return; }
    try{ if(n&&n.clipboard){ n.clipboard.writeText(text+' '+link).then(function(){ say('\u{1F517} Enlace copiado: p\u00e9galo en WhatsApp o donde quieras.'); },function(){ window.prompt('Copia el enlace:',link); }); return; } }catch(e){}
    window.prompt('Copia el enlace:',link);
  };
  // Botones de invitar donde de verdad se ven: en TU sala de la lista (tras crearla te quedas en la lista, no en la
  // pantalla de espera) y arriba en la Habitación Bizarra.
  function decorateInvites(){
    try{
      if(typeof NET!=='undefined'&&NET.role==='host'&&NET.code){
        document.querySelectorAll('.room-card').forEach(function(card){
          var c=card.querySelector('.room-sub b');
          if(!c||c.textContent.trim()!==NET.code||card.querySelector('.bf-invite-own'))return;
          var b=document.createElement('button');b.className='btn sm primary bf-invite-own';b.style.marginLeft='6px';b.textContent='\u{1F517} Invitar';
          b.onclick=function(ev){ ev.stopPropagation(); window.bfInvite(); };
          var join=card.querySelector('button');(join&&join.parentNode?join.parentNode:card).appendChild(b);
        });
      }
      var ov=document.getElementById('bf-bizarre-overlay');
      if(ov&&!document.getElementById('bf-biz-invite')){
        var bar=ov.querySelector('.bf-biz-topbar');
        if(bar){ var b2=document.createElement('button');b2.id='bf-biz-invite';b2.className='bf-biz-x';b2.title='Invitar a la Habitaci\u00f3n Bizarra';b2.textContent='\u{1F517}';b2.onclick=function(){ window.bfInviteBizarre(); };
          if(bar.firstElementChild&&bar.firstElementChild.tagName==='DIV'&&!bar.firstElementChild.className)bar.replaceChild(b2,bar.firstElementChild);else bar.insertBefore(b2,bar.firstChild); }
      }
    }catch(e){}
  }

  // ---------- Compartir resultado ----------
  function loadImg(url){
    return new Promise(function(res){
      if(!url)return res(null);
      var im=new Image();im.crossOrigin='anonymous';
      var t=setTimeout(function(){ res(null); },3500);
      im.onload=function(){ clearTimeout(t);res(im); };im.onerror=function(){ clearTimeout(t);res(null); };
      im.src=url;
    });
  }
  function myWin(){
    try{
      var r=G._result||{};
      if(typeof NET!=='undefined'&&NET.role==='client')return r.pWin===(NET.mySide==='p');
      return !!r.pWin;
    }catch(e){ return false; }
  }
  function circle(ctx,im,name,x,y,rad,gold){
    ctx.save();ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.closePath();
    ctx.fillStyle='#2a1d44';ctx.fill();ctx.clip();
    if(im){ var s=Math.max(rad*2/im.width,rad*2/im.height),w=im.width*s,h=im.height*s; ctx.drawImage(im,x-w/2,y-h/2-rad*0.1,w,h); }
    else{ ctx.fillStyle='#ffe49a';ctx.font='900 '+Math.round(rad)+'px Cinzel,serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(name||'?').charAt(0),x,y); }
    ctx.restore();
    ctx.beginPath();ctx.arc(x,y,rad,0,Math.PI*2);ctx.lineWidth=7;ctx.strokeStyle=gold?'#ffd24a':'#6f6584';ctx.stroke();
    ctx.fillStyle='#fff5dc';ctx.font='800 26px Cinzel,serif';ctx.textAlign='center';ctx.textBaseline='top';
    var nm=String(name||'');if(nm.length>14)nm=nm.slice(0,13)+'\\u2026';ctx.fillText(nm,x,y+rad+12);
  }
  window.bfShareResult=function(){
    var btn=document.getElementById('bf-share-result');if(btn){ btn.disabled=true;btn.textContent='Creando imagen\\u2026'; }
    var L=window.__bfLineup||{p:[],o:[]};
    var me=(typeof NET!=='undefined'&&NET.role==='client')?'o':'p',rv=me==='p'?'o':'p',win=myWin();
    var mine=(L[me]||[]).slice(0,3),theirs=(L[rv]||[]).slice(0,3);
    var art=function(h){ return h.art||(window.bfHeroArtFor&&window.bfHeroArtFor(h))||''; };
    Promise.all(mine.concat(theirs).map(function(h){ return loadImg(art(h)); })).then(function(imgs){
      var c=document.createElement('canvas');c.width=1080;c.height=1350;var x=c.getContext('2d');
      var g=x.createLinearGradient(0,0,0,1350);g.addColorStop(0,'#2a1648');g.addColorStop(1,'#0b0614');x.fillStyle=g;x.fillRect(0,0,1080,1350);
      x.textAlign='center';x.textBaseline='top';
      x.fillStyle='#c9b8e8';x.font='800 34px Cinzel,serif';x.fillText('BIZARRE FANTASIES',540,60);
      x.fillStyle=win?'#ffd24a':'#ff6b7d';x.font='900 120px Cinzel,serif';x.fillText(win?'\\u00a1VICTORIA!':'DERROTA',540,120);
      var names=(typeof G!=='undefined'&&G.names)||{};
      x.fillStyle='#fff5dc';x.font='800 40px Cinzel,serif';x.fillText(String(names[me]||'T\\u00fa'),540,300);
      for(var i=0;i<mine.length;i++)circle(x,imgs[i],mine[i].name,240+i*300,500,120,win);
      x.fillStyle='#ffd24a';x.font='900 80px Cinzel,serif';x.fillText('VS',540,700);
      for(var j=0;j<theirs.length;j++)circle(x,imgs[mine.length+j],theirs[j].name,240+j*300,940,120,!win);
      x.fillStyle='#fff5dc';x.font='800 40px Cinzel,serif';x.fillText(String(names[rv]||'Rival'),540,1120);
      x.fillStyle='#c9b8e8';x.font='700 30px Cinzel,serif';x.fillText((origin()||'').replace(/^https?:\\/\\//,''),540,1240);
      c.toBlob(function(blob){
        var reset=function(){ if(btn){ btn.disabled=false;btn.textContent='\\u{1F4F8} Compartir resultado'; } };
        if(!blob){ reset();say('No se pudo crear la imagen.');return; }
        var file;try{ file=new File([blob],'bizarre-fantasies-resultado.png',{type:'image/png'}); }catch(e){ file=null; }
        var n=nav();
        if(file&&n&&n.canShare&&n.canShare({files:[file]})){ n.share({files:[file],title:'Bizarre Fantasies'}).catch(function(){}).then(reset); return; }
        try{
          var doc=window.parent.document,url=window.parent.URL.createObjectURL(blob),a=doc.createElement('a');
          a.href=url;a.download='bizarre-fantasies-resultado.png';doc.body.appendChild(a);a.click();a.remove();
          setTimeout(function(){ window.parent.URL.revokeObjectURL(url); },4000);say('\\u{1F4F8} Imagen descargada.');
        }catch(e){ say('No se pudo descargar la imagen.'); }
        reset();
      },'image/png');
    });
  };
  function addShareButton(){
    var s=document.getElementById('s-result');
    if(!s||!s.classList.contains('active')||document.getElementById('bf-share-result'))return;
    var b=document.createElement('button');
    b.id='bf-share-result';b.className='btn primary';b.style.cssText='display:block;margin:14px auto 0;';
    b.textContent='\\u{1F4F8} Compartir resultado';b.onclick=function(){ window.bfShareResult(); };
    s.appendChild(b);
  }
  setInterval(function(){ hookLobby(); addShareButton(); decorateInvites(); },600);
})();
</script>
`;
