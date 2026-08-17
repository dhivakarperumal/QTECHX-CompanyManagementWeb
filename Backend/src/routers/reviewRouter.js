const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate, authorize } = require('../security/authMiddleware');

router.use(authenticate);

router.get('/', reviewController.listReviews);
router.get('/:id', reviewController.getReview);
router.post('/', authorize('Admin', 'Super Admin'), reviewController.createReview);
router.put('/:id', authorize('Admin', 'Super Admin'), reviewController.updateReview);
router.delete('/:id', authorize('Admin', 'Super Admin'), reviewController.deleteReview);

module.exports = router;
