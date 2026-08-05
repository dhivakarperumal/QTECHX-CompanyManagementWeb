const { getDB } = require('../config/db');
const { findProjectById, findProjectByUUID } = require('./projectModel');

function getCurrentDateTimeString() {
  return new Date().toISOString().slice(0, 19).replace('T', ' ');
}

function parseJSON(value, fallback = []) {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : fallback;
    } catch (err) {
      return fallback;
    }
  }
  return fallback;
}

async function findEmployeeById(employeeId) {
  const db = getDB();
  if (!employeeId) return null;
  const [rows] = await db.execute(
    `SELECT employee_id, employee_code, first_name, last_name, profile_photo,
            designation, role, personal_email, official_email,
            mobile_number, employment_status, team_lead
     FROM employees
     WHERE employee_id = ? OR CAST(id AS CHAR) = ?
     LIMIT 1`,
    [employeeId, employeeId]
  );
  return rows[0] || null;
}

async function findTaskByIdOrUUID(taskId) {
  const db = getDB();
  if (!taskId) return null;

  const richSelect = `
    SELECT
      t.*,
      p.uuid      AS project_uuid,
      p.project_name,
      CONCAT_WS(' ', a.first_name, a.last_name) AS assigned_to_name,
      a.employee_code                            AS assigned_to_code,
      CONCAT_WS(' ', b.first_name, b.last_name) AS assigned_by_name
    FROM tasks t
    LEFT JOIN projects  p ON t.project_id  = p.id
    LEFT JOIN employees a ON t.assigned_to = a.employee_id
    LEFT JOIN employees b ON t.assigned_by = b.employee_id
  `;

  if (typeof taskId === 'string' && taskId.length === 36) {
    const [rows] = await db.execute(`${richSelect} WHERE t.uuid = ? AND t.deleted = 0 LIMIT 1`, [taskId]);
    return rows[0] || null;
  }
  const numericId = Number(taskId);
  if (!Number.isInteger(numericId) || numericId <= 0) return null;
  const [rows] = await db.execute(`${richSelect} WHERE t.id = ? AND t.deleted = 0 LIMIT 1`, [numericId]);
  return rows[0] || null;
}

function buildEmployeeDetails(employee) {
  const fullName = [employee.first_name, employee.last_name].filter(Boolean).join(' ').trim() || null;
  return {
    employee_id: employee.employee_id,
    employee_code: employee.employee_code || employee.employee_id,
    employee_name: fullName,
    designation: employee.designation || employee.role || null,
    email: employee.personal_email || employee.official_email || null,
    mobile: employee.mobile_number || null,
    profile_photo: employee.profile_photo || null,
    department: employee.team_lead || employee.role || null,
    status: employee.employment_status || 'Active',
  };
}

function buildTaskDetails(task, overrides = {}) {
  return {
    // ── Identifiers ──────────────────────────────────────
    task_id:          task.id,
    task_uuid:        task.uuid,
    task_code:        task.task_code || `TASK-${task.id}`,
    // ── Names & Description ──────────────────────────────
    task_name:        task.task_name        || task.module_name || null,
    module_name:      task.module_name      || task.task_name   || null,
    description:      task.description      || null,
    category:         task.category         || null,
    // ── Project Info (available via JOIN) ────────────────
    project_id:       task.project_id       || null,
    project_uuid:     task.project_uuid     || null,
    project_name:     task.project_name     || null,
    // ── People ───────────────────────────────────────────
    team:             overrides.team !== undefined ? overrides.team : (task.team || null),
    assigned_to:      task.assigned_to       || null,
    assigned_to_name: task.assigned_to_name  || null,
    assigned_to_code: task.assigned_to_code  || null,
    assigned_by:      task.assigned_by       || null,
    assigned_by_name: task.assigned_by_name  || null,
    // ── Dates ────────────────────────────────────────────
    assignment_date:  overrides.assigned_date !== undefined
                        ? overrides.assigned_date
                        : (task.assignment_date || null),
    start_date:       overrides.start_date !== undefined
                        ? overrides.start_date
                        : (task.start_date || null),
    due_date:         overrides.due_date !== undefined
                        ? overrides.due_date
                        : (task.due_date || null),
    completion_date:  task.completion_date   || null,
    // ── Duration & Hours ─────────────────────────────────
    duration:         overrides.duration != null ? Number(overrides.duration) : null,
    estimated_hours:  Number(task.estimated_hours  || 0),
    actual_hours:     Number(task.actual_hours     || 0),
    time_spent:       Number(task.time_spent       || 0),
    remaining_hours:  Number(task.remaining_hours  || 0),
    // ── Status & Progress ────────────────────────────────
    priority:         task.priority  || 'Medium',
    status:           overrides.status || task.status || 'Pending',
    progress:         Number(task.progress   || 0),
    is_overdue:       task.is_overdue ? 1 : 0,
    active:           task.active !== undefined ? Number(task.active) : 1,
    // ── Attachments & Notes ──────────────────────────────
    attachments:      overrides.attachments !== undefined
                        ? overrides.attachments
                        : (task.attachments || null),
    comments:         task.comments       || null,
    internal_notes:   task.internal_notes || null,
    client_notes:     task.client_notes   || null,
    // ── Audit ────────────────────────────────────────────
    created_at:       task.created_at || null,
    updated_at:       task.updated_at || null,
    created_by:       task.created_by || null,
    updated_by:       task.updated_by || null,
  };
}

async function ensureEmployeeTaskAssignmentsSchema(pool) {
  const [existingTables] = await pool.execute("SHOW TABLES LIKE 'employee_task_assignments'");

  if (!existingTables.length) {
    await pool.execute(
      `CREATE TABLE IF NOT EXISTS employee_task_assignments (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        project_id INT UNSIGNED NOT NULL,
        employee_id VARCHAR(36) NOT NULL,
        employee_details JSON NOT NULL,
        task_details JSON NOT NULL,
        task_count INT UNSIGNED NOT NULL DEFAULT 0,
        status ENUM('Pending','To Do','In Progress','Review','Testing','Completed','On Hold','Cancelled','Assigned','Active','Removed') NOT NULL DEFAULT 'Assigned',
        assigned_by VARCHAR(36) NULL,
        assigned_date DATETIME NULL,
        start_date DATE NULL,
        due_date DATE NULL,
        attachments TEXT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        created_by VARCHAR(36) NULL,
        updated_by VARCHAR(36) NULL,
        PRIMARY KEY (id),
        UNIQUE KEY uq_employee_task_assignments_project_employee (project_id, employee_id),
        INDEX idx_employee_task_assignments_project (project_id),
        INDEX idx_employee_task_assignments_employee (employee_id),
        CONSTRAINT fk_employee_task_assignments_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fk_employee_task_assignments_employee FOREIGN KEY (employee_id) REFERENCES employees (employee_id) ON DELETE CASCADE ON UPDATE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    );
    return;
  }

  const [columns] = await pool.execute('SHOW COLUMNS FROM employee_task_assignments');
  const columnNames = new Set(columns.map((column) => column.Field));
  const addColumnStatements = [];

  if (!columnNames.has('employee_id')) {
    addColumnStatements.push('ADD COLUMN employee_id VARCHAR(36) NOT NULL AFTER project_id');
  }
  if (!columnNames.has('employee_details')) {
    addColumnStatements.push('ADD COLUMN employee_details JSON NOT NULL AFTER employee_id');
  }
  if (!columnNames.has('task_details')) {
    addColumnStatements.push('ADD COLUMN task_details JSON NOT NULL AFTER employee_details');
  }
  if (!columnNames.has('task_count')) {
    addColumnStatements.push('ADD COLUMN task_count INT UNSIGNED NOT NULL DEFAULT 0 AFTER task_details');
  }
  if (!columnNames.has('status')) {
    addColumnStatements.push("ADD COLUMN status ENUM('Pending','To Do','In Progress','Review','Testing','Completed','On Hold','Cancelled','Assigned','Active','Removed') NOT NULL DEFAULT 'Assigned' AFTER task_count");
  }
  if (!columnNames.has('assigned_by')) {
    addColumnStatements.push('ADD COLUMN assigned_by VARCHAR(36) NULL AFTER status');
  }
  if (!columnNames.has('assigned_date')) {
    addColumnStatements.push('ADD COLUMN assigned_date DATETIME NULL AFTER assigned_by');
  }
  if (!columnNames.has('start_date')) {
    addColumnStatements.push('ADD COLUMN start_date DATE NULL AFTER assigned_date');
  }
  if (!columnNames.has('due_date')) {
    addColumnStatements.push('ADD COLUMN due_date DATE NULL AFTER start_date');
  }
  if (!columnNames.has('attachments')) {
    addColumnStatements.push('ADD COLUMN attachments TEXT NULL AFTER due_date');
  }
  if (!columnNames.has('created_at')) {
    addColumnStatements.push('ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER attachments');
  }
  if (!columnNames.has('updated_at')) {
    addColumnStatements.push('ADD COLUMN updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at');
  }
  if (!columnNames.has('created_by')) {
    addColumnStatements.push('ADD COLUMN created_by VARCHAR(36) NULL AFTER updated_at');
  }
  if (!columnNames.has('updated_by')) {
    addColumnStatements.push('ADD COLUMN updated_by VARCHAR(36) NULL AFTER created_by');
  }

  if (addColumnStatements.length) {
    await pool.execute(`ALTER TABLE employee_task_assignments ${addColumnStatements.join(', ')}`);
  }
}

async function listEmployeeTaskAssignments({ project_id = null, employee_id = null } = {}) {
  const db = getDB();
  const conditions = [];
  const values = [];

  if (project_id) {
    conditions.push('project_id = ?');
    values.push(project_id);
  }
  if (employee_id) {
    conditions.push('employee_id = ?');
    values.push(employee_id);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await db.execute(
    `SELECT id, project_id, employee_id, employee_details, task_details, task_count, status,
            assigned_by, assigned_date, start_date, due_date,
            created_at, updated_at, created_by, updated_by
     FROM employee_task_assignments
     ${where}
     ORDER BY updated_at DESC`,
    values
  );

  return rows.map((row) => ({
    ...row,
    employee_details: parseJSON(row.employee_details, []),
    task_details: parseJSON(row.task_details, []),
  }));
}

async function findEmployeeTaskAssignment(project_id, employee_id) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT id, project_id, employee_id, employee_details, task_details, task_count, status,
            assigned_by, assigned_date, start_date, due_date,
            created_at, updated_at, created_by, updated_by
     FROM employee_task_assignments
     WHERE project_id = ? AND employee_id = ?
     LIMIT 1`,
    [project_id, employee_id]
  );

  if (!rows[0]) return null;
  return {
    ...rows[0],
    employee_details: parseJSON(rows[0].employee_details, []),
    task_details: parseJSON(rows[0].task_details, []),
  };
}

async function assignTaskToEmployee({ project_id, employee_id, task_id, assigned_by = null, assigned_date = null, start_date = null, due_date = null, duration = null, team = null, created_by = null, updated_by = null, status = null, attachments = null }) {
  const db = getDB();

  if (!project_id) throw new Error('project_id is required');
  if (!employee_id) throw new Error('employee_id is required');
  if (!task_id) throw new Error('task_id is required');

  const employee = await findEmployeeById(employee_id);
  if (!employee) throw new Error('Employee not found');

  const task = await findTaskByIdOrUUID(task_id);
  if (!task) throw new Error('Task not found');

  if (Number(task.project_id) !== Number(project_id)) {
    throw new Error('Task does not belong to the specified project');
  }

  const employeeDetails = buildEmployeeDetails(employee);
  const finalAssignedDate = assigned_date || task.assignment_date || getCurrentDateTimeString();
  const finalStartDate    = start_date || task.start_date || null;
  const finalDueDate      = due_date   || task.due_date   || null;
  const finalStatus       = status     || task.status     || 'Assigned';

  // Merge incoming attachments with any existing ones on the task row
  let finalAttachments = attachments || null;
  if (!finalAttachments && task.attachments) {
    finalAttachments = typeof task.attachments === 'string'
      ? task.attachments
      : JSON.stringify(task.attachments);
  }

  // Build task details — include attachments so the JSON snapshot is complete
  const taskDetailsEntry = buildTaskDetails(task, {
    start_date:    finalStartDate,
    due_date:      finalDueDate,
    duration,
    status:        finalStatus,
    assigned_date: finalAssignedDate,
    team,
    attachments:   finalAttachments ? JSON.parse(finalAttachments) : null,
  });

  const [existingRows] = await db.execute(
    'SELECT id, task_details, task_count, status, assigned_date, start_date, due_date FROM employee_task_assignments WHERE project_id = ? AND employee_id = ? LIMIT 1',
    [project_id, employee.employee_id]
  );

  if (existingRows[0]) {
    const existing = existingRows[0];
    const existingTasks = parseJSON(existing.task_details, []);
    const existingIds = new Set(existingTasks.map((item) => Number(item.task_id)));
    if (existingIds.has(Number(task.id))) {
      throw new Error('Task already assigned to this employee');
    }

    existingTasks.push(taskDetailsEntry);
    const updatedTaskCount = existingTasks.length;
    const resolvedStatus = status || existing.status || 'Assigned';
    const finalUpdatedAssignedDate = existing.assigned_date || finalAssignedDate;
    // Use earliest start_date and latest due_date across all tasks in this assignment
    const resolvedStartDate = existing.start_date && finalStartDate
      ? (existing.start_date < finalStartDate ? existing.start_date : finalStartDate)
      : (existing.start_date || finalStartDate);
    const resolvedDueDate = existing.due_date && finalDueDate
      ? (existing.due_date > finalDueDate ? existing.due_date : finalDueDate)
      : (existing.due_date || finalDueDate);

    await db.execute(
      `UPDATE employee_task_assignments
       SET task_details = ?, task_count = ?, status = ?, assigned_by = ?,
           assigned_date = ?, start_date = ?, due_date = ?,
           attachments = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ?
       WHERE id = ?`,
      [JSON.stringify(existingTasks), updatedTaskCount, resolvedStatus, assigned_by,
       finalUpdatedAssignedDate, resolvedStartDate, resolvedDueDate,
       attachments || existing.attachments || null, updated_by, existing.id]
    );

    await db.execute(
      `UPDATE tasks
         SET assigned_to = ?, assignment_date = ?, start_date = ?, due_date = ?,
             team = ?, attachments = ?,
             updated_at = CURRENT_TIMESTAMP, updated_by = ?
         WHERE id = ?`,
      [employee.employee_id, finalAssignedDate, finalStartDate, finalDueDate,
       team || task.team || null, finalAttachments,
       updated_by, task.id]
    );

    return {
      project_id: Number(project_id),
      employee_id: employee.employee_id,
      task_count: updatedTaskCount,
      employee_details: employeeDetails,
      task_details: existingTasks,
      status: resolvedStatus,
      assigned_by,
      assigned_date: finalUpdatedAssignedDate,
      start_date: resolvedStartDate,
      due_date: resolvedDueDate,
      updated_at: getCurrentDateTimeString(),
      updated_by,
    };
  }

  await db.execute(
    `INSERT INTO employee_task_assignments
      (project_id, employee_id, employee_details, task_details, task_count, status,
       assigned_by, assigned_date, start_date, due_date,
       attachments, created_at, updated_at, created_by, updated_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?)`,
    [
      project_id, employee.employee_id,
      JSON.stringify(employeeDetails),
      JSON.stringify([taskDetailsEntry]),
      1, finalStatus, assigned_by, finalAssignedDate,
      finalStartDate, finalDueDate,
      attachments || null, created_by, updated_by,
    ]
  );

  await db.execute(
    `UPDATE tasks
       SET assigned_to = ?, assignment_date = ?, start_date = ?, due_date = ?,
           team = ?, attachments = ?,
           updated_at = CURRENT_TIMESTAMP, updated_by = ?
       WHERE id = ?`,
    [employee.employee_id, finalAssignedDate, finalStartDate, finalDueDate,
     team || task.team || null, finalAttachments,
     updated_by, task.id]
  );

  return {
    project_id: Number(project_id),
    employee_id: employee.employee_id,
    task_count: 1,
    employee_details: employeeDetails,
    task_details: [taskDetailsEntry],
    status: finalStatus,
    assigned_by,
    assigned_date: finalAssignedDate,
    start_date: finalStartDate,
    due_date: finalDueDate,
    created_at: getCurrentDateTimeString(),
    updated_at: getCurrentDateTimeString(),
    created_by,
    updated_by,
  };
}

module.exports = {
  ensureEmployeeTaskAssignmentsSchema,
  assignTaskToEmployee,
  listEmployeeTaskAssignments,
  findEmployeeTaskAssignment,
};
