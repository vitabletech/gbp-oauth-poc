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
    path.join(__dirname, 'input/sample-upload-media.json');

  const dryRunArg = getArgValue('--dryRun') || process.env.DRY_RUN;
  const isDryRun = dryRunArg === 'true' || dryRunArg === '1';

  const { structuredLogger, LOG_DIR } = setupLogger({
    logBaseName: isDryRun ? 'upload-media-dryrun-logs' : 'upload-media-logs',
  });

  console.log(`=======================================================`);
  console.log(`🚀 Starting GBP Location Media Upload Script`);
  console.log(`=======================================================`);
  console.log(`📅 Timestamp       : ${new Date().toISOString()}`);
  console.log(`📁 Data File       : ${path.resolve(dataFilePath)}`);
  console.log(`📂 Log Directory   : ${LOG_DIR}`);
  console.log(`⚙️  Mode           : ${isDryRun ? 'DRY-RUN (Simulated)' : 'LIVE (Uploading Media to Google Business Profile)'}`);
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
  let totalMediaItems = 0;
  let successMediaCount = 0;
  let failedMediaCount = 0;

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

      let mediaItemsList = [];

      if (Array.isArray(locEntry)) {
        mediaItemsList = locEntry;
      } else if (locEntry && typeof locEntry === 'object') {
        if (Array.isArray(locEntry.mediaItems)) {
          mediaItemsList = locEntry.mediaItems;
        } else if (Array.isArray(locEntry.media)) {
          mediaItemsList = locEntry.media;
        }
      }

      totalMediaItems += mediaItemsList.length;

      const photoCount = mediaItemsList.filter((m) => !m.mediaFormat || m.mediaFormat === 'PHOTO').length;
      const videoCount = mediaItemsList.filter((m) => m.mediaFormat === 'VIDEO').length;
      const categoriesUsed = [
        ...new Set(mediaItemsList.map((m) => (m.locationAssociation && m.locationAssociation.category) || 'ADDITIONAL')),
      ];

      console.log(`\n-------------------------------------------------------`);
      console.log(`📍 Processing Location: [${locationName}] under Account: [${accountName}]`);
      console.log(`   Total Media Items: ${mediaItemsList.length} (Photos: ${photoCount}, Videos: ${videoCount})`);
      console.log(`   Categories Used  : ${JSON.stringify(categoriesUsed)}`);

      if (isDryRun) {
        const durationMs = Date.now() - locationStartTime;
        console.log(`   ✅ [DRY-RUN SUCCESS] ${mediaItemsList.length} media items validated for location: ${locationName}`);

        const resultEntry = {
          accountName,
          locationName,
          status: 'SUCCESS',
          isDryRun: true,
          totalMediaItems: mediaItemsList.length,
          photoCount,
          videoCount,
          categoriesUsed,
          requestBody: { mediaItems: mediaItemsList },
          responseBody: { message: 'Dry run successful. No API call made.' },
          durationMs,
        };

        structuredLogger.raw(resultEntry);
        structuredLogger.summaryLine({
          accountName,
          locationName,
          status: 'SUCCESS',
          totalMediaItems: mediaItemsList.length,
          durationMs,
        });

        summaryDetails.push(resultEntry);
        successMediaCount += mediaItemsList.length;
        continue;
      }

      try {
        console.log(`   📡 Calling googleService.bulkCreateMedia(${accountName}, ${locationName}, mediaItems)...`);
        const results = await googleService.bulkCreateMedia(accountName, locationName, mediaItemsList);
        const durationMs = Date.now() - locationStartTime;

        let locSuccess = 0;
        let locFailed = 0;

        if (Array.isArray(results)) {
          for (const res of results) {
            if (res.status === 'success') {
              locSuccess++;
              successMediaCount++;
            } else {
              locFailed++;
              failedMediaCount++;
            }
          }
        }

        console.log(`   ✅ [COMPLETED] Media upload finished in ${durationMs}ms (Success: ${locSuccess}, Failed: ${locFailed})`);

        const resultEntry = {
          accountName,
          locationName,
          status: locFailed === 0 ? 'SUCCESS' : 'PARTIAL_SUCCESS',
          totalMediaItems: mediaItemsList.length,
          successCount: locSuccess,
          failedCount: locFailed,
          requestBody: { mediaItems: mediaItemsList },
          responseBody: results,
          durationMs,
        };

        structuredLogger.raw(resultEntry);
        structuredLogger.summaryLine({
          accountName,
          locationName,
          status: resultEntry.status,
          successCount: locSuccess,
          failedCount: locFailed,
          durationMs,
        });

        summaryDetails.push(resultEntry);
      } catch (err) {
        const durationMs = Date.now() - locationStartTime;
        failedMediaCount += mediaItemsList.length;
        console.error(`   ❌ [FAILED] Media upload failed for location [${locationName}] in ${durationMs}ms:`, err.message);

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
          totalMediaItems: mediaItemsList.length,
          successCount: 0,
          failedCount: mediaItemsList.length,
          requestBody: { mediaItems: mediaItemsList },
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
      }
    }
  }

  const totalDurationMs = Date.now() - startTime;

  const finalSummary = {
    status: failedMediaCount === 0 ? 'SUCCESS' : 'COMPLETED_WITH_ERRORS',
    startTime: new Date(startTime).toISOString(),
    endTime: new Date().toISOString(),
    durationMs: totalDurationMs,
    summaryStats: {
      totalAccounts,
      totalLocations,
      totalMediaItems,
      successMediaCount,
      failedMediaCount,
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
  console.log(`Total Media Items        : ${totalMediaItems}`);
  console.log(`Successfully Uploaded    : ${successMediaCount} ✅`);
  console.log(`Failed Uploads           : ${failedMediaCount} ❌`);
  console.log(`Total Time Taken         : ${(totalDurationMs / 1000).toFixed(2)} seconds`);
  console.log(`Log Directory            : ${LOG_DIR}`);
  console.log(`=======================================================\n`);
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
