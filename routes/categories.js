const express = require('express');
const router = express.Router();
const googleService = require('../services/google');

/**
 * GET /categories
 * Returns a list of business categories.
 */
router.get('/', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({
        error: 'UNAUTHENTICATED',
        message: 'Not authenticated. Please login first.',
        loginUrl: '/auth/google',
      });
    }

    const { languageCode, view, pageToken, regionCode } = req.query;

    console.log(`[${new Date().toISOString()}] Fetching categories...`);
    const data = await googleService.getCategories({
      languageCode,
      view,
      pageToken,
      regionCode,
    });

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching categories:`, error.message);
    let statusCode = 500;
    let errorType = 'UNKNOWN_ERROR';
    if (error.message.includes('No access token')) { statusCode = 401; errorType = 'UNAUTHENTICATED'; }
    else if (error.message.includes('Insufficient permissions')) { statusCode = 403; errorType = 'INSUFFICIENT_SCOPE'; }

    res.status(statusCode).json({
      error: errorType,
      message: error.message,
      details: error.responseBody?.error?.details || error.responseBody || undefined,
    });
  }
});

/**
 * GET /categories/search
 * Searches for business categories.
 */
router.get('/search', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({
        error: 'UNAUTHENTICATED',
        message: 'Not authenticated. Please login first.',
        loginUrl: '/auth/google',
      });
    }

    const { searchTerm, languageCode, regionCode, view, pageToken } = req.query;

    console.log(`[${new Date().toISOString()}] Searching categories for: ${searchTerm}`);
    const data = await googleService.searchCategories({
      searchTerm,
      languageCode,
      regionCode,
      view,
      pageToken,
    });

    res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error searching categories:`, error.message);
    let statusCode = 500;
    let errorType = 'UNKNOWN_ERROR';
    if (error.message.includes('No access token')) { statusCode = 401; errorType = 'UNAUTHENTICATED'; }
    else if (error.message.includes('Insufficient permissions')) { statusCode = 403; errorType = 'INSUFFICIENT_SCOPE'; }

    res.status(statusCode).json({
      error: errorType,
      message: error.message,
      details: error.responseBody?.error?.details || error.responseBody || undefined,
    });
  }
});

module.exports = router;
