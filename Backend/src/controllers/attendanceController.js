const { createAttendance, getAttendanceSummary, getEmployeeAttendance } = require("../models/attendanceModel");

const calculateAttendanceMetrics = ({ check_in_time, check_out_time }) => {
  const parseTime = (value) => {
    if (!value) return null;
    const [time, modifier] = String(value).split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    let total = hours * 60 + minutes;

    if (modifier === "PM" && hours !== 12) total += 12 * 60;
    if (modifier === "AM" && hours === 12) total -= 12 * 60;

    return total;
  };

  const officeCheckIn = parseTime("9:30 AM");
  const officeCheckOut = parseTime("6:00 PM");

  const checkInMinutes = parseTime(check_in_time);
  const checkOutMinutes = parseTime(check_out_time);

  let lateEntry = "No";
  let earlyExit = "No";
  let overtime = "No";
  let workingHours = "0h 0m";

  if (checkInMinutes !== null) {
    const lateBy = checkInMinutes - officeCheckIn;
    if (lateBy > 0) {
      lateEntry = `${Math.floor(lateBy / 60)}h ${lateBy % 60}m`;
    }
  }

  if (checkOutMinutes !== null) {
    const exitBefore = officeCheckOut - checkOutMinutes;
    if (exitBefore > 0) {
      earlyExit = `${Math.floor(exitBefore / 60)}h ${exitBefore % 60}m`;
    }
  }

  if (checkInMinutes !== null && checkOutMinutes !== null) {
    const durationMinutes = Math.max(0, checkOutMinutes - checkInMinutes);
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    workingHours = `${hours}h ${minutes}m`;

    const overtimeMinutes = Math.max(0, checkOutMinutes - officeCheckOut);
    if (overtimeMinutes > 0) {
      overtime = `${Math.floor(overtimeMinutes / 60)}h ${overtimeMinutes % 60}m`;
    }
  }

  return {
    late_entry: lateEntry,
    early_exit: earlyExit,
    overtime,
    working_hours: workingHours,
  };
};

async function create(req, res) {
  try {
    const payload = req.body;
    const date = payload.date ? new Date(payload.date) : new Date();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const attendanceDate = date.toISOString().slice(0, 10);

    const computed = calculateAttendanceMetrics({
      check_in_time: payload.check_in_time,
      check_out_time: payload.check_out_time,
    });

    const record = {
      employee_id: payload.employee_id,
      attendance_date: attendanceDate,
      month,
      year,
      check_in_time: payload.check_in_time,
      check_out_time: payload.check_out_time,
      working_hours: computed.working_hours,
      late_entry: computed.late_entry,
      early_exit: computed.early_exit,
      overtime: computed.overtime,
      attendance_status: payload.attendance_status || "Present",
      location: payload.location || null,
      notes: payload.notes || null,
      created_by: req.user?.user_id || "SYSTEM",
      updated_by: req.user?.user_id || "SYSTEM",
    };

    const result = await createAttendance(record);
    if (result?.exists) {
      return res.status(409).json({ message: "Attendance already exists for this employee and date" });
    }

    return res.status(201).json({ message: "Attendance recorded successfully", attendance: result });
  } catch (error) {
    console.error("Create attendance error:", error);
    return res.status(500).json({ message: "Failed to create attendance" });
  }
}

async function summary(req, res) {
  try {
    const month = Number(req.query.month || new Date().getMonth() + 1);
    const year = Number(req.query.year || new Date().getFullYear());
    const rows = await getAttendanceSummary({ month, year });
    return res.json({ data: rows, month, year });
  } catch (error) {
    console.error("Attendance summary error:", error);
    return res.status(500).json({ message: "Failed to retrieve attendance summary" });
  }
}

async function employeeAttendance(req, res) {
  try {
    const month = Number(req.query.month || new Date().getMonth() + 1);
    const year = Number(req.query.year || new Date().getFullYear());
    const rows = await getEmployeeAttendance({ employeeId: req.params.employeeId, month, year });
    return res.json({ data: rows, month, year });
  } catch (error) {
    console.error("Employee attendance error:", error);
    return res.status(500).json({ message: "Failed to retrieve employee attendance" });
  }
}

module.exports = { create, summary, employeeAttendance };
