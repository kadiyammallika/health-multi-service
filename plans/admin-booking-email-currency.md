# Implementation Plan: Admin Redesign, Booking Approval, Email, Provider Bookings, Currency

## Phase 1: Database Migration
**New columns on `bookings` table:**
- `admin_approval_status` (TEXT) — `AWAITING_ADMIN_APPROVAL`, `APPROVED`, `REJECTED`
- `approved_by` (UUID FK → users)
- `approval_timestamp` (TIMESTAMPTZ)
- `rejection_reason` (TEXT)
- `email_notification_status` (TEXT) — `pending`, `sent`, `failed`, `not_required`
- `display_currency` (TEXT, default 'INR')
- `exchange_rate` (DECIMAL)
- `original_currency` (TEXT, default 'INR')

**New table: `email_logs`**
- id, booking_id, recipient_email, email_type, subject, status, sent_at, error_message

**Migration file:** `supabase/admin-booking-currency-migration.sql`

## Phase 2: Admin Portal White Redesign
- Rewrite `src/app/dashboard/admin/page.jsx` with white/clean design
- White background, white sidebar, grey borders, subtle shadows
- Black/dark grey text, no colorful gradients
- Professional enterprise look — clean tables, minimal icons
- Keep ALL existing functionality (Users, Partners, Bookings, Categories, Master Data)

## Phase 3: Admin Booking Approval Workflow
- All new bookings start as `AWAITING_ADMIN_APPROVAL`
- Update POST `/api/bookings` to set `admin_approval_status = 'AWAITING_ADMIN_APPROVAL'`
- Admin sees all pending approval bookings with full details
- Admin can **Approve** (sets APPROVED, records admin ID + timestamp, triggers email)
- Admin can **Reject** (sets REJECTED, saves reason, triggers rejection email)
- Update PATCH `/api/bookings` for new approval actions

## Phase 4: Email Notifications (Resend)
- Install `resend` npm package (free tier: 100 emails/day, 3000/month)
- Create `/api/email/send` API route (server-side only)
- Send confirmation email on approval with full booking details
- Send rejection email with reason
- Track email status in `email_logs` table + `email_notification_status` on booking
- Prevent duplicate emails (check if already sent for that booking+action)
- ENV: `RESEND_API_KEY`

**Email service: Resend (resend.com)**
- Free: 100 emails/day, 3000/month
- No credit card needed
- Simple API: one POST call to send
- Sign up at resend.com → get API key → add to .env.local

## Phase 5: Provider Booking Management
- Enhance provider dashboard bookings tab
- Show bookings only for their listings (already filtered by API)
- Add filter tabs: All, Pending, Confirmed, Rejected, Cancelled, Completed
- Show: reference, customer name, service, category, date/time, guests, amount, status, admin approval status
- Expandable booking details with customer requirements
- Provider can mark bookings as "Completed" when service is delivered

## Phase 6: Exchange Rate API + Currency Selector
- **API: ExchangeRate-API (exchangerate-api.com)** — Free tier: 1500 req/month
- Create `/api/exchange-rates` route to fetch & cache rates (cache 1 hour)
- Add currency selector to Navbar (INR, USD, EUR, GBP, AED, JPY, etc.)
- Store preference in localStorage, persist across pages
- Create `CurrencyProvider` React context for app-wide currency state
- Convert prices on display only — NEVER modify DB amounts
- Show "Prices in [currency] • Updated [time]" indicator
- Apply to: flights, hotels, buses, wellness, properties pages
- At booking time, store `display_currency` and `exchange_rate` used

## Phase 7: Customer Booking Page Updates
- After booking submission, show "Awaiting Admin Approval" status
- When approved, show confirmed status + "Confirmation email sent"
- When rejected, show reason
- My Bookings page reflects latest status

## Files Modified
1. `supabase/admin-booking-currency-migration.sql` (NEW)
2. `scripts/migrate-admin-booking.js` (NEW)
3. `src/app/dashboard/admin/page.jsx` (REWRITE - white design)
4. `src/app/api/bookings/route.js` (UPDATE - approval workflow)
5. `src/app/api/email/send/route.js` (NEW - email service)
6. `src/app/api/exchange-rates/route.js` (NEW - currency API)
7. `src/app/dashboard/provider/page.jsx` (UPDATE - booking management)
8. `src/app/dashboard/customer/page.jsx` (UPDATE - approval status display)
9. `src/components/layout/Navbar.jsx` (UPDATE - currency selector)
10. `src/components/ui/CurrencyProvider.jsx` (NEW - currency context)
11. `src/app/layout.jsx` (UPDATE - wrap with CurrencyProvider)
12. `src/services/storage.js` (UPDATE - currency helpers)
13. `src/app/flights/page.jsx` (UPDATE - currency display)
14. `src/app/hotels/page.jsx` (UPDATE - currency display)
15. `src/app/buses/page.jsx` (UPDATE - currency display)
16. `src/app/wellness/page.jsx` (UPDATE - currency display)
17. `src/app/properties/page.jsx` (UPDATE - currency display)
18. `src/components/ui/PaymentModal.jsx` (UPDATE - currency display)
19. `.env.example` (UPDATE - new env vars)

## Environment Variables Required
```
RESEND_API_KEY=re_xxxxxxxx          # From resend.com (free)
EXCHANGE_RATE_API_KEY=xxxxxxxx       # From exchangerate-api.com (free)
```

## Implementation Order
1. Database migration → 2. Admin white redesign → 3. Booking approval API → 4. Email integration → 5. Provider booking management → 6. Currency conversion → 7. Customer page updates
