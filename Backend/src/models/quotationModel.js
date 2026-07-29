const { getDB } = require('../config/db');

const quotationFields = [
  'id', 'uuid', 'quotation_number', 'client_name', 'company_name', 'contact_person', 'email', 'phone_number',
  'project_name', 'project_description', 'scope_of_work', 'technologies_used', 'project_type', 'service_category',
  'service_type', 'quotation_date', 'valid_until', 'currency', 'payment_terms', 'delivery_timeline', 'sales_executive',
  'prepared_by', 'platform', 'subtotal', 'discount', 'additional_charges', 'tax_amount', 'round_off', 'grand_total',
  'advance_amount', 'balance_amount', 'status', 'approval_status', 'payment_status', 'notes', 'terms_conditions',
  'items', 'timeline_items', 'terms_sections', 'attachments', 'activity_logs', 'approval', 'client_message',
  'response_date', 'sent_date', 'viewed_date', 'download_count', 'email_status', 'whatsapp_status',
  'created_at', 'updated_at', 'created_by', 'updated_by', 'deleted',
].join(', ');

function parseJson(value, fallback = []) {
  if (value === null || value === undefined) return fallback;
  try {
    return typeof value === 'object' ? value : JSON.parse(value);
  } catch (err) {
    return fallback;
  }
}

async function generateQuotationNumber(db) {
  const [row] = await db.execute('SELECT MAX(id) AS maxId FROM quotations');
  const nextId = (row[0]?.maxId || 0) + 1;
  return `QT-${new Date().getFullYear()}-${String(nextId).padStart(4, '0')}`;
}

async function createQuotation(data) {
  const db = getDB();
  const quotationNumber = (data.quotation_number || '').toString().trim() || await generateQuotationNumber(db);
  const [result] = await db.execute(
    `INSERT INTO quotations (
      uuid, quotation_number, client_name, company_name, contact_person, email, phone_number,
      project_name, project_description, scope_of_work, technologies_used, project_type, service_category,
      service_type, quotation_date, valid_until, currency, payment_terms, delivery_timeline, sales_executive,
      prepared_by, platform, subtotal, discount, additional_charges, tax_amount, round_off, grand_total,
      advance_amount, balance_amount, status, approval_status, payment_status, notes, terms_conditions,
      items, timeline_items, terms_sections, attachments, activity_logs, approval, client_message,
      response_date, sent_date, viewed_date, download_count, email_status, whatsapp_status,
      created_by, updated_by, deleted
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      data.uuid,
      quotationNumber,
      data.client_name || null,
      data.company_name || null,
      data.contact_person || null,
      data.email || null,
      data.phone_number || null,
      data.project_name || null,
      data.project_description || null,
      data.scope_of_work || null,
      data.technologies_used || null,
      data.project_type || null,
      data.service_category || null,
      data.service_type || null,
      data.quotation_date || null,
      data.valid_until || null,
      data.currency || 'INR',
      data.payment_terms || null,
      data.delivery_timeline || null,
      data.sales_executive || null,
      data.prepared_by || null,
      data.platform || null,
      data.subtotal || 0,
      data.discount || 0,
      data.additional_charges || 0,
      data.tax_amount || 0,
      data.round_off || 0,
      data.grand_total || 0,
      data.advance_amount || 0,
      data.balance_amount || 0,
      data.status || 'Draft',
      data.approval_status || 'Pending',
      data.payment_status || 'Pending',
      data.notes || null,
      data.terms_conditions || null,
      JSON.stringify(data.items || []),
      JSON.stringify(data.timeline_items || []),
      JSON.stringify(data.terms_sections || []),
      JSON.stringify(data.attachments || []),
      JSON.stringify(data.activity_logs || []),
      JSON.stringify(data.approval || {}),
      data.client_message || null,
      data.response_date || null,
      data.sent_date || null,
      data.viewed_date || null,
      data.download_count || 0,
      data.email_status || null,
      data.whatsapp_status || null,
      data.created_by || null,
      data.updated_by || null,
      data.deleted || 0,
    ]
  );
  return findQuotationById(result.insertId);
}

async function findQuotationById(id) {
  const db = getDB();
  const [rows] = await db.execute(`SELECT ${quotationFields} FROM quotations WHERE id = ? LIMIT 1`, [id]);
  if (!rows.length) return null;
  return deserializeQuotation(rows[0]);
}

async function findQuotationByUUID(uuid) {
  const db = getDB();
  const [rows] = await db.execute(`SELECT ${quotationFields} FROM quotations WHERE uuid = ? LIMIT 1`, [uuid]);
  if (!rows.length) return null;
  return deserializeQuotation(rows[0]);
}

async function listQuotations({ page = 1, limit = 50, search, status, approval_status, created_by } = {}) {
  const db = getDB();
  const offset = (page - 1) * limit;
  const conditions = ['deleted = 0'];
  const values = [];

  if (search) {
    conditions.push(
      '(quotation_number LIKE ? OR project_name LIKE ? OR client_name LIKE ? OR company_name LIKE ? OR service_type LIKE ? OR notes LIKE ? )'
    );
    const term = `%${search}%`;
    values.push(term, term, term, term, term, term);
  }
  if (status) { conditions.push('status = ?'); values.push(status); }
  if (approval_status) { conditions.push('approval_status = ?'); values.push(approval_status); }
  if (created_by) { conditions.push('created_by = ?'); values.push(created_by); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await db.execute(
    `SELECT ${quotationFields} FROM quotations ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );
  const [countRows] = await db.execute(
    `SELECT COUNT(*) AS total FROM quotations ${where}`,
    values
  );
  return { rows: rows.map(deserializeQuotation), total: countRows[0].total };
}

async function updateQuotation(uuid, updates) {
  const db = getDB();
  const fields = Object.keys(updates);
  if (!fields.length) return findQuotationByUUID(uuid);

  const assignments = fields.map((field) => `${field} = ?`).join(', ');
  const values = fields.map((field) => {
    if (['items', 'timeline_items', 'terms_sections', 'attachments', 'activity_logs', 'approval'].includes(field)) {
      return JSON.stringify(updates[field] || []);
    }
    return updates[field];
  });
  values.push(uuid);

  await db.execute(`UPDATE quotations SET ${assignments} WHERE uuid = ?`, values);
  return findQuotationByUUID(uuid);
}

async function deleteQuotation(uuid) {
  const db = getDB();
  await db.execute('UPDATE quotations SET deleted = 1 WHERE uuid = ?', [uuid]);
}

function deserializeQuotation(row) {
  return {
    ...row,
    items: parseJson(row.items, []),
    timeline_items: parseJson(row.timeline_items, []),
    terms_sections: parseJson(row.terms_sections, []),
    attachments: parseJson(row.attachments, []),
    activity_logs: parseJson(row.activity_logs, []),
    approval: parseJson(row.approval, {}),
  };
}

module.exports = {
  createQuotation,
  findQuotationById,
  findQuotationByUUID,
  listQuotations,
  updateQuotation,
  deleteQuotation,
  generateQuotationNumber,
};
