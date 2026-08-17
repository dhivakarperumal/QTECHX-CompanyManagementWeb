const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticate, authorize } = require('../security/authMiddleware');

router.use(authenticate);

router.get('/', jobController.listJobs);
router.get('/:id', jobController.getJob);
router.post('/', authorize('Admin', 'Super Admin'), jobController.createJob);
router.put('/:id', authorize('Admin', 'Super Admin'), jobController.updateJob);
router.delete('/:id', authorize('Admin', 'Super Admin'), jobController.deleteJob);

module.exports = router;
