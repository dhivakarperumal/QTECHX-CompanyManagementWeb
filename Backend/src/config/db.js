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
