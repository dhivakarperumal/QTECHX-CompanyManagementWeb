const { getDB } = require('../config/db');

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

    const [traineeTypeRows] = await db.execute("SELECT type, COUNT(*) as count FROM trainee_intern GROUP BY type");
    
    const [projectStatusRows] = await db.execute("SELECT current_status, COUNT(*) as count FROM projects GROUP BY current_status");

    const [upcomingEventRows] = await db.execute("SELECT title, startDate, startTime, eventType FROM events WHERE startDate >= CURDATE() ORDER BY startDate ASC, startTime ASC LIMIT 4");

    return res.json({
      totalEmployees,
      activeProjects,
      tasksInProgress,
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
      upcomingEvents: upcomingEventRows
    });
  } catch (err) {
    console.error('getDashboardMetrics error:', err);
    return res.status(500).json({ error: 'Failed to load dashboard metrics' });
  }
}

module.exports = { getDashboardMetrics };
