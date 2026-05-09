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
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:9000',
        changeOrigin: true,
        secure: false
      }
    }
  },

  build: {
    outDir: 'dist',
    sourcemap: true,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;

          if (id.includes('react') || id.includes('scheduler')) return 'react-vendor';
          if (id.includes('bootstrap') || id.includes('@popperjs')) return 'bootstrap-vendor';
          if (id.includes('recharts') || id.includes('chart.js')) return 'charts-vendor';
          if (id.includes('html2canvas')) return 'html2canvas-vendor';
          if (id.includes('dompurify')) return 'dompurify-vendor';
          if (id.includes('jspdf')) return 'jspdf-vendor';
          if (id.includes('@react-google-maps') || id.includes('@googlemaps')) return 'maps-vendor';
          if (id.includes('lucide-react') || id.includes('react-icons') || id.includes('@fortawesome')) return 'icons-vendor';
          if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) return 'motion-vendor';

          return 'vendor';
        },
      },
    },
  }
})
