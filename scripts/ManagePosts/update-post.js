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
    path.join(__dirname, 'input/sample-update-post.json');

  const dryRunArg = getArgValue('--dryRun') || process.env.DRY_RUN;
  const isDryRun = dryRunArg === 'true' || dryRunArg === '1';

  const { structuredLogger, LOG_DIR } = setupLogger({
    logBaseName: isDryRun ? 'update-post-dryrun-logs' : 'update-post-logs',
  });

  console.log(`=======================================================`);
  console.log(`🚀 Starting GBP Location Local Post Patch/Update Script`);
  console.log(`=======================================================`);
  console.log(`📅 Timestamp       : ${new Date().toISOString()}`);
  console.log(`📁 Data File       : ${path.resolve(dataFilePath)}`);
  console.log(`📂 Log Directory   : ${LOG_DIR}`);
  console.log(`⚙️  Mode           : ${isDryRun ? 'DRY-RUN (Simulated)' : 'LIVE (Updating Local Post)'}`);
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
  let totalPostsPatched = 0;
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
      const patchItemsList = Array.isArray(locationsObj[locationName])
        ? locationsObj[locationName]
        : Array.isArray(locationsObj[locationName].posts)
        ? locationsObj[locationName].posts
        : [locationsObj[locationName]];

      console.log(`\n-------------------------------------------------------`);
      console.log(`📍 Processing Location: [${locationName}] under Account: [${accountName}]`);
      console.log(`   Posts to Patch: ${patchItemsList.length}`);

      for (const item of patchItemsList) {
        totalPostsPatched++;
        const itemStartTime = Date.now();
        const postId = item.postId || item.name;
        const updateMask = item.updateMask || 'summary,callToAction';
        const payloadData = item.data || item;

        console.log(`   📝 Patching Post: [${postId}] (updateMask: ${updateMask})...`);

        if (isDryRun) {
          const durationMs = Date.now() - itemStartTime;
          console.log(`      ✅ [DRY-RUN SUCCESS] Post patch payload validated for: ${postId}`);

          const resultEntry = {
            accountName,
            locationName,
            postId,
            status: 'SUCCESS',
            isDryRun: true,
            updateMask,
            requestBody: payloadData,
            responseBody: { message: 'Dry run successful. No API call made.' },
            durationMs,
          };

          structuredLogger.raw(resultEntry);
          structuredLogger.summaryLine({
            accountName,
            locationName,
            postId,
            status: 'SUCCESS',
            durationMs,
          });

          summaryDetails.push(resultEntry);
          successCount++;
          continue;
        }

        try {
          const responseData = await googleService.patchPost(
            locationName,
            postId,
            payloadData,
            updateMask
          );
          const durationMs = Date.now() - itemStartTime;

          console.log(`      ✅ [SUCCESS] Post patched successfully in ${durationMs}ms`);

          const resultEntry = {
            accountName,
            locationName,
            postId,
            status: 'SUCCESS',
            updateMask,
            requestBody: payloadData,
            responseBody: responseData || { message: 'Post patched successfully' },
            durationMs,
          };

          structuredLogger.raw(resultEntry);
          structuredLogger.summaryLine({
            accountName,
            locationName,
            postId,
            status: 'SUCCESS',
            durationMs,
          });

          summaryDetails.push(resultEntry);
          successCount++;
        } catch (err) {
          const durationMs = Date.now() - itemStartTime;
          console.error(`      ❌ [FAILED] Post patch failed for [${postId}] in ${durationMs}ms:`, err.message);

          const errorDetails = {
            message: err.message,
            code: err.code || err.status,
            status: err.status || (err.response && err.response.status),
            stack: err.stack,
          };

          const resultEntry = {
            accountName,
            locationName,
            postId,
            status: 'FAILED',
            updateMask,
            requestBody: payloadData,
            error: errorDetails,
            durationMs,
          };

          structuredLogger.raw(resultEntry);
          structuredLogger.summaryLine({
            accountName,
            locationName,
            postId,
            status: 'FAILED',
            error: err.message,
            durationMs,
          });

          summaryDetails.push(resultEntry);
          failedCount++;
        }
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
      totalPostsPatched,
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
  console.log(`Total Posts Patched      : ${totalPostsPatched}`);
  console.log(`Successfully Patched     : ${successCount} ✅`);
  console.log(`Failed Patches           : ${failedCount} ❌`);
  console.log(`Total Time Taken         : ${(totalDurationMs / 1000).toFixed(2)} seconds`);
  console.log(`Log Directory            : ${LOG_DIR}`);
  console.log(`=======================================================\n`);
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
