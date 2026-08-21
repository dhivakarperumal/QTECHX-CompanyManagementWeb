const { getDB } = require("../config/db");
const { v4: uuidv4 } = require("uuid");

exports.createExpense = async (req, res) => {
  const pool = getDB();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const actor = req.user?.user_id || req.body.created_by || null;
    const {
      expense_type,
      date_of_payment,
      amount,
      payment_type,
      paid_to,
      description,
      invoice_number
    } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ success: false, message: "Valid amount is required" });
    }

    // Check available fund
    const [fundRows] = await connection.query("SELECT available_fund FROM company_funds ORDER BY id DESC LIMIT 1");
    let current_fund = fundRows.length > 0 ? parseFloat(fundRows[0].available_fund) : 0.00;
    let expenseAmount = parseFloat(amount);

    if (current_fund < expenseAmount) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "Insufficient funds" });
    }

    // Deduct fund
    const new_fund = current_fund - expenseAmount;
    await connection.query(
      "INSERT INTO company_funds (available_fund, created_by) VALUES (?, ?)",
      [new_fund, actor]
    );

    const expense_id = uuidv4();
    const from_name = "Q-Techx Solutions";
    let upload_bill = null;
    if (req.file) {
      upload_bill = req.file.filename;
    }

    await connection.query(
      `INSERT INTO expenses 
       (expense_id, expense_type, created_by, updated_by, date_of_payment, amount, payment_type, paid_to, description, invoice_number, from_name, upload_bill)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        expense_id,
        expense_type || '',
        actor,
        actor,
        date_of_payment || null,
        expenseAmount,
        payment_type || '',
        paid_to || '',
        description || '',
        invoice_number || '',
        from_name,
        upload_bill
      ]
    );

    await connection.commit();
    res.status(201).json({ success: true, message: "Expense created successfully", expense_id });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating expense:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    connection.release();
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const pool = getDB();
    const [rows] = await pool.query("SELECT * FROM expenses ORDER BY created_at DESC");
    res.status(200).json({ success: true, expenses: rows });
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateExpense = async (req, res) => {
  const pool = getDB();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const actor = req.user?.user_id || req.body.updated_by || null;
    const {
      expense_type,
      date_of_payment,
      amount,
      payment_type,
      paid_to,
      description,
      invoice_number,
    } = req.body;

    // Find existing expense
    const [existingRows] = await connection.query(
      "SELECT * FROM expenses WHERE expense_id = ? LIMIT 1",
      [id]
    );

    if (existingRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    const existingExpense = existingRows[0];
    const oldAmount = parseFloat(existingExpense.amount || 0);
    const newAmount = amount !== undefined && amount !== "" ? parseFloat(amount) : oldAmount;

    if (isNaN(newAmount) || newAmount < 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "Valid amount is required" });
    }

    const amountDiff = newAmount - oldAmount;

    // If the amount changed, adjust the available fund
    if (amountDiff !== 0) {
      const [fundRows] = await connection.query(
        "SELECT available_fund FROM company_funds ORDER BY id DESC LIMIT 1"
      );
      let current_fund = fundRows.length > 0 ? parseFloat(fundRows[0].available_fund) : 0.0;

      if (amountDiff > 0 && current_fund < amountDiff) {
        await connection.rollback();
        return res.status(400).json({
          success: false,
          message: `Insufficient funds. Need ₹${amountDiff.toFixed(2)} more, but available fund is ₹${current_fund.toFixed(2)}`,
        });
      }

      const new_fund = current_fund - amountDiff;
      await connection.query(
        "INSERT INTO company_funds (available_fund, created_by) VALUES (?, ?)",
        [new_fund, actor]
      );
    }

    let upload_bill = existingExpense.upload_bill;
    if (req.file) {
      upload_bill = req.file.filename;
    }

    await connection.query(
      `UPDATE expenses SET 
        expense_type = ?,
        updated_by = ?,
        date_of_payment = ?,
        amount = ?,
        payment_type = ?,
        paid_to = ?,
        description = ?,
        invoice_number = ?,
        upload_bill = ?
       WHERE expense_id = ?`,
      [
        expense_type !== undefined ? expense_type : existingExpense.expense_type,
        actor,
        date_of_payment !== undefined && date_of_payment !== "" ? date_of_payment : existingExpense.date_of_payment,
        newAmount,
        payment_type !== undefined ? payment_type : existingExpense.payment_type,
        paid_to !== undefined ? paid_to : existingExpense.paid_to,
        description !== undefined ? description : existingExpense.description,
        invoice_number !== undefined ? invoice_number : existingExpense.invoice_number,
        upload_bill,
        id,
      ]
    );

    await connection.commit();

    const [updatedRows] = await pool.query(
      "SELECT * FROM expenses WHERE expense_id = ? LIMIT 1",
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      expense: updatedRows[0],
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating expense:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    connection.release();
  }
};

exports.deleteExpense = async (req, res) => {
  const pool = getDB();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const actor = req.user?.user_id || null;

    const [existingRows] = await connection.query(
      "SELECT * FROM expenses WHERE expense_id = ? LIMIT 1",
      [id]
    );

    if (existingRows.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Expense not found" });
    }

    const existingExpense = existingRows[0];
    const refundAmount = parseFloat(existingExpense.amount || 0);

    // Restore the refunded amount to company funds
    if (refundAmount > 0) {
      const [fundRows] = await connection.query(
        "SELECT available_fund FROM company_funds ORDER BY id DESC LIMIT 1"
      );
      let current_fund = fundRows.length > 0 ? parseFloat(fundRows[0].available_fund) : 0.0;
      const new_fund = current_fund + refundAmount;
      await connection.query(
        "INSERT INTO company_funds (available_fund, created_by) VALUES (?, ?)",
        [new_fund, actor]
      );
    }

    await connection.query("DELETE FROM expenses WHERE expense_id = ?", [id]);

    await connection.commit();
    res.status(200).json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting expense:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    connection.release();
  }
};
