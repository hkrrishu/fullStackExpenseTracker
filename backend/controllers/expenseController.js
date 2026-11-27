const Expense = require("../models/expenseTable");
const User = require("../models/userTable");
const sequelize = require("../util/database");
const { suggestCategory } = require("../services/geminiService");

const addExpense = async (req, res) => {
  let transaction;

  try {
    transaction = await sequelize.transaction();

    const expenseamount = Number(req.body.expenseamount);
    const description = req.body.description;

    // Ask Gemini to suggest the category
    const category = await suggestCategory(description);

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
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }

    console.log(err);
    res.status(500).json({ success: false, error: err.message });
  }
};

const getExpenses = async (req, res) => {
  try {
    const requestedPage = Number(req.query.page);

    const page =
      Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

    // Available page sizes
    const allowedPageSizes = [10, 25, 50, 100];

    const requestedLimit = Number(req.query.limit);

    const limit = allowedPageSizes.includes(requestedLimit)
      ? requestedLimit
      : 10;

    const where = {
      userId: req.user.id,
    };

    // Count all expenses
    const count = await Expense.count({ where });

    const totalPages = Math.max(1, Math.ceil(count / limit));

    // Handle invalid page numbers
    const currentPage = Math.min(page, totalPages);

    const offset = (currentPage - 1) * limit;

    // Fetch expenses
    const expenses = await Expense.findAll({
      where,
      limit,
      offset,
      order: [["id", "DESC"]],
    });

    res.status(200).json({
      expenses,
      currentPage,
      totalPages,
      totalExpenses: count,
      limit,
      hasPreviousPage: currentPage > 1,
      hasNextPage: currentPage < totalPages,
      success: true,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      error: err.message,
      success: false,
    });
  }
};

const deleteExpense = async (req, res) => {
  let transaction;

  try {
    transaction = await sequelize.transaction();

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
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }

    console.log(err);

    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

module.exports = {
  addExpense,
  getExpenses,
  deleteExpense,
};
