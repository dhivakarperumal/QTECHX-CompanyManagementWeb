const { getDB } = require('../config/db');

function parseArrayField(value) {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'object') return [value];
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') return [parsed];
      return [parsed].filter(Boolean);
    } catch {
      return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
    }
  }
  return [];
}

function normalizePlanPayload(plan = {}) {
  const normalized = { ...plan };
  const rawModules = plan.modules || plan.taskmodule || plan.task_module || plan.taskmodules;
  normalized.modules = parseArrayField(rawModules);
  normalized.taskmodule = normalized.modules;
  normalized.includedModules = parseArrayField(plan.includedModules || plan.included_modules);
  if (!normalized.includedModules.length && normalized.modules.length) {
    normalized.includedModules = normalized.modules
      .map((m) => (typeof m === 'object' ? (m.title || m.name || m.module_name || '') : String(m)))
      .filter(Boolean);
  }
  normalized.technologyStack = parseArrayField(plan.technologyStack || plan.technology_stack);
  normalized.projectId = plan.projectId || plan.project_id || null;
  normalized.projectCode = plan.projectCode || plan.project_code || null;
  if (!normalized.projectCode && normalized.projectId) {
    normalized.projectCode = normalized.projectCode || null;
  }
  return normalized;
}

async function createProjectPlan(plan = {}) {
  const db = getDB();
  const normalizedPlan = normalizePlanPayload(plan);
  const [result] = await db.execute(
    `INSERT INTO project_plan (
      plan_id, plan_code, plan_name, project_id, project_code, project_type, category, status,
      taskmodule, plan_data, plan_document, created_by, updated_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )`,
    [
      normalizedPlan.planId || null,
      normalizedPlan.planCode || null,
      normalizedPlan.planName || null,
      normalizedPlan.projectId || null,
      normalizedPlan.projectCode || null,
      normalizedPlan.projectType || null,
      normalizedPlan.category || null,
      normalizedPlan.status || 'Draft',
      JSON.stringify(normalizedPlan.modules || []),
      JSON.stringify(normalizedPlan),
      normalizedPlan.plan_document || null,
      normalizedPlan.createdBy || null,
      normalizedPlan.updatedBy || null,
    ]
  );
  return findProjectPlanById(result.insertId);
}

async function listProjectPlans() {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT id, plan_id, plan_code, plan_name, project_id, project_code, project_type, category, status, taskmodule, plan_data, plan_document, created_at, updated_at, created_by, updated_by FROM project_plan ORDER BY updated_at DESC`
  );
  return rows.map((row) => {
    let parsedData = {};
    try {
      parsedData = row.plan_data ? (typeof row.plan_data === 'string' ? JSON.parse(row.plan_data) : row.plan_data) : {};
    } catch (e) {
      console.error(`Failed to parse plan_data for plan id ${row.id}:`, e);
      parsedData = {};
    }

    let taskmodule = [];
    try {
      taskmodule = row.taskmodule ? (typeof row.taskmodule === 'string' ? JSON.parse(row.taskmodule) : row.taskmodule) : [];
    } catch (e) {
      console.error(`Failed to parse taskmodule for plan id ${row.id}:`, e);
      taskmodule = [];
    }

    const rawModules = (Array.isArray(taskmodule) && taskmodule.length > 0)
      ? taskmodule
      : (Array.isArray(parsedData.modules) && parsedData.modules.length > 0
        ? parsedData.modules
        : parseArrayField(parsedData.modules || parsedData.taskmodule));

    const finalModules = Array.isArray(rawModules) ? rawModules : [];

    const finalIncludedModules = (Array.isArray(parsedData.includedModules) && parsedData.includedModules.length > 0)
      ? parsedData.includedModules
      : finalModules.map((m) => (typeof m === 'object' ? (m.title || m.module_name || m.name || '') : String(m))).filter(Boolean);

    return {
      ...parsedData,
      id: row.id,
      planId: row.plan_id || parsedData.planId,
      planCode: row.plan_code || parsedData.planCode,
      planName: row.plan_name || parsedData.planName,
      projectId: row.project_id || parsedData.projectId || parsedData.project_id || null,
      projectCode: row.project_code || parsedData.projectCode || parsedData.project_code || null,
      projectType: row.project_type || parsedData.projectType,
      category: row.category || parsedData.category,
      status: row.status || parsedData.status,
      taskmodule: finalModules,
      modules: finalModules,
      includedModules: finalIncludedModules,
      technologyStack: Array.isArray(parsedData.technologyStack) ? parsedData.technologyStack : parseArrayField(parsedData.technologyStack),
      planDocument: row.plan_document || parsedData.planDocument || null,
      createdBy: row.created_by || parsedData.createdBy || null,
      updatedBy: row.updated_by || parsedData.updatedBy || null,
      createdAt: row.created_at ? (typeof row.created_at.toISOString === 'function' ? row.created_at.toISOString() : row.created_at) : parsedData.createdAt,
      updatedAt: row.updated_at ? (typeof row.updated_at.toISOString === 'function' ? row.updated_at.toISOString() : row.updated_at) : parsedData.updatedAt,
    };
  });
}

async function findProjectPlanById(id) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT id, plan_id, plan_code, plan_name, project_id, project_code, project_type, category, status, taskmodule, plan_data, plan_document, created_at, updated_at, created_by, updated_by FROM project_plan WHERE id = ? LIMIT 1`,
    [id]
  );
  const row = rows[0];
  if (!row) return null;

  let parsedData = {};
  try {
    parsedData = row.plan_data ? (typeof row.plan_data === 'string' ? JSON.parse(row.plan_data) : row.plan_data) : {};
  } catch (e) {
    console.error(`Failed to parse plan_data for plan id ${id}:`, e);
    parsedData = {};
  }

  let taskmodule = [];
  try {
    taskmodule = row.taskmodule ? (typeof row.taskmodule === 'string' ? JSON.parse(row.taskmodule) : row.taskmodule) : [];
  } catch (e) {
    console.error(`Failed to parse taskmodule for plan id ${id}:`, e);
    taskmodule = [];
  }

  const rawModules = (Array.isArray(taskmodule) && taskmodule.length > 0)
    ? taskmodule
    : (Array.isArray(parsedData.modules) && parsedData.modules.length > 0
      ? parsedData.modules
      : parseArrayField(parsedData.modules || parsedData.taskmodule));

  const finalModules = Array.isArray(rawModules) ? rawModules : [];

  const finalIncludedModules = (Array.isArray(parsedData.includedModules) && parsedData.includedModules.length > 0)
    ? parsedData.includedModules
    : finalModules.map((m) => (typeof m === 'object' ? (m.title || m.module_name || m.name || '') : String(m))).filter(Boolean);

  return {
    ...parsedData,
    id: row.id,
    planId: row.plan_id || parsedData.planId,
    planCode: row.plan_code || parsedData.planCode,
    planName: row.plan_name || parsedData.planName,
    projectId: row.project_id || parsedData.projectId || parsedData.project_id || null,
    projectCode: row.project_code || parsedData.projectCode || parsedData.project_code || null,
    projectType: row.project_type || parsedData.projectType,
    category: row.category || parsedData.category,
    status: row.status || parsedData.status,
    taskmodule: finalModules,
    modules: finalModules,
    includedModules: finalIncludedModules,
    technologyStack: Array.isArray(parsedData.technologyStack) ? parsedData.technologyStack : parseArrayField(parsedData.technologyStack),
    planDocument: row.plan_document || parsedData.planDocument || null,
    createdBy: row.created_by || parsedData.createdBy || null,
    updatedBy: row.updated_by || parsedData.updatedBy || null,
    createdAt: row.created_at ? (typeof row.created_at.toISOString === 'function' ? row.created_at.toISOString() : row.created_at) : parsedData.createdAt,
    updatedAt: row.updated_at ? (typeof row.updated_at.toISOString === 'function' ? row.updated_at.toISOString() : row.updated_at) : parsedData.updatedAt,
  };
}

async function updateProjectPlan(id, plan = {}) {
  const db = getDB();
  const normalizedPlan = normalizePlanPayload(plan);
  const [existingRows] = await db.execute(
    `SELECT plan_id, plan_code, plan_name, project_id, project_code, project_type, category, status, taskmodule, plan_data, plan_document FROM project_plan WHERE id = ? LIMIT 1`,
    [id]
  );
  if (!existingRows.length) return null;

  let existingPlanData = {};
  try {
    existingPlanData = existingRows[0].plan_data
      ? (typeof existingRows[0].plan_data === 'string' ? JSON.parse(existingRows[0].plan_data) : existingRows[0].plan_data)
      : {};
  } catch (e) {
    existingPlanData = {};
  }

  const mergedPlanData = {
    ...existingPlanData,
    ...normalizedPlan,
  };

  await db.execute(
    `UPDATE project_plan SET plan_id = ?, plan_code = ?, plan_name = ?, project_id = ?, project_code = ?, project_type = ?, category = ?, status = ?, taskmodule = ?, plan_data = ?, plan_document = ?, updated_by = ? WHERE id = ?`,
    [
      normalizedPlan.planId || existingRows[0].plan_id,
      normalizedPlan.planCode || existingRows[0].plan_code,
      normalizedPlan.planName || existingRows[0].plan_name,
      normalizedPlan.projectId || existingRows[0].project_id,
      normalizedPlan.projectCode || existingRows[0].project_code,
      normalizedPlan.projectType || existingRows[0].project_type,
      normalizedPlan.category || existingRows[0].category,
      normalizedPlan.status || existingRows[0].status,
      JSON.stringify(normalizedPlan.modules || []),
      JSON.stringify(mergedPlanData),
      normalizedPlan.plan_document !== undefined ? normalizedPlan.plan_document : existingRows[0].plan_document,
      normalizedPlan.updatedBy || null,
      id,
    ]
  );
  return findProjectPlanById(id);
}

async function deleteProjectPlan(id) {
  const db = getDB();
  await db.execute(`DELETE FROM project_plan WHERE id = ?`, [id]);
}

module.exports = {
  createProjectPlan,
  listProjectPlans,
  findProjectPlanById,
  updateProjectPlan,
  deleteProjectPlan,
};
