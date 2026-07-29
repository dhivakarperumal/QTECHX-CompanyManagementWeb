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

    // Check available funds
    const [fundRows] = await connection.query("SELECT available_fund FROM company_funds ORDER BY id DESC LIMIT 1");
    let current_fund = fundRows.length > 0 ? parseFloat(fundRows[0].available_fund) : 0.00;

    if (current_fund < tSalary) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "Insufficient funds to pay salary" });
    }

    // Deduct fund
    const new_fund = current_fund - tSalary;
    await connection.query(
      "INSERT INTO company_funds (available_fund, created_by) VALUES (?, ?)",
      [new_fund, actor]
    );

    // Create an Expense record
    const expense_id = uuidv4();
    const date_of_payment = new Date().toISOString().slice(0, 10);
    const description = `Salary for Employee ${employee_id} - ${month}/${year}`;

    await connection.query(
      `INSERT INTO expenses 
       (expense_id, expense_type, created_by, updated_by, date_of_payment, amount, payment_type, paid_to, description, invoice_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        expense_id,
        'Salary',
        actor,
        actor,
        date_of_payment,
        tSalary,
        'Bank Transfer', // assuming bank transfer for salary
        employee_id,
        description,
        ''
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
