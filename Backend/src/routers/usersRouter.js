const express = require("express");
const controller = require("../controllers/usersController");
const { authenticate, authorize } = require("../security/authMiddleware");
const {
  validateRequest,
  createUserRules,
  updateUserRules,
  loginRules,
  listRules,
  userIdRule,
} = require("../security/validation");

const router = express.Router();
const userManagers = authorize("Super Admin", "Admin", "Manager");
const administrators = authorize("Super Admin", "Admin");

router.post("/login", loginRules, validateRequest, controller.login);
router.post("/", authenticate, userManagers, createUserRules, validateRequest, controller.create);
router.get("/", authenticate, userManagers, listRules, validateRequest, controller.getAll);
router.get("/:userId", authenticate, userManagers, userIdRule, validateRequest, controller.getOne);
router.put("/:userId", authenticate, administrators, updateUserRules, validateRequest, controller.update);
router.delete("/:userId", authenticate, administrators, userIdRule, validateRequest, controller.remove);

module.exports = router;
