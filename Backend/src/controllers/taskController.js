const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { createTask, findTaskByUUID, listTasks, updateTask, deleteTask } = require('../models/taskModel');
const { findProjectByUUID } = require('../models/projectModel');
const { getDB } = require('../config/db');

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const STATUSES = ['Pending', 'To Do', 'In Progress', 'Review', 'Testing', 'Completed', 'On Hold', 'Cancelled'];

const taskUploadDir = path.join(__dirname, '../../uploads/tasks');
if (!fs.existsSync(taskUploadDir)) fs.mkdirSync(taskUploadDir, { recursive: true });

function ok(res, data, code = 200) {
  return res.status(code).json({ success: true, ...data });
}
function fail(res, message, code = 500) {
  return res.status(code).json({ success: false, message });
}

/**
 * Decode a base64 string and save it as a file on disk.
 * Returns an attachment metadata object, or null if nothing to save.
 */
function saveBase64File(base64, originalName, mimeType) {
  if (!base64 || !originalName) return null;
  try {
    const ext = path.extname(originalName) || '';
    const filename = `${Date.now()}-${uuidv4().slice(0, 8)}${ext}`;
    const filePath = path.join(taskUploadDir, filename);
    const buffer = Buffer.from(base64, 'base64');
    fs.writeFileSync(filePath, buffer);
    return {
      original_name: originalName,
      filename,
      path: `uploads/tasks/${filename}`,
      mimetype: mimeType || 'application/octet-stream',
      size: buffer.length,
      uploaded_at: new Date().toISOString(),
    };
  } catch (e) {
    console.error('saveBase64File error:', e);
    return null;
  }
}

function mergeAttachments(existingJson, newEntry) {
  const list = (() => { try { return JSON.parse(existingJson || '[]'); } catch { return []; } })();
  if (newEntry) list.push(newEntry);
  return list.length ? JSON.stringify(list) : null;
}

/* ─── GET ALL ─── */
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

/* ─── GET ONE ─── */
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

/* ─── CREATE ─── */
async function createTaskHandler(req, res) {
  try {
    const {
      project_id, module_name, task_name, description,
      category, parent_task_uuid, assigned_to, assigned_by,
      team, assignment_date, start_date, due_date, completion_date,
      estimated_hours, actual_hours, time_spent, remaining_hours,
      priority, status, progress, comments, internal_notes, client_notes,
      // Base64 file fields sent from frontend
      attachmentBase64, attachmentName, attachmentType,
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

    const fileEntry = saveBase64File(attachmentBase64, attachmentName, attachmentType);

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
      is_overdue: due_date ? (new Date(due_date).setHours(23, 59, 59, 999) < Date.now() ? 1 : 0) : 0,
      attachments: mergeAttachments(null, fileEntry),
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

/* ─── UPDATE ─── */
async function updateTaskHandler(req, res) {
  try {
    const task = await findTaskByUUID(req.params.id);
    if (!task) return fail(res, 'Task not found', 404);

    const {
      attachmentBase64, attachmentName, attachmentType,
      ...updates
    } = req.body;

    // Save new file if provided, merge with existing
    const fileEntry = saveBase64File(attachmentBase64, attachmentName, attachmentType);
    if (fileEntry) {
      updates.attachments = mergeAttachments(task.attachments, fileEntry);
    }

    if (updates.project_id) {
      const project = await findProjectByUUID(updates.project_id);
      if (!project) return fail(res, 'Project not found', 404);
      updates.project_id = project.id;
    }

    if (updates.task_name) updates.task_name = updates.task_name.toString().trim();
    if (updates.priority && !PRIORITIES.includes(updates.priority)) {
      return fail(res, `Invalid priority. Allowed: ${PRIORITIES.join(', ')}`, 400);
    }
    if (updates.status && !STATUSES.includes(updates.status)) {
      return fail(res, `Invalid status. Allowed: ${STATUSES.join(', ')}`, 400);
    }
    if (updates.attachments && typeof updates.attachments !== 'string') {
      updates.attachments = JSON.stringify(updates.attachments);
    }

    updates.updated_by = req.user?.user_id || 'SYSTEM';
    const updated = await updateTask(req.params.id, updates);
    return ok(res, { message: 'Task updated successfully', data: updated });
  } catch (err) {
    console.error('updateTaskHandler:', err);
    return fail(res, 'Failed to update task');
  }
}

/* ─── DELETE ─── */
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
