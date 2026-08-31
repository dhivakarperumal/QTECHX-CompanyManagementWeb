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
    `SELECT ${fields}, u.password
     FROM users u
     WHERE u.username = ? OR u.email = ? OR u.mobile = ?
     LIMIT 1`,
    [identifier, identifier, identifier]
  );
  if (!rows.length) return null;

  const user = rows[0];
  user.emp_code = null;
  user.emp_code2 = null;
  user.emp_status = null;
  user.emp_employment_status = null;

  try {
    const [empRows] = await db.execute(
      `SELECT employee_id, employee_code, status, employment_status
       FROM employees
       WHERE employee_id = ? OR official_email = ? OR personal_email = ?
       LIMIT 1`,
      [user.user_id, user.email || '', user.email || '']
    );

    if (empRows.length) {
      const employeeId = empRows[0].employee_id || empRows[0].employeeId || user.user_id;
      user.emp_code = employeeId;
      user.employee_id = employeeId;
      user.employeeId = employeeId;
      user.emp_code2 = empRows[0].employee_code;
      user.emp_status = empRows[0].status;
      user.emp_employment_status = empRows[0].employment_status;
    }
  } catch (err) {
    console.error('[findForLogin] employee lookup error:', err);
  }

  return user;
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

async function softDeleteUser(userId, updatedBy) {
  const db = getDB();
  await db.execute(
    "UPDATE users SET status = 'Inactive', updated_by = ? WHERE user_id = ?",
    [updatedBy || null, userId]
  );
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

async function findConflictUser({ emails = [], mobile, username, excludeUserId = null }) {
  const db = getDB();
  const emailList = (Array.isArray(emails) ? emails : [emails])
    .map((e) => String(e || "").trim().toLowerCase())
    .filter(Boolean);

  const cleanMobile = mobile ? String(mobile).replace(/[\s\-\+]/g, "").slice(-10) : "";
  const cleanUsername = username ? String(username).trim().toLowerCase() : "";

  // Check emails
  if (emailList.length > 0) {
    const placeholders = emailList.map(() => "?").join(", ");
    let query = `SELECT id, user_id, username, email, mobile FROM users WHERE LOWER(TRIM(email)) IN (${placeholders})`;
    const params = [...emailList];
    if (excludeUserId) {
      query += " AND user_id != ?";
      params.push(excludeUserId);
    }
    query += " LIMIT 1";
    const [rows] = await db.execute(query, params);
    if (rows.length > 0) {
      return { field: "email", value: rows[0].email, user: rows[0] };
    }
  }

  // Check mobile
  if (cleanMobile) {
    let query = `SELECT id, user_id, username, email, mobile FROM users WHERE RIGHT(REPLACE(REPLACE(REPLACE(mobile, ' ', ''), '-', ''), '+', ''), 10) = ?`;
    const params = [cleanMobile];
    if (excludeUserId) {
      query += " AND user_id != ?";
      params.push(excludeUserId);
    }
    query += " LIMIT 1";
    const [rows] = await db.execute(query, params);
    if (rows.length > 0) {
      return { field: "mobile", value: rows[0].mobile, user: rows[0] };
    }
  }

  // Check username
  if (cleanUsername) {
    let query = `SELECT id, user_id, username, email, mobile FROM users WHERE LOWER(TRIM(username)) = ?`;
    const params = [cleanUsername];
    if (excludeUserId) {
      query += " AND user_id != ?";
      params.push(excludeUserId);
    }
    query += " LIMIT 1";
    const [rows] = await db.execute(query, params);
    if (rows.length > 0) {
      return { field: "username", value: rows[0].username, user: rows[0] };
    }
  }

  return null;
}

async function hardDeleteUser(userId) {
  const db = getDB();
  await db.execute("DELETE FROM users WHERE user_id = ?", [userId]);
  return true;
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
  findConflictUser,
  hardDeleteUser,
};

