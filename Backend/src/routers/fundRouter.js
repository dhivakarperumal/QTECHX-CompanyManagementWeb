const express = require("express");
const { getFund, updateFund } = require("../controllers/fundController");

const router = express.Router();

router.get("/", getFund);
router.post("/", updateFund);

module.exports = router;
