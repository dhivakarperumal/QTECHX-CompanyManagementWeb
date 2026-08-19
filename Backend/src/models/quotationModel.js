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
  const year = new Date().getFullYear();
  const prefix = `QT-${year}-`;
  const [rows] = await db.execute('SELECT quotation_number FROM quotations WHERE quotation_number LIKE ? ORDER BY id DESC LIMIT 1 FOR UPDATE', [`${prefix}%`]);
  const lastNumber = rows[0]?.quotation_number?.split('-').pop();
  return `${prefix}${String((Number(lastNumber) || 0) + 1).padStart(4, '0')}`;
}

function money(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function calculateTotals(data) {
  const items = (Array.isArray(data.items) ? data.items : []).map((item) => {
    const quantity = Math.max(0, Number(item.quantity) || 0);
    const unitPrice = Math.max(0, Number(item.unit_price) || 0);
    const gross = money(quantity * unitPrice);
    const discountRate = Math.min(100, Math.max(0, Number(item.discount_percentage ?? item.discount) || 0));
    const discountAmount = money(gross * discountRate / 100);
    const taxableAmount = money(Math.max(0, gross - discountAmount));
    const taxAmount = money(taxableAmount * Math.max(0, Number(item.tax_percentage) || 0) / 100);
    return { ...item, quantity, unit_price: unitPrice, discount_amount: discountAmount, taxable_amount: taxableAmount, tax_amount: taxAmount, total: money(taxableAmount + taxAmount) };
  });
  const subtotal = money(items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0));
  const discount = money(items.reduce((sum, item) => sum + item.discount_amount, 0) + (Number(data.discount) || 0));
  const taxableAmount = money(Math.max(0, subtotal - discount));
  const taxAmount = money(items.reduce((sum, item) => sum + item.tax_amount, 0));
  const additionalCharges = money(Number(data.additional_charges) || 0);
  const grandTotal = money(taxableAmount + taxAmount + additionalCharges + (Number(data.round_off) || 0));
  const advanceAmount = money(Math.min(grandTotal, Math.max(0, Number(data.advance_amount) || 0)));
  return { items, subtotal, discount, taxable_amount: taxableAmount, additional_charges: additionalCharges, tax_amount: taxAmount, grand_total: grandTotal, advance_amount: advanceAmount, balance_amount: money(grandTotal - advanceAmount) };
}

async function createQuotation(data) {
  const db = getDB();
  const connection = await db.getConnection();
  const totals = calculateTotals(data);
  try {
    await connection.beginTransaction();
    const quotationNumber = (data.quotation_number || '').toString().trim() || await generateQuotationNumber(connection);
    const [result] = await connection.execute(
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
      totals.subtotal,
      totals.discount,
      totals.additional_charges,
      totals.tax_amount,
      data.round_off || 0,
      totals.grand_total,
      totals.advance_amount,
      totals.balance_amount,
      data.status || 'Draft',
      data.approval_status || 'Pending',
      data.payment_status || 'Pending',
      data.notes || null,
      data.terms_conditions || null,
      JSON.stringify(totals.items),
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
    await connection.commit();
    return findQuotationById(result.insertId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
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
  Object.assign(updates, calculateTotals(updates));
  const fields = Object.keys(updates).filter((field) => quotationFields.split(', ').includes(field) && !['id', 'uuid', 'quotation_number', 'created_at'].includes(field));
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

async function setQuotationStatus(uuid, status) {
  const db = getDB();
  await db.execute('UPDATE quotations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE uuid = ? AND deleted = 0', [status, uuid]);
  return findQuotationByUUID(uuid);
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
  setQuotationStatus,
  calculateTotals,
  generateQuotationNumber,
};
