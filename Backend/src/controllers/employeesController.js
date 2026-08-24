const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const { createUser, updateUser } = require("../models/userModel");
const {
  createEmployee,
  findByEmployeeId,
  listEmployees,
  updateEmployee,
  deleteEmployee,
  generateEmployeeCode,
} = require("../models/employeeModel");

const duplicateMessage = (error) => {
  if (error.code !== "ER_DUP_ENTRY") return null;
  const msg = error.message;
  if (msg.includes("uq_emp_pan") || msg.includes("pan_number")) return "PAN Number already exists.";
  if (msg.includes("uq_emp_aadhaar") || msg.includes("aadhaar_number")) return "Aadhaar Number already exists.";
  if (msg.includes("uq_emp_mobile") || msg.includes("mobile_number")) return "Mobile Number already registered.";
  if (msg.includes("uq_emp_email") || msg.includes("personal_email") || msg.includes("email")) return "Personal Email already registered.";
  if (msg.includes("uq_emp_upi") || msg.includes("upi_id")) return "UPI ID already exists.";
  if (msg.includes("uq_emp_account_ifsc")) return "This Account Number and IFSC Code combination is already registered.";
  if (msg.includes("uq_emp_account") || msg.includes("account_number")) return "Account Number already exists.";
  if (msg.includes("employee_id")) return "Employee ID already exists.";
  if (msg.includes("employee_code")) return "Employee Code already exists.";
  return "Record already exists.";
};

const normalizeEmployeeData = (data) => {
  if (data.pan_number) data.pan_number = String(data.pan_number).trim().toUpperCase();
  if (data.aadhaar_number) data.aadhaar_number = String(data.aadhaar_number).replace(/\s+/g, '');
  if (data.mobile_number) data.mobile_number = String(data.mobile_number).replace(/[^0-9+]/g, '');
  if (data.personal_email) data.personal_email = String(data.personal_email).trim().toLowerCase();
  if (data.official_email) data.official_email = String(data.official_email).trim().toLowerCase();
  if (data.account_number) data.account_number = String(data.account_number).trim();
  if (data.upi_id) data.upi_id = String(data.upi_id).trim().toLowerCase();
};

async function generateEmployeeCodeHandler(req, res) {
  try {
    const employeeCode = await generateEmployeeCode();
    return res.json({ employee_code: employeeCode });
  } catch (error) {
    console.error("Generate Employee Code Error:", error);
    return res.status(500).json({ message: "Failed to generate employee code" });
  }
}

async function create(req, res) {
  try {
    const actor = req.user?.user_id || "SYSTEM";
    const employeeData = { ...req.body };
    // map department (frontend) -> designation (db)
    if (employeeData.department) {
      employeeData.designation = employeeData.department;
      delete employeeData.department;
    }

    // Process uploaded files
    if (req.files) {
      Object.keys(req.files).forEach(key => {
        const file = req.files[key][0];
        const relativePath = `/uploads/employees/${file.filename}`;
        employeeData[key] = relativePath;
      });
    }
    
    // Set auto-generated fields
    employeeData.employee_id = uuidv4();
    if (!employeeData.employee_code || !String(employeeData.employee_code).trim()) {
      employeeData.employee_code = await generateEmployeeCode();
    }
    employeeData.created_by = actor;
    employeeData.updated_by = actor;

    // Extract password for user creation (default to mobile number) and remove from employee table insert
    const userPassword = employeeData.password || employeeData.mobile_number;
    delete employeeData.password;
    delete employeeData.confirm_password;

    const initialStatus = employeeData.status || employeeData.employment_status || "Active";
    employeeData.status = initialStatus;
    employeeData.employment_status = initialStatus;

    normalizeEmployeeData(employeeData);

    const employee = await createEmployee(employeeData);

    // Create User record
    if (employeeData.username && userPassword) {
      try {
        const hashedPassword = await bcrypt.hash(userPassword, 12);
        await createUser({
          user_id: employeeData.employee_id,
          username: employeeData.username,
          email: employeeData.official_email || employeeData.personal_email,
          mobile: employeeData.mobile_number,
          password: hashedPassword,
          role: employeeData.role,
          status: initialStatus,
          created_by: actor,
          updated_by: actor,
        });
      } catch (err) {
        console.error("Failed to create associated user account:", err);
      }
    }

    return res.status(201).json({ message: "Employee created successfully", employee });
  } catch (error) {
    console.error("Create Employee Error:", error);
    const message = duplicateMessage(error);
    return res.status(message ? 409 : 500).json({ message: message || "Failed to create employee" });
  }
}

async function getAll(req, res) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const result = await listEmployees({
      page,
      limit,
      search: req.query.search?.trim(),
      status: req.query.status,
      role: req.query.role,
    });
    return res.json({
      data: result.rows,
      pagination: { page, limit, total: result.total, pages: Math.ceil(result.total / limit) },
    });
  } catch (error) {
    console.error("Get All Employees Error:", error);
    return res.status(500).json({ message: "Failed to retrieve employees" });
  }
}

async function getOne(req, res) {
  try {
    const employee = await findByEmployeeId(req.params.employeeId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });
    return res.json({ employee });
  } catch (error) {
    console.error("Get Employee Error:", error);
    return res.status(500).json({ message: "Failed to retrieve employee" });
  }
}

async function update(req, res) {
  try {
    const existing = await findByEmployeeId(req.params.employeeId);
    if (!existing) return res.status(404).json({ message: "Employee not found" });

    const updates = { ...req.body };
    // map department -> designation for updates
    if (updates.department) {
      updates.designation = updates.department;
      delete updates.department;
    }
    updates.updated_by = req.user?.user_id || "SYSTEM";
    
    // Sync status and employment_status
    if (updates.status || updates.employment_status) {
      const syncStatus = updates.status || updates.employment_status;
      updates.status = syncStatus;
      updates.employment_status = syncStatus;
    }

    // Process uploaded files
    if (req.files) {
      Object.keys(req.files).forEach(key => {
        const file = req.files[key][0];
        updates[key] = `/uploads/employees/${file.filename}`;
      });
    }

    // Prevent updating protected fields and passwords in employee table
    delete updates.employee_id;
    delete updates.created_by;
    delete updates.created_at;
    
    // Admin updates should not change employee passwords via this endpoint
    delete updates.password;
    delete updates.confirm_password;
    delete updates.created_at;

    normalizeEmployeeData(updates);

    const employee = await updateEmployee(req.params.employeeId, updates);

    // Update User record
    if (updates.username || updates.official_email || updates.role || updates.status || updates.employment_status || updates.mobile_number) {
      try {
        const userUpdates = {};
        if (updates.username) userUpdates.username = updates.username;
        if (updates.official_email) userUpdates.email = updates.official_email;
        if (updates.mobile_number) userUpdates.mobile = updates.mobile_number;
        if (updates.role) userUpdates.role = updates.role;
        if (updates.status || updates.employment_status) userUpdates.status = updates.status || updates.employment_status;
        userUpdates.updated_by = updates.updated_by;
        // Password changes must be done by the employee via their panel
        await updateUser(req.params.employeeId, userUpdates);
      } catch (err) {
        console.error("Failed to update associated user account:", err);
      }
    }

    return res.json({ message: "Employee updated successfully", employee });
  } catch (error) {
    console.error("Update Employee Error:", error);
    const message = duplicateMessage(error);
    return res.status(message ? 409 : 500).json({ message: message || "Failed to update employee" });
  }
}

async function remove(req, res) {
  try {
    const existing = await findByEmployeeId(req.params.employeeId);
    if (!existing) return res.status(404).json({ message: "Employee not found" });
    const actor = req.user?.user_id || "SYSTEM";
    await deleteEmployee(req.params.employeeId, actor);
    try {
      await updateUser(req.params.employeeId, { status: "Inactive", updated_by: actor });
    } catch (userErr) {
      console.error("Failed to deactivate associated user on employee delete:", userErr);
    }
    return res.json({ message: "Employee deactivated successfully" });
  } catch (error) {
    console.error("Delete Employee Error:", error);
    return res.status(500).json({ message: "Failed to delete employee" });
  }
}

module.exports = { create, getAll, getOne, update, remove, generateEmployeeCodeHandler };
