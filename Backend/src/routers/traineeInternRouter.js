const express = require('express');
const { upload } = require('../config/multerConfig');
const { authenticate, optionalAuthenticate } = require('../security/authMiddleware');
const {
  createTraineeInternHandler,
  getAllTraineeInternsHandler,
  getNextPersonCodeHandler,
  getTraineeInternByIdHandler,
  updateTraineeInternHandler,
  deleteTraineeInternHandler,
} = require('../controllers/traineeInternController');

const router = express.Router();

router.get('/next-person-id', optionalAuthenticate, getNextPersonCodeHandler);
router.get('/', optionalAuthenticate, getAllTraineeInternsHandler);
router.get('/:id', authenticate, getTraineeInternByIdHandler);
router.post('/', optionalAuthenticate, upload.fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
  { name: 'college_id_doc', maxCount: 1 },
  { name: 'offer_letter', maxCount: 1 },
  { name: 'internship_letter', maxCount: 1 },
]), createTraineeInternHandler);
router.put('/:id', authenticate, upload.fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
  { name: 'college_id_doc', maxCount: 1 },
  { name: 'offer_letter', maxCount: 1 },
  { name: 'internship_letter', maxCount: 1 },
]), updateTraineeInternHandler);
router.delete('/:id', authenticate, deleteTraineeInternHandler);

module.exports = router;
