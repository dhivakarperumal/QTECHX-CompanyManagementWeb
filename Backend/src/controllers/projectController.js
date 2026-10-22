const { v4: uuidv4 } = require('uuid');
const path = require('path');
const { getDB } = require('../config/db');
const { notifyAdminsSafely } = require('../utils/notificationService');
const {
  createProject, findProjectByUUID, listProjects, updateProject, deleteProject,
  generateProjectCode,
} = require('../models/projectModel');
const { createProjectAssets } = require('../models/projectAssetModel');
const { listAssignmentsByProject } = require('../models/projectAssignmentModel');

const PROJECT_STATUSES = ['Planning', 'In Progress', 'Testing', 'On Hold', 'Live', 'Completed', 'Cancelled'];

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
  const fileFields = ['proposal_doc', 'quotation_doc', 'agreement_doc', 'nda_doc', 'api_documentation', 'database_schema', 'source_code_backup', 'project_images'];
  fileFields.forEach((field) => {
    const files = req.files?.[field];
    if (!files?.length) return;
    if (field === 'project_images') {
      uploadedFiles[field] = files.map((file) => ({
        original_name: file.originalname,
        file_path: getFilePath(file),
        asset_type: path.extname(file.originalname).toLowerCase() === '.zip' ? 'zip' : 'image',
      }));
    } else {
      uploadedFiles[field] = [{
        original_name: files[0].originalname,
        file_path: getFilePath(files[0]),
        asset_type: field === 'source_code_backup' ? 'zip' : 'document',
      }];
    }
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
      project_images: uploadedFiles.project_images ? JSON.stringify(uploadedFiles.project_images) : (req.body.project_images || null),
      created_by: actor,
      updated_by: actor,
    });

    if (project && uploadedFiles) {
      const assets = [];
      Object.values(uploadedFiles).forEach((files) => {
        if (!Array.isArray(files)) return;
        files.forEach((file) => {
          assets.push({
            project_id: project.id,
            asset_type: file.asset_type,
            original_name: file.original_name,
            file_path: file.file_path,
            created_by: actor,
            updated_by: actor,
          });
        });
      });
      if (assets.length) await createProjectAssets(assets);
    }

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
    const limit = Math.min(1000, Math.max(1, parseInt(req.query.limit, 10) || 20));
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
    const assignments = await listAssignmentsByProject(project.id);
    const assignedEmployees = assignments.map((row) => ({
      employee_id: row.employee_id,
      employee_name: [row.first_name, row.last_name].filter(Boolean).join(' ').trim(),
      designation: row.designation || null,
      email: row.personal_email || row.official_email || null,
      status: row.status || 'Assigned',
    }));

    return ok(res, {
      project_id: project.id,
      project_name: project.project_name,
      assignedEmployeeCount: assignments.length,
      assignedEmployees,
      data: project,
    });
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
      'is_extended_project','extended_project_amount',
      'frontend_tech','mobile_tech','backend_tech','database_tech',
      'github_link','domain_name','sub_domain_name',
      'project_manager','ui_ux_designer','frontend_developers','backend_developers',
      'ui_progress','frontend_progress','backend_progress','testing_progress','deployment_progress',
      'proposal_doc','quotation_doc','agreement_doc','nda_doc',
      'api_documentation','database_schema','source_code_backup','project_images',
    ];
    const updates = {};
    allowed.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    Object.entries(uploadedFiles).forEach(([field, value]) => {
      updates[field] = field === 'project_images' ? JSON.stringify(value) : value;
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
    const project = await updateProject(req.params.id, updates);

    if (project && uploadedFiles) {
      const assets = [];
      Object.values(uploadedFiles).forEach((files) => {
        if (!Array.isArray(files)) return;
        files.forEach((file) => {
          assets.push({
            project_id: project.id,
            asset_type: file.asset_type,
            original_name: file.original_name,
            file_path: file.file_path,
            created_by: req.user?.user_id || 'SYSTEM',
            updated_by: req.user?.user_id || 'SYSTEM',
          });
        });
      });
      if (assets.length) await createProjectAssets(assets);
    }

    const actorRole = String(req.user?.role || '').trim().toLowerCase();
    const isAdminActor = ['admin', 'super admin', 'manager'].includes(actorRole);
    if (
      project &&
      !isAdminActor &&
      updates.current_status &&
      updates.current_status !== existing.current_status
    ) {
      await notifyAdminsSafely(req, {
        type: 'employee_project_updated',
        title: 'Employee updated a project',
        message: `${project.project_name || 'A project'} was marked ${updates.current_status} by an employee.`,
        link: '/admin/projects',
        relatedId: project.uuid || project.id,
      }, 'employee project update');
    }

    return ok(res, { message: 'Project updated successfully', data: project });
  } catch (err) {
    console.error('updateProjectHandler:', err);
    return fail(res, 'Failed to update project', 500, err.message);
  }
}

async function updateProjectStatusByEmployeeHandler(req, res) {
  try {
    const status = String(req.body?.current_status || '').trim();
    if (!PROJECT_STATUSES.includes(status)) {
      return fail(res, `Invalid status. Allowed: ${PROJECT_STATUSES.join(', ')}`, 400);
    }

    const project = await findProjectByUUID(req.params.id);
    if (!project) return fail(res, 'Project not found', 404);

    const db = getDB();
    const possibleIds = [...new Set([
      req.user?.employee_id,
      req.user?.user_id,
    ].filter(Boolean).map(String))];
    const identityClauses = possibleIds.flatMap(() => [
      'employee_id = ?',
      'employee_code = ?',
      'CAST(id AS CHAR) = ?',
    ]);
    const identityValues = possibleIds.flatMap((id) => [id, id, id]);
    if (req.user?.email) {
      identityClauses.push('official_email = ?', 'personal_email = ?');
      identityValues.push(req.user.email, req.user.email);
    }
    if (!identityClauses.length) return fail(res, 'Employee identity could not be resolved', 403);

    const [employees] = await db.execute(
      `SELECT employee_id, employee_code, CAST(id AS CHAR) AS id
         FROM employees
        WHERE ${identityClauses.join(' OR ')}
        LIMIT 1`,
      identityValues
    );
    if (!employees.length) return fail(res, 'Employee profile not found', 403);

    const employee = employees[0];
    const [assignmentRows] = await db.execute(
      'SELECT employee_ids FROM project_assignments WHERE project_id = ? LIMIT 1',
      [project.id]
    );
    let assignments = [];
    try {
      const parsed = assignmentRows[0]?.employee_ids;
      if (Array.isArray(parsed)) {
        assignments = parsed;
      } else if (parsed && typeof parsed === 'object') {
        assignments = Object.values(parsed);
      } else {
        const decoded = JSON.parse(parsed || '[]');
        assignments = Array.isArray(decoded) ? decoded : [];
      }
    } catch (error) {
      console.error('Could not parse project assignment recipients:', error);
      return fail(res, 'Could not verify project assignment', 500);
    }
    const isAssigned = assignments.some((assignment) => {
      const assignedIds = [
        assignment?.employee_id,
        assignment?.employeeId,
        assignment?.employee_code,
        assignment?.employeeCode,
        assignment?.id,
      ].filter(Boolean).map(String);
      return [employee.employee_id, employee.employee_code, employee.id]
        .filter(Boolean)
        .some((id) => assignedIds.includes(String(id)));
    });
    if (!isAssigned) return fail(res, 'You are not assigned to this project', 403);

    if (project.current_status !== status) {
      await updateProject(req.params.id, {
        current_status: status,
        updated_by: req.user?.user_id || employee.employee_id,
      });
      await notifyAdminsSafely(req, {
        type: 'employee_project_updated',
        title: 'Employee updated a project',
        message: `${req.user?.username || req.user?.email || 'An employee'} marked ${project.project_name || 'a project'} ${status}.`,
        link: '/admin/projects',
        relatedId: project.uuid || project.id,
      }, 'employee project status update');
    }

    return ok(res, {
      message: 'Project status updated successfully',
      data: { ...project, current_status: status },
    });
  } catch (error) {
    console.error('updateProjectStatusByEmployeeHandler:', error);
    return fail(res, 'Failed to update project status', 500, error.message);
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

/** GET /api/projects/:id/progress */
async function getProjectProgressHandler(req, res) {
  try {
    const project = await findProjectByUUID(req.params.id);
    if (!project) return fail(res, 'Project not found', 404);

    const db = getDB();
    const [rows] = await db.execute(
      'SELECT task_details FROM employee_task_assignments WHERE project_id = ?',
      [project.id]
    );

    let total = 0;
    let completed = 0;
    let inProgress = 0;
    let pending = 0;
    let onHold = 0;
    let cancelled = 0;

    rows.forEach(row => {
      let tasks = [];
      try {
        tasks = typeof row.task_details === 'string' ? JSON.parse(row.task_details) : (row.task_details || []);
      } catch (e) {}

      if (Array.isArray(tasks)) {
        tasks.forEach(task => {
          total++;
          const status = task.status || 'Pending';
          if (status === 'Completed') completed++;
          else if (status === 'In Progress') inProgress++;
          else if (status === 'Pending') pending++;
          else if (status === 'On Hold') onHold++;
          else if (status === 'Cancelled') cancelled++;
        });
      }
    });

    const remaining = total - completed;
    let progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    if (progress > 100) progress = 100;

    return ok(res, {
      total,
      completed,
      inProgress,
      pending,
      onHold,
      cancelled,
      remaining,
      progress
    });
  } catch (err) {
    console.error('getProjectProgressHandler:', err);
    return fail(res, 'Failed to calculate project progress', 500, err.message);
  }
}

module.exports = {
  createProjectHandler, getAllProjectsHandler, getNextProjectCodeHandler,
  getProjectByIdHandler, updateProjectHandler, deleteProjectHandler, getProjectProgressHandler,
  updateProjectStatusByEmployeeHandler,
};
