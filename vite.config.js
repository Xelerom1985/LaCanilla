import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    port: 5177,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      workbox: {
        clientsClaim: true,
      },
      manifest: {
        name: 'CSD La Canilla',
        short_name: 'CSD La Canilla',
        description: 'Club Social y Deportivo La Canilla',
        theme_color: '#071a0d',
        background_color: '#071a0d',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
})
