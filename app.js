require('dotenv').config();
const express = require('express');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const accountsRoutes = require('./routes/accounts');
const locationsRoutes = require('./routes/locations');
const reviewsRoutes = require('./routes/reviews');
const categoriesRoutes = require('./routes/categories');
const chainsRoutes = require('./routes/chains');

// Import services
const googleService = require('./services/google');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./services/swagger');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'views')));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Logging middleware
app.use((req, res, next) => {
  console.log(`\n[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (Object.keys(req.query).length > 0) {
    console.log(`  Query: ${JSON.stringify(req.query)}`);
  }
  next();
});

// Routes

/**
 * GET /
 * Display the login / dashboard page
 */
app.get('/', (req, res) => {
  console.log(`[${new Date().toISOString()}] Serving home page`);
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * GET /token-status
 * Check current token status and refresh if needed
 */
app.get('/token-status', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Token status requested`);
    const status = await googleService.getTokenFileStatus();

    res.json({
      tokenStatus: status,
      refreshAction: 'Auto-refresh is handled natively by the GBPClient SDK.',
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error checking token status:`, error.message);
    res.status(500).json({
      error: 'TOKEN_STATUS_ERROR',
      message: error.message,
    });
  }
});

/**
 * GET /ro-details
 * Display the RO Details UI screen
 */
app.get('/ro-details', (req, res) => {
  console.log(`[${new Date().toISOString()}] Serving RO details page`);
  res.sendFile(path.join(__dirname, 'views', 'ro-details.html'));
});

/**
 * GET /edit-ro
 * Display the Edit RO UI screen
 */
app.get('/edit-ro', (req, res) => {
  console.log(`[${new Date().toISOString()}] Serving Edit RO page`);
  res.sendFile(path.join(__dirname, 'views', 'edit-ro.html'));
});

app.get('/quotas', async (req, res) => {
  try {
    const projectId = req.query.projectId || '513681269462';
    const service = req.query.service || 'mybusinessbusinessinformation.googleapis.com';

    if (!projectId || !service) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'projectId and service query parameters are required',
      });
    }

    const quotas = await googleService.getQuotas(projectId, service);
    res.json({
      success: true,
      data: quotas,
    });
  } catch (error) {
    res.status(500).json({
      error: 'QUOTAS_ERROR',
      message: error.message,
    });
  }
});

app.get('/quotas/business-information', async (req, res) => {
  try {
    const projectId = req.query.projectId || '513681269462';
    if (!projectId) return res.status(400).json({ error: 'BAD_REQUEST', message: 'projectId required' });
    const quotas = await googleService.getBusinessInformationQuotas(projectId);
    res.json({ success: true, data: quotas });
  } catch (error) {
    res.status(500).json({ error: 'QUOTAS_ERROR', message: error.message });
  }
});

app.get('/quotas/account-management', async (req, res) => {
  try {
    const projectId = req.query.projectId || '513681269462';
    if (!projectId) return res.status(400).json({ error: 'BAD_REQUEST', message: 'projectId required' });
    const quotas = await googleService.getAccountManagementQuotas(projectId);
    res.json({ success: true, data: quotas });
  } catch (error) {
    res.status(500).json({ error: 'QUOTAS_ERROR', message: error.message });
  }
});

app.get('/quotas/verifications', async (req, res) => {
  try {
    const projectId = req.query.projectId || '513681269462';
    if (!projectId) return res.status(400).json({ error: 'BAD_REQUEST', message: 'projectId required' });
    const quotas = await googleService.getVerificationsQuotas(projectId);
    res.json({ success: true, data: quotas });
  } catch (error) {
    res.status(500).json({ error: 'QUOTAS_ERROR', message: error.message });
  }
});

app.get('/quotas/qanda', async (req, res) => {
  try {
    const projectId = req.query.projectId || '513681269462';
    if (!projectId) return res.status(400).json({ error: 'BAD_REQUEST', message: 'projectId required' });
    const quotas = await googleService.getQAndAQuotas(projectId);
    res.json({ success: true, data: quotas });
  } catch (error) {
    res.status(500).json({ error: 'QUOTAS_ERROR', message: error.message });
  }
});

app.get('/quotas/lodging', async (req, res) => {
  try {
    const projectId = req.query.projectId || '513681269462';
    if (!projectId) return res.status(400).json({ error: 'BAD_REQUEST', message: 'projectId required' });
    const quotas = await googleService.getLodgingQuotas(projectId);
    res.json({ success: true, data: quotas });
  } catch (error) {
    res.status(500).json({ error: 'QUOTAS_ERROR', message: error.message });
  }
});

app.get('/quotas/place-actions', async (req, res) => {
  try {
    const projectId = req.query.projectId || '513681269462';
    if (!projectId) return res.status(400).json({ error: 'BAD_REQUEST', message: 'projectId required' });
    const quotas = await googleService.getPlaceActionsQuotas(projectId);
    res.json({ success: true, data: quotas });
  } catch (error) {
    res.status(500).json({ error: 'QUOTAS_ERROR', message: error.message });
  }
});

app.get('/quotas/legacy', async (req, res) => {
  try {
    const projectId = req.query.projectId || '513681269462';
    if (!projectId) return res.status(400).json({ error: 'BAD_REQUEST', message: 'projectId required' });
    const quotas = await googleService.getLegacyQuotas(projectId);
    res.json({ success: true, data: quotas });
  } catch (error) {
    res.status(500).json({ error: 'QUOTAS_ERROR', message: error.message });
  }
});

// Mount route handlers
app.use('/auth', authRoutes);
app.use('/accounts', accountsRoutes);
app.use('/locations', locationsRoutes);
app.use('/reviews', reviewsRoutes);
app.use('/categories', categoriesRoutes);
app.use('/chains', chainsRoutes);

// 404 handler
app.use((req, res) => {
  console.log(`[${new Date().toISOString()}] 404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: 'NOT_FOUND',
    message: 'Route not found',
    availableEndpoints: [
      'GET / - Login page',
      'GET /health - Health check',
      'GET /token-status - Check & refresh tokens',
      'GET /auth/config - Current OAuth configuration',
      'POST /auth/config - Update OAuth configuration (BYOC)',
      'GET /auth/status - Check authentication status',
      'GET /auth/google - Start Google login',
      'GET /auth/google/callback - Google OAuth callback',
      'GET /auth/logout - Logout and clear tokens',
      'GET /accounts - List business accounts',
      'GET /locations - List locations',
      'GET /reviews - Get reviews',
      'GET /api-docs - Interactive Swagger API documentation',
    ],
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Unhandled error:`);
  console.error(`  ${err.message}`);
  console.error(`  Stack: ${err.stack}`);

  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
