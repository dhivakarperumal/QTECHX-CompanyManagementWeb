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
  const payload = {
    uuid: data.uuid,
    project_code: projectCode,
    project_name: data.project_name || null,
    short_name: data.short_name || null,
    project_category: data.project_category || null,
    industry: data.industry || null,
    description: data.description || null,
    objective: data.objective || null,
    business_requirements: data.business_requirements || null,
    client_name: data.client_name || null,
    company_name: data.company_name || null,
    contact_person: data.contact_person || null,
    email: data.email || null,
    phone_number: data.phone_number || null,
    nda_signed: data.nda_signed || 'No',
    agreement_uploaded: data.agreement_uploaded || 'No',
    total_project_cost: data.total_project_cost || null,
    current_status: data.current_status || 'Planning',
    overall_progress: data.overall_progress || 0,
    proposal_date: data.proposal_date || null,
    approval_date: data.approval_date || null,
    project_start_date: data.project_start_date || null,
    estimated_completion_date: data.estimated_completion_date || null,
    project_end_date: data.project_end_date || null,
    go_live_date: data.go_live_date || null,
    support_period: data.support_period || null,
    is_extended_project: data.is_extended_project ? 1 : 0,
    extended_project_amount: data.extended_project_amount || null,
    frontend_tech: data.frontend_tech || null,
    mobile_tech: data.mobile_tech || null,
    backend_tech: data.backend_tech || null,
    database_tech: data.database_tech || null,
    github_link: data.github_link || null,
    domain_name: data.domain_name || null,
    sub_domain_name: data.sub_domain_name || null,
    project_manager: data.project_manager || null,
    ui_ux_designer: data.ui_ux_designer || null,
    frontend_developers: data.frontend_developers || null,
    backend_developers: data.backend_developers || null,
    ui_progress: data.ui_progress || 0,
    frontend_progress: data.frontend_progress || 0,
    backend_progress: data.backend_progress || 0,
    testing_progress: data.testing_progress || 0,
    deployment_progress: data.deployment_progress || 0,
    proposal_doc: data.proposal_doc || null,
    quotation_doc: data.quotation_doc || null,
    agreement_doc: data.agreement_doc || null,
    nda_doc: data.nda_doc || null,
    api_documentation: data.api_documentation || null,
    database_schema: data.database_schema || null,
    source_code_backup: data.source_code_backup || null,
    project_images: data.project_images || null,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
    created_by: data.created_by || null,
    updated_by: data.updated_by || null,
  };

  const cols = Object.keys(payload).map((k) => `\`${k}\``).join(', ');
  const placeholders = Object.keys(payload).map(() => '?').join(', ');
  const values = Object.keys(payload).map((k) => payload[k]);

  const [result] = await db.execute(
    `INSERT INTO projects (${cols}) VALUES (${placeholders})`,
    values
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
