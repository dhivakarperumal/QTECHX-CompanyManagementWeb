const { getDB } = require('../config/db');

function getCurrentDateTimeString() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function normalizeAssignmentEntry(item = {}) {
  if (!item || typeof item !== 'object') return { employee_id: null };

  const employeeId = item.employee_id ?? item.employeeId ?? item.id ?? item.value ?? item.uuid ?? item._id;
  if (employeeId === undefined || employeeId === null || employeeId === '') {
    return { employee_id: null };
  }

  const fullName = item.full_name ?? item.fullName ?? (([item.first_name, item.last_name].filter(Boolean).join(' ')).trim() || null);

  return {
    employee_id: String(employeeId).trim(),
    employee_code: item.employee_code ?? item.employeeCode ?? null,
    first_name: item.first_name ?? item.firstName ?? null,
    last_name: item.last_name ?? item.lastName ?? null,
    full_name: fullName,
    profile_photo: item.profile_photo ?? item.profilePhoto ?? null,
    mobile_number: item.mobile_number ?? item.mobileNumber ?? null,
    alternate_mobile: item.alternate_mobile ?? item.alternateMobile ?? null,
    personal_email: item.personal_email ?? item.personalEmail ?? item.email ?? null,
    permanent_address: item.permanent_address ?? item.permanentAddress ?? null,
    designation: item.designation ?? item.role ?? item.job_title ?? null,
    team_lead: item.team_lead ?? item.teamLead ?? null,
    joining_date: item.joining_date ?? item.joiningDate ?? null,
    confirmation_date: item.confirmation_date ?? item.confirmationDate ?? null,
    employment_status: item.employment_status ?? item.employmentStatus ?? 'Active',
    role: item.role ?? null,
    status: item.status ?? 'Assigned',
    assigned_date: item.assigned_date ?? item.assignedDate ?? null,
  };
}

function serializeEmployeeAssignments(employee_ids = []) {
  const values = Array.isArray(employee_ids) ? employee_ids : [];
  const payloads = [];
  const seen = new Set();

  values.forEach((item) => {
    if (!item) return;

    let normalizedItem = item;
    if (typeof item === 'string') {
      const trimmed = item.trim();
      if (!trimmed) return;
      normalizedItem = { employee_id: trimmed };
    }

    const normalized = normalizeAssignmentEntry(normalizedItem);
    if (!normalized.employee_id || seen.has(normalized.employee_id)) return;
    seen.add(normalized.employee_id);
    payloads.push(normalized);
  });

  return payloads;
}

function parseEmployeeAssignments(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map(normalizeAssignmentEntry).filter((item) => item.employee_id);
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(normalizeAssignmentEntry).filter((item) => item.employee_id);
      }
    } catch (err) {
      return [];
    }
  }

  return [];
}

async function getActiveProjectCountForEmployee(employeeId, excludeProjectId = null) {
  if (!employeeId) return 0;
  const db = getDB();
  const params = [String(employeeId).trim()];
  let excludeSql = '';
  if (excludeProjectId) {
    excludeSql = 'AND pa.project_id != ?';
    params.push(excludeProjectId);
  }

  const [rows] = await db.execute(
    `SELECT COUNT(DISTINCT pa.project_id) AS active_project_count
     FROM project_assignments pa
     JOIN projects p ON p.id = pa.project_id
     WHERE JSON_CONTAINS(pa.employee_ids, JSON_OBJECT('employee_id', CAST(? AS CHAR)), '$')
       AND p.current_status NOT IN ('Completed','Cancelled','Inactive')
       ${excludeSql}`,
    params
  );

  return Number(rows[0]?.active_project_count || 0);
}

async function getActiveProjectCountsForEmployees(employeeIds = [], excludeProjectId = null) {
  const counts = {};
  for (const employeeId of [...new Set((employeeIds || []).map((id) => String(id).trim()).filter(Boolean))]) {
    counts[employeeId] = await getActiveProjectCountForEmployee(employeeId, excludeProjectId);
  }
  return counts;
}

async function validateAssignmentLimitForEmployees(employeeIds = [], projectId = null, existingEmployeeIds = []) {
  const existingSet = new Set((existingEmployeeIds || []).map((id) => String(id).trim()).filter(Boolean));
  const counts = await getActiveProjectCountsForEmployees(employeeIds, projectId);
  return Object.entries(counts)
    .filter(([employeeId, count]) => count >= 3 && !existingSet.has(employeeId))
    .map(([employeeId]) => employeeId);
}

async function hydrateEmployeeAssignments(assignments = [], rowAssignedDate = null, rowCreatedAt = null) {
  const db = getDB();
  const normalizedAssignments = Array.isArray(assignments)
    ? assignments.map(normalizeAssignmentEntry).filter((item) => item.employee_id)
    : [];
  const employeeIds = [...new Set(normalizedAssignments.map((item) => String(item.employee_id).trim()).filter(Boolean))];
  if (!employeeIds.length) return normalizedAssignments;

  const placeholders = employeeIds.map(() => '?').join(', ');
  const [employeeRows] = await db.execute(
    `SELECT employee_id, employee_code, first_name, last_name, profile_photo,
            designation, role, personal_email, official_email,
            mobile_number, alternate_mobile, employment_status
     FROM employees
     WHERE employee_id IN (${placeholders})`,
    employeeIds
  );

  const employeeMap = new Map(employeeRows.map((row) => [String(row.employee_id), row]));

  return normalizedAssignments.map((employee) => {
    const employeeId = String(employee.employee_id).trim();
    // Always prefer LIVE DB data over potentially-stale JSON blob data
    const dbEmployee = employeeMap.get(employeeId) || {};
    const first_name   = dbEmployee.first_name   ?? employee.first_name   ?? null;
    const last_name    = dbEmployee.last_name    ?? employee.last_name    ?? null;
    const profile_photo   = dbEmployee.profile_photo   ?? employee.profile_photo   ?? null;
    const mobile_number   = dbEmployee.mobile_number   ?? employee.mobile_number   ?? null;
    const alternate_mobile = dbEmployee.alternate_mobile ?? employee.alternate_mobile ?? null;
    const designation  = dbEmployee.designation  ?? dbEmployee.role ?? employee.designation ?? employee.role ?? null;
    const employee_code = dbEmployee.employee_code ?? employee.employee_code ?? null;
    const employment_status = dbEmployee.employment_status ?? employee.employment_status ?? 'Active';
    const email = dbEmployee.personal_email ?? dbEmployee.official_email ?? employee.personal_email ?? employee.email ?? null;
    const full_name = [first_name, last_name].filter(Boolean).join(' ').trim() || null;

    // For assigned_date: prefer blob value, then fall back to the parent row timestamps
    const assigned_date = employee.assigned_date || rowAssignedDate || rowCreatedAt || null;

    return {
      ...employee,
      employee_id: employeeId,
      employee_code,
      first_name,
      last_name,
      full_name,
      employee_name: full_name || employee.employee_name || null,
      profile_photo,
      personal_email: email,
      email,
      mobile_number,
      alternate_mobile,
      designation,
      role: employee.role ?? designation ?? null,
      employment_status,
      status: employee.status || 'Assigned',
      assigned_date,
    };
  });
}

async function assignEmployeesToProject({ project_id, employee_ids = [], status = 'Assigned', assigned_date = null, created_by = null, updated_by = null }) {
  const db = getDB();
  const payloads = serializeEmployeeAssignments(employee_ids);
  if (!payloads.length) throw new Error('No employees selected');

  const actor = created_by || updated_by || null;
  const finalAssignedDate = assigned_date || getCurrentDateTimeString();
  const [existingRows] = await db.execute('SELECT id, employee_ids, status, assigned_date FROM project_assignments WHERE project_id = ? LIMIT 1', [project_id]);
  const existingAssignments = existingRows[0] ? parseEmployeeAssignments(existingRows[0].employee_ids) : [];
  const existingEmployeeIds = existingAssignments.map((employee) => String(employee.employee_id).trim()).filter(Boolean);
  const blockedEmployees = await validateAssignmentLimitForEmployees(
    payloads.map((emp) => emp.employee_id),
    project_id,
    existingEmployeeIds
  );
  if (blockedEmployees.length) {
    throw new Error('This employee is already assigned to the maximum of 3 active projects.');
  }

  // ── Enrich payloads with LIVE DB employee data before storing ──────────────
  // This prevents saving null names into the blob when the frontend only sends employee_id
  const uniqueIds = [...new Set(payloads.map(p => p.employee_id).filter(Boolean))];
  let dbEmployeeMap = new Map();
  if (uniqueIds.length) {
    const placeholders = uniqueIds.map(() => '?').join(', ');
    const [empRows] = await db.execute(
      `SELECT employee_id, employee_code, first_name, last_name, profile_photo,
              designation, role, personal_email, official_email,
              mobile_number, alternate_mobile, employment_status
       FROM employees WHERE employee_id IN (${placeholders})`,
      uniqueIds
    );
    dbEmployeeMap = new Map(empRows.map(r => [String(r.employee_id), r]));
  }

  const enrichedPayloads = payloads.map(emp => {
    const db_emp = dbEmployeeMap.get(String(emp.employee_id)) || {};
    const first_name  = db_emp.first_name  || emp.first_name  || null;
    const last_name   = db_emp.last_name   || emp.last_name   || null;
    const full_name   = [first_name, last_name].filter(Boolean).join(' ').trim() || null;
    return {
      ...emp,
      employee_code:  db_emp.employee_code  || emp.employee_code  || null,
      first_name,
      last_name,
      full_name,
      profile_photo:  db_emp.profile_photo  || emp.profile_photo  || null,
      mobile_number:  db_emp.mobile_number  || emp.mobile_number  || null,
      alternate_mobile: db_emp.alternate_mobile || emp.alternate_mobile || null,
      personal_email: db_emp.personal_email || db_emp.official_email || emp.personal_email || null,
      designation:    db_emp.designation    || db_emp.role || emp.designation || null,
      employment_status: db_emp.employment_status || emp.employment_status || 'Active',
      assigned_date:  emp.assigned_date || finalAssignedDate,
    };
  });

  if (existingRows[0]) {
    const existingAssignments = parseEmployeeAssignments(existingRows[0].employee_ids);
    const existingIds = new Set(existingAssignments.map(e => String(e.employee_id)));
    
    // Add new employees if they aren't already there
    enrichedPayloads.forEach(emp => {
      if (!existingIds.has(String(emp.employee_id))) {
        existingAssignments.push(emp);
      }
    });

    await db.execute(
      'UPDATE project_assignments SET employee_ids = ?, status = ?, assigned_date = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE project_id = ?',
      [JSON.stringify(existingAssignments), status || existingRows[0].status || 'Assigned', finalAssignedDate, actor, project_id]
    );
    return { inserted: enrichedPayloads.length, existing: existingRows.length, employeeCount: existingAssignments.length, employees: existingAssignments };
  }

  await db.execute(
    'INSERT INTO project_assignments (project_id, employee_ids, status, assigned_date, created_at, updated_at, created_by, updated_by) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?)',
    [project_id, JSON.stringify(enrichedPayloads), status || 'Assigned', finalAssignedDate, actor, actor]
  );

  return { inserted: 1, existing: 0, employeeCount: enrichedPayloads.length, employees: enrichedPayloads };
}

async function syncProjectAssignments({ project_id, employee_ids = [], status = 'Assigned', assigned_date = null, updated_by = null }) {
  const db = getDB();
  const payloads = serializeEmployeeAssignments(employee_ids);
  const actor = updated_by || null;
  const finalAssignedDate = assigned_date || getCurrentDateTimeString();
  const [existingRows] = await db.execute('SELECT id, employee_ids, assigned_date FROM project_assignments WHERE project_id = ? LIMIT 1', [project_id]);
  const existingAssignments = existingRows[0] ? parseEmployeeAssignments(existingRows[0].employee_ids) : [];
  const existingEmployeeIds = existingAssignments.map((employee) => String(employee.employee_id).trim()).filter(Boolean);
  const blockedEmployees = await validateAssignmentLimitForEmployees(
    payloads.map((emp) => emp.employee_id),
    project_id,
    existingEmployeeIds
  );
  if (blockedEmployees.length) {
    throw new Error('This employee is already assigned to the maximum of 3 active projects.');
  }

  const enrichedPayloads = payloads.map(emp => ({
    ...emp,
    assigned_date: emp.assigned_date || existingRows[0]?.assigned_date || finalAssignedDate,
  }));

  if (existingRows[0]) {
    const updatedAssignedDate = assigned_date ?? existingRows[0].assigned_date ?? finalAssignedDate;
    await db.execute(
      'UPDATE project_assignments SET employee_ids = ?, status = ?, assigned_date = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE project_id = ?',
      [JSON.stringify(enrichedPayloads), status || 'Assigned', updatedAssignedDate, actor, project_id]
    );
    return { updated: true, employeeCount: enrichedPayloads.length, employees: enrichedPayloads };
  }

  await db.execute(
    'INSERT INTO project_assignments (project_id, employee_ids, status, assigned_date, created_at, updated_at, created_by, updated_by) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?)',
    [project_id, JSON.stringify(enrichedPayloads), status || 'Assigned', finalAssignedDate, actor, actor]
  );

  return { updated: true, employeeCount: enrichedPayloads.length, employees: enrichedPayloads };
}

async function removeProjectAssignments(project_id, employee_ids = [], updated_by = null) {
  const db = getDB();
  const payloads = serializeEmployeeAssignments(employee_ids);
  const idsToRemove = new Set(payloads.map((emp) => emp.employee_id).filter(Boolean));

  const [existingRows] = await db.execute('SELECT id, employee_ids, status FROM project_assignments WHERE project_id = ? LIMIT 1', [project_id]);
  if (!existingRows[0]) return 0;

  const currentAssignments = parseEmployeeAssignments(existingRows[0].employee_ids);
  const remainingAssignments = currentAssignments.filter((employee) => !idsToRemove.has(employee.employee_id));
  const removedCount = currentAssignments.length - remainingAssignments.length;
  if (!removedCount) return 0;

  const newStatus = remainingAssignments.length === 0 ? 'Removed' : existingRows[0].status || 'Assigned';
  await db.execute(
    'UPDATE project_assignments SET employee_ids = ?, status = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE project_id = ?',
    [JSON.stringify(remainingAssignments), newStatus, updated_by, project_id]
  );
  return removedCount;
}

async function updateProjectAssignmentEntry({ project_id, assignment_id, employee_id, updates = {}, updated_by = null }) {
  const db = getDB();
  const [rows] = await db.execute('SELECT employee_ids FROM project_assignments WHERE id = ? AND project_id = ? LIMIT 1', [assignment_id, project_id]);
  const assignmentRow = rows[0];
  if (!assignmentRow) return null;

  const currentAssignments = parseEmployeeAssignments(assignmentRow.employee_ids);
  const normalizedEmployeeId = employee_id ? String(employee_id).trim() : '';
  if (!normalizedEmployeeId) return null;

  const currentEmployeeIds = currentAssignments.map((employee) => String(employee.employee_id).trim()).filter(Boolean);
  if (!currentEmployeeIds.includes(normalizedEmployeeId)) {
    const blockedCount = await getActiveProjectCountForEmployee(normalizedEmployeeId, project_id);
    if (blockedCount >= 3) {
      throw new Error('This employee is already assigned to the maximum of 3 active projects.');
    }
  }

  let updated = false;
  const updatedAssignments = currentAssignments.map((employee) => {
    if (employee.employee_id !== normalizedEmployeeId) return employee;
    updated = true;
    return {
      ...employee,
      ...updates,
    };
  });

  if (!updated) return null;

  await db.execute(
    'UPDATE project_assignments SET employee_ids = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE id = ?',
    [JSON.stringify(updatedAssignments), updated_by, assignment_id]
  );

  return updatedAssignments.find((employee) => employee.employee_id === normalizedEmployeeId) || null;
}

async function listAssignmentsByProject(project_id) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT id, project_id, employee_ids, status, assigned_date, created_at, updated_at, created_by, updated_by
     FROM project_assignments
     WHERE project_id = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [project_id]
  );

  const assignmentRow = rows[0];
  if (!assignmentRow) return [];

  // Pass the row-level assigned_date and created_at so hydrateEmployeeAssignments
  // can use them as fallback when the individual employee blob entry lacks assigned_date
  const employees = await hydrateEmployeeAssignments(
    parseEmployeeAssignments(assignmentRow.employee_ids),
    assignmentRow.assigned_date,
    assignmentRow.created_at
  );

  return employees.map((employee) => ({
    ...employee,
    employee_id: employee.employee_id,
    status: employee.status || assignmentRow.status || 'Assigned',
    assigned_date: employee.assigned_date || assignmentRow.assigned_date || assignmentRow.created_at || null,
  }));
}

async function listAllAssignments({ page = 1, limit = 15, search = '', role = '' } = {}) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT pa.id, pa.project_id, pa.employee_ids, pa.status, pa.assigned_date, pa.created_at, pa.updated_at,
            p.uuid AS project_uuid, p.project_name, p.current_status, p.client_name, p.project_manager, p.total_project_cost, p.overall_progress, p.project_start_date, p.estimated_completion_date
     FROM project_assignments pa
     JOIN projects p ON pa.project_id = p.id
     ORDER BY pa.created_at DESC`
  );

  const resolvedRows = await Promise.all(rows.map(async (row) => {
    const employees = await hydrateEmployeeAssignments(
      parseEmployeeAssignments(row.employee_ids),
      row.assigned_date,
      row.created_at
    );
    return employees.map((employee) => ({
      ...row,
      ...employee,
      employee_id: employee.employee_id,
      employee_name: employee.employee_name || employee.full_name || null,
      full_name: employee.full_name || null,
      first_name: employee.first_name || null,
      last_name: employee.last_name || null,
      designation: employee.designation || null,
      email: employee.email || null,
      employee_code: employee.employee_code || null,
      status: employee.status || row.status || 'Assigned',
      assigned_date: employee.assigned_date || row.assigned_date || row.created_at || null,
    }));
  }));

  const assignments = resolvedRows.flat();
  const normalizedSearch = (search || '').trim().toLowerCase();
  const normalizedRole = (role || '').trim();

  const filteredAssignments = assignments.filter((assignment) => {
    if (normalizedRole && assignment.role !== normalizedRole) {
      return false;
    }
    if (!normalizedSearch) {
      return true;
    }
    const haystack = [
      assignment.project_name,
      assignment.first_name,
      assignment.last_name,
      assignment.full_name,
      assignment.employee_code,
      assignment.employee_name,
      assignment.email,
      assignment.personal_email,
      assignment.designation,
      assignment.role,
    ].filter(Boolean).join(' ').toLowerCase();
    return haystack.includes(normalizedSearch);
  });

  const total = filteredAssignments.length;
  const start = (page - 1) * limit;
  const rowsPage = filteredAssignments.slice(start, start + limit);
  return { rows: rowsPage, total };
}

async function searchEmployeesForProject({ search = '', status = 'Active' }) {
  const db = getDB();
  const term = `%${(search || '').trim()}%`;
  const [rows] = await db.execute(
    `SELECT e.employee_id, e.employee_code, e.first_name, e.last_name, e.profile_photo, e.designation, e.role, e.personal_email, e.official_email, e.mobile_number, e.alternate_mobile, e.employment_status,
      COALESCE(
        (SELECT COUNT(DISTINCT pa.project_id)
         FROM project_assignments pa
         JOIN projects p ON p.id = pa.project_id
         WHERE JSON_CONTAINS(pa.employee_ids, JSON_OBJECT('employee_id', CAST(e.employee_id AS CHAR)), '$')
           AND p.current_status NOT IN ('Completed','Cancelled','Inactive')
        ), 0
      ) AS active_project_count
     FROM employees e
     WHERE e.employment_status = ?
       AND (
         LOWER(CONCAT(e.first_name, ' ', COALESCE(e.last_name, ''))) LIKE LOWER(?) OR
         LOWER(e.employee_id) LIKE LOWER(?) OR
         LOWER(e.employee_code) LIKE LOWER(?) OR
         LOWER(e.personal_email) LIKE LOWER(?) OR
         LOWER(e.official_email) LIKE LOWER(?) OR
         LOWER(e.mobile_number) LIKE LOWER(?) OR
         LOWER(e.designation) LIKE LOWER(?) OR
         LOWER(e.role) LIKE LOWER(?)
       )
       AND (
         SELECT COUNT(DISTINCT pa2.project_id)
         FROM project_assignments pa2
         JOIN projects p2 ON p2.id = pa2.project_id
         WHERE JSON_CONTAINS(pa2.employee_ids, JSON_OBJECT('employee_id', CAST(e.employee_id AS CHAR)), '$')
           AND p2.current_status NOT IN ('Completed','Cancelled','Inactive')
       ) < 3
     ORDER BY e.first_name, e.last_name
     LIMIT 50`,
    [status, term, term, term, term, term, term, term, term]
  );
  return rows;
}

module.exports = {
  assignEmployeesToProject,
  syncProjectAssignments,
  removeProjectAssignments,
  updateProjectAssignmentEntry,
  listAssignmentsByProject,
  listAllAssignments,
  searchEmployeesForProject,
};
