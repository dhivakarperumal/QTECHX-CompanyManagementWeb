const { getDB } = require("../config/db");

async function createExpense(expenseData) {
  const db = getDB();
  const fields = Object.keys(expenseData).filter(key => expenseData[key] !== undefined);
  const values = fields.map(key => expenseData[key]);
  const placeholders = fields.map(() => "?").join(", ");
  
  const [result] = await db.execute(
    `INSERT INTO expenses (${fields.join(", ")}) VALUES (${placeholders})`,
    values
  );
  
  // If the table uses an auto-increment id, we can fetch it this way.
  // We'll also attempt to fetch by expense_id if it's passed in expenseData.
  const fetchId = result.insertId || expenseData.expense_id;
  return getExpenseById(fetchId);
}

async function getExpenseById(id) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT * FROM expenses WHERE id = ? OR expense_id = ?`,
    [id, id]
  );
  return rows[0] || null;
}

async function getAllExpenses() {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT * FROM expenses ORDER BY created_at DESC`
  );
  return rows;
}

async function updateExpense(id, expenseData) {
  const db = getDB();
  const fields = Object.keys(expenseData).filter(key => expenseData[key] !== undefined);
  if (fields.length === 0) return getExpenseById(id);
  
  const setClause = fields.map(key => `${key} = ?`).join(", ");
  const values = fields.map(key => expenseData[key]);
  values.push(id);
  values.push(id); // For matching either id or expense_id
  
  await db.execute(
    `UPDATE expenses SET ${setClause} WHERE id = ? OR expense_id = ?`,
    values
  );
  return getExpenseById(id);
}

async function deleteExpense(id) {
  const db = getDB();
  const [result] = await db.execute(
    `DELETE FROM expenses WHERE id = ? OR expense_id = ?`,
    [id, id]
  );
  return result.affectedRows > 0;
}

module.exports = {
  createExpense,
  getExpenseById,
  getAllExpenses,
  updateExpense,
  deleteExpense
};
