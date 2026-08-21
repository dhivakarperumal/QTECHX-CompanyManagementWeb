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
      await connection.rollback();
      return res.status(400).json({ success: false, message: "Valid amount is required" });
    }

    if (!payment_type || !payment_type.toString().trim()) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: "Payment mode is required" });
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
        payment_type ? payment_type.toString().trim() : '',
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
    const [rows] = await pool.query("SELECT * FROM expenses ORDER BY COALESCE(date_of_payment, created_at) DESC, id DESC");

    // Enrich rows for Project Payments, Incomes, and Salaries
    const enrichedRows = await Promise.all(
      rows.map(async (exp) => {
        const type = String(exp.expense_type || "").trim().toLowerCase();

        // 1. Project Payment
        if (type === "project payment") {
          if (!exp.from_name || exp.from_name === "Q-Techx Solutions" || exp.from_name === "Client") {
            try {
              const [payRows] = await pool.query(
                `SELECT client_name, project_name FROM project_payments 
                 WHERE ROUND(amount_paid, 2) = ROUND(?, 2) AND DATE(date_of_payment) = DATE(?) 
                 ORDER BY created_at DESC LIMIT 1`,
                [exp.amount, exp.date_of_payment]
              );
              if (payRows.length > 0) {
                const { client_name, project_name } = payRows[0];
                if (client_name && project_name) {
                  exp.from_name = `${client_name} (${project_name})`;
                } else if (client_name) {
                  exp.from_name = client_name;
                } else if (project_name) {
                  exp.from_name = project_name;
                }
              }
            } catch (err) {
              // ignore
            }
          }
          if (!exp.paid_to || exp.paid_to === "Client") {
            exp.paid_to = "Q-Techx Solutions";
          }
        }

        // 2. Income / Internship Payment
        else if (type === "income" || type === "internship payment") {
          let internDisplayName = exp.from_name;
          if (!internDisplayName || internDisplayName === "Q-Techx Solutions" || internDisplayName === "Intern") {
            try {
              const [incRows] = await pool.query(
                `SELECT i.intern_name, i.income_reason, t.full_name 
                 FROM incomes i 
                 LEFT JOIN trainee_intern t ON (i.intern_id = t.id OR i.intern_id = t.uuid OR i.intern_id = t.intern_id)
                 WHERE ROUND(i.amount, 2) = ROUND(?, 2) AND DATE(i.date_of_payment) = DATE(?) 
                 ORDER BY i.created_at DESC LIMIT 1`,
                [exp.amount, exp.date_of_payment]
              );
              if (incRows.length > 0) {
                internDisplayName =
                  incRows[0].intern_name ||
                  incRows[0].full_name ||
                  incRows[0].income_reason ||
                  "Intern";
              }
            } catch (err) {
              // ignore
            }
          }

          if (internDisplayName && !internDisplayName.toLowerCase().includes("(intern)") && internDisplayName !== "Q-Techx Solutions") {
            internDisplayName = `${internDisplayName} (Intern)`;
          }

          exp.from_name = internDisplayName || "Intern";
          if (!exp.paid_to) {
            exp.paid_to = "Q-Techx Solutions";
          }
        }

        // 3. Salary
        else if (type === "salary") {
          try {
            const [empRows] = await pool.query(
              `SELECT first_name, last_name, employee_code, employee_id 
               FROM employees 
               WHERE employee_id = ? OR id = ? OR employee_code = ? 
               LIMIT 1`,
              [exp.paid_to, exp.paid_to, exp.paid_to]
            );
            if (empRows.length > 0) {
              const emp = empRows[0];
              const fullName = [emp.first_name, emp.last_name].filter(Boolean).join(" ").trim();
              const code = emp.employee_code || "";
              exp.paid_to = code ? `${fullName} (${code})` : fullName;
            } else {
              const [userRows] = await pool.query(
                `SELECT name, username FROM users WHERE user_id = ? OR id = ? LIMIT 1`,
                [exp.paid_to, exp.paid_to]
              );
              if (userRows.length > 0 && userRows[0].name) {
                exp.paid_to = userRows[0].name;
              }
            }
          } catch (err) {
            // ignore
          }
          if (!exp.from_name) {
            exp.from_name = "Q-Techx Solutions";
          }
        }

        return exp;
      })
    );

    res.status(200).json({ success: true, expenses: enrichedRows });
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
