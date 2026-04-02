import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({ jsxRuntime: 'automatic' }),
  ],

  root: '.',
  publicDir: 'public',

  define: {
    'process.env': {}
  },

  server: {
    port: 3000,
    open: false,
    allowedHosts: [
      "unrenounced-harsh-luna.ngrok-free.dev"
    ]
  },

  build: {
    outDir: 'dist',
    sourcemap: true
  }
})