const { v4: uuidv4 } = require('uuid');
const { getDB } = require('../config/db');
const {
  createProject, findProjectByUUID, listProjects, updateProject, deleteProject,
  generateProjectCode,
} = require('../models/projectModel');

const PROJECT_STATUSES = ['Planning', 'In Progress', 'Testing', 'On Hold', 'Live', 'Completed', 'Cancelled'];

function ok(res, data, code = 200) {
  return res.status(code).json({ success: true, ...data });
}
function fail(res, message, code = 500, error = undefined) {
  return res.status(code).json({ success: false, message, ...(error ? { error } : {}) });
}

function getUploadedFiles(req) {
  const uploadedFiles = {};
  const fileFields = ['proposal_doc', 'quotation_doc', 'agreement_doc', 'nda_doc', 'api_documentation', 'database_schema', 'source_code_backup'];
  fileFields.forEach((field) => {
    const file = req.files?.[field]?.[0];
    if (file) uploadedFiles[field] = `/uploads/${file.filename}`;
  });
  return uploadedFiles;
}

/** POST /api/projects */
async function createProjectHandler(req, res) {
  try {
    const { project_name, current_status } = req.body;
    const trimmedProjectName = project_name?.trim();
    if (!trimmedProjectName) return fail(res, 'Project name is required', 400);
    if (current_status && !PROJECT_STATUSES.includes(current_status)) {
      return fail(res, `Invalid status. Allowed: ${PROJECT_STATUSES.join(', ')}`, 400);
    }
    const uploadedFiles = getUploadedFiles(req);
    const actor = req.user?.user_id || 'SYSTEM';
    const hasAgreementFile = Boolean(uploadedFiles.agreement_doc);
    const agreementUploaded = hasAgreementFile || req.body.agreement_uploaded === 'Yes' ? 'Yes' : 'No';
    const project = await createProject({
      uuid: uuidv4(),
      ...req.body,
      ...uploadedFiles,
      project_name: trimmedProjectName,
      project_code: req.body.project_code?.toString().trim() || undefined,
      agreement_uploaded: agreementUploaded,
      agreement_doc: uploadedFiles.agreement_doc || (req.body.agreement_doc?.toString().trim() || null),
      created_by: actor,
      updated_by: actor,
    });
    return ok(res, { message: 'Project created successfully', data: project }, 201);
  } catch (err) {
    console.error('createProjectHandler:', err);
    return fail(res, 'Project creation failed', 500, err.message);
  }
}

/** GET /api/projects */
async function getAllProjectsHandler(req, res) {
  try {
    const page  = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const { search, current_status, project_manager } = req.query;
    const result = await listProjects({ page, limit, search, current_status, project_manager });
    return ok(res, {
      data: result.rows,
      pagination: { page, limit, total: result.total, pages: Math.ceil(result.total / limit) },
    });
  } catch (err) {
    console.error('getAllProjectsHandler:', err);
    return fail(res, 'Failed to retrieve projects', 500, err.message);
  }
}

/** GET /api/projects/next-code */
async function getNextProjectCodeHandler(req, res) {
  try {
    const code = await generateProjectCode(getDB());
    return ok(res, { code });
  } catch (err) {
    console.error('getNextProjectCodeHandler:', err);
    return fail(res, 'Failed to generate next project code', 500, err.message);
  }
}

/** GET /api/projects/:id */
async function getProjectByIdHandler(req, res) {
  try {
    const project = await findProjectByUUID(req.params.id);
    if (!project) return fail(res, 'Project not found', 404);
    return ok(res, { data: project });
  } catch (err) {
    console.error('getProjectByIdHandler:', err);
    return fail(res, 'Failed to retrieve project', 500, err.message);
  }
}

/** PUT /api/projects/:id */
async function updateProjectHandler(req, res) {
  try {
    const existing = await findProjectByUUID(req.params.id);
    if (!existing) return fail(res, 'Project not found', 404);
    if (req.body.current_status && !PROJECT_STATUSES.includes(req.body.current_status)) {
      return fail(res, `Invalid status. Allowed: ${PROJECT_STATUSES.join(', ')}`, 400);
    }
    const uploadedFiles = getUploadedFiles(req);
    const allowed = [
      'project_code','project_name','short_name','project_category','industry',
      'description','objective','business_requirements',
      'client_name','company_name','contact_person','email','phone_number',
      'nda_signed','agreement_uploaded','total_project_cost','current_status','overall_progress',
      'proposal_date','approval_date','project_start_date','estimated_completion_date',
      'project_end_date','go_live_date','support_period',
      'frontend_tech','mobile_tech','backend_tech','database_tech',
      'github_link','domain_name','sub_domain_name',
      'project_manager','ui_ux_designer','frontend_developers','backend_developers',
      'ui_progress','frontend_progress','backend_progress','testing_progress','deployment_progress',
      'proposal_doc','quotation_doc','agreement_doc','nda_doc',
      'api_documentation','database_schema','source_code_backup',
    ];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    Object.entries(uploadedFiles).forEach(([field, value]) => { updates[field] = value; });
    const hasAgreementFile = Boolean(uploadedFiles.agreement_doc);
    if (req.body.agreement_uploaded !== undefined) {
      updates.agreement_uploaded = req.body.agreement_uploaded;
    }
    if (hasAgreementFile) {
      updates.agreement_uploaded = 'Yes';
    }
    if (req.body.agreement_uploaded === 'No') updates.agreement_doc = null;
    updates.updated_by = req.user?.user_id || 'SYSTEM';
    const project = await updateProject(req.params.id, updates);
    return ok(res, { message: 'Project updated successfully', data: project });
  } catch (err) {
    console.error('updateProjectHandler:', err);
    return fail(res, 'Failed to update project', 500, err.message);
  }
}

/** DELETE /api/projects/:id */
async function deleteProjectHandler(req, res) {
  try {
    const existing = await findProjectByUUID(req.params.id);
    if (!existing) return fail(res, 'Project not found', 404);
    await deleteProject(req.params.id);
    return ok(res, { message: 'Project deleted successfully' });
  } catch (err) {
    console.error('deleteProjectHandler:', err);
    return fail(res, 'Failed to delete project', 500, err.message);
  }
}

module.exports = {
  createProjectHandler, getAllProjectsHandler, getNextProjectCodeHandler,
  getProjectByIdHandler, updateProjectHandler, deleteProjectHandler,
};
