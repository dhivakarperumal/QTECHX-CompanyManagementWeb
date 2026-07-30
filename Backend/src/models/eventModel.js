const { getDB } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

function normalizeEventValue(value) {
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

function normalizeEventRow(row) {
  if (!row) return null;
  const normalized = { ...row };
  if (normalized.id !== undefined && normalized._id === undefined) {
    normalized._id = normalized.id;
  }

  normalized.participants = parseJsonField(normalized.participants) || [];
  normalized.departments = parseJsonField(normalized.departments) || [];
  normalized.teams = parseJsonField(normalized.teams) || [];
  normalized.guestEmailAddresses = parseJsonField(normalized.guestEmailAddresses) || [];
  normalized.attachments = parseJsonField(normalized.attachments) || [];
  normalized.comments = parseJsonField(normalized.comments) || [];
  normalized.activity = parseJsonField(normalized.activity) || [];

  return normalized;
}

async function createEvent(event) {
  const db = getDB();
  const payload = { ...event };

  if (!payload.id && !payload._id) {
    payload.id = uuidv4();
  } else if (payload._id && !payload.id) {
    payload.id = payload._id;
  }
  delete payload._id;

  const fields = Object.keys(payload).filter((k) => payload[k] !== undefined);
  const values = fields.map((k) => normalizeEventValue(payload[k]));
  const placeholders = fields.map(() => '?').join(', ');

  await db.execute(`INSERT INTO events (${fields.join(', ')}) VALUES (${placeholders})`, values);
  const [rows] = await db.execute('SELECT * FROM events WHERE id = ? LIMIT 1', [payload.id]);
  return normalizeEventRow(rows[0] || null);
}

async function getAllEvents() {
  const db = getDB();
  const [rows] = await db.execute('SELECT * FROM events ORDER BY created_at DESC');
  return rows.map(normalizeEventRow);
}

async function getEventById(id) {
  const db = getDB();
  const [rows] = await db.execute('SELECT * FROM events WHERE id = ? LIMIT 1', [id]);
  return normalizeEventRow(rows[0] || null);
}

async function updateEvent(id, updates) {
  const db = getDB();
  const payload = { ...updates };
  delete payload._id;

  const fields = Object.keys(payload).filter((k) => payload[k] !== undefined);
  if (!fields.length) return getEventById(id);

  const values = fields.map((k) => normalizeEventValue(payload[k]));
  const assignments = fields.map((f) => `${f} = ?`).join(', ');
  values.push(id);

  await db.execute(`UPDATE events SET ${assignments} WHERE id = ?`, values);
  return getEventById(id);
}

async function deleteEvent(id) {
  const db = getDB();
  await db.execute('DELETE FROM events WHERE id = ?', [id]);
  return true;
}

module.exports = { createEvent, getAllEvents, getEventById, updateEvent, deleteEvent };
