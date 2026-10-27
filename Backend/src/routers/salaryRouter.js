const express = require("express");
const router = express.Router();
const salaryController = require("../controllers/salaryController");
const { authenticate, authorize } = require("../security/authMiddleware");
const payrollReaders = authorize("Super Admin", "Admin", "Employee", "Staff");
const payrollAdmins = authorize("Super Admin", "Admin");

// Salary Details route
router.get("/details", authenticate, payrollReaders, salaryController.getEmployeeSalaryDetails);

// Pay Salary route
router.post("/pay", authenticate, payrollAdmins, salaryController.paySalary);

// Salary History route
router.get("/history", authenticate, payrollReaders, salaryController.getSalaryHistory);
router.put("/pay/:id", authenticate, payrollAdmins, salaryController.updateSalary);
router.delete("/pay/:id", authenticate, payrollAdmins, salaryController.deleteSalary);

module.exports = router;
