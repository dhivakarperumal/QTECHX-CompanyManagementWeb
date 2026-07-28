const { v4: uuidv4 } = require('uuid');
const { createTask, findTaskByUUID, listTasks, updateTask, deleteTask } = require('../models/taskModel');
const { findProjectByUUID, findProjectById } = require('../models/projectModel');
const { getDB } = require('../config/db');

const PRIORITIES = ['Low','Medium','High','Critical'];
const STATUSES = ['Pending','To Do','In Progress','Review','Testing','Completed','On Hold','Cancelled'];

function ok(res, data, code = 200) {
  return res.status(code).json({ success: true, ...data });
}
function fail(res, message, code = 500) {
  return res.status(code).json({ success: false, message });
}

async function getAllTasksHandler(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const { search, status, assigned_to } = req.query;
    let { project_id } = req.query;

    if (project_id && typeof project_id === 'string' && project_id.length === 36) {
      const project = await findProjectByUUID(project_id);
      if (!project) return fail(res, 'Project not found', 404);
      project_id = project.id;
    }

    const result = await listTasks({ page, limit, search, status, project_id, assigned_to });
    return ok(res, {
      data: result.rows,
      pagination: { page, limit, total: result.total, pages: Math.ceil(result.total / limit) },
    });
  } catch (err) {
    console.error('getAllTasksHandler:', err);
    return fail(res, 'Failed to retrieve tasks');
  }
}

async function getTaskByIdHandler(req, res) {
  try {
    const task = await findTaskByUUID(req.params.id);
    if (!task) return fail(res, 'Task not found', 404);
    return ok(res, { data: task });
  } catch (err) {
    console.error('getTaskByIdHandler:', err);
    return fail(res, 'Failed to retrieve task');
  }
}

async function createTaskHandler(req, res) {
  try {
    const {
      project_id, module_name, task_name, description,
      category, parent_task_uuid, assigned_to, assigned_by,
      team, assignment_date, start_date, due_date, completion_date,
      estimated_hours, actual_hours, time_spent, remaining_hours,
      priority, status, progress, attachments, comments, internal_notes,
      client_notes,
    } = req.body;

    const trimmedName = task_name?.toString().trim();
    if (!trimmedName) return fail(res, 'Task name is required', 400);
    if (!project_id) return fail(res, 'Project is required', 400);
    if (priority && !PRIORITIES.includes(priority)) {
      return fail(res, `Invalid priority. Allowed: ${PRIORITIES.join(', ')}`, 400);
    }
    if (status && !STATUSES.includes(status)) {
      return fail(res, `Invalid status. Allowed: ${STATUSES.join(', ')}`, 400);
    }

    const project = await findProjectByUUID(project_id);
    if (!project) return fail(res, 'Project not found', 404);

    const task = await createTask({
      uuid: uuidv4(),
      project_id: project.id,
      module_name: module_name || null,
      task_name: trimmedName,
      description: description || null,
      category: category || null,
      parent_task_uuid: parent_task_uuid || null,
      assigned_to: assigned_to || null,
      assigned_by: assigned_by || null,
      team: team || null,
      assignment_date: assignment_date || null,
      start_date: start_date || null,
      due_date: due_date || null,
      completion_date: completion_date || null,
      estimated_hours: estimated_hours || 0,
      actual_hours: actual_hours || 0,
      time_spent: time_spent || 0,
      remaining_hours: remaining_hours || 0,
      priority: priority || 'Medium',
      status: status || 'Pending',
      progress: progress || 0,
      is_overdue: due_date ? (new Date(due_date).setHours(23,59,59,999) < Date.now() ? 1 : 0) : 0,
      attachments: attachments ? JSON.stringify(attachments) : null,
      comments: comments || null,
      internal_notes: internal_notes || null,
      client_notes: client_notes || null,
      created_by: req.user?.user_id || 'SYSTEM',
      updated_by: req.user?.user_id || 'SYSTEM',
    });

    return ok(res, { message: 'Task created successfully', data: task }, 201);
  } catch (err) {
    console.error('createTaskHandler:', err);
    return fail(res, 'Failed to create task');
  }
}

async function updateTaskHandler(req, res) {
  try {
    const task = await findTaskByUUID(req.params.id);
    if (!task) return fail(res, 'Task not found', 404);
    const updates = { ...req.body };
    if (updates.task_name) updates.task_name = updates.task_name.toString().trim();
    if (updates.priority && !PRIORITIES.includes(updates.priority)) {
      return fail(res, `Invalid priority. Allowed: ${PRIORITIES.join(', ')}`, 400);
    }
    if (updates.status && !STATUSES.includes(updates.status)) {
      return fail(res, `Invalid status. Allowed: ${STATUSES.join(', ')}`, 400);
    }
    if (updates.attachments) updates.attachments = JSON.stringify(updates.attachments);
    updates.updated_by = req.user?.user_id || 'SYSTEM';
    const updated = await updateTask(req.params.id, updates);
    return ok(res, { message: 'Task updated successfully', data: updated });
  } catch (err) {
    console.error('updateTaskHandler:', err);
    return fail(res, 'Failed to update task');
  }
}

async function deleteTaskHandler(req, res) {
  try {
    const task = await findTaskByUUID(req.params.id);
    if (!task) return fail(res, 'Task not found', 404);
    await deleteTask(req.params.id);
    return ok(res, { message: 'Task deleted successfully' });
  } catch (err) {
    console.error('deleteTaskHandler:', err);
    return fail(res, 'Failed to delete task');
  }
}

module.exports = {
  getAllTasksHandler,
  getTaskByIdHandler,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
};
