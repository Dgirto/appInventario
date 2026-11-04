import react from '@vitejs/plugin-react'
import process from 'node:process'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Permite abrir el servidor de desarrollo desde un túnel ngrok
    allowedHosts: ['.ngrok-free.app', '.ngrok-free.dev', '.ngrok.app'],
    // Reenvía /api al backend local (miApi en el puerto 3006, o API_PROXY_TARGET)
    proxy: {
      '/api': process.env.API_PROXY_TARGET || 'http://localhost:3006',
    },
  },
})
