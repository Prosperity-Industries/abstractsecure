import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    preserveSymlinks: true, // Preserve symbolic links when resolving modules
  },
  server: {
    host: '0.0.0.0',
    port: 7000,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
          ],
        },
      },
      external: [
        'fs',
        'url',
        'util',
        'events',
        'stream',
        'child_process',
        'os',
        'path',
        'querystring',
        'crypto',
      ],
    },
    commonjsOptions: {
      transformMixedEsModules: true, // Enable transformation of mixed ES and CommonJS modules
    },
    chunkSizeWarningLimit: 1000,
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['child_process', 'google-auth-library'],
  },
  define: {
    'process.env': {},
    global: {},
  },
});
