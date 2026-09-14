# Physical Instagram Follower Counter - Web Application (Frontend)

Production-grade web portal and customer application for the commercial physical mechanical Instagram follower counter product. Built with **Angular 19**, **Standalone Components**, **Angular Signals**, and **TailwindCSS**.

---

## 1. Features Overview

### 🏷️ 1. Interactive Digital Split-Flap Display
- Realistic split-flap mechanical digit reels mirroring the physical hardware counter.
- Fluid flip animations with mechanical tick audio effects and a sound mute toggle.
- Status badges indicating online connectivity, last synchronized time, and stale outage warnings.

### 👤 2. Customer Dashboard & Device Claiming
- **Device Claiming Wizard**: Two-step validation flow for claiming physical counters using the device **Serial Number** (e.g. `FC-A82F32`) and scratch-off **Claim Code** (e.g. `CLM-82F3-2ABC-9999`).
- **Instagram Account Management**: Real-time connected profiles list showing username, profile badge, and follower count.
- **One-Click Reconnect Flow**: If an account token expires or requires re-authorization, an inline `🔄 Reconnect` action allows seamless re-authentication with Meta without breaking device bindings.
- **Device-to-Instagram Binding**: Switch which Instagram account displays on which physical counter.
- **On-Demand Follower Refresh**: Trigger manual follower count refreshes with rate-limit cooldown protection.

### 🏭 3. Factory Provisioning & Administrative Tools
- **Factory Device Provisioner**: Generate serial numbers, high-entropy 256-bit hardware secrets, and single-use claim codes.
- **Printable Thermal Labels**: Instant label layout rendering serial barcodes, packaging scratch card claim codes, and WiFi onboarding QR codes.
- **User Management**: Inspect customer accounts, claimed hardware count, and role permissions.
- **Audit Log Explorer**: Searchable security audit trail with IP address hashes, timestamp, and expandable JSON metadata.

### ⚙️ 4. Dynamic Multi-Tier Runtime API Config (`ConfigService`)
Avoids hardcoding backend URLs and enables zero-rebuild runtime environment switching:
- **Tier 1 (Highest Priority)**: In-app user override saved in browser `localStorage` (`api_url`).
- **Tier 2 (Container / Host Override)**: Static runtime file at `public/config.json`.
- **Tier 3 (Build-Time Fallback)**: Compile-time constant in `src/environments/environment.ts`.
- **Live Navbar Status Pill**: Shows `⚙️ API Connected (7149)` or `⚠️ API Disconnected` with periodic health checks against `/health/ready`.
- Clicking the pill opens the **API Endpoint Settings Modal** to switch backend URLs at runtime.

---

## 2. Project Architecture & Directory Structure

```
FRONTEND/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── api-config-modal/       # In-app runtime backend URL configurator
│   │   │   ├── claim-device-modal/     # Modal for serial and claim code entry
│   │   │   ├── navbar/                 # Global navigation with API health pill
│   │   │   └── split-flap-counter/     # Animated mechanical reel follower counter
│   │   ├── guards/
│   │   │   ├── auth.guard.ts           # Protects customer & admin routes
│   │   │   └── role.guard.ts           # Enforces SuperAdmin/Admin/Support permissions
│   │   ├── interceptors/
│   │   │   ├── credentials.interceptor.ts # Attaches withCredentials: true for cookies
│   │   │   └── error.interceptor.ts    # Parses RFC 7807 ProblemDetails responses
│   │   ├── models/
│   │   │   ├── auth.models.ts          # Login/Register/User DTOs
│   │   │   ├── device.models.ts        # Device and Claim DTOs
│   │   │   └── instagram.models.ts     # Instagram account & follower DTOs
│   │   ├── pages/
│   │   │   ├── admin/                  # Dashboard, Factory Provisioning, Users, Audit Logs
│   │   │   ├── auth/                   # Login, Register, Forgot Password, Verify Email
│   │   │   ├── customer/               # Customer Dashboard, Devices, Instagram, Settings
│   │   │   └── landing/                # Public commercial landing page
│   │   ├── services/
│   │   │   ├── admin.service.ts        # Provisioning & audit log APIs
│   │   │   ├── auth.service.ts         # Authentication state & session store
│   │   │   ├── config.service.ts       # Multi-tier dynamic API URL resolution
│   │   │   ├── device.service.ts       # Device claim & binding APIs
│   │   │   └── instagram.service.ts    # OAuth connect, refresh, reconnect APIs
│   │   ├── app.config.ts               # Application providers & HTTP client configuration
│   │   ├── app.routes.ts               # Angular router definitions with guards
│   │   └── app.component.ts            # Root application shell
│   ├── environments/
│   │   ├── environment.ts              # Development defaults (apiUrl: https://localhost:7149)
│   │   └── environment.prod.ts         # Production defaults
│   └── public/
│       └── config.json                 # Optional runtime host configuration
```

---

## 3. Getting Started & Local Development

### Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **Backend API**: Running on `https://localhost:7149` (or `http://localhost:5033`)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm start
# or
npx ng serve
```
The application will launch at **`http://localhost:4200/`**.

### Step 3: Build for Production
```bash
npm run build
```
Compiled production artifacts are emitted to `dist/follower-counter-ui/browser/`.

---

## 4. Authentication & Seeded Test Personas

The application uses ASP.NET Core cookie authentication (`SameSite=None; Secure=Always` in development). Log in with any of these pre-seeded accounts:

| Role | Email | Password | Access Rights |
|---|---|---|---|
| **SuperAdmin** | `arunsaigandham1998@gmail.com` | `G_arunsai@1998` | Full Admin Portal, Factory Tools & Customer Portal |
| **Customer** | `customer@counter.local` | `CustomerPass123!` | Customer Dashboard, Claiming & Instagram Tracking |
| **Admin** | `admin@counter.local` | `AdminPass123!` | Factory Device Provisioning & Audit Log Inspection |
| **Support** | `support@counter.local` | `SupportPass123!` | Customer & Device Diagnostic Lookup |

### Seeded Hardware Counter (Ready to Claim):
- **Device Serial Number**: `FC-A82F32`
- **Claim Code**: `CLM-82F3-2ABC-9999`
- **Hardware Secret**: `dev_device_secret_256bit_secure_token_99`

---

## 5. Connecting with Meta / Instagram

1. Log into `http://localhost:4200` using `customer@counter.local` or `arunsaigandham1998@gmail.com`.
2. Navigate to **Instagram Accounts** (`/instagram`) or click **"Connect Instagram"** on the Dashboard.
3. You will be redirected to the official Meta authorization dialog (`https://www.instagram.com/oauth/authorize`).
4. Log into your Instagram Professional (Creator or Business) account and click **Allow**.
5. Meta redirects back to `https://localhost:7149/api/v1/instagram/callback`, which stores the 60-day encrypted token and redirects to the frontend dashboard.
6. The follower count updates on the mechanical split-flap display instantly!
