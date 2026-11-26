const cashfreeService = require("../services/cashfreeService");
const { generateAccessToken } = require("./userController");

// Create a new payment order
const buyPremium = async (req, res) => {
  try {
    const response = await cashfreeService.createOrder(req.user);

    res.status(200).json({
      success: true,
      ...response,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Unable to create order",
    });
  }
};

// Verify payment status
const updateTransactionStatus = async (req, res) => {
  try {
    const orderId = req.body.orderId;

    const status = await cashfreeService.verifyPayment(orderId, req.user.id);

    res.status(200).json({
      success: true,
      paymentStatus: status,
      token:
        status === "SUCCESSFUL" ? generateAccessToken(req.user.id, true) : null,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Unable to verify payment",
    });
  }
};

module.exports = {
  buyPremium,
  updateTransactionStatus,
};
