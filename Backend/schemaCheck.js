const mysql = require('mysql2/promise');
const dbConfig = { host:'localhost', user:'root', password:'', database:'qtechx_db', port:3306 };
(async ()=>{ try { const conn = await mysql.createConnection(dbConfig); const [rows] = await conn.execute('SHOW CREATE TABLE quotations'); console.log(rows[0]['Create Table']); await conn.end(); } catch (e) { console.error(e.message); process.exit(1); } })();
