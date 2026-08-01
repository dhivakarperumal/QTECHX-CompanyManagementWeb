const leaveSettingsModel = require("../models/leaveSettingsModel");

async function listLeaveSettings(req, res) {
  try {
    const settings = await leaveSettingsModel.getAllLeaveSettings();
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching leave settings:", error);
    res.status(500).json({ success: false, message: "Failed to fetch leave settings", error: error.message });
  }
}

async function saveLeaveSettings(req, res) {
  try {
    const updatedBy = req.user?.employee_id || req.user?.id || req.user?.user_id || null;
    const settings = Array.isArray(req.body) ? req.body : [req.body];

    const savedSettings = [];
    for (const item of settings) {
      const saved = await leaveSettingsModel.upsertLeaveSetting({
        ...item,
        updated_by: updatedBy,
        created_by: updatedBy
      });
      savedSettings.push(saved);
    }

    res.status(200).json({ success: true, message: "Leave settings saved", data: savedSettings });
  } catch (error) {
    console.error("Error saving leave settings:", error);
    res.status(400).json({ success: false, message: error.message || "Failed to save leave settings" });
  }
}

module.exports = {
  listLeaveSettings,
  saveLeaveSettings
};
