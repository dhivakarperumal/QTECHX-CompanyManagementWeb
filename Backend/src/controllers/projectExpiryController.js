const path = require('path');
const fs = require('fs');
const {
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
} = require('../models/projectExpiryModel');

function ok(res, data, code = 200) {
  return res.status(code).json({ success: true, ...data });
}

function fail(res, message, code = 500, error = undefined) {
  return res.status(code).json({ success: false, message, ...(error ? { error } : {}) });
}

function getUploadedFilePath(file) {
  const uploadRoot = path.join(__dirname, '../../uploads');
  const relativePath = path.relative(uploadRoot, file.path).split(path.sep).join('/');
  return `/uploads/${relativePath}`;
}

function getUploadedInvoice(req) {
  const file = req.file || req.files?.invoice_file?.[0] || null;
  if (!file) return null;
  return getUploadedFilePath(file);
}

function calculateDaysRemaining(expiryDate) {
  if (!expiryDate) return null;
  const today = new Date();
  const expiry = new Date(expiryDate);
  const diffTime = expiry.getTime() - today.setHours(0, 0, 0, 0);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function normalizeExpiryPayload(payload, actor, invoiceFile = null) {
  const renewalStatus = payload.renewal_status || (payload.expiry_date ? (calculateDaysRemaining(payload.expiry_date) < 0 ? 'Expired' : (calculateDaysRemaining(payload.expiry_date) <= 7 ? 'Expiring Soon' : 'Active')) : 'Active');
  const nextReminderDate = payload.next_reminder_date || null;
  const status = payload.status || 'Active';
  return {
    project_id: payload.project_id || null,
    client_id: payload.client_id || null,
    expiry_type: payload.expiry_type || null,
    project_type: payload.project_type || null,
    service_name: payload.service_name || payload.expiry_type || null,
    provider_name: payload.provider_name || null,
    plan_name: payload.plan_name || null,
    price_per_month: Number(payload.price_per_month || 0),
    purchase_date: payload.purchase_date || null,
    start_date: payload.start_date || null,
    expiry_date: payload.expiry_date || null,
    renewal_cost: payload.renewal_cost || 0,
    payment_status: payload.payment_status || 'Pending',
    payment_method: payload.payment_method || null,
    invoice_number: payload.invoice_number || null,
    invoice_file: invoiceFile || payload.invoice_file || null,
    auto_renew: payload.auto_renew ? 1 : 0,
    renewal_status: renewalStatus,
    last_renewal_date: payload.last_renewal_date || null,
    next_reminder_date: nextReminderDate,
    reminder_sent: payload.reminder_sent ? 1 : 0,
    notes: payload.notes || null,
    internal_notes: payload.internal_notes || null,
    status,
    assigned_employee_id: payload.assigned_employee_id || null,
    assigned_employee_name: payload.assigned_employee_name || null,
    created_by: actor,
    updated_by: actor,
  };
}

async function createExpiryHandler(req, res) {
  try {
    const actor = req.user?.user_id || 'SYSTEM';
    const invoiceFile = getUploadedInvoice(req);
    const payload = normalizeExpiryPayload(req.body, actor, invoiceFile);
    if (!payload.project_id) return fail(res, 'Project is required', 400);
    if (!payload.expiry_type) return fail(res, 'Expiry type is required', 400);
    if (!payload.expiry_date) return fail(res, 'Expiry date is required', 400);
    const record = await createExpiryRecord(payload);
    return ok(res, { message: 'Expiry record created successfully', data: record }, 201);
  } catch (error) {
    console.error('createExpiryHandler:', error);
    return fail(res, 'Failed to create expiry record', 500, error.message);
  }
}

async function listExpiryHandler(req, res) {
  try {
    const result = await listExpiryRecords(req.query);
    return ok(res, { data: result.rows, pagination: { page: Number(req.query.page) || 1, limit: Number(req.query.limit) || 20, total: result.total, pages: Math.ceil(result.total / (Number(req.query.limit) || 20)) } });
  } catch (error) {
    console.error('listExpiryHandler:', error);
    return fail(res, 'Failed to list expiry records', 500, error.message);
  }
}

async function getExpiryHandler(req, res) {
  try {
    const record = await getExpiryRecordById(req.params.id);
    if (!record) return fail(res, 'Expiry record not found', 404);
    const history = await getRenewalHistoryByExpiryId(record.id);
    const reminders = await getReminderRecordsByExpiryId(record.id);
    return ok(res, { data: { ...record, renewal_history: history, reminders } });
  } catch (error) {
    console.error('getExpiryHandler:', error);
    return fail(res, 'Failed to fetch expiry record', 500, error.message);
  }
}

async function updateExpiryHandler(req, res) {
  try {
    const actor = req.user?.user_id || 'SYSTEM';
    const invoiceFile = getUploadedInvoice(req);
    const payload = normalizeExpiryPayload(req.body, actor, invoiceFile);
    const record = await updateExpiryRecord(req.params.id, payload);
    if (!record) return fail(res, 'Expiry record not found', 404);
    return ok(res, { message: 'Expiry record updated successfully', data: record });
  } catch (error) {
    console.error('updateExpiryHandler:', error);
    return fail(res, 'Failed to update expiry record', 500, error.message);
  }
}

async function deleteExpiryHandler(req, res) {
  try {
    const actor = req.user?.user_id || 'SYSTEM';
    const record = await softDeleteExpiryRecord(req.params.id, actor);
    if (!record) return fail(res, 'Expiry record not found', 404);
    return ok(res, { message: 'Expiry record deleted successfully' });
  } catch (error) {
    console.error('deleteExpiryHandler:', error);
    return fail(res, 'Failed to delete expiry record', 500, error.message);
  }
}

async function statsExpiryHandler(req, res) {
  try {
    const stats = await getExpiryStats();
    return ok(res, { data: stats });
  } catch (error) {
    console.error('statsExpiryHandler:', error);
    return fail(res, 'Failed to fetch expiry stats', 500, error.message);
  }
}

async function renewExpiryHandler(req, res) {
  try {
    const actor = req.user?.user_id || 'SYSTEM';
    const existing = await getExpiryRecordById(req.params.id);
    if (!existing) return fail(res, 'Expiry record not found', 404);
    const invoiceFile = getUploadedInvoice(req);
    const newExpiryDate = req.body.new_expiry_date || req.body.expiry_date || existing.expiry_date;
    const oldExpiry = existing.expiry_date;
    const renewalAmount = Number(req.body.renewal_amount || 0);
    const taxAmount = Number(req.body.tax_amount || 0);
    const totalAmount = Number(req.body.total_amount || renewalAmount + taxAmount);
    const historyId = await createRenewalHistory({
      project_expiry_id: existing.id,
      project_id: existing.project_id,
      renewal_type: req.body.renewal_type || existing.expiry_type,
      old_expiry_date: oldExpiry,
      new_expiry_date: newExpiryDate,
      renewal_amount: renewalAmount,
      tax_amount: taxAmount,
      total_amount: totalAmount,
      payment_method: req.body.payment_method || existing.payment_method,
      payment_status: req.body.payment_status || 'Pending',
      invoice_number: req.body.invoice_number || existing.invoice_number,
      invoice_file: invoiceFile || existing.invoice_file,
      renewed_by: actor,
      renewal_notes: req.body.notes || existing.notes,
    });
    const updatedRecord = await updateExpiryRecord(existing.id, {
      expiry_date: newExpiryDate,
      renewal_cost: totalAmount,
      payment_status: req.body.payment_status || existing.payment_status || 'Pending',
      payment_method: req.body.payment_method || existing.payment_method,
      invoice_number: req.body.invoice_number || existing.invoice_number,
      invoice_file: invoiceFile || existing.invoice_file,
      renewal_status: calculateDaysRemaining(newExpiryDate) < 0 ? 'Expired' : (calculateDaysRemaining(newExpiryDate) <= 7 ? 'Expiring Soon' : 'Active'),
      last_renewal_date: req.body.renewal_date || new Date().toISOString().slice(0, 10),
      next_reminder_date: req.body.next_reminder_date || null,
      notes: req.body.notes || existing.notes,
      updated_by: actor,
    });
    await createReminderRecord({
      project_expiry_id: existing.id,
      reminder_type: 'Internal',
      reminder_days_before: 0,
      reminder_status: 'Pending',
      scheduled_for: newExpiryDate,
      notes: 'Renewal recorded',
      created_by: actor,
    });
    return ok(res, { message: 'Renewal recorded successfully', data: { record: updatedRecord, history_id: historyId } });
  } catch (error) {
    console.error('renewExpiryHandler:', error);
    return fail(res, 'Failed to renew expiry record', 500, error.message);
  }
}

async function reminderExpiryHandler(req, res) {
  try {
    const actor = req.user?.user_id || 'SYSTEM';
    const record = await getExpiryRecordById(req.params.id);
    if (!record) return fail(res, 'Expiry record not found', 404);
    const reminderId = await createReminderRecord({
      project_expiry_id: record.id,
      reminder_type: req.body.reminder_type || 'Internal',
      reminder_days_before: req.body.reminder_days_before || 0,
      reminder_status: 'Sent',
      scheduled_for: req.body.scheduled_for || record.expiry_date,
      notes: req.body.notes || 'Reminder sent',
      created_by: actor,
    });
    return ok(res, { message: 'Reminder created successfully', data: { reminder_id: reminderId } });
  } catch (error) {
    console.error('reminderExpiryHandler:', error);
    return fail(res, 'Failed to create reminder', 500, error.message);
  }
}

module.exports = {
  createExpiryHandler,
  listExpiryHandler,
  getExpiryHandler,
  updateExpiryHandler,
  deleteExpiryHandler,
  statsExpiryHandler,
  renewExpiryHandler,
  reminderExpiryHandler,
};
