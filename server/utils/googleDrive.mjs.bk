// server/utils/googleDrive.mjs

import { google } from 'googleapis';
import fs from 'fs';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();  

export const uploadToGoogleDrive = async (filePath, fileName, mimeType) => {
    try {
        console.log(`Uploading file: ${filePath}, Name: ${fileName}, Type: ${mimeType}`);

/* ❌ Temporarily disable Google Drive upload logic */
/*
        // Load service account credentials
        const auth = new google.auth.GoogleAuth({
            keyFile: process.env.SERVICE_ACCOUNT_FILE,  // From .env
            scopes: ['https://www.googleapis.com/auth/drive.file'],
        });

        const drive = google.drive({ version: 'v3', auth });

        const fileMetadata = {
            name: fileName,
            parents: process.env.GOOGLE_DRIVE_FOLDER_ID ? [process.env.GOOGLE_DRIVE_FOLDER_ID] : [],
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

        fs.unlinkSync(filePath);  // Remove temporary local file after upload

        return response.data.id;
*/
    } catch (error) {
        throw new Error(`Google Drive upload failed: ${error.message}`);
    }
};
