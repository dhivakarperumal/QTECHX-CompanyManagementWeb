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
      intern_name,
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
       (income_id, income_type, intern_id, intern_name, income_reason, amount, payment_type, date_of_payment, paid_to, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        income_id,
        income_type || '',
        intern_id || null,
        intern_name || null,
        income_reason || null,
        incomeAmount,
        payment_type || '',
        date_of_payment || null,
        paid_to || '',
        actor,
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

exports.updateIncome = async (req, res) => {
  const pool = getDB();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const actor = req.user?.user_id || req.body.updated_by || null;
    const {
      income_type,
      intern_id,
      intern_name,
      income_reason,
      amount,
      payment_type,
      date_of_payment,
      paid_to
    } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ success: false, message: "Valid amount is required" });
    }

    const newAmount = parseFloat(amount);

    // Fetch existing income to find the old amount
    const [existing] = await connection.query("SELECT amount FROM incomes WHERE income_id = ?", [id]);
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Income record not found" });
    }

    const oldAmount = parseFloat(existing[0].amount);
    const difference = newAmount - oldAmount;

    // Adjust company funds if the amount changed
    if (difference !== 0) {
      const [fundRows] = await connection.query("SELECT available_fund FROM company_funds ORDER BY id DESC LIMIT 1");
      let current_fund = fundRows.length > 0 ? parseFloat(fundRows[0].available_fund) : 0.00;
      const new_fund = current_fund + difference;
      
      await connection.query(
        "INSERT INTO company_funds (available_fund, created_by) VALUES (?, ?)",
        [new_fund, actor]
      );
    }

    // Update the income record
    await connection.query(
      `UPDATE incomes SET 
         income_type = ?, intern_id = ?, intern_name = ?, income_reason = ?, 
         amount = ?, payment_type = ?, date_of_payment = ?, paid_to = ?, updated_by = ?
       WHERE income_id = ?`,
      [
        income_type || '',
        intern_id || null,
        intern_name || null,
        income_reason || null,
        newAmount,
        payment_type || '',
        date_of_payment || null,
        paid_to || '',
        actor,
        id
      ]
    );

    await connection.commit();
    res.status(200).json({ success: true, message: "Income updated successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating income:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    connection.release();
  }
};

exports.deleteIncome = async (req, res) => {
  const pool = getDB();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    const actor = req.user?.user_id || req.body.updated_by || null;

    // Fetch existing income to deduct the amount from funds
    const [existing] = await connection.query("SELECT amount FROM incomes WHERE income_id = ?", [id]);
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Income record not found" });
    }

    const amount = parseFloat(existing[0].amount);

    // Deduct from company funds
    const [fundRows] = await connection.query("SELECT available_fund FROM company_funds ORDER BY id DESC LIMIT 1");
    let current_fund = fundRows.length > 0 ? parseFloat(fundRows[0].available_fund) : 0.00;
    const new_fund = current_fund - amount;
    
    await connection.query(
      "INSERT INTO company_funds (available_fund, created_by) VALUES (?, ?)",
      [new_fund, actor]
    );

    // Delete the income record
    await connection.query("DELETE FROM incomes WHERE income_id = ?", [id]);

    await connection.commit();
    res.status(200).json({ success: true, message: "Income deleted successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting income:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    connection.release();
  }
};
