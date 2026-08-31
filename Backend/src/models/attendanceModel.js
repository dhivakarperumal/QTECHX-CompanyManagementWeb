const { getDB } = require("../config/db");

async function resolveAllPossibleEmployeeIds(db, employeeId) {
  if (!employeeId) return [];
  const ids = new Set([String(employeeId).trim()]);

  try {
    const [empRows] = await db.execute(
      `SELECT employee_id, id, employee_code, official_email, personal_email 
       FROM employees 
       WHERE employee_id = ? OR CAST(id AS CHAR) = ? OR employee_code = ? OR official_email = ? OR personal_email = ?`,
      [employeeId, employeeId, employeeId, employeeId, employeeId]
    );

    for (const emp of empRows) {
      if (emp.employee_id) ids.add(String(emp.employee_id));
      if (emp.employee_code) ids.add(String(emp.employee_code));
      if (emp.id) ids.add(String(emp.id));
    }

    const [userRows] = await db.execute(
      `SELECT user_id, email FROM users WHERE user_id = ? OR email = ?`,
      [employeeId, employeeId]
    );

    for (const u of userRows) {
      if (u.user_id) ids.add(String(u.user_id));
      if (u.email) {
        const [empByEmail] = await db.execute(
          `SELECT employee_id, id, employee_code FROM employees WHERE official_email = ? OR personal_email = ?`,
          [u.email, u.email]
        );
        for (const emp of empByEmail) {
          if (emp.employee_id) ids.add(String(emp.employee_id));
          if (emp.employee_code) ids.add(String(emp.employee_code));
          if (emp.id) ids.add(String(emp.id));
        }
      }
    }
  } catch (err) {
    console.error("resolveAllPossibleEmployeeIds error:", err);
  }

  return Array.from(ids).filter(Boolean);
}

async function resolveEmployeeName(employeeId) {
  if (!employeeId) return null;
  const db = getDB();
  try {
    const [rows] = await db.execute(
      `SELECT CONCAT(first_name, COALESCE(CONCAT(' ', last_name), '')) AS employee_name
       FROM employees 
       WHERE employee_id = ? OR CAST(id AS CHAR) = ? OR employee_code = ? OR official_email = ? OR personal_email = ? 
       LIMIT 1`,
      [employeeId, employeeId, employeeId, employeeId, employeeId]
    );
    if (rows[0]?.employee_name?.trim()) {
      return rows[0].employee_name.trim();
    }

    const [userRows] = await db.execute(
      `SELECT username, email FROM users WHERE user_id = ? LIMIT 1`,
      [employeeId]
    );
    if (userRows[0]?.username) {
      return userRows[0].username;
    }
  } catch (err) {
    console.error("resolveEmployeeName error:", err);
  }
  return null;
}

async function createAttendance(record) {
  const db = getDB();
  if (!record.employee_name && record.employee_id) {
    record.employee_name = await resolveEmployeeName(record.employee_id);
  }

  const possibleIds = await resolveAllPossibleEmployeeIds(db, record.employee_id);
  const placeholders = possibleIds.map(() => "?").join(", ");

  let existing = [];
  if (possibleIds.length > 0) {
    [existing] = await db.execute(
      `SELECT id FROM attendance WHERE employee_id IN (${placeholders}) AND attendance_date = ? LIMIT 1`,
      [...possibleIds, record.attendance_date]
    );
  }

  if (existing.length > 0) {
    return updateAttendance(existing[0].id, record);
  }

  const fields = Object.keys(record).filter((key) => record[key] !== undefined);
  const values = fields.map((key) => record[key]);
  const insertPlaceholders = fields.map(() => "?").join(", ");

  const [result] = await db.execute(
    `INSERT INTO attendance (${fields.join(", ")}) VALUES (${insertPlaceholders})`,
    values
  );

  return findById(result.insertId);
}

async function findById(id) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT a.*, e.first_name, e.last_name, e.employee_code
     FROM attendance a
     LEFT JOIN employees e ON e.employee_id = a.employee_id
     WHERE a.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function getAttendanceSummary({ startDate, endDate }) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT
       e.employee_id,
       e.employee_code,
       CONCAT(e.first_name, ' ', COALESCE(e.last_name, '')) AS employee_name,
       SUM(CASE WHEN a.attendance_status = 'Present' THEN 1 ELSE 0 END) AS present_days,
       SUM(CASE WHEN a.attendance_status = 'Absent' THEN 1 ELSE 0 END) AS absent_days,
       SUM(CASE WHEN a.late_entry IS NOT NULL AND a.late_entry != 'No' AND a.late_entry != '--' AND a.late_entry != '0h 0m' THEN 1 ELSE 0 END) AS late_days
     FROM employees e
     LEFT JOIN attendance a
       ON a.employee_id = e.employee_id AND a.attendance_date BETWEEN ? AND ?
     WHERE ((e.status = 'Active' OR e.employment_status = 'Active') AND e.status != 'Inactive' AND e.employment_status != 'Inactive')
        OR a.id IS NOT NULL
     GROUP BY e.employee_id, e.employee_code, e.first_name, e.last_name
     ORDER BY e.first_name, e.last_name`,
    [startDate, endDate]
  );

  return rows.map((row) => ({
    ...row,
    present_days: Number(row.present_days || 0),
    absent_days: Number(row.absent_days || 0),
    late_days: Number(row.late_days || 0),
  }));
}

async function getEmployeeAttendance({ employeeId, startDate, endDate }) {
  const db = getDB();
  const possibleIds = await resolveAllPossibleEmployeeIds(db, employeeId);
  const placeholders = possibleIds.map(() => "?").join(", ");

  if (possibleIds.length === 0) {
    return [];
  }

  const [rows] = await db.execute(
    `SELECT a.*, e.first_name, e.last_name, e.employee_code
     FROM attendance a
     LEFT JOIN employees e ON (e.employee_id = a.employee_id OR e.employee_code = a.employee_id)
     WHERE a.employee_id IN (${placeholders}) AND a.attendance_date BETWEEN ? AND ?
     ORDER BY a.attendance_date DESC`,
    [...possibleIds, startDate, endDate]
  );

  return rows;
}

async function updateAttendance(id, record) {
  const db = getDB();
  if (!record.employee_name && record.employee_id) {
    record.employee_name = await resolveEmployeeName(record.employee_id);
  }

  const fields = Object.keys(record).filter((key) => record[key] !== undefined);
  if (fields.length === 0) return findById(id);

  const updates = fields.map((key) => `${key} = ?`).join(", ");
  const values = fields.map((key) => record[key]);
  values.push(id);

  await db.execute(`UPDATE attendance SET ${updates} WHERE id = ?`, values);
  return findById(id);
}

async function getEmployeeAttendanceToday(employeeId, attendanceDate) {
  const db = getDB();
  const possibleIds = await resolveAllPossibleEmployeeIds(db, employeeId);
  if (possibleIds.length === 0) return null;

  const placeholders = possibleIds.map(() => "?").join(", ");

  const [rows] = await db.execute(
    `SELECT a.*, e.first_name, e.last_name, e.employee_code
     FROM attendance a
     LEFT JOIN employees e ON (e.employee_id = a.employee_id OR e.employee_code = a.employee_id)
     WHERE a.employee_id IN (${placeholders}) AND a.attendance_date = ? LIMIT 1`,
    [...possibleIds, attendanceDate]
  );
  return rows[0] || null;
}

module.exports = { createAttendance, getAttendanceSummary, getEmployeeAttendance, updateAttendance, getEmployeeAttendanceToday, resolveAllPossibleEmployeeIds, resolveEmployeeName };
