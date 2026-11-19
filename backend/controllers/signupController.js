const User = require('../models/userTable');

exports.signup = async (req, res) => {
    try {
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        const user = await User.findOne({ where: { email: email } });

        if (user) {
            return res.status(403).json({ message: 'User already exists' });
        }

        await User.create({
            name: name,
            email: email,
            password: password
        });

        res.status(201).json({ message: 'User created successfully' });

    } catch (err) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};