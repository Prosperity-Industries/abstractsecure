console.log("Loading app.ts...");
import express from 'express';
import cors from 'cors';
import apiRoutes from './api';
const app = express();
app.use(cors());
app.use('/api', apiRoutes);
export default app;
