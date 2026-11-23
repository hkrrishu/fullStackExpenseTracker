const User = require("../models/userTable");
const bcrypt = require("bcrypt");

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
        return res.status(200).json({ message: "User login successful" });
      } else {
        return res.status(401).json({ message: "User not authorized" });
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = {
  signup,
  login,
};
