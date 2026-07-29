import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/kosto-vet/',
  resolve: {
    alias: { '@': '/src' },
  },
})
