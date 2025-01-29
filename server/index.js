const express = require('express');
const cors = require('cors');
const apiRoutes = require('./api'); // Import API routes

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Allow frontend to communicate with backend
app.use(express.json()); // Parse JSON request bodies
app.use('/api', apiRoutes); // Register API routes

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
