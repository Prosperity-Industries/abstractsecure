console.log("Loading main.ts...");

import app from './app';

const PORT = process.env.PORT || 5000;

const startServer = () => {
    app.listen(PORT, () => console.log(`Backend server is running on http://localhost:${PORT}`));
};

startServer();