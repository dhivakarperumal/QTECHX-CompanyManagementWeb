const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const { authenticate, authorize } = require('../security/authMiddleware');
const { upload } = require('../config/multerConfig');

const uploadFields = upload.fields([
  { name: 'icon', maxCount: 1 },
  { name: 'icon1', maxCount: 1 },
  { name: 'singlepageimage', maxCount: 10 },
]);
const uploadServiceImageFields = upload.fields([
  { name: 'singlepageimage', maxCount: 10 },
]);

function handleUploadError(uploadMiddleware) {
  return (req, res, next) => {
    uploadMiddleware(req, res, (error) => {
      if (error) {
        const message = error.code === 'LIMIT_FILE_SIZE'
          ? 'Each service image must be 50 MB or smaller'
          : error.code === 'LIMIT_UNEXPECTED_FILE'
            ? 'Upload no more than 10 service images at a time'
            : error.message || 'Service image upload failed';
        return res.status(400).json({ success: false, message });
      }
      return next();
    });
  };
}

// Public endpoints - no authentication required
router.get('/public/all', serviceController.listServices);
router.get('/public/:id', serviceController.getService);

// Protected endpoints
router.use(authenticate);

router.get('/', serviceController.listServices);
router.post(
  '/upload',
  authorize('Admin', 'Super Admin'),
  handleUploadError(uploadServiceImageFields),
  serviceController.uploadServiceImages
);
router.post('/', authorize('Admin', 'Super Admin'), handleUploadError(uploadFields), serviceController.createService);
router.put('/:id', authorize('Admin', 'Super Admin'), handleUploadError(uploadFields), serviceController.updateService);
router.delete('/:id', authorize('Admin', 'Super Admin'), serviceController.deleteService);
router.get('/:id', serviceController.getService);

module.exports = router;
