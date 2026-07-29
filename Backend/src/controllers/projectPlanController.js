const {
  createProjectPlan,
  listProjectPlans,
  findProjectPlanById,
  updateProjectPlan,
  deleteProjectPlan,
} = require('../models/projectPlanModel');

function ok(res, data, code = 200) {
  return res.status(code).json({ success: true, ...data });
}

function fail(res, message, code = 500, error = undefined) {
  return res.status(code).json({ success: false, message, ...(error ? { error } : {}) });
}

async function getAllProjectPlansHandler(req, res) {
  try {
    const plans = await listProjectPlans();
    return ok(res, { data: plans });
  } catch (err) {
    console.error('getAllProjectPlansHandler:', err);
    return fail(res, 'Failed to retrieve project plans', 500, err.message);
  }
}

async function createProjectPlanHandler(req, res) {
  try {
    const planPayload = {
      ...req.body,
      plan_document: req.file
        ? `/uploads/projects/project_plans/${req.file.filename}`
        : (req.body.plan_document ?? req.body.planDocument ?? null),
    };
    const plan = await createProjectPlan(planPayload);
    return ok(res, { message: 'Project plan created successfully', data: plan }, 201);
  } catch (err) {
    console.error('createProjectPlanHandler:', err);
    return fail(res, 'Failed to create project plan', 500, err.message);
  }
}

async function updateProjectPlanHandler(req, res) {
  try {
    const planPayload = {
      ...req.body,
      plan_document: req.file
        ? `/uploads/projects/project_plans/${req.file.filename}`
        : (req.body.plan_document ?? req.body.planDocument ?? undefined),
    };
    const plan = await updateProjectPlan(req.params.id, planPayload);
    if (!plan) return fail(res, 'Project plan not found', 404);
    return ok(res, { message: 'Project plan updated successfully', data: plan });
  } catch (err) {
    console.error('updateProjectPlanHandler:', err);
    return fail(res, 'Failed to update project plan', 500, err.message);
  }
}

async function getProjectPlanHandler(req, res) {
  try {
    const plan = await findProjectPlanById(req.params.id);
    if (!plan) return fail(res, 'Project plan not found', 404);
    return ok(res, { data: plan });
  } catch (err) {
    console.error('getProjectPlanHandler:', err);
    return fail(res, 'Failed to retrieve project plan', 500, err.message);
  }
}

async function deleteProjectPlanHandler(req, res) {
  try {
    await deleteProjectPlan(req.params.id);
    return ok(res, { message: 'Project plan deleted successfully' });
  } catch (err) {
    console.error('deleteProjectPlanHandler:', err);
    return fail(res, 'Failed to delete project plan', 500, err.message);
  }
}

module.exports = {
  getAllProjectPlansHandler,
  createProjectPlanHandler,
  getProjectPlanHandler,
  updateProjectPlanHandler,
  deleteProjectPlanHandler,
};
