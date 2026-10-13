# URVIEW Backend API Documentation
## Creator Payouts & Revenue Split System (Developer Reference)

**Base URL:** `/api/v1/admin-dashboard`  
**Authentication:** JWT Bearer Token (`Authorization: Bearer <access_token>`)  
**Permission:** `IsAdminUser` (Staff / Admin role required)

---

## 1. System Overview & Economic Model

The payout engine calculates monthly royalty distributions based on unique platform views, following a **two-section revenue architecture**:

```
TOTAL PLATFORM INFLOW (Section 1)
└── Gross Revenue (e.g., £10.00)
    ├── 70% Retained by URview (£7.00: 20-40% operational costs + platform profit)
    └── 30% Creator Revenue Pool (£3.00)
            │
            ▼
    CREATOR REVENUE POOL (Section 2 - Treated as 100% on the payout side)
    ├── Creator 1 (50% views)  = £1.50
    ├── Creator 2 (10% views)  = £0.30
    ├── Creator 3 (30% views)  = £0.90
    └── URview Creator (10% views)= £0.30  <-- In-house content claims share
```

### Calculation Rules
1. **Creator Pool (Section 2):**  
   $$\text{Creator Revenue Pool} = \text{Gross Revenue} \times (\text{creator\_share\_percentage} / 100)$$  
   *(Default: 30.0%)*
2. **Multi-Creator Title Split:**  
   If a single title has $N$ creators assigned, each unique view on that title is divided equally:
   $$\text{View Credit} = \frac{1}{N} \quad (\text{e.g., } 2 \text{ creators} \implies 0.5 \text{ views each})$$
3. **View Share (%):**  
   $$\text{View Share \%} = \left(\frac{\text{Creator's Unique Views}}{\text{Total Platform Unique Views}}\right) \times 100$$
4. **Individual Creator Payout:**  
   $$\text{Payout} = \left(\frac{\text{View Share \%}}{100}\right) \times \text{Creator Revenue Pool}$$

---

## 2. API Endpoints

### 2.1. Master Admin Report (JSON)
Retrieves the comprehensive financial overview containing **Section 1** (Total In / Platform Retained) and **Section 2** (Creator Pool & Breakdown).

* **Method:** `GET`
* **URL:** `/api/v1/admin-dashboard/creator-report`
* **Permission:** `IsAdminUser`

#### Query Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :---: | :---: | :---: | :--- |
| `start_date` | `string` | No | `YYYY-MM-01` | Start date filter (`YYYY-MM-DD`). Defaults to 1st of current month. |
| `end_date` | `string` | No | Current Date | End date filter (`YYYY-MM-DD`). |
| `revenue` | `number` | No | Auto | Gross revenue amount in major currency units (e.g., `10.00`). If omitted, automatically sums succeeded payments from the DB. |
| `creator_share_percentage` | `number` | No | `30.0` | Percentage of gross revenue allocated to Section 2 (default: 30%). |
| `currency` | `string` | No | `GBP` | 3-letter currency code (e.g. `GBP`, `USD`). |

#### Request Example
```http
GET /api/v1/admin-dashboard/creator-report?revenue=10.00&creator_share_percentage=30&start_date=2026-10-01&end_date=2026-10-31 HTTP/1.1
Host: api.urview.com
Authorization: Bearer <admin_jwt_token>
```

#### Response (200 OK)
```json
{
  "results": {
    "section_1_total_in": {
      "title": "Platform Gross Inflow (Section 1)",
      "gross_revenue": 10.0,
      "currency": "GBP",
      "creator_share_percentage": 30.0,
      "platform_costs_and_margin_percentage": 70.0,
      "creator_revenue_pool": 3.0,
      "platform_retained_revenue": 7.0,
      "start_date": "2026-10-01",
      "end_date": "2026-10-31",
      "total_unique_views": 100,
      "unassigned_views": 0.0
    },
    "section_2_creator_revenue": {
      "title": "Creator Revenue Pool (Section 2)",
      "creator_revenue_pool": 3.0,
      "pool_label": "30.0% of Total In (100% of Creator Distributable Revenue)",
      "currency": "GBP",
      "total_creators": 4,
      "total_unique_views": 100,
      "avg_views_per_creator": 25.0,
      "top_performer": {
        "creator_id": "c1f7b8d4-5b23-4a6c-9f8e-123456789abc",
        "creator_name": "Studio Alpha",
        "unique_views": 50.0,
        "percentage_of_total_views": 50.0,
        "earning": 1.5,
        "top_contents": [
          { "content_id": "11111111-2222-3333-4444-555555555555", "title": "VR Space Safari", "views": 50.0 }
        ]
      },
      "lowest_performer": {
        "creator_id": "c2f7b8d4-5b23-4a6c-9f8e-987654321def",
        "creator_name": "Indie Director",
        "unique_views": 10.0,
        "percentage_of_total_views": 10.0,
        "earning": 0.3,
        "top_contents": []
      },
      "creators": [
        {
          "creator_id": "c1f7b8d4-5b23-4a6c-9f8e-123456789abc",
          "creator_name": "Studio Alpha",
          "unique_views": 50.0,
          "percentage_of_total_views": 50.0,
          "earning": 1.5,
          "top_contents": [
            { "content_id": "11111111-2222-3333-4444-555555555555", "title": "VR Space Safari", "views": 50.0 }
          ]
        },
        {
          "creator_id": "c3f7b8d4-5b23-4a6c-9f8e-333333333333",
          "creator_name": "Creator Beta",
          "unique_views": 30.0,
          "percentage_of_total_views": 30.0,
          "earning": 0.9,
          "top_contents": []
        },
        {
          "creator_id": "c4f7b8d4-5b23-4a6c-9f8e-444444444444",
          "creator_name": "URview Originals",
          "unique_views": 10.0,
          "percentage_of_total_views": 10.0,
          "earning": 0.3,
          "top_contents": []
        },
        {
          "creator_id": "c2f7b8d4-5b23-4a6c-9f8e-987654321def",
          "creator_name": "Indie Director",
          "unique_views": 10.0,
          "percentage_of_total_views": 10.0,
          "earning": 0.3,
          "top_contents": []
        }
      ]
    },
    "summary": {
      "start_date": "2026-10-01",
      "end_date": "2026-10-31",
      "currency": "GBP",
      "total_unique_views": 100,
      "total_revenue": 10.0,
      "creator_revenue_pool": 3.0,
      "creator_share_percentage": 30.0,
      "platform_retained_revenue": 7.0,
      "total_creators": 4,
      "avg_views_per_creator": 25.0
    }
  }
}
```

---

### 2.2. Creator-Safe Statement (JSON)
Returns **only Section 2** metrics for a single creator. **Section 1 (gross revenue, platform costs, and retained margins) is completely stripped.**

* **Method:** `GET`
* **URL:** `/api/v1/admin-dashboard/creator-report/statement`
* **Permission:** `IsAdminUser`

#### Query Parameters
| Parameter | Type | Required | Description |
| :--- | :---: | :---: | :--- |
| `creator_id` | `UUID` | **Yes** | UUID of the creator. |
| `start_date` | `string` | No | Start date (`YYYY-MM-DD`). |
| `end_date` | `string` | No | End date (`YYYY-MM-DD`). |
| `revenue` | `number` | No | Gross revenue pool (used internally to compute the 30% payout). |
| `currency` | `string` | No | Currency symbol (default: `GBP`). |

#### Request Example
```http
GET /api/v1/admin-dashboard/creator-report/statement?creator_id=c1f7b8d4-5b23-4a6c-9f8e-123456789abc&revenue=10.00 HTTP/1.1
Host: api.urview.com
Authorization: Bearer <admin_jwt_token>
```

#### Response (200 OK)
```json
{
  "results": {
    "creator_id": "c1f7b8d4-5b23-4a6c-9f8e-123456789abc",
    "creator_name": "Studio Alpha",
    "email": "contact@studioalpha.com",
    "statement_period": {
      "start_date": "2026-10-01",
      "end_date": "2026-10-31"
    },
    "currency": "GBP",
    "unique_views": 50.0,
    "percentage_of_views": 50.0,
    "payout_due": 1.5,
    "contents": [
      {
        "content_id": "11111111-2222-3333-4444-555555555555",
        "title": "VR Space Safari",
        "views": 50.0
      }
    ]
  }
}
```

#### Error Responses
* `400 Bad Request`:
  ```json
  { "error": "creator_id query parameter is required for a creator statement." }
  ```
* `404 Not Found`:
  ```json
  { "error": "Creator not found." }
  ```

---

### 2.3. Excel Export (.xlsx)
Generates styled, production-ready Excel workbooks.

* **Method:** `GET`
* **URL:** `/api/v1/admin-dashboard/creator-report/excel`
* **Response Content-Type:** `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`

#### Modes of Operation:
1. **Master Admin Workbook (No `creator_id` passed):**
   * Sheet Name: `Master Revenue Report`
   * Contains **SECTION 1** block with Gross Inflow, 30% Allocation Rate, and Platform Retained.
   * Followed by **SECTION 2** table listing all creators, unique views, percentage share, and payouts.
   * Auto-calculated summary total row.
   * Download Filename: `URview_Creator_Report_YYYYMM.xlsx`

2. **Single Creator Royalty Statement (`?creator_id=<UUID>` passed):**
   * Sheet Name: `Royalty Statement`
   * Clean, branded payout statement ready to send to the creator.
   * Displays Creator Name, Statement Period, Total Unique Views, Share of Platform (%), Total Payout Due (£), and Content View breakdown table.
   * **Gross revenue, platform costs, and other creator names are completely absent.**
   * Download Filename: `Royalty_Statement_<Creator_Name>_YYYYMM.xlsx`

---

## 3. Creator Profile Management (CRUD)

Creators are managed via standard RESTful endpoints under `/api/v1/content/creators/`:

| Method | Endpoint | Description |
| :---: | :--- | :--- |
| `GET` | `/api/v1/content/creators` | List all registered creators. |
| `POST` | `/api/v1/content/creators` | Create new creator (`name`, `email`, `phone`, `bio`). |
| `GET` | `/api/v1/content/creators/<uuid>` | Retrieve creator details. |
| `PUT` / `PATCH` | `/api/v1/content/creators/<uuid>` | Update creator details. |
| `DELETE` | `/api/v1/content/creators/<uuid>` | Delete creator profile. |

### Assigning Creators to Titles
In the Content API (`POST` / `PATCH` `/api/v1/content/content/`), pass creator UUIDs in the `creators` array field:

```json
{
  "title": "Cosmic Journey 360",
  "content_type": "movie",
  "media_type": "vr_360_sbs",
  "creators": [
    "c1f7b8d4-5b23-4a6c-9f8e-123456789abc",
    "c4f7b8d4-5b23-4a6c-9f8e-444444444444"
  ]
}
```
*When 2 creators are passed as shown above, each unique playback view is split 50/50 between them automatically.*
