import express from 'express';
import cors from 'cors';

console.log("Loading server.ts...");

const app = express();
app.use(cors());

export default app;
