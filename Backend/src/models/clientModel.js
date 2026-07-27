const { getDB } = require("../config/db");

// ─── Public field projection ───────────────────────────────────────────────────
const clientFields = [
  "id", "uuid", "company_name", "client_name", "email", "phone_number",
  "contact_person", "client_status", "service_type", "business_name",
  "business_type", "requirement", "notes_summary", "follow_up_date",
  "follow_up_time", "next_follow_up_date", "next_follow_up_time",
  "discussion_summary", "follow_up_status", "reminder",
  "created_at", "updated_at", "created_by", "updated_by",
].join(", ");

const docFields = [
  "id", "uuid", "client_id", "document_type", "document_name",
  "file_name", "file_path", "file_size", "mime_type", "description",
  "created_at", "updated_at", "created_by", "updated_by",
].join(", ");

// ─── Clients ──────────────────────────────────────────────────────────────────

async function createClient(data) {
  const db = getDB();
  const [result] = await db.execute(
    `INSERT INTO clients
      (uuid, company_name, client_name, email, phone_number, contact_person,
       client_status, service_type, business_name, business_type, requirement,
       notes_summary, follow_up_date, follow_up_time, next_follow_up_date,
       next_follow_up_time, discussion_summary, follow_up_status, reminder,
       created_by, updated_by)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      data.uuid,
      data.company_name || null,
      data.client_name,
      data.email || null,
      data.phone_number || null,
      data.contact_person || null,
      data.client_status || "Lead",
      data.service_type || null,
      data.business_name || null,
      data.business_type || null,
      data.requirement || null,
      data.notes_summary || null,
      data.follow_up_date || null,
      data.follow_up_time || null,
      data.next_follow_up_date || null,
      data.next_follow_up_time || null,
      data.discussion_summary || null,
      data.follow_up_status || "Pending",
      data.reminder ? 1 : 0,
      data.created_by || null,
      data.updated_by || null,
    ]
  );
  return findClientById(result.insertId);
}

async function findClientById(id) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT ${clientFields} FROM clients WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function findClientByUUID(uuid) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT ${clientFields} FROM clients WHERE uuid = ? LIMIT 1`,
    [uuid]
  );
  return rows[0] || null;
}

async function listClients({ page, limit, search, client_status, service_type, follow_up_status, follow_up_date }) {
  const db = getDB();
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];

  if (search) {
    conditions.push(
      "(client_name LIKE ? OR company_name LIKE ? OR email LIKE ? OR phone_number LIKE ? OR contact_person LIKE ?)"
    );
    const term = `%${search}%`;
    values.push(term, term, term, term, term);
  }
  if (client_status) { conditions.push("client_status = ?"); values.push(client_status); }
  if (service_type)  { conditions.push("service_type = ?");  values.push(service_type);  }
  if (follow_up_status) { conditions.push("follow_up_status = ?"); values.push(follow_up_status); }
  if (follow_up_date) { conditions.push("DATE(follow_up_date) = ?"); values.push(follow_up_date); }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const [rows] = await db.execute(
    `SELECT ${clientFields} FROM clients ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );
  const [countRows] = await db.execute(
    `SELECT COUNT(*) AS total FROM clients ${where}`,
    values
  );
  return { rows, total: countRows[0].total };
}

async function updateClient(uuid, updates) {
  const db = getDB();
  const fields = Object.keys(updates);
  if (!fields.length) return findClientByUUID(uuid);
  const assignments = fields.map((f) => `${f} = ?`).join(", ");
  const values = [...fields.map((f) => updates[f]), uuid];
  await db.execute(`UPDATE clients SET ${assignments} WHERE uuid = ?`, values);
  return findClientByUUID(uuid);
}

async function deleteClient(uuid) {
  const db = getDB();
  await db.execute("DELETE FROM clients WHERE uuid = ?", [uuid]);
}

// ─── Client Documents ─────────────────────────────────────────────────────────

async function createDocument(data) {
  const db = getDB();
  const [result] = await db.execute(
    `INSERT INTO client_documents
      (uuid, client_id, document_type, document_name, file_name, file_path,
       file_size, mime_type, description, created_by, updated_by)
     VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
    [
      data.uuid,
      data.client_id,
      data.document_type,
      data.document_name,
      data.file_name,
      data.file_path,
      data.file_size,
      data.mime_type,
      data.description || null,
      data.created_by || null,
      data.updated_by || null,
    ]
  );
  return findDocumentById(result.insertId);
}

async function findDocumentById(id) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT ${docFields} FROM client_documents WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function findDocumentByUUID(uuid) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT ${docFields} FROM client_documents WHERE uuid = ? LIMIT 1`,
    [uuid]
  );
  return rows[0] || null;
}

async function listDocumentsByClientId(clientId) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT ${docFields} FROM client_documents WHERE client_id = ? ORDER BY created_at DESC`,
    [clientId]
  );
  return rows;
}

async function deleteDocument(uuid) {
  const db = getDB();
  const doc = await findDocumentByUUID(uuid);
  await db.execute("DELETE FROM client_documents WHERE uuid = ?", [uuid]);
  return doc;
}

// ─── Client History ──────────────────────────────────────────────────────────

async function createHistoryRecord(data) {
  const db = getDB();
  const { client_id, event_type, old_status, new_status, discussion_summary, created_by } = data;
  const [result] = await db.execute(
    `INSERT INTO client_history (client_id, event_type, old_status, new_status, discussion_summary, created_by)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [client_id, event_type, old_status || null, new_status || null, discussion_summary || null, created_by || null]
  );
  return result.insertId;
}

async function listHistoryByClientId(clientId) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT * FROM client_history WHERE client_id = ? ORDER BY created_at DESC`,
    [clientId]
  );
  return rows;
}

module.exports = {
  createClient, findClientById, findClientByUUID, listClients, updateClient, deleteClient,
  createDocument, findDocumentById, findDocumentByUUID, listDocumentsByClientId, deleteDocument,
  createHistoryRecord, listHistoryByClientId,
};
