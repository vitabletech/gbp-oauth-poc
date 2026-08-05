# Update Location Script (`UpdateLocation`)

This module handles bulk updating basic business information across multiple Google Business Profile accounts and locations using the Google Business Information REST API v1 (`accounts.locations.patch`).

## Folder Structure

```
scripts/UpdateLocation/
├── update-locations.js           # Main bulk update execution script
├── README.md                     # Documentation & Usage guide
└── input/
    └── sample-update-locations.json # Input payload supporting multi-account & multi-location structure
```

---

## How to Run

### 1. Simulated Dry Run (Payload & Mask Validation)
```bash
npm run update-locations:dry
```
or
```bash
node scripts/UpdateLocation/update-locations.js --dryRun=true
```

### 2. Live Update (Google API Call)
```bash
npm run update-locations
```
or
```bash
node scripts/UpdateLocation/update-locations.js
```

### 3. Custom Input Data File
```bash
node scripts/UpdateLocation/update-locations.js --dataFile=./scripts/UpdateLocation/input/my-custom-locations.json
```

---

## Input JSON Format

The JSON payload structure supports multiple accounts and multiple locations:

```json
{
  "accounts/101234567890123456789": {
    "locations/109876543210987654321": {
      "title": "BPCL Energy Station - Connaught Place",
      "languageCode": "en-US",
      "storefrontAddress": {
        "regionCode": "IN",
        "locality": "New Delhi",
        "administrativeArea": "DL",
        "postalCode": "110001",
        "addressLines": ["Block A, Inner Circle"]
      },
      "phoneNumbers": {
        "primaryPhone": "+911123456789"
      },
      "websiteUri": "https://www.bharatpetroleum.in/cp-station",
      "regularHours": { ... },
      "specialHours": { ... },
      "profile": {
        "description": "Store description..."
      }
    }
  }
}
```

---

## Field Update Masks (`updateMask`)

- **Auto-Generated**: The script automatically derives `updateMask` fields based on top-level object properties present in each location update block (e.g., `"title,storefrontAddress,websiteUri,phoneNumbers,regularHours,specialHours,profile.description"`).
- **Explicit Override**: You can optionally pass an `"updateMask": "title,websiteUri"` field inside a location block to restrict updates.

---

## Logging & Diagnostics

Each run creates a timestamped folder inside `log/update-locations-logs-YYYYMMDD_HHMMSS/` containing:
- `log.txt`: Console logs.
- `log_raw.jsonl`: Detailed request & response bodies, errors, duration.
- `log_summary.jsonl`: Line summary per location.
- `log_summary.json`: Comprehensive final status report.
