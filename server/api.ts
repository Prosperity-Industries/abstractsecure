console.log("Loading api.ts...");

import { Router } from 'express';
import { uploadToGoogleDrive } from './utils/googleDrive';

const router = Router();

router.post('/upload', async (req, res) => {
  try {
    console.log("Processing upload...");
    // Simulate upload
    res.status(200).json({ message: "Upload successful" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
