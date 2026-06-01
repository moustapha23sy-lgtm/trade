import { Router } from 'express';
import auth from '../middleware/auth.js';
import adminOnly from '../middleware/adminOnly.js';
import { upload, uploadToCloudinary } from '../middleware/upload.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// POST /api/upload — Upload single image
router.post('/', auth, adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier envoyé.' });
    }

    if (process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
      const ext = req.file.originalname.split('.').pop();
      const filename = `file_${Date.now()}.${ext}`;
      const uploadPath = path.join(__dirname, '..', 'public', 'uploads', filename);

      await fs.promises.mkdir(path.dirname(uploadPath), { recursive: true });
      await fs.promises.writeFile(uploadPath, req.file.buffer);

      return res.json({
        url: `http://localhost:${process.env.PORT || 5000}/uploads/${filename}`,
        public_id: filename,
      });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    res.json({
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'upload.' });
  }
});

// POST /api/upload/multiple — Upload multiple images
router.post('/multiple', auth, adminOnly, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Aucun fichier envoyé.' });
    }

    const results = [];
    if (process.env.CLOUDINARY_CLOUD_NAME === 'your_cloud_name') {
      for (const file of req.files) {
        const ext = file.originalname.split('.').pop();
        const filename = `file_${Date.now()}_${Math.floor(Math.random()*1000)}.${ext}`;
        const uploadPath = path.join(__dirname, '..', 'public', 'uploads', filename);
        await fs.promises.mkdir(path.dirname(uploadPath), { recursive: true });
        await fs.promises.writeFile(uploadPath, file.buffer);
        results.push({
          url: `http://localhost:${process.env.PORT || 5000}/uploads/${filename}`,
          public_id: filename,
        });
      }
    } else {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer);
        results.push({
          url: result.secure_url,
          public_id: result.public_id,
        });
      }
    }

    res.json({ files: results });
  } catch (err) {
    console.error('Multiple upload error:', err);
    res.status(500).json({ error: 'Erreur lors de l\'upload.' });
  }
});

export default router;
