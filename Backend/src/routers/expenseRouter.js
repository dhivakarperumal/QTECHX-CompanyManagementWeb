const express = require("express");
const { createExpense, getExpenses, updateExpense, deleteExpense } = require("../controllers/expenseController");
const { upload } = require("../config/multerConfig");
const { authenticate } = require("../security/authMiddleware");

const router = express.Router();

router.get("/", authenticate, getExpenses);
router.post("/", authenticate, upload.single("upload_bill"), createExpense);
router.put("/:id", authenticate, upload.single("upload_bill"), updateExpense);
router.delete("/:id", authenticate, deleteExpense);

module.exports = router;

