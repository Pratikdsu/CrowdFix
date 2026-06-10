const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth.routes');
const reportsRoutes = require('./routes/reports.routes');

const { reportRouter, commentsRouter } = require('./routes/upvotesComments.routes');
const config = require('./config/env');
const healthRoutes = require('./routes/health.routes');
const notFound = require('./middleware/notfound.middleware');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// 1. Security headers
app.use(helmet());

// 2. CORS — allow the frontend to call this API
app.use(cors({ origin: config.frontendUrl, credentials: true }));

// 3. Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Request logging (dev only)
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// 5. Rate limiting — 100 requests/min/IP (NFR-07)
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// 6. Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);   
app.use('/api/health', healthRoutes);
app.use('/api/reports/:id', reportRouter);
app.use('/api/comments', commentsRouter);
// 7. 404 handler (after all routes)
app.use(notFound);

// 8. Error handler (must be last)
app.use(errorHandler);

module.exports = app;