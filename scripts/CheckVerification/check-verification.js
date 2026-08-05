const fs = require('fs');
const path = require('path');
const googleService = require('../../services/google');
const setupLogger = require('../../utils/logger-setup');

const getArgValue = (flag) => {
  const match = process.argv.slice(2).find((a) => a.startsWith(flag + '='));
  if (match) return match.split('=')[1];
  return undefined;
};

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
    path.join(__dirname, '../../data/verification-status.json');

  const defaultInputFile = path.join(__dirname, 'input/target-accounts.txt');
  const fallbackInputFile = path.join(__dirname, '../FetchLocation/input/target-accounts.txt');
  const accountsFileArg =
    getArgValue('--accountsFile') ||
    process.env.ACCOUNTS_FILE ||
    (fs.existsSync(defaultInputFile) ? defaultInputFile : fallbackInputFile);

  const { structuredLogger, LOG_DIR } = setupLogger({
    logBaseName: 'check-verification-logs',
  });

  console.log(`=======================================================`);
  console.log(`🔎 Starting GBP Location Verification Checker Script`);
  console.log(`=======================================================`);
  console.log(`📅 Timestamp       : ${new Date().toISOString()}`);
  console.log(`📄 Accounts Source : ${path.resolve(accountsFileArg)}`);
  console.log(`📁 Output File     : ${path.resolve(outputFile)}`);
  console.log(`📂 Log Directory   : ${LOG_DIR}`);
  console.log(`=======================================================\n`);

  const startTime = Date.now();
  const accountsToFetch = loadAccountsFromFile(accountsFileArg) || [];

  if (accountsToFetch.length === 0) {
    console.error(`❌ No target accounts found in: ${accountsFileArg}`);
    process.exit(1);
  }

  const resultMap = {};
  const summaryDetails = [];
  let totalLocationsChecked = 0;
  let verifiedCount = 0;
  let pendingCount = 0;
  let unverifiedCount = 0;

  for (const accountName of accountsToFetch) {
    const formattedAccountName = accountName.startsWith('accounts/')
      ? accountName
      : `accounts/${accountName}`;

    console.log(`🏢 Checking account: [${formattedAccountName}]...`);
    let locationsList = [];
    try {
      locationsList = await googleService.listAllLocations(
        formattedAccountName,
        'name,title,storeCode,metadata'
      );
    } catch (err) {
      console.error(`   ❌ Failed to list locations for [${formattedAccountName}]:`, err.message);
      continue;
    }

    if (!Array.isArray(locationsList) || locationsList.length === 0) {
      console.log(`   ℹ️ No locations found under account: ${formattedAccountName}`);
      continue;
    }

    resultMap[formattedAccountName] = {};

    for (const loc of locationsList) {
      const locationName = loc.name;
      totalLocationsChecked++;
      const locStartTime = Date.now();

      const title = loc.title || 'Untitled';
      const isMetadataVerified = Boolean(loc.metadata && loc.metadata.hasVoiceOfMerchant);

      console.log(`   📍 Checking Location: [${locationName}] - "${title}"...`);

      let vomState = null;
      let verificationsList = [];
      let verificationStatus = 'UNVERIFIED';

      try {
        vomState = await googleService.getVoiceOfMerchantState(locationName);
      } catch (err) {
        console.warn(`      ⚠️ Could not fetch VoiceOfMerchant state for [${locationName}]: ${err.message}`);
      }

      try {
        const verificationsRes = await googleService.listVerifications(locationName);
        verificationsList = Array.isArray(verificationsRes?.verifications)
          ? verificationsRes.verifications
          : Array.isArray(verificationsRes)
          ? verificationsRes
          : [];
      } catch (err) {
        console.warn(`      ⚠️ Could not fetch verifications list for [${locationName}]: ${err.message}`);
      }

      const isVOMVerified = Boolean(
        (vomState && vomState.hasVoiceOfMerchant) || isMetadataVerified
      );
      const hasPendingVerification = Boolean(
        vomState && vomState.hasPendingVerification
      );

      if (isVOMVerified) {
        verificationStatus = 'VERIFIED';
        verifiedCount++;
      } else if (hasPendingVerification || verificationsList.some((v) => v.state === 'PENDING')) {
        verificationStatus = 'UNVERIFIED_PENDING';
        pendingCount++;
      } else {
        verificationStatus = 'UNVERIFIED_NOT_STARTED';
        unverifiedCount++;
      }

      const durationMs = Date.now() - locStartTime;
      const statusIcon =
        verificationStatus === 'VERIFIED'
          ? '✅ VERIFIED'
          : verificationStatus === 'UNVERIFIED_PENDING'
          ? '⏳ PENDING VERIFICATION'
          : '❌ NOT VERIFIED';

      console.log(`      ${statusIcon} (VoiceOfMerchant: ${isVOMVerified}, Pending: ${hasPendingVerification}, Verifications: ${verificationsList.length}) [${durationMs}ms]`);

      const locationRecord = {
        locationName,
        title,
        storeCode: loc.storeCode || null,
        verificationStatus,
        isVerified: isVOMVerified,
        hasPendingVerification,
        metadata: loc.metadata || {},
        voiceOfMerchantState: vomState || {},
        verificationsList,
        durationMs,
      };

      resultMap[formattedAccountName][locationName] = locationRecord;

      const summaryEntry = {
        accountName: formattedAccountName,
        locationName,
        title,
        verificationStatus,
        isVerified: isVOMVerified,
        durationMs,
      };

      structuredLogger.raw(locationRecord);
      structuredLogger.summaryLine(summaryEntry);
      summaryDetails.push(summaryEntry);
    }
  }

  const outputDir = path.dirname(path.resolve(outputFile));
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, JSON.stringify(resultMap, null, 2), 'utf8');
  console.log(`\n💾 Saved location verification status report to: ${path.resolve(outputFile)}`);

  const totalDurationMs = Date.now() - startTime;

  const finalSummary = {
    status: 'COMPLETED',
    startTime: new Date(startTime).toISOString(),
    endTime: new Date().toISOString(),
    durationMs: totalDurationMs,
    summaryStats: {
      totalAccounts: accountsToFetch.length,
      totalLocationsChecked,
      verifiedCount,
      pendingCount,
      unverifiedCount,
    },
    outputFile: path.resolve(outputFile),
    logDirectory: LOG_DIR,
    details: summaryDetails,
  };

  structuredLogger.writeSummaryFile(finalSummary);

  console.log(`\n=======================================================`);
  console.log(`📊 LOCATION VERIFICATION SUMMARY`);
  console.log(`=======================================================`);
  console.log(`Total Accounts Processed : ${accountsToFetch.length}`);
  console.log(`Total Locations Checked  : ${totalLocationsChecked}`);
  console.log(`Fully Verified           : ${verifiedCount} ✅`);
  console.log(`Verification Pending     : ${pendingCount} ⏳`);
  console.log(`Not Verified / Action Req: ${unverifiedCount} ❌`);
  console.log(`Total Time Taken         : ${(totalDurationMs / 1000).toFixed(2)} seconds`);
  console.log(`Report Saved To          : ${path.resolve(outputFile)}`);
  console.log(`Log Directory            : ${LOG_DIR}`);
  console.log(`=======================================================\n`);
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
