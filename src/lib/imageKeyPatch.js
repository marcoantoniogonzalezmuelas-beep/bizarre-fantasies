// Quita el FONDO BLANCO de una imagen (por ejemplo el tomate del ataque sin arma, que es un PNG con un
// recuadro blanco). mix-blend-mode:multiply no lo ocultaba bien (sobre todo en iPhone y con sombras).
//   window.bfKeyOutWhite(pixels)          pone alfa 0 a los píxeles blancos/grises muy claros y poco
//                                         saturados (y degrada el borde); NO toca el rojo del tomate
//   window.bfCutOutImage(url, cb)         descarga la imagen, la pasa por bfKeyOutWhite y llama a cb con
//                                         un dataURL (o null si el servidor de imágenes no permite leerla:
//                                         quien llama conserva entonces su recorte CSS de reserva)
export const IMAGE_KEY_PATCH = `
<script>
(function(){
  if(window.bfKeyOutWhite)return;
  window.bfKeyOutWhite=function(px){
    for(var i=0;i<px.length;i+=4){
      var r=px[i],g=px[i+1],b=px[i+2],mn=Math.min(r,g,b),mx=Math.max(r,g,b);
      if(mn>=240&&mx-mn<18)px[i+3]=0;
      else if(mn>=210&&mx-mn<28)px[i+3]=Math.round(px[i+3]*(240-mn)/30);
    }
    return px;
  };
  window.bfCutOutImage=function(url,cb){
    try{
      var im=new Image();im.crossOrigin='anonymous';
      im.onload=function(){
        try{
          var c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;
          var x=c.getContext('2d');x.drawImage(im,0,0);
          var d=x.getImageData(0,0,c.width,c.height);window.bfKeyOutWhite(d.data);x.putImageData(d,0,0);
          cb(c.toDataURL('image/png'));
        }catch(e){cb(null);}
      };
      im.onerror=function(){cb(null);};
      im.src=url;
    }catch(e){cb(null);}
  };
})();
</script>
`;
