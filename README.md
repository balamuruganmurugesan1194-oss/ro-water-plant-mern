# RO Water Plant Management — MERN

A MERN-stack web application based on the supplied 2026 RO Water Plant accounting and staff-sales workbooks.

## Modules
- JWT login with `admin` and `staff` roles
- Management dashboard: revenue, expenses, net profit, profit margin
- Daily sales entry: Retail, Supplier/Distributor, Other Income
- Automatic amount calculation (`quantity × rate`)
- Expense entry by category/month
- Customer & Supplier directory
- Monthly revenue/expense/profit summaries
- Search/filter sales
- Responsive React UI

## Stack
- React + Vite
- Node.js + Express
- MongoDB + Mongoose
- JWT + bcrypt
- Recharts
- Axios

## Run locally

### 1. Backend
```bash
cd server
npm install
cp .env.example .env
npm run seed
npm run dev
```

Windows PowerShell:
```powershell
cd server
npm install
Copy-Item .env.example .env
npm run seed
npm run dev
```

### 2. Frontend
```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

Default seeded accounts:
- Admin: `admin@rowater.local` / `Admin@123`
- Staff: `staff@rowater.local` / `Staff@123`

Change these credentials before production use.

## MongoDB
Default connection:
`mongodb://127.0.0.1:27017/ro_water_plant`

Set `MONGO_URI` in `server/.env` for Atlas or another MongoDB server.

## Production
Build the frontend with `npm run build` and serve the generated `client/dist` from a web server/CDN. Put the API behind HTTPS and use a strong JWT secret.
