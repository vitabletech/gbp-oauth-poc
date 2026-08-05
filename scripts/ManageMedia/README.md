# Manage Location Media & Photos (`ManageMedia`)

This module provides complete management for Google Business Profile photos and videos using the Google Business Profile API v4 (`accounts.locations.media`).

- **API Documentation References**:
  - [POST Create Media](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.media/create)
  - [GET Get Media Item / Inspect Processing Status](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.media/get)
  - [PATCH Update Media Category](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.media/patch)
  - [DELETE Delete Media Item](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.media/delete)

---

## Module Folder Structure

```
scripts/ManageMedia/
├── upload-media.js                     # 1. Bulk upload photos & videos
├── get-media.js                        # 2. Fetch & inspect media items (including processing/pending status)
├── update-media.js                     # 3. Patch media metadata (update category)
├── delete-media.js                     # 4. Delete specified media items by mediaKey
├── README.md                           # Documentation & API specifications guide
└── input/
    ├── sample-upload-media.json         # Input payload for media uploads
    ├── sample-update-media-metadata.json# Input payload for category patches
    └── sample-delete-media.json        # Input payload for media deletions
```

---

## 1. Bulk Upload Media (`upload-media.js`)

Uploads new photos and videos across multiple accounts and locations.

```bash
# Dry Run Validation
npm run upload-media:dry

# Live Upload
npm run upload-media

# Custom Input File
node scripts/ManageMedia/upload-media.js --dataFile=./scripts/ManageMedia/input/my-photos.json
```

---

## 2. Get & Inspect Media Items / Pending Status (`get-media.js`)

Fetches all media items for locations under your target accounts, inspecting Google processing status (`insight`, `dimensions`, pending approval states).

```bash
# Fetch media items across all accounts in target-accounts.txt
npm run get-media

# Fetch specific media item by mediaKey
node scripts/ManageMedia/get-media.js --mediaKey=media/1234567890123456789
```

---

## 3. Update Media Metadata / Category (`update-media.js`)

Updates the category of an uploaded photo or video (`PATCH /v4/accounts/*/locations/*/media/*?updateMask=locationAssociation.category`).

```bash
# Dry Run Validation
npm run update-media:dry

# Live Category Update
npm run update-media
```

---

## 4. Delete Media Items (`delete-media.js`)

Deletes specified media items by `mediaKey` (`DELETE /v4/accounts/*/locations/*/media/*`).

```bash
# Dry Run Validation
npm run delete-media:dry

# Live Media Deletion
npm run delete-media
```

---

## Photo Categories Supported by Google API v4

- `COVER`: Primary cover photo of the business.
- `PROFILE`: Logo avatar / profile photo.
- `LOGO`: Official logo image.
- `EXTERIOR`: Outside storefront / building views.
- `INTERIOR`: Inside store / indoor spaces.
- `PRODUCT`: Products / merchandise items.
- `AT_WORK`: Staff serving customers or working.
- `FOOD_AND_DRINK`: Food, beverages, or dishes.
- `MENU`: Menu photos.
- `COMMON_AREA`: Shared lobbies / common areas.
- `ROOMS`: Hotel / lodging rooms.
- `TEAMS`: Staff and team photos.
- `ADDITIONAL`: General photos.

---

## Logging & Diagnostics

Each execution creates timestamped logs inside `log/` (`upload-media-logs`, `get-media-logs`, `update-media-logs`, `delete-media-logs`):
- `log.txt`: Console output.
- `log_raw.jsonl`: Detailed request & response bodies, uploaded/patched/deleted media keys, errors, and latencies.
- `log_summary.json`: Comprehensive final status report.
