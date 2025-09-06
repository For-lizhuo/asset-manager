import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { rootPath } from './config'

// https://vite.dev/config/
export default defineConfig({
  base: `/${rootPath}/`,
  plugins: [react()],
  server: {
    host: true,
    port: 3000
  },
  css: {
    postcss: './postcss.config.js'
  }
})
