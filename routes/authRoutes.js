const express = require('express');
const router = express.Router();
const { showSignup, showLogin, signup, login, logout } = require('../controllers/authController');

router.get('/signup', showSignup);
router.post('/signup', signup);
router.get('/login', showLogin);
router.post('/login', login);
router.get('/logout', logout);

module.exports = router;