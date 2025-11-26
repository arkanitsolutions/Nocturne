import { Router } from 'express';
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { verifyAdminToken } from './admin';

const router = Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Check if Cloudinary is configured
const isCloudinaryConfigured = !!(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

// Upload image endpoint
router.post('/upload', verifyAdminToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    if (!isCloudinaryConfigured) {
      // Fallback: Save locally or return base64
      const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
      return res.json({
        success: true,
        url: base64,
        message: 'Image stored as base64 (Cloudinary not configured)',
      });
    }

    // Upload to Cloudinary
    const result = await new Promise<any>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'nocturne-products',
          transformation: [
            { width: 800, height: 1000, crop: 'fill', quality: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file!.buffer);
    });

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
});

// Delete image endpoint
router.delete('/upload/:publicId', verifyAdminToken, async (req, res) => {
  try {
    if (!isCloudinaryConfigured) {
      return res.status(400).json({ error: 'Cloudinary not configured' });
    }

    const { publicId } = req.params;
    await cloudinary.uploader.destroy(`nocturne-products/${publicId}`);

    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message || 'Delete failed' });
  }
});

export default router;

