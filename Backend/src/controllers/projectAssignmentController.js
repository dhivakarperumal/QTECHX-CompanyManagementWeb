const { findProjectByUUID } = require('../models/projectModel');
const {
  assignEmployee,
  removeAssignment,
  updateAssignmentRole,
  listAssignmentsByProject,
  listAllAssignments,
  searchEmployeesForProject,
  listProjectEmployees,
  assignEmployeesToProject,
  removeProjectEmployee,
  updateProjectEmployeeStatus,
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

async function getProjectEmployeesHandler(req, res) {
  try {
    const project = await findProjectByUUID(req.params.id);
    if (!project) return fail(res, 'Project not found', 404);
    const data = await listProjectEmployees(project.id);
    return ok(res, { data });
  } catch (err) {
    console.error('getProjectEmployeesHandler:', err);
    return fail(res, err.message || 'Failed to fetch assigned employees');
  }
}

async function assignEmployeesHandler(req, res) {
  try {
    const project = await findProjectByUUID(req.params.id);
    if (!project) return fail(res, 'Project not found', 404);

    const employee_ids = req.body.employee_ids || (req.body.employee_id ? [req.body.employee_id] : []);
    if (!Array.isArray(employee_ids) || !employee_ids.length) return fail(res, 'employee_ids is required', 400);

    const assigned_date = req.body.assigned_date || null;
    const status = req.body.status || 'Active';
    const created_by = req.user?.user_id || req.body.created_by || 'SYSTEM';

    const db = getDB();
    const [employeeRows] = await db.execute(
      `SELECT employee_id FROM employees WHERE employee_id IN (${employee_ids.map(() => '?').join(', ')})`,
      employee_ids
    );
    const existingEmployeeIds = new Set(employeeRows.map((row) => row.employee_id));
    const invalidIds = employee_ids.filter((employeeId) => !existingEmployeeIds.has(employeeId));
    if (invalidIds.length) return fail(res, 'One or more employees were not found', 404);

    await assignEmployeesToProject({
      project_id: project.id,
      employee_ids,
      assigned_date,
      status,
      created_by,
    });

    const data = await listProjectEmployees(project.id);
    return ok(res, { message: 'Employees assigned successfully', data }, 201);
  } catch (err) {
    console.error('assignEmployeesHandler:', err);
    if (err.message === 'Employee already assigned to this project.') {
      return fail(res, err.message, 409);
    }
    return fail(res, err.message || 'Assignment failed');
  }
}

async function unassignEmployeeHandler(req, res) {
  try {
    const project = await findProjectByUUID(req.params.id);
    if (!project) return fail(res, 'Project not found', 404);
    const { employee_id } = req.body;
    if (!employee_id) return fail(res, 'employee_id is required', 400);
    await removeProjectEmployee(project.id, employee_id);
    return ok(res, { message: 'Employee removed from project' });
  } catch (err) {
    console.error('unassignEmployeeHandler:', err);
    return fail(res, err.message || 'Failed to remove employee');
  }
}

async function updateAssignmentStatusHandler(req, res) {
  try {
    const project = await findProjectByUUID(req.params.id);
    if (!project) return fail(res, 'Project not found', 404);
    const { status } = req.body;
    if (!['Active', 'Inactive'].includes(status)) return fail(res, 'status must be Active or Inactive', 400);
    await updateProjectEmployeeStatus(project.id, req.params.employeeId, status);
    return ok(res, { message: 'Assignment status updated' });
  } catch (err) {
    console.error('updateAssignmentStatusHandler:', err);
    return fail(res, err.message || 'Failed to update assignment status');
  }
}

module.exports = {
  assignHandler,
  unassignHandler,
  updateAssignmentHandler,
  getAssignmentsHandler,
  getAllAssignmentsHandler,
  searchEmployeesHandler,
  getProjectEmployeesHandler,
  assignEmployeesHandler,
  unassignEmployeeHandler,
  updateAssignmentStatusHandler,
};
