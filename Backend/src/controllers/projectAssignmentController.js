const { findProjectById, findProjectByUUID } = require('../models/projectModel');
const {
  assignEmployeesToProject,
  syncProjectAssignments,
  removeProjectAssignments,
  updateProjectAssignmentEntry,
  listAssignmentsByProject,
  listAllAssignments,
  searchEmployeesForProject,
} = require('../models/projectAssignmentModel');
const { getDB } = require('../config/db');

function ok(res, data, code = 200) { return res.status(code).json({ success: true, ...data }); }
function fail(res, msg, code = 500) { return res.status(code).json({ success: false, message: msg }); }

function normalizeEmployeeAssignments(body = {}) {
  const sources = [
    body.employee_ids,
    body.employee_id,
    body.employees,
    body.assignedEmployees,
    body.assigned_employees,
    body.assignedEmployeeIds,
    body.assigned_employee_ids,
  ];

  const normalizedAssignments = [];
  const seen = new Set();

  const addValue = (value) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach(addValue);
      return;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return;

      try {
        const parsedValue = JSON.parse(trimmed);
        addValue(parsedValue);
        return;
      } catch (err) {
        trimmed.split(',').forEach((item) => {
          const part = item.trim();
          if (!part || seen.has(part)) return;
          seen.add(part);
          normalizedAssignments.push({ employee_id: part });
        });
      }
      return;
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      const normalized = String(value).trim();
      if (!normalized || seen.has(normalized)) return;
      seen.add(normalized);
      normalizedAssignments.push({ employee_id: normalized });
      return;
    }

    if (value && typeof value === 'object') {
      const nestedId = value.employee_id ?? value.employeeId ?? value.id ?? value.value ?? value.uuid ?? value._id;
      if (nestedId !== undefined && nestedId !== null && nestedId !== '') {
        const normalized = String(nestedId).trim();
        if (normalized && !seen.has(normalized)) {
          seen.add(normalized);
          normalizedAssignments.push({
            ...value,
            employee_id: normalized,
          });
        }
      }

      if (value.items) addValue(value.items);
    }
  };

  sources.forEach(addValue);
  return normalizedAssignments;
}

function getActor(req) {
  return req.user?.user_id || req.user?.username || req.user?.email || 'SYSTEM';
}

async function resolveEmployeeAssignments(db, employeeAssignments = []) {
  const resolvedEmployeeAssignments = [];
  const invalidIds = [];
  const seen = new Set();

  for (const assignment of employeeAssignments || []) {
    const employeeId = assignment?.employee_id ?? assignment?.employeeId ?? assignment?.id;
    const normalizedEmployeeId = employeeId ? String(employeeId).trim() : '';
    if (!normalizedEmployeeId || seen.has(normalizedEmployeeId)) continue;
    seen.add(normalizedEmployeeId);

    const [rows] = await db.execute(
      'SELECT employee_id, employee_code, first_name, last_name, profile_photo, designation, role, personal_email, official_email, mobile_number, alternate_mobile FROM employees WHERE employee_id = ? OR CAST(id AS CHAR) = ? LIMIT 1',
      [normalizedEmployeeId, normalizedEmployeeId]
    );

    if (rows[0]?.employee_id) {
      const employee = rows[0];
      resolvedEmployeeAssignments.push({
        employee_id: String(employee.employee_id),
        employee_name: assignment?.employee_name || assignment?.employeeName || [employee.first_name, employee.last_name].filter(Boolean).join(' ').trim() || null,
        employee_code: assignment?.employee_code || assignment?.employeeCode || employee.employee_code || null,
        first_name: assignment?.first_name || employee.first_name || null,
        last_name: assignment?.last_name || employee.last_name || null,
        profile_photo: assignment?.profile_photo || assignment?.profilePhoto || employee.profile_photo || null,
        designation: assignment?.designation || assignment?.role || employee.designation || employee.role || null,
        email: assignment?.email || assignment?.personal_email || assignment?.official_email || employee.personal_email || employee.official_email || null,
        mobile_number: assignment?.mobile_number || assignment?.mobileNumber || employee.mobile_number || null,
        alternate_mobile: assignment?.alternate_mobile || assignment?.alternateMobile || employee.alternate_mobile || null,
        assigned_date: assignment?.assigned_date || assignment?.assignedDate || null,
        status: assignment?.status || 'Assigned',
      });
    } else {
      invalidIds.push(normalizedEmployeeId);
    }
  }

  return {
    resolvedEmployeeAssignments,
    invalidIds,
  };
}

async function resolveProject(req) {
  const projectId = req.body?.project_id || req.params?.id || req.query?.project_id;
  if (!projectId) return null;
  const numericId = Number(projectId);
  if (Number.isInteger(numericId) && numericId > 0) {
    const byId = await findProjectById(numericId);
    if (byId) return byId;
  }
  return findProjectByUUID(projectId);
}

function buildAssignmentEnvelope(project, assignments = []) {
  const assignedEmployees = (assignments || []).map((row) => ({
    employee_id: row.employee_id,
    employee_code: row.employee_code || null,
    first_name: row.first_name || null,
    last_name: row.last_name || null,
    full_name: row.full_name || [row.first_name, row.last_name].filter(Boolean).join(' ').trim() || null,
    profile_photo: row.profile_photo || null,
    mobile_number: row.mobile_number || null,
    alternate_mobile: row.alternate_mobile || null,
    personal_email: row.personal_email || row.email || null,
    permanent_address: row.permanent_address || null,
    designation: row.designation || row.role || null,
    team_lead: row.team_lead || null,
    joining_date: row.joining_date || null,
    confirmation_date: row.confirmation_date || null,
    employee_status: row.employee_status || row.employment_status || 'Active',
    employment_status: row.employment_status || row.employee_status || 'Active',
    role: row.role || null,
    status: row.status || 'Assigned',
    assigned_date: row.assigned_date || row.created_at || new Date().toISOString(),
  }));

  return {
    project_id: project.id,
    project_uuid: project.uuid,
    project_name: project.project_name,
    assignedEmployeeCount: assignedEmployees.length,
    assignedEmployees,
    employee_count: assignedEmployees.length,
    employees: assignedEmployees,
    status: 'Assigned',
    assigned_date: assignedEmployees.length > 0 ? assignedEmployees[0].assigned_date : null,
    project: {
      uuid: project.uuid,
      project_name: project.project_name,
      current_status: project.current_status,
      employees: assignedEmployees,
    },
  };
}

async function assignHandler(req, res) {
  try {
    const project = await resolveProject(req);
    if (!project) return fail(res, 'Project not found', 404);

    const employeeAssignments = normalizeEmployeeAssignments(req.body);
    if (!employeeAssignments.length) return fail(res, 'employee_ids is required', 400);

    const actor = getActor(req);
    const db = getDB();
    const { resolvedEmployeeAssignments, invalidIds } = await resolveEmployeeAssignments(db, employeeAssignments);
    if (invalidIds.length) return fail(res, 'One or more employees were not found', 404);

    const result = await assignEmployeesToProject({
      project_id: project.id,
      employee_ids: resolvedEmployeeAssignments,
      status: req.body.status || 'Assigned',
      assigned_date: req.body.assigned_date || null,
      created_by: actor,
      updated_by: actor,
    });

    const assignments = await listAssignmentsByProject(project.id);
    const payload = buildAssignmentEnvelope(project, assignments);
    return ok(res, {
      message: result.inserted ? 'Employees assigned successfully' : 'No new assignments were created',
      ...payload,
      inserted: result.inserted,
      skipped: result.existing,
      data: assignments,
    }, result.inserted ? 201 : 200);
  } catch (err) {
    console.error('assignHandler:', err);
    return fail(res, err.message || 'Assignment failed');
  }
}

async function unassignHandler(req, res) {
  try {
    const project = await resolveProject(req);
    if (!project) return fail(res, 'Project not found', 404);

    const employeeAssignments = normalizeEmployeeAssignments(req.body);
    if (!employeeAssignments.length) return fail(res, 'employee_ids is required', 400);

    const db = getDB();
    const { resolvedEmployeeAssignments, invalidIds } = await resolveEmployeeAssignments(db, employeeAssignments);
    if (invalidIds.length) return fail(res, 'One or more employees were not found', 404);

    const actor = getActor(req);
    const removed = await removeProjectAssignments(project.id, resolvedEmployeeAssignments, actor);
    const assignments = await listAssignmentsByProject(project.id);
    const payload = buildAssignmentEnvelope(project, assignments);
    return ok(res, { message: 'Assignment removed', ...payload, removed, data: assignments });
  } catch (err) {
    console.error('unassignHandler:', err);
    return fail(res, err.message || 'Failed to remove assignment');
  }
}

async function updateAssignmentsHandler(req, res) {
  try {
    const project = await resolveProject(req);
    if (!project) return fail(res, 'Project not found', 404);

    const employeeAssignments = normalizeEmployeeAssignments(req.body);
    const actor = getActor(req);
    const db = getDB();
    const { resolvedEmployeeAssignments, invalidIds } = await resolveEmployeeAssignments(db, employeeAssignments);
    if (employeeAssignments.length && invalidIds.length) return fail(res, 'One or more employees were not found', 404);

    const result = await syncProjectAssignments({
      project_id: project.id,
      employee_ids: resolvedEmployeeAssignments,
      status: req.body.status || 'Assigned',
      assigned_date: req.body.assigned_date || null,
      updated_by: actor,
    });

    const assignments = await listAssignmentsByProject(project.id);
    const payload = buildAssignmentEnvelope(project, assignments);
    return ok(res, {
      message: 'Project assignments updated successfully',
      ...payload,
      data: assignments,
      updated: result,
    });
  } catch (err) {
    console.error('updateAssignmentsHandler:', err);
    return fail(res, err.message || 'Failed to update assignments');
  }
}

async function updateAssignmentHandler(req, res) {
  try {
    const project = await resolveProject(req);
    if (!project) return fail(res, 'Project not found', 404);

    const { status, role, employee_id, employeeId } = req.body;
    const assignmentId = req.params.assignmentId;
    const targetEmployeeId = employee_id || employeeId || null;
    if (!assignmentId) return fail(res, 'assignment id is required', 400);
    if (role === undefined && status === undefined) return fail(res, 'role or status is required', 400);
    if (!targetEmployeeId && role !== undefined && role !== null) return fail(res, 'employee_id is required to update role', 400);

    const actor = getActor(req);
    if (status !== undefined) {
      const db = getDB();
      await db.execute('UPDATE project_assignments SET status = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE id = ?', [status, actor, assignmentId]);
    }
    let updatedEmployee = null;
    if (targetEmployeeId) {
      updatedEmployee = await updateProjectAssignmentEntry({
        project_id: project.id,
        assignment_id: assignmentId,
        employee_id: targetEmployeeId,
        updates: role !== undefined ? { role } : {},
        updated_by: actor,
      });
      if (!updatedEmployee) return fail(res, 'Employee assignment not found', 404);
    }

    const assignments = await listAssignmentsByProject(project.id);
    const payload = buildAssignmentEnvelope(project, assignments);
    return ok(res, { message: 'Assignment updated successfully', ...payload, data: assignments, updatedEmployee });
  } catch (err) {
    console.error('updateAssignmentHandler:', err);
    return fail(res, err.message || 'Failed to update assignment');
  }
}

function groupAssignmentsByProject(assignments = []) {
  return assignments.reduce((groups, assignment) => {
    const projectKey = assignment.project_uuid || assignment.project_id || 'unknown';
    if (!groups[projectKey]) {
      groups[projectKey] = {
        project_uuid: assignment.project_uuid || null,
        project_id: assignment.project_id || null,
        project_name: assignment.project_name || null,
        current_status: assignment.current_status || null,
        employees: [],
      };
    }
    groups[projectKey].employees.push({
      id: assignment.id,
      employee_id: assignment.employee_id,
      employee_code: assignment.employee_code,
      first_name: assignment.first_name,
      last_name: assignment.last_name,
      designation: assignment.designation,
      profile_photo: assignment.profile_photo,
      mobile_number: assignment.mobile_number,
      personal_email: assignment.personal_email,
      status: assignment.status,
      assigned_date: assignment.assigned_date,
    });
    return groups;
  }, {});
}

async function getAssignmentsHandler(req, res) {
  try {
    const project = await resolveProject(req);
    if (!project) return fail(res, 'Project not found', 404);
    const assignments = await listAssignmentsByProject(project.id);
    const payload = buildAssignmentEnvelope(project, assignments);
    return ok(res, { ...payload, data: assignments });
  } catch (err) {
    console.error('getAssignmentsHandler:', err);
    return fail(res, err.message || 'Failed to fetch assignments');
  }
}

async function getAllAssignmentsHandler(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 15));
    const search = req.query.search?.toString().trim() || '';
    const role = req.query.role?.toString().trim() || '';
    const result = await listAllAssignments({ page, limit, search, role });
    const grouped = Object.values(groupAssignmentsByProject(result.rows));
    return ok(res, {
      data: result.rows,
      grouped,
      pagination: { page, limit, total: result.total, pages: Math.ceil(result.total / limit) },
    });
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
  updateAssignmentsHandler,
  getAssignmentsHandler,
  getAllAssignmentsHandler,
  searchEmployeesHandler,
};
