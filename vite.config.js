import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api/admin/redeem': {
        target: 'http://localhost:9091',
        changeOrigin: true
      },
      '/api': {
        target: 'https://devslow.ccwu.cc',
        changeOrigin: true,
        secure: true
      }
    }
  }
})