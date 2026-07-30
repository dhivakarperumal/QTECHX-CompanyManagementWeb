const express = require('express');
const router = express.Router();
const projectPaymentController = require('../controllers/projectPaymentController');

router.post('/', projectPaymentController.createProjectPayment);
router.get('/', projectPaymentController.getProjectPayments);
router.get('/:projectId/summary', projectPaymentController.getProjectPaymentSummary);

module.exports = router;
