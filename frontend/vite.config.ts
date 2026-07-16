import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://learn-vault-1.onrender.com',
        changeOrigin: true,
        secure: false,
      },
      '/oauth2': {
        target: 'https://learn-vault-1.onrender.com',
        changeOrigin: true, 
        secure: false
      }, 
      '/login/oauth2': {
        target: 'https://learn-vault-1.onrender.com', 
        changeOrigin: true, 
        secure: false
      }
    },
  },
})
