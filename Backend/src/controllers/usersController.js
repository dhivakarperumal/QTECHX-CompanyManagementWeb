const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const {
  createUser,
  findByUserId,
  findForLogin,
  listUsers,
  updateUser,
  softDeleteUser,
} = require("../models/userModel");

const publicUser = (user) => {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
};

const duplicateMessage = (error) => {
  if (error.code !== "ER_DUP_ENTRY") return null;
  if (error.message.includes("email")) return "Email is already registered";
  if (error.message.includes("mobile")) return "Mobile number is already registered";
  if (error.message.includes("user_id")) return "User ID already exists";
  if (error.message.includes("username")) return "Username is already registered";
  return "User already exists";
};

async function create(req, res) {
  try {
    const password = await bcrypt.hash(req.body.password, 12);
    const actor = req.user?.user_id || "SYSTEM";
    const user = await createUser({
      user_id: uuidv4(),
      username: req.body.username,
      email: req.body.email,
      mobile: req.body.mobile,
      password,
      role: req.body.role,
      status: req.body.status,
      created_by: actor,
      updated_by: actor,
    });
    return res.status(201).json({ message: "User created successfully", user: publicUser(user) });
  } catch (error) {
    const message = duplicateMessage(error);
    return res.status(message ? 409 : 500).json({ message: message || "Failed to create user" });
  }
}

async function getAll(req, res) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const result = await listUsers({
      page,
      limit,
      search: req.query.search?.trim(),
      status: req.query.status,
      role: req.query.role,
    });
    return res.json({
      data: result.rows.map(publicUser),
      pagination: { page, limit, total: result.total, pages: Math.ceil(result.total / limit) },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve users" });
  }
}

async function getOne(req, res) {
  try {
    const user = await findByUserId(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Failed to retrieve user" });
  }
}

async function update(req, res) {
  try {
    const existing = await findByUserId(req.params.userId);
    if (!existing) return res.status(404).json({ message: "User not found" });

    const updates = {};
    ["username", "email", "mobile", "role", "status"].forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    if (req.body.password !== undefined) updates.password = await bcrypt.hash(req.body.password, 12);
    updates.updated_by = req.user.user_id;

    const user = await updateUser(req.params.userId, updates);
    return res.json({ message: "User updated successfully", user: publicUser(user) });
  } catch (error) {
    const message = duplicateMessage(error);
    return res.status(message ? 409 : 500).json({ message: message || "Failed to update user" });
  }
}

async function remove(req, res) {
  try {
    const existing = await findByUserId(req.params.userId);
    if (!existing) return res.status(404).json({ message: "User not found" });
    if (existing.user_id === req.user.user_id) return res.status(400).json({ message: "You cannot deactivate your own account" });
    const user = await softDeleteUser(req.params.userId, req.user.user_id);
    return res.json({ message: "User deactivated successfully", user: publicUser(user) });
  } catch (error) {
    return res.status(500).json({ message: "Failed to deactivate user" });
  }
}

async function login(req, res) {
  try {
    const user = await findForLogin(req.body.identifier);
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { user_id: user.user_id, username: user.username, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );
    return res.json({ message: "Login successful", token, user: publicUser(user) });
  } catch (error) {
    return res.status(500).json({ message: "Login failed" });
  }
}

async function addTrainee(req, res) {
  try {
    const password = await bcrypt.hash('defaultPass123', 12);
    const actor = req.user?.user_id || "SYSTEM";
    const user = await createUser({
      user_id: uuidv4(),
      username: "trainee",
      email: req.body.email || "trainee@gmail.com",
      mobile: req.body.mobile || "1234567898",
      password,
      role: "Trainee",
      status: "Active",
      created_by: actor,
      updated_by: actor,
    });
    return res.status(201).json({ message: "Trainee created", user: publicUser(user) });
  } catch (error) {
    const message = duplicateMessage(error);
    return res.status(message ? 409 : 500).json({ message: message || "Failed to create trainee" });
  }
}

module.exports = { create, getAll, getOne, update, remove, login, addTrainee };
