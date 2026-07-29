const { v4: uuidv4 } = require('uuid');
const {
  createTraineeIntern,
  findTraineeInternByUUID,
  listTraineeInterns,
  updateTraineeIntern,
  deleteTraineeIntern,
  generatePersonCode,
} = require('../models/traineeInternModel');

function ok(res, data, code = 200) {
  return res.status(code).json({ success: true, ...data });
}

function fail(res, message, code = 500, error = undefined) {
  return res.status(code).json({ success: false, message, ...(error ? { error } : {}) });
}

function getUploadedFiles(req) {
  const uploadedFiles = {};
  const fileFields = ['profile_photo', 'resume', 'college_id_doc', 'offer_letter', 'internship_letter'];
  fileFields.forEach((field) => {
    const file = req.files?.[field]?.[0];
    if (file) uploadedFiles[field] = `/uploads/trainees/${file.filename}`;
  });
  return uploadedFiles;
}

async function createTraineeInternHandler(req, res) {
  try {
    const actor = req.user?.user_id || 'SYSTEM';
    const uploadedFiles = getUploadedFiles(req);
    const trainee = await createTraineeIntern({
      uuid: uuidv4(),
      ...req.body,
      ...uploadedFiles,
      created_by: actor,
      updated_by: actor,
    });
    return ok(res, { message: 'Trainee/Intern created successfully', data: trainee }, 201);
  } catch (err) {
    console.error('createTraineeInternHandler:', err);
    return fail(res, 'Trainee/Intern creation failed', 500, err.message);
  }
}

async function getAllTraineeInternsHandler(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const { search, type, status } = req.query;
    const result = await listTraineeInterns({ page, limit, search, type, status });
    return ok(res, {
      data: result.rows,
      pagination: { page, limit, total: result.total, pages: Math.ceil(result.total / limit) },
    });
  } catch (err) {
    console.error('getAllTraineeInternsHandler:', err);
    return fail(res, 'Failed to retrieve trainee/intern records', 500, err.message);
  }
}

async function getNextPersonCodeHandler(req, res) {
  try {
    const code = await generatePersonCode(require('../config/db').getDB());
    return ok(res, { code });
  } catch (err) {
    console.error('getNextPersonCodeHandler:', err);
    return fail(res, 'Failed to generate person ID', 500, err.message);
  }
}

async function getTraineeInternByIdHandler(req, res) {
  try {
    const trainee = await findTraineeInternByUUID(req.params.id);
    if (!trainee) return fail(res, 'Trainee/Intern not found', 404);
    return ok(res, { data: trainee });
  } catch (err) {
    console.error('getTraineeInternByIdHandler:', err);
    return fail(res, 'Failed to retrieve trainee/intern record', 500, err.message);
  }
}

async function updateTraineeInternHandler(req, res) {
  try {
    const existing = await findTraineeInternByUUID(req.params.id);
    if (!existing) return fail(res, 'Trainee/Intern not found', 404);
    const uploadedFiles = getUploadedFiles(req);
    const allowedFields = [
      'person_id', 'full_name', 'type', 'department', 'designation',
      'reporting_manager', 'joining_date', 'end_date', 'status',
      'mobile_number', 'email_address', 'current_address', 'emergency_contact_name',
      'emergency_contact_number', 'profile_photo', 'resume', 'college_id_doc',
      'offer_letter', 'internship_letter', 'college_university', 'course',
      'academic_department', 'year_semester', 'college_id_number', 'guide_name',
    ];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    Object.entries(uploadedFiles).forEach(([field, value]) => {
      updates[field] = value;
    });
    updates.updated_by = req.user?.user_id || 'SYSTEM';
    const trainee = await updateTraineeIntern(req.params.id, updates);
    return ok(res, { message: 'Trainee/Intern updated successfully', data: trainee });
  } catch (err) {
    console.error('updateTraineeInternHandler:', err);
    return fail(res, 'Failed to update trainee/intern record', 500, err.message);
  }
}

async function deleteTraineeInternHandler(req, res) {
  try {
    const existing = await findTraineeInternByUUID(req.params.id);
    if (!existing) return fail(res, 'Trainee/Intern not found', 404);
    await deleteTraineeIntern(req.params.id);
    return ok(res, { message: 'Trainee/Intern deleted successfully' });
  } catch (err) {
    console.error('deleteTraineeInternHandler:', err);
    return fail(res, 'Failed to delete trainee/intern record', 500, err.message);
  }
}

module.exports = {
  createTraineeInternHandler,
  getAllTraineeInternsHandler,
  getNextPersonCodeHandler,
  getTraineeInternByIdHandler,
  updateTraineeInternHandler,
  deleteTraineeInternHandler,
};
