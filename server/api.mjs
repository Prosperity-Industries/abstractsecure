// server/api.mjs

console.log("Loading api.mjs...");

import { Router } from 'express';
import multer from 'multer';
import { uploadToGoogleDrive } from './utils/googleDrive.mjs';

const router = Router();

// Set up Multer to store files temporarily before upload
const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        console.log(`Processing upload: ${req.file.originalname}`);

        // Upload the file to Google Drive
        const fileId = await uploadToGoogleDrive(req.file.path, req.file.originalname, req.file.mimetype);

        res.status(200).json({ message: "Upload successful", fileId });
    } catch (error) {
        console.error("Upload error:", error.message);
        res.status(500).json({ error: error.message });
    }
});

export default router;
