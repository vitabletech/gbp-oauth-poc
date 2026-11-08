require('dotenv').config();
const { GBPClient, FileTokenStorage } = require('@vitabletech/gbp-sdk');
const path = require('path');
const fs = require('fs');

const isServerless = Boolean(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME);
const TOKENS_FILE = isServerless
  ? path.join('/tmp', 'gbp-token.json')
  : path.join(__dirname, '../data/gbp-token.json');

// Ensure token file directory exists
try {
  const dir = path.dirname(TOKENS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (isServerless && !fs.existsSync(TOKENS_FILE)) {
    const defaultDataFile = path.join(__dirname, '../data/gbp-token.json');
    if (fs.existsSync(defaultDataFile)) {
      fs.copyFileSync(defaultDataFile, TOKENS_FILE);
    }
  }
} catch (e) {
  console.warn('Could not initialize token directory:', e.message);
}

const tokenStorage = new FileTokenStorage(TOKENS_FILE);

const DEFAULT_CREDENTIALS = {
  clientId: process.env.GOOGLE_CLIENT_ID || '',
  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  redirectUri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback',
};

let activeCredentials = { ...DEFAULT_CREDENTIALS };
let clientInstance = null;

const setCredentials = (creds = {}) => {
  if (creds.clientId) activeCredentials.clientId = String(creds.clientId).trim();
  if (creds.clientSecret) activeCredentials.clientSecret = String(creds.clientSecret).trim();
  if (creds.redirectUri) activeCredentials.redirectUri = String(creds.redirectUri).trim();
  clientInstance = null;
  return { ...activeCredentials };
};

const getCredentials = () => {
  return { ...activeCredentials };
};

const clearTokens = async () => {
  try {
    if (fs.existsSync(TOKENS_FILE)) {
      fs.unlinkSync(TOKENS_FILE);
    }
    clientInstance = null;
    return true;
  } catch (e) {
    console.error('Error clearing tokens:', e.message);
    return false;
  }
};

const getClient = (customCreds = null) => {
  const creds = customCreds || activeCredentials;
  const clientId = creds.clientId;
  const clientSecret = creds.clientSecret;
  const redirectUri = creds.redirectUri || 'http://localhost:3000/auth/google/callback';

  if (
    !clientId ||
    !clientSecret ||
    clientId === 'your_client_id_here' ||
    clientSecret === 'your_client_secret_here'
  ) {
    throw new Error(
      'Google OAuth credentials (GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET) are missing or set to placeholder values. Please configure valid OAuth credentials in the frontend UI or .env file.'
    );
  }

  if (customCreds) {
    return new GBPClient({
      clientId,
      clientSecret,
      redirectUri,
      tokenStorage,
      enableQuotaAccess: true,
    });
  }

  if (!clientInstance) {
    clientInstance = new GBPClient({
      clientId,
      clientSecret,
      redirectUri,
      tokenStorage,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      enableQuotaAccess: true,
    });
  }
  return clientInstance;
};

const client = new Proxy(
  {},
  {
    get(_target, prop) {
      const instance = getClient();
      const value = instance[prop];
      if (typeof value === 'function') {
        return value.bind(instance);
      }
      return value;
    },
  }
);

const generateAuthUrl = (customCreds = null) => {
  const creds = { ...activeCredentials, ...(customCreds || {}) };
  // Encode credentials into state so the OAuth callback is stateless and works reliably on Netlify
  const stateData = {
    clientId: creds.clientId,
    clientSecret: creds.clientSecret,
    redirectUri: creds.redirectUri,
    timestamp: Date.now(),
  };
  const state = Buffer.from(JSON.stringify(stateData)).toString('base64url');
  const clientForAuth = getClient(creds);
  return clientForAuth.getAuthorizationUrl(undefined, state);
};

const handleCallback = async (code, state = null) => {
  let targetCreds = activeCredentials;
  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, 'base64url').toString('utf-8'));
      if (decoded.clientId && decoded.clientSecret) {
        targetCreds = {
          clientId: decoded.clientId,
          clientSecret: decoded.clientSecret,
          redirectUri: decoded.redirectUri || activeCredentials.redirectUri,
        };
        setCredentials(targetCreds);
      }
    } catch (e) {
      console.warn('Could not decode state param:', e.message);
    }
  }

  const clientToUse = getClient(targetCreds);
  if (typeof clientToUse.processAuthCode === 'function') {
    return await clientToUse.processAuthCode(code);
  }
  if (typeof clientToUse.handleAuthorizationCode === 'function') {
    return await clientToUse.handleAuthorizationCode(code);
  }
  throw new Error('GBPClient does not support processAuthCode or handleAuthorizationCode');
};

const getTokens = async () => {
  let accessToken = await tokenStorage.getToken();
  let refreshToken = '';
  try{
    refreshToken = await tokenStorage.getRefreshToken();
  }catch(e){
    throw new Error('Token has been expired or revoked.');
  }
  return { accessToken, refreshToken };
};

const getTokenFileStatus = async () => {
  const { accessToken, refreshToken } = await getTokens();
  return {
    accessToken,
    refreshToken
  };
};

const getAccounts = async () => {
  const accounts = await client.accounts.listAll();
  return { accounts };
};

let locationPaginator = null;

const getLocations = async (accountIdOrName) => {
  if (!locationPaginator) {
    locationPaginator = client.locations.listPaginator(accountIdOrName, { pageSize: 10 });
  }
  const locations = await locationPaginator.next();
  console.log('locations:: ', locations);
  return { 
    locations,
    hasMore: locationPaginator.hasMore
  };
};

/**
 * Automatically fetches all locations for a given account ID/Name.
 */
const listAllLocations = async (accountIdOrName, readMask) => {
  return client.locations.listAll(accountIdOrName, readMask);
};

let reviewPaginator = null;

const getReviews = async (accountIdOrName, locationIdOrName) => {
  if (!reviewPaginator) {
    reviewPaginator = client.reviews.listPaginator(accountIdOrName, locationIdOrName, { pageSize: 10 });
  }
  const reviews = await reviewPaginator.next();
  return { 
    reviews,
    hasMore: reviewPaginator.hasMore
  };
};

  /**
   * Gets a specific location by name.
   */
  const getLocationByLocationName = async (locationName, readMask) => {
    const options = readMask ? { readMask } : {};
    const location = await client.locations.get(locationName, options);
    return location;
  }
  /**
   * Creates a new location.
   */
  const createLocation = async (accountIdOrName, locationData, options) => {
    const location = await client.locations.create(accountIdOrName, locationData, options);
    return location;
  }

  /**
   * Updates an existing location.
   */
  const updateLocation = async (locationId, data, updateMask) => {
    return client.locations.patch(locationId, data, updateMask);
  }

  /**
   * Deletes a location.
   */
  const deleteLocation = async (locationId) => {
    return client.locations.delete(locationId);
  }

  /**
   * Gets a list of business categories.
   */
  const getCategories = async (options) => {
    return client.categories.list(options);
  }

  /**
   * Searches for business categories.
   */
  const searchCategories = async (options) => {
    return client.categories.search(options);
  }

  /**
   * Creates media for a location using the native SDK.
   */
  const createMedia = async (accountId, locationId, mediaData) => {
    return client.media.create(accountId, locationId, mediaData);
  }

  /**
   * Uploads bulk media for a location using the native SDK.
   */
  const bulkCreateMedia = async (accountId, locationId, mediaItems) => {
    return client.media.bulkCreate(accountId, locationId, mediaItems);
  }

  /**
   * Updates an existing media item for a location using the native SDK.
   */
  const patchMedia = async (accountId, locationId, mediaKey, data, updateMask) => {
    return client.media.patch(accountId, locationId, mediaKey, data, updateMask);
  }

  /**
   * Gets media for a location using the native SDK.
   */
  const getMedia = async (accountId, locationId) => {
    return client.media.list(accountId, locationId);
  }

  /**
   * Gets a specific media item by mediaKey using native SDK.
   */
  const getMediaItem = async (accountId, locationId, mediaKey) => {
    return client.media.get(accountId, locationId, mediaKey);
  }

  /**
   * Deletes a specific media item by mediaKey using native SDK.
   */
  const deleteMedia = async (accountId, locationId, mediaKey) => {
    return client.media.delete(accountId, locationId, mediaKey);
  }

  /**
   * Fetches performance metrics for a location using native SDK.
   */
  const fetchMultiDailyMetricsTimeSeries = async (locationId, request) => {
    return client.metrics.fetchMultiDailyMetricsTimeSeries(locationId, request);
  }

  /**
   * Fetches daily metrics time series for a location using native SDK.
   */
  const getDailyMetricsTimeSeries = async (locationId, request) => {
    return client.metrics.getDailyMetricsTimeSeries(locationId, request);
  }

  /**
   * Fetches monthly search keywords impressions for a location using native SDK.
   */
  const listSearchKeywordsImpressionsMonthly = async (locationId, request) => {
    return client.metrics.listSearchKeywordsImpressionsMonthly(locationId, request);
  }

  /**
   * Automatically fetches all monthly search keywords impressions across all pages.
   */
  const listAllSearchKeywordsImpressionsMonthly = async (locationId, request) => {
    return client.metrics.listAllSearchKeywordsImpressionsMonthly(locationId, request);
  }

  const fetchVerificationOptions = async (locationId, request) => {
    return client.verifications.fetchVerificationOptions(locationId, request);
  }

  const verifyLocation = async (locationId, request) => {
    return client.verifications.verify(locationId, request);
  }

  const completeVerification = async (locationId, verificationId, request) => {
    return client.verifications.complete(locationId, verificationId, request);
  }

  const getVoiceOfMerchantState = async (locationId) => {
    return client.verifications.getVoiceOfMerchantState(locationId);
  }

  const listVerifications = async (locationId) => {
    return client.verifications.list(locationId);
  }

  const searchChains = async (query, pageSize) => {
    return client.chains.search(query, pageSize);
  }

  const getChain = async (chainId) => {
    return client.chains.get(chainId);
  }

  const formatPostParent = (accountIdOrParent, locationId) => {
    if (!locationId) return accountIdOrParent;
    const acc = accountIdOrParent.startsWith('accounts/') ? accountIdOrParent : `accounts/${accountIdOrParent}`;
    const loc = locationId.startsWith('locations/') ? locationId : `locations/${locationId}`;
    return `${acc}/${loc}`;
  };

  /**
   * Creates a local post for a location.
   */
  const createPost = async (accountIdOrParent, locationIdOrData, data) => {
    if (data === undefined) {
      return client.posts.create(accountIdOrParent, locationIdOrData);
    }
    const parent = formatPostParent(accountIdOrParent, locationIdOrData);
    return client.posts.create(parent, data);
  };

  /**
   * Lists local posts for a location.
   */
  const listPosts = async (accountIdOrParent, locationIdOrOptions, options) => {
    if (typeof locationIdOrOptions === 'object' || locationIdOrOptions === undefined) {
      return client.posts.list(accountIdOrParent, locationIdOrOptions);
    }
    const parent = formatPostParent(accountIdOrParent, locationIdOrOptions);
    return client.posts.list(parent, options);
  };

  /**
   * Gets a specific local post.
   */
  const getPost = async (accountIdOrParent, locationIdOrPostId, postId) => {
    if (postId === undefined) {
      return client.posts.get(accountIdOrParent, locationIdOrPostId);
    }
    const parent = formatPostParent(accountIdOrParent, locationIdOrPostId);
    return client.posts.get(parent, postId);
  };

  /**
   * Updates an existing local post.
   */
  const patchPost = async (accountIdOrParent, locationIdOrPostId, postIdOrData, dataOrMask, updateMask) => {
    if (updateMask === undefined && typeof dataOrMask === 'string') {
      return client.posts.patch(accountIdOrParent, locationIdOrPostId, postIdOrData, dataOrMask);
    }
    const parent = formatPostParent(accountIdOrParent, locationIdOrPostId);
    return client.posts.patch(parent, postIdOrData, dataOrMask, updateMask);
  };

  /**
   * Deletes a local post.
   */
  const deletePost = async (accountIdOrParent, locationIdOrPostId, postId) => {
    if (postId === undefined) {
      return client.posts.delete(accountIdOrParent, locationIdOrPostId);
    }
    const parent = formatPostParent(accountIdOrParent, locationIdOrPostId);
    return client.posts.delete(parent, postId);
  };

  /**
   * Gets attributes for a location using native SDK.
   */
  const getAttributes = async (locationId) => {
    return client.locations.getAttributes(locationId);
  }

  /**
   * Updates attributes for a location using native SDK.
   */
  const updateAttributes = async (locationId, attributesData, attributeMask) => {
    return client.locations.patchAttributes(locationId, attributesData, attributeMask);
  }

  /**
   * Replies to a review using native SDK.
   */
  const replyReview = async (accountId, locationId, reviewId, reply) => {
    return client.reviews.reply(accountId, locationId, reviewId, reply);
  }

  /**
   * Retrieves service items for a location.
   */
  const getServiceItems = async (locationId) => {
    return client.locations.getServiceItems(locationId);
  }

  /**
   * Updates service items for a location.
   */
  const updateServiceItems = async (locationId, serviceItems) => {
    return client.locations.updateServiceItems(locationId, serviceItems);
  }

  /**
   * Retrieves metadata for a location.
   */
  const getMetadata = async (locationId) => {
    return client.locations.getMetadata(locationId);
  }

  /**
   * Automatically prepares and updates attributes for a location.
   */
  const updateLocationAttributes = async (locationId, attributes) => {
    return client.attributes.updateLocationAttributes(locationId, attributes);
  }

  /**
   * Specifically sets the WhatsApp URL for a location.
   */
  const updateWhatsAppUrl = async (locationId, whatsappUrl) => {
    return client.attributes.updateWhatsAppUrl(locationId, whatsappUrl);
  }

  const updateFacebookUrl = async (locationId, url) => {
    return client.attributes.updateFacebookUrl(locationId, url);
  }

  const updateInstagramUrl = async (locationId, url) => {
    return client.attributes.updateInstagramUrl(locationId, url);
  }

  const updateLinkedInUrl = async (locationId, url) => {
    return client.attributes.updateLinkedInUrl(locationId, url);
  }

  const updatePinterestUrl = async (locationId, url) => {
    return client.attributes.updatePinterestUrl(locationId, url);
  }

  const updateTextMessagingUrl = async (locationId, url) => {
    return client.attributes.updateTextMessagingUrl(locationId, url);
  }

  const updateTikTokUrl = async (locationId, url) => {
    return client.attributes.updateTikTokUrl(locationId, url);
  }

  const updateTwitterUrl = async (locationId, url) => {
    return client.attributes.updateTwitterUrl(locationId, url);
  }

  const updateYouTubeUrl = async (locationId, url) => {
    return client.attributes.updateYouTubeUrl(locationId, url);
  }

  const updatePreferredMessagingService = async (locationId, service) => {
    return client.attributes.updatePreferredMessagingService(locationId, service);
  }

  const getQuotas = async (projectId, service) => {
    return client.quotas.get({ projectId, service });
  }

  const getBusinessInformationQuotas = async (projectId) => {
    return client.quotas.getBusinessInformation(projectId);
  }

  const getAccountManagementQuotas = async (projectId) => {
    return client.quotas.getAccountManagement(projectId);
  }

  const getVerificationsQuotas = async (projectId) => {
    return client.quotas.getVerifications(projectId);
  }

  const getQAndAQuotas = async (projectId) => {
    return client.quotas.getQAndA(projectId);
  }

  const getLodgingQuotas = async (projectId) => {
    return client.quotas.getLodging(projectId);
  }

  const getPlaceActionsQuotas = async (projectId) => {
    return client.quotas.getPlaceActions(projectId);
  }

  const getLegacyQuotas = async (projectId) => {
    return client.quotas.getLegacy(projectId);
  }

  const getPerformanceQuotas = async (projectId) => {
    return client.quotas.getPerformance(projectId);
  }

module.exports = {
  setCredentials,
  getCredentials,
  clearTokens,
  getBusinessInformationQuotas,
  getAccountManagementQuotas,
  getVerificationsQuotas,
  getQAndAQuotas,
  getLodgingQuotas,
  getPlaceActionsQuotas,
  getLegacyQuotas,
  getPerformanceQuotas,

  generateAuthUrl,
  getTokens,
  handleCallback,
  getTokenFileStatus,
  getAccounts,
  getLocations,
  listAllLocations,
  getReviews,
  getLocationByLocationName,
  createLocation,
  updateLocation,
  deleteLocation,
  getCategories,
  searchCategories,
  createMedia,
  createPost,
  listPosts,
  getPost,
  patchPost,
  deletePost,
  getAttributes,
  updateAttributes,
  replyReview,
  getMedia,
  getMediaItem,
  bulkCreateMedia,
  patchMedia,
  deleteMedia,
  fetchMultiDailyMetricsTimeSeries,
  getDailyMetricsTimeSeries,
  listSearchKeywordsImpressionsMonthly,
  listAllSearchKeywordsImpressionsMonthly,
  fetchVerificationOptions,
  getVoiceOfMerchantState,
  verifyLocation,
  completeVerification,
  listVerifications,
  searchChains,
  getChain,
  getServiceItems,
  updateServiceItems,
  getMetadata,
  updateLocationAttributes,
  updateWhatsAppUrl,
  updateFacebookUrl,
  updateInstagramUrl,
  updateLinkedInUrl,
  updatePinterestUrl,
  updateTextMessagingUrl,
  updateTikTokUrl,
  updateTwitterUrl,
  updateYouTubeUrl,
  updatePreferredMessagingService,
  getQuotas,
};
