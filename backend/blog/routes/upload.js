const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const blogAuth = require('../middleware/auth');
const logger = require('../utils/logger');
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Seules les images sont autorisées'), false);
    }
    cb(null, true);
  }
});

router.post('/', blogAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier n\'a été uploadé' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
      
    const result = await cloudinary.uploader.upload(dataURI, {
      resource_type: 'auto',
      folder: 'blog'
    });

    res.json({
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (error) {
    logger.error('Error uploading:', error);
    res.status(500).json({ 
      message: 'Error uploading',
      error: error.message 
    });
  }
});

router.delete('/:public_id', blogAuth, async (req, res) => {
  try {
    const publicId = decodeURIComponent(req.params.public_id);
    logger.info('Deleting image:', publicId); 
    
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.json({ message: 'Image deleted successfully' });
    } else {
      logger.error('Error Cloudinary:', result);
      res.status(400).json({ 
        message: 'Error deleting image',
        details: result 
      });
    }
  } catch (error) {
    logger.error('Error deleting image:', error);
    res.status(500).json({ 
      message: 'Error deleting image',
      error: error.message 
    });
  }
});

module.exports = router; 