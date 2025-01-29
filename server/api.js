import express from 'express';
import { uploadToGoogleDrive } from './utils/googleDrive.js';

const router = express.Router();

router.post('/upload', async (req, res) => {
  try {
    const { file, fileName } = req.body;
    const fileId = await uploadToGoogleDrive(file, fileName);
    res.json({ fileId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
