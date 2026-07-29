const path = require("path");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

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

async function ensureProjectAssignmentsSchema(pool) {
  const [existingTables] = await pool.execute("SHOW TABLES LIKE 'project_assignments'");

  if (!existingTables.length) {
    await pool.execute(
      `CREATE TABLE IF NOT EXISTS project_assignments (
        id          INT UNSIGNED NOT NULL AUTO_INCREMENT,
        project_id  INT UNSIGNED NOT NULL,
        employee_ids JSON NULL,
        status      ENUM('Assigned','Active','Completed','Removed') NOT NULL DEFAULT 'Assigned',
        assigned_date DATETIME NULL,
        created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by  VARCHAR(36) NULL,
        updated_by  VARCHAR(36) NULL,
        assigned_by VARCHAR(36) NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uq_project_assignments_project (project_id),
        INDEX idx_project_assignments_project (project_id),
        CONSTRAINT fk_project_assignments_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    );
    return;
  }

  const [columns] = await pool.execute("SHOW COLUMNS FROM project_assignments");
  const columnNames = new Set(columns.map((column) => column.Field));

  const addColumnStatements = [];
  if (!columnNames.has('employee_ids')) {
    addColumnStatements.push('ADD COLUMN employee_ids JSON NULL AFTER project_id');
  }
  if (!columnNames.has('status')) {
    addColumnStatements.push("ADD COLUMN status ENUM('Assigned','Active','Completed','Removed') NOT NULL DEFAULT 'Assigned' AFTER employee_ids");
  }
  if (!columnNames.has('assigned_date')) {
    addColumnStatements.push('ADD COLUMN assigned_date DATETIME NULL AFTER status');
  }
  if (!columnNames.has('created_at')) {
    addColumnStatements.push('ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER assigned_date');
  }
  if (!columnNames.has('updated_at')) {
    addColumnStatements.push('ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at');
  }
  if (!columnNames.has('created_by')) {
    addColumnStatements.push('ADD COLUMN created_by VARCHAR(36) NULL AFTER updated_at');
  }
  if (!columnNames.has('updated_by')) {
    addColumnStatements.push('ADD COLUMN updated_by VARCHAR(36) NULL AFTER created_by');
  }
  if (!columnNames.has('assigned_by')) {
    addColumnStatements.push('ADD COLUMN assigned_by VARCHAR(36) NULL AFTER updated_by');
  }

  if (addColumnStatements.length) {
    await pool.execute(`ALTER TABLE project_assignments ${addColumnStatements.join(', ')}`);
  }

  if (columnNames.has('assigned_at') && !columnNames.has('assigned_date')) {
    await pool.execute('UPDATE project_assignments SET assigned_date = assigned_at WHERE assigned_date IS NULL AND assigned_at IS NOT NULL');
  }

  const legacyRows = [];
  if (columnNames.has('employee_id')) {
    const [existingLegacyRows] = await pool.execute('SELECT id, project_id, employee_id FROM project_assignments WHERE project_id IS NOT NULL ORDER BY project_id, id');
    legacyRows.push(...existingLegacyRows);

    for (const row of existingLegacyRows) {
      if (row.employee_id) {
        await pool.execute('UPDATE project_assignments SET employee_ids = ? WHERE id = ?', [JSON.stringify([{ employee_id: String(row.employee_id) }]), row.id]);
      }
    }

    try {
      await pool.execute('ALTER TABLE project_assignments DROP FOREIGN KEY fk_project_assignments_employee');
    } catch (error) {
      // Ignore if the legacy foreign key is already absent.
    }

    try {
      await pool.execute('ALTER TABLE project_assignments DROP INDEX idx_project_assignments_employee');
    } catch (error) {
      // Ignore if the legacy index is already absent.
    }

    try {
      await pool.execute('ALTER TABLE project_assignments DROP COLUMN employee_id');
    } catch (error) {
      // Ignore if the legacy column is already absent.
    }
  }

  const [indexes] = await pool.execute('SHOW INDEX FROM project_assignments');
  const hasLegacyUniqueIndex = indexes.some((index) => index.Key_name === 'uq_project_assignments_project_employee');
  const hasProjectUniqueIndex = indexes.some((index) => index.Key_name === 'uq_project_assignments_project');
  const hasProjectIndex = indexes.some((index) => index.Key_name === 'idx_project_assignments_project');
  const hasEmployeeIndex = indexes.some((index) => index.Key_name === 'idx_project_assignments_employee');

  if (hasLegacyUniqueIndex) {
    await pool.execute('ALTER TABLE project_assignments DROP INDEX uq_project_assignments_project_employee');
  }

}

async function ensureProjectPlanSchema(pool) {
  const [existingTables] = await pool.execute("SHOW TABLES LIKE 'project_plan'");

  if (!existingTables.length) {
    await pool.execute(
      `CREATE TABLE IF NOT EXISTS project_plan (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        plan_id VARCHAR(50) NOT NULL,
        plan_code VARCHAR(100) NOT NULL,
        plan_name VARCHAR(255) NOT NULL,
        project_type VARCHAR(100) NULL,
        category VARCHAR(100) NULL,
        status ENUM('Draft','Active','Inactive') NOT NULL DEFAULT 'Draft',
        plan_data JSON NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by VARCHAR(100) NULL,
        updated_by VARCHAR(100) NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uq_project_plan_code (plan_code)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    );
    return;
  }
}

  if (legacyRows.length) {
    const groupedProjects = new Map();
    legacyRows.forEach((row) => {
      if (!groupedProjects.has(row.project_id)) groupedProjects.set(row.project_id, []);
      groupedProjects.get(row.project_id).push(row);
    });

    for (const projectRows of groupedProjects.values()) {
      if (projectRows.length <= 1) {
        const [firstRow] = projectRows;
        if (firstRow && firstRow.employee_id) {
          await pool.execute('UPDATE project_assignments SET employee_ids = ? WHERE id = ?', [JSON.stringify([{ employee_id: String(firstRow.employee_id) }]), firstRow.id]);
        }
        continue;
      }

      const payload = [];
      const seen = new Set();
      projectRows.forEach((row) => {
        const employeeId = row.employee_id ? String(row.employee_id).trim() : '';
        if (!employeeId || seen.has(employeeId)) return;
        seen.add(employeeId);
        payload.push({ employee_id: employeeId });
      });

      const keepRow = projectRows[0];
      await pool.execute('UPDATE project_assignments SET employee_ids = ? WHERE id = ?', [JSON.stringify(payload), keepRow.id]);

      const duplicateIds = projectRows.filter((row) => row.id !== keepRow.id).map((row) => row.id);
      if (duplicateIds.length) {
        const placeholders = duplicateIds.map(() => '?').join(', ');
        await pool.execute(`DELETE FROM project_assignments WHERE id IN (${placeholders})`, duplicateIds);
      }
    }
  }

  if (!hasProjectUniqueIndex) {
    await pool.execute('ALTER TABLE project_assignments ADD UNIQUE KEY uq_project_assignments_project (project_id)');
  }
  if (!hasProjectIndex) {
    await pool.execute('ALTER TABLE project_assignments ADD INDEX idx_project_assignments_project (project_id)');
  }
  if (!hasEmployeeIndex && columnNames.has('employee_id')) {
    await pool.execute('ALTER TABLE project_assignments ADD INDEX idx_project_assignments_employee (employee_id)');
  }
}

async function ensureProjectsSchema(pool) {
  const [existingTables] = await pool.execute("SHOW TABLES LIKE 'projects'");

  if (!existingTables.length) {
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
        project_images            TEXT NULL,
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
    return;
  }

  const [columns] = await pool.execute("SHOW COLUMNS FROM projects");
  const columnNames = new Set(columns.map((column) => column.Field));

  const addColumnStatements = [];
  const columnDefinitions = [
    ['uuid', 'VARCHAR(36) NOT NULL'],
    ['project_code', 'VARCHAR(50) NULL'],
    ['project_name', 'VARCHAR(255) NOT NULL'],
    ['short_name', 'VARCHAR(100) NULL'],
    ['project_category', 'VARCHAR(100) NULL'],
    ['industry', 'VARCHAR(100) NULL'],
    ['description', 'TEXT NULL'],
    ['objective', 'TEXT NULL'],
    ['business_requirements', 'TEXT NULL'],
    ['client_name', 'VARCHAR(255) NULL'],
    ['company_name', 'VARCHAR(255) NULL'],
    ['contact_person', 'VARCHAR(255) NULL'],
    ['email', 'VARCHAR(255) NULL'],
    ['phone_number', 'VARCHAR(20) NULL'],
    ['nda_signed', "ENUM('Yes','No') NOT NULL DEFAULT 'No'"],
    ['agreement_uploaded', "ENUM('Yes','No') NOT NULL DEFAULT 'No'"],
    ['total_project_cost', 'DECIMAL(15,2) NULL'],
    ['current_status', "ENUM('Planning','In Progress','Testing','On Hold','Live','Completed','Cancelled') NOT NULL DEFAULT 'Planning'"],
    ['overall_progress', 'TINYINT UNSIGNED NOT NULL DEFAULT 0'],
    ['proposal_date', 'DATE NULL'],
    ['approval_date', 'DATE NULL'],
    ['project_start_date', 'DATE NULL'],
    ['estimated_completion_date', 'DATE NULL'],
    ['project_end_date', 'DATE NULL'],
    ['go_live_date', 'DATE NULL'],
    ['support_period', 'VARCHAR(100) NULL'],
    ['frontend_tech', 'VARCHAR(255) NULL'],
    ['mobile_tech', 'VARCHAR(255) NULL'],
    ['backend_tech', 'VARCHAR(255) NULL'],
    ['database_tech', 'VARCHAR(255) NULL'],
    ['github_link', 'VARCHAR(500) NULL'],
    ['domain_name', 'VARCHAR(255) NULL'],
    ['sub_domain_name', 'VARCHAR(255) NULL'],
    ['project_manager', 'VARCHAR(255) NULL'],
    ['ui_ux_designer', 'VARCHAR(255) NULL'],
    ['frontend_developers', 'TEXT NULL'],
    ['backend_developers', 'TEXT NULL'],
    ['ui_progress', 'TINYINT UNSIGNED NOT NULL DEFAULT 0'],
    ['frontend_progress', 'TINYINT UNSIGNED NOT NULL DEFAULT 0'],
    ['backend_progress', 'TINYINT UNSIGNED NOT NULL DEFAULT 0'],
    ['testing_progress', 'TINYINT UNSIGNED NOT NULL DEFAULT 0'],
    ['deployment_progress', 'TINYINT UNSIGNED NOT NULL DEFAULT 0'],
    ['proposal_doc', 'VARCHAR(500) NULL'],
    ['quotation_doc', 'VARCHAR(500) NULL'],
    ['agreement_doc', 'VARCHAR(500) NULL'],
    ['nda_doc', 'VARCHAR(500) NULL'],
    ['api_documentation', 'VARCHAR(500) NULL'],
    ['database_schema', 'VARCHAR(500) NULL'],
    ['source_code_backup', 'VARCHAR(500) NULL'],
    ['project_images', 'TEXT NULL'],
    ['created_at', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP'],
    ['updated_at', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'],
    ['created_by', 'VARCHAR(36) NULL'],
    ['updated_by', 'VARCHAR(36) NULL'],
  ];

  columnDefinitions.forEach(([columnName, definition]) => {
    if (!columnNames.has(columnName)) {
      addColumnStatements.push(`ADD COLUMN ${columnName} ${definition}`);
    }
  });

  if (addColumnStatements.length) {
    await pool.execute(`ALTER TABLE projects ${addColumnStatements.join(', ')}`);
  }
}

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
  await ensureProjectsSchema(pool);

  // ── Project Assignments ────────────────────────────────────────────────────
  await ensureProjectAssignmentsSchema(pool);
  await require('../models/employeeTaskAssignmentModel').ensureEmployeeTaskAssignmentsSchema(pool);

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

  await pool.execute(
    `CREATE TABLE IF NOT EXISTS tasks (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      uuid VARCHAR(36) NOT NULL,
      project_id INT UNSIGNED NOT NULL,
      module_name VARCHAR(255) NULL,
      task_name VARCHAR(255) NOT NULL,
      description TEXT NULL,
      category VARCHAR(100) NULL,
      parent_task_uuid VARCHAR(36) NULL,
      assigned_to VARCHAR(36) NULL,
      assigned_by VARCHAR(36) NULL,
      team VARCHAR(100) NULL,
      assignment_date DATE NULL,
      start_date DATE NULL,
      due_date DATE NULL,
      completion_date DATE NULL,
      estimated_hours DECIMAL(10,2) NOT NULL DEFAULT 0,
      actual_hours DECIMAL(10,2) NOT NULL DEFAULT 0,
      time_spent DECIMAL(10,2) NOT NULL DEFAULT 0,
      remaining_hours DECIMAL(10,2) NOT NULL DEFAULT 0,
      priority ENUM('Low','Medium','High','Critical') NOT NULL DEFAULT 'Medium',
      status ENUM('Pending','To Do','In Progress','Review','Testing','Completed','On Hold','Cancelled') NOT NULL DEFAULT 'Pending',
      progress TINYINT UNSIGNED NOT NULL DEFAULT 0,
      is_overdue TINYINT(1) NOT NULL DEFAULT 0,
      attachments TEXT NULL,
      comments TEXT NULL,
      internal_notes TEXT NULL,
      client_notes TEXT NULL,
      deleted TINYINT(1) NOT NULL DEFAULT 0,
      active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_by VARCHAR(36) NULL,
      updated_by VARCHAR(36) NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uq_tasks_uuid (uuid),
      INDEX idx_tasks_project (project_id),
      INDEX idx_tasks_assigned_to (assigned_to),
      INDEX idx_tasks_status (status),
      CONSTRAINT fk_tasks_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_tasks_assigned_to FOREIGN KEY (assigned_to) REFERENCES employees (employee_id) ON DELETE SET NULL ON UPDATE CASCADE,
      CONSTRAINT fk_tasks_assigned_by FOREIGN KEY (assigned_by) REFERENCES employees (employee_id) ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  );

  await pool.execute(
    `CREATE TABLE IF NOT EXISTS project_assets (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      uuid VARCHAR(36) NOT NULL,
      project_id INT UNSIGNED NOT NULL,
      asset_type ENUM('image','zip','document') NOT NULL DEFAULT 'image',
      original_name VARCHAR(255) NULL,
      file_path VARCHAR(500) NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_by VARCHAR(36) NULL,
      updated_by VARCHAR(36) NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uq_project_assets_uuid (uuid),
      INDEX idx_project_assets_project (project_id),
      CONSTRAINT fk_project_assets_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
  );

  await pool.execute(
    `CREATE TABLE IF NOT EXISTS timesheets (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      uuid VARCHAR(36) NOT NULL,
      employee_id VARCHAR(36) NOT NULL,
      project_id INT UNSIGNED NULL,
      module_name VARCHAR(255) NULL,
      task_uuid VARCHAR(36) NULL,
      entry_date DATE NOT NULL,
      start_time TIME NULL,
      end_time TIME NULL,
      break_minutes INT UNSIGNED NOT NULL DEFAULT 0,
      total_hours DECIMAL(10,2) NOT NULL DEFAULT 0,
      overtime_hours DECIMAL(10,2) NOT NULL DEFAULT 0,
      description TEXT NULL,
      work_type ENUM('Development','Testing','Meeting','Support','Documentation','Research') NOT NULL DEFAULT 'Development',
      task_status ENUM('Pending','In Progress','Review','Testing','Completed','On Hold','Cancelled') NOT NULL DEFAULT 'Pending',
      progress TINYINT UNSIGNED NOT NULL DEFAULT 0,
      submitted_by VARCHAR(36) NULL,
      submitted_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      approved_by VARCHAR(36) NULL,
      approved_date DATETIME NULL,
      approval_status ENUM('Pending','Approved','Rejected') NOT NULL DEFAULT 'Pending',
      rejection_reason TEXT NULL,
      attachments TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_by VARCHAR(36) NULL,
      updated_by VARCHAR(36) NULL,
      deleted TINYINT(1) NOT NULL DEFAULT 0,
      PRIMARY KEY (id),
      UNIQUE KEY uq_timesheets_uuid (uuid),
      INDEX idx_timesheets_employee (employee_id),
      INDEX idx_timesheets_project (project_id),
      INDEX idx_timesheets_date (entry_date),
      CONSTRAINT fk_timesheets_employee FOREIGN KEY (employee_id) REFERENCES employees (employee_id) ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT fk_timesheets_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE SET NULL ON UPDATE CASCADE
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

async function ensureAttendanceSchema(pool) {
  await pool.execute(
    `CREATE TABLE IF NOT EXISTS attendance (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      employee_id VARCHAR(36) NOT NULL,
      attendance_date DATE NOT NULL,
      month INT NOT NULL,
      year INT NOT NULL,
      check_in_time VARCHAR(20) NULL,
      check_out_time VARCHAR(20) NULL,
      working_hours VARCHAR(20) NULL,
      late_entry VARCHAR(20) NULL,
      early_exit VARCHAR(20) NULL,
      overtime VARCHAR(20) NULL,
      attendance_status VARCHAR(20) NOT NULL DEFAULT 'Present',
      location VARCHAR(255) NULL,
      notes TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_by VARCHAR(36) NULL,
      updated_by VARCHAR(36) NULL,
      PRIMARY KEY (id),
      UNIQUE KEY uq_attendance_employee_date (employee_id, attendance_date),
      KEY idx_attendance_month_year (month, year)
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
    await ensureAttendanceSchema(pool);
    await ensureProjectPlanSchema(pool);
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
