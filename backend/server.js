require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

console.log('🔄 Starting server...');

const app = express();

// IMPORTANT: Middleware MUST be in this order BEFORE routes
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection (connect BEFORE using routes)
console.log('🔄 Connecting to MongoDB...');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// API Routes (AFTER middleware)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/issues', require('./routes/issues'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/lostfound', require('./routes/lostfound'));
app.use('/api/analytics', require('./routes/analytics'));

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Hostel Tracker API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      issues: '/api/issues',
      announcements: '/api/announcements',
      lostfound: '/api/lostfound',
      analytics: '/api/analytics (management only)'
    }
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🚀 Server running on port ' + PORT);
  console.log('📍 http://localhost:' + PORT);
  console.log('');
  console.log('Available endpoints:');
  console.log('  - POST   /api/auth/register');
  console.log('  - POST   /api/auth/login');
  console.log('  - GET    /api/auth/me');
  console.log('  - GET    /api/issues');
  console.log('  - POST   /api/issues');
  console.log('  - GET    /api/announcements');
  console.log('  - GET    /api/lostfound');
  console.log('  - GET    /api/analytics/overview');
  console.log('');
});