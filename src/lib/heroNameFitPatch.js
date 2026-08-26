// Nombre del héroe en batalla SIEMPRE en una línea de altura fija.
//
// Problema: nombres largos (p. ej. "Fast Everest Panzer") pasaban a dos líneas
// en algunos repintados y en otros no, así que la cabecera cambiaba de alto y
// arrastraba la barra de atributos y las de HP/MP → parecía que la carta se
// "repintaba" sola cada poco tiempo.
//
// Solución: la cabecera reserva una altura fija y el nombre nunca se parte
// (una sola línea, con puntos suspensivos si no cabe y algo más pequeño para
// que los nombres largos entren completos).
export const HERO_NAME_FIT_PATCH = `
<style>
.bhero .bhero-top{min-height:34px!important;contain:layout style}
.bhero .bhero-name{display:block!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;max-width:100%!important;font-size:12.5px!important;line-height:16px!important;height:16px!important}
.bhero .vel-tag{white-space:nowrap!important;display:inline-flex!important;align-items:center}
</style>
`;