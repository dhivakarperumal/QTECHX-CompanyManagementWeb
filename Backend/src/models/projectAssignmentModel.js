const { getDB } = require('../config/db');

async function assignEmployee(data) {
  const db = getDB();
  await db.execute(
    `INSERT INTO project_assignments (project_id, employee_id, role, assigned_by)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE assigned_by = VALUES(assigned_by), assigned_at = CURRENT_TIMESTAMP`,
    [data.project_id, data.employee_id, data.role, data.assigned_by || null]
  );
}

async function removeAssignment(project_id, employee_id, role) {
  const db = getDB();
  await db.execute(
    'DELETE FROM project_assignments WHERE project_id = ? AND employee_id = ? AND role = ?',
    [project_id, employee_id, role]
  );
}

async function updateAssignmentRole(assignment_id, role) {
  const db = getDB();
  await db.execute(
    'UPDATE project_assignments SET role = ? WHERE id = ?',
    [role, assignment_id]
  );
}

async function listAssignmentsByProject(project_id) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT pa.id, pa.role, pa.assigned_at, pa.assigned_by,
            e.employee_id, e.employee_code, e.first_name, e.last_name, e.designation,
            e.profile_photo, e.mobile_number, e.personal_email
     FROM project_assignments pa
     JOIN employees e ON pa.employee_id = e.employee_id
     WHERE pa.project_id = ?
     ORDER BY FIELD(pa.role,'Project Manager','UI/UX Designer','Frontend Developer','Backend Developer','Tester','DevOps','QA'), pa.assigned_at ASC`,
    [project_id]
  );
  return rows;
}

async function listAllAssignments() {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT pa.id, pa.role, pa.assigned_at,
            p.uuid AS project_uuid, p.project_name, p.current_status,
            e.employee_id, e.first_name, e.last_name, e.designation, e.profile_photo
     FROM project_assignments pa
     JOIN projects p ON pa.project_id = p.id
     JOIN employees e ON pa.employee_id = e.employee_id
     ORDER BY pa.assigned_at DESC
     LIMIT 200`
  );
  return rows;
}

async function searchEmployeesForProject({ search = '', status = 'Active' }) {
  const db = getDB();
  const term = `%${(search || '').trim()}%`;
  const [rows] = await db.execute(
    `SELECT employee_id, employee_code, first_name, last_name, designation, role, personal_email, official_email, mobile_number, employment_status
     FROM employees
     WHERE employment_status = ?
       AND (
         LOWER(CONCAT(first_name, ' ', COALESCE(last_name, ''))) LIKE LOWER(?) OR
         LOWER(employee_id) LIKE LOWER(?) OR
         LOWER(employee_code) LIKE LOWER(?) OR
         LOWER(personal_email) LIKE LOWER(?) OR
         LOWER(official_email) LIKE LOWER(?) OR
         LOWER(mobile_number) LIKE LOWER(?) OR
         LOWER(designation) LIKE LOWER(?) OR
         LOWER(role) LIKE LOWER(?)
       )
     ORDER BY first_name, last_name
     LIMIT 50`,
    [status, term, term, term, term, term, term, term, term]
  );
  return rows;
}

async function listProjectEmployees(project_id) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT pe.id, pe.project_id, pe.employee_id, pe.assigned_date, pe.status, pe.created_at, pe.updated_at,
            e.employee_code, e.first_name, e.last_name, e.designation, e.role, e.personal_email, e.official_email, e.mobile_number
     FROM project_employees pe
     JOIN employees e ON e.employee_id = pe.employee_id
     WHERE pe.project_id = ?
     ORDER BY pe.created_at DESC`,
    [project_id]
  );
  return rows;
}

async function assignEmployeesToProject({ project_id, employee_ids = [], assigned_date = null, status = 'Active', created_by = null }) {
  const db = getDB();
  const ids = Array.isArray(employee_ids) ? employee_ids.filter(Boolean) : [];
  if (!ids.length) throw new Error('No employees selected');

  const placeholders = ids.map(() => '?').join(', ');
  const [existingRows] = await db.execute(
    `SELECT employee_id FROM project_employees WHERE project_id = ? AND employee_id IN (${placeholders})`,
    [project_id, ...ids]
  );
  const existingIds = new Set(existingRows.map((row) => row.employee_id));
  const newIds = ids.filter((employeeId) => !existingIds.has(employeeId));

  if (!newIds.length) {
    throw new Error('Employee already assigned to this project.');
  }

  const values = [];
  const insertPlaceholders = newIds.map(() => '(?, ?, ?, ?, ?)').join(', ');
  newIds.forEach((employeeId) => {
    values.push(project_id, employeeId, assigned_date || null, status || 'Active', created_by || null);
  });

  await db.execute(
    `INSERT INTO project_employees (project_id, employee_id, assigned_date, status, created_by) VALUES ${insertPlaceholders}`,
    values
  );

  return newIds;
}

async function removeProjectEmployee(project_id, employee_id) {
  const db = getDB();
  await db.execute('DELETE FROM project_employees WHERE project_id = ? AND employee_id = ?', [project_id, employee_id]);
}

async function updateProjectEmployeeStatus(project_id, employee_id, status) {
  const db = getDB();
  await db.execute('UPDATE project_employees SET status = ? WHERE project_id = ? AND employee_id = ?', [status, project_id, employee_id]);
}

module.exports = {
  assignEmployee,
  removeAssignment,
  listAssignmentsByProject,
  listAllAssignments,
  searchEmployeesForProject,
  listProjectEmployees,
  assignEmployeesToProject,
  removeProjectEmployee,
  updateProjectEmployeeStatus,
};
