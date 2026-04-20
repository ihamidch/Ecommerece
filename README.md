# MERN E-commerce Web App

A full-stack E-commerce application built with the MERN stack:
- Frontend: React + Vite + Bootstrap
- Backend: Node.js + Express.js
- Database: MongoDB Atlas

## Features

### Customer features
- User signup/login with JWT authentication
- Product listing with search and filters
- Product details page
- Cart management (add, remove, quantity update)
- Checkout flow (mock payment or Stripe-ready)
- Order history in user dashboard

### Admin features
- Admin dashboard
- Create/update/delete products
- View and manage customer orders

### Integrations
- Cloudinary-ready image upload endpoint
- Stripe payment-intent endpoint with mock fallback

## Project structure

```bash
.
├── backend
│   ├── src
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── app.js
│   │   └── server.js
│   └── vercel.json
└── frontend
    ├── src
    │   ├── api
    │   ├── components
    │   ├── context
    │   ├── pages
    │   ├── App.jsx
    │   └── main.jsx
    └── vercel.json
```

## API overview

### Auth
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Products
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products` (admin)
- `PUT /api/products/:id` (admin)
- `DELETE /api/products/:id` (admin)

### Orders
- `POST /api/orders`
- `GET /api/orders/my-orders`
- `GET /api/orders` (admin)
- `PATCH /api/orders/:id/status` (admin)
- `POST /api/orders/payment-intent`

### Users
- `GET /api/users` (admin)

### Upload
- `POST /api/upload` (admin)

## Environment variables

### Backend (`backend/.env`)

Copy from `backend/.env.example` and update values:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ecommerce
JWT_SECRET=replace-with-strong-secret
CLIENT_URL=http://localhost:5173
ADMIN_EMAILS=admin@example.com
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
STRIPE_SECRET_KEY=
```

### Frontend (`frontend/.env`)

Copy from `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Local development

### 1) Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2) Run backend

```bash
cd backend
npm run dev
```

### 3) Run frontend

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:5173` and backend at `http://localhost:5000`.

### Optional: seed demo catalog

```bash
cd backend
npm run seed:demo
```

### Functional API test (register/login/cart/order/admin flow)

```bash
cd backend
npm run test:e2e
```

If the command prints `E2E tests passed.`, core authentication and order-management functionality is working.

## MongoDB Atlas setup

1. Create a MongoDB Atlas cluster.
2. Create a database user.
3. Add your IP in Network Access.
4. Copy connection string into `MONGO_URI`.

## Admin account setup

To auto-assign admin role on signup, include the email in:

```env
ADMIN_EMAILS=admin@example.com,owner@example.com
```

If a user signs up with one of those emails, they receive `admin` role.

## Deployment

### Backend to Vercel

1. Import `backend` as a Vercel project.
2. Set all backend environment variables in Vercel project settings.
3. Deploy (uses `backend/vercel.json`).

### Frontend to Vercel

1. Import `frontend` as a separate Vercel project.
2. Set `VITE_API_URL` to deployed backend URL + `/api`.
3. Deploy (uses `frontend/vercel.json` for SPA rewrites).

## Suggested GitHub repository setup

1. Initialize git in repo root.
2. Push to GitHub.
3. Add project description, screenshots, and live links in repository README.

## Notes

- Stripe is optional. Without `STRIPE_SECRET_KEY`, checkout uses mock payments.
- Cloudinary is optional. If not configured, image upload endpoint can still accept base64 preview data.
