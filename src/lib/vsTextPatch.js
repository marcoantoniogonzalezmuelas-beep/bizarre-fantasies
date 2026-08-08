// Parche inyectado en el iframe: mejora el texto "VS" del campo de batalla
// para que se vea más épico y chulo. El juego original lo muestra como texto
// vertical dorado simple con opacity:.7. Aquí lo convertimos en un medallón
// con brillo dorado, borde, glow pulsante y texto con degradado metálico.
export const VS_TEXT_PATCH = `
<style id="bf-vs-text">
.vs-mid{position:relative!important}
.vs-mid::before{
  content:"";position:absolute;inset:-8px -6px;z-index:0;pointer-events:none;
  border-radius:50%;
  background:radial-gradient(circle,rgba(255,210,74,.18),transparent 70%);
  animation:bfVsGlow 2.4s ease-in-out infinite;
}
@keyframes bfVsGlow{0%,100%{opacity:.5;transform:scale(.92)}50%{opacity:1;transform:scale(1.08)}}
.vs-txt{
  font-family:'Cinzel',serif!important;font-weight:900!important;
  font-size:26px!important;opacity:1!important;
  background:linear-gradient(180deg,#fff5dc 0%,#ffd24a 35%,#d4a017 65%,#8a5a00 100%);
  -webkit-background-clip:text!important;background-clip:text!important;
  -webkit-text-fill-color:transparent!important;color:transparent!important;
  text-shadow:none!important;
  filter:drop-shadow(0 2px 4px rgba(0,0,0,.9)) drop-shadow(0 0 10px rgba(255,210,74,.5));
  letter-spacing:2px!important;
  writing-mode:vertical-rl;text-orientation:upright;
  position:relative;z-index:1;
  animation:bfVsShimmer 3s ease-in-out infinite;
}
@keyframes bfVsShimmer{
  0%,100%{filter:drop-shadow(0 2px 4px rgba(0,0,0,.9)) drop-shadow(0 0 10px rgba(255,210,74,.5))}
  50%{filter:drop-shadow(0 2px 4px rgba(0,0,0,.9)) drop-shadow(0 0 18px rgba(255,210,74,.85))}
}
@media (max-width:640px){
  .vs-txt{font-size:22px!important;letter-spacing:1.5px!important}
  .vs-mid::before{inset:-6px -4px}
}
</style>
`;