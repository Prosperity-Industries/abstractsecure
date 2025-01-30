import express from 'express';
import cors from 'cors';

console.log("Loading server.ts...");

const app = express();
app.use(cors());

// Load API routes here instead of in index.ts
import apiRoutes from './api';
app.use('/api', apiRoutes);

export default app;
