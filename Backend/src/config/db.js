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

async function initDB() {
  if (pool) return pool;

  pool = mysql.createPool(dbConfig);

  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    await ensureSchema(pool);
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
