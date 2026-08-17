import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron/simple';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  let geminiKey = (env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '').trim();

  // Filter out obvious placeholders
  if (geminiKey.includes('MY_GEMINI_API_KEY') || geminiKey.includes('YOUR_API_KEY')) {
    geminiKey = '';
  }

  return {
    root: '.',
    base: './',
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [
      react(),
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
      'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(geminiKey),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
