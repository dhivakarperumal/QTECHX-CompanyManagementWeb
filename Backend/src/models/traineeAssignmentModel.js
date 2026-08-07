const { getDB } = require("../config/db");

const TraineeAssignmentModel = {
  // Create a new assignment
  createAssignment: async (assignmentData) => {
    const db = getDB();
    const query = `
      INSERT INTO trainee_employee_assignments (
        trainee_id, employee_id, trainee_name, trainee_code, trainee_email,
        trainee_phone, trainee_department, trainee_designation, trainee_course,
        trainee_batch, trainee_joining_date, employee_name, employee_code,
        employee_email, employee_phone, employee_department, employee_designation,
        assigned_date, expected_completion_date, priority, notes, status,
        assigned_by, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      assignmentData.trainee_id,
      assignmentData.employee_id,
      assignmentData.trainee_name,
      assignmentData.trainee_code,
      assignmentData.trainee_email,
      assignmentData.trainee_phone,
      assignmentData.trainee_department,
      assignmentData.trainee_designation,
      assignmentData.trainee_course,
      assignmentData.trainee_batch,
      assignmentData.trainee_joining_date,
      assignmentData.employee_name,
      assignmentData.employee_code,
      assignmentData.employee_email,
      assignmentData.employee_phone,
      assignmentData.employee_department,
      assignmentData.employee_designation,
      assignmentData.assigned_date,
      assignmentData.expected_completion_date || null,
      assignmentData.priority || 'Medium',
      assignmentData.notes || null,
      assignmentData.status || 'Active',
      assignmentData.assigned_by,
      assignmentData.created_by,
      assignmentData.updated_by
    ];

    const [result] = await db.execute(query, values);
    return result.insertId;
  },

  // Mark all active assignments for a specific trainee as completed
  markPreviousAssignmentsCompleted: async (traineeId, updatedBy) => {
    const db = getDB();
    const query = `
      UPDATE trainee_employee_assignments 
      SET status = 'Completed', updated_by = ?, updated_at = CURRENT_TIMESTAMP
      WHERE trainee_id = ? AND status = 'Active'
    `;
    const [result] = await db.execute(query, [updatedBy, traineeId]);
    return result.affectedRows;
  },

  // Get active assignment for a trainee
  getActiveAssignmentByTraineeId: async (traineeId) => {
    const db = getDB();
    const query = `
      SELECT * FROM trainee_employee_assignments
      WHERE trainee_id = ? AND status = 'Active'
      LIMIT 1
    `;
    const [rows] = await db.execute(query, [traineeId]);
    return rows[0] || null;
  },

  // Get assignment history for a trainee
  getAssignmentHistory: async (traineeId) => {
    const db = getDB();
    const query = `
      SELECT * FROM trainee_employee_assignments
      WHERE trainee_id = ?
      ORDER BY created_at DESC
    `;
    const [rows] = await db.execute(query, [traineeId]);
    return rows;
  },
  
  // Get all active assignments to calculate trainee counts for employees
  getActiveAssignmentsCountPerEmployee: async () => {
    const db = getDB();
    const query = `
      SELECT employee_id, COUNT(*) as trainee_count 
      FROM trainee_employee_assignments 
      WHERE status = 'Active' 
      GROUP BY employee_id
    `;
    const [rows] = await db.execute(query);
    return rows;
  }
};

module.exports = TraineeAssignmentModel;
