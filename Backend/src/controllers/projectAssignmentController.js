const { findProjectByUUID } = require('../models/projectModel');
const { assignEmployee, removeAssignment, listAssignmentsByProject, listAllAssignments } = require('../models/projectAssignmentModel');
const { getDB } = require('../config/db');

function ok(res, data, code = 200)  { return res.status(code).json({ success: true,  ...data }); }
function fail(res, msg, code = 500) { return res.status(code).json({ success: false, message: msg }); }

const ROLES = ['Project Manager','UI/UX Designer','Frontend Developer','Backend Developer','Tester','DevOps','QA'];

/** POST /api/projects/:id/assignments  { employee_id, role } */
async function assignHandler(req, res) {
  try {
    const project = await findProjectByUUID(req.params.id);
    if (!project) return fail(res, 'Project not found', 404);

    const { employee_id, role } = req.body;
    if (!employee_id) return fail(res, 'employee_id is required', 400);
    if (!ROLES.includes(role)) return fail(res, `Invalid role. Allowed: ${ROLES.join(', ')}`, 400);

    // Verify employee exists
    const db = getDB();
    const [rows] = await db.execute('SELECT employee_id FROM employees WHERE employee_id = ? LIMIT 1', [employee_id]);
    if (!rows.length) return fail(res, 'Employee not found', 404);

    await assignEmployee({
      project_id:  project.id,
      employee_id,
      role,
      assigned_by: req.user?.user_id || 'SYSTEM',
    });

    const assignments = await listAssignmentsByProject(project.id);
    return ok(res, { message: 'Employee assigned successfully', data: assignments }, 201);
  } catch (err) {
    console.error('assignHandler:', err);
    return fail(res, err.message || 'Assignment failed');
  }
}

/** DELETE /api/projects/:id/assignments  { employee_id, role } */
async function unassignHandler(req, res) {
  try {
    const project = await findProjectByUUID(req.params.id);
    if (!project) return fail(res, 'Project not found', 404);
    const { employee_id, role } = req.body;
    if (!employee_id || !role) return fail(res, 'employee_id and role are required', 400);
    await removeAssignment(project.id, employee_id, role);
    return ok(res, { message: 'Assignment removed' });
  } catch (err) {
    console.error('unassignHandler:', err);
    return fail(res, err.message || 'Failed to remove assignment');
  }
}

/** GET /api/projects/:id/assignments */
async function getAssignmentsHandler(req, res) {
  try {
    const project = await findProjectByUUID(req.params.id);
    if (!project) return fail(res, 'Project not found', 404);
    const data = await listAssignmentsByProject(project.id);
    return ok(res, { data });
  } catch (err) {
    console.error('getAssignmentsHandler:', err);
    return fail(res, err.message || 'Failed to fetch assignments');
  }
}

/** GET /api/projects/assignments/all */
async function getAllAssignmentsHandler(req, res) {
  try {
    const data = await listAllAssignments();
    return ok(res, { data });
  } catch (err) {
    console.error('getAllAssignmentsHandler:', err);
    return fail(res, err.message || 'Failed');
  }
}

module.exports = { assignHandler, unassignHandler, getAssignmentsHandler, getAllAssignmentsHandler };
