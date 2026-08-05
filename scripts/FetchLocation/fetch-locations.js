const fs = require('fs');
const path = require('path');
const googleService = require('../../services/google');
const setupLogger = require('../../utils/logger-setup');

const DEFAULT_READ_MASK =
  'name,languageCode,storeCode,title,phoneNumbers,categories,storefrontAddress,websiteUri,regularHours,specialHours,serviceArea,labels,adWordsLocationExtensions,latlng,openInfo,metadata,profile,relationshipData,moreHours';

const getArgValue = (flag) => {
  const match = process.argv.slice(2).find((a) => a.startsWith(flag + '='));
  if (match) return match.split('=')[1];
  return undefined;
};

/**
 * Loads account IDs from a text file (one account per line).
 * Ignores empty lines and comments starting with '#' or '//'.
 */
const loadAccountsFromFile = (filePath) => {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  return content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith('#') && !line.startsWith('//'));
};

async function main() {
  const outputFile =
    getArgValue('--outputFile') ||
    process.env.OUTPUT_FILE ||
    path.join(__dirname, '../../data/fetched-locations.json');

  const customAccountsArg = getArgValue('--accounts') || process.env.ACCOUNTS;
  const accountsFileArg =
    getArgValue('--accountsFile') ||
    process.env.ACCOUNTS_FILE ||
    path.join(__dirname, 'input/target-accounts.txt');

  let accountsToFetch = [];
  let accountsSource = '';

  if (customAccountsArg) {
    accountsToFetch = customAccountsArg.split(',').map((a) => a.trim());
    accountsSource = 'CLI --accounts argument';
  } else {
    const fileAccounts = loadAccountsFromFile(accountsFileArg);
    if (fileAccounts && fileAccounts.length > 0) {
      accountsToFetch = fileAccounts;
      accountsSource = `File: ${path.resolve(accountsFileArg)}`;
    } else {
      console.error(`❌ Accounts file not found at: ${accountsFileArg}`);
      process.exit(1);
    }
  }

  const readMask = getArgValue('--readMask') || process.env.READ_MASK || DEFAULT_READ_MASK;
  const format = getArgValue('--format') || process.env.FORMAT || 'object'; // 'object' or 'array'

  const { structuredLogger, LOG_DIR } = setupLogger({
    logBaseName: 'fetch-locations-logs',
  });

  console.log(`=======================================================`);
  console.log(`📡 Starting GBP Fetch Locations Script`);
  console.log(`=======================================================`);
  console.log(`📅 Timestamp       : ${new Date().toISOString()}`);
  console.log(`📄 Accounts Source : ${accountsSource}`);
  console.log(`🏢 Target Accounts : ${accountsToFetch.length}`);
  console.log(`📁 Output File     : ${path.resolve(outputFile)}`);
  console.log(`📂 Log Directory   : ${LOG_DIR}`);
  console.log(`🎨 Output Format   : ${format}`);
  console.log(`=======================================================\n`);

  const startTime = Date.now();
  const resultMap = {};
  const summaryDetails = [];
  let totalLocationsFetched = 0;
  let successAccounts = 0;
  let failedAccounts = 0;

  for (const accountName of accountsToFetch) {
    const formattedAccountName = accountName.startsWith('accounts/')
      ? accountName
      : `accounts/${accountName}`;

    console.log(`🔍 Fetching locations for account: [${formattedAccountName}]...`);
    const accountStartTime = Date.now();

    try {
      const locationsList = await googleService.listAllLocations(formattedAccountName, readMask);
      const durationMs = Date.now() - accountStartTime;

      const locCount = Array.isArray(locationsList) ? locationsList.length : 0;
      totalLocationsFetched += locCount;
      successAccounts++;

      console.log(`   ✅ Fetched ${locCount} locations in ${durationMs}ms`);

      if (format === 'array') {
        resultMap[formattedAccountName] = locationsList || [];
      } else {
        const locationsMap = {};
        if (Array.isArray(locationsList)) {
          for (const loc of locationsList) {
            const locKey = loc.name || `locations/${loc.storeCode || Math.random().toString(36).substring(7)}`;
            locationsMap[locKey] = loc;
          }
        }
        resultMap[formattedAccountName] = locationsMap;
      }

      const logEntry = {
        accountName: formattedAccountName,
        status: 'SUCCESS',
        locationCount: locCount,
        durationMs,
      };

      structuredLogger.raw({
        ...logEntry,
        locations: locationsList,
      });
      structuredLogger.summaryLine(logEntry);
      summaryDetails.push(logEntry);
    } catch (err) {
      const durationMs = Date.now() - accountStartTime;
      failedAccounts++;
      console.error(`   ❌ Failed to fetch locations for [${formattedAccountName}] in ${durationMs}ms:`, err.message);

      resultMap[formattedAccountName] = format === 'array' ? [] : {};

      const errorDetails = {
        message: err.message,
        code: err.code || err.status,
        status: err.status || (err.response && err.response.status),
        stack: err.stack,
      };

      const logEntry = {
        accountName: formattedAccountName,
        status: 'FAILED',
        locationCount: 0,
        error: errorDetails,
        durationMs,
      };

      structuredLogger.raw(logEntry);
      structuredLogger.summaryLine({
        accountName: formattedAccountName,
        status: 'FAILED',
        error: err.message,
        durationMs,
      });
      summaryDetails.push(logEntry);
    }
  }

  const outputDir = path.dirname(path.resolve(outputFile));
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, JSON.stringify(resultMap, null, 2), 'utf8');
  console.log(`\n💾 Saved fetched location data to: ${path.resolve(outputFile)}`);

  const totalDurationMs = Date.now() - startTime;

  const finalSummary = {
    status: failedAccounts === 0 ? 'SUCCESS' : 'COMPLETED_WITH_ERRORS',
    startTime: new Date(startTime).toISOString(),
    endTime: new Date().toISOString(),
    durationMs: totalDurationMs,
    summaryStats: {
      totalAccounts: accountsToFetch.length,
      successAccounts,
      failedAccounts,
      totalLocationsFetched,
    },
    outputFile: path.resolve(outputFile),
    logDirectory: LOG_DIR,
    details: summaryDetails,
  };

  structuredLogger.writeSummaryFile(finalSummary);

  console.log(`\n=======================================================`);
  console.log(`📊 FETCH SUMMARY`);
  console.log(`=======================================================`);
  console.log(`Total Accounts Processed : ${accountsToFetch.length}`);
  console.log(`Successful Accounts      : ${successAccounts} ✅`);
  console.log(`Failed Accounts          : ${failedAccounts} ❌`);
  console.log(`Total Locations Fetched  : ${totalLocationsFetched}`);
  console.log(`Total Time Taken         : ${(totalDurationMs / 1000).toFixed(2)} seconds`);
  console.log(`Data Saved To            : ${path.resolve(outputFile)}`);
  console.log(`Log Directory            : ${LOG_DIR}`);
  console.log(`=======================================================\n`);
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
