const express = require('express');
const router = express.Router();
const googleService = require('../services/google');

/**
 * GET /chains
 * Searches for chains by name
 */
router.get('/', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const { query, pageSize } = req.query;

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Not authenticated. Please login first.' });
    }

    if (!query) {
      return res.status(400).json({ error: 'MISSING_QUERY', message: 'Please provide a search query as a query parameter (e.g. ?query=Starbucks).' });
    }

    const result = await googleService.searchChains(query, pageSize ? parseInt(pageSize, 10) : undefined);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error searching chains:`, error.message);
    res.status(500).json({ error: 'UNKNOWN_ERROR', message: error.message, details: error.responseBody || undefined });
  }
});

/**
 * GET /chains/:chainId
 * Gets a specific chain by its ID
 */
router.get('/:chainId', async (req, res) => {
  try {
    const tokens = await googleService.getTokens();
    const chainIdParam = req.params.chainId;

    if (!tokens.accessToken && !tokens.refreshToken) {
      return res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Not authenticated. Please login first.' });
    }

    let chainName = decodeURIComponent(chainIdParam);
    if (!chainName.startsWith('chains/')) chainName = `chains/${chainName}`;

    const result = await googleService.getChain(chainName);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error getting chain:`, error.message);
    res.status(500).json({ error: 'UNKNOWN_ERROR', message: error.message, details: error.responseBody || undefined });
  }
});

module.exports = router;
