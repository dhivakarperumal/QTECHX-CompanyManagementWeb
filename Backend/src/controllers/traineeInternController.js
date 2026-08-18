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

const bcrypt = require('bcrypt');
const { createUser, updateUser, findByEmail } = require('../models/userModel');

async function createTraineeInternHandler(req, res) {
  try {
    const actor = req.user?.user_id || 'SYSTEM';
    const uploadedFiles = getUploadedFiles(req);
    
    // Extract user credentials
    const userPassword = req.body.password;
    const username = req.body.username;
    
    // We don't want to save these into the trainee_interns table
    const traineeData = { ...req.body };
    delete traineeData.password;
    delete traineeData.confirm_password;

    const trainee = await createTraineeIntern({
      uuid: uuidv4(),
      ...traineeData,
      ...uploadedFiles,
      created_by: actor,
      updated_by: actor,
    });

    // Create User record
    if (username && userPassword) {
      try {
        const userEmail = req.body.official_email || traineeData.email_address || null;
        
        // Check if user with this email already exists
        if (userEmail) {
          const existingUser = await findByEmail(userEmail);
          if (existingUser) {
            console.warn(`User with email ${userEmail} already exists, skipping user creation`);
          } else {
            const hashedPassword = await bcrypt.hash(userPassword, 12);
            await createUser({
              user_id: trainee.uuid || null, // Fixed: use returned trainee's uuid
              username: username || null,
              email: userEmail,
              mobile: traineeData.mobile_number || null,
              password: hashedPassword,
              role: traineeData.type || 'Trainee',
              status: traineeData.status || 'Active',
              created_by: actor || null,
              updated_by: actor || null,
            });
          }
        }
      } catch (err) {
        console.error('Failed to create associated user account:', err);
      }
    }

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
    const { search, type, status, employee_id } = req.query;
    const result = await listTraineeInterns({ page, limit, search, type, status, employee_id });
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
      'reporting_manager', 'joining_date', 'joining_time', 'end_date', 'end_time', 'status',
      'mobile_number', 'email_address', 'current_address', 'emergency_contact_name',
      'emergency_contact_number', 'profile_photo', 'resume', 'college_id_doc',
      'offer_letter', 'internship_letter', 'college_university', 'course',
      'academic_department', 'year_semester', 'college_id_number', 'guide_name',
      'username', 'official_email',
    ];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    Object.entries(uploadedFiles).forEach(([field, value]) => {
      updates[field] = value;
    });
    updates.updated_by = req.user?.user_id || 'SYSTEM';

    const userPassword = req.body.password;
    const username = req.body.username;
    const officialEmail = req.body.official_email;

    const trainee = await updateTraineeIntern(req.params.id, updates);

    // Update User record
    if (username || officialEmail || updates.email_address || userPassword || updates.type || updates.status || updates.mobile_number) {
      try {
        const userUpdates = {};
        if (username) userUpdates.username = username;
        if (officialEmail) userUpdates.email = officialEmail;
        else if (updates.email_address && !officialEmail) userUpdates.email = updates.email_address;
        if (updates.mobile_number) userUpdates.mobile = updates.mobile_number;
        if (updates.type) userUpdates.role = updates.type;
        if (updates.status) userUpdates.status = updates.status;
        if (userPassword) {
          userUpdates.password = await bcrypt.hash(userPassword, 12);
        }
        await updateUser(existing.uuid, userUpdates); // Note: using existing.uuid
      } catch (err) {
        console.error('Failed to update associated user account:', err);
      }
    }

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
