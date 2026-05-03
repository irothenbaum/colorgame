import {fileURLToPath, URL} from 'node:url'
import {VitePWA} from 'vite-plugin-pwa'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff,woff2}'], // include all asset files for offline use
      },
      manifest: {
        name: 'Game',
        short_name: 'game',
        start_url: './index.html',
        scope: './',
        display: 'standalone',
        background_color: '#333333',
        theme_color: '#47ad83',
        icons: [
          {
            src: './logo_192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: './logo_512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
    // vueDevTools()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // server: {
  //   host: true, // allows external connections
  //   cors: true,
  //   origin: 'https://90775ee8cc9d.ngrok-free.app',
  // },
})
