console.log("Loading api.ts...");
import { Router } from 'express';
const router = Router();
router.post('/upload', async (req, res) => {
    try {
        console.log("Processing upload...");
        res.status(200).json({ message: "Upload successful" });
    }
    catch (error) {
        const errorMessage = error.message; // Type assertion
        res.status(500).json({ error: errorMessage });
    }
});
export default router;
