const { getDB } = require("../config/db");

async function resolveEmployeeName(employeeId) {
  if (!employeeId) return null;
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT CONCAT(first_name, COALESCE(CONCAT(' ', last_name), '')) AS employee_name
     FROM employees WHERE employee_id = ? LIMIT 1`,
    [employeeId]
  );
  return rows[0]?.employee_name?.trim() || null;
}

async function createAttendance(record) {
  const db = getDB();
  if (!record.employee_name && record.employee_id) {
    record.employee_name = await resolveEmployeeName(record.employee_id);
  }

  const [existing] = await db.execute(
    "SELECT id FROM attendance WHERE employee_id = ? AND attendance_date = ? LIMIT 1",
    [record.employee_id, record.attendance_date]
  );

  if (existing.length > 0) {
    return { exists: true };
  }

  const fields = Object.keys(record).filter((key) => record[key] !== undefined);
  const values = fields.map((key) => record[key]);
  const placeholders = fields.map(() => "?").join(", ");

  const [result] = await db.execute(
    `INSERT INTO attendance (${fields.join(", ")}) VALUES (${placeholders})`,
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
       SUM(CASE WHEN a.attendance_status = 'Absent' THEN 1 ELSE 0 END) AS absent_days
     FROM employees e
     LEFT JOIN attendance a
       ON a.employee_id = e.employee_id AND a.attendance_date BETWEEN ? AND ?
     WHERE e.employment_status = 'Active'
     GROUP BY e.employee_id, e.employee_code, e.first_name, e.last_name
     ORDER BY e.first_name, e.last_name`,
    [startDate, endDate]
  );

  return rows.map((row) => ({
    ...row,
    present_days: Number(row.present_days || 0),
    absent_days: Number(row.absent_days || 0),
  }));
}

async function getEmployeeAttendance({ employeeId, month, year }) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT a.*, e.first_name, e.last_name, e.employee_code
     FROM attendance a
     LEFT JOIN employees e ON e.employee_id = a.employee_id
     WHERE a.employee_id = ? AND a.month = ? AND a.year = ?
     ORDER BY a.attendance_date DESC`,
    [employeeId, month, year]
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
  const [rows] = await db.execute(
    `SELECT a.*, e.first_name, e.last_name, e.employee_code
     FROM attendance a
     LEFT JOIN employees e ON e.employee_id = a.employee_id
     WHERE a.employee_id = ? AND a.attendance_date = ? LIMIT 1`,
    [employeeId, attendanceDate]
  );
  return rows[0] || null;
}

module.exports = { createAttendance, getAttendanceSummary, getEmployeeAttendance, updateAttendance, getEmployeeAttendanceToday };
