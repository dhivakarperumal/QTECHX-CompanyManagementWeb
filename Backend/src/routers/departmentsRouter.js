const express = require('express');
const router = express.Router();
const controller = require('../controllers/departmentsController');

router.get('/', controller.listDepartments);

module.exports = router;
