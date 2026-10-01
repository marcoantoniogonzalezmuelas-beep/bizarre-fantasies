// ENFOQUE AUTOMÁTICO DEL EQUIPAMIENTO EN MÓVIL/TABLET (parte pura: medir y calcular).
//
// En subasta y equipamiento el teléfono recibe el lienzo de PC (1280 px) encogido para caber: en un
// móvil de 390 px la escala es ~0,30 y todo se ve "desde muy lejos". Al entrar en equipamiento se
// encuadra la zona útil (héroes + presupuesto + tienda + mano) en vez de dejar la pantalla entera:
//   - si, ajustada al ancho, la zona ya se lee bien (escala efectiva >= target) => se encuadra ENTERA;
//   - si seguiría demasiado pequeña (teléfono en vertical) => se amplía hasta una escala legible y se
//     enfoca la zona de HÉROES (donde se equipa); el jugador se desplaza a la tienda con el dedo.
// Nunca pisa un zoom que el jugador ya haya hecho. Los números se miden en vivo: no se asume ningún
// diseño concreto de la pantalla.
export const ZOOM_FOCUS_PATCH = `
<script>
(function(){
  if(window.bfComputeEquipFocus)return;
  var O={pad:14,maxZ:2.6,target:0.62,minGain:1.04};
  // zone / heroes: rectángulos {x,y,w,h} en coordenadas del lienzo SIN zoom. W,H: tamaño del lienzo.
  // devW: ancho real de la pantalla (la app encoge el lienzo a devW/W).
  window.bfComputeEquipFocus=function(zone,heroes,W,H,devW,opt){
    var o=opt||{},pad=o.pad==null?O.pad:o.pad,maxZ=o.maxZ||O.maxZ,target=o.target||O.target;
    if(!zone||!(zone.w>0)||!(zone.h>0)||!(W>0)||!(H>0))return null;
    var k=Math.min(1,(devW>0?devW:W)/W);
    var fitZ=(W-2*pad)/zone.w;
    var focus=zone,z,cropped=false;
    if(fitZ*k>=target||fitZ>=maxZ){
      z=Math.min(maxZ,Math.max(1,fitZ));
    }else{
      z=Math.min(maxZ,Math.max(1,target/k));
      if(heroes&&heroes.w>0&&heroes.h>0&&heroes.w*z<=W-2*pad+1){focus=heroes;}
      cropped=focus.w*z>W-2*pad||focus!==zone;
    }
    if(z<O.minGain)return null;
    var tx=focus.w*z<=W-2*pad+1?-(focus.x*z)+(W-focus.w*z)/2:-(focus.x*z)+pad;   // centrada, o pegada a la izquierda si no cabe
    var ty=-(focus.y*z)+pad;
    var mx=W*z-W,my=H*z-H;
    tx=Math.min(0,Math.max(-mx,tx));ty=Math.min(0,Math.max(-my,ty));
    return {z:Math.round(z*100)/100,tx:Math.round(tx),ty:Math.round(ty),cropped:cropped};
  };
  // Mide la zona de equipamiento en la pantalla actual (con el zoom actual ya descontado).
  window.bfEquipZones=function(doc,st){
    st=st||{z:1,tx:0,ty:0};var zz=st.z||1;
    function rects(sel){
      var out=[],nodes=doc.querySelectorAll(sel);
      for(var i=0;i<nodes.length;i++){
        var r=nodes[i].getBoundingClientRect();
        if(r.width>2&&r.height>2)out.push({x:(r.left-st.tx)/zz,y:(r.top-st.ty)/zz,w:r.width/zz,h:r.height/zz});
      }
      return out;
    }
    function union(a){
      if(!a.length)return null;
      var x1=1e9,y1=1e9,x2=-1e9,y2=-1e9;
      a.forEach(function(r){x1=Math.min(x1,r.x);y1=Math.min(y1,r.y);x2=Math.max(x2,r.x+r.w);y2=Math.max(y2,r.y+r.h);});
      return {x:x1,y:y1,w:x2-x1,h:y2-y1};
    }
    var hero=rects('#s-equip .eq-hero');
    var heroes=union(hero);
    var zone=union(hero.concat(rects('#s-equip .coins-row'),rects('#s-equip .shop-card'),rects('#s-equip .eq-hand-box')));
    if(!heroes||!zone)return null;   // la pantalla aún no ha pintado a los héroes
    return {zone:zone,heroes:heroes};
  };
})();
</script>
`;
