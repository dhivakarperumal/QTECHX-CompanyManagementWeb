const express = require("express");
const router = express.Router();
const incomeController = require("../controllers/incomeController");

router.get("/next-invoice", incomeController.getNextInvoiceNumber);
router.post("/", incomeController.createIncome);
router.get("/", incomeController.getIncomes);
router.put("/:id", incomeController.updateIncome);
router.delete("/:id", incomeController.deleteIncome);

module.exports = router;
