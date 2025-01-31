import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        "google-auth-library",
        "fs",
        "path",
        "child_process",
        "crypto"
      ]
    }
  },
  optimizeDeps: {
    exclude: [
      "google-auth-library",
      "fs",
      "path",
      "child_process",
      "crypto"
    ]
  },
  server: {
    fs: {
      strict: true
    }
  }
});
