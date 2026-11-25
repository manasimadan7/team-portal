import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // relative asset paths, so the build works at any sub-path (GitHub Pages, Claude Artifacts, …)
  base: './',
})
