const express = require('express');
const router = express.Router();
const { handleStage } = require('../controllers/handleStageEntry');
const { getOrderID, getOrderItems, getAllOrders, createOrder } = require('../controllers/handleOrder');
const { logInUser, signUpUser, googleSignIn } = require('../controllers/auth');
const { body } = require('express-validator');
const { getItem } = require('../controllers/handleItem');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/get-item', getItem);
router.post('/login', [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').exists().withMessage('Password is required')
], logInUser);

router.post('/signup', [
    body('username')
        .trim()
        .isLength({ min: 4 }).withMessage('Username must be at least 4 characters long'),

    body('email')
        .isEmail().withMessage('Please enter a valid email'),

    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], signUpUser);

router.post('/google-login', googleSignIn);

// Get user profile (protected route example)
router.get('/profile', authenticateToken, (req, res) => {
    res.json({ 
        success: true, 
        user: { 
            id: req.user.id, 
            email: req.user.email 
        }
    });
});

// Protected routes
router.post('/stage-event', authenticateToken, handleStage);
router.post('/get-order', authenticateToken, getOrderID);
router.post('/get-order-items', authenticateToken, getOrderItems);
router.get('/get-all-orders', authenticateToken, getAllOrders);
router.post('/create-order', authenticateToken, createOrder);

module.exports = router;