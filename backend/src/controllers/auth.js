const { validationResult } = require('express-validator');
const { signup, login, signInWithGoogle } = require('../services/supabaseService');

/**
 * Handle Google sign-in
 */
const googleSignIn = async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ success: false, message: 'Token is required' });
  }

  const result = await signInWithGoogle(token);

  if (!result.success) {
    return res.status(401).json({ success: false, message: result.error });
  }

  res.json({ success: true, session: result.session, user: result.user });
};

/**
 * Handle user sign up
 */
const signUpUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, email, password } = req.body;
    const signupResult = await signup(username, email, password);

    if (signupResult.error) {
      return res.status(400).json({ success: false, message: signupResult.error });
    }

    return res.json({ 
      success: true, 
      message: signupResult.message,
      token: signupResult.token,
      user: signupResult.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error signing up' });
  }
};

/**
 * Handle user login
 */
const logInUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    const logInResult = await login(email, password);

    if (logInResult.error) {
      return res.status(401).json({ success: false, message: logInResult.error });
    }

    return res.json({ 
      success: true, 
      message: logInResult.message,
      token: logInResult.token,
      user: logInResult.user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Error logging in' });
  }
};

module.exports = { logInUser, signUpUser, googleSignIn };