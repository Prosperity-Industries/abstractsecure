// server/utils/googleDrive.js

import { google } from 'googleapis';
import fs from 'fs';
import { readFileSync } from 'fs';

const SERVICE_ACCOUNT_FILE = './abstractsecure-65336d098100.json';  // Update with actual path

export const uploadToGoogleDrive = async (filePath, fileName, mimeType) => {
    try {
        console.log(`Uploading file: ${filePath}, Name: ${fileName}, Type: ${mimeType}`);

        // Load service account credentials
        const auth = new google.auth.GoogleAuth({
            keyFile: SERVICE_ACCOUNT_FILE,
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });

        const drive = google.drive({ version: 'v3', auth });

        // Get the Google Drive folder ID from .env
        const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

        const fileMetadata = {
            name: fileName,
            parents: folderId ? [folderId] : [],
        };

        const media = {
            mimeType,
            body: fs.createReadStream(filePath),
        };

        const response = await drive.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id',
            supportsAllDrives: true,
        });

        console.log(`File uploaded to Google Drive: ${response.data.id}`);

        // Remove temporary file after upload
        fs.unlinkSync(filePath);

        return response.data.id;
    } catch (error) {
        throw new Error(`Google Drive upload failed: ${error.message}`);
    }
};
