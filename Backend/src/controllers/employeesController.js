const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcrypt");
const { createUser, updateUser, findConflictUser } = require("../models/userModel");
const {
  createEmployee,
  findByEmployeeId,
  listEmployees,
  updateEmployee,
  deleteEmployee,
  hardDeleteEmployee,
  findConflictEmployee,
  generateEmployeeCode,
} = require("../models/employeeModel");

const duplicateMessage = (error) => {
  if (error.code !== "ER_DUP_ENTRY") return null;
  const msg = error.message;
  if (msg.includes("uq_emp_pan") || msg.includes("pan_number")) return "PAN Number already exists.";
  if (msg.includes("uq_emp_aadhaar") || msg.includes("aadhaar_number")) return "Aadhaar Number already exists.";
  if (msg.includes("uq_emp_mobile") || msg.includes("uq_users_mobile") || msg.includes("mobile_number") || msg.includes("mobile")) return "Mobile Number is already registered. Please try with a different mobile number.";
  if (msg.includes("uq_emp_email") || msg.includes("uq_users_email") || msg.includes("personal_email") || msg.includes("official_email") || msg.includes("email")) return "Email address is already registered. Please try with a different email address.";
  if (msg.includes("uq_users_username") || msg.includes("username")) return "Username already exists. Please choose a different username.";
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

const missingRequiredEmployeeFields = (data, files = {}) => {
  const requiredFields = [
    "first_name", "last_name", "gender", "dob", "blood_group", "marital_status",
    "nationality", "aadhaar_number", "pan_number", "mobile_number", "personal_email",
    "permanent_address", "emergency_contact_person", "emergency_contact_number",
    "emergency_relationship", "department", "team_lead", "joining_date",
    "confirmation_date", "employment_status", "role", "salary_type", "basic_salary",
    "bank_name", "account_number", "ifsc_code", "upi_id", "username", "official_email",
  ];
  const missing = requiredFields.filter((field) => !String(data[field] ?? "").trim());

  ["profile_photo", "resume_url", "aadhaar_url", "pan_url"].forEach((field) => {
    if (!files[field]?.length) missing.push(field);
  });

  let education;
  try {
    education = typeof data.educational_details === "string"
      ? JSON.parse(data.educational_details)
      : data.educational_details;
  } catch {
    education = null;
  }
  if (!Array.isArray(education) || !education.length || education.some((row) =>
    [row.course, row.institution, row.percentage, row.year_of_passing]
      .some((value) => !String(value ?? "").trim())
  )) {
    missing.push("educational_details");
  }

  return missing;
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
    const missingFields = missingRequiredEmployeeFields(employeeData, req.files);
    if (missingFields.length) {
      return res.status(400).json({
        message: `Please provide all required employee fields: ${missingFields.join(", ")}`,
      });
    }

    normalizeEmployeeData(employeeData);

    // Pre-validation: Check conflict against users table
    const userConflict = await findConflictUser({
      emails: [employeeData.personal_email, employeeData.official_email].filter(Boolean),
      mobile: employeeData.mobile_number,
      username: employeeData.username,
    });

    if (userConflict) {
      if (userConflict.field === "email") {
        return res.status(409).json({
          message: `The email address '${userConflict.value}' is already registered with a user account. Please try with a different email address.`,
          field: "personal_email",
        });
      }
      if (userConflict.field === "mobile") {
        return res.status(409).json({
          message: `The mobile number '${userConflict.value}' is already registered with a user account. Please try with a different mobile number.`,
          field: "mobile_number",
        });
      }
      if (userConflict.field === "username") {
        return res.status(409).json({
          message: `The username '${userConflict.value}' is already taken. Please choose a different username.`,
          field: "username",
        });
      }
    }

    // Pre-validation: Check conflict against employees table
    const empConflict = await findConflictEmployee({
      emails: [employeeData.personal_email, employeeData.official_email].filter(Boolean),
      mobile: employeeData.mobile_number,
      username: employeeData.username,
      pan: employeeData.pan_number,
      aadhaar: employeeData.aadhaar_number,
    });

    if (empConflict) {
      if (empConflict.field === "email") {
        return res.status(409).json({
          message: `The email address '${empConflict.value}' is already registered for an existing employee. Please try with a different email address.`,
          field: "personal_email",
        });
      }
      if (empConflict.field === "mobile") {
        return res.status(409).json({
          message: `The mobile number '${empConflict.value}' is already registered for an existing employee. Please try with a different mobile number.`,
          field: "mobile_number",
        });
      }
      if (empConflict.field === "username") {
        return res.status(409).json({
          message: `The username '${empConflict.value}' is already assigned to an existing employee. Please choose a different username.`,
          field: "username",
        });
      }
      if (empConflict.field === "pan") {
        return res.status(409).json({
          message: `PAN Number '${empConflict.value}' is already registered.`,
          field: "pan_number",
        });
      }
      if (empConflict.field === "aadhaar") {
        return res.status(409).json({
          message: `Aadhaar Number '${empConflict.value}' is already registered.`,
          field: "aadhaar_number",
        });
      }
    }

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
        console.error("Failed to create associated user account, rolling back employee creation:", err);
        // Rollback employee insert so no orphaned employee record remains without a user
        await hardDeleteEmployee(employeeData.employee_id);
        const dupMessage = duplicateMessage(err);
        return res.status(dupMessage ? 409 : 500).json({
          message: dupMessage || "Failed to create associated user account. Employee creation rolled back.",
        });
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

async function getMe(req, res) {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ message: "Authentication required" });

    const identifiers = [
      user.employee_id,
      user.user_id,
      user.id,
      user.employee_code,
      user.email,
      user.username,
    ].filter(Boolean);

    let employee = null;
    for (const id of identifiers) {
      employee = await findByEmployeeId(id);
      if (employee) break;
    }

    if (!employee) {
      const { findByUserId } = require("../models/userModel");
      const userRecord = await findByUserId(user.user_id || user.id);
      if (userRecord) {
        employee = {
          first_name: userRecord.username || "User",
          last_name: "",
          personal_email: userRecord.email,
          official_email: userRecord.email,
          mobile_number: userRecord.mobile,
          role: userRecord.role,
          status: userRecord.status,
          employment_status: userRecord.status,
          username: userRecord.username,
          employee_code: user.employee_code || (userRecord.user_id ? userRecord.user_id.substring(0, 8) : "ADMIN-01"),
          created_at: userRecord.created_at,
          joining_date: userRecord.created_at,
        };
      }
    }

    if (!employee) return res.status(404).json({ message: "Employee profile not found" });
    return res.json({ employee });
  } catch (error) {
    console.error("Get Me Profile Error:", error);
    return res.status(500).json({ message: "Failed to retrieve employee profile" });
  }
}

async function getOne(req, res) {
  try {
    const requestedId = req.params.employeeId;
    if (requestedId === "me") {
      return getMe(req, res);
    }

    const employee = await findByEmployeeId(requestedId);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    // Authorization: Allow staff or self
    const userRole = (req.user?.role || "").toLowerCase().trim();
    const isStaff = ["super admin", "admin", "manager", "hr"].includes(userRole);
    const isSelf =
      req.user &&
      (req.user.user_id === employee.employee_id ||
       req.user.employee_id === employee.employee_id ||
       req.user.email === employee.personal_email ||
       req.user.email === employee.official_email ||
       req.user.username === employee.username ||
       req.user.employee_code === employee.employee_code);

    if (!isStaff && !isSelf) {
      return res.status(403).json({ message: "You do not have permission to view this employee" });
    }

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
    normalizeEmployeeData(updates);

    // Check conflicts for modified fields against users
    const emailsToVerify = [updates.personal_email, updates.official_email].filter(Boolean);
    if (emailsToVerify.length || updates.mobile_number || updates.username) {
      const userConflict = await findConflictUser({
        emails: emailsToVerify,
        mobile: updates.mobile_number,
        username: updates.username,
        excludeUserId: req.params.employeeId,
      });

      if (userConflict) {
        if (userConflict.field === "email") {
          return res.status(409).json({
            message: `The email address '${userConflict.value}' is already registered with another user account.`,
            field: "personal_email",
          });
        }
        if (userConflict.field === "mobile") {
          return res.status(409).json({
            message: `The mobile number '${userConflict.value}' is already registered with another user account.`,
            field: "mobile_number",
          });
        }
        if (userConflict.field === "username") {
          return res.status(409).json({
            message: `The username '${userConflict.value}' is already taken by another account.`,
            field: "username",
          });
        }
      }
    }

    // Check conflicts for modified fields against employees
    if (emailsToVerify.length || updates.mobile_number || updates.username || updates.pan_number || updates.aadhaar_number) {
      const empConflict = await findConflictEmployee({
        emails: emailsToVerify,
        mobile: updates.mobile_number,
        username: updates.username,
        pan: updates.pan_number,
        aadhaar: updates.aadhaar_number,
        excludeEmployeeId: req.params.employeeId,
      });

      if (empConflict) {
        if (empConflict.field === "email") {
          return res.status(409).json({
            message: `The email address '${empConflict.value}' is already registered for another employee.`,
            field: "personal_email",
          });
        }
        if (empConflict.field === "mobile") {
          return res.status(409).json({
            message: `The mobile number '${empConflict.value}' is already registered for another employee.`,
            field: "mobile_number",
          });
        }
        if (empConflict.field === "username") {
          return res.status(409).json({
            message: `The username '${empConflict.value}' is already assigned to another employee.`,
            field: "username",
          });
        }
        if (empConflict.field === "pan") {
          return res.status(409).json({
            message: `PAN Number '${empConflict.value}' is already registered.`,
            field: "pan_number",
          });
        }
        if (empConflict.field === "aadhaar") {
          return res.status(409).json({
            message: `Aadhaar Number '${empConflict.value}' is already registered.`,
            field: "aadhaar_number",
          });
        }
      }
    }

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

    // Auto-sync username from first and last name if not explicitly set
    if (!updates.username && (updates.first_name || updates.last_name)) {
      const first = updates.first_name !== undefined ? updates.first_name : existing.first_name;
      const last = updates.last_name !== undefined ? updates.last_name : existing.last_name;
      updates.username = [first, last].filter(Boolean).join(" ");
    }

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
        const targetUserId = existing.employee_id || req.params.employeeId;
        await updateUser(targetUserId, userUpdates);
      } catch (err) {
        console.error("Failed to update associated user account:", err);
        const dup = duplicateMessage(err);
        if (dup) {
          return res.status(409).json({ message: dup });
        }
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

module.exports = { create, getAll, getOne, getMe, update, remove, generateEmployeeCodeHandler };

