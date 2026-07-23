const { body, param, query, validationResult } = require("express-validator");

const roles = ["Super Admin", "Admin", "Manager", "Staff", "Employee", "Customer"];
const statuses = ["Active", "Inactive"];

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Validation failed", errors: errors.array() });
  }
  next();
};

const userFields = [
  body("username").trim().isLength({ min: 2, max: 100 }).withMessage("Username must be 2-100 characters"),
  body("email").trim().isEmail().normalizeEmail().withMessage("A valid email is required"),
  body("mobile").trim().matches(/^[0-9+ -]{7,20}$/).withMessage("A valid mobile number is required"),
];

const createUserRules = [
  ...userFields,
  body("password").isLength({ min: 8, max: 255 }).withMessage("Password must be 8-255 characters"),
  body("role").optional().isIn(roles).withMessage("Invalid role"),
  body("status").optional().isIn(statuses).withMessage("Invalid status"),
];

const updateUserRules = [
  param("userId").isUUID().withMessage("Invalid user_id"),
  body("username").optional().trim().isLength({ min: 2, max: 100 }).withMessage("Username must be 2-100 characters"),
  body("email").optional().trim().isEmail().normalizeEmail().withMessage("A valid email is required"),
  body("mobile").optional().trim().matches(/^[0-9+ -]{7,20}$/).withMessage("A valid mobile number is required"),
  body("password").optional().isLength({ min: 8, max: 255 }).withMessage("Password must be 8-255 characters"),
  body("role").optional().isIn(roles).withMessage("Invalid role"),
  body("status").optional().isIn(statuses).withMessage("Invalid status"),
];

const loginRules = [
  body("identifier").trim().notEmpty().withMessage("Username or email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

const listRules = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("status").optional().isIn(statuses).withMessage("Invalid status"),
];

const userIdRule = [param("userId").isUUID().withMessage("Invalid user_id")];

module.exports = { validateRequest, createUserRules, updateUserRules, loginRules, listRules, userIdRule, roles };
