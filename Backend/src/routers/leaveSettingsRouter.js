const express = require("express");
const router = express.Router();
const leaveSettingsController = require("../controllers/leaveSettingsController");
const { authenticate, authorize } = require("../security/authMiddleware");

router.use(authenticate);

router.get("/", leaveSettingsController.listLeaveSettings);
router.post("/", authorize("Admin", "Super Admin"), leaveSettingsController.saveLeaveSettings);

module.exports = router;
