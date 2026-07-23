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

async function findForLogin(identifier) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT ${publicFields}, password FROM users
     WHERE (username = ? OR email = ?) AND status = 'Active'
     LIMIT 1`,
    [identifier, identifier]
  );
  return rows[0] || null;
}

async function listUsers({ page, limit, search, status }) {
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

async function softDeleteUser(userId, updatedBy) {
  const db = getDB();
  await db.execute(
    "UPDATE users SET status = 'Inactive', updated_by = ? WHERE user_id = ?",
    [updatedBy || null, userId]
  );
  return findByUserId(userId);
}

module.exports = { createUser, findByUserId, findForLogin, listUsers, updateUser, softDeleteUser };
