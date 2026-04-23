# Deployment Guide (Vercel + MongoDB Atlas)

This project is deployed as two Vercel projects:
- `backend` (Express API)
- `frontend` (React app)

## 1) Deploy Backend

1. In Vercel, create/import project from the repo.
2. Set root directory to `backend`.
3. Configure environment variables:

```env
MONGO_URI=<mongodb atlas uri>
JWT_SECRET=<strong secret>
CLIENT_URL=<frontend production url>
ADMIN_EMAILS=admin@example.com
CLOUDINARY_CLOUD_NAME=<optional>
CLOUDINARY_API_KEY=<optional>
CLOUDINARY_API_SECRET=<optional>
```

4. Deploy and verify:
   - `https://<backend-domain>/api/health` should return `{ "status": "ok" }`.
   - `https://<backend-domain>/api/products` should list demo items on first request if the database was empty (auto catalog seed). Set `SKIP_AUTO_DEMO_SEED=true` in Vercel if you want an empty catalog instead.

**Current production example**

- Backend: `https://backend-two-weld-46.vercel.app`
- Frontend: `https://ecommerece-mern-web.vercel.app` (build with `VITE_API_URL=https://backend-two-weld-46.vercel.app/api`)

## 2) Deploy Frontend

1. In Vercel, create/import second project from the same repo.
2. Set root directory to `frontend`.
3. Set environment variable:

```env
VITE_API_URL=https://<backend-domain>/api
```

4. Deploy frontend and verify UI flows.

## 3) Post-Deploy Checks

- Signup/login works
- Products load on home page
- Cart and checkout create orders
- Admin dashboard loads products/orders
- API calls do not fail with CORS errors

## 4) Redeploy After Changes

Any push to `main` will trigger auto deploy if Git integration is enabled.
If needed, redeploy manually from Vercel dashboard.
