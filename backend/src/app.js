const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const config = require('./config/env');
const healthRoutes = require('./routes/health.routes');
const authRoutes = require('./routes/auth.routes');
const reportsRoutes = require('./routes/reports.routes');
const { reportRouter, commentsRouter } = require('./routes/upvotesComments.routes');
const authorityRoutes = require('./routes/authority.routes');
const statusRoutes = require('./routes/status.routes');
const notFound = require('./middleware/notFound.middleware');
const errorHandler = require('./middleware/error.middleware');

const app = express();

// 1. Security headers
app.use(helmet());

// 2. CORS
app.use(cors({ origin: config.frontendUrl, credentials: true }));

// 3. Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Logging (dev only)
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// 5. Rate limiting (NFR-07)
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  limit: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// 6. Routes — ORDER MATTERS: specific paths before generic ones
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/authority', authorityRoutes);
app.use('/api/comments', commentsRouter);
app.use('/api/reports/:id/status', statusRoutes);
app.use('/api/reports/:id', reportRouter);
app.use('/api/reports', reportsRoutes);

// 7. 404 (after all routes)
app.use(notFound);

// 8. Error handler (must be last)
app.use(errorHandler);

module.exports = app;