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
            input: "index.html",
            output: {
                manualChunks(id) {
                    if (id.includes("node_modules")) {
                        return "vendor"; // ✅ Splits vendor dependencies into a separate file
                    }
                }
            },
            external: [
                'fs', 'path', 'os', 'crypto', 'stream', 'child_process', 'querystring',
                'net', 'tls', 'zlib', 'http', 'https', 'url', 'buffer'
            ]
        },
        chunkSizeWarningLimit: 1500,
    },
    optimizeDeps: {
        exclude: [
            "fs", "path", "child_process", "crypto"
        ]
    },
    define: {
        "process.env": {},  
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "production"),
        "process.env.VITE_API_URL": JSON.stringify(process.env.VITE_API_URL || ""),
    },
    publicDir: "public",
    server: {
        fs: {
            allow: ["src", "public"], 
        },
        mimeTypes: {
            "js": "application/javascript",
        },
    },
});
