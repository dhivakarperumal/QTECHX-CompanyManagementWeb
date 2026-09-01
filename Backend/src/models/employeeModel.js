const { getDB } = require("../config/db");

const publicFields = "id, employee_id, employee_code, first_name, last_name, profile_photo, gender, dob, blood_group, marital_status, nationality, aadhaar_number, pan_number, mobile_number, alternate_mobile, personal_email, official_email, username, permanent_address, emergency_contact_person, emergency_contact_number, emergency_relationship, designation, team_lead, joining_date, confirmation_date, status, employment_status, role, salary_type, basic_salary, bank_name, account_number, ifsc_code, upi_id, driving_licence_number, vehicle_registration_number, referral_code, resume_url, aadhaar_url, pan_url, bank_passbook_url, passport_url, offer_letter_url, appointment_letter_url, nda_url, educational_details, created_at, updated_at, created_by, updated_by";

async function generateEmployeeCode() {
  const db = getDB();
  const [rows] = await db.execute(
    `SELECT employee_code FROM employees WHERE employee_code IS NOT NULL AND LOWER(employee_code) REGEXP '^empqt[0-9]+$'`
  );

  let highest = 0;
  rows.forEach((row) => {
    const valueText = String(row.employee_code || "").trim().toUpperCase();
    const match = valueText.match(/^EMPQT(\d+)$/);
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
  } else {
    employee.employee_code = String(employee.employee_code).trim().toUpperCase();
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

async function findByEmployeeId(identifier, id = null) {
  const db = getDB();
  if (id) {
    const [rows] = await db.execute(
      `SELECT ${publicFields} FROM employees WHERE id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  if (!identifier) return null;

  const [rows] = await db.execute(
    `SELECT ${publicFields} FROM employees 
     WHERE employee_id = ? OR id = ? OR employee_code = ? OR official_email = ? OR personal_email = ? OR username = ? 
     LIMIT 1`,
    [identifier, identifier, identifier, identifier, identifier, identifier]
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
    if (status.trim().toLowerCase() === "active") {
      conditions.push("(LOWER(COALESCE(status, 'active')) NOT IN ('inactive', 'deactivated', 'terminated') AND LOWER(COALESCE(employment_status, 'active')) NOT IN ('inactive', 'deactivated', 'terminated'))");
    } else {
      conditions.push("(LOWER(status) = LOWER(?) OR LOWER(employment_status) = LOWER(?))");
      values.push(status, status);
    }
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

async function deleteEmployee(employeeId, updatedBy = null) {
  const db = getDB();
  await db.execute(
    `UPDATE employees SET status = 'Inactive', employment_status = 'Inactive', updated_by = ? WHERE employee_id = ?`,
    [updatedBy, employeeId]
  );
  return true;
}

async function hardDeleteEmployee(employeeId) {
  const db = getDB();
  await db.execute("DELETE FROM employees WHERE employee_id = ?", [employeeId]);
  return true;
}

async function findConflictEmployee({ emails = [], mobile, username, pan, aadhaar, excludeEmployeeId = null }) {
  const db = getDB();
  const emailList = (Array.isArray(emails) ? emails : [emails])
    .map((e) => String(e || "").trim().toLowerCase())
    .filter(Boolean);

  const cleanMobile = mobile ? String(mobile).replace(/[\s\-\+]/g, "").slice(-10) : "";
  const cleanUsername = username ? String(username).trim().toLowerCase() : "";
  const cleanPan = pan ? String(pan).trim().toUpperCase() : "";
  const cleanAadhaar = aadhaar ? String(aadhaar).replace(/\D/g, "") : "";

  // Check emails (against personal_email and official_email)
  if (emailList.length > 0) {
    const placeholders = emailList.map(() => "?").join(", ");
    let query = `SELECT id, employee_id, employee_code, first_name, last_name, personal_email, official_email, mobile_number, username 
                 FROM employees 
                 WHERE (LOWER(TRIM(personal_email)) IN (${placeholders}) OR LOWER(TRIM(official_email)) IN (${placeholders}))`;
    const params = [...emailList, ...emailList];
    if (excludeEmployeeId) {
      query += " AND employee_id != ?";
      params.push(excludeEmployeeId);
    }
    query += " LIMIT 1";
    const [rows] = await db.execute(query, params);
    if (rows.length > 0) {
      const match = rows[0];
      const matchedEmail =
        emailList.find(
          (e) =>
            (match.personal_email && match.personal_email.toLowerCase() === e) ||
            (match.official_email && match.official_email.toLowerCase() === e)
        ) || match.personal_email || match.official_email;
      return { field: "email", value: matchedEmail, employee: match };
    }
  }

  // Check mobile
  if (cleanMobile) {
    let query = `SELECT id, employee_id, employee_code, first_name, last_name, personal_email, official_email, mobile_number, username 
                 FROM employees 
                 WHERE RIGHT(REPLACE(REPLACE(REPLACE(mobile_number, ' ', ''), '-', ''), '+', ''), 10) = ?`;
    const params = [cleanMobile];
    if (excludeEmployeeId) {
      query += " AND employee_id != ?";
      params.push(excludeEmployeeId);
    }
    query += " LIMIT 1";
    const [rows] = await db.execute(query, params);
    if (rows.length > 0) {
      return { field: "mobile", value: rows[0].mobile_number, employee: rows[0] };
    }
  }

  // Check username
  if (cleanUsername) {
    let query = `SELECT id, employee_id, employee_code, first_name, last_name, personal_email, official_email, mobile_number, username 
                 FROM employees 
                 WHERE LOWER(TRIM(username)) = ?`;
    const params = [cleanUsername];
    if (excludeEmployeeId) {
      query += " AND employee_id != ?";
      params.push(excludeEmployeeId);
    }
    query += " LIMIT 1";
    const [rows] = await db.execute(query, params);
    if (rows.length > 0) {
      return { field: "username", value: rows[0].username, employee: rows[0] };
    }
  }

  // Check PAN
  if (cleanPan) {
    let query = `SELECT id, employee_id, employee_code, pan_number FROM employees WHERE UPPER(TRIM(pan_number)) = ?`;
    const params = [cleanPan];
    if (excludeEmployeeId) {
      query += " AND employee_id != ?";
      params.push(excludeEmployeeId);
    }
    query += " LIMIT 1";
    const [rows] = await db.execute(query, params);
    if (rows.length > 0) {
      return { field: "pan", value: rows[0].pan_number, employee: rows[0] };
    }
  }

  // Check Aadhaar
  if (cleanAadhaar) {
    let query = `SELECT id, employee_id, employee_code, aadhaar_number FROM employees WHERE REPLACE(aadhaar_number, ' ', '') = ?`;
    const params = [cleanAadhaar];
    if (excludeEmployeeId) {
      query += " AND employee_id != ?";
      params.push(excludeEmployeeId);
    }
    query += " LIMIT 1";
    const [rows] = await db.execute(query, params);
    if (rows.length > 0) {
      return { field: "aadhaar", value: rows[0].aadhaar_number, employee: rows[0] };
    }
  }

  return null;
}

module.exports = {
  createEmployee,
  findByEmployeeId,
  listEmployees,
  updateEmployee,
  deleteEmployee,
  hardDeleteEmployee,
  findConflictEmployee,
  generateEmployeeCode,
};


