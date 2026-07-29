const { getDB } = require('../config/db');

async function createTraineeInternAttendance(record) {
  const db = getDB();
  const [existing] = await db.execute(
    'SELECT id FROM trainee_intern_attendance WHERE trainee_intern_id = ? AND attendance_date = ? LIMIT 1',
    [record.trainee_intern_id, record.attendance_date]
  );

  if (existing.length > 0) {
    return { exists: true };
  }

  const fields = Object.keys(record).filter((key) => record[key] !== undefined);
  const values = fields.map((key) => record[key]);
  const placeholders = fields.map(() => '?').join(', ');

  const [result] = await db.execute(
    `INSERT INTO trainee_intern_attendance (${fields.join(', ')}) VALUES (${placeholders})`,
    values
  );

  return findById(result.insertId);
}

async function findById(id) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT a.*, t.full_name, t.person_id, t.type
     FROM trainee_intern_attendance a
     LEFT JOIN trainee_intern t ON t.uuid = a.trainee_intern_id
     WHERE a.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function getTraineeInternAttendanceSummary({ month, year }) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT
       t.uuid AS trainee_intern_id,
       t.person_id,
       t.full_name AS trainee_name,
       t.type,
       SUM(CASE WHEN a.attendance_status = 'Present' THEN 1 ELSE 0 END) AS present_days,
       SUM(CASE WHEN a.attendance_status = 'Absent' THEN 1 ELSE 0 END) AS absent_days
     FROM trainee_intern t
     LEFT JOIN trainee_intern_attendance a
       ON a.trainee_intern_id = t.uuid AND a.month = ? AND a.year = ?
     WHERE t.status IN ('Active','On Leave')
     GROUP BY t.uuid, t.person_id, t.full_name, t.type
     ORDER BY t.full_name`,
    [month, year]
  );

  return rows.map((row) => ({
    ...row,
    present_days: Number(row.present_days || 0),
    absent_days: Number(row.absent_days || 0),
  }));
}

async function getTraineeInternAttendanceByPerson({ traineeInternId, month, year }) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT a.*, t.full_name, t.person_id, t.type
     FROM trainee_intern_attendance a
     LEFT JOIN trainee_intern t ON t.uuid = a.trainee_intern_id
     WHERE a.trainee_intern_id = ? AND a.month = ? AND a.year = ?
     ORDER BY a.attendance_date DESC`,
    [traineeInternId, month, year]
  );

  return rows;
}

module.exports = {
  createTraineeInternAttendance,
  getTraineeInternAttendanceSummary,
  getTraineeInternAttendanceByPerson,
};
