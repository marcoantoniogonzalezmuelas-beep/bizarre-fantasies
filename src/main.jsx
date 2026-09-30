import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { installUuidPolyfill } from '@/lib/uuidPolyfill'

installUuidPolyfill()

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
