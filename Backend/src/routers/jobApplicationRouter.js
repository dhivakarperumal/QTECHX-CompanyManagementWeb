const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const JobApplicationController = require("../controllers/jobApplicationController");
const { authorize } = require("../security/authMiddleware");

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
    // Allow common document types
    const allowedMimes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
      "text/plain",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`), false);
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
router.get("/my-applications/list", authorize(), JobApplicationController.getMyApplications);

// Protected routes - Get application by ID
router.get("/:id/view", JobApplicationController.getApplication);

// Protected routes - Update application (applicant only)
router.put("/:id/update", authorize(), JobApplicationController.updateApplication);

// Protected routes - Download file from application
router.get("/:id/download/:fileType", JobApplicationController.downloadFile);

// Admin/Recruiter routes - Get all applications for a job
router.get(
  "/job/:job_id/list",
  authorize(["admin", "recruiter"]),
  JobApplicationController.getApplicationsByJob
);

// Admin/Recruiter routes - Update application status
router.put(
  "/:id/status",
  authorize(["admin", "recruiter"]),
  JobApplicationController.updateApplicationStatus
);

// Admin/Recruiter routes - Delete application
router.delete(
  "/:id/delete",
  authorize(["admin", "recruiter"]),
  JobApplicationController.deleteApplication
);

// Admin/Recruiter routes - Get application statistics
router.get(
  "/job/:job_id/stats",
  authorize(["admin", "recruiter"]),
  JobApplicationController.getApplicationStats
);

module.exports = router;
