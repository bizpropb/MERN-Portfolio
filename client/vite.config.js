import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// Vite configuration for React development with Tailwind CSS
export default defineConfig({
  // Enable React with SWC compiler and Tailwind CSS integration
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Development server configuration
  server: {
    host: '0.0.0.0',  // Allow external connections (Docker/network access)
    port: 3001,       // Development server port
    strictPort: true, // Fail if port is already in use
    watch: {
      usePolling: true,  // Use polling for file changes (Docker compatibility)
      interval: 1000     // Polling interval in milliseconds
    }
  }
})