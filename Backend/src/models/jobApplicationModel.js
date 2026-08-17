const { v4: uuidv4 } = require("uuid");
const { getDB } = require("../config/db");

class JobApplicationModel {
  // Create a new job application
  static async createApplication(applicationData) {
    const pool = getDB();
    const id = uuidv4();
    
    const {
      job_id,
      applicant_id,
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
      resume,
      cover_letter,
      portfolio_file,
      certificates,
      screening_answers,
      additional_information,
    } = applicationData;

    try {
      const [result] = await pool.execute(
        `INSERT INTO job_applications (
          id, job_id, applicant_id, full_name, email, phone, alternate_phone,
          date_of_birth, gender, address, city, state, pincode, current_location,
          current_job_title, current_company, total_experience, relevant_experience,
          employment_status, current_salary, expected_salary, notice_period, joining_date,
          willing_to_relocate, preferred_work_mode, education, skills, certifications,
          linkedin_url, github_url, portfolio_url, resume, cover_letter,
          portfolio_file, certificates, screening_answers, additional_information
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id, job_id, applicant_id, full_name, email, phone, alternate_phone,
          date_of_birth || null, gender || null, address || null, city || null,
          state || null, pincode || null, current_location || null, current_job_title || null,
          current_company || null, total_experience || null, relevant_experience || null,
          employment_status || null, current_salary || null, expected_salary || null,
          notice_period || null, joining_date || null, willing_to_relocate || "No",
          preferred_work_mode || null,
          JSON.stringify(education) || null,
          JSON.stringify(skills) || null,
          certifications || null, linkedin_url || null, github_url || null,
          portfolio_url || null, resume || null, cover_letter || null,
          portfolio_file || null, certificates || null,
          JSON.stringify(screening_answers) || null,
          additional_information || null,
        ]
      );

      // Update job_posts application count
      if (job_id) {
        await pool.execute(
          "UPDATE job_posts SET total_applications = total_applications + 1, new_applications = new_applications + 1 WHERE id = ?",
          [job_id]
        );
      }

      return { id, ...applicationData };
    } catch (error) {
      throw new Error(`Failed to create job application: ${error.message}`);
    }
  }

  // Get application by ID
  static async getApplicationById(id) {
    const pool = getDB();
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM job_applications WHERE id = ?",
        [id]
      );
      if (rows.length === 0) return null;
      return this.normalizeApplicationRow(rows[0]);
    } catch (error) {
      throw new Error(`Failed to get job application: ${error.message}`);
    }
  }

  // Get all applications for a job
  static async getApplicationsByJobId(jobId, filters = {}) {
    const pool = getDB();
    try {
      let query = "SELECT * FROM job_applications WHERE job_id = ?";
      const params = [jobId];

      if (filters.status) {
        query += " AND application_status = ?";
        params.push(filters.status);
      }

      if (filters.search) {
        query += " AND (full_name LIKE ? OR email LIKE ? OR phone LIKE ?)";
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      query += " ORDER BY applied_at DESC";
      if (filters.limit) {
        query += " LIMIT ?";
        params.push(filters.limit);
      }

      const [rows] = await pool.execute(query, params);
      return rows.map((row) => this.normalizeApplicationRow(row));
    } catch (error) {
      throw new Error(`Failed to get job applications: ${error.message}`);
    }
  }

  // Get applications by applicant ID
  static async getApplicationsByApplicantId(applicantId) {
    const pool = getDB();
    try {
      const [rows] = await pool.execute(
        "SELECT ja.*, jp.job_title, jp.company_name, jp.city, jp.salary_type, jp.minimum_salary, jp.maximum_salary FROM job_applications ja LEFT JOIN job_posts jp ON ja.job_id = jp.id WHERE ja.applicant_id = ? ORDER BY ja.applied_at DESC",
        [applicantId]
      );
      return rows.map((row) => this.normalizeApplicationRow(row));
    } catch (error) {
      throw new Error(`Failed to get applicant applications: ${error.message}`);
    }
  }

  // Update application
  static async updateApplication(id, updateData) {
    const pool = getDB();
    const updates = [];
    const params = [];

    Object.keys(updateData).forEach((key) => {
      if (
        [
          "job_id",
          "applicant_id",
          "full_name",
          "email",
          "phone",
          "alternate_phone",
          "date_of_birth",
          "gender",
          "address",
          "city",
          "state",
          "pincode",
          "current_location",
          "current_job_title",
          "current_company",
          "total_experience",
          "relevant_experience",
          "employment_status",
          "current_salary",
          "expected_salary",
          "notice_period",
          "joining_date",
          "willing_to_relocate",
          "preferred_work_mode",
          "education",
          "skills",
          "certifications",
          "linkedin_url",
          "github_url",
          "portfolio_url",
          "resume",
          "cover_letter",
          "portfolio_file",
          "certificates",
          "screening_answers",
          "additional_information",
          "application_status",
          "recruiter_notes",
        ].includes(key)
      ) {
        updates.push(`${key} = ?`);
        if (["education", "skills", "screening_answers"].includes(key)) {
          params.push(typeof updateData[key] === "string" ? updateData[key] : JSON.stringify(updateData[key]));
        } else {
          params.push(updateData[key]);
        }
      }
    });

    if (updates.length === 0) return this.getApplicationById(id);

    try {
      params.push(id);
      await pool.execute(
        `UPDATE job_applications SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        params
      );
      return this.getApplicationById(id);
    } catch (error) {
      throw new Error(`Failed to update job application: ${error.message}`);
    }
  }

  // Delete application
  static async deleteApplication(id) {
    const pool = getDB();
    try {
      const app = await this.getApplicationById(id);
      if (!app) return false;

      await pool.execute("DELETE FROM job_applications WHERE id = ?", [id]);

      // Update job_posts application count
      if (app.job_id) {
        await pool.execute(
          "UPDATE job_posts SET total_applications = GREATEST(0, total_applications - 1), new_applications = GREATEST(0, new_applications - 1) WHERE id = ?",
          [app.job_id]
        );
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to delete job application: ${error.message}`);
    }
  }

  // Update application status
  static async updateApplicationStatus(id, status, notes = null) {
    const pool = getDB();
    try {
      const [result] = await pool.execute(
        "UPDATE job_applications SET application_status = ?, recruiter_notes = ? WHERE id = ?",
        [status, notes || null, id]
      );
      return this.getApplicationById(id);
    } catch (error) {
      throw new Error(`Failed to update application status: ${error.message}`);
    }
  }

  // Get applications by status
  static async getApplicationsByStatus(status, limit = 100) {
    const pool = getDB();
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM job_applications WHERE application_status = ? ORDER BY applied_at DESC LIMIT ?",
        [status, limit]
      );
      return rows.map((row) => this.normalizeApplicationRow(row));
    } catch (error) {
      throw new Error(`Failed to get applications by status: ${error.message}`);
    }
  }

  // Normalize row data
  static normalizeApplicationRow(row) {
    if (!row) return null;
    return {
      id: row.id,
      job_id: row.job_id,
      applicant_id: row.applicant_id,
      full_name: row.full_name,
      email: row.email,
      phone: row.phone,
      alternate_phone: row.alternate_phone,
      date_of_birth: row.date_of_birth,
      gender: row.gender,
      address: row.address,
      city: row.city,
      state: row.state,
      pincode: row.pincode,
      current_location: row.current_location,
      current_job_title: row.current_job_title,
      current_company: row.current_company,
      total_experience: row.total_experience,
      relevant_experience: row.relevant_experience,
      employment_status: row.employment_status,
      current_salary: row.current_salary,
      expected_salary: row.expected_salary,
      notice_period: row.notice_period,
      joining_date: row.joining_date,
      willing_to_relocate: row.willing_to_relocate,
      preferred_work_mode: row.preferred_work_mode,
      education: row.education ? JSON.parse(row.education) : [],
      skills: row.skills ? JSON.parse(row.skills) : [],
      certifications: row.certifications,
      linkedin_url: row.linkedin_url,
      github_url: row.github_url,
      portfolio_url: row.portfolio_url,
      resume: row.resume,
      cover_letter: row.cover_letter,
      portfolio_file: row.portfolio_file,
      certificates: row.certificates,
      screening_answers: row.screening_answers ? JSON.parse(row.screening_answers) : {},
      additional_information: row.additional_information,
      application_status: row.application_status,
      recruiter_notes: row.recruiter_notes,
      applied_at: row.applied_at,
      updated_at: row.updated_at,
      // Include job details if they exist
      job_title: row.job_title,
      company_name: row.company_name,
    };
  }

  // Get applications count by job
  static async getApplicationCountByJob(jobId) {
    const pool = getDB();
    try {
      const [rows] = await pool.execute(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN application_status = 'Applied' THEN 1 ELSE 0 END) as applied,
          SUM(CASE WHEN application_status = 'Under Review' THEN 1 ELSE 0 END) as under_review,
          SUM(CASE WHEN application_status = 'Shortlisted' THEN 1 ELSE 0 END) as shortlisted,
          SUM(CASE WHEN application_status = 'Interview' THEN 1 ELSE 0 END) as interview,
          SUM(CASE WHEN application_status = 'Selected' THEN 1 ELSE 0 END) as selected,
          SUM(CASE WHEN application_status = 'Rejected' THEN 1 ELSE 0 END) as rejected
        FROM job_applications WHERE job_id = ?`,
        [jobId]
      );
      return rows[0] || { total: 0 };
    } catch (error) {
      throw new Error(`Failed to get application count: ${error.message}`);
    }
  }
}

module.exports = JobApplicationModel;
