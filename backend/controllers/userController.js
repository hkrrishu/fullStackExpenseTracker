const User = require("../models/userTable");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../services/emailService");

const signup = async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({ where: { email: email } });

    if (user) {
      return res.status(403).json({ message: "User already exists" });
    }

    const saltRounds = 10;

    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        return res.status(500).json({ message: "Something went wrong" });
      }

      await User.create({
        name: name,
        email: email,
        password: hash,
      });

      res.status(201).json({ message: "User created successfully" });
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

const login = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    bcrypt.compare(password, user.password, (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Something went wrong" });
      }

      if (result) {
        return res.status(200).json({
          message: "User login successful",
          token: generateAccessToken(user.id, user.ispremiumuser),
        });
      } else {
        return res.status(401).json({ message: "User not authorized" });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Something went wrong" });
  }
};

const generateAccessToken = (id, ispremiumuser) => {
  return jwt.sign({ userId: id, ispremiumuser: ispremiumuser }, "secretkey");
};

const { v4: uuidv4 } = require("uuid");
const ForgotPasswordRequest = require("../models/forgotPasswordRequest");

const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email;

    const user = await User.findOne({
      where: { email: email },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const id = uuidv4();

    await ForgotPasswordRequest.create({
      id: id,
      userId: user.id,
    });

    const resetLink = `http://localhost:3000/user/password/resetpassword/${id}`;

    await sendEmail(email, resetLink);

    res.status(200).json({
      message: "Password reset link sent successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Failed to send reset link",
    });
  }
};

const resetPasswordPage = async (req, res) => {
  try {
    const id = req.params.id;

    const request = await ForgotPasswordRequest.findOne({
      where: {
        id: id,
        isactive: true,
      },
    });

    if (!request) {
      return res.send("<h2>❌ Invalid or expired password reset link</h2>");
    }

    res.send(`
            <form id="resetForm">
    <input
        type="password"
        id="password"
        placeholder="Enter new password"
        required
    >

    <button type="submit">Update Password 🚀</button>
</form>

<p id="message"></p>

<script>
    const form = document.getElementById("resetForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const password = document.getElementById("password").value;

        const id = window.location.pathname.split("/").pop();

        try {
            const response = await fetch("/user/password/updatepassword", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: id,
                    password: password
                })
            });

            const data = await response.json();

            document.getElementById("message").innerText = data.message;

        } catch (err) {
            document.getElementById("message").innerText =
                "Something went wrong";
        }
    });
</script>`);
  } catch (err) {
    console.log(err);
    res.status(500).send("Something went wrong");
  }
};

const updatePassword = async (req, res) => {
  try {
    const id = req.body.id;
    const newPassword = req.body.password;

    const request = await ForgotPasswordRequest.findOne({
      where: {
        id: id,
        isactive: true,
      },
    });

    if (!request) {
      return res.status(400).json({
        message: "Invalid or expired link",
      });
    }

    const user = await User.findByPk(request.userId);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await user.update({
      password: hashedPassword,
    });

    await request.update({
      isactive: false,
    });

    res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

module.exports = {
  signup,
  login,
  generateAccessToken,
  forgotPassword,
  resetPasswordPage,
  updatePassword,
};
