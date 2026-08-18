// Decora los dos avisos del panel de acciones de la batalla:
//   · .ia-think          → "X piensa su jugada…" (IA / rival)
//   · .ia-think.pending  → "🎯 Elige objetivo…"
// Solo estética: fondo ilustrado, marco luminoso y texto legible.
export const THINK_BOX_SKIN_PATCH = `
<style>
.ia-think{
  position:relative!important;overflow:hidden!important;
  border-radius:16px!important;padding:16px 18px!important;
  border:1.5px solid rgba(192,107,255,.55)!important;
  background:linear-gradient(180deg,rgba(12,8,22,.72),rgba(12,8,22,.88)),url('https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/022ac5350_generated_image.png') center/cover no-repeat!important;
  box-shadow:0 10px 30px rgba(0,0,0,.6),0 0 22px rgba(192,107,255,.22),inset 0 0 40px rgba(0,0,0,.5)!important;
  color:#f4ecff!important;font-weight:800!important;
  text-shadow:0 2px 8px #000,0 0 12px rgba(0,0,0,.9)!important;
  animation:bfThinkGlow 3.2s ease-in-out infinite!important;
}
.ia-think.pending{
  border-color:rgba(255,120,110,.6)!important;
  background:linear-gradient(180deg,rgba(22,6,10,.7),rgba(18,5,9,.9)),url('https://media.base44.com/images/public/6a39c9aee54efe3a86d6d69a/8f2802304_generated_image.png') center/cover no-repeat!important;
  box-shadow:0 10px 30px rgba(0,0,0,.6),0 0 24px rgba(255,90,80,.28),inset 0 0 40px rgba(0,0,0,.5)!important;
  color:#ffeee9!important;
  animation:bfPendGlow 1.9s ease-in-out infinite!important;
}
.ia-think::after{
  content:'';position:absolute;inset:0;pointer-events:none;
  background:radial-gradient(circle at 50% 50%,transparent 40%,rgba(0,0,0,.55) 100%);
}
.ia-think>*{position:relative;z-index:1}
@keyframes bfThinkGlow{0%,100%{box-shadow:0 10px 30px rgba(0,0,0,.6),0 0 18px rgba(192,107,255,.18),inset 0 0 40px rgba(0,0,0,.5)}50%{box-shadow:0 10px 30px rgba(0,0,0,.6),0 0 34px rgba(192,107,255,.42),inset 0 0 40px rgba(0,0,0,.5)}}
@keyframes bfPendGlow{0%,100%{box-shadow:0 10px 30px rgba(0,0,0,.6),0 0 18px rgba(255,90,80,.2),inset 0 0 40px rgba(0,0,0,.5)}50%{box-shadow:0 10px 30px rgba(0,0,0,.6),0 0 36px rgba(255,90,80,.5),inset 0 0 40px rgba(0,0,0,.5)}}
</style>
`;