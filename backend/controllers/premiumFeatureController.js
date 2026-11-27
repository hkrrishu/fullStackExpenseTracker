const User = require("../models/userTable");

const getUserLeaderBoard = async (req, res) => {
  try {
    if (!req.user.ispremiumuser) {
      return res.status(403).json({
        message: "Only premium users can access the leaderboard",
      });
    }

    const leaderboard = await User.findAll({
      attributes: ["id", "name", ["totalExpenses", "total_cost"]],
      order: [["totalExpenses", "DESC"]],
    });

    res.status(200).json(leaderboard);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Unable to fetch leaderboard",
    });
  }
};

module.exports = { getUserLeaderBoard };
