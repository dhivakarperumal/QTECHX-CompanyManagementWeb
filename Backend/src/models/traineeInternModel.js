const { getDB } = require('../config/db');

const traineeInternFields = [
  'id', 'uuid', 'person_id', 'full_name', 'type', 'department', 'designation',
  'reporting_manager', 'joining_date', 'end_date', 'status',
  'mobile_number', 'email_address', 'current_address', 'emergency_contact_name',
  'emergency_contact_number', 'profile_photo', 'resume', 'college_id_doc',
  'offer_letter', 'internship_letter', 'college_university', 'course',
  'academic_department', 'year_semester', 'college_id_number', 'guide_name',
  'created_at', 'updated_at', 'created_by', 'updated_by',
  `(SELECT COUNT(*) FROM trainee_employee_assignments a WHERE (a.trainee_id = ti.uuid OR a.trainee_id = ti.person_id) AND a.status = 'Active') AS has_active_assignment`,
  `(SELECT employee_name FROM trainee_employee_assignments a WHERE (a.trainee_id = ti.uuid OR a.trainee_id = ti.person_id) AND a.status = 'Active' LIMIT 1) AS active_employee_name`,
].join(', ');

async function generatePersonCode(db) {
  const [row] = await db.execute('SELECT MAX(id) AS maxId FROM trainee_intern');
  const nextId = (row[0]?.maxId || 0) + 1;
  return `TI-${String(nextId).padStart(3, '0')}`;
}

async function createTraineeIntern(data) {
  const db = getDB();
  const personId = (data.person_id || '').toString().trim() || (await generatePersonCode(db));
  const columns = `(
    uuid, person_id, full_name, type, department, designation,
    reporting_manager, joining_date, end_date, status,
    mobile_number, email_address, current_address, emergency_contact_name,
    emergency_contact_number, profile_photo, resume, college_id_doc,
    offer_letter, internship_letter, college_university, course,
    academic_department, year_semester, college_id_number, guide_name,
    created_by, updated_by
  )`;
  const placeholders = Array(28).fill('?').join(', ');
  const [result] = await db.execute(
    `INSERT INTO trainee_intern ${columns} VALUES (${placeholders})`,
    [
      data.uuid,
      personId,
      data.full_name || null,
      data.type || 'Trainee',
      data.department || null,
      data.designation || null,
      data.reporting_manager || null,
      data.joining_date || null,
      data.end_date || null,
      data.status || 'Pending',
      data.mobile_number || null,
      data.email_address || null,
      data.current_address || null,
      data.emergency_contact_name || null,
      data.emergency_contact_number || null,
      data.profile_photo || null,
      data.resume || null,
      data.college_id_doc || null,
      data.offer_letter || null,
      data.internship_letter || null,
      data.college_university || null,
      data.course || null,
      data.academic_department || null,
      data.year_semester || null,
      data.college_id_number || null,
      data.guide_name || null,
      data.created_by || null,
      data.updated_by || null,
    ]
  );
  return findTraineeInternById(result.insertId);
}

async function findTraineeInternById(id) {
  const db = getDB();
  const [rows] = await db.execute(`SELECT ${traineeInternFields} FROM trainee_intern ti WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

async function findTraineeInternByUUID(uuid) {
  const db = getDB();
  const [rows] = await db.execute(`SELECT ${traineeInternFields} FROM trainee_intern ti WHERE uuid = ? LIMIT 1`, [uuid]);
  return rows[0] || null;
}

async function listTraineeInterns({ page, limit, search, type, status, employee_id }) {
  const db = getDB();
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];

  if (search) {
    conditions.push('(full_name LIKE ? OR person_id LIKE ? OR email_address LIKE ? OR mobile_number LIKE ? OR department LIKE ? OR designation LIKE ?)');
    const term = `%${search}%`;
    values.push(term, term, term, term, term, term);
  }
  if (type) {
    conditions.push('type = ?');
    values.push(type);
  }
  if (status) {
    conditions.push('status = ?');
    values.push(status);
  }
  if (employee_id) {
    conditions.push(`EXISTS (
      SELECT 1 FROM trainee_employee_assignments a
      WHERE a.status = 'Active'
        AND a.employee_id = ?
        AND (a.trainee_id = ti.uuid OR a.trainee_id = ti.person_id)
    )`);
    values.push(employee_id);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await db.execute(
    `SELECT ${traineeInternFields} FROM trainee_intern ti ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );
  const [countRows] = await db.execute(`SELECT COUNT(*) AS total FROM trainee_intern ti ${where}`, values);
  return { rows, total: countRows[0].total };
}

async function updateTraineeIntern(uuid, updates) {
  const db = getDB();
  const fields = Object.keys(updates);
  if (!fields.length) return findTraineeInternByUUID(uuid);
  const assignments = fields.map((field) => `${field} = ?`).join(', ');
  const values = [...fields.map((field) => updates[field]), uuid];
  await db.execute(`UPDATE trainee_intern SET ${assignments} WHERE uuid = ?`, values);
  return findTraineeInternByUUID(uuid);
}

async function deleteTraineeIntern(uuid) {
  const db = getDB();
  await db.execute('DELETE FROM trainee_intern WHERE uuid = ?', [uuid]);
}

module.exports = {
  createTraineeIntern,
  findTraineeInternById,
  findTraineeInternByUUID,
  listTraineeInterns,
  updateTraineeIntern,
  deleteTraineeIntern,
  generatePersonCode,
};
