const mysql = require('mysql2/promise');
const dbConfig = { host:'localhost', user:'root', password:'', database:'qtechx_db', port:3306 };
(async ()=>{ try { const conn = await mysql.createConnection(dbConfig); const [rows] = await conn.execute('SELECT user_id, username, email, role, status FROM users ORDER BY role, username LIMIT 50'); console.log(JSON.stringify(rows, null, 2)); await conn.end(); } catch (e) { console.error(e.message); process.exit(1); } })();
