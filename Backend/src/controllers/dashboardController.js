const { getDB } = require('../config/db');
const { resolveAllPossibleEmployeeIds } = require('../models/attendanceModel');

function getAuthenticatedEmployeeId(req) {
  return req.user?.employee_id || req.user?.employeeId || req.user?.user_id || req.user?.id || req.user?.uuid || req.user?.email || null;
}

async function getDashboardMetrics(req, res) {
  try {
    const db = getDB();

    // 1. Employee Count
    let totalEmployees = 0;
    try {
      const [empRows] = await db.execute("SELECT COUNT(*) AS total FROM employees");
      totalEmployees = empRows[0]?.total || 0;
    } catch (e) {
      console.warn('Dashboard totalEmployees error:', e.message);
    }

    // 2. Active Projects
    let activeProjects = 0;
    try {
      const [projRows] = await db.execute(
        "SELECT COUNT(*) AS total FROM projects WHERE current_status IN ('In Progress','Planning','Testing','Live')"
      );
      activeProjects = projRows[0]?.total || 0;
    } catch (e) {
      console.warn('Dashboard activeProjects error:', e.message);
    }

    // 3. Tasks in Progress & Total Tasks
    let tasksInProgress = 0;
    let totalTasks = 0;
    try {
      const [taskRows] = await db.execute(
        "SELECT COUNT(*) AS total FROM tasks WHERE status = 'In Progress' AND (active = 1 OR deleted = 0)"
      );
      tasksInProgress = taskRows[0]?.total || 0;

      const [allTaskRows] = await db.execute(
        "SELECT COUNT(*) AS total FROM tasks WHERE deleted = 0"
      );
      totalTasks = allTaskRows[0]?.total || 0;
    } catch (e) {
      console.warn('Dashboard tasks error:', e.message);
    }

    // 4. Attendance today
    let presentToday = 0;
    let totalAttendanceToday = 0;
    try {
      const [presentRows] = await db.execute(
        "SELECT COUNT(*) AS present FROM attendance WHERE (attendance_date = CURDATE() OR DATE(attendance_date) = CURDATE()) AND attendance_status = 'Present'"
      );
      presentToday = presentRows[0]?.present || 0;

      const [totalAttendanceRows] = await db.execute(
        "SELECT COUNT(*) AS total FROM attendance WHERE (attendance_date = CURDATE() OR DATE(attendance_date) = CURDATE())"
      );
      totalAttendanceToday = totalAttendanceRows[0]?.total || 0;
    } catch (e) {
      console.warn('Dashboard attendance error:', e.message);
    }

    // 5. Trainees & Interns
    let activeTrainees = 0;
    let internshipStudents = 0;
    let traineeTypeRows = [];
    try {
      const [traineeRows] = await db.execute(
        "SELECT COUNT(*) AS total FROM trainee_intern WHERE status = 'Active'"
      );
      activeTrainees = traineeRows[0]?.total || 0;

      const [internRows] = await db.execute(
        "SELECT COUNT(*) AS total FROM trainee_intern WHERE type = 'Intern'"
      );
      internshipStudents = internRows[0]?.total || 0;

      const [tRows] = await db.execute(
        "SELECT type, COUNT(*) as count FROM trainee_intern GROUP BY type"
      );
      traineeTypeRows = tRows || [];
    } catch (e) {
      console.warn('Dashboard trainees error:', e.message);
    }

    // 6. Monthly payroll (current month/year)
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    let monthlyPayroll = 0;
    try {
      const [payRows] = await db.execute(
        "SELECT IFNULL(SUM(total_salary),0) AS total FROM employee_salaries WHERE salary_month = ? AND salary_year = ?",
        [month, year]
      );
      monthlyPayroll = payRows[0]?.total || 0;
    } catch (e) {
      console.warn('Dashboard payroll error:', e.message);
    }

    // 7. Recent Activity (Union of last 10 activities)
    let recentRows = [];
    try {
      const [rRows] = await db.execute(`
        (SELECT 'New employee onboarded' as title, 'HR' as meta, created_at as time, first_name as user, profile_photo as avatar FROM employees)
        UNION ALL
        (SELECT 'Project added' as title, 'Projects' as meta, created_at as time, project_name as user, '' as avatar FROM projects)
        UNION ALL
        (SELECT CONCAT('New ', type, ' onboarded') as title, 'HR' as meta, created_at as time, full_name as user, profile_photo as avatar FROM trainee_intern)
        UNION ALL
        (SELECT 'Payroll processed' as title, 'Finance' as meta, created_at as time, 'System' as user, '' as avatar FROM employee_salaries)
        ORDER BY time DESC
        LIMIT 10
      `);
      recentRows = rRows || [];
    } catch (e) {
      console.warn('Dashboard recent activity error:', e.message);
    }

    // 8. Graph Data (Last 6 Months)
    let overviewRows = [];
    try {
      const [oRows] = await db.execute(`
        SELECT 
          DATE_FORMAT(m.m_date, '%b %Y') as name,
          IFNULL(e.emp_count, 0) as employees,
          IFNULL(p.proj_count, 0) as projects,
          IFNULL(i.inc_amount, 0) as income
        FROM (
          SELECT DATE_FORMAT(DATE_SUB(CURRENT_DATE(), INTERVAL n MONTH), '%Y-%m-01') as m_date
          FROM (SELECT 0 as n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5) n
        ) m
        LEFT JOIN (
          SELECT DATE_FORMAT(created_at, '%Y-%m-01') as dt, COUNT(*) as emp_count FROM employees GROUP BY dt
        ) e ON e.dt = m.m_date
        LEFT JOIN (
          SELECT DATE_FORMAT(created_at, '%Y-%m-01') as dt, COUNT(*) as proj_count FROM projects GROUP BY dt
        ) p ON p.dt = m.m_date
        LEFT JOIN (
          SELECT dt, SUM(inc_amount) AS inc_amount FROM (
            SELECT DATE_FORMAT(date_of_payment, '%Y-%m-01') as dt, SUM(amount) as inc_amount FROM incomes GROUP BY dt
            UNION ALL
            SELECT DATE_FORMAT(date_of_payment, '%Y-%m-01') as dt, SUM(amount_paid) as inc_amount FROM project_payments GROUP BY dt
          ) combined GROUP BY dt
        ) i ON i.dt = m.m_date
        ORDER BY m.m_date ASC
      `);
      overviewRows = oRows || [];
    } catch (e) {
      console.warn('Dashboard overview graph error:', e.message);
    }

    // 9. Current Month Income & Project Payments
    let currentMonthIncomes = 0;
    let currentMonthProjectPayments = 0;
    try {
      const [incomeRows] = await db.execute(
        `SELECT IFNULL(SUM(amount), 0) AS total FROM incomes WHERE MONTH(date_of_payment) = ? AND YEAR(date_of_payment) = ?`,
        [month, year]
      );
      currentMonthIncomes = parseFloat(incomeRows[0]?.total) || 0;

      const [currentProjectPaymentRows] = await db.execute(
        "SELECT IFNULL(SUM(amount_paid), 0) AS total FROM project_payments WHERE MONTH(date_of_payment) = ? AND YEAR(date_of_payment) = ?",
        [month, year]
      );
      currentMonthProjectPayments = parseFloat(currentProjectPaymentRows[0]?.total) || 0;
    } catch (e) {
      console.warn('Dashboard income error:', e.message);
    }
    const currentMonthIncome = currentMonthIncomes + currentMonthProjectPayments;

    // 10. Clients & Follow-ups
    let totalClients = 0;
    let pendingFollowUps = 0;
    let clientFollowUpRows = [];
    try {
      const [totalClientRows] = await db.execute("SELECT COUNT(*) as total FROM clients");
      totalClients = totalClientRows[0]?.total || 0;

      const [pendingFollowUpRows] = await db.execute(
        "SELECT COUNT(*) as total FROM clients WHERE follow_up_status = 'Pending' OR client_status IN ('Pending', 'Follow Up', 'Lead', 'Prospect')"
      );
      pendingFollowUps = pendingFollowUpRows[0]?.total || 0;

      const [cFollowRows] = await db.execute(
        "SELECT follow_up_status, COUNT(*) as count FROM clients GROUP BY follow_up_status"
      );
      clientFollowUpRows = cFollowRows || [];
    } catch (e) {
      console.warn('Dashboard client stats error:', e.message);
    }

    // 11. Recent 5 projects
    let recentProjectRows = [];
    let projectStatusRows = [];
    try {
      const [rProjects] = await db.execute(
        `SELECT p.id, p.uuid, p.project_name, p.current_status, p.overall_progress, p.project_start_date, p.project_end_date,
                p.client_name, p.project_manager
         FROM projects p
         ORDER BY p.created_at DESC LIMIT 5`
      );
      recentProjectRows = rProjects || [];

      const [pStatus] = await db.execute(
        `SELECT current_status, current_status as status, COUNT(*) as count FROM projects GROUP BY current_status`
      );
      projectStatusRows = pStatus || [];
    } catch (e) {
      console.warn('Dashboard projects error:', e.message);
    }

    // 12. Task status breakdown
    let taskStatusRows = [];
    try {
      const [tStatus] = await db.execute(
        `SELECT status, COUNT(*) as count FROM tasks WHERE deleted = 0 GROUP BY status`
      );
      taskStatusRows = tStatus || [];
    } catch (e) {
      console.warn('Dashboard task stats error:', e.message);
    }

    // 13. Upcoming events / meetings
    let upcomingEventRows = [];
    try {
      const [uEvents] = await db.execute(
        `SELECT id, title, startDate, startTime, eventType, location
         FROM events
         WHERE (startDate >= CURDATE() OR DATE(startDate) >= CURDATE())
         ORDER BY startDate ASC, startTime ASC LIMIT 5`
      );
      upcomingEventRows = uEvents || [];
    } catch (e) {
      console.warn('Dashboard events error:', e.message);
    }

    return res.json({
      success: true,
      totalEmployees,
      activeProjects,
      totalTasks,
      activeTrainees,
      internshipStudents,
      monthlyPayroll,
      clientStats: {
        total: totalClients,
        pendingFollowUps: pendingFollowUps
      },
      attendanceToday: {
        present: presentToday,
        total: totalAttendanceToday
      },
      currentMonthIncome,
      currentMonthProjectPayments,
      currentMonthIncomes,
      recentProjects: recentProjectRows,
      recentActivity: recentRows,
      projectStats: projectStatusRows,
      taskStats: taskStatusRows,
      clientFollowUps: clientFollowUpRows,
      traineeStats: traineeTypeRows,
      overviewData: overviewRows,
      upcomingEvents: upcomingEventRows,
    });
  } catch (err) {
    console.error('getDashboardMetrics error:', err);
    return res.status(500).json({ error: 'Failed to load dashboard metrics' });
  }
}

async function getEmployeeDashboardData(req, res) {
  try {
    const db = getDB();
    const employeeId = getAuthenticatedEmployeeId(req);

    if (!employeeId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const possibleIds = await resolveAllPossibleEmployeeIds(db, employeeId);
    const idPlaceholders = possibleIds.length > 0 ? possibleIds.map(() => '?').join(', ') : '?';
    const idParams = possibleIds.length > 0 ? possibleIds : [employeeId];

    // Determine target local date (YYYY-MM-DD)
    const clientDateStr = req.query.date && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date) ? req.query.date : null;
    const now = new Date();
    const serverYear = now.getFullYear();
    const serverMonth = now.getMonth() + 1;
    const serverDay = String(now.getDate()).padStart(2, '0');
    const localTodayStr = clientDateStr || `${serverYear}-${String(serverMonth).padStart(2, '0')}-${serverDay}`;
    const [targetYear, targetMonth, targetDay] = localTodayStr.split('-').map(Number);

    const [employeeRows] = await db.execute(
      `SELECT employee_id, employee_code, first_name, last_name, profile_photo 
       FROM employees 
       WHERE employee_id IN (${idPlaceholders}) OR employee_code IN (${idPlaceholders}) 
       LIMIT 1`,
      [...idParams, ...idParams]
    );
    const employee = employeeRows[0] || null;

    const [tasksRows] = await db.execute(
      `SELECT t.uuid, t.task_name, t.status, t.due_date, t.assignment_date, t.created_at, p.project_name
       FROM tasks t
       LEFT JOIN projects p ON p.id = t.project_id
       WHERE t.assigned_to IN (${idPlaceholders}) AND t.deleted = 0
       ORDER BY t.created_at DESC LIMIT 20`,
      idParams
    );

    const [leaveRows] = await db.execute(
      `SELECT leave_type, from_date, to_date, status, no_of_days
       FROM employee_leaves
       WHERE employee_id IN (${idPlaceholders})
       ORDER BY created_at DESC LIMIT 10`,
      idParams
    );

    const [leaveSettingsRows] = await db.execute(
      'SELECT leave_type, max_days, is_active FROM employee_leave_settings ORDER BY leave_type ASC'
    );

    const [meetingRows] = await db.execute(
      `SELECT id, title, startDate, startTime, eventType
       FROM events
       WHERE startDate >= ?
       ORDER BY startDate ASC, startTime ASC LIMIT 10`,
      [localTodayStr]
    );

    const projectConditions = idParams.map(() => 'pa.employee_ids LIKE ?').join(' OR ');
    const projectParams = idParams.map(id => `%"employee_id":"${id}"%`);
    const [projectRows] = await db.execute(
      `SELECT p.uuid,
              p.project_name,
              p.project_end_date AS end_date,
              p.current_status,
              p.overall_progress AS completion_percentage
       FROM project_assignments pa
       JOIN projects p ON p.id = pa.project_id
       WHERE ${projectConditions || '1=0'}
       ORDER BY p.created_at DESC LIMIT 10`,
      projectParams
    );

    const [attendanceRows] = await db.execute(
      `SELECT DATE_FORMAT(attendance_date, '%Y-%m-%d') AS attendance_date,
              attendance_status, check_in_time, check_out_time, working_hours
       FROM attendance
       WHERE employee_id IN (${idPlaceholders})
         AND (
           (month = ? AND year = ?)
           OR (MONTH(attendance_date) = ? AND YEAR(attendance_date) = ?)
         )
       ORDER BY attendance_date DESC, id DESC`,
      [...idParams, targetMonth, targetYear, targetMonth, targetYear]
    );

    // Directly query today's attendance record strictly for localTodayStr
    const [todayAttendanceRows] = await db.execute(
      `SELECT DATE_FORMAT(attendance_date, '%Y-%m-%d') AS attendance_date,
              attendance_status, check_in_time, check_out_time, break_start_time, break_end_time, working_hours
       FROM attendance
       WHERE employee_id IN (${idPlaceholders})
         AND (attendance_date = ? OR DATE(attendance_date) = ?)
       ORDER BY id DESC LIMIT 1`,
      [...idParams, localTodayStr, localTodayStr]
    );

    const [salaryRows] = await db.execute(
      `SELECT total_salary, salary_month, salary_year
       FROM employee_salaries
       WHERE employee_id IN (${idPlaceholders})
       ORDER BY salary_year DESC, salary_month DESC LIMIT 5`,
      idParams
    );

    const formatLocalDate = (value) => {
      if (!value) return null;
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.length >= 10 && trimmed[4] === '-' && trimmed[7] === '-') {
          return trimmed.slice(0, 10);
        }
      }
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return typeof value === 'string' ? value.slice(0, 10) : null;
      try {
        const iso = date.toISOString().slice(0, 10);
        if (iso === localTodayStr) return iso;
      } catch {}
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    const normalizeRecordDate = (record) => {
      if (!record) return null;
      const value = record.attendance_date;
      if (!value) return null;
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.length >= 10 && trimmed[4] === '-' && trimmed[7] === '-') {
          return trimmed.slice(0, 10);
        }
      }
      return formatLocalDate(value);
    };

    const normalizeDateValue = (value) => {
      if (!value) return null;
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (trimmed.length >= 10 && trimmed[4] === '-' && trimmed[7] === '-') {
          return trimmed.slice(0, 10);
        }
      }
      return formatLocalDate(value);
    };

    const todayTasks = tasksRows.filter((task) => {
      const taskDate = task.assignment_date || task.created_at;
      const dateStr = formatLocalDate(taskDate);
      return dateStr === localTodayStr;
    }).slice(0, 5);

    const pendingLeaves = leaveRows.filter((leave) => leave.status === 'Pending').length;
    const approvedLeaves = leaveRows.filter((leave) => leave.status === 'Approved');
    const leaveBalance = leaveSettingsRows.reduce((total, setting) => {
      const maxDays = Number(setting.max_days || 0);
      const taken = approvedLeaves
        .filter((leave) => String(leave.leave_type || '').toLowerCase() === String(setting.leave_type || '').toLowerCase())
        .reduce((sum, leave) => sum + Number(leave.no_of_days || 0), 0);
      return total + Math.max(maxDays - taken, 0);
    }, 0);

    const workingDaysSoFar = Array.from({ length: targetDay }, (_, index) => new Date(targetYear, targetMonth - 1, index + 1)).filter((date) => date.getDay() !== 0 && date.getDay() !== 6).length;
    const presentDays = attendanceRows.filter((record) => ['Present', 'Half Day', 'Late'].includes(record.attendance_status)).length;

    // Strict today's attendance record only - strictly matching localTodayStr
    let todayAttendanceRecord = null;
    if (todayAttendanceRows && todayAttendanceRows.length > 0) {
      const rec = todayAttendanceRows[0];
      const recDate = normalizeRecordDate(rec);
      if (recDate === localTodayStr) {
        todayAttendanceRecord = rec;
      }
    }
    if (!todayAttendanceRecord) {
      todayAttendanceRecord = attendanceRows.find((record) => {
        const recDate = normalizeRecordDate(record);
        return recDate === localTodayStr;
      }) || null;
    }

    const hoursThisWeek = attendanceRows.reduce((sum, record) => {
      const parsedHours = String(record.working_hours || '').match(/(\d+)h/);
      return sum + (parsedHours ? Number(parsedHours[1]) : 0);
    }, 0);

    const latestSalary = salaryRows[0] || null;
    const nextPayDate = new Date(targetYear, targetMonth, 0).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

    return res.json({
      success: true,
      employee,
      tasks: {
        assigned: tasksRows.length,
        completed: tasksRows.filter((task) => ['Completed', 'Done'].includes(task.status)).length,
        overdue: tasksRows.filter((task) => task.due_date && new Date(task.due_date) < now && !['Completed', 'Done'].includes(task.status)).length,
        today: todayTasks,
      },
      leaves: {
        recent: leaveRows.slice(0, 4),
        pendingCount: pendingLeaves,
      },
      meetings: {
        todayCount: meetingRows.filter((meeting) => normalizeDateValue(meeting.startDate) === localTodayStr).length,
        upcoming: meetingRows.slice(0, 3),
      },
      projects: {
        activeCount: projectRows.length,
        activeList: projectRows.slice(0, 3).map((project) => ({
          name: project.project_name || 'Project',
          progress: Number(project.completion_percentage || 0),
          due: project.end_date ? new Date(project.end_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : '—',
        })),
      },
      attendance: {
        checkIn: todayAttendanceRecord?.check_in_time || null,
        checkOut: todayAttendanceRecord?.check_out_time || null,
        presentDays,
        absentDays: Math.max(0, workingDaysSoFar - presentDays),
        hoursThisWeek,
      },
      payroll: {
        nextPayDate,
        nextSalary: latestSalary ? `₹${Number(latestSalary.total_salary || 0).toLocaleString('en-IN')}` : 'N/A',
      },
      leaveBalance,
    });
  } catch (err) {
    console.error('getEmployeeDashboardData error:', err);
    return res.status(500).json({ success: false, message: 'Failed to load employee dashboard data' });
  }
}

module.exports = { getDashboardMetrics, getEmployeeDashboardData };
