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

    // Total employees vs present => infer absent / pending leave
    const pendingLeaveRequests = Math.max(0, totalEmployees - presentToday);

    return res.json({
      totalEmployees,
      activeProjects,
      tasksInProgress,
      pendingLeaveRequests,
      activeTrainees,
      internshipStudents,
      monthlyPayroll,
      attendanceToday: { present: presentToday, total: totalEmployees },
    });
  } catch (err) {
    console.error('getDashboardMetrics error:', err);
    return res.status(500).json({ error: 'Failed to load dashboard metrics' });
  }
}

module.exports = { getDashboardMetrics };
