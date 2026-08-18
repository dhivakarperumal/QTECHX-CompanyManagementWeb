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

// Public endpoints - no authentication required
router.get('/public/all', serviceController.listServices);
router.get('/public/:id', serviceController.getService);

// Protected endpoints
router.use(authenticate);

router.get('/', serviceController.listServices);
router.post('/', authorize('Admin', 'Super Admin'), uploadFields, serviceController.createService);
router.put('/:id', authorize('Admin', 'Super Admin'), uploadFields, serviceController.updateService);
router.delete('/:id', authorize('Admin', 'Super Admin'), serviceController.deleteService);
router.get('/:id', serviceController.getService);

module.exports = router;
