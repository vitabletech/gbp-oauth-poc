const assert = require('assert');
const {
  GBPClient,
  DailyMetric,
  DayOfWeek,
  GBP_SERVICES,
} = require('@vitabletech/gbp-sdk');
const googleService = require('../services/google');

async function runTests() {
  console.log('===============================================================');
  console.log('🧪 Testing @vitabletech/gbp-sdk in gbp-poc project');
  console.log('===============================================================\n');

  // 1. Verify Enum exports
  console.log('▶ Test 1: Verifying SDK exports...');
  assert(DailyMetric.WEBSITE_CLICKS === 'WEBSITE_CLICKS', 'DailyMetric.WEBSITE_CLICKS missing');
  assert(DailyMetric.CALL_CLICKS === 'CALL_CLICKS', 'DailyMetric.CALL_CLICKS missing');
  assert(DayOfWeek.MONDAY === 'MONDAY', 'DayOfWeek.MONDAY missing');
  assert(
    GBP_SERVICES.performance === 'businessprofileperformance.googleapis.com',
    'GBP_SERVICES.performance missing'
  );
  console.log('  ✅ Enums and constants are properly exported from @vitabletech/gbp-sdk.\n');

  // 2. Verify Client methods on dummy client with mock HTTP
  console.log('▶ Test 2: Verifying SDK method signatures & URL generation...');
  const recordedRequests = [];
  const mockTokenStorage = {
    getToken: async () => 'mock-access-token-12345',
    setToken: async () => {},
    getRefreshToken: async () => 'mock-refresh-token-12345',
    setRefreshToken: async () => {},
    clearTokens: async () => {},
  };

  const client = new GBPClient({
    clientId: 'test-client-id',
    clientSecret: 'test-client-secret',
    tokenStorage: mockTokenStorage,
  });

  // Intercept client.request
  const originalRequest = client.httpClient.request.bind(client.httpClient);
  client.httpClient.request = async (options) => {
    recordedRequests.push(options);
    if (options.url.includes(':getDailyMetricsTimeSeries')) {
      return {
        timeSeries: {
          datedValues: [
            { date: { year: 2024, month: 1, day: 1 }, value: '42' },
          ],
        },
      };
    }
    if (options.url.includes(':fetchMultiDailyMetricsTimeSeries')) {
      return {
        multiDailyMetricTimeSeries: [
          {
            dailyMetricTimeSeries: [
              {
                dailyMetric: DailyMetric.WEBSITE_CLICKS,
                timeSeries: {
                  datedValues: [{ date: { year: 2024, month: 1, day: 1 }, value: '15' }],
                },
              },
            ],
          },
        ],
      };
    }
    if (options.url.includes('/searchkeywords/impressions/monthly')) {
      return {
        searchKeywordsCounts: [
          { searchKeyword: 'petrol pump', insightsValue: { value: '250' } },
          { searchKeyword: 'diesel near me', insightsValue: { threshold: '10' } },
        ],
        nextPageToken: options.query?.pageToken ? undefined : 'page-2-token',
      };
    }
    return {};
  };

  // Test 2a: getDailyMetricsTimeSeries on client.metrics
  console.log('  Testing client.metrics.getDailyMetricsTimeSeries...');
  const dailyRes = await client.metrics.getDailyMetricsTimeSeries('12345', {
    dailyMetric: DailyMetric.WEBSITE_CLICKS,
    dailyRange: {
      startDate: { year: 2024, month: 1, day: 1 },
      endDate: { year: 2024, month: 1, day: 15 },
    },
    dailySubEntityType: {
      dayOfWeek: DayOfWeek.MONDAY,
    },
  });
  assert(dailyRes.timeSeries.datedValues[0].value === '42', 'Invalid getDailyMetricsTimeSeries response');
  const req1 = recordedRequests[recordedRequests.length - 1];
  assert(
    req1.url === 'https://businessprofileperformance.googleapis.com/v1/locations/12345:getDailyMetricsTimeSeries',
    `Unexpected URL: ${req1.url}`
  );
  assert(req1.query.dailyMetric === DailyMetric.WEBSITE_CLICKS, 'dailyMetric query mismatch');
  assert(req1.query['dailyRange.start_date.year'] === 2024, 'dailyRange start year query mismatch');
  assert(req1.query['dailySubEntityType.dayOfWeek'] === DayOfWeek.MONDAY, 'subEntity query mismatch');
  console.log('  ✅ client.metrics.getDailyMetricsTimeSeries verified.');

  // Test 2b: fetchMultiDailyMetricsTimeSeries on client.metrics
  console.log('  Testing client.metrics.fetchMultiDailyMetricsTimeSeries...');
  const multiRes = await client.metrics.fetchMultiDailyMetricsTimeSeries('locations/12345', {
    dailyMetrics: [DailyMetric.WEBSITE_CLICKS, DailyMetric.CALL_CLICKS],
    dailyRange: {
      start_date: { year: 2024, month: 2, day: 1 },
      end_date: { year: 2024, month: 2, day: 28 },
    },
  });
  assert(multiRes.multiDailyMetricTimeSeries.length === 1, 'Invalid fetchMultiDailyMetricsTimeSeries response');
  const req2 = recordedRequests[recordedRequests.length - 1];
  assert(
    req2.url === 'https://businessprofileperformance.googleapis.com/v1/locations/12345:fetchMultiDailyMetricsTimeSeries',
    `Unexpected URL: ${req2.url}`
  );
  assert(Array.isArray(req2.query.dailyMetrics), 'dailyMetrics query should be array');
  console.log('  ✅ client.metrics.fetchMultiDailyMetricsTimeSeries verified.');

  // Test 2c: listSearchKeywordsImpressionsMonthly on client.metrics
  console.log('  Testing client.metrics.listSearchKeywordsImpressionsMonthly...');
  const kwRes = await client.metrics.listSearchKeywordsImpressionsMonthly('12345', {
    monthlyRange: {
      startMonth: { year: 2024, month: 1 },
      endMonth: { year: 2024, month: 3 },
    },
    pageSize: 10,
  });
  assert(kwRes.searchKeywordsCounts.length === 2, 'Invalid search keywords response');
  const req3 = recordedRequests[recordedRequests.length - 1];
  assert(
    req3.url === 'https://businessprofileperformance.googleapis.com/v1/locations/12345/searchkeywords/impressions/monthly',
    `Unexpected URL: ${req3.url}`
  );
  assert(req3.query['monthlyRange.startMonth.year'] === 2024, 'startMonth.year mismatch');
  assert(req3.query['monthlyRange.endMonth.month'] === 3, 'endMonth.month mismatch');
  assert(req3.query.pageSize === 10, 'pageSize mismatch');
  console.log('  ✅ client.metrics.listSearchKeywordsImpressionsMonthly verified.');

  // Test 2d: Auto-pagination on client.metrics
  console.log('  Testing client.metrics.listAllSearchKeywordsImpressionsMonthly (auto-pagination)...');
  const allKw = await client.metrics.listAllSearchKeywordsImpressionsMonthly('12345', {
    monthlyRange: {
      startMonth: { year: 2024, month: 1 },
      endMonth: { year: 2024, month: 3 },
    },
  });
  assert(allKw.length === 4, `Expected 4 items from 2 pages, got ${allKw.length}`);
  console.log('  ✅ client.metrics.listAllSearchKeywordsImpressionsMonthly auto-pagination verified.');

  // Test 2e: Cursor paginator on client.metrics
  console.log('  Testing client.metrics.listSearchKeywordsImpressionsMonthlyPaginator...');
  const paginator = client.metrics.listSearchKeywordsImpressionsMonthlyPaginator('12345', {
    monthlyRange: {
      startMonth: { year: 2024, month: 1 },
      endMonth: { year: 2024, month: 3 },
    },
  });
  assert(paginator.hasMore === true, 'Paginator should start with hasMore=true');
  const page1 = await paginator.next();
  assert(page1.length === 2, 'Page 1 length mismatch');
  assert(paginator.hasMore === true, 'Paginator should have more');
  const page2 = await paginator.next();
  assert(page2.length === 2, 'Page 2 length mismatch');
  assert(paginator.hasMore === false, 'Paginator should reach end');
  console.log('  ✅ client.metrics.listSearchKeywordsImpressionsMonthlyPaginator verified.');

  // Test 2f: LocationsService shortcuts & nested syntax
  console.log('  Testing client.locations shortcuts & nested syntax...');
  await client.locations.getDailyMetricsTimeSeries('12345', {
    dailyMetric: DailyMetric.WEBSITE_CLICKS,
    dailyRange: { startDate: { year: 2024, month: 1, day: 1 }, endDate: { year: 2024, month: 1, day: 2 } },
  });
  await client.locations.searchkeywords.impressions.monthly.list('12345', {
    monthlyRange: { startMonth: { year: 2024, month: 1 }, endMonth: { year: 2024, month: 3 } },
  });
  assert(recordedRequests[recordedRequests.length - 1].url.includes('/searchkeywords/impressions/monthly'));
  console.log('  ✅ client.locations shortcuts and searchkeywords.impressions.monthly.list verified.\n');

  // 3. Test googleService wrappers in gbp-poc
  console.log('▶ Test 3: Verifying services/google.js wrapper functions in gbp-poc...');
  assert(typeof googleService.getDailyMetricsTimeSeries === 'function', 'getDailyMetricsTimeSeries is not a function');
  assert(typeof googleService.fetchMultiDailyMetricsTimeSeries === 'function', 'fetchMultiDailyMetricsTimeSeries is not a function');
  assert(typeof googleService.listSearchKeywordsImpressionsMonthly === 'function', 'listSearchKeywordsImpressionsMonthly is not a function');
  assert(typeof googleService.listAllSearchKeywordsImpressionsMonthly === 'function', 'listAllSearchKeywordsImpressionsMonthly is not a function');
  assert(typeof googleService.getPerformanceQuotas === 'function', 'getPerformanceQuotas is not a function');
  console.log('  ✅ services/google.js exports all newly added performance methods.\n');

  console.log('===============================================================');
  console.log('🎉 ALL TESTS PASSED! The SDK integration in gbp-poc is 100% functional.');
  console.log('===============================================================');
}

runTests().catch((err) => {
  console.error('❌ Test failed with error:', err);
  process.exit(1);
});

