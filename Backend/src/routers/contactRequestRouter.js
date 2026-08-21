const express = require('express');
const {
  getContactRequests,
  getContactRequest,
  submitContactRequest,
  updateContactRequestStatus,
  deleteContactRequest,
} = require('../controllers/contactRequestController');
const { authenticate, authorize } = require('../security/authMiddleware');

const router = express.Router();

router.post('/', submitContactRequest);
router.get('/', authenticate, authorize('Admin', 'Super Admin'), getContactRequests);
router.get('/:uuid', authenticate, authorize('Admin', 'Super Admin'), getContactRequest);
router.patch('/:uuid/status', authenticate, authorize('Admin', 'Super Admin'), updateContactRequestStatus);
router.delete('/:uuid', authenticate, authorize('Admin', 'Super Admin'), deleteContactRequest);

module.exports = router;
