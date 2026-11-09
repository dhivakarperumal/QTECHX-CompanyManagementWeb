const { getDB } = require('../config/db');

// ─── Auto-create Table ─────────────────────────────────────────────────────────
async function createDemoProjectsTableIfNotExists() {
  const db = getDB();
  await db.execute(`
    CREATE TABLE IF NOT EXISTS demo_projects (
      id INT AUTO_INCREMENT PRIMARY KEY,
      uuid VARCHAR(36) NOT NULL UNIQUE,
      project_code VARCHAR(50),
      project_name VARCHAR(255) NOT NULL,
      short_name VARCHAR(100),
      project_category VARCHAR(100),
      industry VARCHAR(100),
      description TEXT,
      objective TEXT,
      business_requirements TEXT,
      client_name VARCHAR(255),
      company_name VARCHAR(255),
      contact_person VARCHAR(255),
      email VARCHAR(255),
      phone_number VARCHAR(50),
      nda_signed ENUM('Yes','No') DEFAULT 'No',
      agreement_uploaded ENUM('Yes','No') DEFAULT 'No',
      total_project_cost DECIMAL(15,2),
      current_status ENUM('Planning','In Progress','Testing','On Hold','Live','Completed','Cancelled') DEFAULT 'Completed',
      overall_progress INT DEFAULT 0,
      proposal_date DATE,
      approval_date DATE,
      project_start_date DATE,
      estimated_completion_date DATE,
      project_end_date DATE,
      go_live_date DATE,
      support_period VARCHAR(100),
      is_extended_project TINYINT(1) DEFAULT 0,
      extended_project_amount DECIMAL(15,2),
      frontend_tech VARCHAR(255),
      mobile_tech VARCHAR(255),
      backend_tech VARCHAR(255),
      database_tech VARCHAR(255),
      github_link VARCHAR(500),
      domain_name VARCHAR(255),
      sub_domain_name VARCHAR(255),
      project_manager VARCHAR(255),
      ui_ux_designer VARCHAR(255),
      frontend_developers TEXT,
      backend_developers TEXT,
      ui_progress INT DEFAULT 0,
      frontend_progress INT DEFAULT 0,
      backend_progress INT DEFAULT 0,
      testing_progress INT DEFAULT 0,
      deployment_progress INT DEFAULT 0,
      proposal_doc TEXT,
      quotation_doc TEXT,
      agreement_doc TEXT,
      nda_doc TEXT,
      api_documentation TEXT,
      database_schema TEXT,
      source_code_backup TEXT,
      project_images LONGTEXT,
      url VARCHAR(500),
      image TEXT,
      technologies JSON,
      completion_date DATE,
      client_id INT,
      client_details JSON,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_by VARCHAR(100),
      updated_by VARCHAR(100)
    )
  `);

  // ─── Safe migration: add new columns to existing tables ────────────────
  const alterations = [
    'ALTER TABLE demo_projects ADD COLUMN url VARCHAR(500)',
    'ALTER TABLE demo_projects ADD COLUMN image TEXT',
    'ALTER TABLE demo_projects ADD COLUMN technologies JSON',
    'ALTER TABLE demo_projects ADD COLUMN completion_date DATE',
    'ALTER TABLE demo_projects ADD COLUMN client_id INT',
    'ALTER TABLE demo_projects ADD COLUMN client_details JSON',
  ];
  for (const sql of alterations) {
    try { await db.execute(sql); } catch (_) { /* column already exists — safe to ignore */ }
  }

  await db.execute("UPDATE demo_projects SET current_status = 'Completed' WHERE current_status IS NULL OR current_status <> 'Completed'");

  console.log('[demoProjectModel] demo_projects table ready.');
}

// ─── Field Projection ──────────────────────────────────────────────────────────
const demoProjectFields = [
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
  'url', 'image', 'technologies', 'completion_date', 'client_id', 'client_details',
  'created_at', 'updated_at', 'created_by', 'updated_by',
].join(', ');

// ─── Code Generator ────────────────────────────────────────────────────────────
async function generateDemoProjectCode(db) {
  const [row] = await db.execute('SELECT MAX(id) AS maxId FROM demo_projects');
  const nextId = (row[0]?.maxId || 0) + 1;
  return `DPR-${String(nextId).padStart(3, '0')}`;
}

// ─── Create ────────────────────────────────────────────────────────────────────
async function createDemoProject(data) {
  const db = getDB();
  const projectCode = (data.project_code || '').toString().trim() || (await generateDemoProjectCode(db));
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
    current_status: 'Completed',
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
    // ── New fields (same as completed projects) ──
    url: data.url || null,
    image: data.image || null,
    technologies: data.technologies
      ? (typeof data.technologies === 'string' ? data.technologies : JSON.stringify(data.technologies))
      : null,
    completion_date: data.completion_date || null,
    client_id: data.client_id ? parseInt(data.client_id, 10) : null,
    client_details: data.client_details
      ? (typeof data.client_details === 'string' ? data.client_details : JSON.stringify(data.client_details))
      : null,
    created_at: data.created_at || new Date().toISOString(),
    updated_at: data.updated_at || new Date().toISOString(),
    created_by: data.created_by || null,
    updated_by: data.updated_by || null,
  };

  const cols = Object.keys(payload).map((k) => `\`${k}\``).join(', ');
  const placeholders = Object.keys(payload).map(() => '?').join(', ');
  const values = Object.keys(payload).map((k) => payload[k]);

  const [result] = await db.execute(
    `INSERT INTO demo_projects (${cols}) VALUES (${placeholders})`,
    values
  );
  return findDemoProjectById(result.insertId);
}

// ─── Find ──────────────────────────────────────────────────────────────────────
async function findDemoProjectById(id) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT ${demoProjectFields} FROM demo_projects WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function findDemoProjectByUUID(uuid) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT ${demoProjectFields} FROM demo_projects WHERE uuid = ? LIMIT 1`,
    [uuid]
  );
  return rows[0] || null;
}

// ─── List with Search & Filters ───────────────────────────────────────────────
async function listDemoProjects({ page, limit, search, current_status, project_manager }) {
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
    `SELECT ${demoProjectFields} FROM demo_projects ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );
  const [countRows] = await db.execute(
    `SELECT COUNT(*) AS total FROM demo_projects ${where}`,
    values
  );
  return { rows, total: countRows[0].total };
}

// ─── Update ────────────────────────────────────────────────────────────────────
async function updateDemoProject(uuid, updates) {
  const db = getDB();
  const fields = Object.keys(updates);
  if (!fields.length) return findDemoProjectByUUID(uuid);
  const assignments = fields.map((f) => `${f} = ?`).join(', ');
  const values = [...fields.map((f) => updates[f]), uuid];
  await db.execute(`UPDATE demo_projects SET ${assignments} WHERE uuid = ?`, values);
  return findDemoProjectByUUID(uuid);
}

// ─── Delete ────────────────────────────────────────────────────────────────────
async function deleteDemoProject(uuid) {
  const db = getDB();
  await db.execute('DELETE FROM demo_projects WHERE uuid = ?', [uuid]);
}

module.exports = {
  createDemoProjectsTableIfNotExists,
  createDemoProject, findDemoProjectById, findDemoProjectByUUID,
  listDemoProjects, updateDemoProject, deleteDemoProject,
  generateDemoProjectCode,
};
