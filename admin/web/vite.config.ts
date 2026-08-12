import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const authApiPort = process.env.AUTH_API_PORT || '3002'
const mockApiPort = process.env.MOCK_API_PORT || '3001'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5190,
    proxy: {
      '/api/auth': {
        target: `http://localhost:${authApiPort}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/auth/, ''),
      },
      '/api/mock': {
        target: `http://localhost:${mockApiPort}`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/mock/, ''),
      },
    },
  },
})
