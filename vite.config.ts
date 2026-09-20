import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: false,
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-three-core": ["three"],
          "vendor-three-fiber": ["@react-three/fiber", "@react-three/drei"],
          "vendor-charts": ["recharts"],
          "vendor-ui": ["framer-motion", "lucide-react", "date-fns"],
          "vendor-supabase": ["@supabase/supabase-js"],
        },
      },
    },
  },
});
