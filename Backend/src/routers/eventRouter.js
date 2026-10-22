const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../security/authMiddleware');
const {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent
} = require('../controllers/eventController');

router.post('/', authenticate, authorize('Admin', 'Super Admin'), createEvent);
router.get('/', getAllEvents);
router.get('/:id', getEventById);
router.put('/:id', authenticate, authorize('Admin', 'Super Admin'), updateEvent);
router.delete('/:id', authenticate, authorize('Admin', 'Super Admin'), deleteEvent);

module.exports = router;
