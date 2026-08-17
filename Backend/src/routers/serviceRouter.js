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

router.use(authenticate);

router.get('/', serviceController.listServices);
router.get('/:id', serviceController.getService);
router.post('/', authorize('Admin', 'Super Admin'), uploadFields, serviceController.createService);
router.put('/:id', authorize('Admin', 'Super Admin'), uploadFields, serviceController.updateService);
router.delete('/:id', authorize('Admin', 'Super Admin'), serviceController.deleteService);

module.exports = router;
