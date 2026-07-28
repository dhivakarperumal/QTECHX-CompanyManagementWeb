const express = require("express");
const { createExpense, getExpenses } = require("../controllers/expenseController");
const { upload } = require("../config/multerConfig");

const router = express.Router();

router.get("/", getExpenses);
router.post("/", upload.single("upload_bill"), createExpense);

module.exports = router;
