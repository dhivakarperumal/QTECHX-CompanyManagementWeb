const { getDB } = require("../config/db");

async function resolveAllPossibleEmployeeIds(db, employeeId) {
  if (!employeeId) return [];
  const ids = new Set([String(employeeId).trim()]);

  try {
    const [empRows] = await db.execute(
      `SELECT employee_id, id, employee_code, official_email, personal_email, first_name, last_name, username 
       FROM employees 
       WHERE employee_id = ? OR CAST(id AS CHAR) = ? OR employee_code = ? OR official_email = ? OR personal_email = ? OR username = ?`,
      [employeeId, employeeId, employeeId, employeeId, employeeId, employeeId]
    );

    for (const emp of empRows) {
      if (emp.employee_id) ids.add(String(emp.employee_id));
      if (emp.employee_code) ids.add(String(emp.employee_code));
      if (emp.id) ids.add(String(emp.id));
      if (emp.official_email) ids.add(String(emp.official_email));
      if (emp.personal_email) ids.add(String(emp.personal_email));
    }

    const [userRows] = await db.execute(
      `SELECT user_id, email, username FROM users WHERE user_id = ? OR email = ? OR username = ?`,
      [employeeId, employeeId, employeeId]
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
      if (u.username) {
        const [empByName] = await db.execute(
          `SELECT employee_id, id, employee_code FROM employees WHERE username = ? OR CONCAT(first_name, ' ', last_name) = ? OR first_name = ?`,
          [u.username, u.username, u.username]
        );
        for (const emp of empByName) {
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
    `SELECT a.*, DATE_FORMAT(a.attendance_date, '%Y-%m-%d') AS attendance_date, e.first_name, e.last_name, e.employee_code
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

async function getAttendanceHistory({ startDate, endDate, search, page, limit }) {
  const db = getDB();
  const conditions = [];
  const params = [];

  if (startDate) {
    conditions.push("a.attendance_date >= ?");
    params.push(startDate);
  }

  if (endDate) {
    conditions.push("a.attendance_date <= ?");
    params.push(endDate);
  }

  if (search) {
    conditions.push(`(
      a.employee_id LIKE ?
      OR a.attendance_status LIKE ?
      OR e.employee_code LIKE ?
      OR CONCAT_WS(' ', e.first_name, e.last_name) LIKE ?
      OR a.employee_name LIKE ?
    )`);
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const [countRows] = await db.execute(
    `SELECT COUNT(DISTINCT a.id) AS total
     FROM attendance a
     LEFT JOIN employees e ON e.employee_id = a.employee_id OR e.employee_code = a.employee_id
     ${whereClause}`,
    params
  );
  const total = Number(countRows[0]?.total || 0);
  const offset = (page - 1) * limit;
  const [rows] = await db.execute(
    `SELECT a.id, a.employee_id, a.attendance_date,
            COALESCE(
              NULLIF(a.employee_name, ''),
              NULLIF(CONCAT_WS(' ', NULLIF(e.first_name, ''), NULLIF(e.last_name, '')), ''),
              e.employee_code,
              a.employee_id
            ) AS employee_name,
            e.employee_code, a.check_in_time, a.check_out_time,
            a.break_start_time, a.break_end_time, a.working_hours,
            a.late_entry, a.early_exit, a.overtime, a.attendance_status,
            a.location, a.notes
     FROM attendance a
     LEFT JOIN employees e ON e.employee_id = a.employee_id OR e.employee_code = a.employee_id
     ${whereClause}
     ORDER BY a.attendance_date DESC, a.id DESC
     LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  return { data: rows, total };
}

async function getEmployeeAttendance({ employeeId, startDate, endDate }) {
  const db = getDB();
  const possibleIds = await resolveAllPossibleEmployeeIds(db, employeeId);
  const placeholders = possibleIds.map(() => "?").join(", ");

  if (possibleIds.length === 0) {
    return [];
  }

  const [rows] = await db.execute(
    `SELECT a.*, DATE_FORMAT(a.attendance_date, '%Y-%m-%d') AS attendance_date, e.first_name, e.last_name, e.employee_code
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
    `SELECT a.*, DATE_FORMAT(a.attendance_date, '%Y-%m-%d') AS attendance_date, e.first_name, e.last_name, e.employee_code
     FROM attendance a
     LEFT JOIN employees e ON (e.employee_id = a.employee_id OR e.employee_code = a.employee_id)
     WHERE a.employee_id IN (${placeholders}) AND a.attendance_date = ? LIMIT 1`,
    [...possibleIds, attendanceDate]
  );
  return rows[0] || null;
}

module.exports = { createAttendance, getAttendanceSummary, getAttendanceHistory, getEmployeeAttendance, updateAttendance, getEmployeeAttendanceToday, resolveAllPossibleEmployeeIds, resolveEmployeeName };
