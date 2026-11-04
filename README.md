# OneConnect - Multi-Service Digital Living, Travel & Wellness Marketplace

> **Commercial-Grade Multi-Service Digital Platform Built with Next.js (App Router), JavaScript/JSX, and Tailwind CSS.**

OneConnect brings together essential lifestyle, travel, and holistic health services into a unified application. Customers can discover, compare, book, simulate payment, and manage services with a single account.

---

## 🔐 Three-Role Authentication System

OneConnect features a role-based login system for three user types with distinct dashboard routing, route protection, and credential validation:

### 1. Supported Roles & Demo Accounts

| Role | Demo Email | Demo Password | Redirected Dashboard |
| :--- | :--- | :--- | :--- |
| **👤 Customer** | `customer@oneconnect.com` | `Password123!` | `/dashboard/customer` |
| **🩺 Service Provider** | `provider@oneconnect.com` | `Password123!` | `/dashboard/provider` |
| **🛡️ Administrator** | `admin@oneconnect.com` | `Password123!` | `/dashboard/admin` |

### 2. Login Page Capabilities (`/login`)
- **Role Tabs**: Three highlighted login tabs (`Customer Login`, `Provider Login`, `Admin Login`).
- **Show/Hide Password**: Integrated eye icon for toggling password visibility.
- **Remember Me**: Saves the email on the browser for quick return visits.
- **Forgot Password Modal**: Interactive simulation modal for password recovery.
- **Role Mismatch Detection**: If a customer email tries to log in under the Provider or Admin tab, a clear warning guides the user to the correct tab.
- **1-Click Demo Credentials Card**: Click any demo account card to automatically populate credentials and select the correct role tab.
- **Route Protection (`AuthGuard`)**: Direct access to `/dashboard/*` requires an active session with the correct role. Cross-role boundary attempts display a restriction warning with a quick return button.
- **Sign Out**: Available in the Navbar, top Role Switcher bar, and all dashboards. It clears the session and returns to `/login`.

---

## 🌟 Key Application Verticals

1. **✈️ Flight Booking**
   - One-way and round-trip route search between major domestic & international hubs.
   - Comprehensive results with airline logos, flight numbers, aircraft specs, timings, duration, and stops.
   - Dynamic sorting (Lowest Price, Fastest Duration, Earliest Departure) and airline/price filters.
   - Passenger details form with validation.
   - Transparent fare breakdown (Base airfare, aviation taxes, convenience fees).
   - Simulated payment gateway (Card, UPI QR, Net Banking) with failure simulation mode toggle.
   - Instant e-ticket generation with boarding pass view and print-ready vouchers (`window.print()`).

2. **🚌 Bus Booking**
   - Inter-city sleeper and luxury Volvo bus search.
   - Operator credentials, bus types, boarding and dropping points.
   - **Interactive visual seat layout**: Upper deck & lower deck berth/seat matrix with real-time selection and booked-seat collision avoidance.
   - Boarding point selector, passenger detail capture, fare breakdown.
   - Booking reference generation and printable bus travel voucher.

3. **🏨 Hotel & Luxury Stays**
   - Destination-based search, check-in/out dates, guest and room count.
   - Curated luxury resorts, courtyard heritage palaces, and beachfront villas with high-res galleries.
   - Multiple room categories (Deluxe Courtyard, Presidential Suites) with specific inclusions.
   - Automated night count calculation, resort fees, and hospitality taxes.
   - Reservation confirmation voucher with printable e-receipt.

4. **🌿 Holistic Wellness & Alternative Therapies**
   - Diverse therapy verticals: Ayurveda & Panchakarma, Yoga & Pranayama, Physiotherapy & Sports Rehab, Tibetan Sound Meditation, Clinical Nutrition, and Acupuncture.
   - Verified practitioner profiles with credentials, experience, consultation modes (In-Person / Online Video), and fee schedules.
   - Dynamic calendar and time slot picker with **duplicate slot booking protection**.
   - **Two-way workflow**: Appointments start in **Pending** status. Practitioners can **Accept** or **Decline** directly from the Provider Dashboard, updating the Customer Dashboard in real-time.

5. **🏡 Property Buying & Renting**
   - Dedicated tabs for **Buy Property** and **Rent Property**.
   - Filtering by budget, location, property type (Villas, Penthouses, Luxury Apartments), and BHK count.
   - Complete property specifications: Area in sq ft, bathrooms, amenities, and verified realty agent contacts.
   - Direct enquiry & site visit scheduling modal with date/time preference and custom notes.
   - Generated enquiry reference stored under the customer's dashboard in a **dedicated Property Enquiries tab** (kept separate from ticket bookings).

---

## 🛡️ Role-Based Portals & Interactive Persona Switcher

AuraLife includes an **Interactive Role Switcher Bar** at the top of the interface, allowing evaluators to switch roles with 1-click:

| Persona | Name | Role Purpose | Dashboard URL |
| :--- | :--- | :--- | :--- |
| **Customer** | Alex Morgan | Search, book travel/hotels, request wellness sessions, submit property visit requests, cancel bookings, view tickets. | `/dashboard/customer` |
| **Provider** | Dr. Aarav Patel | Manage incoming wellness requests, **Accept** or **Decline** patient bookings, toggle live availability time slots, view client leads. | `/dashboard/provider` |
| **Admin** | Sarah Jenkins | Super Admin overview, platform GMV volume, audit bookings ledger, **Approve** or **Reject** prospective partner applications. | `/dashboard/admin` |

---

## 🛠️ Technology Stack

- **Framework**: [Next.js](https://nextjs.org/) (v14 App Router)
- **Language**: JavaScript (ES6+ & JSX)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with custom design tokens
- **Icons**: [Lucide React](https://lucide.dev/)
- **State & Persistence**: Unified `localStorage` reactive data engine with custom event dispatching (`auralife_storage_update`)
- **Checkout & Voucher**: Simulated 256-bit checkout modal with card/UPI and print media stylesheets for paperless e-tickets

---

## 🚀 Running the Project Locally

```bash
# 1. Install dependencies (already installed)
npm install

# 2. Run the development server
npm run dev

# 3. Open in browser
http://localhost:3000

# 4. Create production build
npm run build
npm run start
```

---

## 📁 Directory Structure

```
├── src/
│   ├── app/
│   │   ├── layout.jsx            # Root layout with RoleSwitcher, Navbar, Footer
│   │   ├── globals.css           # Tailwind + Custom fonts, print stylesheets
│   │   ├── page.jsx              # Homepage with hero, quick search & category showcases
│   │   ├── flights/page.jsx      # End-to-end flight booking workflow
│   │   ├── buses/page.jsx        # End-to-end bus booking with interactive seat layout
│   │   ├── hotels/page.jsx       # End-to-end hotel reservation workflow
│   │   ├── wellness/page.jsx     # Wellness appointments workflow
│   │   ├── properties/page.jsx   # Property buying & renting with site visit requests
│   │   ├── bookings/page.jsx     # Central My Bookings ledger & printable tickets
│   │   ├── dashboard/
│   │   │   ├── customer/page.jsx # Customer Dashboard (Bookings, Enquiries, Profile)
│   │   │   ├── provider/page.jsx # Provider Dashboard (Accept/Decline, Availability)
│   │   │   └── admin/page.jsx    # Administrator Dashboard (Partner approvals, GMV)
│   │   ├── partner/register/page.jsx # Become a Partner registration form
│   │   ├── login/page.jsx        # Login & 1-click persona switcher
│   │   └── register/page.jsx     # Customer registration
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.jsx        # Navigation bar with role indicators & notification bell
│   │   │   ├── Footer.jsx        # Commercial footer & platform sitemap
│   │   │   └── RoleSwitcher.jsx  # Floating top bar for 1-click persona switching
│   │   └── ui/
│   │       ├── Badge.jsx         # Status badges (Confirmed, Pending, Declined, Cancelled)
│   │       ├── PaymentModal.jsx  # Simulated checkout modal (Card, UPI QR, Net Banking)
│   │       └── TicketModal.jsx   # Boarding pass / e-ticket modal with barcode & print
│   ├── data/
│   │   ├── flightsData.js        # Sample airlines, routes, fares
│   │   ├── busesData.js          # Sample bus operators, sleeper matrices
│   │   ├── hotelsData.js         # Curated hotel resorts and suites
│   │   ├── wellnessData.js       # Certified practitioners and time slots
│   │   └── propertiesData.js     # Residential and commercial properties
│   └── services/
│       └── storage.js            # Unified localStorage engine & seed database
├── package.json
├── tailwind.config.js
└── next.config.js
```

---

## 🔐 Production Integration Roadmap

The application has been modularized with clean data abstractions:
- Replace `src/services/storage.js` methods with RESTful API / GraphQL endpoints.
- Connect PostgreSQL / Prisma ORM for relational persistence.
- Integrate real payment gateways (Stripe / Razorpay).
- Connect official GDS APIs (Amadeus, Sabre) for flight ticketing and AbhiBus/RedBus APIs for bus fleet distribution.
