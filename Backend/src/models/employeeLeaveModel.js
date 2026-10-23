const { getDB } = require("../config/db");

async function createLeaveIfNoPending(leaveData) {
  const db = getDB();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();
    await connection.execute(
      `SELECT employee_id FROM employees WHERE employee_id = ? FOR UPDATE`,
      [leaveData.employee_id]
    );

    const [pendingRows] = await connection.execute(
      `SELECT id FROM employee_leaves
       WHERE employee_id = ? AND LOWER(TRIM(status)) = 'pending'
       LIMIT 1`,
      [leaveData.employee_id]
    );

    if (pendingRows.length > 0) {
      await connection.rollback();
      return null;
    }

    const fields = Object.keys(leaveData).filter(key => leaveData[key] !== undefined);
    const values = fields.map(key => leaveData[key]);
    const placeholders = fields.map(() => "?").join(", ");
    const [result] = await connection.execute(
      `INSERT INTO employee_leaves (${fields.join(", ")}) VALUES (${placeholders})`,
      values
    );
    const [rows] = await connection.execute(
      `SELECT * FROM employee_leaves WHERE id = ?`,
      [result.insertId]
    );

    await connection.commit();
    return rows[0] || null;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getLeaveById(id) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT * FROM employee_leaves WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function getLeavesByEmployeeId(employeeId) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT * FROM employee_leaves WHERE employee_id = ? ORDER BY created_at DESC`,
    [employeeId]
  );
  return rows;
}

async function getAllLeaves() {
  const db = getDB();
  // Join with employees table to get employee details
  const [rows] = await db.execute(
    `SELECT el.*, e.first_name, e.last_name, e.employee_code, e.profile_photo, e.status AS employee_status, e.employment_status AS employee_employment_status 
     FROM employee_leaves el
     LEFT JOIN employees e ON el.employee_id = e.employee_id
     ORDER BY el.created_at DESC`
  );
  return rows;
}

async function updateLeaveStatus(id, status, adminReason, updatedBy) {
  const db = getDB();
  await db.execute(
    `UPDATE employee_leaves 
     SET status = ?, admin_reason = ?, updated_by = ? 
     WHERE id = ?`,
    [status, adminReason, updatedBy, id]
  );
  return getLeaveById(id);
}

module.exports = {
  createLeaveIfNoPending,
  getLeaveById,
  getLeavesByEmployeeId,
  getAllLeaves,
  updateLeaveStatus
};
