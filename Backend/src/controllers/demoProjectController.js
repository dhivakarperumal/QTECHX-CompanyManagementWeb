const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { getDB } = require('../config/db');
const {
  createDemoProject, findDemoProjectByUUID, listDemoProjects,
  updateDemoProject, deleteDemoProject, generateDemoProjectCode,
} = require('../models/demoProjectModel');

function ok(res, data, code = 200) {
  return res.status(code).json({ success: true, ...data });
}
function fail(res, message, code = 500, error = undefined) {
  return res.status(code).json({ success: false, message, ...(error ? { error } : {}) });
}

function getUploadedFiles(req) {
  const uploadedFiles = {};
  const uploadRoot = path.join(__dirname, '../../uploads');
  const getFilePath = (file) => {
    const relativePath = path.relative(uploadRoot, file.path).split(path.sep).join('/');
    return `/uploads/${relativePath}`;
  };

  // Single-file document fields
  const singleFields = [
    'proposal_doc', 'quotation_doc', 'agreement_doc', 'nda_doc',
    'api_documentation', 'database_schema', 'source_code_backup',
    'image', // new: single project showcase image
  ];
  singleFields.forEach((field) => {
    const files = req.files?.[field];
    if (!files?.length) return;
    if (field === 'image') {
      uploadedFiles[field] = getFilePath(files[0]);
    } else {
      uploadedFiles[field] = [{
        original_name: files[0].originalname,
        file_path: getFilePath(files[0]),
        asset_type: field === 'source_code_backup' ? 'zip' : 'document',
      }];
    }
  });

  // Multi-file field
  const imageFiles = req.files?.['project_images'];
  if (imageFiles?.length) {
    uploadedFiles['project_images'] = imageFiles.map((file) => ({
      original_name: file.originalname,
      file_path: getFilePath(file),
      asset_type: path.extname(file.originalname).toLowerCase() === '.zip' ? 'zip' : 'image',
    }));
  }

  return uploadedFiles;
}

/** POST /api/demo-projects */
async function createDemoProjectHandler(req, res) {
  try {
    const { project_name } = req.body;
    const trimmedProjectName = project_name?.trim();
    if (!trimmedProjectName) return fail(res, 'Project name is required', 400);
    const uploadedFiles = getUploadedFiles(req);
    const actor = req.user?.user_id || 'SYSTEM';
    const hasAgreementFile = Boolean(uploadedFiles.agreement_doc);
    const agreementUploaded = hasAgreementFile || req.body.agreement_uploaded === 'Yes' ? 'Yes' : 'No';

    // Flatten file paths for single-file document fields
    const flatFiles = {};
    Object.entries(uploadedFiles).forEach(([field, value]) => {
      if (field === 'project_images') {
        flatFiles[field] = JSON.stringify(value);
      } else if (field === 'image') {
        flatFiles[field] = value; // already a string path
      } else if (Array.isArray(value) && value.length > 0) {
        flatFiles[field] = value[0];
      }
    });

    const project = await createDemoProject({
      uuid: uuidv4(),
      ...req.body,
      ...flatFiles,
      project_name: trimmedProjectName,
      project_code: req.body.project_code?.toString().trim() || undefined,
      agreement_uploaded: agreementUploaded,
      agreement_doc: flatFiles.agreement_doc || (req.body.agreement_doc?.toString().trim() || null),
      created_by: actor,
      updated_by: actor,
    });

    return ok(res, { message: 'Demo project created successfully', data: project }, 201);
  } catch (err) {
    console.error('createDemoProjectHandler:', err);
    return fail(res, 'Demo project creation failed', 500, err.message);
  }
}

/** GET /api/demo-projects/public/all  — no auth required */
async function getDemoProjectsPublicHandler(req, res) {
  try {
    const page  = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(1000, Math.max(1, parseInt(req.query.limit, 10) || 500));
    const { search, current_status } = req.query;
    const result = await listDemoProjects({ page, limit, search, current_status });
    return ok(res, {
      data: result.rows,
      pagination: { page, limit, total: result.total, pages: Math.ceil(result.total / limit) },
    });
  } catch (err) {
    console.error('getDemoProjectsPublicHandler:', err);
    return fail(res, 'Failed to retrieve demo projects', 500, err.message);
  }
}

/** GET /api/demo-projects */
async function getAllDemoProjectsHandler(req, res) {
  try {
    const page  = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(1000, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const { search, current_status, project_manager } = req.query;
    const result = await listDemoProjects({ page, limit, search, current_status, project_manager });
    return ok(res, {
      data: result.rows,
      pagination: { page, limit, total: result.total, pages: Math.ceil(result.total / limit) },
    });
  } catch (err) {
    console.error('getAllDemoProjectsHandler:', err);
    return fail(res, 'Failed to retrieve demo projects', 500, err.message);
  }
}

/** GET /api/demo-projects/next-code */
async function getNextDemoProjectCodeHandler(req, res) {
  try {
    const code = await generateDemoProjectCode(getDB());
    return ok(res, { code });
  } catch (err) {
    console.error('getNextDemoProjectCodeHandler:', err);
    return fail(res, 'Failed to generate next demo project code', 500, err.message);
  }
}

/** GET /api/demo-projects/:id */
async function getDemoProjectByIdHandler(req, res) {
  try {
    const project = await findDemoProjectByUUID(req.params.id);
    if (!project) return fail(res, 'Demo project not found', 404);
    return ok(res, { data: project });
  } catch (err) {
    console.error('getDemoProjectByIdHandler:', err);
    return fail(res, 'Failed to retrieve demo project', 500, err.message);
  }
}

/** PUT /api/demo-projects/:id */
async function updateDemoProjectHandler(req, res) {
  try {
    const existing = await findDemoProjectByUUID(req.params.id);
    if (!existing) return fail(res, 'Demo project not found', 404);
    const uploadedFiles = getUploadedFiles(req);
    const allowed = [
      // legacy fields (kept for backwards compatibility)
      'project_code','project_name','short_name','project_category','industry',
      'description','objective','business_requirements',
      'client_name','company_name','contact_person','email','phone_number',
      'nda_signed','agreement_uploaded','total_project_cost','current_status','overall_progress',
      'proposal_date','approval_date','project_start_date','estimated_completion_date',
      'project_end_date','go_live_date','support_period',
      'is_extended_project','extended_project_amount',
      'frontend_tech','mobile_tech','backend_tech','database_tech',
      'github_link','domain_name','sub_domain_name',
      'project_manager','ui_ux_designer','frontend_developers','backend_developers',
      'ui_progress','frontend_progress','backend_progress','testing_progress','deployment_progress',
      'proposal_doc','quotation_doc','agreement_doc','nda_doc',
      'api_documentation','database_schema','source_code_backup','project_images',
      // new fields (same as completed projects)
      'url', 'image', 'technologies', 'completion_date', 'client_id', 'client_details',
    ];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    updates.current_status = 'Completed';

    // Flatten uploaded files into updates
    Object.entries(uploadedFiles).forEach(([field, value]) => {
      if (field === 'project_images') {
        updates[field] = JSON.stringify(value);
      } else if (field === 'image') {
        updates[field] = value; // already a string path
      } else if (Array.isArray(value) && value.length > 0) {
        updates[field] = value[0];
      }
    });

    const hasAgreementFile = Boolean(uploadedFiles.agreement_doc);
    if (req.body.agreement_uploaded !== undefined) {
      updates.agreement_uploaded = req.body.agreement_uploaded;
    }
    if (hasAgreementFile) {
      updates.agreement_uploaded = 'Yes';
    }
    if (req.body.agreement_uploaded === 'No') updates.agreement_doc = null;
    updates.updated_by = req.user?.user_id || 'SYSTEM';
    const project = await updateDemoProject(req.params.id, updates);
    return ok(res, { message: 'Demo project updated successfully', data: project });
  } catch (err) {
    console.error('updateDemoProjectHandler:', err);
    return fail(res, 'Failed to update demo project', 500, err.message);
  }
}

/** DELETE /api/demo-projects/:id */
async function deleteDemoProjectHandler(req, res) {
  try {
    const existing = await findDemoProjectByUUID(req.params.id);
    if (!existing) return fail(res, 'Demo project not found', 404);
    await deleteDemoProject(req.params.id);
    return ok(res, { message: 'Demo project deleted successfully' });
  } catch (err) {
    console.error('deleteDemoProjectHandler:', err);
    return fail(res, 'Failed to delete demo project', 500, err.message);
  }
}

module.exports = {
  createDemoProjectHandler,
  getAllDemoProjectsHandler,
  getDemoProjectsPublicHandler,
  getNextDemoProjectCodeHandler,
  getDemoProjectByIdHandler,
  updateDemoProjectHandler,
  deleteDemoProjectHandler,
};
