const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/auth');
const activityRoutes = require('./routes/activities');
const beneficiaryRoutes = require('./routes/beneficiaries');
const donationRoutes = require('./routes/donations');
const exportRoutes = require('./routes/export'); // Add this line

app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/beneficiaries', beneficiaryRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/export', exportRoutes); // Add this line

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    status: 'connected'
  });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});