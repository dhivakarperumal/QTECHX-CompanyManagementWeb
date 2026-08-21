const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../config/db');

async function createContactRequest(data) {
  const db = getDB();
  const uuid = uuidv4();
  const [result] = await db.execute(
    `INSERT INTO contact_requests
      (uuid, name, email, mobile, subject, message, status, admin_notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      uuid,
      String(data.name || '').trim(),
      String(data.email || '').trim(),
      data.mobile ? String(data.mobile).trim() : (data.phone ? String(data.phone).trim() : null),
      String(data.subject || '').trim(),
      String(data.message || '').trim(),
      data.status || 'New',
      data.admin_notes || null,
    ]
  );

  const [rows] = await db.execute(
    'SELECT * FROM contact_requests WHERE id = ? LIMIT 1',
    [result.insertId]
  );
  return rows[0];
}

async function listContactRequests({ search = '', status = '' } = {}) {
  const db = getDB();
  const conditions = [];
  const values = [];

  if (status) {
    conditions.push('status = ?');
    values.push(status);
  }
  if (search) {
    conditions.push('(name LIKE ? OR email LIKE ? OR mobile LIKE ? OR subject LIKE ? OR message LIKE ?)');
    const term = `%${search}%`;
    values.push(term, term, term, term, term);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await db.execute(
    `SELECT * FROM contact_requests ${where} ORDER BY created_at DESC`,
    values
  );
  return rows;
}

async function getContactRequestByUuid(uuid) {
  const db = getDB();
  const [rows] = await db.execute(
    'SELECT * FROM contact_requests WHERE uuid = ? LIMIT 1',
    [uuid]
  );
  return rows[0] || null;
}

async function updateContactRequestStatus(uuid, status, admin_notes = undefined) {
  const db = getDB();
  const fields = ['status = ?'];
  const values = [status];

  if (admin_notes !== undefined) {
    fields.push('admin_notes = ?');
    values.push(admin_notes);
  }

  values.push(uuid);

  const [result] = await db.execute(
    `UPDATE contact_requests SET ${fields.join(', ')} WHERE uuid = ?`,
    values
  );

  if (result.affectedRows === 0) return null;
  return getContactRequestByUuid(uuid);
}

async function deleteContactRequest(uuid) {
  const db = getDB();
  const [result] = await db.execute(
    'DELETE FROM contact_requests WHERE uuid = ?',
    [uuid]
  );
  return result.affectedRows > 0;
}

module.exports = {
  createContactRequest,
  listContactRequests,
  getContactRequestByUuid,
  updateContactRequestStatus,
  deleteContactRequest,
};
