import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Proxy /api requests to backend, keeping the /api prefix
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})