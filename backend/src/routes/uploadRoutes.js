const express = require('express');
const auth = require('../middlewares/auth');
const { upload, uploadMedia } = require('../controllers/uploadController');

const router = express.Router();

router.use(auth);

router.post('/', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      const message =
        err.message === 'Unsupported file type'
          ? 'Unsupported file type (image, video, PDF only)'
          : 'File too large (max 10MB)';
      return res.status(413).json({ message });
    }
    return next();
  });
}, uploadMedia);

module.exports = router;
