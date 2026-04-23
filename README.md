# MERN E-commerce SaaS Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)

Full-stack **MERN** e-commerce application with **JWT authentication**, **role-based admin tools**, **cart → checkout → orders**, **reviews & ratings**, and a **modern Tailwind UI**. The API is structured for clarity (controllers, routes, models, middleware) and is intended to read as **job-ready** and **deployable**.

---

## Live demo

| | URL |
|---|-----|
| **Frontend (Vercel)** | [ecommerece-mern-web.vercel.app](https://ecommerece-mern-web.vercel.app) |
| **Backend API** | [backend-two-weld-46.vercel.app](https://backend-two-weld-46.vercel.app) |
| **Health** | [`/api/health`](https://backend-two-weld-46.vercel.app/api/health) |
| **Repository** | [github.com/ihamidch/Ecommerece](https://github.com/ihamidch/Ecommerece) |

---

## Screenshots

| Home | Product |
|:---:|:---:|
| ![Home](docs/screenshots/home.png) | ![Product](docs/screenshots/product.png) |

| Auth | Cart |
|:---:|:---:|
| ![Auth](docs/screenshots/auth.png) | ![Cart](docs/screenshots/cart.png) |

| Checkout | Admin (products) |
|:---:|:---:|
| ![Checkout](docs/screenshots/checkout.png) | ![Admin](docs/screenshots/admin.png) |

> **Regenerate images:** `cd frontend && npm run capture-screenshots`  
> Optional env: `SCREENSHOT_SITE_URL`, `SCREENSHOT_API_URL` (defaults target the live demo).

---

## Features

- **Authentication & RBAC** — Signup/login, JWT access + refresh flow, protected routes (user vs admin).
- **Catalog** — Search, filters (category, price, minimum rating), sorting, pagination.
- **Product details** — Stock-aware quantity, reviews & ratings (authenticated).
- **Cart & checkout** — Persistent cart; server sync when logged in; checkout + order success.
- **Payments** — Stripe Payment Intents + Checkout Session API (mock mode when keys are absent).
- **Orders** — User order history; admin order list and status updates.
- **Admin** — Products CRUD, orders, users/roles, analytics (users, orders, paid revenue), Cloudinary-ready image upload.
- **Quality** — Loading states, toasts, responsive layout, GitHub Actions CI (lint/build + API boot check).

---

## Tech stack

| Layer | Technologies |
|--------|----------------|
| **Frontend** | React 19, Vite, React Router, Axios, Tailwind CSS, Context API, Sonner |
| **Backend** | Node.js, Express, Mongoose, JWT, Zod, Helmet, express-rate-limit |
| **Database** | MongoDB (Atlas) |
| **Integrations** | Stripe, Cloudinary, bcrypt |
| **Deploy** | Vercel (frontend + API) |

*State is managed with **React Context** (not Redux) for auth and cart.*

---

## Repository layout

This repo uses **`frontend/`** and **`backend/`** (common for Vite + Express). Conceptually:

| In this repo | Same idea as |
|--------------|----------------|
| `frontend/` | **client** (React app) |
| `backend/src/` | **server** (Express API) |

```
Ecommerece/
├── frontend/                 # React + Vite (UI)
│   ├── src/
│   │   ├── api/              # Axios client
│   │   ├── components/     # Layout, UI, admin shell
│   │   ├── context/        # Auth & cart
│   │   ├── pages/          # Public + admin pages
│   │   └── utils/          # Helpers
│   └── .env.example
├── backend/                  # Express API
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, validation, logging, CORS, etc.
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # HTTP routes
│   │   ├── services/       # Seeding & helpers
│   │   ├── validation/     # Zod schemas
│   │   ├── app.js
│   │   └── server.js
│   ├── scripts/
│   └── .env.example
├── docs/screenshots/         # UI captures for the README
├── .github/workflows/        # CI
├── CONTRIBUTING.md
├── DEPLOYMENT.md
├── LICENSE
└── README.md
```

---

## Quick start

### 1) Clone and install

```bash
git clone https://github.com/ihamidch/Ecommerece.git
cd Ecommerece
cd backend && npm install
cd ../frontend && npm install
```

### 2) Environment variables

Copy the examples and fill in secrets:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

- **Backend:** set `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`, and (optional) Stripe / Cloudinary keys. See [Environment variables](#environment-variables) below.
- **Frontend:** set `VITE_API_URL` to your backend base **including** `/api`, e.g. `https://your-api.vercel.app/api`.

### 3) Run locally

```bash
# Terminal 1 — API (default http://localhost:5000)
cd backend && npm run dev

# Terminal 2 — UI (default http://localhost:5173)
cd frontend && npm run dev
```

### 4) Quality checks

```bash
cd frontend && npm run lint && npm run build
cd ../backend && node -e "require('./src/app')"
```

---

## Environment variables

**Never commit real secrets.** Use `.env` locally; production uses the host’s env UI (e.g. Vercel).

### Backend (`backend/.env`) — see `backend/.env.example`

| Variable | Purpose |
|----------|---------|
| `MONGO_URI` | MongoDB connection string (Atlas) |
| `JWT_SECRET` | Access token signing secret |
| `JWT_REFRESH_SECRET` | Refresh token secret (can match `JWT_SECRET` in dev only) |
| `CLIENT_URL` | Primary frontend origin (CORS) |
| `STRIPE_SECRET_KEY` | Stripe server secret (test mode) |
| `CLOUDINARY_*` | Cloud name, API key, API secret (image upload) |

> **Note:** This project uses `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` — not a single `CLOUDINARY_URL`. Some tools expect `CLOUDINARY_URL`; if you use one, map it in your host or split it into the three variables above.

### Frontend (`frontend/.env`) — see `frontend/.env.example`

| Variable | Purpose |
|----------|---------|
| `VITE_API_URL` | Public API base URL **ending with** `/api` |

---

## API reference (summary)

**Base path:** `/api` (e.g. `https://<host>/api/auth/login`).

### Auth

| Method | Path | Notes |
|--------|------|--------|
| `POST` | `/auth/signup` | Register |
| `POST` | `/auth/login` | Login |
| `POST` | `/auth/refresh` | New access + refresh tokens |
| `POST` | `/auth/logout` | Auth required |
| `GET` | `/auth/me` | Current user |

### Products

| Method | Path | Notes |
|--------|------|--------|
| `GET` | `/products` | Query: search, category, min/max price, minRating, sort, `page`, `limit` |
| `GET` | `/products/categories` | Category list |
| `GET` | `/products/:id` | Product detail + embedded reviews |
| `POST` | `/products/:id/reviews` | Add/update review (auth) |
| `POST` | `/products` | Create (admin) |
| `PUT` | `/products/:id` | Update (admin) |
| `DELETE` | `/products/:id` | Delete (admin) |

### Orders

| Method | Path | Notes |
|--------|------|--------|
| `POST` | `/orders` | Create order (auth) |
| `GET` | `/orders/my` | User orders |
| `GET` | `/orders/:id` | Order detail (owner or admin) |
| `GET` | `/orders` | All orders (admin) |
| `PUT` or `PATCH` | `/orders/:id/status` | Update status (admin) |
| `POST` | `/orders/payment-intent` | Stripe PaymentIntent (auth) |
| `POST` | `/orders/checkout-session` | Stripe Checkout URL (auth) |

### Users & upload

- Cart: `GET/PUT /users/me/cart` (auth)  
- Wishlist: `GET /users/me/wishlist`, `POST /users/me/wishlist/:productId` (auth)  
- Admin analytics: `GET /users/admin/analytics` (admin)  
- Users: `GET /users`, `PATCH /users/:id/role` (admin)  
- Upload: `POST /upload` (admin, image)

---

## Deployment

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for Vercel + MongoDB Atlas. After changing `VITE_API_URL` or CORS settings, **redeploy** the affected project.

---

## Suggested GitHub repository settings (manual)

In the GitHub UI, add **About** description and **topics**, for example:

`mern`, `ecommerce`, `react`, `nodejs`, `express`, `mongodb`, `stripe`, `tailwindcss`, `jwt`, `fullstack`, `vercel`

---

## Contributing

See **[CONTRIBUTING.md](./CONTRIBUTING.md)**.

---

## License

This project is licensed under the [MIT License](./LICENSE).

---

## Author

| | |
|---|--|
| **Name** | Hamid Rafique |
| **GitHub** | [@ihamidch](https://github.com/ihamidch) |
| **Portfolio** | [porfolio-ihamidchs-projects.vercel.app](https://porfolio-ihamidchs-projects.vercel.app) |
| **LinkedIn** | *Add your public profile URL here* |

If you use this project in an interview, link this README and the **live demo** for the fastest “what I built” signal.
