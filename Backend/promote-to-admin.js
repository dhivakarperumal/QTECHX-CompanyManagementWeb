#!/usr/bin/env node

/**
 * Quick script to promote a user to admin role
 * Usage: node promote-to-admin.js <username_or_email>
 * Example: node promote-to-admin.js john_doe
 */

const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "qtechx_db",
  port: Number(process.env.DB_PORT || 3306),
};

async function promoteToAdmin(identifier) {
  try {
    const connection = await mysql.createConnection(dbConfig);

    // Find user
    const [users] = await connection.execute(
      "SELECT id, user_id, username, email, role FROM users WHERE username = ? OR email = ? LIMIT 1",
      [identifier, identifier]
    );

    if (users.length === 0) {
      console.error(`❌ User not found: ${identifier}`);
      await connection.end();
      process.exit(1);
    }

    const user = users[0];
    console.log(`✓ Found user: ${user.username} (${user.email})`);
    console.log(`  Current role: ${user.role}`);

    // Update role
    await connection.execute(
      "UPDATE users SET role = ? WHERE id = ? LIMIT 1",
      ["admin", user.id]
    );

    console.log(`✓ Role updated to: admin`);
    console.log(`✓ User can now access job applications!`);

    await connection.end();
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

const identifier = process.argv[2];
if (!identifier) {
  console.error("Usage: node promote-to-admin.js <username_or_email>");
  console.error("Example: node promote-to-admin.js john_doe");
  process.exit(1);
}

promoteToAdmin(identifier);
