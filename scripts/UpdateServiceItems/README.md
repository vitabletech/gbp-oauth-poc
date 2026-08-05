# Update Service Items Script (`UpdateServiceItems`)

This module handles bulk updating service items (both custom/freeform services and pre-defined/structured GCID services) across multiple Google Business Profile locations using the Google Business Information REST API v1 (`locations.patch` with `updateMask=serviceItems`).

- **Google API Reference**: [PATCH /v1/locations/{locationId}?updateMask=serviceItems](https://developers.google.com/my-business/reference/businessinformation/rest/v1/accounts.locations)

---

## Folder Structure

```
scripts/UpdateServiceItems/
├── update-service-items.js             # Main bulk update service items execution script
├── README.md                           # Complete documentation & usage guide
└── input/
    └── sample-update-service-items.json # Input payload containing custom (freeform) & structured services
```

---

## How to Run

### 1. Dry Run (Simulated & Validated)
```bash
npm run update-service-items:dry
```
or
```bash
node scripts/UpdateServiceItems/update-service-items.js --dryRun=true
```

### 2. Live Service Items Update
```bash
npm run update-service-items
```
or
```bash
node scripts/UpdateServiceItems/update-service-items.js
```

### 3. Custom Input File
```bash
node scripts/UpdateServiceItems/update-service-items.js --dataFile=./scripts/UpdateServiceItems/input/my-custom-services.json
```

---

## Service Item Types & Formats Supported

Google Business Information API v1 supports two types of service items:

### 1. Custom / Freeform Service Item (`freeFormServiceItem`)
Custom services created directly by the user/business (not restricted to Google's standard GCID service list).

- **With Fixed Price**:
  ```json
  {
    "freeFormServiceItem": {
      "categoryCode": "categories/gcid:learning_center",
      "label": {
        "displayName": "Full-Stack Web Development Bootcamp",
        "description": "Comprehensive hands-on training in Node.js, Express, React, and Google APIs."
      }
    },
    "price": {
      "currencyCode": "INR",
      "units": "25000",
      "nanos": 0
    }
  }
  ```

- **Without Price (Free or Variable)**:
  ```json
  {
    "freeFormServiceItem": {
      "categoryCode": "categories/gcid:learning_center",
      "label": {
        "displayName": "Free Career Guidance & Resume Review",
        "description": "Complimentary 1-on-1 counseling session for software engineers."
      }
    }
  }
  ```

### 2. Pre-defined / Structured Service Item (`structuredServiceItem`)
Services matching predefined Google GCID service type IDs under the business category.

- **With Fixed Price**:
  ```json
  {
    "structuredServiceItem": {
      "serviceTypeId": "job_type_id:computer_science",
      "description": "Advanced Computer Science and algorithmic problem-solving courses."
    },
    "price": {
      "currencyCode": "INR",
      "units": "15000",
      "nanos": 0
    }
  }
  ```

- **Without Price**:
  ```json
  {
    "structuredServiceItem": {
      "serviceTypeId": "job_type_id:adult_lessons",
      "description": "Flexible evening and weekend skill enhancement classes."
    }
  }
  ```

---

## Example Multi-Account Input Payload (`sample-update-service-items.json`)

```json
{
  "accounts/108679175144070620594": {
    "locations/14395317695646119136": {
      "serviceItems": [
        {
          "freeFormServiceItem": {
            "categoryCode": "categories/gcid:learning_center",
            "label": {
              "displayName": "Custom Web Development Bootcamp",
              "description": "Hands-on web dev training."
            }
          },
          "price": {
            "currencyCode": "INR",
            "units": "25000",
            "nanos": 0
          }
        },
        {
          "structuredServiceItem": {
            "serviceTypeId": "job_type_id:computer_science",
            "description": "Computer Science training."
          }
        }
      ]
    }
  }
}
```

---

## Logging & Diagnostics

Each run creates a timestamped folder inside `log/update-service-items-logs-YYYYMMDD_HHMMSS/` containing:
- `log.txt`: Console output logs.
- `log_raw.jsonl`: Detailed request & response bodies, count of freeform vs structured services, errors, and latencies.
- `log_summary.jsonl`: Line summary per location.
- `log_summary.json`: Comprehensive final status report.
