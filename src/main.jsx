import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { installUuidPolyfill } from '@/lib/uuidPolyfill'
import { gameHtmlLoader } from '@/lib/gameHtmlLoader'

installUuidPolyfill()

// Mientras la app comprueba la autenticación: empieza ya la descarga del HTML del juego (si no hay copia
// local) y el bloque de parches. Antes Home no pedía nada hasta que esa comprobación terminaba.
gameHtmlLoader.warm()
import('@/lib/gameInject')

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
