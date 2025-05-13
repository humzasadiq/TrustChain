const express = require('express');
const router = express.Router();
const { handleStage, getStageEvents } = require('../controllers/handleStageEntry');
const { getOrderID, getOrderItems, getAllOrders, createOrder, getOrderDetails, getOrderByUID } = require('../controllers/handleOrder');
const { logInUser, signUpUser, getUser } = require('../controllers/auth');
const { body } = require('express-validator');
const { getItem, getInventory } = require('../controllers/handleItem');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/get-item', getItem);
router.post('/get-order-items', getOrderItems);
router.get('/get-all-orders', getAllOrders);

// Create order with file upload
router.post('/create-order', (req, res, next) => {
  // Access the multer instance from app.locals
  const upload = req.app.locals.upload;
  // Use multer's single method for the 'carImage' field
  upload.single('carImage')(req, res, function(err) {
    if (err) {
      return res.status(400).json({ 
        success: false, 
        message: 'File upload error', 
        error: err.message 
      });
    }
    // File uploaded successfully, proceed to controller
    next();
  });
}, createOrder);

router.post('/get-order-details', getOrderDetails);
router.get('/get-stage-events', getStageEvents);
router.get('/get-inventory', getInventory);
router.post('/get-order-by-uid', getOrderByUID);

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


// Get user profile
router.get('/profile', (req, res) => {
    res.json({ 
        success: true, 
        user: { 
            id: req.user.id, 
            email: req.user.email 
        }
    });
});

router.post('/get-user', authenticateToken, getUser);

router.post('/stage-event', handleStage);
router.post('/get-order', getOrderID);
router.post('/get-order-items', getOrderItems);
router.get('/get-all-orders', getAllOrders);
router.post('/create-order', createOrder);

module.exports = router;