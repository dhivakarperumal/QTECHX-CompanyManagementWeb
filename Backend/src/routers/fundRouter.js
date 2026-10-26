const express = require("express");
const { getFund, updateFund } = require("../controllers/fundController");
const { authenticate, authorize } = require("../security/authMiddleware");

const router = express.Router();
const financeAdmins = [authenticate, authorize("Super Admin", "Admin")];

router.get("/", ...financeAdmins, getFund);
router.post("/", ...financeAdmins, updateFund);

module.exports = router;
