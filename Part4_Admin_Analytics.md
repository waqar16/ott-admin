# URVIEW Backend API Documentation

## Part 4: Admin Dashboard & Analytics

**Last Updated:** March 28, 2026

---

## Table of Contents

1. [Analytics System Overview](#analytics-system-overview)
2. [User Roles & Content Visibility](#user-roles--content-visibility)
3. [High-Level Overview Endpoints](#high-level-overview-endpoints)
4. [User Analytics](#user-analytics)
5. [Subscription Analytics](#subscription-analytics)
6. [Revenue Analytics](#revenue-analytics)
7. [Content Analytics](#content-analytics)
8. [Engagement Analytics](#engagement-analytics)
9. [Admin User Management](#admin-user-management)
10. [Video Asset Management](#video-asset-management)

---

**Endpoint:** `GET /admin-dashboard/payments/`
**Endpoint:** `GET /admin-dashboard/subscriptions/`

## High-Level Overview Endpoints

### **Admin Overview** — Dashboard Summary

**Endpoint:** `GET /admin-dashboard/overview/`

**Permission:** IsAdminUser

**Response (200 OK):**

```json
{
  "total_users": 15432,
  "active_users_last_30_days": 9876,
  "inactive_users": 5556,

  "active_subscriptions": 4567,
  "trialing_subscriptions": 234,
  "canceled_subscriptions": 1023,

  "revenue_last_30_days": 45678.9,
  "revenue_all_time": 567890.12,
  "subscription_revenue_last_30_days": 35234.56,
  "ppv_revenue_last_30_days": 10444.34,

  "total_contents": 2345,
  "total_contents_public": 2100,
  "total_contents_beta": 245,
  "total_movies": 1234,
  "total_series": 456,
  "total_episodes": 6789,
  "total_published": 2100,

  "views_last_24_hours": 45678,
  "views_last_7_days": 234567
}
```

**New Metrics:**

- **total_contents_public:** Count of content with `visibility_mode="public"`
- **total_contents_beta:** Count of content with `visibility_mode="beta"`

**Computed Metrics:**

- **Active users:** Users with `last_login >= 30 days ago`
- **Revenue:** Aggregated `Payment.amount_cents` (converted to dollars)
- **Subscriptions:** Count by status
- **Views:** Count of `ViewEvent` records

---

## User Analytics

### 1. **User Growth Timeseries** — New Users Over Time

**Endpoint:** `GET /admin-dashboard/users/growth/`

**Response (200 OK):**

```json
{
  "data": [
    {
      "date": "2025-11-01",
      "new_users": 123
    },
    {
      "date": "2025-11-02",
      "new_users": 145
    }
  ]
}
```

**Behavior:**

- Aggregates `CustomUser.created_at` by day/week/month
- Returns daily/weekly new user count

---

### 2. **Active Users Timeseries**

**Endpoint:** `GET /admin-dashboard/users/active/`

**Response (200 OK):**

```json
{
  "data": [
    {
      "date": "2025-11-01",
      "active_users": 4567
    }
  ]
}
```

**Behavior:**

- Users with activity (login or view event) in date range
- Computed from `CustomUser.last_login` or `ViewEvent.created_at`

---

### 3. **User Role Breakdown**

**Endpoint:** `GET /admin-dashboard/users/roles/`

**Response (200 OK):**

```json
{
  "breakdown": [
    {
      "role": "user",
      "count": 14567,
      "percentage": 93.2
    },
    {
      "role": "beta_tester",
      "count": 823,
      "percentage": 5.3
    },
    {
      "role": "admin",
      "count": 42,
      "percentage": 0.3
    }
  ],
  "total_users": 15432
}
```

**Role Details:**

- **user:** Regular users with access to public content only
- **beta_tester:** Beta testers with access to public + beta content
- **admin:** Administrators with full access

---

### 4. **User Status Breakdown**

**Endpoint:** `GET /admin-dashboard/users/status/`

**Response (200 OK):**

```json
{
  "breakdown": [
    {
      "status": "active",
      "count": 14850
    },
    {
      "status": "suspended",
      "count": 456
    },
    {
      "status": "banned",
      "count": 126
    }
  ]
}
```

---

## Subscription Analytics

**Endpoint:** `GET /admin-dashboard/subscriptions/status/`

**Response (200 OK):**

```json
{
  "breakdown": [
    {
      "status": "active",
      "count": 4567
    },
    {
      "status": "trialing",
      "count": 234
    },
    {
      "status": "past_due",
      "count": 45
    },
    {
      "status": "canceled",
      "count": 1023
    }
  ]
}
```

---

### 3. **Subscription Churn Analytics**

**Endpoint:** `GET /admin-dashboard/subscriptions/churn/`

**Response (200 OK):**

```json
{
  "churn_rate": 0.045,
  "churn_count_last_30_days": 205,
  "by_plan": [
    {
      "plan_name": "Basic",
      "churn_rate": 0.055,
      "count": 130
    },
    {
      "plan_name": "Premium",
      "churn_rate": 0.035,
      "count": 75
    }
  ]
}
```

**Churn:** Subscriptions canceled/expired in period divided by total active at start.

---

### 4. **New Subscriptions Timeseries**

**Endpoint:** `GET /admin-dashboard/subscriptions/new/`

**Response (200 OK):**

```json
{
  "data": [
    {
      "date": "2025-11-01",
      "new_subscriptions": 45,
      "total_value": 623.45
    }
  ]
}
```

---

## Revenue Analytics

### 1. **Revenue Summary**

**Endpoint:** `GET /admin-dashboard/revenue/summary/`

**Response (200 OK):**

```json
{
  "last_30_days": 45678.9,
  "all_time": 567890.12,
  "monthly_recurring_revenue_mrr": 44234.67,
  "average_revenue_per_paying_user_arppu": 9.87,
  "subscription_revenue_last_30": 35234.56,
  "ppv_revenue_last_30": 10444.34
}
```

---

### 2. **Revenue Timeseries**

**Endpoint:** `GET /admin-dashboard/revenue/timeseries/?granularity=daily`

**Query Parameters:**

- `granularity` — `daily`, `weekly`, `monthly`

**Response (200 OK):**

```json
{
  "data": [
    {
      "date": "2025-11-01",
      "revenue": 1234.56,
      "subscription": 1000.0,
      "ppv": 234.56
    }
  ]
}
```

---

### 3. **Revenue by Plan**

**Endpoint:** `GET /admin-dashboard/revenue/plan-breakdown/`

**Response (200 OK):**

```json
{
  "data": [
    {
      "plan_name": "Basic",
      "revenue_last_30": 11724.55,
      "percent": 25.7
    },
    {
      "plan_name": "Premium",
      "revenue_last_30": 35653.78,
      "percent": 78.1
    }
  ]
}
```

---

### 4. **Top Revenue Users**

**Endpoint:** `GET /admin-dashboard/revenue/top-users/`

**Response (200 OK):**

```json
{
  "data": [
    {
      "user_id": "550e8400-...",
      "email": "user@example.com",
      "total_spent": 234.56,
      "subscription_spent": 180.0,
      "ppv_spent": 54.56
    }
  ]
}
```

---

### 5. **Payment Status Breakdown**

**Endpoint:** `GET /admin-dashboard/revenue/payment-status/`

**Response (200 OK):**

```json
{
  "breakdown": [
    {
      "status": "succeeded",
      "count": 5432,
      "amount": 567890.12
    },
    {
      "status": "failed",
      "count": 234,
      "amount": 3456.78
    }
  ]
}
```

---

### 6. **Payment Processor Breakdown**

**Endpoint:** `GET /admin-dashboard/revenue/payment-processor/`

**Response (200 OK):**

```json
{
  "breakdown": [
    {
      "processor": "stripe",
      "count": 5432,
      "amount": 567890.12
    }
  ]
}
```

---

## Content Analytics

### Content Visibility Mode Integration

All content analytics endpoints now support filtering by visibility mode:

**Query Parameters (Optional):**

- `visibility_mode` — `public`, `beta`, or `all` (default: all for admin)
- `content_type` — Filter by movie, series, episode, etc.

**Important:**

- Admin users see all visibility modes by default
- Regular users querying through frontend APIs only see public content
- Beta testers see both public and beta content
- Backend analytics always show full dataset for admin analysis

---

### 1. **Top Movies**

**Endpoint:** `GET /admin-dashboard/content/top-movies/?visibility_mode=public`

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "550e8400-...",
      "title": "Popular Movie",
      "visibility_mode": "public",
      "views": 45678,
      "completion_rate": 0.78,
      "watch_time_hours": 3456
    }
  ]
}
```

---

### 2. **Top Series**

**Endpoint:** `GET /admin-dashboard/content/top-series/?visibility_mode=beta`

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "550e8400-...",
      "title": "Beta Test Series",
      "visibility_mode": "beta",
      "views": 234,
      "episodes_completed": 45,
      "watch_time_hours": 456
    }
  ]
}
```

**Response Notes:**

- When filtered by `visibility_mode=beta`, only shows beta content views
- Useful for monitoring beta content engagement

---

### 3. **Top Episodes**

**Endpoint:** `GET /admin-dashboard/content/top-episodes/`

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "550e8400-...",
      "title": "Series Name - Season 1, Episode 3",
      "visibility_mode": "public",
      "views": 12345,
      "completion_rate": 0.82
    }
  ]
}
```

---

### 4. **Completion Rates**

**Endpoint:** `GET /admin-dashboard/content/completion-rates/?visibility_mode=all`

**Response (200 OK):**

```json
{
  "data": [
    {
      "content_id": "550e8400-...",
      "title": "Movie Title",
      "visibility_mode": "public",
      "completion_rate": 0.75,
      "total_viewers": 4567
    },
    {
      "content_id": "550e8401-...",
      "title": "Beta Movie Title",
      "visibility_mode": "beta",
      "completion_rate": 0.65,
      "total_viewers": 123
    }
  ]
}
```

**Computation:**

- Completion = `ViewEvent.complete` count / (start + progress) count
- Includes visibility mode in response for analysis

---

### 5. **Watch Time Analytics**

**Endpoint:** `GET /admin-dashboard/content/watch-time/?visibility_mode=public`

**Response (200 OK):**

```json
{
  "total_watch_time_hours": 123456,
  "average_watch_time_per_user": 8.5,
  "by_visibility_mode": {
    "public": {
      "hours": 120000,
      "percentage": 97.2
    },
    "beta": {
      "hours": 3456,
      "percentage": 2.8
    }
  },
  "by_content": [
    {
      "content_id": "550e8400-...",
      "title": "Popular Movie",
      "visibility_mode": "public",
      "watch_time_hours": 12345
    }
  ]
}
```

---

### 6. **Drop-Off Analytics**

**Endpoint:** `GET /admin-dashboard/content/dropoff/`

**Response (200 OK):**

```json
{
  "data": [
    {
      "content_id": "550e8400-...",
      "title": "Movie Title",
      "visibility_mode": "public",
      "dropoff_at_25_percent": 0.12,
      "dropoff_at_50_percent": 0.25,
      "dropoff_at_75_percent": 0.45
    }
  ]
}
```

---

### 7. **PPV Performance**

**Endpoint:** `GET /admin-dashboard/content/ppv-performance/`

**Response (200 OK):**

```json
{
  "data": [
    {
      "content_id": "550e8400-...",
      "title": "PPV Content",
      "visibility_mode": "public",
      "price_dollars": 499,
      "purchases": 234,
      "revenue": 1167.66
    }
  ]
}
```

---

### 8. **Content Detail Analytics**

**Endpoint:** `GET /admin-dashboard/content/<content_id>/analytics/`

**Response (200 OK):**

```json
{
  "content_id": "550e8400-...",
  "title": "Movie Title",
  "visibility_mode": "public",
  "views": 45678,
  "watch_time_hours": 3456,
  "completion_rate": 0.78,
  "revenue": 234.56,
  "by_device": [
    {
      "device_type": "web",
      "views": 34567,
      "percent": 75.6
    }
  ]
}
```

---

## Engagement Analytics

### 1. **Active Users** — Current Activity

**Endpoint:** `GET /admin-dashboard/engagement/active-users/`

**Response (200 OK):**

```json
{
  "active_now": 456,
  "active_last_hour": 1234,
  "active_today": 4567,
  "active_last_7_days": 9876
}
```

---

### 2. **Watch Time Analytics**

**Endpoint:** `GET /admin-dashboard/engagement/watch-time/`

**Response (200 OK):**

```json
{
  "total_hours": 123456,
  "average_per_user": 8.5,
  "median_per_user": 5.2
}
```

---

### 3. **Peak Hours** — When Do Users Watch?

**Endpoint:** `GET /admin-dashboard/engagement/peak-hours/`

**Response (200 OK):**

```json
{
  "data": [
    {
      "hour": 0,
      "views": 1234
    },
    {
      "hour": 1,
      "views": 1100
    },
    ...
    {
      "hour": 20,
      "views": 5432
    },
    {
      "hour": 21,
      "views": 6789
    }
  ]
}
```

---

### 4. **Device Breakdown**

**Endpoint:** `GET /admin-dashboard/engagement/devices/`

**Response (200 OK):**

```json
{
  "breakdown": [
    {
      "device_type": "web",
      "views": 34567,
      "users": 4567,
      "percent": 75.6
    },
    {
      "device_type": "ios",
      "views": 8234,
      "users": 1234,
      "percent": 18.0
    },
    {
      "device_type": "android",
      "views": 2456,
      "users": 567,
      "percent": 5.4
    }
  ]
}
```

---

### 5. **Engagement Timeline**

**Endpoint:** `GET /admin-dashboard/engagement/timeline/?days=30`

**Response (200 OK):**

```json
{
  "data": [
    {
      "date": "2025-11-01",
      "active_users": 4567,
      "views": 45678,
      "watch_hours": 1234,
      "new_signups": 45
    }
  ]
}
```

---

## Admin User Management

Admin endpoints for managing users (separate from user self-management).

### 1. **List All Users** — Admin View

**Endpoint:** `GET /admin-dashboard/users/` (or `/auth/users/`)

**Permission:** IsAuthenticated (admin check in view)

**Response (200 OK):**

```json
[
  {
    "id": "550e8400-...",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user",
    "is_active": true,
    "status": "active",
    "created_at": "2025-12-01T10:30:00Z"
  }
]
```

---

### 2. **Get User Details**

**Endpoint:** `GET /admin-dashboard/users/<user_id>/` (or `/auth/users/<user_id>/`)

**Response (200 OK):**

```json
{
  "id": "550e8400-...",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "is_active": true,
  "status": "active",
  "created_at": "2025-12-01T10:30:00Z",
  "subscriptions": [
    {
      "id": "550e8400-...",
      "plan": "Premium",
      "status": "active"
    }
  ]
}
```

---

### 3. **Update User**

**Endpoint:** `PATCH /admin-dashboard/users/<user_id>/update/` (or `/auth/users/<user_id>/update/`)

**Request:**

```json
{
  "name": "Jane Doe",
  "role": "admin",
  "status": "suspended"
}
```

**Response (200 OK):**

```json
{
  "msg": "User updated successfully"
}
```

---

### 4. **Delete User**

**Endpoint:** `DELETE /admin-dashboard/users/<user_id>/delete/` (or `/auth/users/<user_id>/delete/`)

**Response (204 No Content)**

---

## Video Asset Management

### **List Video Assets** — Ingestion Status

**Endpoint:** `GET /admin-dashboard/content/video-assets/`

**Permission:** IsAdminUser

**Response (200 OK):**

```json
{
  "count": 234,
  "results": [
    {
      "id": "550e8400-...",
      "content_id": "550e8400-...",
      "content_title": "Movie Title",
      "source_s3_key": "raw/content/.../movie.mp4",
      "ingest_status": "ready",
      "file_size": 5368709120,
      "duration_seconds": 7200,
      "codec": "H.264",
      "width": 1920,
      "height": 1080,
      "drm_enabled": true,
      "created_at": "2025-12-10T10:30:00Z"
    }
  ]
}
```

**Query Parameters:**

- `ingest_status` — Filter by status (e.g., `?ingest_status=processing`)
- `page` — Pagination

**Status Meanings:**

- **`uploaded`** — S3 upload complete, awaiting transcoding
- **`processing`** — MediaConvert job running
- **`ready`** — Transcoding complete, ready for publish
- **`failed`** — Transcoding failed (error details in logs)

---

## Managing Beta Testers & Beta Content

### Beta Testing Workflow

**Step 1: Create/Assign Beta Testers**

Use the Admin User Management API to assign users to the `beta_tester` role:

**Endpoint:** `PATCH /admin-dashboard/users/<user_id>/update/`

**Request:**

```json
{
  "role": "beta_tester"
}
```

**Response (200 OK):**

```json
{
  "msg": "User updated successfully",
  "user": {
    "id": "550e8400-...",
    "email": "tester@example.com",
    "role": "beta_tester"
  }
}
```

---

**Step 2: Create Beta Content**

When creating new content via the Content API, use `visibility_mode="beta"`:

**Endpoint:** `POST /api/v1/content/content/`

**Request:**

```json
{
  "title": "New Beta Movie",
  "description": "Testing new format",
  "content_type": "movie",
  "visibility_mode": "beta",
  "status": "draft",
  "media_type": "flat",
  "genres": ["550e8400-..."]
}
```

**Response (201 Created):**

```json
{
  "id": "550e8401-...",
  "title": "New Beta Movie",
  "visibility_mode": "beta",
  "status": "draft"
}
```

---

**Step 3: Monitor Beta Content Engagement**

Track how beta testers interact with beta content:

**Endpoint:** `GET /admin-dashboard/content/top-movies/?visibility_mode=beta`

**Response:**

```json
{
  "data": [
    {
      "id": "550e8401-...",
      "title": "New Beta Movie",
      "visibility_mode": "beta",
      "views": 45,
      "completion_rate": 0.67,
      "watch_time_hours": 3.5,
      "beta_tester_feedback": "Good quality"
    }
  ]
}
```

---

**Step 4: Graduate Content to Public**

Once beta testing is complete, promote content to public:

**Endpoint:** `PATCH /api/v1/content/content/<content_id>/`

**Request:**

```json
{
  "visibility_mode": "public",
  "status": "published"
}
```

**Response (200 OK):**

```json
{
  "id": "550e8401-...",
  "title": "New Beta Movie",
  "visibility_mode": "public",
  "status": "published"
}
```

---

### Beta Tester Analytics Dashboard

**Key Metrics for Beta Programs:**

1. **Beta Tester Engagement**

   ```
   GET /admin-dashboard/content/watch-time/?visibility_mode=beta
   ```

   - See how much beta testers watch
   - Compare completion rates for beta vs public content

2. **Beta Content ROI**

   ```
   GET /admin-dashboard/content/completion-rates/?visibility_mode=beta
   ```

   - Track which beta content has good engagement
   - Decide which to promote to public

3. **Active Beta Testers**

   ```
   GET /admin-dashboard/users/roles/
   ```

   - Monitor total beta tester count
   - Track growth in testing community

4. **Beta Content Inventory**

   ```
   GET /admin-dashboard/overview/
   ```

   - `total_contents_beta` — Current beta content count
   - Compare against public content

---

### API Access for Beta Testers

**Frontend Client Logic:**

```javascript
// Example: Loading content as different user types

// 1. Anonymous user (no token)
const anonResponse = await fetch('https://api/content/movies/')
// Returns: public content only

// 2. Regular authenticated user
const userResponse = await fetch('https://api/content/movies/', {
  headers: {
    Authorization: 'Bearer USER_JWT_TOKEN', // role: "user"
  },
})
// Returns: public content only

// 3. Beta tester
const betaTesterResponse = await fetch('https://api/content/movies/', {
  headers: {
    Authorization: 'Bearer BETA_TESTER_JWT_TOKEN', // role: "beta_tester"
  },
})
// Returns: public + beta content
```

---

### Common Use Cases

**Case 1: Launch New Format (e.g., VR Content)**

1. Create content with `visibility_mode="beta"`, `media_type="vr_180_sbs"`
2. Assign 50-100 beta testers
3. Monitor completion rates and device performance
4. Collect feedback via surveys/support tickets
5. Fix issues and promote to public

**Case 2: Test UI Changes**

1. Create beta content version with new metadata
2. Track engagement differences vs public version
3. Use data to decide on rollout

**Case 3: International Expansion**

1. Create regional beta content with localization
2. Test with beta testers from target regions
3. Monitor subtitles, audio quality, timezone handling
4. Graduate to public for that region

---

## Summary

Admin analytics endpoints provide:

| Category               | Key Endpoints                                                                    |
| ---------------------- | -------------------------------------------------------------------------------- |
| **Overview**           | `/overview/`                                                                     |
| **Users**              | `/users/growth/`, `/users/active/`, `/users/roles/`, `/users/status/`            |
| **Subscriptions**      | `/subscriptions/plan-breakdown/`, `/subscriptions/churn/`, `/subscriptions/new/` |
| **Revenue**            | `/revenue/summary/`, `/revenue/timeseries/`, `/revenue/top-users/`               |
| **Content**            | `/content/top-movies/`, `/content/completion-rates/`, `/content/dropoff/`        |
| **Content Visibility** | Filter by `visibility_mode=public`, `beta`, or `all`                             |
| **Engagement**         | `/engagement/active-users/`, `/engagement/peak-hours/`, `/engagement/devices/`   |
| **Users (CRUD)**       | `/auth/users/`, `/auth/users/<id>/update/`, `/auth/users/<id>/delete/`           |
| **Video Assets**       | `/admin-dashboard/content/video-assets/`                                         |
| **Beta Testing**       | Assign roles, create beta content, monitor engagement                            |

All require **IsAdminUser** permission. Endpoints are read-only (no mutations) except user CRUD.

**Key Features:**

- ✅ Three user roles: `admin`, `user`, `beta_tester`
- ✅ Two content visibility modes: `public` (default), `beta`
- ✅ Automatic role-based access control (no extra tokens needed)
- ✅ Backward compatible (all existing content defaults to public)
- ✅ Comprehensive analytics with visibility mode breakdown

**Next:** [Part 5: Profiles & Marketing](Part5_Profiles_Marketing.md) — User profiles, preferences, blog/marketing content.
