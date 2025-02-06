// server/main.mjs

console.log("Loading main.mjs...");
import dotenv from 'dotenv';
dotenv.config();

import { createServer } from './index.mjs';

const PORT = process.env.PORT || 5000; // Google Cloud Run default
const app = createServer();
app.listen(PORT, () => console.log(`✅ Backend server is running on port ${PORT}`));
