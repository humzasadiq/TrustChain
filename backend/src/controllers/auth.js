const { validationResult } = require('express-validator');
const { signup, login } = require('../services/supabaseService')

const signUpUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password } = req.body;
        const signupResult = await signup(username, email, password);

        if (signupResult.error) {
            return res.status(400).json({ success: false, ...signupResult });
        }

        return res.json({ success: true, ...signupResult });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error signing up');
    }
};

const logInUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() }); // ✅ return added
        }

        const { email, password } = req.body;
        const logInResult = await login(email, password); // ✅ removed username

        if (logInResult.error) {
            return res.status(401).json({ success: false, ...logInResult });
        }

        return res.json({ success: true, ...logInResult });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error logging in');
    }
};

module.exports = { logInUser, signUpUser }