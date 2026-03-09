const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('User ID:', req.user?.id || 'Not authenticated');
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const activityRoutes = require('./routes/activities');
const beneficiaryRoutes = require('./routes/beneficiaries');
const donationRoutes = require('./routes/donations');
const dashboardRoutes = require('./routes/dashboard'); // New dashboard route

app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/dashboard', dashboardRoutes); // Add dashboard endpoint

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    status: 'connected'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.url 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}/api`);
  console.log(`🔒 Multi-user data isolation enabled`);
});