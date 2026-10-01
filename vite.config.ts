import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import firebaseConfig from './firebase-applet-config.json'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  define: {
    'import.meta.env.VITE_FIREBASE_API_KEY': JSON.stringify(firebaseConfig.apiKey),
    'import.meta.env.VITE_FIREBASE_AUTH_DOMAIN': JSON.stringify(firebaseConfig.authDomain),
    'import.meta.env.VITE_FIREBASE_PROJECT_ID': JSON.stringify(firebaseConfig.projectId),
    'import.meta.env.VITE_FIREBASE_STORAGE_BUCKET': JSON.stringify(firebaseConfig.storageBucket),
    'import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(firebaseConfig.messagingSenderId),
    'import.meta.env.VITE_FIREBASE_APP_ID': JSON.stringify(firebaseConfig.appId),
    'import.meta.env.VITE_OAUTH_CLIENT_ID': JSON.stringify(firebaseConfig.oAuthClientId),
  },
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon.png',
        'icon.svg',
        'icons/apple-touch-icon.png',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/maskable-512.png',
        'pwa-192x192.png',
        'pwa-512x512.png',
        'pwa-maskable-512x512.png',
        'orvl-emblem.png',
        'orvl-logo.png',
        'hrvl-emblem.png',
        'arvl-emblem.png',
        'arvl-logo.png'
      ],
      devOptions: {
        enabled: true,
        type: 'module'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,json,webmanifest}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/__/],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        maximumFileSizeToCacheInBytes: 25000000,
        runtimeCaching: [
          // 1. Critical Data Schemas, GeoJSON Boundaries, and Local JSON Datasets
          {
            urlPattern: ({ url }) => url.pathname.endsWith('.json') || url.pathname.endsWith('.geojson') || url.pathname.includes('/data/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'critical-data-schemas',
              expiration: {
                maxEntries: 120,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days cache for offline continuity
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // 2. Field GIS Outbreak Map Tiles (CartoDB, OpenStreetMap, ESRI Satellite, OpenTopoMap)
          {
            urlPattern: /^https:\/\/(?:[a-d]\.basemaps\.cartocdn\.com|server\.arcgisonline\.com|[a-c]\.tile\.opentopomap\.org|tile\.openstreetmap\.org)\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'field-gis-map-tiles',
              expiration: {
                maxEntries: 6000,
                maxAgeSeconds: 60 * 60 * 24 * 60 // 60 days persistence for field mission routing
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // 3. Live Weather Telemetry (Open-Meteo) with 3s fast-timeout and resilient cache fallback
          {
            urlPattern: /^https:\/\/api\.open-meteo\.com\/v1\/forecast.*/i,
            handler: 'NetworkFirst',
            options: {
              networkTimeoutSeconds: 3,
              cacheName: 'weather-telemetry-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // 4. Partner, Ministry & Institutional Portal Branding Assets
          {
            urlPattern: /^https:\/\/(?:lh3\.googleusercontent\.com|www\.research4life\.org|www\.woah\.org|www\.fao\.org|elearning\.fao\.org|www\.moa\.gov\.et|www\.cdc\.gov)\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'external-brand-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // 5. Typography & Web Font Binaries
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          // 6. Static UI Assets (Icons, Webfonts, Logos, Badges)
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico|woff|woff2)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-ui-assets',
              expiration: {
                maxEntries: 250,
                maxAgeSeconds: 60 * 60 * 24 * 60 // 60 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      manifest: {
        id: '/',
        name: 'Oromia Regional Veterinary Laboratory Surveillance Intelligence Network',
        short_name: 'ORVL Network',
        description:
          'Oromia Regional Veterinary Laboratory Surveillance Intelligence Network — Official Animal Disease Surveillance, Diagnostics & Field Epidemiology Portal',
        theme_color: '#0f766e',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: 'all',
    hmr: false
  }
})
