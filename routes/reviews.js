const express = require('express');
const googleService = require('../services/google');

const router = express.Router();

/**
 * GET /reviews
 * Fetches reviews for a location
 * Uses the first location from the first account
 * Endpoint: https://mybusiness.googleapis.com/v4/accounts/{accountId}/locations/{locationId}/reviews
 */
router.get('/', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const requestedAccountId = req.query.accountId;
    const requestedLocationId = req.query.locationId;

    if (!tokens.accessToken && !tokens.refreshToken) {
      console.log(`[${new Date().toISOString()}] Attempt to fetch reviews without authentication`);
      return res.status(401).json({
        error: 'UNAUTHENTICATED',
        message: 'Not authenticated. Please login first.',
        loginUrl: '/auth/google',
      });
    }

    let accountReference = requestedAccountId;
    let locationReference = requestedLocationId;
    let accountDisplayName;
    let locationDisplayName;

    if (requestedLocationId && requestedLocationId.startsWith('accounts/')) {
      const [_, accountSegment, , locationSegment] = requestedLocationId.split('/');
      accountReference = `accounts/${accountSegment}`;
      locationReference = requestedLocationId;
      accountDisplayName = accountReference;
      locationDisplayName = requestedLocationId;
      console.log(`[${new Date().toISOString()}] Using requested full location resource: ${requestedLocationId}`);
    }

    if (!accountReference && !locationReference) {
      console.log(`[${new Date().toISOString()}] Fetching accounts to get account ID...`);
      const accountsData = await googleService.getAccounts();

      if (!accountsData.accounts || accountsData.accounts.length === 0) {
        console.log(`[${new Date().toISOString()}] No accounts found`);
        return res.status(404).json({
          error: 'NO_ACCOUNTS',
          message: 'No business accounts found',
        });
      }

      const firstAccount = accountsData.accounts[0];
      accountReference = firstAccount.name;
      accountDisplayName = firstAccount.name;

      console.log(`[${new Date().toISOString()}] Using account: ${firstAccount.name}`);
      console.log(`[${new Date().toISOString()}] Fetching locations for account ${firstAccount.name}...`);

      const locationsData = await googleService.getLocations(accountReference);
      if (!locationsData.locations || locationsData.locations.length === 0) {
        console.log(`[${new Date().toISOString()}] No locations found for account ${firstAccount.name}`);
        return res.status(404).json({
          error: 'NO_LOCATIONS',
          message: 'No locations found for this account',
        });
      }

      const firstLocation = locationsData.locations[0];
      locationReference = firstLocation.name;
      locationDisplayName = firstLocation.name;
      console.log(`[${new Date().toISOString()}] Using location: ${firstLocation.name}`);
    }

    if (accountReference && !locationReference) {
      console.log(`[${new Date().toISOString()}] Fetching locations for account ${accountReference}...`);
      const locationsData = await googleService.getLocations(accountReference);

      if (!locationsData.locations || locationsData.locations.length === 0) {
        const accountId = accountReference.split('/').pop();
        console.log(`[${new Date().toISOString()}] No locations found for account ${accountId}`);
        return res.status(404).json({
          error: 'NO_LOCATIONS',
          message: 'No locations found for this account',
        });
      }

      const firstLocation = locationsData.locations[0];
      locationReference = firstLocation.name;
      locationDisplayName = firstLocation.name;
      accountDisplayName = accountReference;
      console.log(`[${new Date().toISOString()}] Using first location: ${firstLocation.name}`);
    }

    if (!locationReference) {
      return res.status(400).json({
        error: 'MISSING_LOCATION',
        message: 'Please provide locationId or a full location resource name in query params.',
      });
    }

    const reviewsData = await googleService.getReviews(accountReference, locationReference);

    const accountId = accountReference.startsWith('accounts/') ? accountReference.split('/').pop() : accountReference;
    const locationId = locationReference.startsWith('accounts/') ? locationReference.split('/').pop() : locationReference;

    console.log(`[${new Date().toISOString()}] Successfully retrieved reviews`);

    res.json({
      success: true,
      account: {
        name: accountDisplayName || accountReference,
        accountId,
      },
      location: {
        name: locationDisplayName || locationReference,
        locationId,
      },
      query: {
        accountId: req.query.accountId || null,
        locationId: req.query.locationId || null,
      },
      data: reviewsData,
      reviewCount: reviewsData.reviews?.length || 0,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching reviews:`, error.message);

    let statusCode = 500;
    let errorType = 'UNKNOWN_ERROR';

    if (error.message.includes('No access token')) {
      statusCode = 401;
      errorType = 'UNAUTHENTICATED';
    } else if (error.message.includes('Insufficient permissions')) {
      statusCode = 403;
      errorType = 'INSUFFICIENT_SCOPE';
    } else if (error.message.includes('not found')) {
      statusCode = 404;
      errorType = 'NOT_FOUND';
    }

    res.status(statusCode).json({
      error: errorType,
      message: error.message,
    });
  }
});

/**
 * PUT /reviews/:reviewId/reply
 * Replies to a review
 */
router.put('/:reviewId/reply', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const reviewId = req.params.reviewId;
    const { accountId, locationId, reply } = req.body;

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Not authenticated. Please login first.' });
    }

    if (!accountId || !locationId || !reply || !reply.comment) {
      return res.status(400).json({ error: 'MISSING_DATA', message: 'Please provide accountId, locationId, and reply.comment in request body.' });
    }

    const result = await googleService.replyReview(accountId, locationId, reviewId, reply);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error replying to review:`, error.message);
    res.status(500).json({ error: 'UNKNOWN_ERROR', message: error.message, details: error.responseBody || undefined });
  }
});

module.exports = router;
