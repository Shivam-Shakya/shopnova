# ShopNova — MERN E-commerce Starter

A responsive React storefront + Express/MongoDB API + separately routed, role-protected admin area.

## Requirements
- Node.js 18+
- MongoDB local or MongoDB Atlas connection string

## Setup
1. Copy `backend/.env.example` to `backend/.env` and set `MONGO_URI`, `JWT_SECRET`, and `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
2. Install dependencies from the project root: `npm run install:all`
3. Start the API: `npm run dev:backend`
4. In another terminal start React: `npm run dev:frontend`
5. Open `http://localhost:5173`. Admin route: `http://localhost:5173/admin`.

In development, startup can seed repeatable demo accounts (only when `NODE_ENV` is not
`production`). Set `DEMO_CUSTOMER_EMAIL`, `DEMO_CUSTOMER_PASSWORD`, `DEMO_ADMIN_EMAIL`,
and `DEMO_ADMIN_PASSWORD` in `backend/.env`; credentials are intentionally not stored
in source code.

The demo checkout is explicitly a cash-on-delivery simulation. Product prices and stock
are re-read and validated by the backend at checkout. Contact messages are persisted in
MongoDB through `POST /api/contact`. Set `NODE_ENV=production` to disable demo account
seeding, and always provide a strong `JWT_SECRET` and production MongoDB credentials.

The API startup creates the configured admin account if it does not exist. Demo catalog data is
separate and safe to run repeatedly:

```powershell
npm run seed:products --prefix backend
```

This command upserts exactly 10 development products per approved navbar subcategory (380 total) by stable
demo SKU. It never deletes or updates products that do not have a demo SKU, so it does not
overwrite customer-created products or orders. Demo account credentials are configured with
`DEMO_CUSTOMER_EMAIL` / `DEMO_CUSTOMER_PASSWORD` and `DEMO_ADMIN_EMAIL` /
`DEMO_ADMIN_PASSWORD`; the admin panel is available at `/admin`.

On API startup, the navbar hierarchy is synchronized into the MongoDB `categories`
collection. The active catalog is restricted to Men, Women, Kids, and Accessories.
Obsolete categories and products are retained for historical safety but marked inactive.
To also seed the repeatable demo catalog during startup, set `SEED_DEMO_CATALOG=true`.
The storefront navbar and admin catalogue both read `GET /api/categories`.

## Included
- Product listing/search/category filters/sorting
- Product details by stable ID or slug, category/subcategory filters, cart, variant selection,
  authenticated demo checkout, and customer order history/status timeline
- JWT login/register
- Admin login with role check; product create/edit/delete and order list
- Responsive layout, product imagery, motion effects

## Important production notes
- Checkout is a demo order flow, not a real payment integration. Connect a payment provider before accepting payments.
- Use HTTPS, strong secrets, a production MongoDB account, rate limiting, backups, and proper image storage (e.g. Cloudinary/S3) before deployment.
- `/admin` being unlisted is not security by itself. API routes enforce the admin role.
