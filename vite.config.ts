import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/soratena-api': {
        target: 'https://soratena.weathernews.jp',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/soratena-api/, ''),
        secure: true
      }
    }
  }
});