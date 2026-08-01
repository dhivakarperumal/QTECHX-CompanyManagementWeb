const { getDB } = require("../config/db");

async function createAttendance(record) {
  const db = getDB();
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

module.exports = { createAttendance, getEmployeeAttendance };
