const { getDB } = require('../config/db');

// ─── Field Projection ──────────────────────────────────────────────────────────
const projectFields = [
  'id', 'uuid', 'project_code', 'project_name', 'short_name',
  'project_category', 'industry', 'description', 'objective', 'business_requirements',
  'client_name', 'company_name', 'contact_person', 'email', 'phone_number',
  'nda_signed', 'agreement_uploaded',
  'total_project_cost', 'current_status', 'overall_progress',
  'proposal_date', 'approval_date', 'project_start_date', 'estimated_completion_date',
  'project_end_date', 'go_live_date', 'support_period',
  'is_extended_project', 'extended_project_amount',
  'frontend_tech', 'mobile_tech', 'backend_tech', 'database_tech',
  'github_link', 'domain_name', 'sub_domain_name',
  'project_manager', 'ui_ux_designer', 'frontend_developers', 'backend_developers',
  'ui_progress', 'frontend_progress', 'backend_progress', 'testing_progress', 'deployment_progress',
  'proposal_doc', 'quotation_doc', 'agreement_doc', 'nda_doc',
  'api_documentation', 'database_schema', 'source_code_backup', 'project_images',
  'created_at', 'updated_at', 'created_by', 'updated_by',
].join(', ');

async function generateProjectCode(db) {
  const [row] = await db.execute('SELECT MAX(id) AS maxId FROM projects');
  const nextId = (row[0]?.maxId || 0) + 1;
  return `PRJ-${String(nextId).padStart(3, '0')}`;
}

// ─── Create ────────────────────────────────────────────────────────────────────
async function createProject(data) {
  const db = getDB();
  const projectCode = (data.project_code || '').toString().trim() || (await generateProjectCode(db));
  const [result] = await db.execute(
    `INSERT INTO projects (
      uuid, project_code, project_name, short_name, project_category, industry,
      description, objective, business_requirements,
      client_name, company_name, contact_person, email, phone_number,
      nda_signed, agreement_uploaded, total_project_cost, current_status, overall_progress,
      proposal_date, approval_date, project_start_date, estimated_completion_date,
      project_end_date, go_live_date, support_period,
      frontend_tech, mobile_tech, backend_tech, database_tech,
      github_link, domain_name, sub_domain_name,
      project_manager, ui_ux_designer, frontend_developers, backend_developers,
      ui_progress, frontend_progress, backend_progress, testing_progress, deployment_progress,
      proposal_doc, quotation_doc, agreement_doc, nda_doc,
      api_documentation, database_schema, source_code_backup, project_images,
      created_by, updated_by
    ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      data.uuid,
      projectCode,
      data.project_name,
      data.short_name || null,
      data.project_category || null,
      data.industry || null,
      data.description || null,
      data.objective || null,
      data.business_requirements || null,
      data.client_name || null,
      data.company_name || null,
      data.contact_person || null,
      data.email || null,
      data.phone_number || null,
      data.nda_signed || 'No',
      data.agreement_uploaded || 'No',
      data.total_project_cost || null,
      data.current_status || 'Planning',
      data.overall_progress || 0,
      data.proposal_date || null,
      data.approval_date || null,
      data.project_start_date || null,
      data.estimated_completion_date || null,
      data.project_end_date || null,
      data.go_live_date || null,
      data.support_period || null,
      data.is_extended_project ? 1 : 0,
      data.extended_project_amount || null,
      data.frontend_tech || null,
      data.mobile_tech || null,
      data.backend_tech || null,
      data.database_tech || null,
      data.github_link || null,
      data.domain_name || null,
      data.sub_domain_name || null,
      data.project_manager || null,
      data.ui_ux_designer || null,
      data.frontend_developers || null,
      data.backend_developers || null,
      data.ui_progress || 0,
      data.frontend_progress || 0,
      data.backend_progress || 0,
      data.testing_progress || 0,
      data.deployment_progress || 0,
      data.proposal_doc || null,
      data.quotation_doc || null,
      data.agreement_doc || null,
      data.nda_doc || null,
      data.api_documentation || null,
      data.database_schema || null,
      data.source_code_backup || null,
      data.project_images || null,
      data.created_by || null,
      data.updated_by || null,
    ]
  );
  return findProjectById(result.insertId);
}

// ─── Find ──────────────────────────────────────────────────────────────────────
async function findProjectById(id) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT ${projectFields} FROM projects WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function findProjectByUUID(uuid) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT ${projectFields} FROM projects WHERE uuid = ? LIMIT 1`,
    [uuid]
  );
  return rows[0] || null;
}

// ─── List with Search & Filters ───────────────────────────────────────────────
async function listProjects({ page, limit, search, current_status, project_manager }) {
  const db = getDB();
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];

  if (search) {
    conditions.push(
      '(project_name LIKE ? OR client_name LIKE ? OR company_name LIKE ? OR project_manager LIKE ? OR project_code LIKE ?)'
    );
    const term = `%${search}%`;
    values.push(term, term, term, term, term);
  }
  if (current_status)  { conditions.push('current_status = ?');      values.push(current_status); }
  if (project_manager) { conditions.push('project_manager LIKE ?');  values.push(`%${project_manager}%`); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const [rows] = await db.execute(
    `SELECT ${projectFields} FROM projects ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );
  const [countRows] = await db.execute(
    `SELECT COUNT(*) AS total FROM projects ${where}`,
    values
  );
  return { rows, total: countRows[0].total };
}

// ─── Update ────────────────────────────────────────────────────────────────────
async function updateProject(uuid, updates) {
  const db = getDB();
  const fields = Object.keys(updates);
  if (!fields.length) return findProjectByUUID(uuid);
  const assignments = fields.map((f) => `${f} = ?`).join(', ');
  const values = [...fields.map((f) => updates[f]), uuid];
  await db.execute(`UPDATE projects SET ${assignments} WHERE uuid = ?`, values);
  return findProjectByUUID(uuid);
}

// ─── Delete ────────────────────────────────────────────────────────────────────
async function deleteProject(uuid) {
  const db = getDB();
  await db.execute('DELETE FROM projects WHERE uuid = ?', [uuid]);
}

module.exports = {
  createProject, findProjectById, findProjectByUUID,
  listProjects, updateProject, deleteProject,
  generateProjectCode,
};
