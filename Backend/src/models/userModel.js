const { getDB } = require("../config/db");

const publicFields = "id, user_id, username, email, mobile, role, status, created_at, updated_at, created_by, updated_by";

async function createUser(user) {
  const db = getDB();
  const [result] = await db.execute(
    `INSERT INTO users
      (user_id, username, email, mobile, password, role, status, created_by, updated_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user.user_id,
      user.username,
      user.email,
      user.mobile,
      user.password,
      user.role || "Customer",
      user.status || "Active",
      user.created_by || null,
      user.updated_by || null,
    ]
  );
  return findByUserId(user.user_id, true, result.insertId);
}

async function findByUserId(userId, includePassword = false, id = null) {
  const db = getDB();
  const fields = includePassword ? `${publicFields}, password` : publicFields;
  const [rows] = await db.execute(
    `SELECT ${fields} FROM users WHERE ${id ? "id = ?" : "user_id = ?"} LIMIT 1`,
    [id || userId]
  );
  return rows[0] || null;
}

async function findByEmail(email) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT ${publicFields} FROM users WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

async function findForLogin(identifier) {
  const db = getDB();
  const fields = publicFields.split(', ').map((field) => `u.${field}`).join(', ');
  const [rows] = await db.execute(
    `SELECT ${fields}, u.password,
            e.employee_id AS emp_code, e.employee_code AS emp_code2
     FROM users u
     LEFT JOIN employees e ON e.official_email COLLATE utf8mb4_unicode_ci = u.email COLLATE utf8mb4_unicode_ci
     WHERE (u.username COLLATE utf8mb4_unicode_ci = ? OR u.email COLLATE utf8mb4_unicode_ci = ? OR u.mobile COLLATE utf8mb4_unicode_ci = ?) AND u.status = 'Active'
     LIMIT 1`,
    [identifier, identifier, identifier]
  );
  return rows[0] || null;
}

async function listUsers({ page, limit, search, status, role }) {
  const db = getDB();
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];

  if (search) {
    conditions.push("(username LIKE ? OR email LIKE ? OR mobile LIKE ? OR user_id LIKE ?)");
    const term = `%${search}%`;
    values.push(term, term, term, term);
  }
  if (status) {
    conditions.push("status = ?");
    values.push(status);
  }
  if (role) {
    conditions.push("role = ?");
    values.push(role);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const [rows] = await db.execute(
    `SELECT ${publicFields} FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );
  const [countRows] = await db.execute(`SELECT COUNT(*) AS total FROM users ${where}`, values);
  return { rows, total: countRows[0].total };
}

async function updateUser(userId, updates) {
  const db = getDB();
  const fields = Object.keys(updates);
  if (!fields.length) return findByUserId(userId);
  const values = fields.map((field) => updates[field]);
  const assignments = fields.map((field) => `${field} = ?`).join(", ");
  values.push(userId);
  await db.execute(`UPDATE users SET ${assignments} WHERE user_id = ?`, values);
  return findByUserId(userId);
}

async function existsByEmailOrMobile(email, mobile) {
  const db = getDB();
  const conditions = [];
  const params = [];

  if (email && String(email).trim()) {
    conditions.push("LOWER(TRIM(email)) = ?");
    params.push(String(email).trim().toLowerCase());
  }

  if (mobile && String(mobile).trim()) {
    const cleanMobile = String(mobile).replace(/[\s\-\+]/g, "").slice(-10);
    conditions.push("RIGHT(REPLACE(REPLACE(REPLACE(mobile, ' ', ''), '-', ''), '+', ''), 10) = ?");
    params.push(cleanMobile);
  }

  if (conditions.length === 0) return null;

  const [rows] = await db.execute(
    `SELECT id, user_id, username, email, mobile, role FROM users WHERE (${conditions.join(" OR ")}) LIMIT 1`,
    params
  );
  return rows[0] || null;
}

module.exports = {
  createUser,
  findByUserId,
  findByEmail,
  findForLogin,
  listUsers,
  updateUser,
  softDeleteUser,
  existsByEmailOrMobile,
};
