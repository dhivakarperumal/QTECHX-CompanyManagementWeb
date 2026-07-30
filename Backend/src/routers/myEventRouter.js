const express = require('express');
const router = express.Router();
const { upload } = require('../config/multerConfig');
const {
  createMyEvent,
  getAllMyEvents,
  getMyEventById,
  updateMyEvent,
  deleteMyEvent,
} = require('../controllers/myEventController');

router.post('/', upload.single('document'), createMyEvent);
router.get('/', getAllMyEvents);
router.get('/:id', getMyEventById);
router.put('/:id', upload.single('document'), updateMyEvent);
router.delete('/:id', deleteMyEvent);

module.exports = router;
