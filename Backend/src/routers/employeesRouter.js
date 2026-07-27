const express = require("express");
const controller = require("../controllers/employeesController");
const { authenticate, authorize } = require("../security/authMiddleware");
const { upload } = require("../config/multerConfig");

const router = express.Router();

// Only Admins, Managers and HR can manage employees
const hrManagers = authorize("Super Admin", "Admin", "Manager", "HR");
const administrators = authorize("Super Admin", "Admin");

const uploadFields = upload.fields([
  { name: 'profile_photo', maxCount: 1 },
  { name: 'resume_url', maxCount: 1 },
  { name: 'aadhaar_url', maxCount: 1 },
  { name: 'pan_url', maxCount: 1 },
  { name: 'passport_url', maxCount: 1 },
  { name: 'offer_letter_url', maxCount: 1 },
  { name: 'appointment_letter_url', maxCount: 1 },
  { name: 'nda_url', maxCount: 1 }
]);

router.post("/", authenticate, hrManagers, uploadFields, controller.create);
router.get("/", authenticate, hrManagers, controller.getAll);
router.get("/:employeeId", authenticate, hrManagers, controller.getOne);
router.put("/:employeeId", authenticate, administrators, uploadFields, controller.update);
router.delete("/:employeeId", authenticate, administrators, controller.remove);

module.exports = router;
