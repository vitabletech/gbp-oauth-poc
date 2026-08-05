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
    path.join(__dirname, '../../data/fetched-posts.json');

  const postIdArg = getArgValue('--postId');
  const accountsFileArg =
    getArgValue('--accountsFile') ||
    process.env.ACCOUNTS_FILE ||
    path.join(__dirname, '../FetchLocation/input/target-accounts.txt');

  const { structuredLogger, LOG_DIR } = setupLogger({
    logBaseName: 'fetch-posts-logs',
  });

  console.log(`=======================================================`);
  console.log(`📡 Starting GBP Fetch Local Posts Script`);
  console.log(`=======================================================`);
  console.log(`📅 Timestamp       : ${new Date().toISOString()}`);
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
  let totalPostsFound = 0;

  for (const accountName of accountsToFetch) {
    const formattedAccountName = accountName.startsWith('accounts/')
      ? accountName
      : `accounts/${accountName}`;

    console.log(`🔍 Fetching locations for account: [${formattedAccountName}] to fetch posts...`);
    let locationsList = [];
    try {
      locationsList = await googleService.listAllLocations(formattedAccountName, 'name,title');
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

      console.log(`   📝 Fetching posts for location: [${locationName}]...`);

      try {
        let postResult;
        if (postIdArg) {
          postResult = await googleService.getPost(formattedAccountName, locationName, postIdArg);
        } else {
          postResult = await googleService.listPosts(formattedAccountName, locationName);
        }

        const durationMs = Date.now() - locStartTime;
        const postsList = Array.isArray(postResult?.localPosts)
          ? postResult.localPosts
          : Array.isArray(postResult)
          ? postResult
          : postResult
          ? [postResult]
          : [];

        totalPostsFound += postsList.length;

        console.log(`      ✅ Found ${postsList.length} posts in ${durationMs}ms`);

        resultMap[formattedAccountName][locationName] = postsList;

        const logEntry = {
          accountName: formattedAccountName,
          locationName,
          status: 'SUCCESS',
          postCount: postsList.length,
          posts: postsList,
          durationMs,
        };

        structuredLogger.raw(logEntry);
        structuredLogger.summaryLine({
          accountName: formattedAccountName,
          locationName,
          status: 'SUCCESS',
          postCount: postsList.length,
          durationMs,
        });
        summaryDetails.push(logEntry);
      } catch (err) {
        const durationMs = Date.now() - locStartTime;
        console.error(`      ❌ Failed to fetch posts for [${locationName}]:`, err.message);
        resultMap[formattedAccountName][locationName] = [];

        const logEntry = {
          accountName: formattedAccountName,
          locationName,
          status: 'FAILED',
          error: err.message,
          durationMs,
        };

        structuredLogger.raw(logEntry);
        structuredLogger.summaryLine(logEntry);
        summaryDetails.push(logEntry);
      }
    }
  }

  const outputDir = path.dirname(path.resolve(outputFile));
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, JSON.stringify(resultMap, null, 2), 'utf8');
  console.log(`\n💾 Saved fetched posts to: ${path.resolve(outputFile)}`);

  const totalDurationMs = Date.now() - startTime;

  const finalSummary = {
    status: 'COMPLETED',
    startTime: new Date(startTime).toISOString(),
    endTime: new Date().toISOString(),
    durationMs: totalDurationMs,
    summaryStats: {
      totalAccounts: accountsToFetch.length,
      totalLocationsChecked,
      totalPostsFound,
    },
    outputFile: path.resolve(outputFile),
    logDirectory: LOG_DIR,
    details: summaryDetails,
  };

  structuredLogger.writeSummaryFile(finalSummary);

  console.log(`\n=======================================================`);
  console.log(`📊 FETCH POSTS SUMMARY`);
  console.log(`=======================================================`);
  console.log(`Total Accounts Processed : ${accountsToFetch.length}`);
  console.log(`Total Locations Checked  : ${totalLocationsChecked}`);
  console.log(`Total Posts Found        : ${totalPostsFound}`);
  console.log(`Total Time Taken         : ${(totalDurationMs / 1000).toFixed(2)} seconds`);
  console.log(`Data Saved To            : ${path.resolve(outputFile)}`);
  console.log(`Log Directory            : ${LOG_DIR}`);
  console.log(`=======================================================\n`);
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
