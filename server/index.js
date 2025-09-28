const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const database = require('./database/database');
require('dotenv').config();

const validationRoutes = require('./routes/validation');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 3600000, // 1 hour
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10, // 10 requests per hour
  message: {
    error: 'Zbyt wiele prób. Spróbuj ponownie za godzinę.',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/ugc', validationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Test connections endpoint
app.get('/api/test/connections', async (req, res) => {
  try {
    const airtableService = require('./services/airtableService');
    const googleDriveService = require('./services/googleDriveService');
    
    console.log('🧪 Testing connections...');
    
    // Test Airtable connection
    const airtableTest = await airtableService.testConnection();
    console.log('📊 Airtable test result:', airtableTest);
    
    // Test Google Drive connection
    const googleDriveTest = await googleDriveService.testConnection();
    console.log('📁 Google Drive test result:', googleDriveTest);
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      connections: {
        airtable: airtableTest,
        googleDrive: googleDriveTest
      }
    });
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    res.status(500).json({
      status: 'ERROR',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint nie został znaleziony',
    path: req.originalUrl 
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server uruchomiony na porcie ${PORT}`);
  console.log(`📊 Health check: http://0.0.0.0:${PORT}/api/health`);
  console.log(`🔍 UGC Validation: http://0.0.0.0:${PORT}/api/ugc/validate`);
});

module.exports = app;

