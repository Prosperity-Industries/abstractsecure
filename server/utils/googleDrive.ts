import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const oauth2Client = new google.auth.OAuth2(
  import.meta.env.VITE_GOOGLE_CLIENT_ID,
  import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
  window.location.origin // Redirect URI will be the app's origin
);

const drive = google.drive({ version: 'v3', auth: oauth2Client });

export const uploadToGoogleDrive = async (file: File, fileName: string): Promise<string> => {
  try {
    // First ensure we have a valid token
    const token = await oauth2Client.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    // Create file metadata
    const fileMetadata = {
      name: fileName,
      parents: [import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID]
    };

    // Create media object
    const media = {
      mimeType: file.type,
      body: file
    };

    // Upload file
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id,webViewLink'
    });

    // Set file to be publicly viewable via link
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone'
      }
    });

    // Return the web view link
    return response.data.webViewLink || '';
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
};

export const initializeGoogleAuth = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      // Load the Google API client
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        gapi.load('client:auth2', async () => {
          try {
            await gapi.client.init({
              clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
              scope: SCOPES.join(' ')
            });
            resolve();
          } catch (error) {
            reject(error);
          }
        });
      };
      document.body.appendChild(script);
    } catch (error) {
      reject(error);
    }
  });
};

export const getAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
};

export const handleAuthCallback = async (code: string) => {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  return tokens;
};
