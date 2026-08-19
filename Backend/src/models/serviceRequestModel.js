const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../config/db');

async function createServiceRequest(data) {
  const db = getDB();
  const uuid = uuidv4();
  const [result] = await db.execute(
    `INSERT INTO service_requests
      (uuid, service_id, service_title, name, email, phone, message)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      uuid,
      data.service_id || null,
      data.service_title,
      data.name,
      data.email,
      data.phone || null,
      data.message || null,
    ]
  );

  const [rows] = await db.execute(
    'SELECT * FROM service_requests WHERE id = ? LIMIT 1',
    [result.insertId]
  );
  return rows[0];
}

async function listServiceRequests({ search = '', status = '' } = {}) {
  const db = getDB();
  const conditions = [];
  const values = [];

  if (status) {
    conditions.push('status = ?');
    values.push(status);
  }
  if (search) {
    conditions.push('(service_title LIKE ? OR name LIKE ? OR email LIKE ? OR phone LIKE ?)');
    const term = `%${search}%`;
    values.push(term, term, term, term);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await db.execute(
    `SELECT * FROM service_requests ${where} ORDER BY created_at DESC`,
    values
  );
  return rows;
}

module.exports = { createServiceRequest, listServiceRequests };
