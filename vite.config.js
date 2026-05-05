import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api/admin/redeem': {
        target: 'https://paper.devslow.ccwu.cc',
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