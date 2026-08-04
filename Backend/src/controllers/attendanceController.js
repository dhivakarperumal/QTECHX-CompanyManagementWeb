const { createAttendance, getAttendanceSummary, getEmployeeAttendance, updateAttendance, getEmployeeAttendanceToday } = require("../models/attendanceModel");
const { calculateAttendanceMetrics } = require("../utils/attendanceUtils");
const { getDB } = require("../config/db");

async function clockIn(req, res) {
  try {
    const payload = req.body;
    const date = new Date();
    
    if (date.getDay() === 0) {
      return res.status(403).json({ message: "Attendance cannot be marked on Sundays" });
    }

    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const attendanceDate = date.toISOString().slice(0, 10);
    const timeStr = date.toTimeString().slice(0, 5); // HH:MM

    const db = getDB();
    const [holidayEvents] = await db.execute(
      "SELECT id FROM events WHERE eventType = 'Holiday' AND DATE(startDate) = ?", 
      [attendanceDate]
    );
    if (holidayEvents.length > 0) {
      return res.status(403).json({ message: "Attendance cannot be marked on a Holiday" });
    }

    const existing = await getEmployeeAttendanceToday(payload.employee_id, attendanceDate);
    if (existing) {
      return res.status(409).json({ message: "Already clocked in today" });
    }

    const computed = calculateAttendanceMetrics({
      check_in_time: timeStr,
      check_out_time: null,
    });

    const record = {
      employee_id: payload.employee_id,
      attendance_date: attendanceDate,
      month,
      year,
      check_in_time: timeStr,
      working_hours: computed.working_hours,
      late_entry: computed.late_entry,
      early_exit: computed.early_exit,
      overtime: computed.overtime,
      attendance_status: "Present",
      location: payload.location || null,
      created_by: req.user?.user_id || "SYSTEM",
      updated_by: req.user?.user_id || "SYSTEM",
    };

    const result = await createAttendance(record);
    return res.status(201).json({ message: "Clocked in successfully", attendance: result });
  } catch (error) {
    console.error("Clock In error:", error);
    return res.status(500).json({ message: "Failed to clock in" });
  }
}

async function breakStart(req, res) {
  try {
    const { employee_id } = req.body;
    const date = new Date();
    const attendanceDate = date.toISOString().slice(0, 10);
    const timeStr = date.toTimeString().slice(0, 5);

    const existing = await getEmployeeAttendanceToday(employee_id, attendanceDate);
    if (!existing) {
      return res.status(404).json({ message: "No attendance record found for today. Please clock in first." });
    }
    if (existing.check_out_time) {
       return res.status(400).json({ message: "Already clocked out today" });
    }

    const updated = await updateAttendance(existing.id, { break_start_time: timeStr });
    return res.status(200).json({ message: "Break started", attendance: updated });
  } catch (error) {
    console.error("Break Start error:", error);
    return res.status(500).json({ message: "Failed to start break" });
  }
}

async function breakEnd(req, res) {
  try {
    const { employee_id } = req.body;
    const date = new Date();
    const attendanceDate = date.toISOString().slice(0, 10);
    const timeStr = date.toTimeString().slice(0, 5);

    const existing = await getEmployeeAttendanceToday(employee_id, attendanceDate);
    if (!existing) return res.status(404).json({ message: "No attendance record found" });
    if (!existing.break_start_time) return res.status(400).json({ message: "Break was not started" });
    if (existing.break_end_time) return res.status(400).json({ message: "Break already ended" });

    const updated = await updateAttendance(existing.id, { break_end_time: timeStr });
    return res.status(200).json({ message: "Break ended", attendance: updated });
  } catch (error) {
    console.error("Break End error:", error);
    return res.status(500).json({ message: "Failed to end break" });
  }
}

async function clockOut(req, res) {
  try {
    const { employee_id } = req.body;
    const date = new Date();
    const attendanceDate = date.toISOString().slice(0, 10);
    const timeStr = date.toTimeString().slice(0, 5);

    const existing = await getEmployeeAttendanceToday(employee_id, attendanceDate);
    if (!existing) return res.status(404).json({ message: "No attendance record found" });
    if (existing.check_out_time) return res.status(400).json({ message: "Already clocked out" });

    const computed = calculateAttendanceMetrics({
      check_in_time: existing.check_in_time,
      check_out_time: timeStr,
      break_start_time: existing.break_start_time,
      break_end_time: existing.break_end_time,
    });

    const record = {
      check_out_time: timeStr,
      working_hours: computed.working_hours,
      late_entry: computed.late_entry,
      early_exit: computed.early_exit,
      overtime: computed.overtime,
      attendance_status: computed.attendance_status,
      updated_by: req.user?.user_id || "SYSTEM",
    };

    const updated = await updateAttendance(existing.id, record);
    return res.status(200).json({ message: "Clocked out successfully", attendance: updated });
  } catch (error) {
    console.error("Clock Out error:", error);
    return res.status(500).json({ message: "Failed to clock out" });
  }
}

async function create(req, res) {
  try {
    const payload = req.body;
    
    // Parse the date properly to avoid UTC shift issues
    let date;
    if (payload.date) {
      const [y, m, d] = payload.date.split('-');
      date = new Date(y, m - 1, d);
    } else {
      date = new Date();
    }
    
    if (date.getDay() === 0) {
      return res.status(403).json({ message: "Attendance cannot be marked on Sundays" });
    }

    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const attendanceDate = payload.date || [
      year,
      String(month).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')
    ].join('-');

    const db = getDB();
    const [holidayEvents] = await db.execute(
      "SELECT id FROM events WHERE eventType = 'Holiday' AND DATE(startDate) = ?", 
      [attendanceDate]
    );
    if (holidayEvents.length > 0) {
      return res.status(403).json({ message: "Attendance cannot be marked on a Holiday" });
    }

    const computed = calculateAttendanceMetrics({
      check_in_time: payload.check_in_time,
      check_out_time: payload.check_out_time,
      break_start_time: payload.break_start_time,
      break_end_time: payload.break_end_time,
    });

    const record = {
      employee_id: payload.employee_id,
      attendance_date: attendanceDate,
      month,
      year,
      check_in_time: payload.check_in_time,
      check_out_time: payload.check_out_time,
      break_start_time: payload.break_start_time,
      break_end_time: payload.break_end_time,
      working_hours: computed.working_hours,
      late_entry: computed.late_entry,
      early_exit: computed.early_exit,
      overtime: computed.overtime,
      attendance_status: computed.attendance_status || payload.attendance_status || "Present",
      location: payload.location || null,
      notes: payload.notes || null,
      created_by: req.user?.user_id || "SYSTEM",
      updated_by: req.user?.user_id || "SYSTEM",
    };

    const existing = await getEmployeeAttendanceToday(payload.employee_id, attendanceDate);
    if (existing) {
      delete record.created_by;
      const updated = await updateAttendance(existing.id, record);
      return res.status(200).json({ message: "Attendance updated successfully", attendance: updated });
    }

    const result = await createAttendance(record);
    return res.status(201).json({ message: "Attendance recorded successfully", attendance: result });
  } catch (error) {
    console.error("Create attendance error:", error);
    return res.status(500).json({ message: "Failed to create attendance" });
  }
}

async function summary(req, res) {
  try {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const month = Number(req.query.month || currentMonth);
    const year = Number(req.query.year || currentYear);
    const rows = await getAttendanceSummary({ month, year });

    // If viewing current month, inject "Late" or "Leave" dynamically for today's missing records
    if (month === currentMonth && year === currentYear) {
      const db = getDB();
      const todayDate = new Date().toISOString().slice(0, 10);
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const timeInMinutes = currentHours * 60 + currentMinutes;

      // 9:30 AM = 570 mins, 10:00 AM = 600 mins
      if (timeInMinutes > 570) {
        const [activeEmployees] = await db.execute("SELECT employee_id FROM employees WHERE employment_status = 'Active'");
        const [todayRecords] = await db.execute("SELECT employee_id FROM attendance WHERE attendance_date = ?", [todayDate]);
        
        const attendedIds = new Set(todayRecords.map(r => String(r.employee_id)));
        
        for (const row of rows) {
          if (!attendedIds.has(String(row.employee_id))) {
            if (timeInMinutes > 600) {
              row.absent_days = (row.absent_days || 0) + 1;
              row.today_status = 'Leave'; // Or Absent
            } else {
              row.today_status = 'Late';
            }
          } else {
             row.today_status = 'Present'; // Simplified, actual logic can check time
          }
        }
      }
    }

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

module.exports = { create, summary, employeeAttendance, clockIn, clockOut, breakStart, breakEnd };
