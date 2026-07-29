const express = require("express");
const router = express.Router();
const salaryController = require("../controllers/salaryController");
const { authenticate } = require("../security/authMiddleware");

// Salary Details route
router.get("/details", authenticate, salaryController.getEmployeeSalaryDetails);

// Pay Salary route
router.post("/pay", authenticate, salaryController.paySalary);

module.exports = router;
