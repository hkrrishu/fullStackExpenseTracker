const Expense = require("../models/expenseTable");

const addExpense = (req, res) => {
  const expenseamount = req.body.expenseamount;
  const description = req.body.description;
  const category = req.body.category;

  Expense.create({
    expenseamount: expenseamount,
    description: description,
    category: category,
  })
    .then((expense) => {
      res.status(201).json({ expense, success: true });
    })
    .catch((err) => {
      res.status(500).json({ success: false, error: err });
    });
};

const getExpenses = (req, res) => {
  Expense.findAll()
    .then((expenses) => {
      res.status(200).json({ expenses, success: true });
    })
    .catch((err) => {
      res.status(500).json({ error: err, success: false });
    });
};

const deleteExpense = (req, res) => {
  const id = req.params.id;

  Expense.destroy({ where: { id: id } })
    .then(() => {
      res
        .status(200)
        .json({ success: true, message: "Expense deleted successfully" });
    })
    .catch((err) => {
      res.status(500).json({ success: false, error: err });
    });
};

module.exports = {
  addExpense,
  getExpenses,
  deleteExpense,
};
