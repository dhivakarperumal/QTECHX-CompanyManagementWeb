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
