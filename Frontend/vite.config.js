import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target:"https://qtechx.com",
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
<<<<<<< HEAD
       target:"https://qtechx.com",
=======
        // target: 'http://localhost:5000',
        target:"https://qtechx.com",
>>>>>>> f28c91fa4682e35c6be271d1eb2ef600bfd43ed1
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
