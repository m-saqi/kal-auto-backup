import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // IMPORTANT: Must be '/' for Vercel, not './' or '/repo-name/'
  build: {
    outDir: 'dist',
  }
});
