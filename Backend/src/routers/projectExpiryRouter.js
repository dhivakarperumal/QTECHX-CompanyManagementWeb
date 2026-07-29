const express = require('express');
const { authenticate, optionalAuthenticate, authorize } = require('../security/authMiddleware');
const { upload } = require('../config/multerConfig');
const {
  createExpiryHandler,
  listExpiryHandler,
  getExpiryHandler,
  updateExpiryHandler,
  deleteExpiryHandler,
  statsExpiryHandler,
  renewExpiryHandler,
  reminderExpiryHandler,
} = require('../controllers/projectExpiryController');

const router = express.Router();
const admins = authorize('Super Admin', 'Admin');
const allStaff = authorize('Super Admin', 'Admin', 'Manager', 'Staff', 'Employee');
const uploadSingle = upload.single('invoice_file');

router.get('/stats', optionalAuthenticate, statsExpiryHandler);
router.get('/', optionalAuthenticate, listExpiryHandler);
router.post('/', authenticate, admins, uploadSingle, createExpiryHandler);
router.get('/:id', optionalAuthenticate, getExpiryHandler);
router.put('/:id', authenticate, admins, uploadSingle, updateExpiryHandler);
router.delete('/:id', authenticate, admins, deleteExpiryHandler);
router.post('/:id/renew', authenticate, admins, uploadSingle, renewExpiryHandler);
router.post('/:id/reminders', authenticate, admins, reminderExpiryHandler);

module.exports = router;
