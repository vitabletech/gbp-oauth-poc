const express = require('express');
const googleService = require('../services/google');

const router = express.Router();

/**
 * GET /accounts
 * Fetches all business accounts
 * Endpoint: https://mybusinessaccountmanagement.googleapis.com/v1/accounts
 */
router.get('/', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();

    if (!tokens.accessToken && !tokens.refreshToken) {
      console.log(`[${new Date().toISOString()}] Attempt to fetch accounts without authentication`);
      return res.status(401).json({
        error: 'UNAUTHENTICATED',
        message: 'Not authenticated. Please login first.',
        loginUrl: '/auth/google',
      });
    }

    console.log(`[${new Date().toISOString()}] Fetching accounts...`);

    const accountsData = await googleService.getAccounts();

    console.log(`[${new Date().toISOString()}] Successfully retrieved accounts`);

    res.json({
      success: true,
      data: accountsData,
      accountCount: accountsData.accounts?.length || 0,
      nextEndpoint: '/locations - Get locations for the first account',
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching accounts:`, error.message);

    let statusCode = 500;
    let errorType = 'UNKNOWN_ERROR';

    if (error.message.includes('No access token')) {
      statusCode = 401;
      errorType = 'UNAUTHENTICATED';
    } else if (error.message.includes('Unauthorized')) {
      statusCode = 401;
      errorType = 'UNAUTHENTICATED';
    } else if (error.message.includes('Insufficient permissions')) {
      statusCode = 403;
      errorType = 'INSUFFICIENT_SCOPE';
    } else if (error.message.includes('API not enabled')) {
      statusCode = 403;
      errorType = 'SERVICE_DISABLED';
    } else if (error.message.includes('Service not found')) {
      statusCode = 404;
      errorType = 'SERVICE_NOT_FOUND';
    }

    res.status(statusCode).json({
      error: errorType,
      message: error.message,
      hints: {
        UNAUTHENTICATED: 'Please visit /auth/google to authenticate',
        INSUFFICIENT_SCOPE: 'Please ensure https://www.googleapis.com/auth/business.manage scope is granted',
        SERVICE_DISABLED: 'Enable the Google Business Profile API in your Google Cloud project',
        SERVICE_NOT_FOUND: 'Verify the API endpoint URL and your account permissions',
      }[errorType],
    });
  }
});

module.exports = router;
