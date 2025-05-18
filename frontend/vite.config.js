import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      'pdfjs-dist': 'pdfjs-dist/build/pdf',
    },
  },
  optimizeDeps: {
    include: ['react-pdf', 'pdfjs-dist'],
  },
  build: {
    commonjsOptions: {
      include: [/react-pdf/, /node_modules/],
    },
  },
  server: {
    port: 3000
  }
})
