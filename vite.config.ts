import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Vite binds to ::1 only by default here, so browsers resolving localhost to IPv4 can't connect.
    host: '127.0.0.1',
  },
  build: {
    // The Playground chunk (Sandpack) is ~620 kB but only loads when that tab opens.
    chunkSizeWarningLimit: 700,
  },
})
