console.log("Loading index.mjs...");
import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRoutes from './api.mjs'; // ✅ Correct extension

const createServer = () => {
    const app = express();

    // Enable CORS
    app.use(cors());

    // Serve static files from the public folder
    app.use(express.static(path.join(process.cwd(), 'public'))); // ✅ Updated path handling for Node.js ESM

    // API routes
    app.use('/api', apiRoutes);

    // Catch-all route: Serve index.html **ONLY** for non-static requests
    app.get('*', (req, res) => {
        res.sendFile(path.join(process.cwd(), 'public/index.html')); // ✅ Updated path handling
    });

    return app;
};

export { createServer }; // ✅ Ensure this export works with ESM
