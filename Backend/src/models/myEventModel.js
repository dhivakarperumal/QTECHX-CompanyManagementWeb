const { getDB } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

function normalizeEventValue(value) {
  if (value === undefined || value === null) {
    return null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '') {
      return null;
    }

    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
      try {
        return JSON.stringify(JSON.parse(trimmed));
      } catch (err) {
        return trimmed;
      }
    }

    return trimmed;
  }

  if (Array.isArray(value) || (value && typeof value === 'object')) {
    return JSON.stringify(value);
  }

  return value;
}

function parseJsonField(value) {
  if (Array.isArray(value) || (value && typeof value === 'object')) {
    return value;
  }
  if (typeof value !== 'string') {
    return value;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }
  if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
    try {
      return JSON.parse(trimmed);
    } catch (err) {
      return value;
    }
  }
  return value;
}

function normalizeMyEventRow(row) {
  if (!row) return null;
  const normalized = { ...row };
  if (normalized.id !== undefined && normalized._id === undefined) {
    normalized._id = normalized.id;
  }

  normalized.checklistItems = parseJsonField(normalized.checklistItems) || [];
  normalized.tags = parseJsonField(normalized.tags) || [];
  normalized.attachments = parseJsonField(normalized.attachments) || [];

  return normalized;
}

async function createMyEvent(event) {
  const db = getDB();
  const payload = { ...event };

  payload.id = uuidv4();
  delete payload._id;

  const fields = Object.keys(payload).filter((k) => payload[k] !== undefined);
  const values = fields.map((k) => normalizeEventValue(payload[k]));
  const placeholders = fields.map(() => '?').join(', ');

  try {
    await db.execute(`INSERT INTO myevents (${fields.join(', ')}) VALUES (${placeholders})`, values);
  } catch (error) {
    console.error('MyEvent insert failed:', error);
    throw error;
  }

  const [rows] = await db.execute('SELECT * FROM myevents WHERE id = ? LIMIT 1', [payload.id]);
  return normalizeMyEventRow(rows[0] || null);
}

async function getAllMyEvents() {
  const db = getDB();
  const [rows] = await db.execute('SELECT * FROM myevents ORDER BY created_at DESC');
  return rows.map(normalizeMyEventRow);
}

async function getMyEventById(id) {
  const db = getDB();
  const [rows] = await db.execute('SELECT * FROM myevents WHERE id = ? LIMIT 1', [id]);
  return normalizeMyEventRow(rows[0] || null);
}

async function updateMyEvent(id, updates) {
  const db = getDB();
  const payload = { ...updates };
  delete payload._id;

  const fields = Object.keys(payload).filter((k) => payload[k] !== undefined);
  if (!fields.length) return getMyEventById(id);

  const values = fields.map((k) => normalizeEventValue(payload[k]));
  const assignments = fields.map((f) => `${f} = ?`).join(', ');
  values.push(id);

  try {
    await db.execute(`UPDATE myevents SET ${assignments} WHERE id = ?`, values);
  } catch (error) {
    console.error('MyEvent update failed:', error);
    throw error;
  }

  return getMyEventById(id);
}

async function deleteMyEvent(id) {
  const db = getDB();
  await db.execute('DELETE FROM myevents WHERE id = ?', [id]);
  return true;
}

module.exports = {
  createMyEvent,
  getAllMyEvents,
  getMyEventById,
  updateMyEvent,
  deleteMyEvent,
};
