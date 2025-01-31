console.log("Loading index.ts...");
import express from 'express';
import cors from 'cors';
import path from 'path';
import apiRoutes from './api';

const createServer = () => {
    const app = express();

    // Enable CORS
    app.use(cors());

    // Serve static files from the public folder
    app.use(express.static(path.join(__dirname, '../public')));

    // API routes
    app.use('/api', apiRoutes);

    // Catch-all route: Serve index.html **ONLY** for non-static requests
    app.get('*', (req, res) => {
        const filePath = path.join(__dirname, '../public', req.url);

        // Check if the requested file exists in the public folder
        if (req.url.includes('.') && !req.url.startsWith('/api')) {
            return res.sendFile(filePath, (err) => {
                if (err) {
                    res.status(404).send('File not found');
                }
            });
        }

        // Default to serving index.html (for SPA routing)
        res.sendFile(path.join(__dirname, '../public/index.html'));
    });

    return app;
};

// Start the server
const app = createServer();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
