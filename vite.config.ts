import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // The 3D stage (three.js, R3F, drei) is one deliberately lazy chunk (~335 KB gzip) that loads
    // behind the preloader; the entry stays ~130 KB. Raise the warning past it rather than split it.
    chunkSizeWarningLimit: 1300,
  },
})
