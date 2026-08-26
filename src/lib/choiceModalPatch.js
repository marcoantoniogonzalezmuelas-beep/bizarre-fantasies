// Modal de elección con la estética bizarra del juego (pergamino oscuro, borde
// dorado, botones tipo carta). Sustituye a los confirm()/alert() del navegador.
//
// Uso: window.bfChoiceModal({
//   icon:'⚙️', title:'Compresor Roto', text:'Sabotaje contra X',
//   options:[{key:'elite', icon:'⛔', label:'Bloquear su FASE ÉLITE', note:'…'}, …]
// }, function(key){ … })
export const CHOICE_MODAL_PATCH = `
<script>
(function(){
  if(window.bfChoiceModal) return;

  var st = document.createElement('style');
  st.textContent = '#bf-choice{position:fixed;inset:0;z-index:100600;display:flex;align-items:center;justify-content:center;padding:18px;'
    + 'background:radial-gradient(circle at 50% 42%,rgba(28,14,48,.82),rgba(6,4,12,.94));backdrop-filter:blur(5px);animation:bfChoiceIn .22s ease-out}'
    + '@keyframes bfChoiceIn{from{opacity:0}to{opacity:1}}'
    + '#bf-choice .bf-ch-box{width:min(94vw,430px);padding:20px 20px 18px;border-radius:20px;text-align:center;'
    + 'background:linear-gradient(180deg,#1e1433,#120c1f 60%,#0d0817);border:2px solid rgba(255,210,74,.7);'
    + 'box-shadow:0 22px 60px rgba(0,0,0,.8),0 0 42px rgba(255,210,74,.22),inset 0 1px 0 rgba(255,240,190,.25);'
    + 'animation:bfChoiceBox .28s cubic-bezier(.2,.9,.3,1) both}'
    + '@keyframes bfChoiceBox{from{opacity:0;transform:translateY(14px) scale(.94)}to{opacity:1;transform:none}}'
    + '#bf-choice .bf-ch-ico{font-size:34px;line-height:1;filter:drop-shadow(0 0 14px rgba(255,210,74,.6))}'
    + "#bf-choice .bf-ch-t{margin:6px 0 2px;font-family:'Cinzel',serif;font-weight:1000;font-size:20px;letter-spacing:1.5px;"
    + 'text-transform:uppercase;color:#ffe9b0;text-shadow:0 0 18px rgba(255,210,74,.55),0 2px 6px #000}'
    + "#bf-choice .bf-ch-s{margin:0 0 15px;font-family:'Rubik',sans-serif;font-size:13px;line-height:1.45;color:#cfc6dd}"
    + '#bf-choice .bf-ch-s b{color:#ffd9a0}'
    + '#bf-choice .bf-ch-op{display:flex;align-items:center;gap:10px;width:100%;margin-top:10px;padding:12px 14px;border-radius:14px;cursor:pointer;'
    + "text-align:left;font-family:'Cinzel',serif;font-weight:900;font-size:14px;color:#fff3d8;"
    + 'border:1.5px solid rgba(255,210,74,.45);background:linear-gradient(180deg,rgba(96,60,150,.42),rgba(28,16,48,.9));'
    + 'box-shadow:inset 0 1px 0 rgba(255,255,255,.14);transition:transform .12s,border-color .12s,box-shadow .12s}'
    + '#bf-choice .bf-ch-op:hover{transform:translateY(-2px);border-color:#ffd24a;box-shadow:0 8px 22px rgba(0,0,0,.5),0 0 20px rgba(255,210,74,.35)}'
    + '#bf-choice .bf-ch-op:active{transform:scale(.98)}'
    + '#bf-choice .bf-ch-op i{font-style:normal;font-size:22px;line-height:1;filter:drop-shadow(0 2px 4px #000)}'
    + "#bf-choice .bf-ch-op small{display:block;margin-top:2px;font-family:'Rubik',sans-serif;font-weight:600;font-size:11.5px;color:#c6bcd8;letter-spacing:0}";
  document.head.appendChild(st);

  window.bfChoiceModal = function(cfg, cb){
    var ov = document.createElement('div');
    ov.id = 'bf-choice';
    var html = '<div class="bf-ch-box">'
      + (cfg.icon ? '<div class="bf-ch-ico">' + cfg.icon + '</div>' : '')
      + '<div class="bf-ch-t">' + (cfg.title || '') + '</div>'
      + (cfg.text ? '<p class="bf-ch-s">' + cfg.text + '</p>' : '');
    (cfg.options || []).forEach(function(o){
      html += '<button class="bf-ch-op" data-k="' + o.key + '"><i>' + (o.icon || '') + '</i><span>' + o.label
        + (o.note ? '<small>' + o.note + '</small>' : '') + '</span></button>';
    });
    ov.innerHTML = html + '</div>';
    ov.addEventListener('click', function(e){
      var b = e.target.closest && e.target.closest('.bf-ch-op');
      if(!b) return;
      ov.remove();
      cb(b.getAttribute('data-k'));
    });
    (window.__bfAppend || function(n){ document.body.appendChild(n); })(ov);
  };
})();
</script>
`;