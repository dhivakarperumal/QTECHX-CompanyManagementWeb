const mysql = require('mysql2/promise');

(async () => {
  const pool = mysql.createPool({ host: 'localhost', user: 'root', password: '', database: 'qtechx_db', port: 3306 });
  try {
    const [tables] = await pool.query("SHOW TABLES LIKE 'project_assignments%'");
    console.log('TABLES');
    console.log(JSON.stringify(tables, null, 2));
    const [rows] = await pool.query('SHOW CREATE TABLE project_assignments');
    console.log('CREATE');
    console.log(JSON.stringify(rows, null, 2));
  } catch (err) {
    console.error('ERROR', err.message);
    console.error(err.sql);
  } finally {
    await pool.end();
  }
})();
