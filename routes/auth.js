const express = require('express');
const googleService = require('../services/google');

const router = express.Router();

/**
 * GET /auth/config
 * Returns current OAuth configuration and defaults
 */
router.get('/config', (req, res) => {
  try {
    const creds = googleService.getCredentials();
    res.json({
      success: true,
      data: {
        clientId: creds.clientId,
        clientSecret: creds.clientSecret,
        redirectUri: creds.redirectUri,
        hasClientSecret: Boolean(creds.clientSecret),
        defaultClientId: process.env.GOOGLE_CLIENT_ID || '',
        defaultRedirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback',
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'CONFIG_FETCH_ERROR', message: error.message });
  }
});

/**
 * POST /auth/config
 * Updates OAuth credentials provided by the frontend
 */
router.post('/config', (req, res) => {
  try {
    const { clientId, clientSecret, redirectUri } = req.body;

    if (!clientId || !clientSecret) {
      return res.status(400).json({
        error: 'BAD_REQUEST',
        message: 'Both clientId and clientSecret are required.',
      });
    }

    const updated = googleService.setCredentials({
      clientId,
      clientSecret,
      redirectUri,
    });

    res.json({
      success: true,
      message: 'Credentials updated successfully!',
      data: {
        clientId: updated.clientId,
        redirectUri: updated.redirectUri,
        hasClientSecret: true,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'CONFIG_UPDATE_ERROR', message: error.message });
  }
});

/**
 * GET /auth/status
 * Returns current authentication and token status
 */
router.get('/status', async (req, res) => {
  try {
    const creds = googleService.getCredentials();
    let tokenStatus = null;
    let isAuthenticated = false;

    try {
      tokenStatus = await googleService.getTokenFileStatus();
      isAuthenticated = Boolean(tokenStatus && (tokenStatus.accessToken || tokenStatus.refreshToken));
    } catch {
      isAuthenticated = false;
    }

    res.json({
      success: true,
      isAuthenticated,
      tokenStatus,
      clientId: creds.clientId,
      redirectUri: creds.redirectUri,
    });
  } catch (error) {
    res.status(500).json({ error: 'STATUS_CHECK_ERROR', message: error.message });
  }
});

/**
 * GET /auth/google
 * Redirects user to Google OAuth login page (supports query param override)
 */
router.get('/google', (req, res) => {
  try {
    const { clientId, clientSecret, redirectUri } = req.query;
    const customCreds =
      clientId && clientSecret ? { clientId, clientSecret, redirectUri } : null;

    console.log(`[${new Date().toISOString()}] Initiating Google OAuth flow...`);
    const authUrl = googleService.generateAuthUrl(customCreds);
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
 * Receives authorization code & state and exchanges it for tokens
 */
router.get('/google/callback', async (req, res) => {
  try {
    const { code, state, error, error_description } = req.query;

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
          'Redirect URI mismatch. Please verify your configured redirect URI matches in Google Cloud Console.';
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

    console.log(
      `[${new Date().toISOString()}] Authorization code received: ${code.substring(0, 20)}...`
    );

    await googleService.handleCallback(code, state);

    // Redirect to Swagger API documentation on successful authentication
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
router.get('/logout', async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] User logout initiated`);
    await googleService.clearTokens();

    res.json({
      success: true,
      message: 'Successfully logged out. Stored tokens cleared.',
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
