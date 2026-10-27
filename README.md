# LifeLink — Emergency Blood Donor Network

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-red.svg)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-v24-green.svg)](https://nodejs.org)
[![MongoDB 2dsphere](https://img.shields.io/badge/MongoDB-2dsphere%20Geospatial-brightgreen.svg)](https://www.mongodb.com)
[![Jest Tests](https://img.shields.io/badge/Tests-16%20Passed-success.svg)](https://jestjs.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **College End-Term Capstone & Internship Portfolio Project**  
> An emergency peer-to-peer blood discovery network that connects urgent hospital blood requirements with registered, compatible volunteer donors using real-time MongoDB geospatial proximity indexing (`2dsphere`) and a transparent review audit trail.

---

## 🚨 Non-Clinical Transparency & Medical Disclaimer

> **IMPORTANT:**  
> **LifeLink is strictly a peer coordination and rapid communication tool.**  
> Software matching does **NOT** establish clinical transfusion compatibility, certify donor medical eligibility, or guarantee immediate donor availability. All blood typing, cross-matching, infectious screening, and transfusion decisions **must** be conducted in accordance with clinical protocols by licensed hospital and blood bank medical professionals.

---

## 1. Problem Statement & Target Users

### Problem Statement
In emergency surgical, trauma, or oncological scenarios, locating replacement or urgent blood units quickly is hindered by fragmented phone trees, social media spam, and a lack of real-time proximity awareness. Critical minutes are wasted calling geographically distant or ineligible donors.

### Solution Overview
**LifeLink** streamlines emergency blood coordination by:
1. Enabling hospital requesters to publish structured emergency requirements with exact GPS coordinates and urgency levels.
2. Querying registered donors within a configurable radius (e.g., 5 km to 50 km) using MongoDB `2dsphere` geospatial indexing and blood compatibility tables.
3. Protecting privacy by never disclosing raw donor GPS coordinates or private contact numbers during public discovery searches.
4. Enforcing an authorized review workflow so that unverified requests are audited and verified before misleading volunteers.
5. Tracking donor responses atomically (`interested` vs `declined`) with real-time in-app and simulated WhatsApp notifications.

### Target Users
- **Volunteer Donors:** Individuals who register their blood group, approximate location, availability toggle, and notification channel.
- **Emergency Requesters:** Patients' families, hospital representatives, or social workers coordinating blood units.
- **Authorized Reviewers / Administrators:** Hospital desk staff or verified coordinators who audit requisition slips and record immutable audit logs.

---

## 2. Technology Stack & Architectural Decisions

| Layer | Technology | Engineering Rationale |
|---|---|---|
| **Frontend** | React 18, Vite, React Router 6 | Instant sub-second HMR, modular SPA routing, performant state updates without unnecessary re-renders. |
| **Styling** | Vanilla CSS Design System | Custom healthcare dark-mode aesthetic with HSL accents, glassmorphic cards, accessible form inputs, and micro-animations. Avoided bloated generic Tailwind utility classes to demonstrate mastery of core CSS tokens. |
| **Icons** | Lucide React | Clean, tree-shakeable SVG icons for clinical statuses and urgency indicators. |
| **Backend** | Node.js (v24), Express 4 | Non-blocking I/O, modular controller-service-repository pattern, express-validator pipelines, and robust rate-limiting. |
| **Database** | MongoDB & Mongoose | Flexible JSON document model natively supporting GeoJSON `Point` objects and high-performance `2dsphere` spatial indexing. |
| **Local Fallback DB** | MongoMemoryServer | Embedded in-memory MongoDB runner ensuring zero-config local evaluation on machines without a running `mongod` daemon. |
| **Authentication** | JWT (JSON Web Tokens) & bcryptjs | Stateless authorization with 10-round bcrypt hashing, secure cookie and `Authorization: Bearer` header support, and role-based route guards. |
| **Notifications** | Provider Pattern Abstraction | Modular notification service supporting browser in-app alerts and a safe, local simulated WhatsApp provider that logs realistic dispatches without incurring telecom fees. |
| **Automated Testing** | Jest, Supertest | Comprehensive integration tests validating authentication, validation, geospatial matching, and reviewer authorization. |

---

## 3. Five Core Workflows

### Workflow A — Account Creation & Donor Onboarding
- Registration with client & server-side validation (`express-validator`).
- Secure 10-round bcrypt password hashing. Duplicate email check (409 Conflict).
- Role safety: Ordinary users cannot self-assign `reviewer` or `admin` roles.
- Capture blood group, city, approximate GPS coordinates (with Pune area preset buttons or browser geolocation).
- Availability toggle (`isAvailable: true/false`).
- Explicit notification consent opt-in and notification channel selection (`in-app` vs `simulated-whatsapp`).
- Transparent badging clearly distinguishing a verified phone number from verified blood group or clinical hospital verification.

### Workflow B — Create and Manage Blood Requests
- Authenticated requester creates a structured request with patient identifier (kept minimal for privacy), required blood group, units (1–20), hospital name, coordinates, city, urgency (`critical`, `high`, `moderate`), search radius (5–50 km), and expiry hours (12h, 24h, 48h, 72h).
- Automatic status transitions: `unverified` → `verified` (upon review) → `fulfilled` or `cancelled` or `expired`.
- Owner privileges: Only the request creator can cancel the request or mark it as fulfilled.

### Workflow C — Geospatial Donor Discovery & Matching
- Real backend matching executed via MongoDB `$nearSphere` geospatial queries on a `2dsphere` index.
- Blood compatibility logic (e.g., universal donor O- matched for all, compatible red cell rules).
- Excludes the requester themselves and donors who have opted out or toggled offline.
- Haversine spherical distance computation to return approximate distance in kilometers (e.g. `~1.2 km away`).
- **Privacy Assurance:** Raw donor GPS coordinates and personal contact numbers are never leaked in public discovery results.

### Workflow D — Donor Responses & Real-Time Tracking
- Invited donors can accept (`interested`) or decline.
- Prevents conflicting duplicate responses via a compound unique index `{ request: 1, donor: 1 }`.
- Requesters track live counters (`interested` vs `declined`) and review donor messages (e.g., "Arriving at blood bank in 20 minutes").
- Responses to cancelled or expired requests are strictly blocked.

### Workflow E — Authorized Review & Audit Trail
- Dedicated Reviewer Portal (`/admin`) protected by `authenticate` and `authorize('reviewer', 'admin')` middleware.
- Review queue displays pending hospital requests.
- Review modal requires an audit note (min 5 characters) and transitions request status to `verified` or `rejected`.
- Every action creates a persistent immutable entry in `ReviewLog` storing the reviewer's ID, decision, reason, client IP, user agent, and timestamp.

---

## 4. Data Models & Architecture

```
ENDTERM_PROJECT/
├── server/
│   ├── src/
│   │   ├── config/          # db.js (MongoDB + MongoMemoryServer fallback)
│   │   ├── models/          # User, BloodRequest, DonorResponse, Notification, ReviewLog
│   │   ├── controllers/     # authController, requestController, matchController, etc.
│   │   ├── routes/          # authRoutes, requestRoutes, matchRoutes, etc.
│   │   ├── middleware/      # auth, validate, errorHandler, rateLimiter
│   │   ├── services/        # matchingService, notificationService
│   │   ├── utils/           # bloodCompatibility, seed
│   │   ├── app.js           # Express app setup & health check
│   │   └── server.js        # Server listener & auto-seeder
│   └── tests/               # auth.test.js, request_and_matching.test.js, admin_review.test.js
├── client/
│   ├── src/
│   │   ├── api/             # client.js (universal fetch wrapper)
│   │   ├── context/         # AuthContext, NotificationContext
│   │   ├── components/      # Navbar, Footer, StatusBadge, MedicalDisclaimer, ProtectedRoute
│   │   ├── pages/           # Home, RequestsFeed, CreateRequest, RequestDetails, MyRequests,
│   │   │                    # DonorAlerts, DonorProfile, AdminDashboard, Login, Register, NotFound
│   │   └── styles/          # index.css (custom design system)
│   ├── index.html
│   └── vite.config.js
└── package.json             # Root runner scripts
```

### Models Overview

| Model | Key Fields | Indexes | Access Permissions |
|---|---|---|---|
| **User** | `name`, `email`, `password` (select: false), `phone`, `role`, `bloodGroup`, `location` (Point), `isAvailable`, `notificationConsent`, `notificationChannel` | `email` (unique), `location` (2dsphere) | Self read/write; public discovery returns sanitized summaries only. |
| **BloodRequest** | `requester`, `patientName`, `bloodGroup`, `unitsRequired`, `hospitalName`, `location` (Point), `urgency`, `status`, `reviewStatus`, `reviewedBy`, `searchRadiusKm`, `expiresAt`, `responsesCount` | `location` (2dsphere), `{ status: 1, bloodGroup: 1, expiresAt: 1 }` | Public read; owner update/cancel; reviewer audit. |
| **DonorResponse** | `request`, `donor`, `status` (`invited`, `interested`, `declined`), `message`, `respondedAt` | `{ request: 1, donor: 1 }` (unique compound index) | Donor update; request owner read. |
| **Notification** | `recipient`, `request`, `type`, `title`, `message`, `channel`, `simulatedMetadata`, `isRead` | `{ recipient: 1, isRead: 1, createdAt: -1 }` | Recipient private read/write. |
| **ReviewLog** | `request`, `reviewer`, `action`, `decisionReason`, `ipAddress`, `userAgent` | `{ request: 1, createdAt: -1 }` | Reviewer / Admin only; immutable. |

---

## 5. Local Installation & Setup

### Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v9+

### 1. Clone the repository
```bash
git clone <repository_url>
cd ENDTERM_PROJECT
```

### 2. Configure Environment Variables
Copy the example environment file:
```bash
cp server/.env.example server/.env
```
Default `.env` values (configured on Port 5050 to avoid default macOS AirPlay Receiver port conflicts):
```env
PORT=5050
NODE_ENV=development
MONGODB_URI=
JWT_SECRET=lifelink_dev_secret_jwt_key_98234710923847
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NOTIFICATION_PROVIDER=simulated
```
*(Leave `MONGODB_URI` blank to run the embedded local in-memory MongoDB automatically).*

### 3. Install Dependencies
```bash
# Install backend dependencies
cd server && npm install

# Install frontend dependencies
cd ../client && npm install
cd ..
```

### 4. Run Demonstration Database Seed (Optional)
The server will automatically auto-seed demo accounts on first launch, or you can manually seed anytime:
```bash
npm run seed
```

### 5. Start Development Servers
From the root directory:
```bash
# Terminal 1: Start Backend Server (runs on http://localhost:5050)
npm run server

# Terminal 2: Start Frontend Dev Server (runs on http://localhost:5173)
npm run client
```

Now open your browser and navigate to:
**👉 http://localhost:5173**

---

## 6. Pre-Configured Demo Accounts for Evaluation

For rapid evaluation, the login page (`/login`) includes **1-Click Demo Buttons**:

| Role | Email | Password | Purpose |
|---|---|---|---|
| **Authorized Reviewer** | `reviewer@lifelink.org` | `Password@123` | Accesses the Reviewer Portal (`/admin`), audits pending requests, views metrics and immutable audit logs. |
| **Requester** | `requester@lifelink.org` | `Password@123` | Creates emergency blood requests, triggers geospatial donor discovery, and tracks responses. |
| **Donor (O+)** | `aarav.donor@lifelink.org` | `Password@123` | Nearby volunteer donor in Pune (Ruby Hall area). Receives emergency alerts and responds. |
| **Donor (B+)** | `vikram.donor@lifelink.org` | `Password@123` | Registered B+ donor in Deccan area (~3.5 km from Ruby Hall). |

---

## 7. Automated Test Suite

LifeLink includes automated backend integration tests using **Jest** and **Supertest**. Tests run against an isolated `MongoMemoryServer` instance so no persistent data is modified.

### Run Automated Tests
```bash
npm test
```

### Test Coverage Highlights (16/16 Passed):
- `tests/auth.test.js`:
  - User registration with valid data and JWT generation.
  - Duplicate account prevention (409 Conflict).
  - Client privilege escalation prevention (ordinary users cannot self-assign `reviewer` or `admin`).
  - Login credential verification and invalid password rejection (401).
  - Unauthenticated route rejection.
- `tests/request_and_matching.test.js`:
  - Server-side input validation on blood group and coordinates.
  - Geospatial `$nearSphere` donor matching within search radius.
  - Exclusion of the requester from matched donor results.
  - Unauthorized strangers blocked from viewing matched donor contact lists (403).
  - Donor responses recorded and atomic increment of `responsesCount.interested`.
  - Blocked responses to cancelled requests.
- `tests/admin_review.test.js`:
  - Non-reviewer blocked from review endpoints with 403 Forbidden.
  - Authorized reviewer submits approval; request transitions to `verified`.
  - Immutable `ReviewLog` audit entry created with reviewer ID and timestamp.
  - `/api/health` system monitoring endpoint.

---

## 8. API Endpoint Documentation

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register donor or requester.
- `POST /api/auth/login` — Authenticate and receive JWT.
- `GET /api/auth/me` — Get authenticated user profile.
- `PUT /api/auth/profile` — Update name, phone, availability status, or notification channel.
- `POST /api/auth/logout` — Clear auth cookie.

### Requests (`/api/requests`)
- `POST /api/requests` — Create emergency blood request with coordinates and urgency.
- `GET /api/requests` — Public feed of active blood requests with filters (`bloodGroup`, `city`, `urgency`).
- `GET /api/requests/my` — Fetch requests created by the current user.
- `GET /api/requests/:id` — Request details (includes full responses if owner/reviewer).
- `PATCH /api/requests/:id/cancel` — Cancel request (Owner only).
- `PATCH /api/requests/:id/fulfill` — Mark request as fulfilled (Owner only).

### Geospatial Matching (`/api/requests`)
- `GET /api/requests/:id/matches` — Find nearby eligible donors within `searchRadiusKm`.
- `POST /api/requests/:id/invite` — Dispatch invitations to selected matched donors.

### Responses (`/api/responses`)
- `POST /api/responses/:requestId` — Donor responds (`interested` or `declined`) with optional note.
- `GET /api/responses/my-alerts` — List of requests the donor has been invited to.

### Admin / Reviewer (`/api/admin`)
- `GET /api/admin/metrics` — Dashboard counts (pending, verified, active donors, fulfilled).
- `GET /api/admin/requests` — Review queue of pending/unverified requests.
- `POST /api/admin/requests/:id/review` — Submit review decision (`approved` / `rejected`) with reason.
- `GET /api/admin/audit-logs` — Read immutable audit history.

### Health Check
- `GET /api/health` — System status, uptime, database connection state, and API version.

---

## 9. 3–5 Minute Product Demonstration Plan

For viva or project evaluation, follow this 5-stage demonstration:

1. **Problem & Non-Clinical Architecture (0:00 - 0:45)**
   - Show the Homepage and highlight the **Non-Clinical Coordination Disclaimer**. Explain that LifeLink coordinates volunteer communication rather than replacing medical blood bank cross-matching.
   - Point out the active emergency cards and platform pillars.
2. **Donor Onboarding & Availability Settings (0:45 - 1:30)**
   - Click "Register as Volunteer Donor".
   - Demonstrate geolocation coordinates detection / Pune area presets.
   - Show the explicit notification consent checkbox and notification channel choice.
   - Go to Profile and show the live **Availability Switch** (Available vs Offline).
3. **Emergency Blood Request Creation (1:30 - 2:15)**
   - Log in as Requester (`requester@lifelink.org`).
   - Click "+ Request Blood". Select a hospital (e.g., Ruby Hall Clinic), blood group `B+`, units `2`, urgency `Critical`.
   - Explain the configurable radius slider (e.g., 20 km) and submit.
4. **Geospatial 2dsphere Matching & Real-Time Donor Response (2:15 - 3:30)**
   - On the created request page, show the **Geospatial 2dsphere Matched Donors** table.
   - Explain how MongoDB calculates distance (e.g., `0.3 km away`) while shielding raw GPS coordinates and phone numbers for privacy.
   - Click "Invite Selected".
   - Switch user to Donor (`vikram.donor@lifelink.org`), open **Donor Alerts**, and click **"I Can Donate"** with message: *"Reaching Ruby Hall in 20 mins"*.
   - Return to Requester view and show the live updated response counter and donor message.
5. **Authorized Reviewer Workflow & Audit Trail (3:30 - 4:30)**
   - Log in as Reviewer (`reviewer@lifelink.org`) and open the **Reviewer Portal** (`/admin`).
   - Show the platform metrics (Pending Review, Verified, Active Donors).
   - Click **Audit Request** on a pending case, enter audit notes confirming hospital requisition slip, and approve.
   - Demonstrate that the request badge updates to **"VERIFIED REQUEST"** and an immutable entry is added to the **Audit Trail History** with the reviewer's ID and timestamp.
6. **Key Engineering Decision (4:30 - 5:00)**
   - Explain the choice of a GeoJSON 2dsphere index over distance-based client filtering, compound unique constraints preventing race conditions, and the simulated WhatsApp notification provider abstraction that prevents external telecom billing.

---

## 10. Privacy Considerations & Future Enhancements

### Privacy by Design
- **Minimal Collection:** Only patient initials and hospital departments are collected; medical histories are never stored.
- **Location Shielding:** Donors' exact residential coordinates are never exposed in public queries; only approximate calculated distances (`~1.5 km`) are displayed.
- **Masked Contact Details:** Phone numbers in public feeds are masked (`+91 98220 ****6`) and only revealed when a mutual interest is confirmed.

### Future Enhancements
- Integration with government blood bank inventory APIs (e.g., e-RaktKosh in India).
- WebPush browser notifications via service workers.
- Digital donor badge certification for verified regular donors.

---

## 11. Real vs Simulated Integrations

| Feature | Implementation State | Description |
|---|---|---|
| **Database & Indexing** | **REAL** | MongoDB with Mongoose schemas and live `2dsphere` geospatial spatial index. |
| **Authentication & Tokens** | **REAL** | 10-round bcrypt hashing, JWT issuance, and role authorization middleware. |
| **Matching Logic** | **REAL** | Server-side GeoJSON calculation using spherical distance formulas. |
| **Reviewer Portal & Auditing** | **REAL** | Role-protected admin endpoints with persistent `ReviewLog` collection. |
| **In-App Notifications** | **REAL** | Persistent `Notification` collection with real-time 15s polling and unread badge counters. |
| **WhatsApp Dispatch** | **SIMULATED** | Clean provider abstraction that logs formatted WhatsApp payloads to the server console with safe educational disclaimers. Avoids incurring paid Twilio/Meta WhatsApp API charges. |
