const { getDB } = require("../config/db");

const TraineeAssignmentModel = {
  // Create a new assignment
  createAssignment: async (assignmentData) => {
    const db = getDB();
    const query = `
      INSERT INTO trainee_employee_assignments (
        trainee_id, employee_id, trainee_name, trainee_code, trainee_email,
        trainee_phone, trainee_department, trainee_designation, trainee_course,
        trainee_batch, trainee_joining_date, person_type, person_name, person_id,
        person_email, person_phone, department, designation, course, batch,
        joining_date, employee_name, employee_code, employee_email, employee_phone,
        employee_department, employee_designation, assigned_date,
        expected_completion_date, priority, notes, status,
        assigned_by, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      assignmentData.trainee_id ?? null,
      assignmentData.employee_id ?? null,
      assignmentData.trainee_name ?? null,
      assignmentData.trainee_code ?? null,
      assignmentData.trainee_email ?? null,
      assignmentData.trainee_phone ?? null,
      assignmentData.trainee_department ?? null,
      assignmentData.trainee_designation ?? null,
      assignmentData.trainee_course ?? null,
      assignmentData.trainee_batch ?? null,
      assignmentData.trainee_joining_date ?? null,
      assignmentData.person_type ?? null,
      assignmentData.person_name ?? null,
      assignmentData.person_id ?? null,
      assignmentData.person_email ?? null,
      assignmentData.person_phone ?? null,
      assignmentData.department ?? null,
      assignmentData.designation ?? null,
      assignmentData.course ?? null,
      assignmentData.batch ?? null,
      assignmentData.joining_date ?? null,
      assignmentData.employee_name ?? null,
      assignmentData.employee_code ?? null,
      assignmentData.employee_email ?? null,
      assignmentData.employee_phone ?? null,
      assignmentData.employee_department ?? null,
      assignmentData.employee_designation ?? null,
      assignmentData.assigned_date ?? null,
      assignmentData.expected_completion_date ?? null,
      assignmentData.priority ?? 'Medium',
      assignmentData.notes ?? null,
      assignmentData.status ?? 'Active',
      assignmentData.assigned_by ?? null,
      assignmentData.created_by ?? null,
      assignmentData.updated_by ?? null
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
