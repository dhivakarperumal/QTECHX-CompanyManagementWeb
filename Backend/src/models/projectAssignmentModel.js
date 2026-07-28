const { getDB } = require('../config/db');

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
    assigned_date: item.assigned_date ?? null,
    assigned_by: item.assigned_by ?? null,
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
    } catch {
      return [];
    }
  }

  return [];
}

async function assignEmployeesToProject({ project_id, employee_ids = [], status = 'Assigned', assigned_date = null, created_by = null, updated_by = null, assigned_by = null }) {
  const db = getDB();
  const payloads = serializeEmployeeAssignments(employee_ids);
  if (!payloads.length) throw new Error('No employees selected');

  const actor = created_by || updated_by || assigned_by || null;
  const finalAssignedDate = assigned_date || new Date().toISOString().split('T')[0];
  const [existingRows] = await db.execute('SELECT id, employee_ids, status, assigned_date FROM project_assignments WHERE project_id = ? LIMIT 1', [project_id]);

  const enrichedPayloads = payloads.map(emp => ({
    ...emp,
    assigned_date: emp.assigned_date || finalAssignedDate,
    assigned_by: emp.assigned_by || assigned_by || actor || null,
  }));

  if (existingRows[0]) {
    await db.execute(
      'UPDATE project_assignments SET employee_ids = ?, status = ?, assigned_date = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?, assigned_by = ? WHERE project_id = ?',
      [JSON.stringify(enrichedPayloads), status || existingRows[0].status || 'Assigned', finalAssignedDate, actor, assigned_by || actor || null, project_id]
    );
    return { inserted: 0, existing: 1, employeeCount: enrichedPayloads.length, employees: enrichedPayloads };
  }

  await db.execute(
    'INSERT INTO project_assignments (project_id, employee_ids, status, assigned_date, created_at, updated_at, created_by, updated_by, assigned_by) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?, ?)',
    [project_id, JSON.stringify(enrichedPayloads), status || 'Assigned', finalAssignedDate, actor, actor, assigned_by || actor || null]
  );

  return { inserted: 1, existing: 0, employeeCount: enrichedPayloads.length, employees: enrichedPayloads };
}

async function syncProjectAssignments({ project_id, employee_ids = [], status = 'Assigned', assigned_date = null, updated_by = null, assigned_by = null }) {
  const db = getDB();
  const payloads = serializeEmployeeAssignments(employee_ids);
  const actor = updated_by || assigned_by || null;
  const finalAssignedDate = assigned_date || new Date().toISOString().split('T')[0];
  const [existingRows] = await db.execute('SELECT id, assigned_date FROM project_assignments WHERE project_id = ? LIMIT 1', [project_id]);

  const enrichedPayloads = payloads.map(emp => ({
    ...emp,
    assigned_date: emp.assigned_date || existingRows[0]?.assigned_date || finalAssignedDate,
    assigned_by: emp.assigned_by || assigned_by || actor || null,
  }));

  if (existingRows[0]) {
    await db.execute(
      'UPDATE project_assignments SET employee_ids = ?, status = ?, assigned_date = COALESCE(?, assigned_date), updated_at = CURRENT_TIMESTAMP, updated_by = ?, assigned_by = ? WHERE project_id = ?',
      [JSON.stringify(enrichedPayloads), status || 'Assigned', assigned_date || null, actor, assigned_by || actor || null, project_id]
    );
    return { updated: true, employeeCount: enrichedPayloads.length, employees: enrichedPayloads };
  }

  await db.execute(
    'INSERT INTO project_assignments (project_id, employee_ids, status, assigned_date, created_at, updated_at, created_by, updated_by, assigned_by) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?, ?)',
    [project_id, JSON.stringify(enrichedPayloads), status || 'Assigned', finalAssignedDate, actor, actor, assigned_by || actor || null]
  );

  return { updated: true, employeeCount: enrichedPayloads.length, employees: enrichedPayloads };
}

async function removeProjectAssignments(project_id, employee_ids = [], updated_by = null, assigned_by = null) {
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
    'UPDATE project_assignments SET employee_ids = ?, status = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?, assigned_by = ? WHERE project_id = ?',
    [JSON.stringify(remainingAssignments), newStatus, updated_by, assigned_by, project_id]
  );
  return removedCount;
}

async function updateProjectAssignmentEntry({ project_id, assignment_id, employee_id, updates = {}, updated_by = null, assigned_by = null }) {
  const db = getDB();
  const [rows] = await db.execute('SELECT employee_ids FROM project_assignments WHERE id = ? AND project_id = ? LIMIT 1', [assignment_id, project_id]);
  const assignmentRow = rows[0];
  if (!assignmentRow) return null;

  const currentAssignments = parseEmployeeAssignments(assignmentRow.employee_ids);
  const normalizedEmployeeId = employee_id ? String(employee_id).trim() : '';
  if (!normalizedEmployeeId) return null;

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
    'UPDATE project_assignments SET employee_ids = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?, assigned_by = ? WHERE id = ?',
    [JSON.stringify(updatedAssignments), updated_by, assigned_by, assignment_id]
  );

  return updatedAssignments.find((employee) => employee.employee_id === normalizedEmployeeId) || null;
}

async function listAssignmentsByProject(project_id) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT id, project_id, employee_ids, status, assigned_date, created_at, updated_at, created_by, updated_by, assigned_by
     FROM project_assignments
     WHERE project_id = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [project_id]
  );

  const assignmentRow = rows[0];
  if (!assignmentRow) return [];

  return parseEmployeeAssignments(assignmentRow.employee_ids).map((employee) => ({
    ...employee,
    employee_id: employee.employee_id,
    status: employee.status || assignmentRow.status || 'Assigned',
    assigned_date: employee.assigned_date || assignmentRow.assigned_date || assignmentRow.created_at || null,
    assigned_by: employee.assigned_by || assignmentRow.assigned_by || null,
  }));
}

async function listAllAssignments() {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT pa.id, pa.project_id, pa.employee_ids, pa.status, pa.assigned_date, pa.created_at, pa.updated_at, pa.assigned_by,
            p.uuid AS project_uuid, p.project_name, p.current_status
     FROM project_assignments pa
     JOIN projects p ON pa.project_id = p.id
     ORDER BY pa.created_at DESC
     LIMIT 200`
  );

  return rows.flatMap((row) => parseEmployeeAssignments(row.employee_ids).map((employee) => ({
    ...row,
    employee_id: employee.employee_id,
    employee_name: employee.employee_name || null,
    designation: employee.designation || null,
    email: employee.email || null,
    employee_code: employee.employee_code || null,
    status: employee.status || row.status || 'Assigned',
    assigned_date: employee.assigned_date || row.assigned_date || row.created_at || null,
    assigned_by: employee.assigned_by || row.assigned_by || null,
  })));
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

module.exports = {
  assignEmployeesToProject,
  syncProjectAssignments,
  removeProjectAssignments,
  updateProjectAssignmentEntry,
  listAssignmentsByProject,
  listAllAssignments,
  searchEmployeesForProject,
};
