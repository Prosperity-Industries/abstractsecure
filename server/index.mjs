// server/index.mjs

console.log("Loading index.mjs...");
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRoutes from './api.mjs'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createServer = () => {
    const app = express();

    // Enable CORS
    app.use(cors());
    app.use(express.json());

    // ✅ Serve static frontend files (Webpack/Vite `dist/` folder)
    app.use(express.static(path.join(__dirname, "../dist")));

    // ✅ Serve `index.html` for the root `/`
    app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname, "../dist", "index.html"));
    });

    // ✅ Redirect unknown routes to `index.html` (for SPAs)
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../dist", "index.html"));
    });

    // API routes
    app.use('/api', apiRoutes);

    return app;
};

export { createServer };