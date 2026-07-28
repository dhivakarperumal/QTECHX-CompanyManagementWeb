const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "qtechx_db",
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool;

async function ensureSchema(pool) {
  // ── Users ────────────────────────────────────────────────────────────────
  await pool.execute(
    `CREATE TABLE IF NOT EXISTS users (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id VARCHAR(36) NOT NULL,
      username VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL,
      mobile VARCHAR(20) NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('Super Admin', 'Admin', 'Manager', 'Staff', 'Employee', 'Trainee', 'Customer', 'User') NOT NULL DEFAULT 'Customer',
      status VARCHAR(20) NOT NULL DEFAULT 'Active',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_by VARCHAR(36) NULL,
      updated_by VARCHAR(36) NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uq_users_user_id (user_id),
      UNIQUE KEY uq_users_username (username),
      UNIQUE KEY uq_users_email (email),
      UNIQUE KEY uq_users_mobile (mobile)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  );

  // ── Clients ──────────────────────────────────────────────────────────────
  await pool.execute(
    `CREATE TABLE IF NOT EXISTS clients (
      id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
      uuid        VARCHAR(36)  NOT NULL,
      company_name         VARCHAR(255) NULL,
      client_name          VARCHAR(255) NOT NULL,
      email                VARCHAR(255) NULL,
      phone_number         VARCHAR(20)  NULL,
      contact_person       VARCHAR(255) NULL,
      client_status        ENUM('Active','Inactive','Lead','Prospect','Converted','Closed') NOT NULL DEFAULT 'Lead',
      service_type         ENUM('Website','Mobile App','Web App','Software','Other') NULL,
      business_name        VARCHAR(255) NULL,
      business_type        VARCHAR(255) NULL,
      requirement          TEXT NULL,
      notes_summary        TEXT NULL,
      follow_up_date       DATE NULL,
      follow_up_time       TIME NULL,
      next_follow_up_date  DATE NULL,
      next_follow_up_time  TIME NULL,
      discussion_summary   TEXT NULL,
      follow_up_status     ENUM('Pending','Completed','Rescheduled','Cancelled') NOT NULL DEFAULT 'Pending',
      reminder             TINYINT(1) NOT NULL DEFAULT 0,
      created_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at           DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_by           VARCHAR(36) NULL,
      updated_by           VARCHAR(36) NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uq_clients_uuid (uuid),
      INDEX idx_clients_status (client_status),
      INDEX idx_clients_service (service_type),
      INDEX idx_clients_follow_up (follow_up_date),
      INDEX idx_clients_follow_up_status (follow_up_status)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  );

  // ── Client Documents ─────────────────────────────────────────────────────
  await pool.execute(
    `CREATE TABLE IF NOT EXISTS client_documents (
      id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
      uuid          VARCHAR(36)  NOT NULL,
      client_id     INT UNSIGNED NOT NULL,
      document_type VARCHAR(100) NOT NULL,
      document_name VARCHAR(255) NOT NULL,
      file_name     VARCHAR(255) NOT NULL,
      file_path     VARCHAR(500) NOT NULL,
      file_size     INT UNSIGNED NOT NULL,
      mime_type     VARCHAR(100) NOT NULL,
      description   TEXT NULL,
      created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_by    VARCHAR(36) NULL,
      updated_by    VARCHAR(36) NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uq_client_docs_uuid (uuid),
      INDEX idx_client_docs_client_id (client_id),
      CONSTRAINT fk_client_docs_client
        FOREIGN KEY (client_id) REFERENCES clients (id)
        ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  );

  // ── Client History ─────────────────────────────────────────────────────────
  await pool.execute(
    `CREATE TABLE IF NOT EXISTS client_history (
      id                 INT UNSIGNED NOT NULL AUTO_INCREMENT,
      client_id          INT UNSIGNED NOT NULL,
      event_type         VARCHAR(100) NOT NULL,
      old_status         VARCHAR(50) NULL,
      new_status         VARCHAR(50) NULL,
      discussion_summary TEXT NULL,
      created_at         DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_by         VARCHAR(36) NULL,
      PRIMARY KEY (id),
      INDEX idx_client_history_client (client_id),
      CONSTRAINT fk_client_history_client
        FOREIGN KEY (client_id) REFERENCES clients (id)
        ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  );

  // ── Projects ──────────────────────────────────────────────────────────────
  await pool.execute(
    `CREATE TABLE IF NOT EXISTS projects (
      id                        INT UNSIGNED NOT NULL AUTO_INCREMENT,
      uuid                      VARCHAR(36) NOT NULL,
      project_code              VARCHAR(50) NULL,
      project_name              VARCHAR(255) NOT NULL,
      short_name                VARCHAR(100) NULL,
      project_category          VARCHAR(100) NULL,
      industry                  VARCHAR(100) NULL,
      description               TEXT NULL,
      objective                 TEXT NULL,
      business_requirements     TEXT NULL,
      client_name               VARCHAR(255) NULL,
      company_name              VARCHAR(255) NULL,
      contact_person            VARCHAR(255) NULL,
      email                     VARCHAR(255) NULL,
      phone_number              VARCHAR(20) NULL,
      nda_signed                ENUM('Yes','No') NOT NULL DEFAULT 'No',
      agreement_uploaded        ENUM('Yes','No') NOT NULL DEFAULT 'No',
      total_project_cost        DECIMAL(15,2) NULL,
      current_status            ENUM('Planning','In Progress','Testing','On Hold','Live','Completed','Cancelled') NOT NULL DEFAULT 'Planning',
      overall_progress          TINYINT UNSIGNED NOT NULL DEFAULT 0,
      proposal_date             DATE NULL,
      approval_date             DATE NULL,
      project_start_date        DATE NULL,
      estimated_completion_date DATE NULL,
      project_end_date          DATE NULL,
      go_live_date              DATE NULL,
      support_period            VARCHAR(100) NULL,
      frontend_tech             VARCHAR(255) NULL,
      mobile_tech               VARCHAR(255) NULL,
      backend_tech              VARCHAR(255) NULL,
      database_tech             VARCHAR(255) NULL,
      github_link               VARCHAR(500) NULL,
      domain_name               VARCHAR(255) NULL,
      sub_domain_name           VARCHAR(255) NULL,
      project_manager           VARCHAR(255) NULL,
      ui_ux_designer            VARCHAR(255) NULL,
      frontend_developers       TEXT NULL,
      backend_developers        TEXT NULL,
      ui_progress               TINYINT UNSIGNED NOT NULL DEFAULT 0,
      frontend_progress         TINYINT UNSIGNED NOT NULL DEFAULT 0,
      backend_progress          TINYINT UNSIGNED NOT NULL DEFAULT 0,
      testing_progress          TINYINT UNSIGNED NOT NULL DEFAULT 0,
      deployment_progress       TINYINT UNSIGNED NOT NULL DEFAULT 0,
      proposal_doc              VARCHAR(500) NULL,
      quotation_doc             VARCHAR(500) NULL,
      agreement_doc             VARCHAR(500) NULL,
      nda_doc                   VARCHAR(500) NULL,
      api_documentation         VARCHAR(500) NULL,
      database_schema           VARCHAR(500) NULL,
      source_code_backup        VARCHAR(500) NULL,
      created_at                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at                DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_by                VARCHAR(36) NULL,
      updated_by                VARCHAR(36) NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uq_projects_uuid (uuid),
      INDEX idx_projects_status (current_status),
      INDEX idx_projects_manager (project_manager(100))
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  );

  // ── Project Assignments ────────────────────────────────────────────────────
  await pool.execute(
    `CREATE TABLE IF NOT EXISTS project_assignments (
      id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
      project_id  INT UNSIGNED NOT NULL,
      employee_id VARCHAR(36)  NOT NULL,
      role        ENUM('Project Manager','UI/UX Designer','Frontend Developer','Backend Developer','Tester','DevOps','QA') NOT NULL,
      assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      assigned_by VARCHAR(36) NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uq_proj_emp_role (project_id, employee_id, role),
      INDEX idx_pa_project  (project_id),
      INDEX idx_pa_employee (employee_id),
      CONSTRAINT fk_pa_project  FOREIGN KEY (project_id)  REFERENCES projects  (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_pa_employee FOREIGN KEY (employee_id) REFERENCES employees (employee_id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  );

  await pool.execute(
    `CREATE TABLE IF NOT EXISTS project_employees (
      id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
      project_id    INT UNSIGNED NOT NULL,
      employee_id   VARCHAR(36)  NOT NULL,
      assigned_date DATE NULL,
      status        ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
      created_by    VARCHAR(36) NULL,
      created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_project_employee (project_id, employee_id),
      INDEX idx_pe_project (project_id),
      INDEX idx_pe_employee (employee_id),
      CONSTRAINT fk_pe_project  FOREIGN KEY (project_id)  REFERENCES projects  (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_pe_employee FOREIGN KEY (employee_id) REFERENCES employees (employee_id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  );
}

async function seedDefaultUser(pool) {
  const defaultUser = {
    user_id: uuidv4(),
    username: "Trainee",
    email: "trainee@gmail.com",
    mobile: "1234567898",
    password: "Trai@123",
    role: "Trainee",
    status: "Active",
  };

  const [existing] = await pool.execute(
    "SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1",
    [defaultUser.email, defaultUser.username]
  );

  if (existing.length > 0) {
    return;
  }

  const hashedPassword = await bcrypt.hash(defaultUser.password, 12);
  await pool.execute(
    `INSERT INTO users (user_id, username, email, mobile, password, role, status, created_by, updated_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL)`,
    [
      defaultUser.user_id,
      defaultUser.username,
      defaultUser.email,
      defaultUser.mobile,
      hashedPassword,
      defaultUser.role,
      defaultUser.status,
    ]
  );
  console.log("Seeded default trainee login: trainee@gmail.com / Trai@123");
}

async function ensureEmployeesSchema(pool) {
  await pool.execute(
    `CREATE TABLE IF NOT EXISTS employees (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      employee_id VARCHAR(36) NOT NULL,
      employee_code VARCHAR(50) NULL,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NULL,
      profile_photo VARCHAR(255) NULL,
      gender ENUM('Male', 'Female', 'Other') NULL,
      dob DATE NULL,
      blood_group VARCHAR(10) NULL,
      marital_status ENUM('Single', 'Married', 'Divorced', 'Widowed') NULL,
      nationality VARCHAR(100) NULL,
      aadhaar_number VARCHAR(20) NULL,
      pan_number VARCHAR(20) NULL,
      mobile_number VARCHAR(20) NOT NULL,
      alternate_mobile VARCHAR(20) NULL,
      personal_email VARCHAR(255) NULL,
      permanent_address TEXT NULL,
      emergency_contact_person VARCHAR(100) NULL,
      emergency_contact_number VARCHAR(20) NULL,
      emergency_relationship VARCHAR(50) NULL,
      designation VARCHAR(100) NULL,
      team_lead VARCHAR(100) NULL,
      joining_date DATE NULL,
      confirmation_date DATE NULL,
      employment_status ENUM('Active', 'Inactive', 'Terminated', 'Resigned') NOT NULL DEFAULT 'Active',
      role ENUM('Employee', 'Manager', 'Admin', 'HR') NOT NULL DEFAULT 'Employee',
      salary_type VARCHAR(50) NULL,
      basic_salary DECIMAL(10,2) NULL,
      bank_name VARCHAR(100) NULL,
      account_number VARCHAR(50) NULL,
      ifsc_code VARCHAR(20) NULL,
      upi_id VARCHAR(100) NULL,
      resume_url VARCHAR(255) NULL,
      aadhaar_url VARCHAR(255) NULL,
      pan_url VARCHAR(255) NULL,
      passport_url VARCHAR(255) NULL,
      offer_letter_url VARCHAR(255) NULL,
      appointment_letter_url VARCHAR(255) NULL,
      nda_url VARCHAR(255) NULL,
      username VARCHAR(100) NULL,
      official_email VARCHAR(255) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_by VARCHAR(36) NULL,
      updated_by VARCHAR(36) NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uq_employees_employee_id (employee_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  );
}

async function initDB() {
  if (pool) return pool;

  pool = mysql.createPool(dbConfig);

  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    await ensureSchema(pool);
    await ensureEmployeesSchema(pool);
    await seedDefaultUser(pool);
    console.log("Database connected:", `${dbConfig.user}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    return pool;
  } catch (err) {
    console.error("Database connection failed:", err.message);
    throw err;
  }
}

function getDB() {
  if (!pool) {
    throw new Error("Database not initialized. Call initDB() first.");
  }
  return pool;
}

module.exports = { initDB, getDB };
