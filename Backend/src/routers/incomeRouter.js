const express = require("express");
const router = express.Router();
const incomeController = require("../controllers/incomeController");

router.post("/", incomeController.createIncome);
router.get("/", incomeController.getIncomes);

module.exports = router;
