const User = require("../models/userTable");
const Expense = require("../models/expenseTable");
const sequelize = require("../util/database");

const getUserLeaderBoard = async (req, res) => {
  try {
    if (!req.user.ispremiumuser) {
      return res.status(403).json({
        message: "Only premium users can access the leaderboard",
      });
    }
    const leaderboard = await User.findAll({
      attributes: [
        "id",
        "name",
        [
          sequelize.fn("SUM", sequelize.col("expenses.expenseamount")),
          "total_cost",
        ],
      ],
      include: [
        {
          model: Expense,
          attributes: [],
        },
      ],
      group: ["user.id"],
      order: [[sequelize.literal("total_cost"), "DESC"]],
    });

    res.status(200).json(leaderboard);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Unable to fetch leaderboard" });
  }
};

module.exports = { getUserLeaderBoard };
