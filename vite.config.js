// vite.config.js

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": "/src",
            "@/components": "/src/components",
            "@/components/ui": "/src/components/ui"
        },
        extensions: [".tsx", ".ts", ".jsx", ".js"],
    },
    build: {
        outDir: "dist",
        rollupOptions: {
            input: "index.html", // ✅ Ensures index.html is included in the build
            external: [
                'fs', 'path', 'os', 'crypto', 'stream', 'child_process', 'querystring', 'net', 'tls', 'zlib', 'http', 'https', 'url', 'buffer'
            ]
        },
        chunkSizeWarningLimit: 1500, // ✅ Prevents large bundle size warnings
    },
    optimizeDeps: {
        exclude: [
            "google-auth-library", // ✅ Exclude backend-only module
        ]
    },
    define: {
        "process.env": {},  // ✅ Prevents frontend errors when "process" is referenced
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "production"),
        "process.env.VITE_API_URL": JSON.stringify(process.env.VITE_API_URL || ""),
    },
    publicDir: "public", // ✅ Ensures static assets are copied
    server: {
        fs: {
            allow: ["src", "public"], // ✅ Allows Vite to access necessary frontend files only
        },
        mimeTypes: {
            "js": "application/javascript",
        },
    },
});
