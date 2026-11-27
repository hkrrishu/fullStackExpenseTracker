let brevoClient;

const sendEmail = async (toEmail, resetLink) => {
  try {
    if (!brevoClient) {
      const { BrevoClient } = await import("@getbrevo/brevo");

      brevoClient = new BrevoClient({
        apiKey: process.env.BREVO_API_KEY,
      });
    }

    const response = await brevoClient.transactionalEmails.sendTransacEmail({
      subject: "Reset Your Expense Tracker Password",
      textContent: `Click this link to reset your password 🥳: ${resetLink}`,
      sender: {
        name: "Expense Tracker",
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [
        {
          email: toEmail,
        },
      ],
    });

    return response;
  } catch (err) {
    console.log("Email sending failed:", err);
    throw err;
  }
};

module.exports = sendEmail;
