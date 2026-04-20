# Ecommerece (MERN)

Full-stack e-commerce platform built with MERN where users can browse products, manage cart items, place orders, and track purchases, while admins manage products and order lifecycle.

## Live Demo

- App (Frontend): https://ecommerece-mern-web.vercel.app
- API (Backend): https://backend-two-weld-46.vercel.app
- Repository: https://github.com/ihamidch/Ecommerece

These are **dedicated Vercel projects** for this e-commerce app. Older URLs that pointed at generic `frontend` / `backend` projects may have shown a different repo (for example Freelancer Marketplace) because the same deployment names were reused.

## Features

- JWT authentication (signup/login/me)
- Role-based access (`user`, `admin`)
- Product catalog with search and price/category filters
- Product details and cart management
- Checkout flow (mock payment + Stripe-ready endpoint)
- User dashboard with order history
- Admin dashboard for:
  - Add/edit/delete products
  - View and update order status
- Cloudinary-ready upload endpoint

## Tech Stack

- Frontend: React, Vite, React Router, Axios, Bootstrap
- Backend: Node.js, Express, Mongoose, JWT, Multer, Cloudinary, Stripe
- Database: MongoDB Atlas
- Deployment: Vercel (frontend + backend)

## Repository Layout

```text
Ecommerece/
├── frontend/          # React + Vite client
├── backend/           # Express + MongoDB API
├── DEPLOYMENT.md      # Deployment steps (Vercel + Atlas)
└── README.md
```

## API Overview

Base path: `/api`

- Auth
  - `POST /auth/signup`
  - `POST /auth/login`
  - `GET /auth/me`
- Products
  - `GET /products`
  - `GET /products/:id`
  - `POST /products` (admin)
  - `PUT /products/:id` (admin)
  - `DELETE /products/:id` (admin)
- Orders
  - `POST /orders`
  - `GET /orders/my-orders`
  - `GET /orders` (admin)
  - `PATCH /orders/:id/status` (admin)
  - `POST /orders/payment-intent`
- Users
  - `GET /users` (admin)
- Upload
  - `POST /upload` (admin)

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=<mongodb atlas uri>
JWT_SECRET=<strong random secret>
CLIENT_URL=http://localhost:5173
ADMIN_EMAILS=admin@example.com
CLOUDINARY_CLOUD_NAME=<optional>
CLOUDINARY_API_KEY=<optional>
CLOUDINARY_API_SECRET=<optional>
STRIPE_SECRET_KEY=<optional>
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

## Local Development

Install and run:

```bash
cd backend && npm install
cd ../frontend && npm install
```

Run backend:

```bash
cd backend
npm run dev
```

Run frontend:

```bash
cd frontend
npm run dev
```

Useful backend scripts:

- `npm run seed:demo` (seed showcase catalog)
- `npm run cleanup:test-products` (remove placeholder test products)
- `npm run test:e2e` (API flow test for auth/products/orders/admin)

## Deployment

Quick deploy summary:

1. Deploy `backend` on Vercel (root directory: `backend`)
2. Add backend envs (`MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, etc.)
3. Deploy `frontend` on Vercel (root directory: `frontend`)
4. Add `VITE_API_URL=<backend-url>/api`
5. Redeploy frontend

Detailed steps are in `DEPLOYMENT.md`.

## Notes

- Stripe is optional. If not configured, checkout still works with mock payment mode.
- Cloudinary is optional. If not configured, direct URL image input still works.
