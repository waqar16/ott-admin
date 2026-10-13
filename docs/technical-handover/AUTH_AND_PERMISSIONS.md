# Authentication, Authorization & Session Management — URVIEW OTT

This document provides a complete technical audit of the security architecture, authentication lifecycle, session storage, route middleware, and permission systems implemented in the URVIEW application.

---

## 1. Dual Authentication Architecture

Static inspection reveals that **two distinct authentication architectures** coexist within the codebase:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION ARCHITECTURES                    │
├─────────────────────────────────────┬──────────────────────────────────┤
│    1. ACTIVE SYSTEM (JWT + COOKIES)  │    2. SECONDARY (NEXTAUTH.JS)     │
├─────────────────────────────────────┼──────────────────────────────────┤
│ • Used by: Admin Panel & Middleware │ • Used by: /api/admin/content,   │
│ • Endpoints: /api/v1/login, me, etc.│   /api/settings/devices (mock)   │
│ • State: js-cookie + localStorage   │ • State: JWT session cookie      │
│ • Implementation: Fully functional  │ • Implementation: Disabled /     │
│   against external DRF backend      │   commented-out for mock mode    │
└─────────────────────────────────────┴──────────────────────────────────┘
```

1. **Custom JWT Token Authentication (Active & Operational):**
   - Managed via [lib/authApi.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/authApi.ts), [lib/tokenStore.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/tokenStore.ts), [lib/useAuth.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/useAuth.tsx), [middleware.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/middleware.ts), and [LoginForm.client.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/auth/LoginForm.client.tsx).
   - Communicates with the external Django REST Framework backend.
   - This is the authentication mechanism securing the entire `/admin/*` surface.
2. **NextAuth.js v4 (Legacy / Mock Architecture):**
   - Defined in [lib/auth.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/auth.ts) and backed by [lib/db/adapter.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/db/adapter.ts).
   - In [app/api/auth/[...nextauth]/route.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/api/auth/%5B...nextauth%5D/route.ts), NextAuth handlers are disabled with `TODO: Uncomment when NextAuth backend ready`.
   - Used only in prototype routes ([app/admin/content/page.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/app/admin/content/page.tsx)) under fallback mock sessions.

---

## 2. Complete Authentication Lifecycle (Active JWT Flow)

### A. Login Flow
```
User submits credentials (email, password, optional 2FA)
                │
                ▼
LoginForm.client.tsx calls login() in useAuth.tsx
                │
                ▼
authApi.ts issues POST ${API_BASE}api/v1/login
                │
                ├───────────────────────────────────────────┐
                ▼                                           ▼
   Response: 2FA Required?                      Response: Success (200 OK)
   {"two_factor_required": true}                {"access_token": "...", "role": "admin"}
                │                                           │
                ▼                                           ▼
   UI reveals 2FA input field                   tokenStore.setTokens() stores:
   User submits 6-digit code                    • Cookie: access_token, refresh_token
                                                • LocalStorage: urv_access, urv_refresh
                                                            │
                                                            ▼
                                                Role Check:
                                                • If role === 'admin' -> router.replace('/admin')
                                                • If role !== 'admin' -> Toast Error & reject
```

### B. Credential Submission & 2FA
- Implemented in [components/auth/LoginForm.client.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/auth/LoginForm.client.tsx).
- Generates or retrieves a unique persistent browser identifier: `device_id` (`web_<timestamp>_<random>`) stored in `urv_device_id`.
- Sends `email`, `password`, `device_id`, `device_type: 'web'`, and optional `token_2fa` to `POST /api/v1/login`.
- If the account has Two-Factor Authentication enabled, the server responds with `{ two_factor_required: true }`. The form preserves entered credentials and presents a 6-digit 2FA token input field.

### C. Role Verification & Redirection
- When tokens are returned, the login handler inspects `response.role`:
  - If `role === 'admin'`: Displays a styled redirect overlay (`FullScreenRedirectLoader`) with a 10-second defensive safety timeout, and initiates `router.replace('/admin')`.
  - If `role === 'user'` or `role === 'beta_tester'`: Rejects administrative access, clears tokens, displays toast error `"You do not have access to this platform."`, and redirects to `/`.

### D. Logout Flow
- Initiated via the profile dropdown in [components/AdminNavbar/AdminNavbar.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/AdminNavbar/AdminNavbar.tsx).
- Calls `logout()` in [lib/useAuth.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/useAuth.tsx).
- `authApi.logout()` is called (client-side delay; tokens expire naturally on backend).
- `tokenStore.clearTokens()` explicitly deletes:
  - Cookies: `access_token` (path: `/`), `refresh_token` (path: `/`).
  - LocalStorage: `urv_access`, `urv_refresh`.
- Sets `user = null` and routes browser to `/`.

---

## 3. Token Storage & Lifecycle Management

Token storage is centralized in [lib/tokenStore.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/tokenStore.ts):

| Storage Layer | Keys Stored | Purpose | Scope / Lifetime |
|---|---|---|---|
| **Cookies (`js-cookie`)** | `access_token`, `refresh_token` | Read by Next.js Edge Middleware for route protection | Path: `/`, SameSite: `lax` |
| **LocalStorage** | `urv_access`, `urv_refresh`, `urv_device_id` | Client-side API request headers fallback | Domain-scoped |

### Automatic Token Refresh on 401
- Implemented in `useAuth.tsx` inside `fetchUser`:
  ```typescript
  if (error.status === 401 && retry && !isRefreshing) {
    const refreshToken = getRefreshToken();
    if (refreshToken) {
      return await attemptTokenRefresh(refreshToken);
    }
  }
  ```
- `attemptTokenRefresh()` issues `POST ${API_BASE}api/v1/token/refresh` with `{ refresh: refreshToken }`.
- Upon receipt of new tokens, `tokenStore.setTokens()` updates both cookies and localStorage, and retries the original request.
- If refresh fails (e.g., refresh token expired or revoked), `clearTokens()` is called, user state is set to `null`, and the user is signed out.

---

## 4. Route Protection & Middleware Architecture

Route-level security is enforced at the edge by [middleware.ts](file:///c:/Users/Mubashir/Desktop/Saim/OTT/middleware.ts):

```typescript
export const config = {
  matcher: ['/admin/:path*', '/admin'],
}
```

### Middleware Execution Logic
1. **Public Route Bypass:** Checks if pathname matches public routes (`/login`, `/signup`, `/error`).
2. **Cookie Inspection:** Reads `request.cookies.get('access_token')?.value`.
   - If missing: Immediately halts execution and redirects to `new URL('/', request.url)`.
3. **Mock Mode Bypass:** If `USE_MOCK_DATA === true` or token starts with `'mock_'`, allows access without network verification.
4. **Backend Token Verification:**
   - Issues an HTTP request to `GET ${apiBase}api/v1/me` with header `Authorization: Bearer ${token}`.
   - Enforces a **7000ms timeout** (`timeout: 7000`) using Axios to prevent edge middleware stalls if the backend is slow.
5. **Role Gate:**
   - Evaluates `role = accessCheck.data?.role || accessCheck.data?.user?.role || accessCheck.data?.data?.role`.
   - If `pathname.startsWith('/admin')` and `role !== 'admin'`: redirects to `/`.
6. **Error / Token Expiry Catch:** If token verification throws or returns non-200, catches error and redirects to `/`.

---

## 5. Role-Based Access Control (RBAC) & Permissions

### System Roles
The backend defines four operational user roles:

1. **`admin` (Super Administrator):**
   - Full unrestricted access to all `/admin/*` modules.
   - Authority to create, edit, publish, and delete catalog titles, creators, payment plans, and FAQs.
   - Authority to promote waitlist cohorts and modify trial quotas.
   - Authority to access financial reports and platform analytics.
2. **`creator` (Content Partner / Studio):**
   - Access restricted to their own submitted video assets and revenue metrics on the external creator portal.
   - Barred from entering `/admin/*` routes.
3. **`subscriber` (Paying Consumer):**
   - Standard streaming audience with active subscription (Free, Kids, or Full tier).
   - Barred from entering `/admin/*` routes.
4. **`user` / `beta_tester` (Registered Consumer / Early Access):**
   - Barred from entering `/admin/*` routes.

### Client-Side Guard Rails
- In [LoginForm.client.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/auth/LoginForm.client.tsx): If authenticated user has `role === 'user'` or `role === 'beta_tester'`, access is explicitly denied before redirecting.
- In [components/AdminNavbar/AdminNavbar.tsx](file:///c:/Users/Mubashir/Desktop/Saim/OTT/components/AdminNavbar/AdminNavbar.tsx): User details and avatar are displayed; logout clears all tokens.

---

## 6. Security Analysis & Identified Vulnerabilities

Static code inspection reveals several critical security considerations and technical debt items:

### 1. Dual Cookie / LocalStorage Token Storage (High Severity)
- **Finding:** Tokens are stored in both `js-cookie` (without `httpOnly: true`) and `localStorage` ([lib/tokenStore.ts:66-70](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/tokenStore.ts#L66-L70)).
- **Risk:** Client-side JavaScript has direct access to JWT tokens. Any Cross-Site Scripting (XSS) vulnerability would allow attackers to steal access and refresh tokens.
- **Recommended Remediation:** Migrate to server-set `httpOnly`, `Secure`, `SameSite=Strict` cookies issued directly by authentication route handlers.

### 2. Hardcoded S3 Callback Key (High Severity)
- **Finding:** [lib/contentApi.ts:60](file:///c:/Users/Mubashir/Desktop/Saim/OTT/lib/contentApi.ts#L60) defines:
  ```typescript
  const S3_CALLBACK_KEY = process.env.NEXT_PUBLIC_S3_CALLBACK_KEY || 'devtestkey';
  ```
- **Risk:** If `NEXT_PUBLIC_S3_CALLBACK_KEY` is not provided, the key defaults to the hardcoded string `'devtestkey'`. Because the variable has the `NEXT_PUBLIC_` prefix, it is embedded into client browser bundles.
- **Recommended Remediation:** S3 callback endpoints should never be triggered by the client in production; S3 should trigger backend endpoints directly via AWS EventBridge or S3 bucket event notifications.

### 3. Middleware Latency & Backend Load (Medium Severity)
- **Finding:** Every single admin page request and client-side page transition executes `axios.get('${apiBase}api/v1/me')` inside [middleware.ts:34](file:///c:/Users/Mubashir/Desktop/Saim/OTT/middleware.ts#L34).
- **Risk:** If an administrator clicks through 10 pages in the admin panel, 10 sequential round-trip requests are sent to the external Django backend, adding 100-300ms latency to every navigation and straining the backend.
- **Recommended Remediation:** Decode and verify the JWT signature locally in middleware using `jose` or cache verified sessions for 60 seconds.

### 4. Direct API Client Fallback in Middleware (Low Severity)
- **Finding:** [middleware.ts:31](file:///c:/Users/Mubashir/Desktop/Saim/OTT/middleware.ts#L31) falls back to `'https://api.urview.com/'` if `API_BASE` is unset.
- **Risk:** In local or staging environments where `.env` is misconfigured, middleware might unexpectedly validate tokens against the production backend.
