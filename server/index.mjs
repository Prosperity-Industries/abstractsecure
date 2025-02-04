// server/index.mjs

console.log("Loading index.mjs...");
import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRoutes from './api.mjs'; 

const createServer = () => {
    const app = express();

    // Enable CORS
    app.use(cors());
    app.use(express.json());

    // Serve static assets (images) from 'public' under '/static'
    app.use('/static', express.static(path.join(process.cwd(), 'public')));

    // API routes
    app.use('/api', apiRoutes);

    return app;
};

export { createServer };
