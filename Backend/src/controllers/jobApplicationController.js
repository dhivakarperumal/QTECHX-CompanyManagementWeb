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

      // Check if email or mobile exists in users table
      const userModel = require("../models/userModel");
      const existingUser = await userModel.existsByEmailOrMobile(email, phone);
      if (existingUser) {
        return res.status(409).json({
          message: "This email address or mobile number is already registered in our user system. Please use different details or contact support.",
        });
      }

      // Check if already applied for this specific job
      const alreadyApplied = await JobApplicationModel.hasAlreadyApplied(
        parseInt(job_id),
        phone,
        email,
        req.user?.id || null
      );

      if (alreadyApplied) {
        return res.status(409).json({
          message: "This mobile number or email address has already been used to apply for this position.",
        });
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

      const validStatuses = ["Applied", "Under Review", "Shortlisted", "Interview", "Selected", "Converted", "Rejected"];
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

      // Verify applicant can only delete their own application.
      // Admin/recruiter/hr/super-admin users can delete any application, but the
      // role may be stored in different cases or field names.
      const userRole = req.user?.role || req.user?.user_role || req.user?.emp_role || "";
      const normalizedRole = String(userRole).toLowerCase().trim();
      const isPrivilegedRole = ["super admin", "admin", "recruiter", "hr"].includes(normalizedRole);

      if (req.user?.id && application.applicant_id !== req.user.id && !isPrivilegedRole) {
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

  // Get all applications (admin only)
  static async getAllApplications(req, res) {
    try {
      const { job_id, status, search } = req.query;
      
      const filter = {};
      if (job_id) filter.job_id = parseInt(job_id);
      if (status) filter.application_status = status;
      if (search) filter.search = search;

      const applications = await JobApplicationModel.getAllApplications(filter);
      
      res.json({ 
        data: applications,
        count: applications.length 
      });
    } catch (error) {
      console.error("Error fetching all applications:", error);
      res.status(500).json({
        message: "Failed to fetch applications",
        error: error.message,
      });
    }
  }

  static async convertToEmployee(req, res) {
    const db = require("../config/db").getDB();
    let connection;
    
    try {
      const { application_id } = req.body;

      if (!application_id) {
        return res.status(400).json({ message: "Application ID is required" });
      }

      // Check authorization - allow Super Admin, Admin, Recruiter, and HR (case-insensitive)
      const userRole = req.user?.role;
      const normalizedRole = userRole?.toLowerCase().trim();
      if (!normalizedRole || !['super admin', 'admin', 'recruiter', 'hr'].includes(normalizedRole)) {
        return res.status(403).json({ message: "Only admins, recruiters, HR, and Super Admin can convert applicants" });
      }

      // Get application with all details
      const application = await JobApplicationModel.getApplicationById(application_id);
      
      if (!application) {
        return res.status(404).json({ message: "Job application not found" });
      }

      // Check if already converted
      if (application.application_status === 'Converted') {
        return res.status(400).json({ message: "This applicant has already been converted to an employee" });
      }

      // Only "Selected" applicants can be converted
      if (application.application_status !== 'Selected') {
        return res.status(400).json({ 
          message: `Only applicants with 'Selected' status can be converted. Current status: ${application.application_status}` 
        });
      }

      // Start transaction
      connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        // 1. Check if user already exists (by email)
        const [existingUsers] = await connection.execute(
          "SELECT id, user_id FROM users WHERE LOWER(TRIM(email)) = ? LIMIT 1",
          [String(application.email).trim().toLowerCase()]
        );

        if (existingUsers.length > 0) {
          await connection.rollback();
          return res.status(409).json({ message: "Email already exists in user accounts" });
        }

        // 2. Check if mobile already exists in users
        const mobileForCheck = application.phone ? String(application.phone).trim() : null;
        if (mobileForCheck) {
          const [existingMobile] = await connection.execute(
            "SELECT id, user_id FROM users WHERE LOWER(TRIM(mobile)) = ? LIMIT 1",
            [mobileForCheck.toLowerCase()]
          );
          if (existingMobile.length > 0) {
            await connection.rollback();
            return res.status(409).json({ message: "Mobile number already exists in user accounts" });
          }
        }

        // 3. Check if employee already exists in employees table by email or mobile
        const emailForEmployeeCheck = String(application.email || '').trim().toLowerCase();
        const [existingEmployee] = await connection.execute(
          "SELECT id FROM employees WHERE LOWER(TRIM(personal_email)) = ? OR (? IS NOT NULL AND LOWER(TRIM(mobile_number)) = ?) LIMIT 1",
          [emailForEmployeeCheck, mobileForCheck, mobileForCheck ? mobileForCheck.toLowerCase() : '']
        );

        if (existingEmployee.length > 0) {
          await connection.rollback();
          return res.status(409).json({ message: "This applicant has already been converted to an employee" });
        }

        // 4. Generate employee_id and employee_code
        const employeeId = uuidv4();
        const [codeRows] = await connection.execute(
          "SELECT employee_code FROM employees WHERE employee_code IS NOT NULL AND LOWER(employee_code) REGEXP '^empqt[0-9]+$' ORDER BY CAST(SUBSTRING(employee_code, 6) AS UNSIGNED) DESC LIMIT 1"
        );
        
        let nextCode = "EMPQT1";
        if (codeRows.length > 0) {
          const match = String(codeRows[0].employee_code).match(/^EMPQT(\d+)$/i);
          if (match) {
            nextCode = `EMPQT${parseInt(match[1]) + 1}`;
          }
        }

        // 5. Create User Account
        // Default employee login: email + mobile number as password
        const bcrypt = require("bcrypt");
        const safeMobileForPassword = mobileForCheck ? String(mobileForCheck).replace(/\s+/g, '').trim() : '';
        const defaultPassword = safeMobileForPassword || Math.random().toString(36).slice(-10);
        const hashedPassword = await bcrypt.hash(defaultPassword, 12);
        const username = (application.email).split('@')[0];

        const [userResult] = await connection.execute(
          `INSERT INTO users (user_id, username, email, mobile, password, role, status, created_by, updated_by)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            employeeId,
            username || `emp_${Date.now()}`,
            application.email,
            mobileForCheck,
            hashedPassword,
            'Employee',
            'Active',
            req.user?.user_id || 'SYSTEM',
            req.user?.user_id || 'SYSTEM'
          ]
        );

        // 6. Parse skills and education if they're JSON
        let skillsArray = [];
        let educationArray = [];

        if (application.skills) {
          try {
            skillsArray = Array.isArray(application.skills) 
              ? application.skills 
              : (typeof application.skills === 'string' ? JSON.parse(application.skills) : []);
          } catch (e) {
            skillsArray = [];
          }
        }

        if (application.education) {
          try {
            educationArray = Array.isArray(application.education) 
              ? application.education 
              : (typeof application.education === 'string' ? JSON.parse(application.education) : []);
          } catch (e) {
            educationArray = [];
          }
        }

        // 7. Create Employee Record
        const employeeData = {
          employee_id: employeeId,
          employee_code: nextCode,
          first_name: (application.full_name || '').split(' ')[0] || '',
          last_name: (application.full_name || '').split(' ').slice(1).join(' ') || '',
          gender: application.gender || null,
          dob: application.date_of_birth || null,
          personal_email: application.email,
          mobile_number: mobileForCheck,
          permanent_address: application.address || null,
          designation: application.current_job_title || 'Employee',
          joining_date: new Date().toISOString().split('T')[0],
          employment_status: 'Active',
          role: 'Employee',
          educational_details: JSON.stringify(educationArray),
          resume_url: application.resume || null,
          created_by: req.user?.user_id || 'SYSTEM',
          updated_by: req.user?.user_id || 'SYSTEM'
        };

        const fields = Object.keys(employeeData).filter(k => employeeData[k] !== undefined);
        const values = fields.map(k => employeeData[k]);
        const placeholders = fields.map(() => '?').join(', ');

        const [empResult] = await connection.execute(
          `INSERT INTO employees (${fields.join(', ')}) VALUES (${placeholders})`,
          values
        );

        // 8. Update Job Application Status to "Converted"
        await connection.execute(
          "UPDATE job_applications SET application_status = ?, updated_at = NOW() WHERE id = ?",
          ['Converted', application_id]
        );

        // 9. Commit transaction
        await connection.commit();

        return res.status(201).json({
          success: true,
          message: "Applicant successfully converted to employee",
          data: {
            employee_id: employeeId,
            employee_code: nextCode,
            user_id: employeeId,
            application_id: application_id,
            email: application.email,
            password: safeMobileForPassword || defaultPassword,
            temporary_password_note: safeMobileForPassword
              ? `Login with email: ${application.email} and password: ${safeMobileForPassword}`
              : "Employee can reset password on first login"
          }
        });

      } catch (transactionError) {
        await connection.rollback();
        throw transactionError;
      }
    } catch (error) {
      console.error("[JobApplicationController] convertToEmployee error:", error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('email')) {
          return res.status(409).json({ message: "Email already exists" });
        }
        if (error.message.includes('mobile')) {
          return res.status(409).json({ message: "Mobile number already exists" });
        }
      }

      res.status(500).json({
        message: "Failed to convert applicant to employee",
        error: error.message
      });
    } finally {
      if (connection) {
        await connection.release();
      }
    }
  }

  static async getEligibleApplicantsForConversion(req, res) {
    try {
      // Only "Selected" applications are eligible
      const applications = await JobApplicationModel.getApplicationsByStatus('Selected', 1000);
      
      // Filter to exclude already converted applications (those with status = 'Converted')
      const db = require("../config/db").getDB();
      const [convertedApps] = await db.execute(
        "SELECT id FROM job_applications WHERE application_status = 'Converted'"
      );
      
      const convertedSet = new Set(convertedApps.map(row => row.id));
      const eligible = applications.filter(app => !convertedSet.has(app.id));

      const formatted = eligible.map(app => ({
        id: app.id,
        label: `${app.full_name} | ${app.email} | ${app.phone} | ${app.current_job_title || 'N/A'} | ${app.application_status}`,
        full_name: app.full_name,
        email: app.email,
        phone: app.phone,
        job_title: app.current_job_title,
        status: app.application_status,
        application_data: app
      }));

      res.json({ data: formatted });
    } catch (error) {
      console.error("[JobApplicationController] getEligibleApplicantsForConversion error:", error);
      res.status(500).json({
        message: "Failed to fetch eligible applicants",
        error: error.message,
      });
    }
  }

  static async checkEligibility(req, res) {
    try {
      const { job_id } = req.params;
      const { email, phone } = req.body;

      if (!email && !phone) {
        return res.status(400).json({ message: "Email or phone number is required" });
      }

      // Check users table
      const userModel = require("../models/userModel");
      const existingUser = await userModel.existsByEmailOrMobile(email, phone);
      if (existingUser) {
        return res.status(409).json({
          eligible: false,
          message: "This email address or mobile number is already registered in our user system.",
        });
      }

      // Check duplicate application for this job
      if (job_id) {
        const alreadyApplied = await JobApplicationModel.hasAlreadyApplied(
          parseInt(job_id),
          phone,
          email,
          req.user?.id || null
        );
        if (alreadyApplied) {
          return res.status(409).json({
            eligible: false,
            message: "This mobile number or email address has already been used to apply for this position.",
          });
        }
      }

      return res.status(200).json({ eligible: true, message: "Eligible to apply" });
    } catch (error) {
      console.error("[JobApplicationController] checkEligibility error:", error);
      res.status(500).json({ message: "Failed to verify eligibility", error: error.message });
    }
  }
}

module.exports = JobApplicationController;
