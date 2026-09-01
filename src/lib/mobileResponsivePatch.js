// Parche solo para TELÉFONOS (no tablets), inyectado en el iframe: diseño
// responsive real en vertical.
//
// El cambio de fondo está en Home.jsx: en vertical el juego ya NO se maqueta a
// 1280px, sino a un lienzo de 860px. Con eso la escala en un móvil de 360px
// pasa de ~0,28 a ~0,42 (todo se ve un 50% más grande) y, además, se activan
// las media queries responsive que el propio juego trae de fábrica (≤880px:
// rejillas de reclutamiento y equipamiento a una columna) y que el modo 1280
// mantenía apagadas. En horizontal se conserva el lienzo de 1280 (paridad con
// PC), así que estas reglas van tras @media (max-width:880px) y solo actúan
// en el lienzo vertical.
//
// Este parche completa ese modo con reglas pensadas para el dedo: botones y
// campos más grandes, textos legibles y paneles a ancho completo. El zoom de
// pellizco (MOBILE_PINCH_PATCH) sigue funcionando igual por encima.
export const MOBILE_RESPONSIVE_PATCH = `
<style id="bf-mobile-responsive">
@media (max-width:880px){
  /* Aprovechar todo el ancho del lienzo. */
  .screen{padding:14px 12px 60px!important}
  .setup-box{max-width:100%!important}
  .pr-box{max-width:100%!important}

  /* Botones y controles al tamaño del dedo. */
  .btn{min-height:46px!important;font-size:15px!important}
  .btn.sm{min-height:42px!important;font-size:14px!important}
  .jrpg-btn{padding:12px 6px!important;min-height:64px!important}
  .jrpg-btn-icon{font-size:30px!important}
  .jrpg-btn-label{font-size:14px!important}

  /* Campos de formulario (crear sala, unirse, nick…). */
  .ig input,.ig select,input[type=text],input[type=password],input[type=number]{
    font-size:17px!important;min-height:44px!important;padding:10px 12px!important}
  .ig label{font-size:14px!important}

  /* Tarjetas de sala del lobby. */
  .room-card{padding:14px 14px!important;gap:12px!important}
  .room-name{font-size:18px!important}
  .room-sub{font-size:14px!important}
  .room-ico{font-size:30px!important}

  /* Textos de lectura: modales, notas, consejero y registro de batalla. */
  .modal-note{font-size:16px!important}
  .note-box{font-size:14px!important;line-height:1.5!important}
  .coach-txt{font-size:16px!important}
  .le{font-size:15px!important}
  .b-log{max-height:200px!important}

  /* Mano de batalla: fichas de hechizos/objetos pulsables. */
  .hand-chips .chip{font-size:14px!important;padding:7px 11px!important}
  .hand-lbl{font-size:13px!important}

  /* Rejillas de cartas y tienda: menos columnas, cartas más grandes. */
  .cards-grid{grid-template-columns:repeat(auto-fill,minmax(195px,1fr))!important}
  .shop-grid{grid-template-columns:repeat(auto-fill,minmax(170px,1fr))!important}

  /* Cabeceras de batalla y héroes: un punto más de cuerpo. */
  .bhero-name{font-size:16px!important}
  #homeBtn{font-size:15px!important;padding:10px 16px!important}
}
</style>
`;
