const { v4: uuidv4 } = require("uuid");
const path = require("path");
const fs = require("fs");
const JobApplicationModel = require("../models/jobApplicationModel");
const JobModel = require("../models/jobModel");

const getUploadedFile = (req, filename) => {
  if (!filename) return null;
  const uploadsDir = path.join(__dirname, "../../uploads/jobs");
  const filePath = path.join(uploadsDir, filename);
  return filePath;
};

class JobApplicationController {
  // Create a new job application
  static async createApplication(req, res) {
    try {
      const { job_id } = req.params;

      if (!job_id) {
        return res.status(400).json({ message: "Job ID is required" });
      }

      // Verify job exists
      const job = await JobModel.getJobById(parseInt(job_id));
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      const {
        full_name,
        email,
        phone,
        alternate_phone,
        date_of_birth,
        gender,
        address,
        city,
        state,
        pincode,
        current_location,
        current_job_title,
        current_company,
        total_experience,
        relevant_experience,
        employment_status,
        current_salary,
        expected_salary,
        notice_period,
        joining_date,
        willing_to_relocate,
        preferred_work_mode,
        education,
        skills,
        certifications,
        linkedin_url,
        github_url,
        portfolio_url,
        screening_answers,
        additional_information,
      } = req.body;

      // Basic validation
      if (!full_name || !email || !phone) {
        return res.status(400).json({
          message: "Full name, email, and phone are required",
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Validate phone format (10-15 digits)
      const phoneRegex = /^\d{10,15}$/;
      if (!phoneRegex.test(phone.replace(/[\s\-\+]/g, ""))) {
        return res.status(400).json({ message: "Invalid phone number" });
      }

      // Handle file uploads
      let resume = null;
      let coverLetter = null;
      let portfolioFile = null;
      let certificates = null;

      if (req.files) {
        if (req.files.resume && Array.isArray(req.files.resume)) {
          resume = req.files.resume[0].filename;
        }
        if (req.files.cover_letter && Array.isArray(req.files.cover_letter)) {
          coverLetter = req.files.cover_letter[0].filename;
        }
        if (req.files.portfolio_file && Array.isArray(req.files.portfolio_file)) {
          portfolioFile = req.files.portfolio_file[0].filename;
        }
        if (req.files.certificates && Array.isArray(req.files.certificates)) {
          certificates = req.files.certificates[0].filename;
        }
      }

      // Check if resume is required
      if (job.resume_required === "Yes" && !resume) {
        return res.status(400).json({ message: "Resume is required for this job" });
      }

      const applicationData = {
        job_id: parseInt(job_id),
        applicant_id: req.user?.id || null,
        full_name,
        email,
        phone,
        alternate_phone: alternate_phone || null,
        date_of_birth: date_of_birth || null,
        gender: gender || null,
        address: address || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        current_location: current_location || null,
        current_job_title: current_job_title || null,
        current_company: current_company || null,
        total_experience: total_experience || null,
        relevant_experience: relevant_experience || null,
        employment_status: employment_status || null,
        current_salary: current_salary ? parseFloat(current_salary) : null,
        expected_salary: expected_salary ? parseFloat(expected_salary) : null,
        notice_period: notice_period || null,
        joining_date: joining_date || null,
        willing_to_relocate: willing_to_relocate || "No",
        preferred_work_mode: preferred_work_mode || null,
        education: education ? JSON.parse(education) : [],
        skills: skills ? JSON.parse(skills) : [],
        certifications: certifications || null,
        linkedin_url: linkedin_url || null,
        github_url: github_url || null,
        portfolio_url: portfolio_url || null,
        resume: resume || null,
        cover_letter: coverLetter || null,
        portfolio_file: portfolioFile || null,
        certificates: certificates || null,
        screening_answers: screening_answers ? JSON.parse(screening_answers) : {},
        additional_information: additional_information || null,
      };

      const application = await JobApplicationModel.createApplication(applicationData);

      res.status(201).json({
        message: "Application submitted successfully",
        data: application,
      });
    } catch (error) {
      console.error("Error creating application:", error);
      res
        .status(500)
        .json({ message: "Failed to create application", error: error.message });
    }
  }

  // Get application by ID
  static async getApplication(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Application ID is required" });
      }

      const application = await JobApplicationModel.getApplicationById(id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      res.json({ data: application });
    } catch (error) {
      console.error("Error fetching application:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch application", error: error.message });
    }
  }

  // Get all applications for a job
  static async getApplicationsByJob(req, res) {
    try {
      const { job_id } = req.params;
      const { status, search, limit } = req.query;

      if (!job_id) {
        return res.status(400).json({ message: "Job ID is required" });
      }

      const filters = {
        ...(status && { status }),
        ...(search && { search }),
        ...(limit && { limit: parseInt(limit) }),
      };

      const applications = await JobApplicationModel.getApplicationsByJobId(
        parseInt(job_id),
        filters
      );
      const counts = await JobApplicationModel.getApplicationCountByJob(parseInt(job_id));

      res.json({ data: applications, counts });
    } catch (error) {
      console.error("Error fetching applications:", error);
      res
        .status(500)
        .json({ message: "Failed to fetch applications", error: error.message });
    }
  }

  // Get applications for logged-in applicant
  static async getMyApplications(req, res) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const applications = await JobApplicationModel.getApplicationsByApplicantId(
        req.user.id
      );

      res.json({ data: applications });
    } catch (error) {
      console.error("Error fetching my applications:", error);
      res.status(500).json({
        message: "Failed to fetch your applications",
        error: error.message,
      });
    }
  }

  // Update application (applicant can update their own)
  static async updateApplication(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Application ID is required" });
      }

      const application = await JobApplicationModel.getApplicationById(id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Verify applicant can only update their own application
      if (req.user?.id && application.applicant_id !== req.user.id) {
        return res.status(403).json({ message: "Unauthorized to update this application" });
      }

      // Don't allow updating status (only admins/recruiters can)
      const { application_status, recruiter_notes, ...updateData } = req.body;

      const updated = await JobApplicationModel.updateApplication(id, updateData);

      res.json({
        message: "Application updated successfully",
        data: updated,
      });
    } catch (error) {
      console.error("Error updating application:", error);
      res
        .status(500)
        .json({ message: "Failed to update application", error: error.message });
    }
  }

  // Update application status (admin/recruiter only)
  static async updateApplicationStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      if (!id) {
        return res.status(400).json({ message: "Application ID is required" });
      }

      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }

      const validStatuses = ["Applied", "Under Review", "Shortlisted", "Interview", "Selected", "Rejected"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updated = await JobApplicationModel.updateApplicationStatus(id, status, notes);
      if (!updated) {
        return res.status(404).json({ message: "Application not found" });
      }

      res.json({
        message: "Application status updated successfully",
        data: updated,
      });
    } catch (error) {
      console.error("Error updating application status:", error);
      res.status(500).json({
        message: "Failed to update application status",
        error: error.message,
      });
    }
  }

  // Delete application
  static async deleteApplication(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Application ID is required" });
      }

      const application = await JobApplicationModel.getApplicationById(id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      // Verify applicant can only delete their own application (if not admin)
      if (req.user?.id && application.applicant_id !== req.user.id && !req.user.role?.includes("admin")) {
        return res.status(403).json({ message: "Unauthorized to delete this application" });
      }

      const success = await JobApplicationModel.deleteApplication(id);

      if (success) {
        res.json({ message: "Application deleted successfully" });
      } else {
        res.status(404).json({ message: "Application not found" });
      }
    } catch (error) {
      console.error("Error deleting application:", error);
      res
        .status(500)
        .json({ message: "Failed to delete application", error: error.message });
    }
  }

  // Download resume or other file
  static async downloadFile(req, res) {
    try {
      const { id, fileType } = req.params;

      if (!id || !fileType) {
        return res.status(400).json({ message: "Application ID and file type required" });
      }

      const application = await JobApplicationModel.getApplicationById(id);
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }

      let filename = null;
      switch (fileType) {
        case "resume":
          filename = application.resume;
          break;
        case "cover_letter":
          filename = application.cover_letter;
          break;
        case "portfolio":
          filename = application.portfolio_file;
          break;
        case "certificates":
          filename = application.certificates;
          break;
        default:
          return res.status(400).json({ message: "Invalid file type" });
      }

      if (!filename) {
        return res.status(404).json({ message: "File not found" });
      }

      const filePath = getUploadedFile(req, filename);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: "File not found on server" });
      }

      res.download(filePath);
    } catch (error) {
      console.error("Error downloading file:", error);
      res
        .status(500)
        .json({ message: "Failed to download file", error: error.message });
    }
  }

  // Get application statistics for a job
  static async getApplicationStats(req, res) {
    try {
      const { job_id } = req.params;

      if (!job_id) {
        return res.status(400).json({ message: "Job ID is required" });
      }

      const stats = await JobApplicationModel.getApplicationCountByJob(parseInt(job_id));

      res.json({ data: stats });
    } catch (error) {
      console.error("Error fetching application stats:", error);
      res.status(500).json({
        message: "Failed to fetch application statistics",
        error: error.message,
      });
    }
  }
}

module.exports = JobApplicationController;
