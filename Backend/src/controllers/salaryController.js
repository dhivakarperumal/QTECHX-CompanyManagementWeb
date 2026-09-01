const { getDB } = require("../config/db");
const { v4: uuidv4 } = require("uuid");

exports.getEmployeeSalaryDetails = async (req, res) => {
  const { employee_id, month, year } = req.query;

  if (!employee_id || !month || !year) {
    return res.status(400).json({ success: false, message: "employee_id, month, and year are required" });
  }

  try {
    const pool = getDB();

    // Fetch employee details
    const [empRows] = await pool.query(
      `SELECT employee_id, basic_salary, bank_name, account_number, ifsc_code, upi_id
       FROM employees WHERE employee_id = ? LIMIT 1`,
      [employee_id]
    );

    if (empRows.length === 0) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const employee = empRows[0];

    // Fetch absent days
    const [attRows] = await pool.query(
      `SELECT 
        SUM(CASE WHEN attendance_status = 'Absent' THEN 1 ELSE 0 END) as leave_days,
        SUM(CASE WHEN attendance_status = 'Present' THEN 1 ELSE 0 END) as present_days
       FROM attendance
       WHERE employee_id = ? AND month = ? AND year = ?`,
      [employee_id, month, year]
    );

    const leave_days = attRows[0].leave_days || 0;
    const present_days = attRows[0].present_days || 0;

    // Check if salary is already paid for this month
    const [salaryRows] = await pool.query(
      `SELECT id FROM employee_salaries WHERE employee_id = ? AND salary_month = ? AND salary_year = ?`,
      [employee_id, month, year]
    );

    const alreadyPaid = salaryRows.length > 0;

    res.status(200).json({
      success: true,
      data: {
        ...employee,
        leave_days,
        present_days,
        alreadyPaid
      }
    });
  } catch (error) {
    console.error("Error fetching salary details:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.paySalary = async (req, res) => {
  const {
    employee_id,
    month,
    year,
    basic_salary,
    present_days,
    leave_days,
    leave_deduction,
    incentive_percentage,
    incentive_amount,
    additional_deduction,
    total_salary
  } = req.body;

  const pool = getDB();

  // Check if already paid
  const [existingRows] = await pool.query(
    `SELECT id FROM employee_salaries WHERE employee_id = ? AND salary_month = ? AND salary_year = ?`,
    [employee_id, month, year]
  );
  if (existingRows.length > 0) {
    return res.status(400).json({ success: false, message: "Salary already paid for this month" });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const actor = req.user?.user_id || req.body.created_by || null;


    if (!employee_id || !total_salary || isNaN(total_salary)) {
      return res.status(400).json({ success: false, message: "Valid employee_id and total_salary are required" });
    }

    const tSalary = parseFloat(total_salary);

    // Deduct from available fund; salaries may make the balance negative.
    const [fundRows] = await connection.query("SELECT available_fund FROM company_funds ORDER BY id DESC LIMIT 1");
    let current_fund = fundRows.length > 0 ? parseFloat(fundRows[0].available_fund) : 0.00;
    const new_fund = current_fund - tSalary;
    await connection.query(
      "INSERT INTO company_funds (available_fund, created_by) VALUES (?, ?)",
      [new_fund, actor]
    );

    // Resolve employee name and employee code
    let employeeName = employee_id;
    try {
      const [empRows] = await connection.query(
        "SELECT first_name, last_name, employee_code, employee_id FROM employees WHERE employee_id = ? OR id = ? OR employee_code = ? LIMIT 1",
        [employee_id, employee_id, employee_id]
      );
      if (empRows.length > 0) {
        const emp = empRows[0];
        const fullName = [emp.first_name, emp.last_name].filter(Boolean).join(" ").trim();
        const code = emp.employee_code || "";
        employeeName = code ? `${fullName} (${code})` : fullName;
      } else {
        const [userRows] = await connection.query(
          "SELECT name, username FROM users WHERE user_id = ? OR id = ? LIMIT 1",
          [employee_id, employee_id]
        );
        if (userRows.length > 0) {
          employeeName = userRows[0].name || userRows[0].username || employee_id;
        }
      }
    } catch (err) {
      console.warn("Could not resolve employee name for salary expense:", err.message);
    }

    // Create an Expense record
    const expense_id = uuidv4();
    const date_of_payment = new Date().toISOString().slice(0, 10);
    const description = `Salary for Employee ${employeeName} - ${month}/${year}`;

    await connection.query(
      `INSERT INTO expenses 
       (expense_id, expense_type, created_by, updated_by, date_of_payment, amount, payment_type, paid_to, description, invoice_number, from_name)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        expense_id,
        'Salary',
        actor,
        actor,
        date_of_payment,
        tSalary,
        'Bank Transfer', // assuming bank transfer for salary
        employeeName,
        description,
        '',
        'Q-Techx Solutions'
      ]
    );

    // Record into employee_salaries table
    await connection.query(
      `INSERT INTO employee_salaries 
       (employee_id, salary_month, salary_year, basic_salary, present_days, leave_days, leave_deduction, incentive_percentage, incentive_amount, additional_deduction, total_salary, expense_id, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employee_id,
        month,
        year,
        basic_salary || 0,
        present_days || 0,
        leave_days || 0,
        leave_deduction || 0,
        incentive_percentage || 0,
        incentive_amount || 0,
        additional_deduction || 0,
        tSalary,
        expense_id,
        actor,
        actor
      ]
    );

    await connection.commit();
    res.status(201).json({ success: true, message: "Salary paid successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error paying salary:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    connection.release();
  }
};

exports.getSalaryHistory = async (req, res) => {
  try {
    const pool = getDB();
    const [rows] = await pool.query(
      `SELECT s.*, e.first_name, e.last_name, e.employee_code
       FROM employee_salaries s
       JOIN employees e ON s.employee_id = e.employee_id
       ORDER BY s.created_at DESC`
    );
    res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("Error fetching salary history:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.updateSalary = async (req, res) => {
  const pool = getDB();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const actor = req.user?.user_id || req.body.updated_by || null;
    const { total_salary } = req.body;

    if (!total_salary || isNaN(total_salary)) {
      return res.status(400).json({ success: false, message: "Valid total_salary is required" });
    }

    const newAmount = parseFloat(total_salary);

    // Fetch existing salary to find the old amount and expense_id
    const [existing] = await connection.query("SELECT total_salary, expense_id FROM employee_salaries WHERE id = ?", [id]);
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Salary record not found" });
    }

    const oldAmount = parseFloat(existing[0].total_salary);
    const expenseId = existing[0].expense_id;
    const difference = newAmount - oldAmount;

    // Adjust company funds
    if (difference !== 0) {
      const [fundRows] = await connection.query("SELECT available_fund FROM company_funds ORDER BY id DESC LIMIT 1");
      let current_fund = fundRows.length > 0 ? parseFloat(fundRows[0].available_fund) : 0.00;
      const new_fund = current_fund - difference;
      
      await connection.query(
        "INSERT INTO company_funds (available_fund, created_by) VALUES (?, ?)",
        [new_fund, actor]
      );
    }

    // Update expenses table
    if (expenseId) {
      await connection.query("UPDATE expenses SET amount = ?, updated_by = ? WHERE expense_id = ?", [newAmount, actor, expenseId]);
    }

    // Update employee_salaries table
    await connection.query(
      `UPDATE employee_salaries SET 
        total_salary = ?, updated_by = ?,
        basic_salary = ?, present_days = ?, leave_days = ?, leave_deduction = ?,
        incentive_percentage = ?, incentive_amount = ?, additional_deduction = ?
      WHERE id = ?`,
      [
        newAmount, actor,
        req.body.basic_salary || 0,
        req.body.present_days || 0,
        req.body.leave_days || 0,
        req.body.leave_deduction || 0,
        req.body.incentive_percentage || 0,
        req.body.incentive_amount || 0,
        req.body.additional_deduction || 0,
        id
      ]
    );

    await connection.commit();
    res.status(200).json({ success: true, message: "Salary updated successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating salary:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    connection.release();
  }
};

exports.deleteSalary = async (req, res) => {
  const pool = getDB();
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const { id } = req.params;
    const actor = req.user?.user_id || req.body.updated_by || null;

    // Fetch existing salary
    const [existing] = await connection.query("SELECT total_salary, expense_id FROM employee_salaries WHERE id = ?", [id]);
    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: "Salary record not found" });
    }

    const amount = parseFloat(existing[0].total_salary);
    const expenseId = existing[0].expense_id;

    // Add back to company funds
    const [fundRows] = await connection.query("SELECT available_fund FROM company_funds ORDER BY id DESC LIMIT 1");
    let current_fund = fundRows.length > 0 ? parseFloat(fundRows[0].available_fund) : 0.00;
    const new_fund = current_fund + amount;
    
    await connection.query(
      "INSERT INTO company_funds (available_fund, created_by) VALUES (?, ?)",
      [new_fund, actor]
    );

    // Delete expense record
    if (expenseId) {
      await connection.query("DELETE FROM expenses WHERE expense_id = ?", [expenseId]);
    }

    // Delete salary record
    await connection.query("DELETE FROM employee_salaries WHERE id = ?", [id]);

    await connection.commit();
    res.status(200).json({ success: true, message: "Salary deleted successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting salary:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  } finally {
    connection.release();
  }
};
