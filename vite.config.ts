import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vuetify from 'vite-plugin-vuetify'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    vuetify({ styles: { configFile: 'src/styles/vuetify-settings.scss' } }),
    VitePWA({
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
