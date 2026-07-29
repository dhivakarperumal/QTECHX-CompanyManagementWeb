const { getDB } = require('../config/db');

async function createProjectPlan(plan = {}) {
  const db = getDB();
  const [result] = await db.execute(
    `INSERT INTO project_plan (
      plan_id, plan_code, plan_name, project_type, category, status,
      plan_data, created_by, updated_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      plan.planId || null,
      plan.planCode || null,
      plan.planName || null,
      plan.projectType || null,
      plan.category || null,
      plan.status || 'Draft',
      JSON.stringify(plan),
      plan.createdBy || null,
      plan.updatedBy || null,
    ]
  );
  return findProjectPlanById(result.insertId);
}

async function listProjectPlans() {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT id, plan_id, plan_code, plan_name, project_type, category, status, plan_data, created_at, updated_at FROM project_plan ORDER BY updated_at DESC`
  );
  return rows.map((row) => {
    const parsedData = row.plan_data ? JSON.parse(row.plan_data) : {};
    return {
      ...parsedData,
      id: row.id,
      planId: row.plan_id || parsedData.planId,
      planCode: row.plan_code || parsedData.planCode,
      planName: row.plan_name || parsedData.planName,
      projectType: row.project_type || parsedData.projectType,
      category: row.category || parsedData.category,
      status: row.status || parsedData.status,
      createdAt: row.created_at ? row.created_at.toISOString() : parsedData.createdAt,
      updatedAt: row.updated_at ? row.updated_at.toISOString() : parsedData.updatedAt,
    };
  });
}

async function findProjectPlanById(id) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT id, plan_id, plan_code, plan_name, project_type, category, status, plan_data, created_at, updated_at FROM project_plan WHERE id = ? LIMIT 1`,
    [id]
  );
  const row = rows[0];
  if (!row) return null;
  const parsedData = row.plan_data ? JSON.parse(row.plan_data) : {};
  return {
    ...parsedData,
    id: row.id,
    planId: row.plan_id || parsedData.planId,
    planCode: row.plan_code || parsedData.planCode,
    planName: row.plan_name || parsedData.planName,
    projectType: row.project_type || parsedData.projectType,
    category: row.category || parsedData.category,
    status: row.status || parsedData.status,
    createdAt: row.created_at ? row.created_at.toISOString() : parsedData.createdAt,
    updatedAt: row.updated_at ? row.updated_at.toISOString() : parsedData.updatedAt,
  };
}

async function updateProjectPlan(id, plan = {}) {
  const db = getDB();
  const [existingRows] = await db.execute(`SELECT plan_id, plan_code, plan_name, project_type, category, status FROM project_plan WHERE id = ? LIMIT 1`, [id]);
  if (!existingRows.length) return null;
  await db.execute(
    `UPDATE project_plan SET plan_id = ?, plan_code = ?, plan_name = ?, project_type = ?, category = ?, status = ?, plan_data = ?, updated_by = ? WHERE id = ?`,
    [
      plan.planId || existingRows[0].plan_id,
      plan.planCode || existingRows[0].plan_code,
      plan.planName || existingRows[0].plan_name,
      plan.projectType || existingRows[0].project_type,
      plan.category || existingRows[0].category,
      plan.status || existingRows[0].status,
      JSON.stringify(plan),
      plan.updatedBy || null,
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
