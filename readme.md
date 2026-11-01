# Fixme — Backend API

> **Branch:** `feature/authentication`
> **Status:** ✅ Auth system complete — production-ready (pending custom email domain)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Getting Started](#getting-started)
- [Authentication System Overview](#authentication-system-overview)
- [API Reference](#api-reference)
  - [Sign Up](#1-sign-up)
  - [Verify Sign Up OTP](#2-verify-sign-up-otp)
  - [Resend OTP](#3-resend-otp)
  - [Login](#4-login)
  - [Refresh Token](#5-refresh-token)
  - [Logout](#6-logout)
  - [Forgot Password](#7-forgot-password)
  - [Verify Password OTP](#8-verify-password-otp)
  - [Reset Password](#9-reset-password)
- [Security Measures](#security-measures)
- [Rate Limiting](#rate-limiting)
- [Data Models](#data-models)
- [Known Limitations / Pre-Production Checklist](#known-limitations--pre-production-checklist)
- [Branch Strategy](#branch-strategy)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM) |
| Framework | Express v5 |
| Language | TypeScript |
| Database | MongoDB via Mongoose |
| Auth | JWT (Access + Refresh Token) |
| Password Hashing | bcrypt (salt rounds: 12) |
| Email | Resend API |
| Validation | Zod |
| Security Headers | Helmet |
| CORS | express cors |
| Rate Limiting | express-rate-limit |
| Cookie Parsing | cookie-parser |
| Package Manager | pnpm |

---

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── db.ts                  # MongoDB connection
│   ├── controllers/
│   │   └── auth.controller.ts     # All auth logic
│   ├── middlewares/
│   │   ├── auth.middleware.ts     # JWT protect middleware
│   │   ├── rateLimiter.ts         # Rate limiter factory
│   │   └── validate.ts            # Zod validation middleware
│   ├── models/
│   │   ├── user.model.ts          # User schema + bcrypt pre-save hook
│   │   └── otp.model.ts           # OTP schema with 300s TTL auto-delete
│   ├── routes/
│   │   ├── auth.signup.routes.ts
│   │   ├── auth.otp-signup.routes.ts
│   │   ├── auth.resend-otp.routes.ts
│   │   ├── auth.login.routes.ts
│   │   ├── auth.tokens.routes.ts
│   │   ├── auth.logout.routes.ts
│   │   ├── auth.forgotpass.routes.ts
│   │   ├── auth.verifypass.routes.ts
│   │   └── auth.resetpass.routes.ts
│   ├── types/
│   │   └── express.d.ts           # Extends Express Request with req.user
│   ├── utils/
│   │   ├── generateOtp.ts         # crypto.randomInt — cryptographically secure
│   │   └── sendEmail.ts           # Resend email utility
│   ├── validators/
│   │   └── auth.validator.ts      # All Zod schemas
│   └── index.ts                   # App entry point
├── .env
├── package.json
├── tsconfig.json
└── readme.md
```

---

## Environment Variables

Create a `.env` file in the `backend/` root:

```env
PORT=3000
MONGO_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>

JWT_ACCESS_SECRET=<your_access_secret>
JWT_ACCESS_EXPIRES_IN=15m

JWT_REFRESH_SECRET=<your_refresh_secret>
JWT_REFRESH_EXPIRES_IN=30d

RESEND_API_KEY=<your_resend_api_key>

NODE_ENV=development
```

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Run in development (hot reload)
pnpm dev

# Build for production
pnpm build

# Run production build
pnpm start
```

Server runs on `http://localhost:3000` by default.

---

## Authentication System Overview

The auth system follows a **stateless JWT + OTP email verification** pattern.

```
Sign Up Flow:
  POST /signup → OTP sent to email → POST /signup/verify-otp → account active

Login Flow:
  POST /login → returns accessToken (body) + refreshToken (httpOnly cookie)

Token Refresh Flow:
  POST /authToken → reads refreshToken cookie → returns new accessToken

Forgot Password Flow:
  POST /forgot-password → OTP sent → POST /verify-password → POST /reset-password
```

- **Access Token** — short-lived (15m), sent in response body, stored in memory on client
- **Refresh Token** — long-lived (30d), stored in `httpOnly` cookie, never accessible via JS
- **OTP** — 4-digit, cryptographically secure, auto-deleted from DB after 300 seconds via MongoDB TTL index

---

## API Reference

Base URL: `http://localhost:3000/api/v1/auth`

All request bodies are `Content-Type: application/json`.

---

### 1. Sign Up

**POST** `/signup`

Creates a new user and sends OTP to email for verification.

**Request Body:**
```json
{
  "firstName": "Sushobhan",
  "lastName": "Das",
  "email": "user@example.com",
  "password": "Secret@123"
}
```

**Password Rules:** min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character.

**Responses:**
| Status | Meaning |
|---|---|
| 201 | User created, OTP sent |
| 200 | User exists but unverified — OTP resent |
| 400 | User already verified |
| 500 | Server error |

**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Sushobhan","lastName":"Das","email":"user@example.com","password":"Secret@123"}'
```

---

### 2. Verify Sign Up OTP

**POST** `/signup/verify-otp`

Verifies the OTP sent during sign up. Marks user as verified.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "4821"
}
```

**Responses:**
| Status | Meaning |
|---|---|
| 200 | Email verified successfully |
| 400 | OTP not found or expired |
| 500 | Server error |

**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/signup/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"4821"}'
```

---

### 3. Resend OTP

**POST** `/resend-otp`

Resends OTP for a given purpose. Deletes previous OTP before sending new one.

**Request Body:**
```json
{
  "email": "user@example.com",
  "purpose": "signup"
}
```

**`purpose` values:** `signup` | `reset-password` | `login`

**Responses:**
| Status | Meaning |
|---|---|
| 200 | OTP resent successfully |
| 400 | User not found or already verified |
| 500 | Server error |

**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/resend-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","purpose":"signup"}'
```

---

### 4. Login

**POST** `/login`

Authenticates user. Returns `accessToken` in body and sets `refreshToken` as `httpOnly` cookie.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Secret@123"
}
```

**Response Body (200):**
```json
{
  "accessToken": "<jwt_access_token>",
  "user": {
    "id": "<mongo_id>",
    "firstName": "Sushobhan",
    "lastName": "Das",
    "email": "user@example.com"
  }
}
```

**Responses:**
| Status | Meaning |
|---|---|
| 200 | Login successful |
| 401 | Invalid credentials |
| 403 | Email not verified |
| 500 | Server error |

**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"email":"user@example.com","password":"Secret@123"}'
```

> `-c cookies.txt` saves the `refreshToken` cookie for subsequent requests.

---

### 5. Refresh Token

**POST** `/authToken`

Issues a new `accessToken` using the `refreshToken` cookie. No request body needed.

**Requires:** `refreshTokenRes` cookie (set automatically on login).

**Response Body (200):**
```json
{
  "accessToken": "<new_jwt_access_token>"
}
```

**Responses:**
| Status | Meaning |
|---|---|
| 200 | New access token issued |
| 401 | No cookie / invalid token / user not found |

**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/authToken \
  -b cookies.txt
```

---

### 6. Logout

**POST** `/logout`

Clears the `refreshToken` cookie. No request body needed.

**Responses:**
| Status | Meaning |
|---|---|
| 200 | Logged out successfully |

**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/logout \
  -b cookies.txt \
  -c cookies.txt
```

---

### 7. Forgot Password

**POST** `/forgot-password`

Sends a password reset OTP to the user's email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Responses:**
| Status | Meaning |
|---|---|
| 200 | OTP sent successfully |
| 403 | User not verified |
| 404 | User not found |
| 500 | Server error |

**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com"}'
```

---

### 8. Verify Password OTP

**POST** `/verify-password`

Verifies the OTP sent for password reset. OTP is deleted from DB after successful verification.

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "3947"
}
```

**Responses:**
| Status | Meaning |
|---|---|
| 200 | OTP verified successfully |
| 400 | OTP not found or expired |
| 500 | Server error |

**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/verify-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","otp":"3947"}'
```

---

### 9. Reset Password

**POST** `/reset-password`

Sets a new password for the user. Password is hashed with bcrypt before saving.

**Request Body:**
```json
{
  "email": "user@example.com",
  "newPassword": "NewSecret@456"
}
```

**`newPassword` Rules:** same as signup — min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character.

**Responses:**
| Status | Meaning |
|---|---|
| 200 | Password reset successfully |
| 404 | User not found |
| 500 | Server error |

**cURL:**
```bash
curl -X POST http://localhost:3000/api/v1/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","newPassword":"NewSecret@456"}'
```

---

## Security Measures

| Measure | Implementation |
|---|---|
| Password hashing | bcrypt, salt rounds 12, pre-save hook on User model |
| Access token | JWT, short-lived (15m), stored in memory on client |
| Refresh token | JWT, long-lived (30d), `httpOnly` + `sameSite: strict` cookie |
| CSRF protection | `sameSite: strict` on cookie — browser enforces, no extra library needed |
| Security headers | `helmet()` applied globally before all routes |
| CORS | Restricted to `http://localhost:5173` only |
| OTP generation | `crypto.randomInt` — cryptographically secure, not `Math.random` |
| OTP expiry | MongoDB TTL index — auto-deleted after 300 seconds |
| Input validation | Zod schemas on every route — invalid payloads rejected before controller |
| Rate limiting | 5 requests / 15 min per IP on all auth endpoints |
| Token user check | `refreshTokenFunc` verifies user still exists in DB before issuing new token |

---

## Rate Limiting

All auth endpoints are protected with `express-rate-limit`.

| Endpoint | Limiter |
|---|---|
| `/signup` | `signupLimiter` |
| `/signup/verify-otp` | `verifyOtpLimit` |
| `/resend-otp` | `verifyOtpLimit` |
| `/login` | `logInLimiter` |
| `/forgot-password` | `forgotPassLimiter` |
| `/verify-password` | `verifyPassLimiter` |
| `/reset-password` | `resetPassLimiter` |

**Config:** 5 requests per 15 minutes per IP. Returns `429 Too Many Requests` on breach.

---

## Data Models

### User

```
Field       Type      Notes
─────────────────────────────────────────────
firstName   String    required
lastName    String    required
email       String    required, unique
password    String    required, bcrypt hashed on save
isVerified  Boolean   default: false
```

### OTP

```
Field      Type      Notes
──────────────────────────────────────────────────────
email      String    required
otp        String    required
purpose    String    enum: signup | login | reset-password
createdAt  Date      default: now — TTL 300s (auto-deleted by MongoDB)
```

---

## Known Limitations / Pre-Production Checklist

- [ ] **Email `from` address** — currently `onboarding@resend.dev` (Resend sandbox). Must be changed to a verified custom domain before production deploy.
- [ ] **CORS origin** — currently `http://localhost:5173`. Update to production frontend URL before deploy.
- [ ] **`secure: true` on cookie** — already conditional on `NODE_ENV === 'production'`. Ensure HTTPS in production.
- [ ] **Refresh token rotation** — current implementation reuses the same refresh token until expiry. Consider rotating on each use for higher security apps.
- [ ] **No login OTP flow** — `login` purpose exists in OTP model enum but is not implemented. Reserved for future 2FA.

---

## Branch Strategy

```
main
└── feature/authentication   ← current branch (this README)
    └── All auth code lives here as a permanent reference point
```

**To create and push this branch:**

```bash
# Step 1 — create and switch to the branch
git checkout -b feature/authentication

# Step 2 — stage all backend files
git add .

# Step 3 — commit
git commit -m "feat: complete authentication system"

# Step 4 — push to remote
git push -u origin feature/authentication
```

This branch is kept as a **reference implementation**. When building new features, branch off `main`. The auth code here can be copied into any future project.

---

*Last updated: Auth system v1.0 — JWT + OTP email verification, full forgot/reset password flow, rate limiting, Helmet, Zod validation.*
