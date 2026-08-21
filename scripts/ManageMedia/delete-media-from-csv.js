const fs = require('fs');
const path = require('path');
const googleService = require('../../services/google');
const setupLogger = require('../../utils/logger-setup');

const getArgValue = (flag) => {
  const match = process.argv.slice(2).find((a) => a.startsWith(flag + '='));
  if (match) return match.split('=')[1];
  return undefined;
};

const parseCsvLine = (line) => {
  const values = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
};

const parseCsvRows = (csvText) => {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim() !== '');
  if (!lines.length) return [];

  const header = parseCsvLine(lines[0]).map((headerName) =>
    headerName.trim().toLowerCase().replace(/[\s-]+/g, '_')
  );

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row = {};

    header.forEach((key, index) => {
      row[key] = values[index] || '';
    });

    return row;
  });
};

const parseMediaReference = (mediaRef, fallbackAccountId, fallbackLocationId) => {
  if (!mediaRef) return null;

  const value = String(mediaRef).trim();
  if (!value) return null;

  const fullPathMatch = value.match(/^accounts\/([^/]+)\/locations\/([^/]+)\/media\/(.+)$/i);
  if (fullPathMatch) {
    const accountId = fullPathMatch[1];
    const locationId = fullPathMatch[2];
    const nextMediaKey = fullPathMatch[3].replace(/^media\//i, '');
    return {
      accountId,
      locationId,
      mediaKey: `media/${nextMediaKey}`,
    };
  }

  const mediaKeyMatch = value.match(/^media\/(.+)$/i);
  if (mediaKeyMatch) {
    const mediaKey = `media/${mediaKeyMatch[1].replace(/^media\//i, '')}`;
    if (!fallbackAccountId || !fallbackLocationId) {
      return null;
    }
    return {
      accountId: fallbackAccountId,
      locationId: fallbackLocationId,
      mediaKey,
    };
  }

  return null;
};

async function main() {
  const dataFilePath =
    getArgValue('--dataFile') ||
    process.env.DATA_FILE ||
    path.join(__dirname, 'input/media_file_records.csv');

  const dryRunArg = getArgValue('--dryRun') || process.env.DRY_RUN;
  const isDryRun = dryRunArg === 'true' || dryRunArg === '1';
  const fallbackAccountId = getArgValue('--accountId') || process.env.ACCOUNT_ID;
  const fallbackLocationId = getArgValue('--locationId') || process.env.LOCATION_ID;

  const { structuredLogger, LOG_DIR } = setupLogger({
    logBaseName: isDryRun ? 'delete-media-csv-dryrun-logs' : 'delete-media-csv-logs',
  });

  console.log('=======================================================');
  console.log('🚀 Starting GBP Media Delete From CSV Script');
  console.log('=======================================================');
  console.log(`📅 Timestamp       : ${new Date().toISOString()}`);
  console.log(`📁 CSV File        : ${path.resolve(dataFilePath)}`);
  console.log(`📂 Log Directory   : ${LOG_DIR}`);
  console.log(`⚙️  Mode           : ${isDryRun ? 'DRY-RUN (Simulated)' : 'LIVE (Deleting Media Items)'}`);
  console.log(`🔐 Default Account: ${fallbackAccountId || 'N/A'}`);
  console.log(`📍 Default Location: ${fallbackLocationId || 'N/A'}`);
  console.log('=======================================================\n');

  if (!fs.existsSync(dataFilePath)) {
    const errorMsg = `CSV file not found at path: ${dataFilePath}`;
    console.error(`❌ ${errorMsg}`);
    structuredLogger.writeSummaryFile({
      status: 'FAILED',
      error: errorMsg,
      timestamp: new Date().toISOString(),
    });
    process.exit(1);
  }

  let csvContent;
  let rows;
  try {
    csvContent = fs.readFileSync(dataFilePath, 'utf8');
    rows = parseCsvRows(csvContent);
  } catch (err) {
    const errorMsg = `Failed to read or parse CSV file: ${err.message}`;
    console.error(`❌ ${errorMsg}`);
    structuredLogger.writeSummaryFile({
      status: 'FAILED',
      error: errorMsg,
      timestamp: new Date().toISOString(),
    });
    process.exit(1);
  }

  if (!rows.length) {
    const errorMsg = 'No rows found in the CSV file.';
    console.error(`❌ ${errorMsg}`);
    structuredLogger.writeSummaryFile({
      status: 'FAILED',
      error: errorMsg,
      timestamp: new Date().toISOString(),
    });
    process.exit(1);
  }

  const totalRows = rows.length;
  const summaryDetails = [];
  let totalMediaDeleted = 0;
  let successCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  const startTime = Date.now();

  console.log(`📄 Found ${rows.length} rows in the CSV file.\n`);

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const rawMediaKey = row.media_key || row.media_key_value || row.media || row.media_ref || '';

    if (!rawMediaKey) {
      console.warn(`⚠️ Skipping row ${index + 2}: no media_key value found.`);
      skippedCount++;
      continue;
    }

    const parsed = parseMediaReference(rawMediaKey, fallbackAccountId, fallbackLocationId);
    if (!parsed) {
      const errorMsg = `Skipping row ${index + 2}: media key format is not supported. Value: ${rawMediaKey}`;
      console.warn(`⚠️ ${errorMsg}`);
      skippedCount++;
      structuredLogger.raw({
        rowNumber: index + 2,
        mediaKey: rawMediaKey,
        status: 'SKIPPED',
        reason: 'Unsupported media key format',
      });
      continue;
    }

    const { accountId, locationId, mediaKey } = parsed;
    totalMediaDeleted++;
    const itemStartTime = Date.now();

    console.log(`\n-------------------------------------------------------`);
    console.log(`📍 Row ${index + 2}: ${mediaKey}`);
    console.log(`   Account ID: ${accountId}`);
    console.log(`   Location ID: ${locationId}`);

    if (isDryRun) {
      const durationMs = Date.now() - itemStartTime;
      console.log(`   ✅ [DRY-RUN SUCCESS] Media deletion validated for: ${mediaKey}`);

      const resultEntry = {
        rowNumber: index + 2,
        accountId,
        locationId,
        mediaKey,
        status: 'SUCCESS',
        isDryRun: true,
        responseBody: { message: 'Dry run successful. No API call made.' },
        durationMs,
      };

      structuredLogger.raw(resultEntry);
      structuredLogger.summaryLine({
        accountId,
        locationId,
        mediaKey,
        status: 'SUCCESS',
        durationMs,
      });

      summaryDetails.push(resultEntry);
      successCount++;
      continue;
    }

    try {
      await googleService.deleteMedia(accountId, locationId, mediaKey);
      const durationMs = Date.now() - itemStartTime;

      console.log(`   ✅ [SUCCESS] Media deleted successfully in ${durationMs}ms`);

      const resultEntry = {
        rowNumber: index + 2,
        accountId,
        locationId,
        mediaKey,
        status: 'SUCCESS',
        responseBody: { message: 'Media deleted successfully' },
        durationMs,
      };

      structuredLogger.raw(resultEntry);
      structuredLogger.summaryLine({
        accountId,
        locationId,
        mediaKey,
        status: 'SUCCESS',
        durationMs,
      });

      summaryDetails.push(resultEntry);
      successCount++;
    } catch (err) {
      const durationMs = Date.now() - itemStartTime;
      console.error(`   ❌ [FAILED] Media deletion failed for [${mediaKey}] in ${durationMs}ms:`, err.message);

      const errorDetails = {
        message: err.message,
        code: err.code || err.status,
        status: err.status || (err.response && err.response.status),
        stack: err.stack,
      };

      const resultEntry = {
        rowNumber: index + 2,
        accountId,
        locationId,
        mediaKey,
        status: 'FAILED',
        error: errorDetails,
        durationMs,
      };

      structuredLogger.raw(resultEntry);
      structuredLogger.summaryLine({
        accountId,
        locationId,
        mediaKey,
        status: 'FAILED',
        error: err.message,
        durationMs,
      });

      summaryDetails.push(resultEntry);
      failedCount++;
    }
  }

  const totalDurationMs = Date.now() - startTime;

  const finalSummary = {
    status: failedCount === 0 ? 'SUCCESS' : 'COMPLETED_WITH_ERRORS',
    startTime: new Date(startTime).toISOString(),
    endTime: new Date().toISOString(),
    durationMs: totalDurationMs,
    summaryStats: {
      totalRows,
      totalMediaDeleted,
      successCount,
      failedCount,
      skippedCount,
    },
    logDirectory: LOG_DIR,
    details: summaryDetails,
  };

  structuredLogger.writeSummaryFile(finalSummary);

  console.log(`\n=======================================================`);
  console.log('📊 EXECUTION SUMMARY');
  console.log('=======================================================');
  console.log(`Total CSV Rows         : ${totalRows}`);
  console.log(`Total Media Items     : ${totalMediaDeleted}`);
  console.log(`Successfully Deleted   : ${successCount} ✅`);
  console.log(`Failed Deletions       : ${failedCount} ❌`);
  console.log(`Skipped Rows           : ${skippedCount} ⚠️`);
  console.log(`Total Time Taken       : ${(totalDurationMs / 1000).toFixed(2)} seconds`);
  console.log(`Log Directory          : ${LOG_DIR}`);
  console.log('=======================================================\n');
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
