import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  base: command === "build" ? "/unvrs-synth/" : "/",
  plugins: [react()],
  server: {
    port: 3000,
  },
  build: {
    // Optimize chunk size and splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor code for better caching
          vendor: ["react", "react-dom"],
          // Audio engine in separate chunk
          audio: ["./src/audio/AudioEngine.ts", "./src/audio/Voice.ts"],
        },
      },
    },
    // Target modern browsers for smaller builds
    target: "esnext",
    // Enable minification
    minify: "terser",
    // Optimize for gzip/brotli compression
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
}));
