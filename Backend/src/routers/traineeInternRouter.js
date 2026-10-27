const express = require('express');
const { upload } = require('../config/multerConfig');
const { authenticate, optionalAuthenticate, authorize } = require('../security/authMiddleware');
const {
  createTraineeInternHandler,
  getAllTraineeInternsHandler,
  getNextPersonCodeHandler,
  getTraineeInternByIdHandler,
  updateTraineeInternHandler,
  deleteTraineeInternHandler,
} = require('../controllers/traineeInternController');

const router = express.Router();
const traineeManagers = authorize('Super Admin', 'Admin', 'Manager');

router.get('/next-person-id', optionalAuthenticate, getNextPersonCodeHandler);
router.get('/', authenticate, traineeManagers, getAllTraineeInternsHandler);
router.get('/:id', authenticate, traineeManagers, getTraineeInternByIdHandler);
router.post('/', optionalAuthenticate, upload.fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
  { name: 'college_id_doc', maxCount: 1 },
  { name: 'offer_letter', maxCount: 1 },
  { name: 'internship_letter', maxCount: 1 },
]), createTraineeInternHandler);
router.put('/:id', authenticate, traineeManagers, upload.fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
  { name: 'college_id_doc', maxCount: 1 },
  { name: 'offer_letter', maxCount: 1 },
  { name: 'internship_letter', maxCount: 1 },
]), updateTraineeInternHandler);
router.delete('/:id', authenticate, traineeManagers, deleteTraineeInternHandler);

module.exports = router;
