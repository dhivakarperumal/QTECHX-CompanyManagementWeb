const { getDB } = require("../config/db");

const publicFields = "id, employee_id, employee_code, first_name, last_name, profile_photo, gender, dob, blood_group, marital_status, nationality, aadhaar_number, pan_number, mobile_number, alternate_mobile, personal_email, permanent_address, emergency_contact_person, emergency_contact_number, emergency_relationship, designation, team_lead, joining_date, confirmation_date, employment_status, role, salary_type, basic_salary, bank_name, account_number, ifsc_code, upi_id, resume_url, aadhaar_url, pan_url, passport_url, offer_letter_url, appointment_letter_url, nda_url, created_at, updated_at, created_by, updated_by";

async function generateEmployeeCode() {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT employee_code FROM employees WHERE employee_code IS NOT NULL AND employee_code REGEXP '^EMPQT[0-9]+$'`
  );

  let highest = 0;
  rows.forEach((row) => {
    const match = row.employee_code?.match(/^EMPQT(\d+)$/i);
    if (match) {
      const value = parseInt(match[1], 10);
      if (value > highest) highest = value;
    }
  });

  let next = highest + 1;
  let code = `EMPQT${next}`;

  while (true) {
    const [existing] = await db.execute("SELECT id FROM employees WHERE employee_code = ? LIMIT 1", [code]);
    if (!existing.length) return code;
    next += 1;
    code = `EMPQT${next}`;
  }
}

async function createEmployee(employee) {
  const db = getDB();
  if (!employee.employee_code || !String(employee.employee_code).trim()) {
    employee.employee_code = await generateEmployeeCode();
  }

  const fields = Object.keys(employee).filter(key => employee[key] !== undefined);
  const values = fields.map(key => employee[key]);
  const placeholders = fields.map(() => "?").join(", ");
  
  const [result] = await db.execute(
    `INSERT INTO employees (${fields.join(", ")}) VALUES (${placeholders})`,
    values
  );
  return findByEmployeeId(employee.employee_id, result.insertId);
}

async function findByEmployeeId(employeeId, id = null) {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT ${publicFields} FROM employees WHERE ${id ? "id = ?" : "employee_id = ?"} LIMIT 1`,
    [id || employeeId]
  );
  return rows[0] || null;
}

async function listEmployees({ page, limit, search, status, role }) {
  const db = getDB();
  const offset = (page - 1) * limit;
  const conditions = [];
  const values = [];

  if (search) {
    conditions.push("(first_name LIKE ? OR last_name LIKE ? OR personal_email LIKE ? OR mobile_number LIKE ? OR employee_code LIKE ?)");
    const term = `%${search}%`;
    values.push(term, term, term, term, term);
  }
  if (status) {
    conditions.push("employment_status = ?");
    values.push(status);
  }
  if (role) {
    conditions.push("role = ?");
    values.push(role);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const [rows] = await db.execute(
    `SELECT ${publicFields} FROM employees ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...values, limit, offset]
  );
  const [countRows] = await db.execute(`SELECT COUNT(*) AS total FROM employees ${where}`, values);
  return { rows, total: countRows[0].total };
}

async function updateEmployee(employeeId, updates) {
  const db = getDB();
  const fields = Object.keys(updates).filter(key => updates[key] !== undefined);
  if (!fields.length) return findByEmployeeId(employeeId);
  const values = fields.map((field) => updates[field]);
  const assignments = fields.map((field) => `${field} = ?`).join(", ");
  values.push(employeeId);
  await db.execute(`UPDATE employees SET ${assignments} WHERE employee_id = ?`, values);
  return findByEmployeeId(employeeId);
}

async function deleteEmployee(employeeId) {
  const db = getDB();
  await db.execute(`DELETE FROM employees WHERE employee_id = ?`, [employeeId]);
  return true;
}

module.exports = { createEmployee, findByEmployeeId, listEmployees, updateEmployee, deleteEmployee, generateEmployeeCode };
