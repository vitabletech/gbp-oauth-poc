const fs = require('fs');
const path = require('path');

/**
 * Sets up file & console logging for scripts.
 * Creates a timestamped directory under log/ or specified APP_LOG_DIR / --logDir.
 * Captures log.txt, log_raw.jsonl, log_summary.jsonl, and log_summary.json.
 */
const setupLogger = (options = {}) => {
  const getArgValueSimple = (flag) => {
    const match = process.argv.slice(2).find((a) => a.startsWith(flag + '='));
    if (match) return match.split('=')[1];
    return undefined;
  };

  const formatTimestamp = (d = new Date()) => {
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  };

  const logBaseName =
    options.logBaseName ||
    process.env.LOG_BASE_NAME ||
    getArgValueSimple('--logBaseName') ||
    'update-locations-logs';
  const logFolderName = `${logBaseName}-${formatTimestamp()}`;
  const logDirBase = options.logDir || getArgValueSimple('--logDir')
    ? path.resolve(process.cwd(), options.logDir || getArgValueSimple('--logDir'))
    : process.env.APP_LOG_DIR
      ? path.resolve(process.cwd(), process.env.APP_LOG_DIR)
      : path.resolve(__dirname, '../log');
  const LOG_DIR = path.join(logDirBase, logFolderName);
  try {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  } catch (e) {
    console.error('Failed to create log directory', LOG_DIR, e?.message || e);
  }

  const logFile = fs.createWriteStream(path.join(LOG_DIR, 'log.txt'), {
    flags: 'a',
  });
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  const formatForLog = (...args) =>
    args
      .map((a) => {
        if (a instanceof Error) {
          return a.stack || a.message;
        }
        return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a);
      })
      .join(' ');

  console.log = (...args) => {
    originalLog(...args);
    try {
      logFile.write(formatForLog(...args) + '\n');
    } catch (e) {
      originalError('log write failed', e);
    }
  };

  console.error = (...args) => {
    originalError(...args);
    try {
      logFile.write('[ERROR] ' + formatForLog(...args) + '\n');
    } catch (e) {
      originalError('log write failed', e);
    }
  };

  console.warn = (...args) => {
    originalWarn(...args);
    try {
      logFile.write('[WARN] ' + formatForLog(...args) + '\n');
    } catch (e) {
      originalError('log write failed', e);
    }
  };

  const RAW_LOG_PATH = path.join(LOG_DIR, 'log_raw.jsonl');
  const SUMMARY_LINES_PATH = path.join(LOG_DIR, 'log_summary.jsonl');
  const SUMMARY_LOG_PATH = path.join(LOG_DIR, 'log_summary.json');

  const safeAppend = (filePath, text) => {
    try {
      fs.appendFileSync(filePath, text);
    } catch (e) {
      originalError('Failed to write log file', filePath, e?.message || e);
    }
  };

  const structuredLogger = {
    raw: (obj) => {
      const entry = Object.assign({ ts: new Date().toISOString() }, obj);
      safeAppend(RAW_LOG_PATH, JSON.stringify(entry) + '\n');
    },
    summaryLine: (obj) => {
      const entry = Object.assign({ ts: new Date().toISOString() }, obj);
      safeAppend(SUMMARY_LINES_PATH, JSON.stringify(entry) + '\n');
    },
    writeSummaryFile: (summaryObj) => {
      try {
        fs.writeFileSync(SUMMARY_LOG_PATH, JSON.stringify(summaryObj, null, 2));
      } catch (e) {
        originalError('Failed to write summary file', e?.message || e);
      }
    },
  };

  return { structuredLogger, getArgValueSimple, LOG_DIR };
};

module.exports = setupLogger;
