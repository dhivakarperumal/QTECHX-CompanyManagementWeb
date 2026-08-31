const { createAttendance, getAttendanceSummary, getEmployeeAttendance, updateAttendance, getEmployeeAttendanceToday } = require("../models/attendanceModel");
const { calculateAttendanceMetrics } = require("../utils/attendanceUtils");
const { getDB } = require("../config/db");

function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getLocalTimeString(d = new Date()) {
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

async function checkin(req, res) {
  return clockIn(req, res);
}

async function checkout(req, res) {
  return clockOut(req, res);
}

async function clockIn(req, res) {
  try {
    const payload = req.body || {};
    const employee_id = payload.employee_id || req.user?.employee_id || req.user?.user_id;

    if (!employee_id) {
      return res.status(400).json({ message: "employee_id is required" });
    }

    const date = new Date();
    
    if (date.getDay() === 0) {
      return res.status(403).json({ message: "Attendance cannot be marked on Sundays" });
    }

    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const attendanceDate = payload.date || getLocalDateString(date);
    const timeStr = payload.check_in_time || getLocalTimeString(date);

    const db = getDB();
    const [holidayEvents] = await db.execute(
      "SELECT id FROM events WHERE eventType = 'Holiday' AND DATE(startDate) <= ? AND DATE(endDate) >= ?",
      [attendanceDate, attendanceDate]
    );
    if (holidayEvents.length > 0) {
      return res.status(403).json({ message: "Attendance cannot be marked on a Holiday" });
    }

    const [leaveRows] = await db.execute(
      `SELECT id FROM employee_leaves WHERE employee_id = ? AND status = 'Approved' AND from_date <= ? AND to_date >= ? LIMIT 1`,
      [employee_id, attendanceDate, attendanceDate]
    );
    if (leaveRows.length > 0) {
      return res.status(403).json({ message: "Attendance cannot be marked while approved leave exists for this date." });
    }

    const existing = await getEmployeeAttendanceToday(employee_id, attendanceDate);
    if (existing && existing.check_in_time) {
      return res.status(409).json({ message: "Already clocked in today", attendance: existing });
    }

    const computed = calculateAttendanceMetrics({
      check_in_time: timeStr,
      check_out_time: null,
    });

    const record = {
      employee_id,
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

    if (existing) {
      delete record.created_by;
      const updated = await updateAttendance(existing.id, record);
      return res.status(200).json({ message: "Clocked in successfully", attendance: updated });
    }

    const result = await createAttendance(record);
    return res.status(201).json({ message: "Clocked in successfully", attendance: result });
  } catch (error) {
    console.error("Clock In error:", error);
    return res.status(500).json({ message: "Failed to clock in" });
  }
}

async function breakStart(req, res) {
  try {
    const payload = req.body || {};
    const employee_id = payload.employee_id || req.user?.employee_id || req.user?.user_id;

    if (!employee_id) {
      return res.status(400).json({ message: "employee_id is required" });
    }

    const date = new Date();
    const attendanceDate = payload.date || getLocalDateString(date);
    const timeStr = payload.break_start_time || getLocalTimeString(date);

    const existing = await getEmployeeAttendanceToday(employee_id, attendanceDate);
    if (!existing) {
      return res.status(404).json({ message: "No attendance record found for today. Please clock in first." });
    }
    if (existing.check_out_time) {
       return res.status(400).json({ message: "Already clocked out today" });
    }

    const updated = await updateAttendance(existing.id, { break_start_time: timeStr });
    return res.status(200).json({ message: "Break started successfully", attendance: updated });
  } catch (error) {
    console.error("Break Start error:", error);
    return res.status(500).json({ message: "Failed to start break" });
  }
}

async function breakEnd(req, res) {
  try {
    const payload = req.body || {};
    const employee_id = payload.employee_id || req.user?.employee_id || req.user?.user_id;

    if (!employee_id) {
      return res.status(400).json({ message: "employee_id is required" });
    }

    const date = new Date();
    const attendanceDate = payload.date || getLocalDateString(date);
    const timeStr = payload.break_end_time || getLocalTimeString(date);

    const existing = await getEmployeeAttendanceToday(employee_id, attendanceDate);
    if (!existing) return res.status(404).json({ message: "No attendance record found" });
    if (!existing.break_start_time) return res.status(400).json({ message: "Break was not started" });
    if (existing.break_end_time) return res.status(400).json({ message: "Break already ended" });

    const updated = await updateAttendance(existing.id, { break_end_time: timeStr });
    return res.status(200).json({ message: "Break ended successfully", attendance: updated });
  } catch (error) {
    console.error("Break End error:", error);
    return res.status(500).json({ message: "Failed to end break" });
  }
}

async function clockOut(req, res) {
  try {
    const payload = req.body || {};
    const employee_id = payload.employee_id || req.user?.employee_id || req.user?.user_id;

    if (!employee_id) {
      return res.status(400).json({ message: "employee_id is required" });
    }

    const date = new Date();
    const attendanceDate = payload.date || getLocalDateString(date);
    const timeStr = payload.check_out_time || getLocalTimeString(date);

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
      attendance_status: computed.attendance_status || "Present",
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
    const employee_id = payload.employee_id || req.user?.employee_id || req.user?.user_id;

    if (!employee_id) {
      return res.status(400).json({ message: "Employee ID is required" });
    }
    
    let attendanceDate = payload.date;
    if (!attendanceDate) {
      attendanceDate = getLocalDateString();
    }

    const [yStr, mStr, dStr] = attendanceDate.split('-');
    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10);
    const day = parseInt(dStr, 10);
    const date = new Date(year, month - 1, day);
    
    if (date.getDay() === 0) {
      return res.status(403).json({ message: "Attendance cannot be marked on Sundays" });
    }

    const db = getDB();
    const [holidayEvents] = await db.execute(
      "SELECT id FROM events WHERE eventType = 'Holiday' AND DATE(startDate) <= ? AND DATE(endDate) >= ?",
      [attendanceDate, attendanceDate]
    );
    if (holidayEvents.length > 0) {
      return res.status(403).json({ message: "Attendance cannot be marked on a Holiday" });
    }

    const [leaveRows] = await db.execute(
      `SELECT id FROM employee_leaves WHERE employee_id = ? AND status = 'Approved' AND from_date <= ? AND to_date >= ? LIMIT 1`,
      [employee_id, attendanceDate, attendanceDate]
    );
    if (leaveRows.length > 0) {
      return res.status(403).json({ message: "Attendance cannot be marked while approved leave exists for this date." });
    }

    const computed = calculateAttendanceMetrics({
      check_in_time: payload.check_in_time,
      check_out_time: payload.check_out_time,
      break_start_time: payload.break_start_time,
      break_end_time: payload.break_end_time,
    });

    const record = {
      employee_id,
      attendance_date: attendanceDate,
      month,
      year,
      check_in_time: payload.check_in_time || null,
      check_out_time: payload.check_out_time || null,
      break_start_time: payload.break_start_time || null,
      break_end_time: payload.break_end_time || null,
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

    const existing = await getEmployeeAttendanceToday(employee_id, attendanceDate);
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
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const monthStr = String(month).padStart(2, '0');
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDay = `${year}-${monthStr}-01`;
    const lastDay = `${year}-${monthStr}-${String(daysInMonth).padStart(2, '0')}`;
    
    const startDate = req.query.startDate || firstDay;
    const endDate = req.query.endDate || lastDay;
    const rows = await getAttendanceSummary({ startDate, endDate });

    const db = getDB();

    // If viewing a single day, inject that specific date's records and dynamically calculate missing statuses
    if (startDate === endDate) {
      const todayDate = startDate;
      const currentDateStr = getLocalDateString(now);
      
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const timeInMinutes = currentHours * 60 + currentMinutes;

      const [todayRecords] = await db.execute("SELECT * FROM attendance WHERE attendance_date = ?", [todayDate]);
      const recordsByEmp = {};
      todayRecords.forEach(r => { recordsByEmp[String(r.employee_id)] = r; });
      
      const [leaveRecords] = await db.execute("SELECT employee_id FROM employee_leaves WHERE status = 'Approved' AND from_date <= ? AND to_date >= ?", [todayDate, todayDate]);
      const leavesByEmp = new Set(leaveRecords.map(r => String(r.employee_id)));

      for (const row of rows) {
        const todayRecord = recordsByEmp[String(row.employee_id)];
        
        if (!todayRecord) {
          if (leavesByEmp.has(String(row.employee_id))) {
            row.today_status = 'On Leave';
          } else if (todayDate === currentDateStr && timeInMinutes <= 585) { // 9:45 AM cutoff
            row.today_status = 'Pending';
          } else {
            row.absent_days = (row.absent_days || 0) + 1;
            row.today_status = 'Absent';
          }
        } else {
           row.today_status = todayRecord.attendance_status || 'Present';
           row.check_in_time = todayRecord.check_in_time;

           // Build effective times: prefer recorded values, but infer when check-in exists
           const effective = {
             check_in_time: todayRecord.check_in_time,
             check_out_time: todayRecord.check_out_time,
             break_start_time: todayRecord.break_start_time,
             break_end_time: todayRecord.break_end_time,
           };

           // Only apply inference when check-in was provided
           if (todayRecord.check_in_time) {
             // If break not marked at all and it's past 4:00 PM, assume break was 14:00-15:00
             if (!todayRecord.break_start_time && !todayRecord.break_end_time && timeInMinutes >= (16 * 60)) {
               effective.break_start_time = '14:00';
               effective.break_end_time = '15:00';
             }

             // If checkout not marked and it's past 7:00 PM, assume checkout was 18:00
             if (!todayRecord.check_out_time && timeInMinutes >= (19 * 60)) {
               effective.check_out_time = '18:00';
             }
           }

           // Compute metrics using effective times so working hours/late/overtime reflect inferred values
           const computedToday = calculateAttendanceMetrics({
             check_in_time: effective.check_in_time,
             check_out_time: effective.check_out_time,
             break_start_time: effective.break_start_time,
             break_end_time: effective.break_end_time,
           });

           row.check_out_time = todayRecord.check_out_time || effective.check_out_time || null;
           row.break_start_time = todayRecord.break_start_time || effective.break_start_time || null;
           row.break_end_time = todayRecord.break_end_time || effective.break_end_time || null;
           row.working_hours = todayRecord.working_hours || computedToday.working_hours;
           row.late_entry = todayRecord.late_entry || computedToday.late_entry;
           row.early_exit = todayRecord.early_exit || computedToday.early_exit;
           row.overtime = todayRecord.overtime || computedToday.overtime;
        }
      }
    }

    const [trendRows] = await db.execute(
      `SELECT attendance_date,
              SUM(CASE WHEN attendance_status = 'Present' THEN 1 ELSE 0 END) AS present_count
       FROM attendance
       WHERE attendance_date BETWEEN ? AND ?
       GROUP BY attendance_date
       ORDER BY attendance_date`,
      [startDate, endDate]
    );

    const trendData = (trendRows || []).slice(-7).map((entry) => {
      let dayName = 'Unknown';
      if (entry.attendance_date) {
        try {
          let dateObj;
          const dateStr = String(entry.attendance_date);
          
          if (dateStr.includes('-')) {
            const [year, month, day] = dateStr.split('-');
            dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          } else {
            dateObj = new Date(entry.attendance_date);
          }
          
          if (!isNaN(dateObj.getTime())) {
            dayName = dateObj.toLocaleDateString('en-GB', { weekday: 'short' });
          }
        } catch (e) {
          dayName = 'Unknown';
        }
      }
      return {
        name: dayName,
        count: Number(entry.present_count || 0)
      };
    });

    const [departmentRows] = await db.execute(
      `SELECT
         CASE
           WHEN LOWER(COALESCE(e.designation, '')) LIKE '%hr%' OR LOWER(COALESCE(e.role, '')) = 'hr' THEN 'HR'
           WHEN LOWER(COALESCE(e.designation, '')) LIKE '%design%' THEN 'Design'
           WHEN LOWER(COALESCE(e.designation, '')) LIKE '%marketing%' THEN 'Marketing'
           WHEN LOWER(COALESCE(e.designation, '')) LIKE '%sales%' THEN 'Sales'
           WHEN LOWER(COALESCE(e.designation, '')) LIKE '%developer%' OR LOWER(COALESCE(e.designation, '')) LIKE '%software%' OR LOWER(COALESCE(e.designation, '')) LIKE '%engineer%' THEN 'Development'
           ELSE 'General'
         END AS department_name,
         COUNT(*) AS total_employees,
         SUM(CASE WHEN a.attendance_status = 'Present' THEN 1 ELSE 0 END) AS present_count,
         SUM(CASE WHEN a.attendance_status = 'Leave' THEN 1 ELSE 0 END) AS leave_count
       FROM employees e
       LEFT JOIN attendance a ON a.employee_id = e.employee_id AND a.attendance_date BETWEEN ? AND ?
       WHERE e.employment_status = 'Active'
       GROUP BY department_name
       ORDER BY present_count DESC, department_name`,
      [startDate, endDate]
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
       WHERE a.attendance_date BETWEEN ? AND ?
       ORDER BY COALESCE(a.updated_at, a.created_at) DESC
       LIMIT 6`,
      [startDate, endDate]
    );

    const recentActivity = (activityRows || []).map((row) => ({
      employee_name: row.employee_name || `${row.first_name || ''} ${row.last_name || ''}`.trim() || row.employee_code || 'Employee',
      status: row.attendance_status || 'Present',
      check_in_time: row.check_in_time || null,
      updated_at: row.updated_at || row.created_at
    }));

    return res.json({ data: rows, startDate, endDate, trendData, departmentData, recentActivity });
  } catch (error) {
    console.error("Attendance summary error:", error);
    return res.status(500).json({ message: "Failed to retrieve attendance summary" });
  }
}

async function employeeAttendance(req, res) {
  try {
    let { employeeId } = req.params;
    if (!employeeId || employeeId === 'undefined' || employeeId === 'null') {
      employeeId = req.user?.employee_id || req.user?.user_id;
    }

    const now = new Date();
    let startDate = req.query.startDate;
    let endDate = req.query.endDate;
    
    if (!startDate || !endDate) {
      const year = req.query.year ? parseInt(req.query.year, 10) : now.getFullYear();
      const month = req.query.month ? parseInt(req.query.month, 10) : (now.getMonth() + 1);
      const monthStr = String(month).padStart(2, '0');
      const daysInMonth = new Date(year, month, 0).getDate();
      startDate = `${year}-${monthStr}-01`;
      endDate = `${year}-${monthStr}-${String(daysInMonth).padStart(2, '0')}`;
    }

    const rows = await getEmployeeAttendance({ employeeId, startDate, endDate });
    return res.json({ data: rows, startDate, endDate });
  } catch (error) {
    console.error("Employee attendance error:", error);
    return res.status(500).json({ message: "Failed to retrieve employee attendance" });
  }
}

async function getByEmployeeDate(req, res) {
  try {
    const employee_id = req.query.employee_id || req.body?.employee_id || req.user?.employee_id || req.user?.user_id;
    let attendanceDate = req.query.date || req.body?.date;

    if (!employee_id) {
      return res.status(400).json({ message: "employee_id is required" });
    }

    if (!attendanceDate) {
      attendanceDate = getLocalDateString();
    }

    const existing = await getEmployeeAttendanceToday(employee_id, attendanceDate);
    if (!existing) {
      return res.status(404).json({ message: "No attendance found for the given employee and date" });
    }

    return res.json({ attendance: existing });
  } catch (error) {
    console.error("Get attendance by employee/date error:", error);
    return res.status(500).json({ message: "Failed to retrieve attendance" });
  }
}

module.exports = { create, summary, employeeAttendance, checkin, checkout, clockIn, clockOut, breakStart, breakEnd, getByEmployeeDate };

