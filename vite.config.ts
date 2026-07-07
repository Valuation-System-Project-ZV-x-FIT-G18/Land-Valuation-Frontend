import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Vite config for the React frontend.
export default defineConfig({
  plugins: [react()],
  resolve: {
    // "@/..." points to the src folder (so imports stay short and clear).
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 3000,
    strictPort: true,
    // Send any "/api/..." request to the NestJS backend on port 4000.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
