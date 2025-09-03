import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'

// Vitest configuration for React component testing
export default defineConfig({
  // Enable React plugin with SWC for fast compilation during tests
  plugins: [react()],
  test: {
    globals: true,              // Enable global test functions (describe, it, expect)
    environment: 'jsdom',       // Use jsdom to simulate browser environment
    setupFiles: ['./src/test/setup.ts'], // Test setup file for global configurations
  },
})