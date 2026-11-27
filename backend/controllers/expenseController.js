const Expense = require("../models/expenseTable");
const User = require("../models/userTable");
const sequelize = require("../util/database");

const addExpense = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const expenseamount = Number(req.body.expenseamount);
    const description = req.body.description;
    const category = req.body.category;

    const expense = await Expense.create(
      {
        expenseamount: expenseamount,
        description: description,
        category: category,
        userId: req.user.id,
      },
      { transaction },
    );

    await User.increment("totalExpenses", {
      by: expenseamount,
      where: {
        id: req.user.id,
      },
      transaction,
    });

    await transaction.commit();

    res.status(201).json({ expense, success: true });
  } catch (err) {
    await transaction.rollback();
    console.log(err);
    res.status(500).json({ success: false, error: err });
  }
};

const getExpenses = (req, res) => {
  Expense.findAll({
    where: {
      userId: req.user.id,
    },
  })
    .then((expenses) => {
      res.status(200).json({ expenses, success: true });
    })
    .catch((err) => {
      res.status(500).json({ error: err, success: false });
    });
};

const deleteExpense = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const id = req.params.id;

    const expense = await Expense.findOne({
      where: {
        id: id,
        userId: req.user.id,
      },
      transaction,
    });

    if (!expense) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    await expense.destroy({ transaction });

    await User.decrement("totalExpenses", {
      by: expense.expenseamount,
      where: {
        id: req.user.id,
      },
      transaction,
    });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (err) {
    await transaction.rollback();
    console.log(err);
    res.status(500).json({ success: false, error: err });
  }
};

module.exports = {
  addExpense,
  getExpenses,
  deleteExpense,
};
