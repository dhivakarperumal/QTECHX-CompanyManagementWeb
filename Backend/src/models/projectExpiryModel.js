const { getDB } = require('../config/db');

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildListWhereClause({ search, project_id, client_id, expiry_type, renewal_status, status, from_date, to_date, expiring_today, next_7_days, next_30_days, expired }) {
  const conditions = ['e.deleted_at IS NULL'];
  const values = [];

  if (search) {
    conditions.push('(p.project_name LIKE ? OR c.client_name LIKE ? OR c.company_name LIKE ? OR e.service_name LIKE ? OR e.provider_name LIKE ? OR e.invoice_number LIKE ?)');
    const term = `%${search}%`;
    values.push(term, term, term, term, term, term);
  }
  if (project_id) {
    conditions.push('e.project_id = ?');
    values.push(project_id);
  }
  if (client_id) {
    conditions.push('e.client_id = ?');
    values.push(client_id);
  }
  if (expiry_type) {
    conditions.push('e.expiry_type = ?');
    values.push(expiry_type);
  }
  if (renewal_status) {
    conditions.push('e.renewal_status = ?');
    values.push(renewal_status);
  }
  if (status) {
    conditions.push('e.status = ?');
    values.push(status);
  }
  if (from_date) {
    conditions.push('e.expiry_date >= ?');
    values.push(from_date);
  }
  if (to_date) {
    conditions.push('e.expiry_date <= ?');
    values.push(to_date);
  }
  if (expiring_today === true || expiring_today === 'true') {
    conditions.push('e.expiry_date = CURDATE()');
  }
  if (next_7_days === true || next_7_days === 'true') {
    conditions.push('e.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)');
  }
  if (next_30_days === true || next_30_days === 'true') {
    conditions.push('e.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)');
  }
  if (expired === true || expired === 'true') {
    conditions.push('e.expiry_date < CURDATE()');
  }


  return { where: `WHERE ${conditions.join(' AND ')}`, values };
}

async function createExpiryRecord(payload = {}) {
  const db = getDB();
  const [result] = await db.execute(
    `INSERT INTO project_expiry_management (
      project_id, client_id, expiry_type, project_type, service_name, provider_name, plan_name,
      purchase_date, start_date, expiry_date, renewal_cost, payment_status, payment_method,
      invoice_number, invoice_file, auto_renew, renewal_status, last_renewal_date,
      next_reminder_date, reminder_sent, notes, internal_notes, status,
      assigned_employee_id, assigned_employee_name, created_by, updated_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
    [
      payload.project_id || null,
      payload.client_id || null,
      payload.expiry_type || null,
      payload.project_type || null,
      payload.service_name || null,
      payload.provider_name || null,
      payload.plan_name || null,
      payload.purchase_date || null,
      payload.start_date || null,
      payload.expiry_date || null,
      toNumber(payload.renewal_cost),
      payload.payment_status || 'Pending',
      payload.payment_method || null,
      payload.invoice_number || null,
      payload.invoice_file || null,
      payload.auto_renew ? 1 : 0,
      payload.renewal_status || 'Active',
      payload.last_renewal_date || null,
      payload.next_reminder_date || null,
      payload.reminder_sent ? 1 : 0,
      payload.notes || null,
      payload.internal_notes || null,
      payload.status || 'Active',
      payload.assigned_employee_id || null,
      payload.assigned_employee_name || null,
      payload.created_by || null,
      payload.updated_by || null,
    ]
  );
  return getExpiryRecordById(result.insertId);
}

async function listExpiryRecords(options = {}) {
  const db = getDB();
  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.min(200, Math.max(1, Number(options.limit) || 20));
  const offset = (page - 1) * limit;
  const { where, values } = buildListWhereClause(options);

  const [rows] = await db.execute(
    `SELECT e.*, p.project_name, p.project_code, p.project_manager, p.domain_name, c.client_name, c.company_name
     FROM project_expiry_management e
     LEFT JOIN projects p ON p.id = e.project_id
     LEFT JOIN clients c ON c.id = e.client_id
     ${where}
     ORDER BY e.expiry_date ASC, e.created_at DESC
     LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );
  const [countRows] = await db.execute(
    `SELECT COUNT(*) AS total FROM project_expiry_management e ${where}`,
    values
  );
  return { rows, total: countRows[0].total };
}

async function getExpiryRecordById(id) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT e.*, p.project_name, p.project_code, p.project_manager, p.domain_name, c.client_name, c.company_name
     FROM project_expiry_management e
     LEFT JOIN projects p ON p.id = e.project_id
     LEFT JOIN clients c ON c.id = e.client_id
     WHERE e.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function updateExpiryRecord(id, updates = {}) {
  const db = getDB();
  const fields = Object.keys(updates);
  if (!fields.length) return getExpiryRecordById(id);
  const assignments = fields.map((field) => `${field} = ?`).join(', ');
  const values = fields.map((field) => updates[field]);
  await db.execute(`UPDATE project_expiry_management SET ${assignments}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [...values, id]);
  return getExpiryRecordById(id);
}

async function softDeleteExpiryRecord(id, updatedBy) {
  const db = getDB();
  await db.execute(
    'UPDATE project_expiry_management SET deleted_at = CURRENT_TIMESTAMP, status = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    ['Inactive', updatedBy || null, id]
  );
  return getExpiryRecordById(id);
}

async function getExpiryStats() {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT COUNT(*) AS total_projects,
            SUM(CASE WHEN deleted_at IS NULL THEN 1 ELSE 0 END) AS active_records,
            SUM(CASE WHEN deleted_at IS NULL AND expiry_date = CURDATE() THEN 1 ELSE 0 END) AS expiring_today,
            SUM(CASE WHEN deleted_at IS NULL AND expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) AS expiring_7_days,
            SUM(CASE WHEN deleted_at IS NULL AND expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) AS expiring_30_days,
            SUM(CASE WHEN deleted_at IS NULL AND expiry_date < CURDATE() THEN 1 ELSE 0 END) AS expired_projects
     FROM project_expiry_management`
  );
  return rows[0] || null;
}

async function createRenewalHistory(payload = {}) {
  const db = getDB();
  const [result] = await db.execute(
    `INSERT INTO project_renewal_history (
      project_expiry_id, project_id, renewal_type, old_expiry_date, new_expiry_date,
      renewal_amount, tax_amount, total_amount, payment_method, payment_status,
      invoice_number, invoice_file, renewed_by, renewal_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
    [
      payload.project_expiry_id || null,
      payload.project_id || null,
      payload.renewal_type || null,
      payload.old_expiry_date || null,
      payload.new_expiry_date || null,
      toNumber(payload.renewal_amount),
      toNumber(payload.tax_amount),
      toNumber(payload.total_amount),
      payload.payment_method || null,
      payload.payment_status || 'Pending',
      payload.invoice_number || null,
      payload.invoice_file || null,
      payload.renewed_by || null,
      payload.renewal_notes || null,
    ]
  );
  return result.insertId;
}

async function getRenewalHistoryByExpiryId(projectExpiryId) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT * FROM project_renewal_history WHERE project_expiry_id = ? ORDER BY renewed_at DESC`,
    [projectExpiryId]
  );
  return rows;
}

async function createReminderRecord(payload = {}) {
  const db = getDB();
  const [result] = await db.execute(
    `INSERT INTO project_expiry_reminders (
      project_expiry_id, reminder_type, reminder_days_before, reminder_status,
      scheduled_for, sent_at, acknowledged_at, notes, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
    [
      payload.project_expiry_id || null,
      payload.reminder_type || 'Internal',
      payload.reminder_days_before || 0,
      payload.reminder_status || 'Pending',
      payload.scheduled_for || null,
      payload.sent_at || null,
      payload.acknowledged_at || null,
      payload.notes || null,
      payload.created_by || null,
    ]
  );
  return result.insertId;
}

async function getReminderRecordsByExpiryId(projectExpiryId) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT * FROM project_expiry_reminders WHERE project_expiry_id = ? ORDER BY created_at DESC`,
    [projectExpiryId]
  );
  return rows;
}

module.exports = {
  createExpiryRecord,
  listExpiryRecords,
  getExpiryRecordById,
  updateExpiryRecord,
  softDeleteExpiryRecord,
  getExpiryStats,
  createRenewalHistory,
  getRenewalHistoryByExpiryId,
  createReminderRecord,
  getReminderRecordsByExpiryId,
};
