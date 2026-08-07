const { getDB } = require("../config/db");
const { v4: uuidv4 } = require("uuid");

// --- Trainee Tasks (Master) ---

exports.getTraineeTasks = async (req, res) => {
  try {
    const db = getDB();
    const [rows] = await db.execute("SELECT * FROM trainee_tasks ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching trainee tasks:", error);
    res.status(500).json({ error: "Failed to fetch trainee tasks" });
  }
};

exports.createTraineeTask = async (req, res) => {
  try {
    const { task_name, description } = req.body;
    const db = getDB();
    const uuid = uuidv4();
    const actor = req.user ? req.user.user_id || req.user.id || req.user.uuid : null;
    const documentPath = req.file ? `/uploads/tasks/${req.file.filename}` : null;

    console.log('[TraineeTask] createTraineeTask req.user:', req.user);
    console.log('[TraineeTask] audit actor for create:', actor);

    await db.execute(
      `INSERT INTO trainee_tasks (uuid, task_name, description, document_path, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?)`,
      [uuid, task_name, description, documentPath, actor, actor]
    );

    res.status(201).json({ message: "Task created successfully", uuid });
  } catch (error) {
    console.error("Error creating trainee task:", error);
    res.status(500).json({ error: "Failed to create trainee task" });
  }
};

exports.updateTraineeTask = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { task_name, description } = req.body;
    const db = getDB();
    const actor = req.user ? req.user.user_id || req.user.id || req.user.uuid : null;
    const updates = [];
    const values = [];

    if (task_name !== undefined) {
      updates.push("task_name = ?");
      values.push(task_name);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description);
    }
    if (req.file) {
      updates.push("document_path = ?");
      values.push(`/uploads/tasks/${req.file.filename}`);
    }

    if (updates.length) {
      updates.push("updated_by = ?");
      values.push(actor);
      values.push(uuid);
      await db.execute(`UPDATE trainee_tasks SET ${updates.join(", ")} WHERE uuid = ?`, values);
    }

    res.json({ message: "Task updated successfully" });
  } catch (error) {
    console.error("Error updating trainee task:", error);
    res.status(500).json({ error: "Failed to update trainee task" });
  }
};

exports.deleteTraineeTask = async (req, res) => {
  try {
    const { uuid } = req.params;
    const db = getDB();

    await db.execute(`DELETE FROM trainee_tasks WHERE uuid = ?`, [uuid]);
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting trainee task:", error);
    res.status(500).json({ error: "Failed to delete trainee task" });
  }
};

// --- Trainee Task Assignments ---

exports.getAssignments = async (req, res) => {
  try {
    const { trainee_id, employee_id } = req.query;
    const db = getDB();

    let query = `
      SELECT tta.*, tt.task_name, tt.description, tt.document_path AS task_document_path, ti.full_name as trainee_name, ti.type as trainee_type
      FROM trainee_task_assignments tta
      JOIN trainee_tasks tt ON tta.trainee_task_id = tt.id
      JOIN trainee_intern ti ON tta.trainee_intern_id = ti.uuid
    `;

    const params = [];
    const conditions = [];

    if (employee_id) {
      query += `
        JOIN trainee_employee_assignments tea
          ON tea.trainee_id = tta.trainee_intern_id
          AND tea.status = 'Active'
      `;
      conditions.push(`tea.employee_id = ?`);
      params.push(employee_id);
    }

    if (trainee_id) {
      conditions.push(`tta.trainee_intern_id = ?`);
      params.push(trainee_id);
    }

    if (conditions.length) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY tta.created_at DESC `;

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    res.status(500).json({ error: "Failed to fetch task assignments" });
  }
};

exports.assignTask = async (req, res) => {
  try {
    const { trainee_task_uuid, trainee_intern_uuid, assigned_date, assigned_time, due_date } = req.body;
    const assignmentDocumentPath = req.file ? `/uploads/tasks/${req.file.filename}` : null;
    const db = getDB();
    const uuid = uuidv4();
    const created_by = req.user ? req.user.user_id : null;

    // Get trainee_task_id from uuid
    const [taskRows] = await db.execute("SELECT id FROM trainee_tasks WHERE uuid = ?", [trainee_task_uuid]);
    if (taskRows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    const trainee_task_id = taskRows[0].id;

    await db.execute(
      `INSERT INTO trainee_task_assignments 
        (uuid, trainee_task_id, trainee_intern_id, assigned_date, assigned_time, due_date, assignment_document_path, created_by) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [uuid, trainee_task_id, trainee_intern_uuid, assigned_date, assigned_time, due_date, assignmentDocumentPath, created_by]
    );

    res.status(201).json({ message: "Task assigned successfully", uuid });
  } catch (error) {
    console.error("Error assigning task:", error);
    res.status(500).json({ error: "Failed to assign task" });
  }
};

exports.updateAssignment = async (req, res) => {
  try {
    const { uuid } = req.params;
    const { status, progress, daily_report, due_date } = req.body;
    const assignmentDocumentPath = req.file ? `/uploads/tasks/${req.file.filename}` : null;
    const db = getDB();
    const updated_by = req.user ? req.user.user_id : null;

    const updateFields = [
      "status = ?",
      "progress = ?",
      "daily_report = ?",
      "due_date = ?",
      "updated_by = ?"
    ];
    const values = [status, progress, daily_report, due_date, updated_by];

    if (assignmentDocumentPath) {
      updateFields.push("assignment_document_path = ?");
      values.push(assignmentDocumentPath);
    }

    values.push(uuid);

    await db.execute(
      `UPDATE trainee_task_assignments 
       SET ${updateFields.join(", ")} 
       WHERE uuid = ?`,
      values
    );

    res.json({ message: "Assignment updated successfully" });
  } catch (error) {
    console.error("Error updating assignment:", error);
    res.status(500).json({ error: "Failed to update assignment" });
  }
};

exports.deleteAssignment = async (req, res) => {
  try {
    const { uuid } = req.params;
    const db = getDB();

    await db.execute(`DELETE FROM trainee_task_assignments WHERE uuid = ?`, [uuid]);
    res.json({ message: "Assignment deleted successfully" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    res.status(500).json({ error: "Failed to delete assignment" });
  }
};
