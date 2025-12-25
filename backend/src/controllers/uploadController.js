const multer = require('multer');
const { uploadBuffer } = require('../services/storageService');

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME = ['image/', 'video/', 'application/pdf'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const ok = ALLOWED_MIME.some((prefix) => file.mimetype.startsWith(prefix));
    if (!ok) return cb(new Error('Unsupported file type'));
    return cb(null, true);
  }
});

const uploadMedia = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file' });
    const url = await uploadBuffer({
      buffer: req.file.buffer,
      mimeType: req.file.mimetype,
      originalName: req.file.originalname,
      folder: 'wardens-connect'
    });
    res.json({ url });
  } catch (error) {
    next(error);
  }
};

module.exports = { upload, uploadMedia };
