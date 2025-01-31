import { defineConfig } from "vite";
import path from "path";
export default defineConfig({
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
        "process.env": {},
        "global": {}
    },
    server: {
        fs: {
            strict: true
        }
    }
});
