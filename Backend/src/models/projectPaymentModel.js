const { getDB } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

async function createProjectPayment(data) {
  const db = getDB();
  const uuid = uuidv4();
  
  const [result] = await db.execute(
    `INSERT INTO project_payments (
      uuid, project_id, client_name, paid_to, amount_paid, reason_for_payment, date_of_payment, time_of_payment, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      uuid,
      data.project_id,
      data.client_name || null,
      data.paid_to || null,
      data.amount_paid,
      data.reason_for_payment || null,
      data.date_of_payment,
      data.time_of_payment,
      data.created_by || null
    ]
  );
  
  return getProjectPaymentById(result.insertId);
}

async function getProjectPaymentById(id) {
  const db = getDB();
  const [rows] = await db.execute('SELECT * FROM project_payments WHERE id = ?', [id]);
  return rows[0] || null;
}

async function getProjectPaymentsByProjectId(projectId) {
  const db = getDB();
  const [rows] = await db.execute('SELECT * FROM project_payments WHERE project_id = ? ORDER BY created_at DESC', [projectId]);
  return rows;
}

async function getAllProjectPayments() {
  const db = getDB();
  const [rows] = await db.execute(`
    SELECT pp.*, p.project_name, p.project_code, p.total_project_cost 
    FROM project_payments pp
    JOIN projects p ON pp.project_id = p.id
    ORDER BY pp.created_at DESC
  `);
  return rows;
}

async function getProjectPaymentSummary(projectId) {
  const db = getDB();
  const [rows] = await db.execute('SELECT SUM(amount_paid) as total_paid FROM project_payments WHERE project_id = ?', [projectId]);
  const totalPaid = rows[0]?.total_paid || 0;
  
  const [projectRows] = await db.execute('SELECT total_project_cost FROM projects WHERE id = ?', [projectId]);
  const totalCost = projectRows[0]?.total_project_cost || 0;
  
  return {
    total_cost: totalCost,
    total_paid: totalPaid,
    balance: totalCost - totalPaid
  };
}

module.exports = {
  createProjectPayment,
  getProjectPaymentById,
  getProjectPaymentsByProjectId,
  getAllProjectPayments,
  getProjectPaymentSummary
};
