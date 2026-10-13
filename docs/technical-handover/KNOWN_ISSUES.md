# Known Issues, Inconsistencies & Technical Debt — URVIEW OTT

This document details all incomplete features, architectural discrepancies, potential vulnerabilities, and technical debt identified during static inspection of the codebase.

---

## 1. Issue Severity Classification Summary

| # | Finding / Issue | Affected File(s) | Severity | Category |
|---|---|---|---|---|
| 1 | Hardcoded production domain in SSE stream listener | `app/admin/movie-management/page.tsx` | **High** | Configuration / Integration |
| 2 | Insecure client-side JWT token storage | `lib/tokenStore.ts` | **High** | Security / Vulnerability |
| 3 | Hardcoded fallback S3 callback API key | `lib/contentApi.ts` | **High** | Security / Configuration |
| 4 | Divergent User Profiles API implementations | `lib/profilesApi.ts` vs `app/admin/user-profiles/page.tsx` | **High** | API Integration Inconsistency |
| 5 | Unimplemented Premiere Management stub | `app/admin/premiere/page.tsx` | **Medium** | Incomplete Feature |
| 6 | Coexisting dual auth systems with dead NextAuth code | `lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts` | **Medium** | Architecture / Dead Code |
| 7 | Silent fallback to mock data masking API errors | `app/admin/page.tsx`, `app/admin/analytics/page.tsx` | **Medium** | User Experience / Observability |
| 8 | Orphaned additional settings management components | `app/admin/additional-settings/page.tsx` | **Medium** | Incomplete Integration |
| 9 | Edge middleware per-route backend query latency | `middleware.ts` | **Medium** | Performance / Scalability |
| 10| Total absence of automated test suite | `package.json` | **Medium** | Quality Assurance / DevOps |
| 11| Fragmented HTTP client usage (Axios vs native Fetch) | Across all files in `lib/` | **Low** | Code Consistency |
| 12| Hardcoded fallback domain in edge middleware | `middleware.ts` | **Low** | Configuration |

---

## 2. Granular Issue Explanations

### Issue 1: Hardcoded Production Domain in SSE Stream Listener
- **Severity:** **High**
- **Affected File:** [app/admin/movie-management/page.tsx#L87-L89](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/movie-management/page.tsx#L87-L89)
- **Explanation:**
  The Server-Sent Events (SSE) listener for transcoding progress connects to an absolute hardcoded production domain:
  ```typescript
  const es = new EventSource(
    `https://api.urview.com/api/v1/content/transcoding-progress/${contentId}`
  );
  ```
  Instead of utilizing `API_BASE` or `API_CONFIG.baseUrl`, it targets `https://api.urview.com/`. When developers run the application against a local backend (`http://localhost:8000`) or an AWS staging API Gateway, SSE transcoding progress notifications will fail or attempt to stream from production.
- **Remediation:** Replace the hardcoded URL with `` `${API_BASE}api/v1/content/transcoding-progress/${contentId}` ``.

---

### Issue 2: Insecure Client-Side JWT Token Storage
- **Severity:** **High**
- **Affected File:** [lib/tokenStore.ts#L66-L70](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/tokenStore.ts#L66-L70)
- **Explanation:**
  Authentication tokens are saved into both non-httpOnly browser cookies via `js-cookie` and browser `localStorage`:
  ```typescript
  Cookies.set('access_token', accessToken, { path: '/', sameSite: 'lax' })
  Cookies.set('refresh_token', refreshToken, { path: '/', sameSite: 'lax' })
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  ```
  Any third-party script, injected dependency, or Cross-Site Scripting (XSS) vulnerability can access and extract both access and refresh tokens.
- **Remediation:** Transition authentication to server-issued `httpOnly`, `Secure`, `SameSite=Strict` cookies handled via Next.js Route Handlers.

---

### Issue 3: Hardcoded Fallback S3 Callback API Key
- **Severity:** **High**
- **Affected File:** [lib/contentApi.ts#L60](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/contentApi.ts#L60)
- **Explanation:**
  ```typescript
  const S3_CALLBACK_KEY = process.env.NEXT_PUBLIC_S3_CALLBACK_KEY || 'devtestkey';
  ```
  The fallback key defaults to the plain string `'devtestkey'`. Additionally, because the variable uses the `NEXT_PUBLIC_` prefix, any defined key is baked into the public client-side JavaScript bundle during build time.
- **Remediation:** S3 callback endpoints should never be called by client-side browser code; cloud ingestion completions must be driven server-to-server via S3 event notifications and SNS/EventBridge.

---

### Issue 4: Divergent User Profiles API Implementations
- **Severity:** **High**
- **Affected Files:**
  - [lib/profilesApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/profilesApi.ts)
  - [app/admin/user-profiles/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/user-profiles/page.tsx)
- **Explanation:**
  There are two conflicting implementations of the User Profiles module:
  1. `lib/profilesApi.ts` implements methods targeting `/api/v1/profiles` with camelCase/snake_case hybrid interfaces (`Profile`, `CreateProfilePayload`).
  2. `app/admin/user-profiles/page.tsx` bypasses `lib/profilesApi.ts` entirely and issues raw Axios calls to a completely different Django route: `/api/v1/accounts/profiles/`.
- **Remediation:** Standardize the backend contract and update `user-profiles/page.tsx` to consume the centralized service in `lib/profilesApi.ts`.

---

### Issue 5: Unimplemented Premiere Management Stub
- **Severity:** **Medium**
- **Affected File:** [app/admin/premiere/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/premiere/page.tsx)
- **Explanation:**
  The premiere management page consists solely of a placeholder layout with an `h1` and a comment:
  ```typescript
  export default function AdminPremierePage() {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin • Premiere</h1>
          <p className="text-gray-700">Manage premiere titles (mock).</p>
          {/* TODO: Implement CRUD for premiere titles when backend is ready */}
        </div>
      </div>
    );
  }
  ```
  Administrators navigating to `/admin/premiere` encounter an unfinished view.
- **Remediation:** Either implement the Pay-Per-View Premiere title management grid or redirect `/admin/premiere` to `/admin/movie-management?is_ppv=true`.

---

### Issue 6: Coexisting Dual Auth Systems & Dead NextAuth Code
- **Severity:** **Medium**
- **Affected Files:**
  - [lib/auth.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/auth.ts)
  - [lib/db/adapter.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/db/adapter.ts)
  - [app/api/auth/[...nextauth]/route.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/api/auth/%5B...nextauth%5D/route.ts)
- **Explanation:**
  The repository contains a substantial NextAuth.js setup (Credentials, Google, GitHub providers, mock DB adapter, session types). However, the actual route handler in `app/api/auth/[...nextauth]/route.ts` has NextAuth handlers commented out. Meanwhile, the admin panel uses custom JWT auth. This creates confusion for future developers and AI assistants.
- **Remediation:** Formally deprecate and remove NextAuth if the platform is committed to DRF JWT authentication, or complete the NextAuth adapter migration.

---

### Issue 7: Silent Fallback to Mock Data Masking API Errors
- **Severity:** **Medium**
- **Affected Files:**
  - [app/admin/page.tsx#L53-L79](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/page.tsx#L53-L79)
  - [app/admin/analytics/page.tsx#L477-L550](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/analytics/page.tsx#L477-L550)
- **Explanation:**
  When `getDashboardData()` or `fetchAPI()` encounters an HTTP 401, 500, or network disconnect, it logs the error to the console and immediately returns hardcoded fallback statistics. While helpful for visual design, this masks backend outages, misconfigured environment variables, and authentication expiration. Administrators might believe they are viewing live metrics when they are actually inspecting static mock numbers.
- **Remediation:** Add a visible UI badge (e.g. `"⚠️ Offline Preview — Backend Unreachable"`) whenever fallback data is used.

---

### Issue 8: Orphaned Additional Settings Management Components
- **Severity:** **Medium**
- **Affected Files:**
  - [app/admin/additional-settings/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/additional-settings/page.tsx)
  - [components/LandingPageContentManagement/LandingPageContentManagement.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/LandingPageContentManagement/LandingPageContentManagement.tsx)
  - [components/LoginScreenContentManagement/LoginScreenContentManagement.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/LoginScreenContentManagement/LoginScreenContentManagement.tsx)
- **Explanation:**
  The `additional-settings` page currently only renders `FooterContentManagement`. Fully built components for `LandingPageContentManagement` and `LoginScreenContentManagement` exist in `components/`, along with complete API clients in [lib/additionalSettingsApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/additionalSettingsApi.ts), but they are not mounted anywhere in the application navigation.
- **Remediation:** Mount `LandingPageContentManagement` and `LoginScreenContentManagement` as tabs or accordion sections within `/admin/additional-settings`.

---

### Issue 9: Edge Middleware Per-Route Backend Query Latency
- **Severity:** **Medium**
- **Affected File:** [middleware.ts#L34-L37](file:///c:/Users/Mubashir/Desktop/Saim/OTT/middleware.ts#L34-L37)
- **Explanation:**
  On every single matched navigation to `/admin/:path*`, the Next.js edge middleware executes a synchronous HTTP request:
  ```typescript
  const accessCheck = await axios.get(`${apiBase}api/v1/me`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 7000,
  });
  ```
  If an administrator navigates through 5 pages, 5 separate round trips to `api.urview.com` occur before the page begins rendering.
- **Remediation:** Decode and verify the JWT signature using a fast local edge library (`jose`), or cache validated user roles in an encrypted session cookie.

---

### Issue 10: Total Absence of Automated Test Suite
- **Severity:** **Medium**
- **Affected File:** [package.json](file:///c:/Users/Mubashir/Desktop/Saim/OTT/package.json)
- **Explanation:**
  `package.json` contains no test runner (no Jest, Vitest, Cypress, or Playwright). The only code verification script available is `"type-check": "tsc --noEmit"` and `"lint": "next lint"`.
- **Remediation:** Configure Vitest / React Testing Library for component unit tests and Playwright for critical admin flows (login, upload, plan creation).

---

### Issue 11: Fragmented HTTP Client Usage (Axios vs Native Fetch)
- **Severity:** **Low**
- **Affected Files:** Distributed across `lib/` and `app/admin/`
- **Explanation:**
  Some service files use native `fetch` with custom error handling ([lib/contentApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/contentApi.ts), [lib/faq.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/faq.ts), [lib/authApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/authApi.ts)), while others use `axios` ([lib/creatorApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/creatorApi.ts), [lib/preSignupApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/preSignupApi.ts), [lib/userApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/userApi.ts)). Additionally, [lib/api.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/api.ts) defines an unused `apiClient = axios.create()`.
- **Remediation:** Unify the API layer on a single standardized HTTP client with global interceptors for token attachment and 401 refresh handling.

---

### Issue 12: Hardcoded Fallback Domain in Edge Middleware
- **Severity:** **Low**
- **Affected File:** [middleware.ts#L31](file:///c:/Users/Mubashir/Desktop/Saim/OTT/middleware.ts#L31)
- **Explanation:**
  If `API_BASE` is unset in `.env`, the middleware defaults to `'https://api.urview.com/'`. In a development environment with missing configuration, this can cause unintended network traffic to the production cluster.
- **Remediation:** Throw an explicit configuration error or fall back to `http://localhost:8000/` in non-production environments.
