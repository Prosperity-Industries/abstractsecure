console.log("Loading index.ts...");

const PORT = process.env.PORT || 5000;

import app from './server';

async function loadRoutes() {
    console.log("Loading API routes...");
    const apiRoutes = (await import('./api')).default;
    app.use('/api', apiRoutes);
}

loadRoutes();

app.listen(PORT, () => console.log(`Backend server is running on http://localhost:${PORT}`));
