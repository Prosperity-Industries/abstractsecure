console.log("Loading main.ts...");
import 'dotenv/config';
import { createServer } from './index';
const PORT = process.env.PORT || 8080;
const app = createServer();
app.listen(PORT, () => console.log(`Backend server is running on http://localhost:${PORT}`));
