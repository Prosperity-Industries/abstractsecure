console.log("Loading index.mjs...");
import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRoutes from './api.mjs'; // ✅ Correct extension

const createServer = () => {
    const app = express();

    // Enable CORS
    app.use(cors());

    // Serve static assets (images) from 'public' under '/static'
    app.use('/static', express.static(path.join(process.cwd(), 'public')));

    // Serve frontend files (index.html, bundle.js) from 'dist'
    app.use(express.static(path.join(process.cwd(), 'dist')));

    // Catch-all route: Serve 'index.html' from 'dist' for all unknown requests
    app.get('*', (req, res) => {
        res.sendFile(path.join(process.cwd(), 'dist/index.html'));
    });

    // API routes
    app.use('/api', apiRoutes);

    return app;
};

export { createServer };
