import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/finanze-personali/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Fin.Io',
        short_name: 'Fin.Io',
        description: 'App per monitorare entrate e spese',
        theme_color: '#0a0c10',
        background_color: '#0a0c10',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/finanze-personali/',
        scope: '/finanze-personali/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{html,js,css,woff2,png,svg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /\.(?:js|css|png|svg|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          },
          {
            urlPattern: /\/finanze-personali\/$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'html-cache',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          }
        ]
      }
    })
  ],
  
  // 👇 OTTIMIZZAZIONI PER IL BUNDLING
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separa React e React Router in un chunk dedicato
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // Separa Recharts (la libreria più pesante) in un chunk dedicato
          'recharts': ['recharts'],
          
          // Altre librerie di terze parti
          'vendor-other': ['uuid']
        }
      }
    },
    // Riduce la dimensione del chunk principale
    chunkSizeWarningLimit: 1000,
    
    // Ottimizza il CSS
    cssMinify: true,
    
    // Genera sourcemap solo in sviluppo (per ridurre il bundle in produzione)
    sourcemap: false
  },
  
  // 👇 OTTIMIZZAZIONI PER LO SVILUPPO
  server: {
    // Riduce il polling per migliorare le performance in dev
    watch: {
      usePolling: false
    }
  },
  
  // 👇 OTTIMIZZAZIONI PER LA PRODUZIONE
  esbuild: {
    // Rimuove i console.log in produzione
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  }
})