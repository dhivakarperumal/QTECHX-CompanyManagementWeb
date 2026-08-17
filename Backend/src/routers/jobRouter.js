const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticate, authorize } = require('../security/authMiddleware');
const { upload } = require('../config/multerConfig');

router.use(authenticate);

router.get('/', jobController.listJobs);
router.get('/:id', jobController.getJob);
router.post('/', authorize('Admin', 'Super Admin'), upload.single('company_logo'), jobController.createJob);
router.put('/:id', authorize('Admin', 'Super Admin'), upload.single('company_logo'), jobController.updateJob);
router.delete('/:id', authorize('Admin', 'Super Admin'), jobController.deleteJob);

module.exports = router;
