const express = require('express');
const googleService = require('../services/google');

const router = express.Router();

/**
 * GET /locations
 * Fetches locations for a business account
 * Uses the first account from /accounts
 * Endpoint: https://mybusinessbusinessinformation.googleapis.com/v1/accounts/{accountId}/locations
 */
router.get('/', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    let requestedAccountId = req.query.accountId || req.query.accountName;

    if (!tokens.accessToken && !tokens.refreshToken) {
      console.log(`[${new Date().toISOString()}] Attempt to fetch locations without authentication`);
      return res.status(401).json({
        error: 'UNAUTHENTICATED',
        message: 'Not authenticated. Please login first.',
        loginUrl: '/auth/google',
      });
    }

    let accountDisplayName;
    let accountReference;

    if (requestedAccountId) {
      accountReference = requestedAccountId;
      accountDisplayName = requestedAccountId.startsWith('accounts/')
        ? requestedAccountId
        : `accounts/${requestedAccountId}`;

      console.log(`[${new Date().toISOString()}] Fetching locations using requested account: ${accountReference}`);
    } else {
      console.log(`[${new Date().toISOString()}] Fetching accounts to get first account ID...`);
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
      requestedAccountId = firstAccount.name.split('/').pop();

      console.log(`[${new Date().toISOString()}] Using first account: ${firstAccount.name}`);
    }

    const locationsData = await googleService.getLocations(accountReference);

    console.log(`[${new Date().toISOString()}] Successfully retrieved locations`);

    res.json({
      success: true,
      account: {
        name: accountDisplayName,
        accountId: requestedAccountId,
      },
      data: locationsData,
      locationCount: locationsData.locations?.length || 0,
      query: {
        accountId: req.query.accountId || null,
      },
      nextEndpoint: '/reviews?accountId={accountId}&locationId={locationId} - Get reviews for a specific location',
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching locations:`, error.message);

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
 * POST /locations
 * Creates a new location.
 * Endpoint: https://mybusinessbusinessinformation.googleapis.com/v1/{accountId}/locations
 */
router.post('/', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();

    if (!tokens.accessToken && !tokens.refreshToken) {
      console.log(`[${new Date().toISOString()}] Attempt to create location without authentication`);
      return res.status(401).json({
        error: 'UNAUTHENTICATED',
        message: 'Not authenticated. Please login first.',
        loginUrl: '/auth/google',
      });
    }

    const { accountId, locationData, validateOnly, requestId } = req.body;

    if (!accountId) {
      return res.status(400).json({
        error: 'MISSING_ACCOUNT_ID',
        message: 'Please provide accountId in the request body.',
      });
    }

    if (!locationData) {
      return res.status(400).json({
        error: 'MISSING_LOCATION_DATA',
        message: 'Please provide locationData in the request body.',
      });
    }

    const options = {};
    if (validateOnly !== undefined) {
      // Support string "true"/"false" or boolean
      options.validateOnly = validateOnly === 'true' || validateOnly === true;
    }
    if (requestId) {
      options.requestId = String(requestId);
    }

    console.log(`[${new Date().toISOString()}] Creating location for account: ${accountId} with options: ${JSON.stringify(options)}`);
    const createdLocation = await googleService.createLocation(accountId, locationData, options);

    res.json({
      success: true,
      data: createdLocation,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error creating location:`, error.message);
    
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
    } else if (error.message.includes('Validation Error')) {
      statusCode = 400;
      errorType = 'VALIDATION_ERROR';
    }

    res.status(statusCode).json({
      error: errorType,
      message: error.message,
      details: error.responseBody?.error?.details || error.responseBody || undefined,
    });
  }
});

/**
 * GET /locations/:locationId
 * Fetches a specific location by its ID or name
 * Endpoint: https://mybusinessbusinessinformation.googleapis.com/v1/{locationName}
 */
router.get('/:locationId', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const locationIdParam = req.params.locationId;
    const readMask = req.query.readMask;

    if (!tokens.accessToken && !tokens.refreshToken) {
      console.log(`[${new Date().toISOString()}] Attempt to fetch specific location without authentication`);
      return res.status(401).json({
        error: 'UNAUTHENTICATED',
        message: 'Not authenticated. Please login first.',
        loginUrl: '/auth/google',
      });
    }

    let locationName = locationIdParam;
    // Handle URL encoded location names (e.g., locations/12345 -> locations%2F12345)
    locationName = decodeURIComponent(locationName);
    
    if (!locationName.startsWith('locations/')) {
      locationName = `locations/${locationName}`;
    }

    console.log(`[${new Date().toISOString()}] Fetching location by name: ${locationName} with readMask: ${readMask || 'default'}`);
    const locationData = await googleService.getLocationByLocationName(locationName, readMask);

    console.log(`[${new Date().toISOString()}] Successfully retrieved location ${locationName}`);

    res.json({
      success: true,
      data: locationData,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching specific location:`, error.message);

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
      details: error.responseBody?.error?.details || error.responseBody || undefined,
    });
  }
});

/**
 * GET /locations/:locationId/attributes
 * Fetches attributes for a specific location
 */
router.get('/:locationId/attributes', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const locationIdParam = req.params.locationId;

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Not authenticated. Please login first.' });
    }

    let locationName = decodeURIComponent(locationIdParam);
    if (!locationName.startsWith('locations/')) locationName = `locations/${locationName}`;

    const attributes = await googleService.getAttributes(locationName);
    res.json({ success: true, data: attributes });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching attributes:`, error.message);
    res.status(500).json({ error: 'UNKNOWN_ERROR', message: error.message, details: error.responseBody?.error?.details || error.responseBody || undefined });
  }
});

/**
 * PATCH /locations/:locationId/attributes
 * Updates attributes for a specific location
 */
router.patch('/:locationId/attributes', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const locationIdParam = req.params.locationId;
    const attributeMask = req.query.attributeMask;
    const attributesData = req.body;

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Not authenticated. Please login first.' });
    }

    if (!attributeMask) {
      return res.status(400).json({ error: 'MISSING_ATTRIBUTE_MASK', message: 'Please provide attributeMask as a query parameter.' });
    }

    if (!attributesData || Object.keys(attributesData).length === 0) {
      return res.status(400).json({ error: 'MISSING_ATTRIBUTES_DATA', message: 'Please provide attributes payload in request body.' });
    }

    let locationName = decodeURIComponent(locationIdParam);
    if (!locationName.startsWith('locations/')) locationName = `locations/${locationName}`;

    // Delegate to googleService (which uses client.request from the gbp-sdk)
    const updatedAttributes = await googleService.updateAttributes(locationName, attributesData, attributeMask);
    res.json({ success: true, data: updatedAttributes });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error updating attributes:`, error.message);
    res.status(500).json({ error: 'UNKNOWN_ERROR', message: error.message, details: error.responseBody?.error?.details || error.responseBody || undefined });
  }
});

/**
 * PATCH /locations/:locationId/attributes/auto
 * Updates attributes without needing attributeMask
 */
router.patch('/:locationId/attributes/auto', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const locationIdParam = req.params.locationId;
    const { attributes } = req.body;

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Not authenticated. Please login first.' });
    }

    if (!attributes || !Array.isArray(attributes)) {
      return res.status(400).json({ error: 'MISSING_ATTRIBUTES', message: 'Please provide attributes array in request body.' });
    }

    let locationName = decodeURIComponent(locationIdParam);
    if (!locationName.startsWith('locations/')) locationName = `locations/${locationName}`;

    const updatedAttributes = await googleService.updateLocationAttributes(locationName, attributes);
    res.json({ success: true, data: updatedAttributes });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error auto-updating attributes:`, error.message);
    res.status(500).json({ error: 'UNKNOWN_ERROR', message: error.message, details: error.responseBody?.error?.details || error.responseBody || undefined });
  }
});

/**
 * GET /locations/:locationId/service-items
 * Fetches service items for a specific location
 */
router.get('/:locationId/service-items', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const locationIdParam = req.params.locationId;

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Not authenticated. Please login first.' });
    }

    let locationName = decodeURIComponent(locationIdParam);
    if (!locationName.startsWith('locations/')) locationName = `locations/${locationName}`;

    const serviceItems = await googleService.getServiceItems(locationName);
    res.json({ success: true, data: serviceItems });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching service items:`, error.message);
    res.status(500).json({ error: 'UNKNOWN_ERROR', message: error.message, details: error.responseBody?.error?.details || error.responseBody || undefined });
  }
});

/**
 * PATCH /locations/:locationId/service-items
 * Updates service items for a specific location
 */
router.patch('/:locationId/service-items', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const locationIdParam = req.params.locationId;
    const { serviceItems } = req.body;

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Not authenticated. Please login first.' });
    }

    if (!serviceItems || !Array.isArray(serviceItems)) {
      return res.status(400).json({ error: 'MISSING_SERVICE_ITEMS', message: 'Please provide serviceItems array in request body.' });
    }

    let locationName = decodeURIComponent(locationIdParam);
    if (!locationName.startsWith('locations/')) locationName = `locations/${locationName}`;

    const updatedServiceItems = await googleService.updateServiceItems(locationName, serviceItems);
    res.json({ success: true, data: updatedServiceItems });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error updating service items:`, error.message);
    res.status(500).json({ error: 'UNKNOWN_ERROR', message: error.message, details: error.responseBody?.error?.details || error.responseBody || undefined });
  }
});

/**
 * GET /locations/:locationId/metadata
 * Fetches metadata for a specific location
 */
router.get('/:locationId/metadata', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const locationIdParam = req.params.locationId;

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Not authenticated. Please login first.' });
    }

    let locationName = decodeURIComponent(locationIdParam);
    if (!locationName.startsWith('locations/')) locationName = `locations/${locationName}`;

    const metadata = await googleService.getMetadata(locationName);
    res.json({ success: true, data: metadata });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching metadata:`, error.message);
    res.status(500).json({ error: 'UNKNOWN_ERROR', message: error.message, details: error.responseBody?.error?.details || error.responseBody || undefined });
  }
});

/**
 * PATCH /locations/:locationId/whatsapp-url
 * Specifically sets the WhatsApp URL for a location
 */
router.patch('/:locationId/whatsapp-url', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const locationIdParam = req.params.locationId;
    const { whatsappUrl } = req.body;

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Not authenticated. Please login first.' });
    }

    if (!whatsappUrl) {
      return res.status(400).json({ error: 'MISSING_WHATSAPP_URL', message: 'Please provide whatsappUrl in request body.' });
    }

    let locationName = decodeURIComponent(locationIdParam);
    if (!locationName.startsWith('locations/')) locationName = `locations/${locationName}`;

    const result = await googleService.updateWhatsAppUrl(locationName, whatsappUrl);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error setting whatsapp url:`, error.message);
    res.status(500).json({ error: 'UNKNOWN_ERROR', message: error.message, details: error.responseBody?.error?.details || error.responseBody || undefined });
  }
});

const socialUrlEndpoints = [
  { path: 'facebook-url', method: 'updateFacebookUrl', param: 'facebookUrl' },
  { path: 'instagram-url', method: 'updateInstagramUrl', param: 'instagramUrl' },
  { path: 'linkedin-url', method: 'updateLinkedInUrl', param: 'linkedinUrl' },
  { path: 'pinterest-url', method: 'updatePinterestUrl', param: 'pinterestUrl' },
  { path: 'text-messaging-url', method: 'updateTextMessagingUrl', param: 'textMessagingUrl' },
  { path: 'tiktok-url', method: 'updateTikTokUrl', param: 'tiktokUrl' },
  { path: 'twitter-url', method: 'updateTwitterUrl', param: 'twitterUrl' },
  { path: 'youtube-url', method: 'updateYouTubeUrl', param: 'youtubeUrl' },
  { path: 'preferred-messaging-service', method: 'updatePreferredMessagingService', param: 'preferredMessagingService' },
];

socialUrlEndpoints.forEach(({ path, method, param }) => {
  /**
   * PATCH /locations/:locationId/${path}
   * Specifically sets the ${path} for a location
   */
  router.patch(`/:locationId/${path}`, async (req, res) => {
    try {
      const tokens = await googleService.getTokens();
      const locationIdParam = req.params.locationId;
      const paramValue = req.body[param];

      if (!tokens.accessToken && !tokens.refreshToken) {
        return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Not authenticated. Please login first.' });
      }

      if (!paramValue) {
        return res.status(400).json({ error: `MISSING_PARAM`, message: `Please provide ${param} in request body.` });
      }

      let locationName = decodeURIComponent(locationIdParam);
      if (!locationName.startsWith('locations/')) locationName = `locations/${locationName}`;

      const result = await googleService[method](locationName, paramValue);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Error setting ${path}:`, error.message);
      res.status(500).json({ error: 'UNKNOWN_ERROR', message: error.message, details: error.responseBody?.error?.details || error.responseBody || undefined });
    }
  });
});

/**
 * GET /locations/:locationId/media
 * Retrieves media for a location
 */
router.get('/:locationId/media', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const locationIdParam = req.params.locationId;
    const accountId = req.query.accountId;

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Not authenticated. Please login first.' });
    }

    if (!accountId) {
      return res.status(400).json({ error: 'MISSING_DATA', message: 'Please provide accountId as a query parameter.' });
    }

    let locationName = decodeURIComponent(locationIdParam);
    if (!locationName.startsWith('locations/')) locationName = `locations/${locationName}`;

    const result = await googleService.getMedia(accountId, locationName);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching media:`, error.message);
    res.status(500).json({ error: 'UNKNOWN_ERROR', message: error.message, details: error.responseBody || undefined });
  }
});

/**
 * GET /locations/:locationId/verifications
 * Lists verifications for a location (check if verified)
 */
router.get('/:locationId/verifications', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const locationIdParam = req.params.locationId;

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Not authenticated.' });
    }

    let locationName = decodeURIComponent(locationIdParam);
    if (!locationName.startsWith('locations/')) locationName = `locations/${locationName}`;

    const result = await googleService.listVerifications(locationName);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error listing verifications:`, error.message);
    res.status(500).json({ error: 'UNKNOWN_ERROR', message: error.message, details: error.responseBody || undefined });
  }
});

/**
 * POST /locations/:locationId/fetchVerificationOptions
 * Fetches verification options for a location
 */
router.post('/:locationId/fetchVerificationOptions', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const locationIdParam = req.params.locationId;
    const requestPayload = req.body;

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Not authenticated.' });
    }

    let locationName = decodeURIComponent(locationIdParam);
    if (!locationName.startsWith('locations/')) locationName = `locations/${locationName}`;

    const result = await googleService.fetchVerificationOptions(locationName, requestPayload);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching verification options:`, error.message);
    res.status(500).json({ error: 'UNKNOWN_ERROR', message: error.message, details: error.responseBody || undefined });
  }
});

/**
 * POST /locations/:locationId/verify
 * Starts the verification process for a location
 */
router.post('/:locationId/verify', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const locationIdParam = req.params.locationId;
    const requestPayload = req.body;

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Not authenticated.' });
    }

    let locationName = decodeURIComponent(locationIdParam);
    if (!locationName.startsWith('locations/')) locationName = `locations/${locationName}`;

    const result = await googleService.verifyLocation(locationName, requestPayload);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error verifying location:`, error.message);
    res.status(500).json({ error: 'UNKNOWN_ERROR', message: error.message, details: error.responseBody || undefined });
  }
});

/**
 * POST /locations/:locationId/verifications/:verificationId/complete
 * Completes the verification process for a location
 */
router.post('/:locationId/verifications/:verificationId/complete', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const locationIdParam = req.params.locationId;
    const verificationIdParam = req.params.verificationId;
    const requestPayload = req.body;

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Not authenticated.' });
    }

    let locationName = decodeURIComponent(locationIdParam);
    if (!locationName.startsWith('locations/')) locationName = `locations/${locationName}`;

    const result = await googleService.completeVerification(locationName, verificationIdParam, requestPayload);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error completing verification:`, error.message);
    res.status(500).json({ error: 'UNKNOWN_ERROR', message: error.message, details: error.responseBody || undefined });
  }
});

/**
 * PATCH /locations/:locationId/media/:mediaId
 * Updates metadata for a specific media item
 */
router.patch('/:locationId/media/:mediaId', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const locationIdParam = req.params.locationId;
    const mediaIdParam = req.params.mediaId;
    const updateMask = req.query.updateMask;
    const { accountId, mediaData } = req.body;

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Not authenticated. Please login first.' });
    }

    if (!accountId || !mediaData) {
      return res.status(400).json({ error: 'MISSING_DATA', message: 'Please provide accountId and mediaData in request body.' });
    }

    let locationName = decodeURIComponent(locationIdParam);
    if (!locationName.startsWith('locations/')) locationName = `locations/${locationName}`;

    let mediaKey = decodeURIComponent(mediaIdParam);
    if (!mediaKey.startsWith('media/')) mediaKey = `media/${mediaKey}`;

    const result = await googleService.patchMedia(accountId, locationName, mediaKey, mediaData, updateMask);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error patching media:`, error.message);
    res.status(500).json({ error: 'UNKNOWN_ERROR', message: error.message, details: error.responseBody || undefined });
  }
});

/**
 * GET /locations/:locationId/performance-metrics
 * Retrieves performance metrics/insights for a location
 */
router.get('/:locationId/performance-metrics', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const locationIdParam = req.params.locationId;
    const { dailyMetrics, startYear, startMonth, startDay, endYear, endMonth, endDay } = req.query;

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Not authenticated. Please login first.' });
    }

    if (!dailyMetrics || !startYear || !endYear) {
      return res.status(400).json({ error: 'MISSING_DATA', message: 'Please provide dailyMetrics (can be array) and date ranges in query params.' });
    }

    let locationName = decodeURIComponent(locationIdParam);
    if (!locationName.startsWith('locations/')) locationName = `locations/${locationName}`;

    const requestPayload = {
      dailyMetrics: Array.isArray(dailyMetrics) ? dailyMetrics : [dailyMetrics],
      dailyRange: {
        start_date: {
          year: parseInt(startYear, 10),
          month: parseInt(startMonth || '1', 10),
          day: parseInt(startDay || '1', 10),
        },
        end_date: {
          year: parseInt(endYear, 10),
          month: parseInt(endMonth || '1', 10),
          day: parseInt(endDay || '1', 10),
        }
      }
    };

    const result = await googleService.fetchMultiDailyMetricsTimeSeries(locationName, requestPayload);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error fetching metrics:`, error.message);
    res.status(500).json({ error: 'UNKNOWN_ERROR', message: error.message, details: error.responseBody || undefined });
  }
});

/**
 * POST /locations/:locationId/media/bulk
 * Uploads multiple media items to a location
 */
router.post('/:locationId/media/bulk', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const locationIdParam = req.params.locationId;
    const { accountId, mediaItems } = req.body;

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Not authenticated. Please login first.' });
    }

    if (!accountId || !mediaItems || !Array.isArray(mediaItems)) {
      return res.status(400).json({ error: 'MISSING_DATA', message: 'Please provide accountId and mediaItems (array) in request body.' });
    }

    let locationName = decodeURIComponent(locationIdParam);
    if (!locationName.startsWith('locations/')) locationName = `locations/${locationName}`;

    const result = await googleService.bulkCreateMedia(accountId, locationName, mediaItems);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error uploading bulk media:`, error.message);
    res.status(500).json({ error: 'UNKNOWN_ERROR', message: error.message, details: error.responseBody || undefined });
  }
});

/**
 * POST /locations/:locationId/media
 * Uploads media to a location
 */
router.post('/:locationId/media', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const locationIdParam = req.params.locationId;
    const { accountId, mediaData } = req.body;

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Not authenticated. Please login first.' });
    }

    if (!accountId || !mediaData) {
      return res.status(400).json({ error: 'MISSING_DATA', message: 'Please provide accountId and mediaData in request body.' });
    }

    let locationName = decodeURIComponent(locationIdParam);
    if (!locationName.startsWith('locations/')) locationName = `locations/${locationName}`;

    const result = await googleService.createMedia(accountId, locationName, mediaData);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error uploading media:`, error.message);
    res.status(500).json({ error: 'UNKNOWN_ERROR', message: error.message, details: error.responseBody || undefined });
  }
});

/**
 * PATCH /locations/:locationId
 * Updates an existing location.
 */
router.patch('/:locationId', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const locationIdParam = req.params.locationId;
    const { updateMask, locationData } = req.body;

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({
        error: 'UNAUTHENTICATED',
        message: 'Not authenticated. Please login first.',
        loginUrl: '/auth/google',
      });
    }

    if (!updateMask) {
      return res.status(400).json({
        error: 'MISSING_UPDATE_MASK',
        message: 'Please provide updateMask in the request body.',
      });
    }

    if (!locationData) {
      return res.status(400).json({
        error: 'MISSING_LOCATION_DATA',
        message: 'Please provide locationData in the request body.',
      });
    }

    let locationName = locationIdParam;
    locationName = decodeURIComponent(locationName);
    if (!locationName.startsWith('locations/')) {
      locationName = `locations/${locationName}`;
    }

    console.log(`[${new Date().toISOString()}] Updating location: ${locationName} with mask: ${updateMask}`);
    const updatedLocation = await googleService.updateLocation(locationName, locationData, updateMask);

    res.json({
      success: true,
      data: updatedLocation,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error updating location:`, error.message);
    let statusCode = 500;
    let errorType = 'UNKNOWN_ERROR';
    if (error.message.includes('No access token')) { statusCode = 401; errorType = 'UNAUTHENTICATED'; }
    else if (error.message.includes('Insufficient permissions')) { statusCode = 403; errorType = 'INSUFFICIENT_SCOPE'; }
    else if (error.message.includes('not found')) { statusCode = 404; errorType = 'NOT_FOUND'; }
    else if (error.message.includes('Validation Error')) { statusCode = 400; errorType = 'VALIDATION_ERROR'; }

    res.status(statusCode).json({
      error: errorType,
      message: error.message,
      details: error.responseBody?.error?.details || error.responseBody || undefined,
    });
  }
});

/**
 * DELETE /locations/:locationId
 * Deletes an existing location.
 */
router.delete('/:locationId', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const locationIdParam = req.params.locationId;

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({
        error: 'UNAUTHENTICATED',
        message: 'Not authenticated. Please login first.',
        loginUrl: '/auth/google',
      });
    }

    let locationName = locationIdParam;
    locationName = decodeURIComponent(locationName);
    if (!locationName.startsWith('locations/')) {
      locationName = `locations/${locationName}`;
    }

    console.log(`[${new Date().toISOString()}] Deleting location: ${locationName}`);
    await googleService.deleteLocation(locationName);

    res.json({
      success: true,
      message: `Location ${locationName} successfully deleted.`,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error deleting location:`, error.message);
    let statusCode = 500;
    let errorType = 'UNKNOWN_ERROR';
    if (error.message.includes('No access token')) { statusCode = 401; errorType = 'UNAUTHENTICATED'; }
    else if (error.message.includes('Insufficient permissions')) { statusCode = 403; errorType = 'INSUFFICIENT_SCOPE'; }
    else if (error.message.includes('not found')) { statusCode = 404; errorType = 'NOT_FOUND'; }

    res.status(statusCode).json({
      error: errorType,
      message: error.message,
      details: error.responseBody?.error?.details || error.responseBody || undefined,
    });
  }
});

/**
 * POST /locations/:locationId/posts
 * Creates a local post for a location
 */
router.post('/:locationId/posts', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const locationIdParam = req.params.locationId;
    const { accountId, postData } = req.body;

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Not authenticated.' });
    }
    if (!accountId) {
      return res.status(400).json({ error: 'MISSING_ACCOUNT_ID', message: 'accountId is required.' });
    }
    if (!postData) {
      return res.status(400).json({ error: 'MISSING_POST_DATA', message: 'postData is required.' });
    }

    let locationName = decodeURIComponent(locationIdParam);
    if (!locationName.startsWith('locations/')) {
      locationName = `accounts/${accountId}/locations/${locationName}`;
    }

    const result = await googleService.createPost(locationName, postData);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error creating post:`, error.message);
    res.status(500).json({ error: 'UNKNOWN_ERROR', message: error.message, details: error.responseBody || undefined });
  }
});

/**
 * GET /locations/:locationId/posts
 * Lists local posts for a location
 */
router.get('/:locationId/posts', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const locationIdParam = req.params.locationId;
    const { accountId, pageToken } = req.query;

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Not authenticated.' });
    }
    if (!accountId) {
      return res.status(400).json({ error: 'MISSING_ACCOUNT_ID', message: 'accountId query param is required.' });
    }

    let locationName = decodeURIComponent(locationIdParam);
    if (!locationName.startsWith('locations/')) {
      locationName = `accounts/${accountId}/locations/${locationName}`;
    }

    const options = pageToken ? { pageToken } : undefined;
    const result = await googleService.listPosts(locationName, options);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error listing posts:`, error.message);
    res.status(500).json({ error: 'UNKNOWN_ERROR', message: error.message, details: error.responseBody || undefined });
  }
});

/**
 * GET /locations/:locationId/posts/:postId
 * Gets a specific local post
 */
router.get('/:locationId/posts/:postId', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const locationIdParam = req.params.locationId;
    const postIdParam = req.params.postId;
    const { accountId } = req.query;

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Not authenticated.' });
    }
    if (!accountId) {
      return res.status(400).json({ error: 'MISSING_ACCOUNT_ID', message: 'accountId query param is required.' });
    }

    let locationName = decodeURIComponent(locationIdParam);
    if (!locationName.startsWith('locations/')) {
      locationName = `accounts/${accountId}/locations/${locationName}`;
    }

    const result = await googleService.getPost(locationName, postIdParam);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error getting post:`, error.message);
    res.status(500).json({ error: 'UNKNOWN_ERROR', message: error.message, details: error.responseBody || undefined });
  }
});

/**
 * PATCH /locations/:locationId/posts/:postId
 * Updates a specific local post
 */
router.patch('/:locationId/posts/:postId', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const locationIdParam = req.params.locationId;
    const postIdParam = req.params.postId;
    const { accountId, postData, updateMask } = req.body;

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Not authenticated.' });
    }
    if (!accountId) {
      return res.status(400).json({ error: 'MISSING_ACCOUNT_ID', message: 'accountId is required.' });
    }
    if (!postData || !updateMask) {
      return res.status(400).json({ error: 'MISSING_DATA', message: 'postData and updateMask are required.' });
    }

    let locationName = decodeURIComponent(locationIdParam);
    if (!locationName.startsWith('locations/')) {
      locationName = `accounts/${accountId}/locations/${locationName}`;
    }

    const result = await googleService.patchPost(locationName, postIdParam, postData, updateMask);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error patching post:`, error.message);
    res.status(500).json({ error: 'UNKNOWN_ERROR', message: error.message, details: error.responseBody || undefined });
  }
});

/**
 * DELETE /locations/:locationId/posts/:postId
 * Deletes a specific local post
 */
router.delete('/:locationId/posts/:postId', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const locationIdParam = req.params.locationId;
    const postIdParam = req.params.postId;
    const { accountId } = req.body;

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Not authenticated.' });
    }
    if (!accountId) {
      return res.status(400).json({ error: 'MISSING_ACCOUNT_ID', message: 'accountId is required in body.' });
    }

    let locationName = decodeURIComponent(locationIdParam);
    if (!locationName.startsWith('locations/')) {
      locationName = `accounts/${accountId}/locations/${locationName}`;
    }

    await googleService.deletePost(locationName, postIdParam);
    res.json({ success: true, data: { deleted: true } });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error deleting post:`, error.message);
    res.status(500).json({ error: 'UNKNOWN_ERROR', message: error.message, details: error.responseBody || undefined });
  }
});

/**
 * POST /locations/:locationId/posts/bulk
 * Creates multiple local posts for a location in a loop
 */
router.post('/:locationId/posts/bulk', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const locationIdParam = req.params.locationId;
    const { accountId, posts } = req.body;

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Not authenticated.' });
    }
    if (!accountId) {
      return res.status(400).json({ error: 'MISSING_ACCOUNT_ID', message: 'accountId is required.' });
    }
    if (!posts || !Array.isArray(posts)) {
      return res.status(400).json({ error: 'MISSING_POSTS_DATA', message: 'posts array is required.' });
    }

    let locationName = decodeURIComponent(locationIdParam);
    if (!locationName.startsWith('locations/')) {
      locationName = `accounts/${accountId}/locations/${locationName}`;
    }

    const results = [];
    for (const postData of posts) {
      try {
        const result = await googleService.createPost(locationName, postData);
        results.push({ success: true, post: result });
      } catch (err) {
        results.push({ success: false, error: err.message, details: err.responseBody || undefined });
      }
    }

    res.json({ success: true, data: results });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error creating bulk posts:`, error.message);
    res.status(500).json({ error: 'UNKNOWN_ERROR', message: error.message, details: error.responseBody || undefined });
  }
});

module.exports = router;
