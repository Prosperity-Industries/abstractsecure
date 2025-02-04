// server/main.mjs

console.log("Loading main.mjs...");
import 'dotenv/config';
import { createServer } from './index.mjs';

const PORT = process.env.PORT || 5000;
const app = createServer();
app.listen(PORT, () => console.log(`Backend server is running on http://localhost:${PORT}`));
