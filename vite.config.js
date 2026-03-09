import { fileURLToPath } from 'url'
import { resolve, dirname } from 'path'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main:  resolve(__dirname, 'index.html'),
        vega:  resolve(__dirname, 'vega/index.html'),
        vega2: resolve(__dirname, 'vega2/index.html'),
      }
    }
  }
})
