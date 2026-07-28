const express = require("express");
const { createExpense, getExpenses } = require("../controllers/expenseController");
const { upload } = require("../config/multerConfig");
const { authenticate } = require("../security/authMiddleware");

const router = express.Router();

router.get("/", authenticate, getExpenses);
router.post("/", authenticate, upload.single("upload_bill"), createExpense);

module.exports = router;
