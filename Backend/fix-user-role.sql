-- Fix User Role for Job Applications Access
-- Run this SQL query in your MySQL database (qtechx_db)

-- Option 1: Update a specific user by username (replace 'your_username' with actual username)
UPDATE users SET role = 'admin' WHERE username = 'your_username' LIMIT 1;

-- Option 2: Update a specific user by email (replace 'your_email@example.com' with actual email)
-- UPDATE users SET role = 'admin' WHERE email = 'your_email@example.com' LIMIT 1;

-- Option 3: View all users to find the correct one
-- SELECT user_id, username, email, role FROM users;

-- Option 4: Make the first user an admin
-- UPDATE users SET role = 'admin' WHERE id = 1 LIMIT 1;
