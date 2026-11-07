const express = require('express');
const http = require('http');
const assert = require('assert');
const googleService = require('../services/google');

async function testExpressRoutes() {
  console.log('Testing Express endpoints in gbp-poc/routes/locations.js...');

  // Mock googleService methods for route testing
  let calledDaily = false;
  let calledKeywords = false;
  let calledMulti = false;

  googleService.getDailyMetricsTimeSeries = async (loc, payload) => {
    calledDaily = true;
    return { location: loc, payload, success: true };
  };

  googleService.listSearchKeywordsImpressionsMonthly = async (loc, payload) => {
    calledKeywords = true;
    return { location: loc, payload, keywords: ['fuel', 'station'] };
  };

  googleService.fetchMultiDailyMetricsTimeSeries = async (loc, payload) => {
    calledMulti = true;
    return { location: loc, payload, multi: true };
  };

  // Mock tokens
  const originalGetTokens = googleService.getTokens;
  googleService.getTokens = async () => ({ accessToken: 'mock-token', refreshToken: 'mock-refresh' });

  const app = express();
  app.use(express.json());
  const locationsRouter = require('../routes/locations');
  app.use('/locations', locationsRouter);

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}`;

  try {
    // 1. Test GET /locations/:locationId/daily-metrics-time-series
    const res1 = await fetch(
      `${baseUrl}/locations/5306572885782887525/daily-metrics-time-series?dailyMetric=WEBSITE_CLICKS&startYear=2024&startMonth=1&startDay=1&endYear=2024&endMonth=1&endDay=15`
    );
    const data1 = await res1.json();
    assert(res1.status === 200, `Expected 200, got ${res1.status}`);
    assert(calledDaily === true, 'getDailyMetricsTimeSeries was not called');
    assert(data1.success === true, 'Response success should be true');
    console.log('  ✅ GET /locations/:locationId/daily-metrics-time-series works as expected');

    // 2. Test GET /locations/:locationId/searchkeywords/impressions/monthly
    const res2 = await fetch(
      `${baseUrl}/locations/5306572885782887525/searchkeywords/impressions/monthly?startYear=2024&startMonth=1&endYear=2024&endMonth=3&pageSize=10`
    );
    const data2 = await res2.json();
    assert(res2.status === 200, `Expected 200, got ${res2.status}`);
    assert(calledKeywords === true, 'listSearchKeywordsImpressionsMonthly was not called');
    assert(data2.success === true, 'Response success should be true');
    console.log('  ✅ GET /locations/:locationId/searchkeywords/impressions/monthly works as expected');

    // 3. Test GET /locations/:locationId/performance-metrics
    const res3 = await fetch(
      `${baseUrl}/locations/5306572885782887525/performance-metrics?dailyMetrics=WEBSITE_CLICKS&startYear=2024&startMonth=1&startDay=1&endYear=2024&endMonth=1&endDay=15`
    );
    const data3 = await res3.json();
    assert(res3.status === 200, `Expected 200, got ${res3.status}`);
    assert(calledMulti === true, 'fetchMultiDailyMetricsTimeSeries was not called');
    assert(data3.success === true, 'Response success should be true');
    console.log('  ✅ GET /locations/:locationId/performance-metrics works as expected');

    console.log('\n🎉 Express routes testing completed successfully!');
  } finally {
    googleService.getTokens = originalGetTokens;
    await new Promise((resolve) => server.close(resolve));
  }
}

testExpressRoutes().catch((err) => {
  console.error('Express test failed:', err);
  process.exit(1);
});

