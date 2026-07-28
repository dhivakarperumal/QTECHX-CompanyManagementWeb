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
  if (typeof taskId === 'string' && taskId.length === 36) {
    const [rows] = await db.execute('SELECT * FROM tasks WHERE uuid = ? AND deleted = 0 LIMIT 1', [taskId]);
    return rows[0] || null;
  }
  const numericId = Number(taskId);
  if (!Number.isInteger(numericId) || numericId <= 0) return null;
  const [rows] = await db.execute('SELECT * FROM tasks WHERE id = ? AND deleted = 0 LIMIT 1', [numericId]);
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

function buildTaskDetails(task) {
  return {
    task_id: task.id,
    task_uuid: task.uuid,
    task_code: task.task_code || `TASK-${task.id}`,
    task_name: task.task_name || task.module_name || null,
    priority: task.priority || 'Medium',
    status: task.status || 'Pending',
    start_date: task.start_date || null,
    due_date: task.due_date || null,
    estimated_hours: Number(task.estimated_hours || 0),
    progress: Number(task.progress || 0),
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
  if (!columnNames.has('created_at')) {
    addColumnStatements.push('ADD COLUMN created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP AFTER assigned_date');
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
    `SELECT id, project_id, employee_id, employee_details, task_details, task_count, status, assigned_by, assigned_date, created_at, updated_at, created_by, updated_by
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
    `SELECT id, project_id, employee_id, employee_details, task_details, task_count, status, assigned_by, assigned_date, created_at, updated_at, created_by, updated_by
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

async function assignTaskToEmployee({ project_id, employee_id, task_id, assigned_by = null, assigned_date = null, created_by = null, updated_by = null, status = null }) {
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
  const taskDetailsEntry = buildTaskDetails(task);
  const finalAssignedDate = assigned_date || task.assignment_date || getCurrentDateTimeString();
  const [existingRows] = await db.execute(
    'SELECT id, task_details, task_count, status, assigned_date FROM employee_task_assignments WHERE project_id = ? AND employee_id = ? LIMIT 1',
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
    const finalStatus = status || task.status || existing.status || 'Assigned';
    const finalUpdatedAssignedDate = existing.assigned_date || finalAssignedDate;

    await db.execute(
      'UPDATE employee_task_assignments SET task_details = ?, task_count = ?, status = ?, assigned_by = ?, assigned_date = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE id = ?',
      [JSON.stringify(existingTasks), updatedTaskCount, finalStatus, assigned_by, finalUpdatedAssignedDate, updated_by, existing.id]
    );

    await db.execute(
      'UPDATE tasks SET assigned_to = ?, assignment_date = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE id = ?',
      [employee.employee_id, finalAssignedDate, updated_by, task.id]
    );

    return {
      project_id: Number(project_id),
      employee_id: employee.employee_id,
      task_count: updatedTaskCount,
      employee_details: employeeDetails,
      task_details: existingTasks,
      status: finalStatus,
      assigned_by,
      assigned_date: finalUpdatedAssignedDate,
      updated_at: getCurrentDateTimeString(),
      updated_by,
    };
  }

  const initialStatus = status || task.status || 'Assigned';
  await db.execute(
    `INSERT INTO employee_task_assignments
      (project_id, employee_id, employee_details, task_details, task_count, status, assigned_by, assigned_date, created_at, updated_at, created_by, updated_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?)`,
    [project_id, employee.employee_id, JSON.stringify(employeeDetails), JSON.stringify([taskDetailsEntry]), 1, initialStatus, assigned_by, finalAssignedDate, created_by, updated_by]
  );

  await db.execute(
    'UPDATE tasks SET assigned_to = ?, assignment_date = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE id = ?',
    [employee.employee_id, finalAssignedDate, updated_by, task.id]
  );

  return {
    project_id: Number(project_id),
    employee_id: employee.employee_id,
    task_count: 1,
    employee_details: employeeDetails,
    task_details: [taskDetailsEntry],
    status: initialStatus,
    assigned_by,
    assigned_date: finalAssignedDate,
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
