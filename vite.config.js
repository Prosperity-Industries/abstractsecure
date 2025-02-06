import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
            "@/components": path.resolve(__dirname, "src/components"),
            "@/components/ui": path.resolve(__dirname, "src/components/ui")
        },
        extensions: [".tsx", ".ts", ".jsx", ".js"],
    },
    build: {
        outDir: "dist",
        rollupOptions: {
            input: "index.html", // ✅ Ensures index.html is included in the build
        },
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
        "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
        "process.env.VITE_API_URL": JSON.stringify(process.env.VITE_API_URL),
    },
    publicDir: "public", // ✅ Ensures static assets are copied
    server: {
        fs: {
            strict: true
        },
        mimeTypes: {
            "js": "application/javascript",
        },
    },
});
