const { v4: uuidv4 } = require("uuid");
const { getDB } = require("../config/db");

const projectFields = [
  "id",
  "uuid",
  "project_name",
  "category",
  "image",
  "description",
  "url",
  "client_id",
  "client_name",
  "client_details",
  "status",
  "technologies",
  "completion_date",
  "created_by",
  "updated_by",
  "created_at",
  "updated_at",
].join(", ");

function jsonValue(value) {
  if (value === undefined || value === null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      const parsed = JSON.parse(trimmed);
      return typeof parsed === "object" ? parsed : trimmed;
    } catch {
      return trimmed;
    }
  }
  if (Array.isArray(value) || typeof value === "object") {
    return value;
  }
  return value;
}

function normalizeRow(row) {
  if (!row) return null;
  const normalized = { ...row };

  if (normalized.client_details) {
    if (typeof normalized.client_details === "string") {
      try {
        normalized.client_details = JSON.parse(normalized.client_details);
      } catch {
        normalized.client_details = {};
      }
    }
  } else {
    normalized.client_details = {};
  }

  if (normalized.technologies) {
    if (typeof normalized.technologies === "string") {
      try {
        normalized.technologies = JSON.parse(normalized.technologies);
      } catch {
        normalized.technologies = [];
      }
    }
  } else {
    normalized.technologies = [];
  }

  return normalized;
}

async function getAllCompletedProjects({ search, category, status, clientId } = {}) {
  const db = getDB();
  const conditions = [];
  const values = [];

  if (search) {
    conditions.push("(project_name LIKE ? OR category LIKE ? OR client_name LIKE ? OR description LIKE ?)");
    const term = `%${search}%`;
    values.push(term, term, term, term);
  }

  if (category) {
    conditions.push("category = ?");
    values.push(category);
  }

  if (status) {
    conditions.push("status = ?");
    values.push(status);
  }

  if (clientId) {
    conditions.push("client_id = ?");
    values.push(clientId);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `SELECT ${projectFields} FROM completed_projects ${whereClause} ORDER BY created_at DESC`;
  const [rows] = await db.execute(query, values);
  return rows.map(normalizeRow);
}

async function getCompletedProjectById(id) {
  const db = getDB();
  const [rows] = await db.execute(`SELECT ${projectFields} FROM completed_projects WHERE id = ? LIMIT 1`, [id]);
  return normalizeRow(rows[0] || null);
}

async function getCompletedProjectByUUID(uuid) {
  const db = getDB();
  const [rows] = await db.execute(`SELECT ${projectFields} FROM completed_projects WHERE uuid = ? LIMIT 1`, [uuid]);
  return normalizeRow(rows[0] || null);
}

async function createCompletedProject(data) {
  const db = getDB();
  const uuid = data.uuid || uuidv4();

  const payload = {
    uuid,
    project_name: data.project_name || data.projectName || data.name,
    category: data.category || null,
    image: data.image || null,
    description: data.description || null,
    url: data.url || data.project_url || null,
    client_id: data.client_id || data.clientId || null,
    client_name: data.client_name || data.clientName || null,
    client_details: data.client_details ? JSON.stringify(jsonValue(data.client_details)) : null,
    status: data.status || "Completed",
    technologies: data.technologies ? JSON.stringify(jsonValue(data.technologies)) : null,
    completion_date: data.completion_date || null,
    created_by: data.created_by || null,
    updated_by: data.updated_by || null,
  };

  if (!payload.project_name) {
    throw new Error("Project name is required");
  }

  const fields = Object.keys(payload);
  const values = fields.map((field) => payload[field]);
  const placeholders = fields.map(() => "?").join(", ");

  const [result] = await db.execute(
    `INSERT INTO completed_projects (${fields.join(", ")}) VALUES (${placeholders})`,
    values
  );

  return getCompletedProjectById(result.insertId);
}

async function updateCompletedProject(idOrUuid, data) {
  const db = getDB();
  const isNumeric = !Number.isNaN(Number(idOrUuid));

  const updates = {};
  if (data.project_name !== undefined || data.projectName !== undefined || data.name !== undefined) {
    updates.project_name = data.project_name || data.projectName || data.name;
  }
  if (data.category !== undefined) updates.category = data.category;
  if (data.image !== undefined) updates.image = data.image;
  if (data.description !== undefined) updates.description = data.description;
  if (data.url !== undefined || data.project_url !== undefined) {
    updates.url = data.url !== undefined ? data.url : data.project_url;
  }
  if (data.client_id !== undefined || data.clientId !== undefined) {
    updates.client_id = data.client_id !== undefined ? data.client_id : data.clientId;
  }
  if (data.client_name !== undefined || data.clientName !== undefined) {
    updates.client_name = data.client_name !== undefined ? data.client_name : data.clientName;
  }
  if (data.client_details !== undefined) {
    updates.client_details = data.client_details ? JSON.stringify(jsonValue(data.client_details)) : null;
  }
  if (data.status !== undefined) updates.status = data.status || "Completed";
  if (data.technologies !== undefined) {
    updates.technologies = data.technologies ? JSON.stringify(jsonValue(data.technologies)) : null;
  }
  if (data.completion_date !== undefined) updates.completion_date = data.completion_date;
  if (data.updated_by !== undefined) updates.updated_by = data.updated_by;

  const fields = Object.keys(updates);
  if (!fields.length) {
    return isNumeric ? getCompletedProjectById(idOrUuid) : getCompletedProjectByUUID(idOrUuid);
  }

  const assignments = fields.map((field) => `${field} = ?`).join(", ");
  const values = [...fields.map((field) => updates[field]), idOrUuid];

  const whereClause = isNumeric ? "id = ?" : "uuid = ?";
  await db.execute(`UPDATE completed_projects SET ${assignments} WHERE ${whereClause}`, values);

  return isNumeric ? getCompletedProjectById(idOrUuid) : getCompletedProjectByUUID(idOrUuid);
}

async function deleteCompletedProject(idOrUuid) {
  const db = getDB();
  const isNumeric = !Number.isNaN(Number(idOrUuid));
  const whereClause = isNumeric ? "id = ?" : "uuid = ?";
  const [result] = await db.execute(`DELETE FROM completed_projects WHERE ${whereClause}`, [idOrUuid]);
  return result.affectedRows > 0;
}

module.exports = {
  getAllCompletedProjects,
  getCompletedProjectById,
  getCompletedProjectByUUID,
  createCompletedProject,
  updateCompletedProject,
  deleteCompletedProject,
};
