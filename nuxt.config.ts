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
    '@/assets/css/main.css',
  ],
})