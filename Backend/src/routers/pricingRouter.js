const express = require('express');
const router = express.Router();
const pricingController = require('../controllers/pricingController');
const { authenticate, authorize } = require('../security/authMiddleware');

// Public endpoints - no authentication required
router.get('/public/all', pricingController.listPricing);

router.use(authenticate);

router.get('/', pricingController.listPricing);
router.get('/:id', pricingController.getPricing);
router.post('/', authorize('Admin', 'Super Admin'), pricingController.createPricing);
router.put('/:id', authorize('Admin', 'Super Admin'), pricingController.updatePricing);
router.delete('/:id', authorize('Admin', 'Super Admin'), pricingController.deletePricing);

module.exports = router;
