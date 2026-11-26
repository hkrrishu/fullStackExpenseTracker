const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/auth");

const {
  getUserLeaderBoard,
} = require("../controllers/premiumFeatureController");

router.get("/showLeaderBoard", authenticate, getUserLeaderBoard);

module.exports = router;
