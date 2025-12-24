import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { CartProvider } from './context/CartContext'
import './index.css'

const offlineModal = document.getElementById('offline-modal')
const preloader = document.getElementById('preloader')

function showOffline() {
  offlineModal?.classList.add('show')
}

function hideOffline() {
  offlineModal?.classList.remove('show')
}

async function checkConnection() {
  if (!navigator.onLine) {
    showOffline()
    return
  }

  try {
    await fetch('/api/v1/health', { cache: 'no-store' })
    hideOffline()
  } catch {
    showOffline()
  }
}


window.addEventListener('online', checkConnection)
window.addEventListener('offline', showOffline)

const root = ReactDOM.createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider>
        <App />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
)

window.addEventListener('load', async () => {
  await checkConnection()

  if (preloader) {
    preloader.style.opacity = '0'
    setTimeout(() => preloader.remove(), 300)
  }
})
