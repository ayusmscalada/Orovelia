import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Preload the Latin font files used above the fold, so they download alongside the CSS
// instead of after it (CSS-referenced fonts are otherwise discovered late).
function preloadFonts() {
  const wanted = /(inter-latin-wght-normal|instrument-serif-latin-400-(normal|italic))-[\w-]+\.woff2$/;
  return {
    name: 'preload-above-the-fold-fonts',
    apply: 'build',
    transformIndexHtml(_html, { bundle }) {
      return Object.keys(bundle || {})
        .filter((file) => wanted.test(file))
        .map((file) => ({
          tag: 'link',
          attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${file}`, crossorigin: '' },
          injectTo: 'head',
        }));
    },
  };
}

export default defineConfig({
  plugins: [react(), preloadFonts()],
  build: {
    rollupOptions: {
      output: {
        // Long-lived vendor chunks cache separately from app code.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
});
