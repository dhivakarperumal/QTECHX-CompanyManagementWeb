const express = require("express");
const controller = require("../controllers/attendanceController");
const { authenticate, authorize } = require("../security/authMiddleware");

const router = express.Router();
const commonAccess = authorize("Super Admin", "Admin", "Manager", "HR", "Employee");

router.post("/", authenticate, commonAccess, controller.create);
router.post("/clock-in", authenticate, commonAccess, controller.clockIn);
router.put("/clock-out", authenticate, commonAccess, controller.clockOut);
router.put("/break-start", authenticate, commonAccess, controller.breakStart);
router.put("/break-end", authenticate, commonAccess, controller.breakEnd);
router.get("/summary", authenticate, commonAccess, controller.summary);
router.get("/by-employee", authenticate, commonAccess, controller.getByEmployeeDate);
router.get("/:employeeId", authenticate, commonAccess, controller.employeeAttendance);

module.exports = router;
