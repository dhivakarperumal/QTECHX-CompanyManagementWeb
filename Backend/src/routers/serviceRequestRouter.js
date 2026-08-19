const express = require('express');
const {
  getServiceRequests,
  submitServiceRequest,
  updateServiceRequestStatus,
  deleteServiceRequest,
} = require('../controllers/serviceRequestController');
const { authenticate, authorize } = require('../security/authMiddleware');

const router = express.Router();

router.post('/', submitServiceRequest);
router.get('/', authenticate, authorize('Admin', 'Super Admin'), getServiceRequests);
router.patch('/:uuid/status', authenticate, authorize('Admin', 'Super Admin'), updateServiceRequestStatus);
router.delete('/:uuid', authenticate, authorize('Admin', 'Super Admin'), deleteServiceRequest);

module.exports = router;
