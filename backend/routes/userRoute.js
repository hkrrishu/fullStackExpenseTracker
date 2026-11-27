const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');

router.post('/signup', userController.signup);
router.post('/login', userController.login);
router.post('/password/forgotpassword', userController.forgotPassword);
router.get('/password/resetpassword/:id', userController.resetPasswordPage);
router.post('/password/updatepassword', userController.updatePassword);

module.exports = router;