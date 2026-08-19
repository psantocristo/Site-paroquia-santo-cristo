import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { componentTagger } from 'lovable-tagger';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, './src') }],
    dedupe: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-helmet-async',
      'framer-motion',
    ],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    assetsInlineLimit: 1024,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-helmet-async'],
          ui: ['framer-motion', 'lucide-react'],
          supabase: ['@supabase/supabase-js'],
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-helmet-async',
      'framer-motion',
    ],
    force: true,
  },
  server: {
    host: '::',
    port: 8080,
    headers: {
      'Cache-Control': 'no-store',
    },
  },
}));
