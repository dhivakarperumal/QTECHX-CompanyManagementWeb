const { getDB } = require("../config/db");

async function createLeave(leaveData) {
  const db = getDB();
  const fields = Object.keys(leaveData).filter(key => leaveData[key] !== undefined);
  const values = fields.map(key => leaveData[key]);
  const placeholders = fields.map(() => "?").join(", ");
  
  const [result] = await db.execute(
    `INSERT INTO employee_leaves (${fields.join(", ")}) VALUES (${placeholders})`,
    values
  );
  return getLeaveById(result.insertId);
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
    `SELECT el.*, e.first_name, e.last_name, e.employee_code, e.profile_photo 
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
  createLeave,
  getLeaveById,
  getLeavesByEmployeeId,
  getAllLeaves,
  updateLeaveStatus
};
