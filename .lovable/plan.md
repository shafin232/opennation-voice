

# OpenNation — Civic Governance Platform (Frontend)

## Overview
A production-ready national transparency platform with role-based access (Citizen, Moderator, Admin, Superadmin), Bengali-primary bilingual UI, dark/light mode, and fully API-driven architecture. All UI interactions call backend endpoints — no mock data.

---

## 1. Foundation & Architecture

- **API Client** (`apiClient.ts`): Centralized Axios instance with JWT interceptor, automatic 401 logout, 403 crisis-mode notice, and request logging
- **Auth Context**: JWT token management, role detection, OTP login flow
- **App Context**: Crisis mode state, language preference, theme toggle
- **i18n System**: Bengali (primary) + English with a language switcher; all UI strings externalized into translation files
- **Type System**: Full TypeScript types for all API responses, user roles, reports, projects, RTI, etc.

## 2. Authentication & Routing

- **Unified Login Page** (`/login`): Phone/email input → OTP verification → JWT token storage
- **Role-Based Redirects**: Citizens → `/app`, Moderator/Admin/Superadmin → `/admin`
- **Route Guards**: Protected route wrappers that check auth + role before rendering
- **Crisis Mode Guard**: Disables voting & submission globally when crisis mode is active

## 3. Citizen Area (`/app/*`)

- **Live Feed**: Real-time paginated report feed with support/doubt voting buttons (each vote triggers API call)
- **Submit Report**: Multi-step form with location, category, description, evidence upload — submission via API
- **Government Projects**: Browse projects, view details, submit opinions (disabled if project is frozen)
- **RTI Requests**: Submit Right to Information requests, track status
- **Hospital Monitor**: View hospital data, ratings, capacity from API
- **Community Repair**: Browse/submit community repair requests
- **Integrity Dashboard**: Trust scores, truth scores, district-level integrity metrics with charts
- **Notifications**: API-driven notification list with read/unread state
- **Profile & Settings**: View/edit profile, language toggle, dark/light mode toggle

## 4. Admin Panel (`/admin/*`)

- **Moderation Queue**: Review flagged reports, approve/hide/restore with confirmation modals
- **Crisis Mode Control** (Superadmin): Toggle crisis mode on/off — disables citizen submissions platform-wide
- **Tender Risk Analysis**: Dashboard showing tender data with risk scoring from backend algorithm
- **Project Approval Center**: Approve/reject government projects with notes
- **RTI Response Panel**: Admin responds to RTI requests
- **Identity Unlock Panel** (Superadmin only): Unlock anonymized user identities with audit trail
- **Vote Anomaly Dashboard**: Visualize voting patterns flagged as anomalous by backend
- **Evidence Vault**: Blurred evidence previews, accessible only with permission
- **Audit Logs**: Read-only log viewer with filters (date, action type, user)
- **District Integrity Controls**: Per-district integrity metrics and controls

## 5. Shared UI Components

- **Layout Shells**: Citizen sidebar layout + Admin sidebar layout with role-aware navigation
- **Loading Skeletons**: Skeleton screens for all data-loading states
- **Error Banners**: Inline error displays for failed API calls
- **Confirmation Modals**: For all destructive/admin actions
- **Toast Notifications**: Success/error feedback using Sonner
- **Dark/Light Mode Toggle**: Theme switcher with system preference detection
- **Accessible Contrast**: WCAG AA compliant color system for both themes

## 6. Custom Hooks (All API-Driven)

Each hook handles loading, error, and typed responses:
- `useAuth` — login, logout, OTP verify, current user
- `useReports` — fetch feed, submit report, vote
- `useVoting` — support/doubt actions with crisis-mode check
- `useProjects` — list, detail, opinions
- `useRTI` — submit, list, track
- `useAdmin` — moderation, approvals, crisis toggle
- `useNotifications` — fetch, mark read
- `useHospitals` — hospital data
- `useIntegrity` — trust/truth scores, district metrics

## 7. API Integration Pattern

- Every button click → API request → UI updates only on success
- Console logging before every request for debugging
- Proper error handling with user-facing messages in Bengali/English
- API base URL configurable (will connect to your backend once ready)

