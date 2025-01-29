const express = require('express');
const { google } = require('googleapis');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(bodyParser.json());

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { originalname, path: tempPath } = req.file;

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uris: [process.env.GOOGLE_REDIRECT_URI],
      },
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    const fileMetadata = {
      name: originalname,
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(tempPath),
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id',
    });

    fs.unlinkSync(tempPath); // Remove the temporary file

    res.status(200).json({ fileId: response.data.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
