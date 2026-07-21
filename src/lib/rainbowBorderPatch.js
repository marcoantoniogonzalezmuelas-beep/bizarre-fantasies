// Parche inyectado en el iframe: mejora el borde multicolor premium de las
// cartas (killerducks, etc.). Un arcoíris completo — rojo, naranja, amarillo,
// verde, cian, azul, violeta, rosa — que gira alrededor del borde con brillo
// que alterna de color.
export const RAINBOW_BORDER_PATCH = `
<style>
@property --bfrb{syntax:'<angle>';inherits:false;initial-value:0deg}
@keyframes bfRainbowSpin{to{--bfrb:360deg}}
@keyframes bfRainbowGlow2{0%,100%{box-shadow:0 10px 28px rgba(0,0,0,.65),0 0 20px rgba(0,229,255,.65)}33%{box-shadow:0 10px 28px rgba(0,0,0,.65),0 0 26px rgba(118,255,3,.6)}66%{box-shadow:0 10px 28px rgba(0,0,0,.65),0 0 26px rgba(255,64,129,.7)}}
.bf-hero-card.cf-rainbow{border:6px solid transparent!important;background:linear-gradient(#09070d,#09070d) padding-box,conic-gradient(from var(--bfrb),#ff1744,#ff9100,#ffea00,#76ff03,#00e676,#1de9b6,#00e5ff,#2979ff,#3d5afe,#651fff,#d500f9,#ff4081,#ff1744) border-box!important;background-size:100% 100%!important;animation:bfRainbowSpin 4s linear infinite,bfRainbowGlow2 3s ease-in-out infinite!important}
.bhero.bf-rainbow{border:4px solid transparent!important;background:linear-gradient(#140d24,#140d24) padding-box,conic-gradient(from var(--bfrb),#ff1744,#ff9100,#ffea00,#76ff03,#00e676,#1de9b6,#00e5ff,#2979ff,#3d5afe,#651fff,#d500f9,#ff4081,#ff1744) border-box!important;background-size:100% 100%!important;animation:bfHeroIdle 3.8s ease-in-out infinite,bfRainbowSpin 4s linear infinite,bfRainbowGlow2 3s ease-in-out infinite!important}
.eq-hero.bf-eq-hero-with-art.bf-rainbow{border:3px solid transparent!important;background:linear-gradient(#15101f,#15101f) padding-box,conic-gradient(from var(--bfrb),#ff1744,#ff9100,#ffea00,#76ff03,#00e676,#1de9b6,#00e5ff,#2979ff,#3d5afe,#651fff,#d500f9,#ff4081,#ff1744) border-box!important;background-size:100% 100%!important;animation:bfHeroIdle 3.8s ease-in-out infinite,bfRainbowSpin 4s linear infinite!important}
</style>
`;