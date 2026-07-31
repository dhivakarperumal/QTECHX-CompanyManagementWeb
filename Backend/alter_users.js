const mysql = require('mysql2/promise');
async function run() {
  const conn = await mysql.createConnection({host:'localhost', user:'root', password:'', database:'qtechx_db'});
  await conn.execute("ALTER TABLE users MODIFY COLUMN role ENUM('Super Admin','Admin','Manager','Staff','Employee','Customer','User','Trainee','Intern') NOT NULL DEFAULT 'Customer'");
  console.log('Updated users role enum');
  await conn.end();
}
run().catch(console.error);
