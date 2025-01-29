import express from 'express';
import { uploadToGoogleDrive } from './utils/googleDrive'; // Correct ES Module import
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { originalname, path: tempPath } = req.file;

    const fileId = await uploadToGoogleDrive(tempPath, originalname, req.file.mimetype);

    res.status(200).json({ fileId });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
