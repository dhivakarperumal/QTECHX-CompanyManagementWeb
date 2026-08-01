const LeaveModel = require("../models/employeeLeaveModel");
const leaveSettingsModel = require("../models/leaveSettingsModel");

function getAuthenticatedEmployeeId(req) {
  return req.user?.employee_id || req.user?.id || req.user?.user_id || null;
}

async function applyLeave(req, res) {
  try {
    const { leave_type, from_date, to_date, no_of_days, day_type, half_day_type, reason } = req.body;
    const employee_id = getAuthenticatedEmployeeId(req);

    if (!employee_id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!leave_type || !from_date || !to_date || !no_of_days || !reason) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const leaveSetting = await leaveSettingsModel.getLeaveSettingByType(leave_type);
    const requestedDays = Number(no_of_days);
    const maxDays = leaveSetting?.is_active ? Number(leaveSetting.max_days || 0) : null;

    if (leaveSetting && Number(leaveSetting.is_active) === 1 && maxDays >= 0 && requestedDays > maxDays) {
      return res.status(400).json({
        success: false,
        message: `${leave_type} limit exceeded. Maximum allowed days: ${maxDays}`
      });
    }

    const leaveData = {
      employee_id,
      leave_type,
      from_date,
      to_date,
      no_of_days,
      day_type: day_type || 'Full Day',
      half_day_type: half_day_type || null,
      reason,
      status: 'Pending',
      created_by: employee_id
    };

    const newLeave = await LeaveModel.createLeave(leaveData);
    res.status(201).json({ success: true, message: "Leave applied successfully", data: newLeave });
  } catch (error) {
    console.error("Error applying leave:", error);
    res.status(500).json({ success: false, message: "Failed to apply leave", error: error.message });
  }
}

async function getMyLeaves(req, res) {
  try {
    const employee_id = getAuthenticatedEmployeeId(req);
    if (!employee_id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const leaves = await LeaveModel.getLeavesByEmployeeId(employee_id);
    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    console.error("Error fetching my leaves:", error);
    res.status(500).json({ success: false, message: "Failed to fetch leaves", error: error.message });
  }
}

async function getAllLeaves(req, res) {
  try {
    const leaves = await LeaveModel.getAllLeaves();
    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    console.error("Error fetching all leaves:", error);
    res.status(500).json({ success: false, message: "Failed to fetch leaves", error: error.message });
  }
}

async function updateLeaveStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, admin_reason } = req.body;
    const admin_id = getAuthenticatedEmployeeId(req) || 'admin';

    if (!status) {
      return res.status(400).json({ success: false, message: "Status is required" });
    }

    const updatedLeave = await LeaveModel.updateLeaveStatus(id, status, admin_reason, admin_id);
    res.status(200).json({ success: true, message: "Leave status updated successfully", data: updatedLeave });
  } catch (error) {
    console.error("Error updating leave status:", error);
    res.status(500).json({ success: false, message: "Failed to update leave status", error: error.message });
  }
}

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus
};
