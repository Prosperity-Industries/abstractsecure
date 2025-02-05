// server/main.mjs

console.log("Loading main.mjs...");
import 'dotenv/config';
import { createServer } from './index.mjs';

const PORT = process.env.PORT || 8080; // Google Cloud Run default
const app = createServer();
app.listen(PORT, () => console.log(`Backend server is running on http://localhost:${PORT}`));
