const { v4: uuidv4 } = require('uuid');
const {
  createQuotation,
  findQuotationByUUID,
  listQuotations,
  updateQuotation,
  deleteQuotation,
} = require('../models/quotationModel');

function ok(res, data, code = 200) {
  return res.status(code).json({ success: true, ...data });
}
function fail(res, message, code = 500, error) {
  return res.status(code).json({ success: false, message, ...(error ? { error } : {}) });
}

async function createQuotationHandler(req, res) {
  try {
    const payload = {
      ...req.body,
      uuid: uuidv4(),
      created_by: req.user?.user_id || 'SYSTEM',
      updated_by: req.user?.user_id || 'SYSTEM',
    };
    const quotation = await createQuotation(payload);
    return ok(res, { message: 'Quotation created successfully', data: quotation }, 201);
  } catch (err) {
    console.error('createQuotationHandler:', err);
    return fail(res, 'Failed to create quotation', 500, err.message);
  }
}

async function getAllQuotationsHandler(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const { search, status, approval_status, created_by } = req.query;
    const result = await listQuotations({ page, limit, search, status, approval_status, created_by });
    return ok(res, {
      data: result.rows,
      pagination: { page, limit, total: result.total, pages: Math.ceil(result.total / limit) },
    });
  } catch (err) {
    console.error('getAllQuotationsHandler:', err);
    return fail(res, 'Failed to retrieve quotations', 500, err.message);
  }
}

async function getQuotationByIdHandler(req, res) {
  try {
    const quotation = await findQuotationByUUID(req.params.id);
    if (!quotation) return fail(res, 'Quotation not found', 404);
    return ok(res, { data: quotation });
  } catch (err) {
    console.error('getQuotationByIdHandler:', err);
    return fail(res, 'Failed to retrieve quotation', 500, err.message);
  }
}

async function updateQuotationHandler(req, res) {
  try {
    const existing = await findQuotationByUUID(req.params.id);
    if (!existing) return fail(res, 'Quotation not found', 404);
    const updates = {
      ...req.body,
      updated_by: req.user?.user_id || 'SYSTEM',
    };
    const quotation = await updateQuotation(req.params.id, updates);
    return ok(res, { message: 'Quotation updated successfully', data: quotation });
  } catch (err) {
    console.error('updateQuotationHandler:', err);
    return fail(res, 'Failed to update quotation', 500, err.message);
  }
}

async function deleteQuotationHandler(req, res) {
  try {
    const existing = await findQuotationByUUID(req.params.id);
    if (!existing) return fail(res, 'Quotation not found', 404);
    await deleteQuotation(req.params.id);
    return ok(res, { message: 'Quotation deleted successfully' });
  } catch (err) {
    console.error('deleteQuotationHandler:', err);
    return fail(res, 'Failed to delete quotation', 500, err.message);
  }
}

module.exports = {
  createQuotationHandler,
  getAllQuotationsHandler,
  getQuotationByIdHandler,
  updateQuotationHandler,
  deleteQuotationHandler,
};
