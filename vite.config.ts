import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Conditionally import lovable-tagger only in development
let componentTagger: any = null;
try {
  if (process.env.NODE_ENV !== "production") {
    componentTagger = require("lovable-tagger").componentTagger;
  }
} catch {
  // lovable-tagger not available, skip
}

// Vite config - uses esbuild for minification (default)
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger ? componentTagger() : null,
  ].filter(Boolean),
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
