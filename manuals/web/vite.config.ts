import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const docsManuals = path.resolve(__dirname, '../../docs/manuals')
const repoRoot = path.resolve(__dirname, '../..')

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@manuals': docsManuals,
    },
  },
  server: {
    host: '127.0.0.1',
    port: 5210,
    strictPort: true,
    fs: {
      allow: [repoRoot],
    },
  },
  preview: {
    host: '127.0.0.1',
    port: 5210,
    strictPort: true,
  },
})
