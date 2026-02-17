import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Vite config - uses esbuild for minification (default)
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    cssMinify: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs', '@radix-ui/react-tooltip'],
          query: ['@tanstack/react-query'],
          supabase: ['@supabase/supabase-js'],
          charts: ['recharts'],
          forms: ['react-hook-form', '@hookform/resolvers', 'zod'],
          maps: ['@react-google-maps/api'],
          three: ['three'],
          pdf: ['jspdf', 'html2canvas'],
          firebase: ['firebase/app', 'firebase/messaging'],
        },
      },
    },
  },
}));
