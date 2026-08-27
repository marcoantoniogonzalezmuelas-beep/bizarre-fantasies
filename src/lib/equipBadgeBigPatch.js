// Equipo del héroe en batalla (panel de acciones): el arma y la armadura se
// mostraban como chapitas diminutas junto a los stats y se perdían entre CC/AD/HE.
// Este parche las saca a su propia fila, más grandes y con color propio
// (dorado = arma, azul = armadura) para que se vean de un vistazo.
export const EQUIP_BADGE_BIG_PATCH = `
<style>
.active-stat-row{flex-wrap:wrap!important;row-gap:7px!important;align-items:center!important}
.active-stat-row .equip-badge{
  flex:0 1 auto!important;
  display:inline-flex!important;align-items:center!important;gap:6px!important;
  font-size:14px!important;font-weight:900!important;letter-spacing:.3px!important;
  padding:6px 12px!important;border-radius:999px!important;line-height:1.15!important;
  max-width:none!important;white-space:nowrap!important;
  background:linear-gradient(180deg,#4a3208,#1d1304)!important;
  border:2px solid #ffd24a!important;color:#ffe9a8!important;
  text-shadow:0 1px 2px rgba(0,0,0,.9)!important;
  box-shadow:0 3px 10px rgba(0,0,0,.55),0 0 12px rgba(255,210,74,.35),inset 0 1px 0 rgba(255,255,255,.18)!important;
}
.active-stat-row .equip-badge.arm{
  background:linear-gradient(180deg,#0e2c4d,#04121f)!important;
  border-color:#7fd0ff!important;color:#d6f0ff!important;
  box-shadow:0 3px 10px rgba(0,0,0,.55),0 0 12px rgba(127,208,255,.35),inset 0 1px 0 rgba(255,255,255,.18)!important;
}
/* Salto de línea antes del equipo: los stats en una fila, el equipo debajo. */
.active-stat-row .equip-badge:first-of-type{margin-left:0!important}
.active-stat-row .vel-badge{margin-right:auto!important}
@media (max-width:1024px){
  .active-stat-row .equip-badge{font-size:13px!important;padding:5px 10px!important}
}
</style>
`;