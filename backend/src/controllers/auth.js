const { validationResult } = require('express-validator');
const { signup, login, getUserfromDB } = require('../services/supabaseService');


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

const getUser = async(req, res) => {
   try {
        const userID = req.user;
        const user = await getUserfromDB(userID);
        res.send(user)
    } catch (error) {
        console.error(error.message)
        res.status(500).send("Internal Server error occured")
    }
}

module.exports = { logInUser, signUpUser, getUser};