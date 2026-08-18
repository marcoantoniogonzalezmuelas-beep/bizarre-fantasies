// La app se muestra en MODO ESCRITORIO en móvil/tablet mediante el meta
// viewport (width=1280, ver index.html): el navegador ajusta la página a la
// pantalla y el zoom de pellizco es el nativo. Por eso ya no hace falta el
// antiguo zoom por transform sobre el body; el hook se mantiene como no-op
// para no tocar las páginas que lo importan.
export function useDesktopZoom() {}