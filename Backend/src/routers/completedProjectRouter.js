const express = require("express");
const router = express.Router();
const completedProjectController = require("../controllers/completedProjectController");
const { authenticate, optionalAuthenticate, authorize } = require("../security/authMiddleware");
const { upload } = require("../config/multerConfig");

// Public endpoints (e.g. for client/public showcase pages)
router.get("/public/all", completedProjectController.listCompletedProjects);
router.get("/public/:id", completedProjectController.getCompletedProject);

// Authenticated/Admin endpoints
router.get("/", optionalAuthenticate, completedProjectController.listCompletedProjects);
router.get("/:id", optionalAuthenticate, completedProjectController.getCompletedProject);

router.post(
  "/",
  authenticate,
  authorize("Admin", "Super Admin"),
  upload.any(),
  completedProjectController.createCompletedProject
);

router.put(
  "/:id",
  authenticate,
  authorize("Admin", "Super Admin"),
  upload.any(),
  completedProjectController.updateCompletedProject
);

router.delete(
  "/:id",
  authenticate,
  authorize("Admin", "Super Admin"),
  completedProjectController.deleteCompletedProject
);

module.exports = router;
