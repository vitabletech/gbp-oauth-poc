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
    path.join(__dirname, 'input/sample-update-attributes.json');

  const dryRunArg = getArgValue('--dryRun') || process.env.DRY_RUN;
  const isDryRun = dryRunArg === 'true' || dryRunArg === '1';

  const { structuredLogger, LOG_DIR } = setupLogger({
    logBaseName: isDryRun ? 'update-attributes-dryrun-logs' : 'update-attributes-logs',
  });

  console.log(`=======================================================`);
  console.log(`🚀 Starting GBP Location Attributes Update Script`);
  console.log(`=======================================================`);
  console.log(`📅 Timestamp       : ${new Date().toISOString()}`);
  console.log(`📁 Data File       : ${path.resolve(dataFilePath)}`);
  console.log(`📂 Log Directory   : ${LOG_DIR}`);
  console.log(`⚙️  Mode           : ${isDryRun ? 'DRY-RUN (Simulated)' : 'LIVE (Updating Google Business Profile Attributes)'}`);
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

      let attributesList = [];
      let attributeMask = 'attributes';

      if (Array.isArray(locEntry)) {
        attributesList = locEntry;
      } else if (locEntry && typeof locEntry === 'object') {
        if (Array.isArray(locEntry.attributes)) {
          attributesList = locEntry.attributes;
        }
        if (locEntry.attributeMask) {
          attributeMask = locEntry.attributeMask;
        }
      }

      const formattedAttributesList = attributesList.map((item) => {
        const rawName = item.name || item.attribute || item.attributeId;
        const name = rawName ? (rawName.startsWith('attributes/') ? rawName : `attributes/${rawName}`) : undefined;
        const obj = { name };

        // Google Business Profile URL attributes must use `uriValues`; URL
        // values sent in `values` are accepted by the endpoint but ignored.
        if (Array.isArray(item.uriValues)) {
          obj.uriValues = item.uriValues.map((value) => {
            const uri = typeof value === 'string' ? value : (value.uri || value.url);
            if (!uri) {
              throw new Error(`Missing URI value for attribute: ${name}`);
            }
            return { uri };
          });
        } else if (item.values !== undefined) {
          obj.values = item.values;
        }

        if (item.repeatedEnumValue !== undefined) obj.repeatedEnumValue = item.repeatedEnumValue;
        return obj;
      });

      const payloadData = {
        name: `${locationName}/attributes`,
        attributes: formattedAttributesList,
      };

      let derivedMask = attributeMask;
      if (!derivedMask || derivedMask === 'attributes') {
        derivedMask = formattedAttributesList.map((a) => a.name).join(',');
      }

      console.log(`\n-------------------------------------------------------`);
      console.log(`📍 Processing Location: [${locationName}] under Account: [${accountName}]`);
      console.log(`   Attribute Mask: "${derivedMask}"`);
      console.log(`   Attributes Count: ${formattedAttributesList.length}`);
      console.log(`   Attribute Keys   : ${JSON.stringify(formattedAttributesList.map((a) => a.name))}`);

      if (isDryRun) {
        const durationMs = Date.now() - locationStartTime;
        console.log(`   ✅ [DRY-RUN SUCCESS] Attributes payload & mask validated for: ${locationName}`);

        const resultEntry = {
          accountName,
          locationName,
          status: 'SUCCESS',
          isDryRun: true,
          attributeMask: derivedMask,
          requestBody: payloadData,
          responseBody: { message: 'Dry run successful. No API call made.' },
          durationMs,
        };

        structuredLogger.raw(resultEntry);
        structuredLogger.summaryLine({
          accountName,
          locationName,
          status: 'SUCCESS',
          durationMs,
        });

        summaryDetails.push(resultEntry);
        successCount++;
        continue;
      }

      try {
        console.log(`   📡 Calling googleService.updateAttributes(${locationName}, payload, derivedMask)...`);
        const responseData = await googleService.updateAttributes(locationName, payloadData, derivedMask);
        const durationMs = Date.now() - locationStartTime;

        console.log(`   ✅ [SUCCESS] Location attributes updated successfully in ${durationMs}ms`);

        const resultEntry = {
          accountName,
          locationName,
          status: 'SUCCESS',
          attributeMask: derivedMask,
          requestBody: payloadData,
          responseBody: responseData || { message: 'Attributes updated successfully' },
          durationMs,
        };

        structuredLogger.raw(resultEntry);
        structuredLogger.summaryLine({
          accountName,
          locationName,
          status: 'SUCCESS',
          durationMs,
        });

        summaryDetails.push(resultEntry);
        successCount++;
      } catch (err) {
        const durationMs = Date.now() - locationStartTime;
        console.error(`   ❌ [FAILED] Attributes update failed for [${locationName}] in ${durationMs}ms:`, err.message);

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
          attributeMask,
          requestBody: payloadData,
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
