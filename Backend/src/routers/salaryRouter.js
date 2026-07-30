const express = require("express");
const router = express.Router();
const salaryController = require("../controllers/salaryController");
const { authenticate } = require("../security/authMiddleware");

// Salary Details route
router.get("/details", authenticate, salaryController.getEmployeeSalaryDetails);

// Pay Salary route
router.post("/pay", authenticate, salaryController.paySalary);

// Salary History route
router.get("/history", authenticate, salaryController.getSalaryHistory);
router.put("/pay/:id", authenticate, salaryController.updateSalary);
router.delete("/pay/:id", authenticate, salaryController.deleteSalary);

module.exports = router;
