const express = require("express");
const controller = require("../controllers/attendanceController");
const { authenticate, authorize } = require("../security/authMiddleware");

const router = express.Router();
const adminAccess = authorize("Super Admin", "Admin", "Manager", "HR");

router.post("/", authenticate, adminAccess, controller.create);
router.get("/summary", authenticate, adminAccess, controller.summary);
router.get("/:employeeId", authenticate, adminAccess, controller.employeeAttendance);

module.exports = router;
