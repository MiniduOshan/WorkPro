import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
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