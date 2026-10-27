const express = require("express");
const router = express.Router();
const incomeController = require("../controllers/incomeController");
const { authenticate, authorize } = require("../security/authMiddleware");
const financeAdmins = [authenticate, authorize("Super Admin", "Admin")];

router.get("/next-invoice", ...financeAdmins, incomeController.getNextInvoiceNumber);
router.post("/", ...financeAdmins, incomeController.createIncome);
router.get("/", ...financeAdmins, incomeController.getIncomes);
router.put("/:id", ...financeAdmins, incomeController.updateIncome);
router.delete("/:id", ...financeAdmins, incomeController.deleteIncome);

module.exports = router;
