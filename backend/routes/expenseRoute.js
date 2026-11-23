const express = require("express");
const router = express.Router();

const expenseController = require("../controllers/expenseController");

router.post("/addexpense", expenseController.addExpense);
router.get("/getexpenses", expenseController.getExpenses);
router.delete("/deleteexpense/:id", expenseController.deleteExpense);

module.exports = router;
