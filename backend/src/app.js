require('dotenv').config();
const express = require('express');
const app = express();
const routes = require('./routes');
const cors = require('cors');
const ipMonitorRoutes = require('../routes/ipMonitor');

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