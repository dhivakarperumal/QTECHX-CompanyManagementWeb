const { getDB } = require("../config/db");

exports.getFund = async (req, res) => {
  try {
    const pool = getDB();
    const [rows] = await pool.query("SELECT available_fund FROM company_funds ORDER BY id DESC LIMIT 1");
    const available_fund = rows.length > 0 ? rows[0].available_fund : 0.00;
    res.status(200).json({ success: true, available_fund });
  } catch (error) {
    console.error("Error fetching fund:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateFund = async (req, res) => {
  try {
    const pool = getDB();
    const { available_fund } = req.body;
    // The global JWT middleware might set AsyncLocalStorage or just req.user if we add middleware in route.
    // I will try to get it from headers just in case.
    const created_by = req.body.created_by || null;

    if (available_fund === undefined || isNaN(available_fund)) {
      return res.status(400).json({ success: false, message: "Valid amount is required" });
    }

    await pool.query(
      "INSERT INTO company_funds (available_fund, created_by) VALUES (?, ?)",
      [available_fund, created_by]
    );

    res.status(201).json({ success: true, message: "Fund updated successfully", available_fund });
  } catch (error) {
    console.error("Error updating fund:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
