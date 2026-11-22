const User = require("../models/userTable");
const bcrypt = require("bcrypt");

exports.signup = async (req, res) => {
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
