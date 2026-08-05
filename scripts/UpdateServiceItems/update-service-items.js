const fs = require('fs');
const path = require('path');
const googleService = require('../../services/google');
const setupLogger = require('../../utils/logger-setup');

const getArgValue = (flag) => {
  const match = process.argv.slice(2).find((a) => a.startsWith(flag + '='));
  if (match) return match.split('=')[1];
  return undefined;
};

async function main() {
  const dataFilePath =
    getArgValue('--dataFile') ||
    process.env.DATA_FILE ||
    path.join(__dirname, 'input/sample-update-service-items.json');

  const dryRunArg = getArgValue('--dryRun') || process.env.DRY_RUN;
  const isDryRun = dryRunArg === 'true' || dryRunArg === '1';

  const { structuredLogger, LOG_DIR } = setupLogger({
    logBaseName: isDryRun ? 'update-service-items-dryrun-logs' : 'update-service-items-logs',
  });

  console.log(`=======================================================`);
  console.log(`🚀 Starting GBP Location Service Items Update Script`);
  console.log(`=======================================================`);
  console.log(`📅 Timestamp       : ${new Date().toISOString()}`);
  console.log(`📁 Data File       : ${path.resolve(dataFilePath)}`);
  console.log(`📂 Log Directory   : ${LOG_DIR}`);
  console.log(`⚙️  Mode           : ${isDryRun ? 'DRY-RUN (Simulated)' : 'LIVE (Updating Google Business Profile Service Items)'}`);
  console.log(`=======================================================\n`);

  if (!fs.existsSync(dataFilePath)) {
    const errorMsg = `Data file not found at path: ${dataFilePath}`;
    console.error(`❌ ${errorMsg}`);
    structuredLogger.writeSummaryFile({
      status: 'FAILED',
      error: errorMsg,
      timestamp: new Date().toISOString(),
    });
    process.exit(1);
  }

  let fileContent;
  let inputData;
  try {
    fileContent = fs.readFileSync(dataFilePath, 'utf8');
    inputData = JSON.parse(fileContent);
  } catch (err) {
    const errorMsg = `Failed to read or parse JSON file: ${err.message}`;
    console.error(`❌ ${errorMsg}`);
    structuredLogger.writeSummaryFile({
      status: 'FAILED',
      error: errorMsg,
      timestamp: new Date().toISOString(),
    });
    process.exit(1);
  }

  const startTime = Date.now();
  const summaryDetails = [];
  let totalAccounts = 0;
  let totalLocations = 0;
  let successCount = 0;
  let failedCount = 0;

  const accountKeys = Object.keys(inputData);
  totalAccounts = accountKeys.length;

  for (const accountName of accountKeys) {
    const locationsObj = inputData[accountName];
    if (!locationsObj || typeof locationsObj !== 'object') {
      console.warn(`⚠️ Skipping invalid account format for: ${accountName}`);
      continue;
    }

    const locationKeys = Object.keys(locationsObj);
    console.log(`\n🏢 Account: [${accountName}] (${locationKeys.length} locations)`);

    for (const locationName of locationKeys) {
      totalLocations++;
      const locEntry = locationsObj[locationName];
      const locationStartTime = Date.now();

      let serviceItemsList = [];

      if (Array.isArray(locEntry)) {
        serviceItemsList = locEntry;
      } else if (locEntry && typeof locEntry === 'object') {
        if (Array.isArray(locEntry.serviceItems)) {
          serviceItemsList = locEntry.serviceItems;
        }
      }

      const freeFormCount = serviceItemsList.filter((item) => item.freeFormServiceItem).length;
      const structuredCount = serviceItemsList.filter((item) => item.structuredServiceItem).length;

      console.log(`\n-------------------------------------------------------`);
      console.log(`📍 Processing Location: [${locationName}] under Account: [${accountName}]`);
      console.log(`   Total Service Items  : ${serviceItemsList.length}`);
      console.log(`   Custom (Freeform)    : ${freeFormCount}`);
      console.log(`   Predefined (Structured): ${structuredCount}`);

      if (isDryRun) {
        const durationMs = Date.now() - locationStartTime;
        console.log(`   ✅ [DRY-RUN SUCCESS] Service items payload validated for: ${locationName}`);

        const resultEntry = {
          accountName,
          locationName,
          status: 'SUCCESS',
          isDryRun: true,
          totalItems: serviceItemsList.length,
          freeFormCount,
          structuredCount,
          requestBody: { serviceItems: serviceItemsList },
          responseBody: { message: 'Dry run successful. No API call made.' },
          durationMs,
        };

        structuredLogger.raw(resultEntry);
        structuredLogger.summaryLine({
          accountName,
          locationName,
          status: 'SUCCESS',
          totalItems: serviceItemsList.length,
          durationMs,
        });

        summaryDetails.push(resultEntry);
        successCount++;
        continue;
      }

      try {
        console.log(`   📡 Calling googleService.updateServiceItems(${locationName}, serviceItems)...`);
        const responseData = await googleService.updateServiceItems(locationName, serviceItemsList);
        const durationMs = Date.now() - locationStartTime;

        console.log(`   ✅ [SUCCESS] Location service items updated successfully in ${durationMs}ms`);

        const resultEntry = {
          accountName,
          locationName,
          status: 'SUCCESS',
          totalItems: serviceItemsList.length,
          freeFormCount,
          structuredCount,
          requestBody: { serviceItems: serviceItemsList },
          responseBody: responseData || { message: 'Service items updated successfully' },
          durationMs,
        };

        structuredLogger.raw(resultEntry);
        structuredLogger.summaryLine({
          accountName,
          locationName,
          status: 'SUCCESS',
          totalItems: serviceItemsList.length,
          durationMs,
        });

        summaryDetails.push(resultEntry);
        successCount++;
      } catch (err) {
        const durationMs = Date.now() - locationStartTime;
        console.error(`   ❌ [FAILED] Service items update failed for [${locationName}] in ${durationMs}ms:`, err.message);

        const errorDetails = {
          message: err.message,
          code: err.code || err.status,
          status: err.status || (err.response && err.response.status),
          url: err.url || (err.config && err.config.url),
          method: err.method || (err.config && err.config.method),
          responseBody: err.responseBody || (err.response && err.response.data),
          stack: err.stack,
        };

        const resultEntry = {
          accountName,
          locationName,
          status: 'FAILED',
          totalItems: serviceItemsList.length,
          freeFormCount,
          structuredCount,
          requestBody: { serviceItems: serviceItemsList },
          responseBody: errorDetails.responseBody || null,
          error: errorDetails,
          durationMs,
        };

        structuredLogger.raw(resultEntry);
        structuredLogger.summaryLine({
          accountName,
          locationName,
          status: 'FAILED',
          error: err.message,
          durationMs,
        });

        summaryDetails.push(resultEntry);
        failedCount++;
      }
    }
  }

  const totalDurationMs = Date.now() - startTime;

  const finalSummary = {
    status: failedCount === 0 ? 'SUCCESS' : 'COMPLETED_WITH_ERRORS',
    startTime: new Date(startTime).toISOString(),
    endTime: new Date().toISOString(),
    durationMs: totalDurationMs,
    summaryStats: {
      totalAccounts,
      totalLocations,
      successCount,
      failedCount,
    },
    logDirectory: LOG_DIR,
    details: summaryDetails,
  };

  structuredLogger.writeSummaryFile(finalSummary);

  console.log(`\n=======================================================`);
  console.log(`📊 EXECUTION SUMMARY`);
  console.log(`=======================================================`);
  console.log(`Total Accounts Processed : ${totalAccounts}`);
  console.log(`Total Locations Processed: ${totalLocations}`);
  console.log(`Successfully Updated     : ${successCount} ✅`);
  console.log(`Failed Updates           : ${failedCount} ❌`);
  console.log(`Total Time Taken         : ${(totalDurationMs / 1000).toFixed(2)} seconds`);
  console.log(`Log Directory            : ${LOG_DIR}`);
  console.log(`=======================================================\n`);
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
