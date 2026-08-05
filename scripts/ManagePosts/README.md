# Manage Location Local Posts (`ManagePosts`)

This module provides complete lifecycle management for Google Business Profile Local Posts (What's New, Events, Offers, Announcements) using the Google Business Profile API v4 (`accounts.locations.localPosts`).

- **Google API References**:
  - [GET List Local Posts](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.localPosts/list)
  - [POST Create Local Post](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.localPosts/create)
  - [GET Get Local Post](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.localPosts/get)
  - [PATCH Update Local Post](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.localPosts/patch)
  - [DELETE Delete Local Post](https://developers.google.com/my-business/reference/rest/v4/accounts.locations.localPosts/delete)

---

## Module Folder Structure

```
scripts/ManagePosts/
├── create-post.js               # 1. Single & Bulk create local posts
├── fetch-posts.js               # 2. List & Get local posts per location / account
├── update-post.js               # 3. Patch local post content & CTA
├── delete-post.js               # 4. Delete specified local posts by postId
├── README.md                     # Documentation & API specifications guide
└── input/
    ├── sample-create-posts.json  # Input payload for creating posts (STANDARD, EVENT, OFFER, CTAs)
    ├── sample-update-post.json   # Input payload for patching posts
    └── sample-delete-posts.json  # Input payload for deleting posts
```

---

## 1. Single & Bulk Create Local Posts (`create-post.js`)

Creates new local posts across multiple accounts and locations.

```bash
# Dry Run Validation
npm run create-posts:dry

# Live Post Creation
npm run create-posts

# Custom Input File
node scripts/ManagePosts/create-post.js --dataFile=./scripts/ManagePosts/input/my-posts.json
```

---

## 2. Fetch / List Local Posts (`fetch-posts.js`)

Fetches all local posts across locations listed in `target-accounts.txt`. Outputs results to `data/fetched-posts.json`.

```bash
# List all posts across accounts
npm run fetch-posts

# Fetch specific post by postId
node scripts/ManagePosts/fetch-posts.js --postId=localPosts/1234567890123456789
```

---

## 3. Update / Patch Local Post (`update-post.js`)

Patches an existing local post's summary or call-to-action button.

```bash
# Dry Run Validation
npm run update-post:dry

# Live Update
npm run update-post
```

---

## 4. Delete Local Posts (`delete-post.js`)

Deletes specified local posts by `postId`.

```bash
# Dry Run Validation
npm run delete-posts:dry

# Live Deletion
npm run delete-posts
```

---

## Post Topics & CTA Button Types Supported

### 1. Topic Types (`topicType`):
- `STANDARD`: Regular update / Announcement ("What's New").
- `EVENT`: Scheduled event with start/end date and time.
- `OFFER`: Promotional offer with coupon code, redeem link, and terms.
- `PRODUCT`: Product feature post.

### 2. Call-To-Action Types (`actionType`):
- `BOOK`: Book now
- `ORDER`: Order online
- `BUY`: Buy now
- `LEARN_MORE`: Learn more
- `SIGN_UP`: Sign up
- `CALL`: Call business

---

## Logging & Diagnostics

Each run creates timestamped logs inside `log/` (`create-posts-logs`, `fetch-posts-logs`, `update-post-logs`, `delete-posts-logs`):
- `log.txt`: Console output.
- `log_raw.jsonl`: Detailed request & response bodies, created/patched/deleted post IDs, errors, and latencies.
- `log_summary.json`: Comprehensive final status report.
