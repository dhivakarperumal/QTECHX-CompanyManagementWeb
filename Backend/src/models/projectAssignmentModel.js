const { getDB } = require('../config/db');

// ─── Create Assignment ────────────────────────────────────────────────────────
async function assignEmployee(data) {
  const db = getDB();
  // Upsert: if same project+employee+role exists, update assigned_at
  await db.execute(
    `INSERT INTO project_assignments (project_id, employee_id, role, assigned_by)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE assigned_by = VALUES(assigned_by), assigned_at = CURRENT_TIMESTAMP`,
    [data.project_id, data.employee_id, data.role, data.assigned_by || null]
  );
}

// ─── Remove Assignment ────────────────────────────────────────────────────────
async function removeAssignment(project_id, employee_id, role) {
  const db = getDB();
  await db.execute(
    'DELETE FROM project_assignments WHERE project_id = ? AND employee_id = ? AND role = ?',
    [project_id, employee_id, role]
  );
}

// ─── List Assignments for a Project ──────────────────────────────────────────
async function listAssignmentsByProject(project_id) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT pa.id, pa.role, pa.assigned_at, pa.assigned_by,
            e.employee_id, e.first_name, e.last_name, e.designation,
            e.profile_photo, e.mobile_number, e.personal_email
     FROM project_assignments pa
     JOIN employees e ON pa.employee_id = e.employee_id
     WHERE pa.project_id = ?
     ORDER BY FIELD(pa.role,'Project Manager','UI/UX Designer','Frontend Developer','Backend Developer','Tester','DevOps','QA'), pa.assigned_at ASC`,
    [project_id]
  );
  return rows;
}

// ─── List All Assignments (for overview) ─────────────────────────────────────
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

module.exports = { assignEmployee, removeAssignment, listAssignmentsByProject, listAllAssignments };
