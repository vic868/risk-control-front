import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    proxy: {
      '/thanos-admin': {
        target: 'http://localhost:7070',
        changeOrigin: true
      },
      '/thanos': {
        target: 'http://localhost:7070',
        changeOrigin: true
      },
      '/gamora': {
        target: 'http://localhost:7070',
        changeOrigin: true
      }
    }
  }
})