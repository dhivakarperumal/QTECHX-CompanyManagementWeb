const express = require('express');
const { submitServiceRequest } = require('../controllers/serviceRequestController');

const router = express.Router();

router.post('/', submitServiceRequest);

module.exports = router;
