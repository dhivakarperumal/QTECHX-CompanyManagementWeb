const reviewModel = require('../models/reviewModel');

async function listReviews(req, res) {
  try {
    const reviews = await reviewModel.getAllReviews();
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews', error: error.message });
  }
}

async function getReview(req, res) {
  try {
    const { id } = req.params;
    const review = await reviewModel.getReviewById(id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }
    return res.status(200).json({ success: true, data: review });
  } catch (error) {
    console.error('Error fetching review by id:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch review', error: error.message });
  }
}

async function createReview(req, res) {
  try {
    const actor = req.user?.employee_id || req.user?.id || req.user?.user_id || null;
    const review = await reviewModel.createReview({ ...req.body, created_by: actor, updated_by: actor });
    res.status(201).json({ success: true, message: 'Review created successfully', data: review });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to create review' });
  }
}

async function updateReview(req, res) {
  try {
    const { id } = req.params;
    const actor = req.user?.employee_id || req.user?.id || req.user?.user_id || null;
    const review = await reviewModel.updateReview(id, { ...req.body, updated_by: actor });
    res.status(200).json({ success: true, message: 'Review updated successfully', data: review });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to update review' });
  }
}

async function deleteReview(req, res) {
  try {
    const { id } = req.params;
    await reviewModel.deleteReview(id);
    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to delete review' });
  }
}

module.exports = {
  listReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
};
