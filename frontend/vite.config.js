import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,          // ← cho phép thiết bị khác trong mạng truy cập
    proxy: {
      '/api': {
        // Vite proxy chạy trên máy tính → vẫn dùng localhost để gọi backend
        // Điện thoại → Vite (172.16.0.64:3000) → proxy → Backend (localhost:52615)
        // Điện thoại KHÔNG gọi thẳng backend, nên localhost ở đây là đúng
        target: 'https://localhost:52615',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
