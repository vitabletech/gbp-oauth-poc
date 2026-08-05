# Fetch Location Script (`FetchLocation`)

This module handles fetching all location details across multiple Google Business Profile accounts using auto-pagination via the Google Business Information REST API v1 (`accounts.locations.listAll`).

## Folder Structure

```
scripts/FetchLocation/
├── fetch-locations.js           # Main fetch execution script
├── README.md                    # Documentation & Usage guide
└── input/
    └── target-accounts.txt      # Input text file listing account IDs line by line
```

---

## How to Run

### 1. Run using Default Accounts File (`input/target-accounts.txt`)
```bash
npm run fetch-locations
```
or
```bash
node scripts/FetchLocation/fetch-locations.js
```

### 2. Run with Custom Accounts File
```bash
node scripts/FetchLocation/fetch-locations.js --accountsFile=./scripts/FetchLocation/input/my-accounts.txt
```

### 3. Run with Inline Accounts List
```bash
node scripts/FetchLocation/fetch-locations.js --accounts=accounts/108679175144070620594,accounts/113919555233990198349
```

### 4. Custom Output Path
```bash
node scripts/FetchLocation/fetch-locations.js --outputFile=./data/my-fetched-locations.json
```

---

## Input Accounts File Format (`target-accounts.txt`)

Place one account ID per line. Comments (`#` or `//`) and empty lines are ignored:

```txt
# Google Business Profile Target Accounts List
accounts/108679175144070620594
accounts/113919555233990198349
accounts/103000636145638436311
```

---

## Output Format (`data/fetched-locations.json`)

```json
{
  "accounts/108679175144070620594": {
    "locations/109876543210987654321": {
      "name": "locations/109876543210987654321",
      "title": "BPCL Energy Station",
      "storefrontAddress": { ... },
      "phoneNumbers": { ... },
      "websiteUri": "...",
      "regularHours": { ... }
    }
  }
}
```

---

## Logging & Diagnostics

Each run creates a timestamped folder inside `log/fetch-locations-logs-YYYYMMDD_HHMMSS/` containing:
- `log.txt`: Console logs.
- `log_raw.jsonl`: Detailed request parameters, raw location payloads per account, and errors.
- `log_summary.jsonl`: Per-account summary log lines.
- `log_summary.json`: Comprehensive final status report.
