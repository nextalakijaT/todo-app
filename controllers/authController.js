const User = require('../models/User');

const showSignup = (req, res) => {
  res.render('auth/signup', { error: null });
};

const showLogin = (req, res) => {
  res.render('auth/login', { error: null });
};

const signup = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.render('auth/signup', { error: 'Username and password are required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.render('auth/signup', { error: 'Username already taken' });
    }

    const user = await User.create({ username, password });
    req.session.userId = user._id;

    console.log(`[AUTH] New user signed up: ${username}`);
    return res.redirect('/todos');
  } catch (err) {
    console.error('[AUTH] Signup error:', err.message);
    return res.render('auth/signup', { error: 'Something went wrong. Please try again.' });
  }
};

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.render('auth/login', { error: 'Username and password are required' });
    }

    const user = await User.findOne({ username });
    if (!user || !(await user.comparePassword(password))) {
      return res.render('auth/login', { error: 'Invalid username or password' });
    }

    req.session.userId = user._id;
    console.log(`[AUTH] User logged in: ${username}`);
    return res.redirect('/todos');
  } catch (err) {
    console.error('[AUTH] Login error:', err);
    return res.render('auth/login', { error: 'Something went wrong. Please try again.' });
  }
};

const logout = (req, res) => {
  req.session.destroy(() => {
    console.log('[AUTH] User logged out');
    res.redirect('/login');
  });
};

module.exports = { showSignup, showLogin, signup, login, logout };