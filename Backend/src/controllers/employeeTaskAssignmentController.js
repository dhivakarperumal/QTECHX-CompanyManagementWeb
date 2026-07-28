const { findProjectById, findProjectByUUID } = require('../models/projectModel');
const {
  assignTaskToEmployee,
  listEmployeeTaskAssignments,
} = require('../models/employeeTaskAssignmentModel');

function ok(res, data, code = 200) {
  return res.status(code).json({ success: true, ...data });
}

function fail(res, message, code = 500) {
  return res.status(code).json({ success: false, message });
}

function getActor(req) {
  return req.user?.user_id || req.user?.username || req.user?.email || 'SYSTEM';
}

async function resolveProject(req) {
  if (req.body?.project_id) {
    const numericId = Number(req.body.project_id);
    if (Number.isInteger(numericId) && numericId > 0) {
      return findProjectById(numericId);
    }
    return findProjectByUUID(req.body.project_id);
  }

  if (req.query?.project_id) {
    const numericId = Number(req.query.project_id);
    if (Number.isInteger(numericId) && numericId > 0) {
      return findProjectById(numericId);
    }
    return findProjectByUUID(req.query.project_id);
  }

  return null;
}

async function assignTaskHandler(req, res) {
  try {
    const project = await resolveProject(req);
    if (!project) return fail(res, 'Project not found', 404);

    const { employee_id, task_id, assigned_by, assigned_date, status } = req.body;
    if (!employee_id || !task_id) return fail(res, 'employee_id and task_id are required', 400);

    const actor = getActor(req);
    const result = await assignTaskToEmployee({
      project_id: project.id,
      employee_id,
      task_id,
      assigned_by: assigned_by || actor,
      assigned_date: assigned_date || null,
      created_by: actor,
      updated_by: actor,
      status: status || null,
    });

    return ok(res, {
      message: 'Task assigned successfully',
      data: result,
    }, 201);
  } catch (err) {
    console.error('assignTaskHandler:', err);
    return fail(res, err.message || 'Failed to assign task', err.message?.includes('already assigned') ? 409 : 400);
  }
}

async function listTaskAssignmentsHandler(req, res) {
  try {
    const { project_id, employee_id } = req.query;
    const assignments = await listEmployeeTaskAssignments({ project_id, employee_id });
    return ok(res, { data: assignments });
  } catch (err) {
    console.error('listTaskAssignmentsHandler:', err);
    return fail(res, err.message || 'Failed to list task assignments');
  }
}

module.exports = {
  assignTaskHandler,
  listTaskAssignmentsHandler,
};
