console.log("Loading index.ts...");

import express from 'express';
import cors from 'cors';
import apiRoutes from './api';

const createServer = () => {
    const app = express();
    app.use(cors());
    app.use('/api', apiRoutes);
    return app;
};

export { createServer };