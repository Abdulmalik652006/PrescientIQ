require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');

const { connectDB, isDbConnected } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const mlService = require('./services/mlService');

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const alertRoutes = require('./routes/alertRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const forecastRoutes = require('./routes/forecastRoutes');
const teamRoutes = require('./routes/teamRoutes');
const reportRoutes = require('./routes/reportRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'https://prescientiq-2glldvjzf-abdul-a565.vercel.app/')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// --- Global middleware ---
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// --- Health check (also reports MongoDB + ML service reachability) ---
const healthCheck = async (req, res) => {
  const mlHealth = await mlService.checkHealth();
  res.json({
    success: true,
    service: 'predictive-management-backend',
    timestamp: new Date().toISOString(),
    mongo: isDbConnected() ? 'connected' : 'disconnected',
    mlService: mlHealth.ok ? 'reachable' : 'unreachable',
  });
};

app.get('/', (req, res) => {
  res.json({
    service: 'predictive-management-backend',
    status: 'running',
  });
});
app.get('/health', healthCheck);
app.get('/api/health', healthCheck);

// --- API routes ---
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/forecasts', forecastRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);

// --- 404 + error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error('[Startup] Could not connect to MongoDB. Server will still start, but data routes will fail until MongoDB is reachable.');
  }

  app.listen(PORT, () => {
    console.log(`[Server] Predictive Management backend running on port ${PORT}`);
    console.log(`[Server] ML service expected at ${process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000'}`);
  });
};

start();

module.exports = app;
