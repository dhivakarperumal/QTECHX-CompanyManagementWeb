const { getDB } = require('../config/db');

const taskFields = [
  't.id',
  't.uuid',
  't.project_id',
  'p.uuid AS project_uuid',
  'p.project_name',
  't.module_name',
  't.task_name',
  't.description',
  't.category',
  't.parent_task_uuid',
  't.assigned_to',
  "CONCAT_WS(' ', a.first_name, a.last_name) AS assigned_to_name",
  'a.employee_code AS assigned_to_code',
  't.assigned_by',
  "CONCAT_WS(' ', b.first_name, b.last_name) AS assigned_by_name",
  't.team',
  't.assignment_date',
  't.start_date',
  't.due_date',
  't.completion_date',
  't.estimated_hours',
  't.actual_hours',
  't.time_spent',
  't.remaining_hours',
  't.priority',
  't.status',
  't.progress',
  't.is_overdue',
  't.attachments',
  't.comments',
  't.internal_notes',
  't.client_notes',
  't.deleted',
  't.active',
  't.created_at',
  't.updated_at',
  't.created_by',
  't.updated_by',
].join(', ');

function buildTaskWhereClauses({ search, status, project_id, assigned_to }) {
  const conditions = ['t.deleted = 0'];
  const values = [];

  if (search) {
    conditions.push(
      `(t.task_name LIKE ? OR t.module_name LIKE ? OR t.description LIKE ? OR p.project_name LIKE ? OR t.category LIKE ?)`
    );
    const term = `%${search}%`;
    values.push(term, term, term, term, term);
  }
  if (status) {
    conditions.push('t.status = ?');
    values.push(status);
  }
  if (project_id) {
    conditions.push('t.project_id = ?');
    values.push(project_id);
  }
  if (assigned_to) {
    conditions.push('t.assigned_to = ?');
    values.push(assigned_to);
  }

  return { where: conditions.length ? `WHERE ${conditions.join(' AND ')}` : '', values };
}

async function createTask(data) {
  const db = getDB();
  const fields = Object.keys(data).filter((key) => data[key] !== undefined);
  const values = fields.map((key) => data[key]);
  const placeholders = fields.map(() => '?').join(', ');
  await db.execute(
    `INSERT INTO tasks (${fields.join(', ')}) VALUES (${placeholders})`,
    values,
  );
  return findTaskByUUID(data.uuid);
}

async function findTaskByUUID(uuid) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT ${taskFields} FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      LEFT JOIN employees a ON t.assigned_to = a.employee_id
      LEFT JOIN employees b ON t.assigned_by = b.employee_id
      WHERE t.uuid = ? LIMIT 1`,
    [uuid],
  );
  return rows[0] || null;
}

async function listTasks({ page = 1, limit = 50, search, status, project_id, assigned_to } = {}) {
  const db = getDB();
  const offset = (page - 1) * limit;
  const { where, values } = buildTaskWhereClauses({ search, status, project_id, assigned_to });
  const [rows] = await db.execute(
    `SELECT ${taskFields} FROM tasks t
       LEFT JOIN projects p ON t.project_id = p.id
       LEFT JOIN employees a ON t.assigned_to = a.employee_id
       LEFT JOIN employees b ON t.assigned_by = b.employee_id
       ${where}
       ORDER BY t.created_at DESC
       LIMIT ? OFFSET ?`,
    [...values, limit, offset],
  );
  const [countRows] = await db.execute(
    `SELECT COUNT(*) AS total FROM tasks t
       LEFT JOIN projects p ON t.project_id = p.id
       ${where}`,
    values,
  );
  return { rows, total: countRows[0]?.total || 0 };
}

async function updateTask(uuid, updates) {
  const db = getDB();
  const fields = Object.keys(updates).filter((key) => updates[key] !== undefined);
  if (!fields.length) return findTaskByUUID(uuid);
  const assignments = fields.map((field) => `${field} = ?`).join(', ');
  const values = [...fields.map((field) => updates[field]), uuid];
  await db.execute(`UPDATE tasks SET ${assignments} WHERE uuid = ?`, values);
  return findTaskByUUID(uuid);
}

async function deleteTask(uuid) {
  const db = getDB();
  await db.execute('UPDATE tasks SET deleted = 1, active = 0 WHERE uuid = ?', [uuid]);
  return true;
}

module.exports = { createTask, findTaskByUUID, listTasks, updateTask, deleteTask };
