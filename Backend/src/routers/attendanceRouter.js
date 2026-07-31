const express = require("express");
const controller = require("../controllers/attendanceController");
const { authenticate, authorize } = require("../security/authMiddleware");

const router = express.Router();
const commonAccess = authorize("Super Admin", "Admin", "Manager", "HR", "Employee");

router.post("/", authenticate, commonAccess, controller.create);
router.get("/summary", authenticate, commonAccess, controller.summary);
router.get("/:employeeId", authenticate, commonAccess, controller.employeeAttendance);

module.exports = router;
