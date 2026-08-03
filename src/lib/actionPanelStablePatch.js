// Parche inyectado en el iframe: evita el PARPADEO del panel de acciones.
//
// El juego tiene un MutationObserver global sobre <body> que, en cada mutación,
// vuelve a ejecutar la inyección de arte (injectActionPanelBg). Esa inyección
// reescribe el innerHTML del botón "Tanquear" y del cartel de estado con el
// MISMO contenido → nueva mutación → nueva inyección… bucle a 60 fps que en
// móvil/tablet (y sobre todo en multijugador, con sincronizaciones constantes)
// se ve como un parpadeo continuo del panel.
//
// Solución quirúrgica: a los elementos del panel de acciones se les instala un
// setter propio de innerHTML que IGNORA las asignaciones idénticas. Así el
// contenido se sigue actualizando cuando cambia de verdad, pero deja de
// generar mutaciones inútiles y el bucle se rompe.
export const ACTION_PANEL_STABLE_PATCH = `
<script>
(function(){
  if(window.__bfActionPanelStable)return;
  window.__bfActionPanelStable=true;

  var desc=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
  if(!desc||!desc.set)return;

  function guard(el){
    if(!el||el.__bfIhGuard)return;
    el.__bfIhGuard=1;
    try{
      Object.defineProperty(el,'innerHTML',{
        configurable:true,
        get:function(){ return desc.get.call(this); },
        set:function(v){
          var s=String(v);
          if(this.__bfIhLast===s)return; // mismo HTML: no tocar el DOM
          this.__bfIhLast=s;
          desc.set.call(this,s);
        }
      });
    }catch(e){}
  }

  function scan(){
    var b=document.getElementById('s-battle');
    if(!b||!b.classList.contains('active'))return;
    var p=b.querySelector('.active-hero-panel');
    if(!p)return;
    guard(p);
    var kids=p.querySelectorAll('*');
    for(var i=0;i<kids.length;i++)guard(kids[i]);
  }

  setInterval(scan,300);
  scan();
})();
</script>
`;