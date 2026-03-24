const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const dashboardRoutes = require('./routes/dashboard');
const reportRoutes = require('./routes/reports');

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration for frontend connection
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  console.log('User ID:', req.user?.id || 'Not authenticated');
  next();
});

// Import routes
const authRoutes = require('./routes/auth');
const activityRoutes = require('./routes/activities');
const beneficiaryRoutes = require('./routes/beneficiaries');
const donationRoutes = require('./routes/donations');
const exportRoutes = require('./routes/export');
const adminRoutes = require('./routes/admin'); // Admin routes

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/admin', adminRoutes); // Mount admin routes

// Test route to verify backend is running
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true,
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    status: 'connected',
    port: process.env.PORT || 5001,
    endpoints: {
      auth: '/api/auth',
      activities: '/api/activities',
      beneficiaries: '/api/beneficiaries',
      donations: '/api/donations',
      export: '/api/export',
      admin: '/api/admin'
    }
  });
});

// API Routes List (for debugging)
app.get('/api/routes', (req, res) => {
  res.json({
    availableRoutes: [
      '/api/test',
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/verify',
      '/api/activities',
      '/api/activities/stats',
      '/api/beneficiaries',
      '/api/beneficiaries/stats',
      '/api/donations',
      '/api/donations/stats',
      '/api/export/activities/csv',
      '/api/export/beneficiaries/csv',
      '/api/export/donations/csv',
      '/api/export/report/pdf',
      '/api/admin/ngos',
      '/api/admin/ngos/:id',
      '/api/admin/ngos/:id/toggle-status',
      '/api/admin/ngos/:id',
      '/api/admin/stats'
    ]
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Route not found',
    path: req.url,
    method: req.method
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}/api`);
  console.log(`🔍 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`📋 Routes list: http://localhost:${PORT}/api/routes`);
  console.log(`🔒 Multi-user data isolation enabled`);
  console.log(`👑 Admin panel routes mounted at /api/admin`);
  console.log('='.repeat(50) + '\n');
});