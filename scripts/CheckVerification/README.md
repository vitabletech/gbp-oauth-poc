# Check Location Verification Script (`CheckVerification`)

This module checks whether business locations across multiple Google Business Profile accounts are verified, pending verification, or require verification using the Google Business Profile Verifications API (`VoiceOfMerchantState`, `verifications.list`, and `location.metadata.hasVoiceOfMerchant`).

- **Google API Reference**:
  - [GET /v1/{name=locations/*}/VoiceOfMerchantState](https://developers.google.com/my-business/reference/verifications/rest/v1/locations/getVoiceOfMerchantState)
  - [GET /v1/{name=locations/*}/verifications](https://developers.google.com/my-business/reference/verifications/rest/v1/locations.verifications/list)

---

## Folder Structure

```
scripts/CheckVerification/
├── check-verification.js        # Main execution script checking verification status
├── input/
│   └── target-accounts.txt      # List of target account IDs to check
└── README.md                    # Complete documentation & usage guide
```

---

## How to Run

### 1. Check Verification Status across Target Accounts
```bash
npm run check-verification
```
or
```bash
node scripts/CheckVerification/check-verification.js
```

### 2. Custom Accounts File
```bash
node scripts/CheckVerification/check-verification.js --accountsFile=./scripts/FetchLocation/input/target-accounts.txt
```

### 3. Custom Output Path
```bash
node scripts/CheckVerification/check-verification.js --outputFile=./data/my-verification-report.json
```

---

## Verification Status Classification

The script evaluates and classifies each location into one of the following states:

1. **`VERIFIED`** (✅):
   Location is fully verified and active on Google Maps & Google Search (`hasVoiceOfMerchant === true`).

2. **`UNVERIFIED_PENDING`** (⏳):
   A verification request has been initiated (e.g., postcard sent, email/phone verification pending PIN entry).

3. **`UNVERIFIED_NOT_STARTED`** (❌):
   Location requires verification before it can manage posts, public reviews, or appear prominently on Google Search.

---

## Report Output (`data/verification-status.json`)

```json
{
  "accounts/108679175144070620594": {
    "locations/14395317695646119136": {
      "locationName": "locations/14395317695646119136",
      "title": "Mr. Mayank Singh Kushwah (Software Engineer)",
      "verificationStatus": "VERIFIED",
      "isVerified": true,
      "hasPendingVerification": false,
      "voiceOfMerchantState": {
        "hasVoiceOfMerchant": true
      },
      "verificationsList": []
    }
  }
}
```

---

## Logging & Diagnostics

Each run creates timestamped log artifacts under `log/check-verification-logs-YYYYMMDD_HHMMSS/`:
- `log.txt`: Console output.
- `log_raw.jsonl`: Full raw response objects for VoiceOfMerchantState and verifications array per location.
- `log_summary.json`: Final verification statistics summary (`verifiedCount`, `pendingCount`, `unverifiedCount`).
