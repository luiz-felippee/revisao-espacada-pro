import { defineConfig } from 'vite' // force restart
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
// import { visualizer } from 'rollup-plugin-visualizer' // Temporarily disabled

// https://vite.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ['lucide-react']
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-192.png', 'icon-512.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'Painel de Estudos PRO',
        short_name: 'Estudos',
        description: 'Seu painel de estudos com Flashcards e Pomodoro',
        theme_color: '#020617',
        background_color: '#020617',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        categories: ['education', 'productivity'],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
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
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-storage-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    }),
    // Temporarily disabled for debugging
    // visualizer({
    //   open: true,
    //   gzipSize: true,
    //   brotliSize: true,
    //   filename: 'dist/stats.html'
    // })
  ],
  build: {
    // Minification - usando esbuild para evitar problemas com exports
    minify: 'esbuild',

    // Target modern browsers for smaller bundles
    target: 'esnext',

    // Optimize CSS
    cssCodeSplit: true,
    cssMinify: true,

    // Code splitting otimizado
    rollupOptions: {
      output: {
        // Chunks mais granulares para better caching
        manualChunks: (id) => {
          // React ecosystem
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }

          // UI Libraries
          if (id.includes('node_modules/lucide-react')) {
            return 'vendor-icons';
          }
          if (id.includes('node_modules/recharts')) {
            return 'vendor-charts';
          }

          // Backend/Data
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase';
          }
          if (id.includes('node_modules/date-fns')) {
            return 'vendor-dates';
          }

          // Rich text editor
          if (id.includes('node_modules/@tiptap')) {
            return 'vendor-editor';
          }

          // Analytics
          if (id.includes('node_modules/@vercel') || id.includes('node_modules/@sentry')) {
            return 'vendor-analytics';
          }

          // Other large dependencies
          if (id.includes('node_modules/')) {
            return 'vendor-misc';
          }
        },

        // Optimize chunk naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      }
    },

    // Chunk size warnings - mais restritivo
    chunkSizeWarningLimit: 500,

    // Optimize sourcemaps for production
    sourcemap: false,

    // Tree shaking
    modulePreload: {
      polyfill: false
    }
  }
})
