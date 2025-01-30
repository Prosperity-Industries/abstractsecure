import { google } from 'googleapis';
import fs from 'fs';

export const uploadToGoogleDrive = async (filePath: string, fileName: string, mimeType: string): Promise<string> => {
  try {
    console.log(`Uploading file: ${filePath}, Name: ${fileName}, Type: ${mimeType}`);
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
//        redirect_uris: [process.env.GOOGLE_REDIRECT_URI],
      },
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
    }) as { data: { id: string } };

    fs.unlinkSync(filePath); // Remove temporary file
    return response.data.id;

  } catch (error) {
    throw new Error(`Google Drive upload failed: ${(error as Error).message}`);
  }
};
