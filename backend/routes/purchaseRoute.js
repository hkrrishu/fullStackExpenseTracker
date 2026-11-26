const express = require("express");
const router = express.Router();

const { authenticate: auth } = require("../middleware/auth");

const {
  buyPremium,
  updateTransactionStatus,
} = require("../controllers/purchaseController");

router.post("/buy-premium", auth, buyPremium);

router.post("/update-transaction-status", auth, updateTransactionStatus);

module.exports = router;
