const { initDB } = require("./src/config/db");

async function run() {
  await initDB();
  console.log("DB Reinitialized");
  process.exit(0);
}
run();
