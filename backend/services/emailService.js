
let brevoClient;

const sendEmail = async (toEmail) => {
  try {
    if (!brevoClient) {
      const { BrevoClient } = await import("@getbrevo/brevo");

      brevoClient = new BrevoClient({
        apiKey: process.env.BREVO_API_KEY,
      });
    }

    const response = await brevoClient.transactionalEmails.sendTransacEmail({
      subject: "Password Reset Request",
      textContent: "This is a test email from Expense Tracker. You requested a password reset.",
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
