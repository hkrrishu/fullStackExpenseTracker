const User = require('../models/userTable');

exports.login = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const user = await User.findOne({ where: { email: email } });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.password === password) {
            return res.status(200).json({ message: 'User login successful' });
        } else {
            return res.status(401).json({ message: 'User not authorized' });
        }

    } catch (err) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};