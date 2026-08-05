const { getDB } = require('../config/db');

function getAuthenticatedEmployeeId(req) {
  return req.user?.employee_id || req.user?.employeeId || req.user?.user_id || req.user?.id || req.user?.uuid || null;
}

async function getDashboardMetrics(req, res) {
  try {
    const db = getDB();

    const [empRows] = await db.execute("SELECT COUNT(*) AS total FROM employees");
    const totalEmployees = empRows[0]?.total || 0;

    const [projRows] = await db.execute(
      "SELECT COUNT(*) AS total FROM projects WHERE current_status IN ('In Progress','Planning','Testing','Live')"
    );
    const activeProjects = projRows[0]?.total || 0;

    const [taskRows] = await db.execute(
      "SELECT COUNT(*) AS total FROM tasks WHERE status = 'In Progress' AND active = 1"
    );
    const tasksInProgress = taskRows[0]?.total || 0;

    // Attendance today
    const [presentRows] = await db.execute(
      "SELECT COUNT(*) AS present FROM attendance WHERE attendance_date = CURDATE() AND attendance_status = 'Present'"
    );
    const presentToday = presentRows[0]?.present || 0;

    const [traineeRows] = await db.execute(
      "SELECT COUNT(*) AS total FROM trainee_intern WHERE status = 'Active'"
    );
    const activeTrainees = traineeRows[0]?.total || 0;

    const [internRows] = await db.execute(
      "SELECT COUNT(*) AS total FROM trainee_intern WHERE type = 'Intern'"
    );
    const internshipStudents = internRows[0]?.total || 0;

    // Monthly payroll (current month/year)
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const [payRows] = await db.execute(
      "SELECT IFNULL(SUM(total_salary),0) AS total FROM employee_salaries WHERE salary_month = ? AND salary_year = ?",
      [month, year]
    );
    const monthlyPayroll = payRows[0]?.total || 0;

    const pendingLeaveRequests = Math.max(0, totalEmployees - presentToday);

    // Recent Activity (Union of last 5 activities)
    const [recentRows] = await db.execute(`
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

    // Graph Data (Last 6 Months)
    const [overviewRows] = await db.execute(`
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
        SELECT DATE_FORMAT(date_of_payment, '%Y-%m-01') as dt, SUM(amount) as inc_amount FROM incomes GROUP BY dt
      ) i ON i.dt = m.m_date
      ORDER BY m.m_date ASC
    `);

    // Current Month Income
    const [currentIncRows] = await db.execute(
      "SELECT IFNULL(SUM(amount), 0) AS total FROM incomes WHERE MONTH(date_of_payment) = ? AND YEAR(date_of_payment) = ?",
      [month, year]
    );
    const currentMonthIncome = currentIncRows[0]?.total || 0;

    // New Stats for UI update
    const [clientRows] = await db.execute("SELECT client_status, COUNT(*) as count FROM clients GROUP BY client_status");
    const [totalClientRows] = await db.execute("SELECT COUNT(*) as total FROM clients");
    const totalClients = totalClientRows[0]?.total || 0;
    
    const [pendingFollowUpRows] = await db.execute("SELECT COUNT(*) as total FROM clients WHERE follow_up_status = 'Pending'");
    const pendingFollowUps = pendingFollowUpRows[0]?.total || 0;

    const [clientFollowUpRows] = await db.execute("SELECT follow_up_status, COUNT(*) as count FROM clients GROUP BY follow_up_status");

    const [traineeTypeRows] = await db.execute("SELECT type, COUNT(*) as count FROM trainee_intern GROUP BY type");
    
    const [projectStatusRows] = await db.execute("SELECT current_status, COUNT(*) as count FROM projects GROUP BY current_status");

    const [totalTaskRows] = await db.execute("SELECT COUNT(*) as total FROM tasks WHERE deleted = 0");
    const totalTasks = totalTaskRows[0]?.total || 0;

    const [taskStatusRows] = await db.execute("SELECT status, COUNT(*) as count FROM tasks WHERE deleted = 0 GROUP BY status");

    const [upcomingEventRows] = await db.execute("SELECT title, startDate, startTime, eventType FROM events WHERE startDate >= CURDATE() ORDER BY startDate ASC, startTime ASC LIMIT 4");

    return res.json({
      totalEmployees,
      activeProjects,
      tasksInProgress,
      totalTasks,
      pendingLeaveRequests,
      activeTrainees,
      internshipStudents,
      monthlyPayroll,
      attendanceToday: { present: presentToday, total: totalEmployees },
      recentActivity: recentRows,
      overviewData: overviewRows,
      currentMonthIncome,
      clientStats: { total: totalClients, breakdown: clientRows },
      traineeStats: traineeTypeRows,
      projectStats: projectStatusRows,
      taskStats: taskStatusRows,
      clientFollowUps: clientFollowUpRows,
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

    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const todayStr = today.toISOString().slice(0, 10);

    const [employeeRows] = await db.execute(
      'SELECT employee_id, employee_code, first_name, last_name, profile_photo FROM employees WHERE employee_id = ? LIMIT 1',
      [employeeId]
    );
    const employee = employeeRows[0] || null;

    const [tasksRows] = await db.execute(
      `SELECT t.uuid, t.task_name, t.status, t.due_date, t.assignment_date, t.created_at, p.project_name
       FROM tasks t
       LEFT JOIN projects p ON p.id = t.project_id
       WHERE t.assigned_to = ? AND t.deleted = 0
       ORDER BY t.created_at DESC LIMIT 20`,
      [employeeId]
    );

    const [leaveRows] = await db.execute(
      `SELECT leave_type, from_date, to_date, status, no_of_days
       FROM employee_leaves
       WHERE employee_id = ?
       ORDER BY created_at DESC LIMIT 10`,
      [employeeId]
    );

    const [leaveSettingsRows] = await db.execute(
      'SELECT leave_type, max_days, is_active FROM employee_leave_settings ORDER BY leave_type ASC'
    );

    const [meetingRows] = await db.execute(
      `SELECT id, title, startDate, startTime, eventType
       FROM events
       WHERE startDate >= ?
       ORDER BY startDate ASC, startTime ASC LIMIT 10`,
      [todayStr]
    );

    const [projectRows] = await db.execute(
      `SELECT p.uuid,
              p.project_name,
              p.project_end_date AS end_date,
              p.current_status,
              p.overall_progress AS completion_percentage
       FROM project_assignments pa
       JOIN projects p ON p.id = pa.project_id
       WHERE pa.employee_ids LIKE ?
       ORDER BY p.created_at DESC LIMIT 10`,
      [`%"employee_id":"${employeeId}"%`]
    );

    const [attendanceRows] = await db.execute(
      `SELECT attendance_date, attendance_status, check_in_time, check_out_time, working_hours
       FROM attendance
       WHERE employee_id = ? AND month = ? AND year = ?
       ORDER BY attendance_date DESC`,
      [employeeId, month, year]
    );

    const [salaryRows] = await db.execute(
      `SELECT total_salary, salary_month, salary_year
       FROM employee_salaries
       WHERE employee_id = ?
       ORDER BY salary_year DESC, salary_month DESC LIMIT 5`,
      [employeeId]
    );

    const todayTasks = tasksRows.filter((task) => {
      const taskDate = task.assignment_date || task.created_at;
      return taskDate && taskDate.slice(0, 10) === todayStr;
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

    const workingDaysSoFar = Array.from({ length: today.getDate() }, (_, index) => new Date(year, month - 1, index + 1)).filter((date) => date.getDay() !== 0 && date.getDay() !== 6).length;
    const presentDays = attendanceRows.filter((record) => ['Present', 'Half Day', 'Late'].includes(record.attendance_status)).length;

    const formatLocalDate = (value) => {
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return null;
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const normalizeRecordDate = (record) => {
      const value = record.attendance_date;
      if (!value) return null;
      if (typeof value === 'string') return value.slice(0, 10);
      return formatLocalDate(value);
    };

    const normalizeDateValue = (value) => {
      if (!value) return null;
      if (typeof value === 'string') return value.slice(0, 10);
      return formatLocalDate(value);
    };

    const attendanceRecord = attendanceRows.find((record) => normalizeRecordDate(record) === todayStr) || attendanceRows[0] || null;
    const hoursThisWeek = attendanceRows.reduce((sum, record) => {
      const parsedHours = String(record.working_hours || '').match(/(\d+)h/);
      return sum + (parsedHours ? Number(parsedHours[1]) : 0);
    }, 0);

    const latestSalary = salaryRows[0] || null;
    const nextPayDate = latestSalary ? new Date(year, month, 0).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : new Date(year, month, 0).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

    return res.json({
      success: true,
      employee,
      tasks: {
        assigned: tasksRows.length,
        completed: tasksRows.filter((task) => ['Completed', 'Done'].includes(task.status)).length,
        overdue: tasksRows.filter((task) => task.due_date && new Date(task.due_date) < today && !['Completed', 'Done'].includes(task.status)).length,
        today: todayTasks,
      },
      leaves: {
        recent: leaveRows.slice(0, 4),
        pendingCount: pendingLeaves,
      },
      meetings: {
        todayCount: meetingRows.filter((meeting) => normalizeDateValue(meeting.startDate) === todayStr).length,
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
        checkIn: attendanceRecord?.check_in_time || null,
        checkOut: attendanceRecord?.check_out_time || null,
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
