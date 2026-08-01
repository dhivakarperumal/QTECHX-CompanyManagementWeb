const { getDB } = require("../config/db");

const DEFAULT_LEAVE_TYPES = [
  "Casual Leave",
  "Sick Leave",
  "Earned Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Work From Home",
  "Comp Off"
];

async function ensureDefaultLeaveSettings() {
  const db = getDB();
  const [rows] = await db.execute("SELECT COUNT(*) AS count FROM employee_leave_settings");

  if (rows[0].count > 0) {
    return;
  }

  const values = DEFAULT_LEAVE_TYPES.map((leaveType) => [leaveType, 0, 1]);
  await db.query(
    "INSERT INTO employee_leave_settings (leave_type, max_days, is_active) VALUES ?",
    [values]
  );
}

async function getAllLeaveSettings() {
  const db = getDB();
  await ensureDefaultLeaveSettings();

  const [rows] = await db.execute(
    "SELECT * FROM employee_leave_settings ORDER BY leave_type ASC"
  );
  return rows;
}

async function getLeaveSettingByType(leaveType) {
  const db = getDB();
  await ensureDefaultLeaveSettings();

  const [rows] = await db.execute(
    "SELECT * FROM employee_leave_settings WHERE leave_type = ? LIMIT 1",
    [leaveType]
  );
  return rows[0] || null;
}

async function upsertLeaveSetting(settingData) {
  const db = getDB();
  const leaveType = settingData.leave_type?.trim();
  const maxDays = Number(settingData.max_days ?? 0);
  const description = settingData.description || null;
  const isActive = settingData.is_active === undefined ? 1 : Number(settingData.is_active);
  const updatedBy = settingData.updated_by || settingData.created_by || null;

  if (!leaveType) {
    throw new Error("Leave type is required");
  }

  if (Number.isNaN(maxDays) || maxDays < 0) {
    throw new Error("Maximum days must be zero or greater");
  }

  const [existingRows] = await db.execute(
    "SELECT id FROM employee_leave_settings WHERE leave_type = ? LIMIT 1",
    [leaveType]
  );

  if (existingRows.length) {
    await db.execute(
      `UPDATE employee_leave_settings
       SET max_days = ?, description = ?, is_active = ?, updated_by = ?, updated_at = CURRENT_TIMESTAMP
       WHERE leave_type = ?`,
      [maxDays, description, isActive, updatedBy, leaveType]
    );
  } else {
    await db.execute(
      `INSERT INTO employee_leave_settings (leave_type, max_days, description, is_active, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [leaveType, maxDays, description, isActive, updatedBy, updatedBy]
    );
  }

  return getLeaveSettingByType(leaveType);
}

module.exports = {
  DEFAULT_LEAVE_TYPES,
  getAllLeaveSettings,
  getLeaveSettingByType,
  upsertLeaveSetting
};
