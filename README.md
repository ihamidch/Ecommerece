# MERN E-commerce SaaS Platform

Production-ready full-stack e-commerce application built with the MERN stack.  
It includes secure JWT authentication, role-based admin controls, full cart-to-checkout flow, and a modern responsive SaaS UI.

## Live Links

- Frontend: https://ecommerece-mern-web.vercel.app
- Backend API: https://backend-two-weld-46.vercel.app
- Health Check: https://backend-two-weld-46.vercel.app/api/health
- Repository: https://github.com/ihamidch/Ecommerece

---

## Features

### Authentication & Security
- User signup/login with bcrypt password hashing
- JWT authentication with protected backend routes
- Role-based access control (`user`, `admin`)
- Frontend route guards for authenticated and admin-only pages

### E-commerce Core
- Product catalog with search, category, and price range filters
- Product detail view with stock-aware cart actions
- Cart add/remove/update quantity with localStorage persistence
- Checkout flow with shipping info and order summary
- Order success page with order ID and summary
- User order history dashboard

### Admin Dashboard
- SaaS-style admin panel with sidebar navigation
- Product management (create/update/delete)
- Order management (view all, update status)
- User management and role updates
- Image upload endpoint (Cloudinary-ready)

### UX & Performance
- Responsive design (mobile/tablet/desktop)
- Loading skeletons and page loaders
- Toast notifications for key actions
- Lazy-loaded routes and polished UI transitions

---

## UI Preview

- Storefront: https://ecommerece-mern-web.vercel.app
- Auth: https://ecommerece-mern-web.vercel.app/auth
- Cart: https://ecommerece-mern-web.vercel.app/cart
- Admin (requires admin account): https://ecommerece-mern-web.vercel.app/admin/products

---

## Tech Stack

- Frontend: React, Vite, React Router, Axios, Tailwind CSS
- Backend: Node.js, Express, Mongoose, JWT, bcryptjs, Multer, Cloudinary, Stripe
- Database: MongoDB Atlas
- Deployment: Vercel (frontend + backend)

---

## Project Structure

```text
Ecommerece/
├── frontend/                 # React + Vite app
│   ├── src/api/              # Axios client
│   ├── src/components/       # Reusable UI + layout
│   ├── src/context/          # Auth/Cart providers
│   ├── src/pages/            # Public/user/admin pages
│   └── src/utils/            # Helpers
├── backend/
│   └── src/
│       ├── controllers/      # Route handlers
│       ├── middleware/       # auth, notFound, etc.
│       ├── models/           # User/Product/Order schemas
│       ├── routes/           # API route wiring
│       ├── services/         # seed/utility services
│       ├── app.js            # Express app config
│       └── server.js         # DB + runtime bootstrap
├── DEPLOYMENT.md
└── README.md
```

---

## REST API Overview

Base URL: `/api`

### Auth
- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me` (protected)

### Products
- `GET /products`
- `GET /products/categories`
- `GET /products/:id`
- `POST /products` (admin)
- `PUT /products/:id` (admin)
- `DELETE /products/:id` (admin)

### Orders
- `POST /orders` (protected)
- `GET /orders/user` (protected)
- `GET /orders/my-orders` (protected, backward-compatible)
- `GET /orders/:id` (owner/admin)
- `GET /orders` (admin)
- `PUT /orders/:id/status` (admin)
- `PATCH /orders/:id/status` (admin, backward-compatible)
- `POST /orders/payment-intent` (protected)

### Users (Admin)
- `GET /users`
- `PATCH /users/:id/role`

### Upload (Admin)
- `POST /upload`

---

## Environment Variables

Use `.env.example` files as source of truth.

### Backend (`backend/.env`)
```env
PORT=5000
MONGO_URI=<mongodb-atlas-uri>
JWT_SECRET=<strong-random-secret>
CLIENT_URL=<frontend-production-url>
CLIENT_URLS=<optional-comma-separated-origins>
ALLOW_PREVIEW_ORIGINS=true
ADMIN_EMAILS=admin@example.com
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
STRIPE_SECRET_KEY=
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=<backend-url>/api
```

---

## Local Setup

### 1) Install dependencies
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2) Start backend
```bash
cd backend
npm run dev
```

### 3) Start frontend
```bash
cd frontend
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000`

---

## Scripts

### Backend
- `npm run dev` - run API in watch mode
- `npm run start` - production start
- `npm run seed:demo` - seed demo products
- `npm run cleanup:test-products` - remove test products
- `npm run test:e2e` - API e2e smoke script

### Frontend
- `npm run dev`
- `npm run lint`
- `npm run build`
- `npm run preview`

---

## Deployment Notes

- Configure backend env vars in Vercel project settings.
- Configure frontend `VITE_API_URL` to your backend `/api` URL.
- Redeploy frontend after changing backend URL/env.
- For custom preview-domain behavior, adjust backend `ALLOW_PREVIEW_ORIGINS`.

Detailed deployment steps: see `DEPLOYMENT.md`.

---

## Portfolio Summary

This project demonstrates production-level MERN engineering:
- secure authentication and authorization
- full e-commerce workflow
- admin operations
- modern scalable frontend architecture
- deployment-ready backend/API practices
