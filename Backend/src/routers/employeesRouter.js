const express = require("express");
const controller = require("../controllers/employeesController");
const { authenticate, authorize } = require("../security/authMiddleware");

const router = express.Router();

// Only Admins, Managers and HR can manage employees
const hrManagers = authorize("Super Admin", "Admin", "Manager", "HR");
const administrators = authorize("Super Admin", "Admin");

router.post("/", authenticate, hrManagers, controller.create);
router.get("/", authenticate, hrManagers, controller.getAll);
router.get("/:employeeId", authenticate, hrManagers, controller.getOne);
router.put("/:employeeId", authenticate, administrators, controller.update);
router.delete("/:employeeId", authenticate, administrators, controller.remove);

module.exports = router;
