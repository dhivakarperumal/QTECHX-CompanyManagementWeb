const { getDB } = require('../config/db');

async function listDepartments(req, res) {
  try {
    const db = getDB();
    const [rows] = await db.execute('SELECT DISTINCT COALESCE(designation, "") AS name FROM employees WHERE COALESCE(designation,"") <> "" ORDER BY name');
    const depts = (rows || []).map(r => r.name).filter(Boolean);
    const fallback = ['HR','Finance','Sales','Marketing','Development','Operations','Admin'];
    const departments = depts.length ? depts : fallback;
    return res.json({ departments });
  } catch (err) {
    console.error('Departments list error:', err);
    return res.status(500).json({ message: 'Failed to load departments', departments: ['HR','Finance','Sales','Marketing','Development','Operations','Admin'] });
  }
}

module.exports = { listDepartments };
