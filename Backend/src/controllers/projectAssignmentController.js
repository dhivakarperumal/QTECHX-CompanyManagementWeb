const { findProjectByUUID } = require('../models/projectModel');
const {
  assignEmployee,
  removeAssignment,
  updateAssignmentRole,
  listAssignmentsByProject,
  listAllAssignments,
  searchEmployeesForProject,
} = require('../models/projectAssignmentModel');
const { getDB } = require('../config/db');

function ok(res, data, code = 200)  { return res.status(code).json({ success: true,  ...data }); }
function fail(res, msg, code = 500) { return res.status(code).json({ success: false, message: msg }); }

const ROLES = ['Project Manager','UI/UX Designer','Frontend Developer','Backend Developer','Tester','DevOps','QA'];

async function assignHandler(req, res) {
  try {
    const project = await findProjectByUUID(req.params.id);
    if (!project) return fail(res, 'Project not found', 404);

    const employee_ids = Array.isArray(req.body.employee_ids)
      ? req.body.employee_ids.filter(Boolean)
      : req.body.employee_id
        ? [req.body.employee_id]
        : [];
    const { role } = req.body;

    if (!employee_ids.length) return fail(res, 'employee_ids is required', 400);
    if (!ROLES.includes(role)) return fail(res, `Invalid role. Allowed: ${ROLES.join(', ')}`, 400);

    const db = getDB();
    const [rows] = await db.execute(
      `SELECT employee_id FROM employees WHERE employee_id IN (${employee_ids.map(() => '?').join(', ')})`,
      employee_ids
    );
    const existingEmployeeIds = new Set(rows.map((row) => row.employee_id));
    const invalidIds = employee_ids.filter((employeeId) => !existingEmployeeIds.has(employeeId));
    if (invalidIds.length) return fail(res, 'One or more employees were not found', 404);

    for (const employee_id of employee_ids) {
      await assignEmployee({
        project_id: project.id,
        employee_id,
        role,
        assigned_by: req.user?.user_id || 'SYSTEM',
      });
    }

    const assignments = await listAssignmentsByProject(project.id);
    return ok(res, { message: 'Employees assigned successfully', data: assignments }, 201);
  } catch (err) {
    console.error('assignHandler:', err);
    return fail(res, err.message || 'Assignment failed');
  }
}

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

async function updateAssignmentHandler(req, res) {
  try {
    const project = await findProjectByUUID(req.params.id);
    if (!project) return fail(res, 'Project not found', 404);
    const { role } = req.body;
    const assignmentId = req.params.assignmentId;
    if (!assignmentId) return fail(res, 'assignment id is required', 400);
    if (!role) return fail(res, 'role is required', 400);
    if (!ROLES.includes(role)) return fail(res, `Invalid role. Allowed: ${ROLES.join(', ')}`, 400);
    await updateAssignmentRole(assignmentId, role);
    const assignments = await listAssignmentsByProject(project.id);
    return ok(res, { message: 'Assignment updated successfully', data: assignments });
  } catch (err) {
    console.error('updateAssignmentHandler:', err);
    return fail(res, err.message || 'Failed to update assignment');
  }
}

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

async function getAllAssignmentsHandler(req, res) {
  try {
    const data = await listAllAssignments();
    return ok(res, { data });
  } catch (err) {
    console.error('getAllAssignmentsHandler:', err);
    return fail(res, err.message || 'Failed');
  }
}

async function searchEmployeesHandler(req, res) {
  try {
    const data = await searchEmployeesForProject({ search: req.query.search, status: req.query.status || 'Active' });
    return ok(res, { data });
  } catch (err) {
    console.error('searchEmployeesHandler:', err);
    return fail(res, err.message || 'Failed to search employees');
  }
}


module.exports = {
  assignHandler,
  unassignHandler,
  updateAssignmentHandler,
  getAssignmentsHandler,
  getAllAssignmentsHandler,
  searchEmployeesHandler,
};
