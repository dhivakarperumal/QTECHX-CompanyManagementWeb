const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");

const {
  createClient,
  findClientByUUID,
  listClients,
  updateClient,
  deleteClient,
  createDocument,
  findDocumentByUUID,
  listDocumentsByClientId,
  deleteDocument,
  createHistoryRecord,
  listHistoryByClientId,
} = require("../models/clientModel");

// ─── Multer Upload Configuration ─────────────────────────────────────────────
const UPLOAD_DIR = path.join(__dirname, "../../../uploads/client_documents");
const ALLOWED_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, DOC, DOCX, XLS, XLSX files are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE } });

// Export the multer upload middleware for use in the router
const uploadSingle = upload.single("document");

// ─── Helpers ──────────────────────────────────────────────────────────────────
const CLIENT_STATUSES  = ["Active", "Inactive", "Lead", "Prospect", "Converted", "Closed"];
const SERVICE_TYPES    = ["Website", "Mobile App", "Web App", "Software", "Other"];
const FOLLOW_UP_STATUSES = ["Pending", "Completed", "Rescheduled", "Cancelled"];
const DOCUMENT_TYPES   = ["Requirement Document", "Project Quotation"];

function ok(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, ...data });
}
function fail(res, message, statusCode = 500, error = undefined) {
  return res.status(statusCode).json({ success: false, message, ...(error ? { error } : {}) });
}

// ─── Client Controllers ───────────────────────────────────────────────────────

/** POST /api/clients */
async function createClientHandler(req, res) {
  try {
    const {
      company_name, client_name, email, phone_number, contact_person,
      client_status, service_type, business_name, business_type, requirement,
      notes_summary, follow_up_date, follow_up_time, next_follow_up_date,
      next_follow_up_time, discussion_summary, follow_up_status, reminder,
    } = req.body;

    if (!client_name || !client_name.trim()) {
      return fail(res, "Client name is required", 400);
    }
    if (client_status && !CLIENT_STATUSES.includes(client_status)) {
      return fail(res, `Invalid client_status. Allowed: ${CLIENT_STATUSES.join(", ")}`, 400);
    }
    if (service_type && !SERVICE_TYPES.includes(service_type)) {
      return fail(res, `Invalid service_type. Allowed: ${SERVICE_TYPES.join(", ")}`, 400);
    }
    if (follow_up_status && !FOLLOW_UP_STATUSES.includes(follow_up_status)) {
      return fail(res, `Invalid follow_up_status. Allowed: ${FOLLOW_UP_STATUSES.join(", ")}`, 400);
    }

    const actor = req.user?.user_id || "SYSTEM";
    const client = await createClient({
      uuid: uuidv4(),
      company_name, client_name, email, phone_number, contact_person,
      client_status, service_type, business_name, business_type, requirement,
      notes_summary, follow_up_date, follow_up_time, next_follow_up_date,
      next_follow_up_time, discussion_summary, follow_up_status,
      reminder: reminder === true || reminder === "true" || reminder === 1,
      created_by: actor,
      updated_by: actor,
    });

    await createHistoryRecord({
      client_id: client.id,
      event_type: "Client Created",
      new_status: client.client_status,
      discussion_summary: "Initial client creation",
      created_by: actor,
    });

    return ok(res, { message: "Client created successfully", data: client }, 201);
  } catch (err) {
    console.error("createClientHandler:", err);
    return fail(res, "Client creation failed", 500, err.message);
  }
}

/** GET /api/clients */
async function getAllClientsHandler(req, res) {
  try {
    const page  = Math.max(1, parseInt(req.query.page, 10)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const { search, client_status, service_type, follow_up_status, follow_up_date } = req.query;

    const result = await listClients({ page, limit, search, client_status, service_type, follow_up_status, follow_up_date });
    return ok(res, {
      data: result.rows,
      pagination: { page, limit, total: result.total, pages: Math.ceil(result.total / limit) },
    });
  } catch (err) {
    console.error("getAllClientsHandler:", err);
    return fail(res, "Failed to retrieve clients", 500, err.message);
  }
}

/** GET /api/clients/:id */
async function getClientByIdHandler(req, res) {
  try {
    const client = await findClientByUUID(req.params.id);
    if (!client) return fail(res, "Client not found", 404);
    const documents = await listDocumentsByClientId(client.id);
    let history = await listHistoryByClientId(client.id);
    
    // Inject synthetic "Client Created" event for old clients missing it
    if (!history.some(h => h.event_type === "Client Created")) {
      history.push({
        id: 'synthetic-creation',
        event_type: "Client Created",
        new_status: client.client_status,
        discussion_summary: client.requirement || "Initial client creation",
        created_at: client.created_at,
        created_by: client.created_by
      });
    }

    // Sort by created_at DESC (newest first)
    history.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return ok(res, { data: { ...client, documents, history } });
  } catch (err) {
    console.error("getClientByIdHandler:", err);
    return fail(res, "Failed to retrieve client", 500, err.message);
  }
}

/** PUT /api/clients/:id */
async function updateClientHandler(req, res) {
  try {
    const existing = await findClientByUUID(req.params.id);
    if (!existing) return fail(res, "Client not found", 404);

    const allowed = [
      "company_name", "client_name", "email", "phone_number", "contact_person",
      "client_status", "service_type", "business_name", "business_type",
      "requirement", "notes_summary", "follow_up_date", "follow_up_time",
      "next_follow_up_date", "next_follow_up_time", "discussion_summary",
      "follow_up_status", "reminder",
    ];
    const updates = {};
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (updates.client_status && !CLIENT_STATUSES.includes(updates.client_status)) {
      return fail(res, `Invalid client_status. Allowed: ${CLIENT_STATUSES.join(", ")}`, 400);
    }
    if (updates.service_type && !SERVICE_TYPES.includes(updates.service_type)) {
      return fail(res, `Invalid service_type. Allowed: ${SERVICE_TYPES.join(", ")}`, 400);
    }
    if (updates.follow_up_status && !FOLLOW_UP_STATUSES.includes(updates.follow_up_status)) {
      return fail(res, `Invalid follow_up_status. Allowed: ${FOLLOW_UP_STATUSES.join(", ")}`, 400);
    }
    if (updates.reminder !== undefined) {
      updates.reminder = updates.reminder === true || updates.reminder === "true" || updates.reminder === 1 ? 1 : 0;
    }

    updates.updated_by = req.user?.user_id || "SYSTEM";
    const client = await updateClient(req.params.id, updates);

    // Log history if status or discussion changed
    if (
      (updates.client_status && updates.client_status !== existing.client_status) ||
      (updates.discussion_summary && updates.discussion_summary !== existing.discussion_summary)
    ) {
      await createHistoryRecord({
        client_id: existing.id,
        event_type: "Profile Updated",
        old_status: existing.client_status,
        new_status: updates.client_status || existing.client_status,
        discussion_summary: updates.discussion_summary || null,
        created_by: updates.updated_by,
      });
    }

    return ok(res, { message: "Client updated successfully", data: client });
  } catch (err) {
    console.error("updateClientHandler:", err);
    return fail(res, "Failed to update client", 500, err.message);
  }
}

/** DELETE /api/clients/:id */
async function deleteClientHandler(req, res) {
  try {
    const existing = await findClientByUUID(req.params.id);
    if (!existing) return fail(res, "Client not found", 404);
    // Delete associated documents from disk
    const docs = await listDocumentsByClientId(existing.id);
    for (const doc of docs) {
      if (doc.file_path && fs.existsSync(doc.file_path)) {
        fs.unlinkSync(doc.file_path);
      }
    }
    await deleteClient(req.params.id);
    return ok(res, { message: "Client deleted successfully" });
  } catch (err) {
    console.error("deleteClientHandler:", err);
    return fail(res, "Failed to delete client", 500, err.message);
  }
}

// ─── History Controllers ────────────────────────────────────────────────────────

/** POST /api/clients/:id/history */
async function addClientHistoryHandler(req, res) {
  try {
    const existing = await findClientByUUID(req.params.id);
    if (!existing) return fail(res, "Client not found", 404);

    const { new_status, discussion_summary, next_follow_up_date, next_follow_up_time } = req.body;
    
    if (new_status && !CLIENT_STATUSES.includes(new_status)) {
      return fail(res, `Invalid client_status. Allowed: ${CLIENT_STATUSES.join(", ")}`, 400);
    }

    const actor = req.user?.user_id || "SYSTEM";
    const updates = { updated_by: actor };
    let eventType = "Follow-up Update";

    if (new_status && new_status !== existing.client_status) {
      updates.client_status = new_status;
      eventType = discussion_summary ? "Status Change & Follow-up" : "Status Change";
    }
    
    if (discussion_summary) updates.discussion_summary = discussion_summary;
    if (next_follow_up_date !== undefined) updates.next_follow_up_date = next_follow_up_date || null;
    if (next_follow_up_time !== undefined) updates.next_follow_up_time = next_follow_up_time || null;

    // Update the main client record if there are changes
    if (Object.keys(updates).length > 1) {
      await updateClient(existing.uuid, updates);
    }

    // Insert history record
    await createHistoryRecord({
      client_id: existing.id,
      event_type: eventType,
      old_status: existing.client_status,
      new_status: new_status || existing.client_status,
      discussion_summary: discussion_summary || null,
      created_by: actor,
    });

    return ok(res, { message: "History updated successfully" }, 201);
  } catch (err) {
    console.error("addClientHistoryHandler:", err);
    return fail(res, "Failed to add history", 500, err.message);
  }
}

// ─── Document Controllers ─────────────────────────────────────────────────────

/** POST /api/clients/:id/documents */
function uploadDocumentHandler(req, res) {
  uploadSingle(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return fail(res, "File size exceeds 10 MB limit", 400);
      }
      return fail(res, err.message, 400);
    } else if (err) {
      return fail(res, err.message, 400);
    }

    try {
      if (!req.file) return fail(res, "No file uploaded", 400);

      const client = await findClientByUUID(req.params.id);
      if (!client) {
        fs.unlinkSync(req.file.path);
        return fail(res, "Client not found", 404);
      }

      const { document_type, document_name, description } = req.body;
      if (!DOCUMENT_TYPES.includes(document_type)) {
        fs.unlinkSync(req.file.path);
        return fail(res, `Invalid document_type. Allowed: ${DOCUMENT_TYPES.join(", ")}`, 400);
      }
      if (!document_name || !document_name.trim()) {
        fs.unlinkSync(req.file.path);
        return fail(res, "document_name is required", 400);
      }

      const actor = req.user?.user_id || "SYSTEM";
      const doc = await createDocument({
        uuid: uuidv4(),
        client_id: client.id,
        document_type,
        document_name: document_name.trim(),
        file_name: req.file.originalname,
        file_path: req.file.path,
        file_size: req.file.size,
        mime_type: req.file.mimetype,
        description: description || null,
        created_by: actor,
        updated_by: actor,
      });

      return ok(res, { message: "Document uploaded successfully", data: doc }, 201);
    } catch (uploadErr) {
      console.error("uploadDocumentHandler:", uploadErr);
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return fail(res, "Failed to upload document", 500, uploadErr.message);
    }
  });
}

/** GET /api/clients/:id/documents */
async function getDocumentsHandler(req, res) {
  try {
    const client = await findClientByUUID(req.params.id);
    if (!client) return fail(res, "Client not found", 404);
    const documents = await listDocumentsByClientId(client.id);
    return ok(res, { data: documents });
  } catch (err) {
    console.error("getDocumentsHandler:", err);
    return fail(res, "Failed to retrieve documents", 500, err.message);
  }
}

/** DELETE /api/clients/:id/documents/:docId */
async function deleteDocumentHandler(req, res) {
  try {
    const doc = await findDocumentByUUID(req.params.docId);
    if (!doc) return fail(res, "Document not found", 404);
    if (doc.file_path && fs.existsSync(doc.file_path)) {
      fs.unlinkSync(doc.file_path);
    }
    await deleteDocument(req.params.docId);
    return ok(res, { message: "Document deleted successfully" });
  } catch (err) {
    console.error("deleteDocumentHandler:", err);
    return fail(res, "Failed to delete document", 500, err.message);
  }
}

module.exports = {
  createClientHandler,
  getAllClientsHandler,
  getClientByIdHandler,
  updateClientHandler,
  deleteClientHandler,
  uploadDocumentHandler,
  getDocumentsHandler,
  deleteDocumentHandler,
  addClientHistoryHandler,
};
