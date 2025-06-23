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
      '/api': {
        target: 'https://wxbiz.weathernews.jp',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true
      }
    }
  }
});