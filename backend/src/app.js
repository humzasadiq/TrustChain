require('dotenv').config();
const express = require('express');
const app = express();
const routes = require('./routes');
const cors = require('cors');
const ipMonitorRoutes = require('../routes/ipMonitor');
const multer = require('multer');
const path = require('path');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed'));
  }
});

// Make multer available to route handlers
app.locals.upload = upload;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);
app.use('/api', ipMonitorRoutes);

// OAuth callback handler
app.get('/auth/callback', (req, res) => {
    const { code, error } = req.query;
    
    if (error) {
      return res.redirect(`http://localhost:3000/login?error=${error}`);
    }
    
    if (code) {
      return res.redirect(`http://localhost:3000/auth/callback?code=${code}`);
    }
    
    res.redirect('http://localhost:3000/login');
  });

// Not found handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;