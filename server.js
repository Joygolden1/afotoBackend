const express = require('express');
const multer = require('multer');
const cors = require('cors'); // Add this
const { Bucket, uniquePath } = require('@upstash/blob');

const app = express();

// Enable CORS for your Flutter web app
app.use(cors()); 

const upload = multer({ storage: multer.memoryStorage() });
const bucket = Bucket.fromEnv();

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    // Determine file type (image or video)
    const isVideo = req.file.mimetype.startsWith('video/');
    const folder = isVideo ? 'videos' : 'images';
    
    // Use uniquePath to prevent overwriting files with the same name
    const path = uniquePath(`${req.body.userId}/${folder}/${req.file.originalname}`);

    // Upload to Upstash
    const blob = await bucket.put(path, req.file.buffer, {
      contentType: req.file.mimetype,
      // Optional: set max size limits per type
      // maxSize: isVideo ? "50mb" : "5mb" 
    });

    res.json({ url: blob.url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));