"use client"

import { useEffect } from 'react'

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      if (process.env.NODE_ENV === 'production') {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error)
          })
      } else {
      }
    }
  }, [])

  // Also add manifest link verification in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Check if manifest is accessible
      fetch('/manifest.json')
        .then(response => {
          if (!response.ok) {
            console.warn('PWA Manifest not accessible:', response.status)
          } else {
          }
        })
        .catch(error => {
          console.warn('PWA Manifest fetch error:', error)
        })
      
      // Check if favicon is accessible
      fetch('/favicon.ico')
        .then(response => {
          if (!response.ok) {
            console.warn('PWA Favicon not accessible:', response.status)
          } else {
          }
        })
        .catch(error => {
          console.warn('PWA Favicon fetch error:', error)
        })
    }
  }, [])

  return null
}