import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import commonjs from '@originjs/vite-plugin-commonjs';
export default defineConfig({
    plugins: [react(), commonjs()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
            "@/components": path.resolve(__dirname, "src/components"),
            "@/components/ui": path.resolve(__dirname, "src/components/ui")
        },
        extensions: [".tsx", ".ts", ".jsx", ".js"],
    },
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
    define: {
        "process.env": process.env,
        global: 'globalThis',
    },
    server: {
        fs: {
            strict: true
        }
    }
});
