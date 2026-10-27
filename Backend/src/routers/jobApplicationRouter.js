const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const JobApplicationController = require("../controllers/jobApplicationController");
const { authenticate, authorize } = require("../security/authMiddleware");

const router = express.Router();

// Configure multer for job applications
const uploadsDir = path.join(__dirname, "../../uploads/jobs");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypesByExtension = {
      ".pdf": ["application/pdf"],
      ".doc": ["application/msword"],
      ".docx": ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      ".pptx": ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
      ".xls": ["application/vnd.ms-excel"],
      ".xlsx": ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
      ".jpg": ["image/jpeg"],
      ".jpeg": ["image/jpeg"],
      ".png": ["image/png"],
      ".txt": ["text/plain"],
    };
    const extension = path.extname(file.originalname).toLowerCase();
    if (allowedMimeTypesByExtension[extension]?.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type. Upload a PDF, office document, JPG, or PNG file."), false);
    }
  },
});

// Public routes - Get job details for form prefilling
router.get("/:job_id/form-data", async (req, res) => {
  try {
    const JobModel = require("../models/jobModel");
    const job = await JobModel.getJobById(parseInt(req.params.job_id));
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.json({ data: job });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch job details", error: error.message });
  }
});

// Admin/Recruiter routes - MUST BE BEFORE /:id routes
// Get all applications
router.get(
  "/admin/all",
  authenticate,
  authorize("admin", "recruiter"),
  JobApplicationController.getAllApplications
);

// Admin/Recruiter routes - Get application statistics
router.get(
  "/job/:job_id/stats",
  authenticate,
  authorize("admin", "recruiter"),
  JobApplicationController.getApplicationStats
);

// Admin/Recruiter routes - Get all applications for a job
router.get(
  "/job/:job_id/list",
  authenticate,
  authorize("admin", "recruiter"),
  JobApplicationController.getApplicationsByJob
);

// Public route - Submit application
router.post(
  "/:job_id/submit",
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "cover_letter", maxCount: 1 },
    { name: "portfolio_file", maxCount: 1 },
    { name: "certificates", maxCount: 1 },
  ]),
  JobApplicationController.createApplication
);

// Protected routes - Get my applications (logged-in user)
router.get("/my-applications/list", authenticate, authorize(), JobApplicationController.getMyApplications);

// Applicant records contain personal information and are restricted to recruiting staff.
router.get(
  "/:id/view",
  authenticate,
  authorize("admin", "recruiter", "hr"),
  JobApplicationController.getApplication
);

// Protected routes - Update application (applicant only)
router.put("/:id/update", authenticate, authorize(), JobApplicationController.updateApplication);

// Protected routes - Download file from application
router.get(
  "/:id/download/:fileType",
  authenticate,
  authorize("admin", "recruiter", "hr"),
  JobApplicationController.downloadFile
);

// Admin/Recruiter routes - Update application status
router.put(
  "/:id/status",
  authenticate,
  authorize("admin", "recruiter"),
  JobApplicationController.updateApplicationStatus
);

// Admin/Recruiter routes - Delete application
router.delete(
  "/:id/delete",
  authenticate,
  authorize("admin", "recruiter"),
  JobApplicationController.deleteApplication
);

module.exports = router;
