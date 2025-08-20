// nuxt.config.ts

// Adicione esta linha de import no topo do arquivo
import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  devtools: { enabled: true },

  // Adicionamos esta configuração para forçar a resolução do atalho '@'
  alias: {
    '@': fileURLToPath(new URL('./', import.meta.url))
  },

  css: [
    '@/app/assets/css/main.css',
  ],
  modules: [
    '@nuxtjs/tailwindcss' 
  ],

  vite: {
    server: {
      watch: {
        // Esta configuração pode ajudar a estabilizar o HMR em alguns sistemas
        usePolling: true,
        interval: 100,
      }
    }
  }
})