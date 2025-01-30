console.log("Loading index.ts...");

const PORT = process.env.PORT || 5000;

import app from './server'; // `server.ts` now loads API routes

app.listen(PORT, () => console.log(`Backend server is running on http://localhost:${PORT}`));
