import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// Service Worker registration with update handling
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration)
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update prompt
              if (confirm('New version available! Reload to update?')) {
                window.location.reload()
              }
            }
          })
        })
      })
      .catch(error => {
        console.log('SW registration failed: ', error)
      })
  })
  
  // Handle service worker updates
  let refreshing = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!refreshing) {
      refreshing = true
      window.location.reload()
    }
  })
}

createRoot(document.getElementById('root')).render(<App />)
