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

    const db = getDB();

    // If viewing current month, inject today's records and dynamically calculate missing statuses
    if (month === currentMonth && year === currentYear) {
      const now = new Date();
      const todayDate = [
        now.getFullYear(),
        String(now.getMonth() + 1).padStart(2, '0'),
        String(now.getDate()).padStart(2, '0')
      ].join('-');
      
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const timeInMinutes = currentHours * 60 + currentMinutes;

      const [todayRecords] = await db.execute("SELECT * FROM attendance WHERE attendance_date = ?", [todayDate]);
      const recordsByEmp = {};
      todayRecords.forEach(r => { recordsByEmp[String(r.employee_id)] = r; });
      
      for (const row of rows) {
        const todayRecord = recordsByEmp[String(row.employee_id)];
        
        if (!todayRecord) {
          if (timeInMinutes > 585) {
            row.absent_days = (row.absent_days || 0) + 1;
            row.today_status = 'Leave';
          } else if (timeInMinutes >= 570) {
            row.today_status = 'Late';
          } else {
            row.today_status = 'Pending';
          }
        } else {
           const hasLateEntry = Boolean(todayRecord.late_entry && todayRecord.late_entry !== 'No' && todayRecord.late_entry !== '0h 0m');
           row.today_status = hasLateEntry ? 'Late' : (todayRecord.attendance_status || 'Present');
           row.check_in_time = todayRecord.check_in_time;
           row.check_out_time = todayRecord.check_out_time;
           row.break_start_time = todayRecord.break_start_time;
           row.break_end_time = todayRecord.break_end_time;
           row.working_hours = todayRecord.working_hours;
           row.late_entry = todayRecord.late_entry;
           row.early_exit = todayRecord.early_exit;
           row.overtime = todayRecord.overtime;
        }
      }
    }

    const [trendRows] = await db.execute(
      `SELECT attendance_date,
              SUM(CASE WHEN attendance_status = 'Present' THEN 1 ELSE 0 END) AS present_count,
              SUM(CASE WHEN attendance_status = 'Late' THEN 1 ELSE 0 END) AS late_count
       FROM attendance
       WHERE month = ? AND year = ?
       GROUP BY attendance_date
       ORDER BY attendance_date`,
      [month, year]
    );

    const trendData = (trendRows || []).slice(-7).map((entry) => {
      const date = new Date(`${entry.attendance_date}T00:00:00`);
      return {
        name: date.toLocaleDateString('en-GB', { weekday: 'short' }),
        count: Number(entry.present_count || 0) + Number(entry.late_count || 0)
      };
    });

    const [departmentRows] = await db.execute(
      `SELECT
         CASE
           WHEN TRIM(COALESCE(e.department, '')) <> '' THEN e.department
           WHEN LOWER(COALESCE(e.designation, '')) LIKE '%hr%' THEN 'HR'
           WHEN LOWER(COALESCE(e.designation, '')) LIKE '%design%' THEN 'Design'
           WHEN LOWER(COALESCE(e.designation, '')) LIKE '%marketing%' THEN 'Marketing'
           WHEN LOWER(COALESCE(e.designation, '')) LIKE '%sales%' THEN 'Sales'
           WHEN LOWER(COALESCE(e.designation, '')) LIKE '%developer%' OR LOWER(COALESCE(e.designation, '')) LIKE '%software%' OR LOWER(COALESCE(e.designation, '')) LIKE '%engineer%' THEN 'Development'
           ELSE 'General'
         END AS department_name,
         COUNT(*) AS total_employees,
         SUM(CASE WHEN a.attendance_status = 'Present' THEN 1 ELSE 0 END) AS present_count,
         SUM(CASE WHEN a.attendance_status = 'Late' THEN 1 ELSE 0 END) AS late_count,
         SUM(CASE WHEN a.attendance_status = 'Leave' THEN 1 ELSE 0 END) AS leave_count
       FROM employees e
       LEFT JOIN attendance a ON a.employee_id = e.employee_id AND a.month = ? AND a.year = ?
       WHERE e.employment_status = 'Active'
       GROUP BY department_name
       ORDER BY present_count DESC, department_name`,
      [month, year]
    );

    const departmentColors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];
    const departmentData = (departmentRows || []).map((row, index) => {
      const total = Number(row.total_employees || 0) || 1;
      const present = Number(row.present_count || 0);
      return {
        name: row.department_name || 'General',
        value: Math.max(1, Math.round((present / total) * 100)),
        color: departmentColors[index % departmentColors.length]
      };
    });

    const [activityRows] = await db.execute(
      `SELECT a.*, e.first_name, e.last_name, e.employee_code
       FROM attendance a
       LEFT JOIN employees e ON e.employee_id = a.employee_id
       WHERE a.month = ? AND a.year = ?
       ORDER BY COALESCE(a.updated_at, a.created_at) DESC
       LIMIT 6`,
      [month, year]
    );

    const recentActivity = (activityRows || []).map((row) => ({
      employee_name: row.employee_name || `${row.first_name || ''} ${row.last_name || ''}`.trim() || row.employee_code || 'Employee',
      status: row.attendance_status || 'Present',
      check_in_time: row.check_in_time || null,
      updated_at: row.updated_at || row.created_at
    }));

    return res.json({ data: rows, month, year, trendData, departmentData, recentActivity });
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
