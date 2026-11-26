const { Cashfree, CFEnvironment } = require("cashfree-pg");
const Order = require("../models/orderTable");
const User = require("../models/userTable");

const cashfree = new Cashfree(
  CFEnvironment.SANDBOX,
  process.env.CASHFREE_CLIENT_ID,
  process.env.CASHFREE_CLIENT_SECRET,
);

const createOrder = async (user) => {
  const orderId = "ORDER_" + Date.now();

  // First, save the order in our MySQL database
  await Order.create({
    orderid: orderId,
    status: "PENDING",
    userId: user.id,
  });

  // Now, send the order details to Cashfree
  const request = {
    order_amount: 499,
    order_currency: "INR",
    order_id: orderId,
    customer_details: {
      customer_id: user.id.toString(),
      customer_phone: "9999999999",
      customer_email: user.email,
    },
  };

  const response = await cashfree.PGCreateOrder(request);

  return {
    paymentSessionId: response.data.payment_session_id,
    orderId: orderId,
  };
};

const verifyPayment = async (orderId, userId) => {
  // Ask Cashfree for the payment details
  const response = await cashfree.PGOrderFetchPayments(orderId);

  const payments = response.data;

  // Find a successful payment
  const successfulPayment = payments.find(
    (payment) => payment.payment_status === "SUCCESS",
  );

  // Find a failed payment
  const failedPayment = payments.find(
    (payment) =>
      payment.payment_status === "FAILED" ||
      payment.payment_status === "USER_DROPPED" ||
      payment.payment_status === "CANCELLED",
  );

  // Find the order in our database
  const order = await Order.findOne({
    where: {
      orderid: orderId,
      userId: userId,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  // If payment is successful
  if (successfulPayment) {
    order.status = "SUCCESSFUL";
    await order.save();

    const user = await User.findByPk(userId);

    user.ispremiumuser = true;
    await user.save();

    return "SUCCESSFUL";
  }

  // If payment failed
  if (failedPayment) {
    order.status = "FAILED";
    await order.save();

    return "FAILED";
  }

  // Payment is still pending
  return "PENDING";
};

module.exports = {
  createOrder,
  verifyPayment,
};
