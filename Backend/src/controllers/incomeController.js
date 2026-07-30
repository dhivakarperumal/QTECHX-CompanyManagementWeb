const { getDB } = require("../config/db");
const { v4: uuidv4 } = require("uuid");

exports.createIncome = async (req, res) => {
  const pool = getDB();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const actor = req.user?.user_id || req.body.created_by || null;
    const {
      income_type,
      intern_id,
      income_reason,
      amount,
      payment_type,
      date_of_payment,
      paid_to
    } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ success: false, message: "Valid amount is required" });
    }

    const incomeAmount = parseFloat(amount);

    // Get current available fund
    const [fundRows] = await connection.query("SELECT available_fund FROM company_funds ORDER BY id DESC LIMIT 1");
    let current_fund = fundRows.length > 0 ? parseFloat(fundRows[0].available_fund) : 0.00;

    // Add to fund
    const new_fund = current_fund + incomeAmount;
    await connection.query(
      "INSERT INTO company_funds (available_fund, created_by) VALUES (?, ?)",
      [new_fund, actor]
    );

    const income_id = uuidv4();

    await connection.query(
      `INSERT INTO incomes 
       (income_id, income_type, intern_id, income_reason, amount, payment_type, date_of_payment, paid_to, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        income_id,
        income_type || '',
        intern_id || null,
        income_reason || null,
        incomeAmount,
        payment_type || '',
        date_of_payment || null,
        paid_to || '',
        actor
      ]
    );

    await connection.commit();
    res.status(201).json({ success: true, message: "Income recorded successfully", income_id });
  } catch (error) {
    await connection.rollback();
    console.error("Error creating income:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    connection.release();
  }
};

exports.getIncomes = async (req, res) => {
  try {
    const pool = getDB();
    const [rows] = await pool.query(`
      SELECT i.*, 
             t.full_name as intern_name 
      FROM incomes i
      LEFT JOIN trainee_intern t ON i.intern_id = t.uuid
      ORDER BY i.created_at DESC
    `);
    res.status(200).json({ success: true, incomes: rows });
  } catch (error) {
    console.error("Error fetching incomes:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
