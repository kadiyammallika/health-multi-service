# OneConnect Multi-Service Marketplace

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS, Framer Motion, Lucide icons
- **Backend**: Next.js API routes (Node.js runtime), Express server (server.js)
- **Database**: PostgreSQL via Supabase (direct `pg` connection, NOT Supabase JS client for main auth)
- **Auth**: Custom JWT + bcrypt + refresh token rotation (`src/lib/auth.js`)
- **Deployment**: Vercel

## Architecture
- **Identity model**: No role column — identity determined by which profile table has a record (customer_profiles, provider_profiles, admin_accounts)
- **Data layer**: `src/lib/db.js` (pg Pool singleton), `src/lib/auth.js` (JWT/bcrypt)
- **All service data**: Stored in `provider_listings` table with `details` JSONB column
- **Master Data (MDM)**: Centralized in `master_airlines`, `master_airports`, `master_aircraft` tables

## Key Files
- `src/lib/db.js` — Database connection pool (pg)
- `src/lib/auth.js` — JWT auth, password hashing, account identification
- `src/services/storage.js` — Client-side auth helpers, API wrappers
- `src/app/dashboard/provider/page.jsx` — Provider CRUD portal
- `src/app/dashboard/admin/page.jsx` — Admin dashboard with MDM tab
- `src/app/flights/page.jsx` — Customer flight search/booking
- `supabase/schema.sql` — Core database schema
- `supabase/mdm-migration.sql` — Master data tables + seed data

## Development
```bash
npm run dev              # Start Next.js dev server
npm run db:migrate       # Run core schema migration
npm run db:migrate-mdm   # Run MDM migration (airlines, airports, aircraft)
npm run db:seed          # Seed admin account
```

## API Routes
- `GET /api/master-data` — Public read of active master data (airlines/airports/aircraft)
- `GET/POST/PUT /api/admin/master-data/airlines` — Admin CRUD for airlines
- `GET/POST/PUT /api/admin/master-data/airports` — Admin CRUD for airports
- `GET/POST/PUT /api/admin/master-data/aircraft` — Admin CRUD for aircraft
- `GET /api/flights` — Flights with master data resolution via LEFT JOINs
- `GET/POST/PUT/DELETE /api/provider/listings` — Provider listing CRUD

## Conventions
- JSX files use `.jsx` extension
- API routes use standard Next.js App Router pattern (`route.js`)
- Admin auth check: `getAuthenticatedUser(request)` + `accountInfo.accountType === 'admin'`
- Provider form fields defined in `SERVICE_CONFIG` object with `type: 'master-dropdown'` for MDM fields
- All master data IDs stored in `provider_listings.details` JSONB
