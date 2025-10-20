import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // ⚡ Fast Refresh optimizations
      fastRefresh: true,
      // ⚡ Skip unnecessary React runtime
      jsxRuntime: 'automatic',
    })
  ],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild', // Fastest minifier
    cssMinify: 'esbuild',
    reportCompressedSize: false, // ⚡ Faster builds
    
    rollupOptions: {
      output: {
        // ⚡ Aggressive code splitting
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            return 'vendor-misc';
          }
          
          // Split by component type
          if (id.includes('src/components')) {
            if (id.includes('DemoModal')) return 'chunk-demo';
            if (id.includes('CTA')) return 'chunk-cta';
            return 'chunk-components';
          }
          
          if (id.includes('src/pages')) {
            if (id.includes('Dashboard')) return 'chunk-dashboard';
            return 'chunk-pages';
          }
        },
        
        // ⚡ Better file naming for caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    
    chunkSizeWarningLimit: 1000,
    
    // ⚡ Extreme performance
    sourcemap: false, // No source maps in production
    cssCodeSplit: true, // Split CSS for faster loading
  },
  
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion', 'lucide-react', 'react-router-dom'],
    // ⚡ Force optimize these immediately
    force: true
  },
  
  // ⚡ Faster HMR
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    drop: ['console', 'debugger'], // Remove console.logs in production
  },
})
