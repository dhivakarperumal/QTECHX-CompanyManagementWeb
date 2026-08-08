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
