# Update Attributes Script (`UpdateAttributes`)

This module handles bulk updating attributes (amenities, payments, accessibility, fuel/automotive services, social profile URLs, etc.) across multiple Google Business Profile locations using the Google Business Information REST API v1 (`locations.updateAttributes`).

- **Google API Reference**: [PATCH /v1/{name=locations/*/attributes}](https://developers.google.com/my-business/reference/businessinformation/rest/v1/locations/updateAttributes)

---

## Folder Structure

```
scripts/UpdateAttributes/
├── update-attributes.js             # Main bulk update attributes execution script
├── README.md                        # Complete documentation & usage guide
└── input/
    └── sample-update-attributes.json # Input payload containing 39 sample attribute configurations
```

---

## How to Run

### 1. Dry Run (Simulated & Validated)
```bash
npm run update-attributes:dry
```
or
```bash
node scripts/UpdateAttributes/update-attributes.js --dryRun=true
```

### 2. Live Attributes Update
```bash
npm run update-attributes
```
or
```bash
node scripts/UpdateAttributes/update-attributes.js
```

### 3. Custom Input File
```bash
node scripts/UpdateAttributes/update-attributes.js --dataFile=./scripts/UpdateAttributes/input/my-custom-attributes.json
```

---

## Supported Attributes Catalog (39 Attributes)

### 1. Accessibility (`valueType: "BOOL"`)
- `has_assisted_listening_devices`
- `has_hearing_loop`
- `has_wheelchair_accessible_entrance`
- `has_wheelchair_accessible_parking`
- `has_wheelchair_accessible_restroom`
- `has_wheelchair_accessible_seating`

### 2. Onsite Amenities & Fuel / Automotive Services (`valueType: "BOOL"`)
- `has_onsite_services`
- `has_onsite_convenience_store`
- `has_car_wash`
- `has_free_air`
- `has_car_vacuum`
- `has_restroom`
- `has_restroom_unisex`
- `offers_compressed_natural_gas`
- `sells_gas_diesel`
- `sells_gas_ethanol_free`
- `has_full_service_gas`
- `offers_liquefied_petroleum_gas`
- `has_oil_change`
- `offers_pollution_under_control_certification`
- `is_owned_by_women`

### 3. Parking Options (`valueType: "BOOL"`)
- `has_onsite_parking`
- `has_parking_garage_free`
- `has_parking_lot_free`
- `has_parking_street_free`
- `has_parking_garage_paid`
- `has_parking_lot_paid`
- `has_parking_street_paid`

### 4. Payments (`valueType: "BOOL"` & `"REPEATED_ENUM"`)
- `requires_cash_only` (`BOOL`)
- `pay_credit_card` (`BOOL`)
- `pay_debit_card` (`BOOL`)
- `pay_mobile_nfc` (`BOOL`)
- `pay_mobile_tez` (`BOOL`)
- `pay_credit_card_types_accepted` (`REPEATED_ENUM`: `"VISA"`, `"MASTERCARD"`, `"AMERICAN_EXPRESS"`)

### 5. Social Profile & Messaging URLs (`valueType: "URL"`)
- `url_whatsapp`
- `url_facebook`
- `url_instagram`
- `url_linkedin`
- `url_twitter`
- `url_youtube`

---

## Logging & Diagnostics

Each run creates a timestamped folder inside `log/update-attributes-logs-YYYYMMDD_HHMMSS/` containing:
- `log.txt`: Standard console log output.
- `log_raw.jsonl`: Detailed request & response bodies, error stack traces, and latencies.
- `log_summary.jsonl`: Line-by-line summary per location.
- `log_summary.json`: Comprehensive structured summary report.
