import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: fileURLToPath(
      new URL('../src/main/resources/static', import.meta.url)
    ),
    emptyOutDir: true,
  },
  base: './',
})