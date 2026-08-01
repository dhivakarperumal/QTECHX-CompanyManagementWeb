const express = require("express");
const router = express.Router();
const leaveController = require("../controllers/employeeLeaveController");
const { authenticate, authorize } = require("../security/authMiddleware");

// All routes require authentication
router.use(authenticate);

// Employee routes
router.post("/apply", leaveController.applyLeave);
router.get("/my-leaves", leaveController.getMyLeaves);
router.get("/employee/:employeeId", leaveController.getEmployeeLeaveHistory);
router.get("/employee", leaveController.getEmployeeLeaveHistory);

// Admin routes
router.get("/all", authorize("Admin", "Super Admin"), leaveController.getAllLeaves);
router.put("/:id/status", authorize("Admin", "Super Admin"), leaveController.updateLeaveStatus);

module.exports = router;
