const express = require('express');
const googleService = require('../services/google');

const router = express.Router();

/**
 * GET /auth/google
 * Redirects user to Google OAuth login page
 */
router.get('/google', (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Initiating Google OAuth flow...`);
    const authUrl = googleService.generateAuthUrl();
    res.redirect(authUrl);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in /auth/google:`, error.message);
    res.status(500).json({
      error: 'Failed to initiate OAuth flow',
      message: error.message,
    });
  }
});

/**
 * GET /auth/google/callback
 * Handles OAuth callback from Google
 * Receives authorization code and exchanges it for tokens
 */
router.get('/google/callback', async (req, res) => {
  try {
    const { code, error, error_description } = req.query;

    console.log(`[${new Date().toISOString()}] OAuth callback received`);

    // Handle OAuth errors
    if (error) {
      console.error(`[${new Date().toISOString()}] OAuth error: ${error}`);
      console.error(`  Description: ${error_description}`);

      let errorMessage = 'OAuth authentication failed';

      if (error === 'access_denied') {
        errorMessage = 'You denied the permission. Please try again.';
      } else if (error === 'redirect_uri_mismatch') {
        errorMessage =
          'Redirect URI mismatch. Please verify your configured redirect URI.';
      } else if (error === 'invalid_scope') {
        errorMessage = 'Invalid scope requested. Please verify the scope configuration.';
      } else if (error === 'server_error') {
        errorMessage = 'Server error from Google. Please try again later.';
      }

      return res.status(400).json({
        error,
        message: errorMessage,
        description: error_description,
      });
    }

    if (!code) {
      console.error(`[${new Date().toISOString()}] No authorization code received`);
      return res.status(400).json({
        error: 'Missing authorization code',
        message: 'OAuth callback did not include authorization code',
      });
    }

    console.log(`[${new Date().toISOString()}] Authorization code received: ${code.substring(0, 20)}...`);

    const tokens = await googleService.handleCallback(code);

    // Redirect to Swagger API documentation
    res.redirect('/api-docs');
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in /auth/google/callback:`, error.message);

    // Handle specific Google API errors
    let statusCode = 500;
    let errorType = 'AUTHENTICATION_ERROR';

    if (error.message.includes('invalid_grant')) {
      errorType = 'INVALID_GRANT';
      statusCode = 400;
    } else if (error.message.includes('redirect_uri_mismatch')) {
      errorType = 'REDIRECT_URI_MISMATCH';
      statusCode = 400;
    }

    res.status(statusCode).json({
      error: errorType,
      message: error.message,
    });
  }
});

/**
 * GET /auth/logout
 * Clears stored tokens
 */
router.get('/logout', (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] User logout initiated`);
    googleService.clearTokens();

    res.json({
      success: true,
      message: 'Successfully logged out. Tokens cleared.',
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error in /auth/logout:`, error.message);
    res.status(500).json({
      error: 'Failed to logout',
      message: error.message,
    });
  }
});

module.exports = router;
