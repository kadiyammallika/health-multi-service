// Unified Storage and Demo Database Engine for AuraLife
// Provides localStorage persistence, real-time sync across components, and realistic seed data

const STORAGE_KEYS = {
  CURRENT_USER: 'auralife_current_user',
  BOOKINGS: 'auralife_bookings',
  WELLNESS: 'auralife_wellness',
  ENQUIRIES: 'auralife_enquiries',
  PARTNERS: 'auralife_partners',
  NOTIFICATIONS: 'auralife_notifications',
};

// Seed accounts for 1-click role testing
export const DEMO_USERS = {
  customer: {
    id: 'USR-CUST-1',
    name: 'Alex Morgan',
    email: 'alex.morgan@example.com',
    phone: '+91 98765 43210',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    memberSince: 'Jan 2025'
  },
  provider: {
    id: 'PRAC-001',
    name: 'Dr. Aarav Patel',
    businessName: 'Zenith Ayurvedic & Holistic Healing',
    email: 'dr.aarav@zenithwellness.com',
    phone: '+91 98111 22334',
    role: 'provider',
    category: 'wellness',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80',
    status: 'Verified Partner'
  },
  admin: {
    id: 'USR-ADM-99',
    name: 'Sarah Jenkins (Admin)',
    email: 'admin@auralife.com',
    phone: '+91 99000 88776',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    badge: 'Super Administrator'
  }
};

// Realistic initial bookings
const INITIAL_BOOKINGS = [
  {
    id: 'BKG-FL-8921',
    type: 'flight',
    categoryTitle: 'Flight Booking',
    reference: 'FL-AS402-9921',
    airline: 'AeroSky Air',
    flightNumber: 'AS-402',
    from: 'DEL',
    to: 'BOM',
    fromCity: 'New Delhi',
    toCity: 'Mumbai',
    date: '2026-11-12',
    time: '06:15 AM - 08:30 AM',
    passengers: [
      { name: 'Alex Morgan', age: '32', gender: 'Female', seat: '12F' }
    ],
    contactEmail: 'alex.morgan@example.com',
    contactPhone: '+91 98765 43210',
    totalAmount: 5520,
    fareBreakdown: {
      baseFare: 4850,
      taxes: 520,
      convenienceFee: 150
    },
    status: 'Confirmed',
    bookedAt: '2026-11-01T10:14:00Z',
    paymentMethod: 'Credit Card (Simulated)'
  },
  {
    id: 'BKG-BS-4402',
    type: 'bus',
    categoryTitle: 'Bus Booking',
    reference: 'BUS-ZB-7734',
    operator: 'Zingbus Royal Class',
    busType: 'Volvo 9600 Multi-Axle A/C Sleeper (2+1)',
    fromCity: 'New Delhi',
    toCity: 'Jaipur',
    date: '2026-11-18',
    time: '10:30 PM - 04:30 AM',
    selectedSeats: ['U3', 'U4'],
    passengers: [
      { name: 'Alex Morgan', age: '32', gender: 'Female', seat: 'U3' },
      { name: 'Rohan Sharma', age: '34', gender: 'Male', seat: 'U4' }
    ],
    boardingPoint: 'Dhaula Kuan - 10:45 PM',
    droppingPoint: 'Sindhi Camp Jaipur - 04:15 AM',
    contactEmail: 'alex.morgan@example.com',
    contactPhone: '+91 98765 43210',
    totalAmount: 1850,
    fareBreakdown: {
      baseFare: 1700,
      taxes: 90,
      convenienceFee: 60
    },
    status: 'Confirmed',
    bookedAt: '2026-11-02T14:22:00Z',
    paymentMethod: 'UPI (Simulated)'
  },
  {
    id: 'BKG-HTL-1190',
    type: 'hotel',
    categoryTitle: 'Hotel Reservation',
    reference: 'HTL-HP-3392',
    hotelName: 'The Heritage Palace & Royal Spa',
    city: 'Jaipur, Rajasthan',
    roomName: 'Deluxe Heritage Courtyard Room',
    checkInDate: '2026-11-19',
    checkOutDate: '2026-11-21',
    nights: 2,
    guestsCount: 2,
    roomsCount: 1,
    contactEmail: 'alex.morgan@example.com',
    contactPhone: '+91 98765 43210',
    totalAmount: 19890,
    fareBreakdown: {
      baseFare: 17000,
      taxes: 2390,
      resortFee: 500
    },
    status: 'Confirmed',
    bookedAt: '2026-11-02T16:00:00Z',
    paymentMethod: 'Net Banking (Simulated)'
  }
];

// Initial wellness appointments demonstrating Pending & Confirmed statuses
const INITIAL_WELLNESS_APPOINTMENTS = [
  {
    id: 'APT-WL-3011',
    practitionerId: 'PRAC-001',
    practitionerName: 'Dr. Aarav Patel, BAMS, MD (Ayu)',
    category: 'ayurveda',
    specialization: 'Ayurvedic Medicine & Chronic Dosha Detox',
    patientName: 'Alex Morgan',
    patientEmail: 'alex.morgan@example.com',
    patientPhone: '+91 98765 43210',
    date: '2026-11-08',
    timeSlot: '11:30 AM',
    consultationMode: 'Online Video Session',
    duration: '45 mins',
    price: 1200,
    notes: 'Experiencing chronic fatigue, seeking personalized dietary & herbal routine.',
    status: 'Pending', // Pending provider acceptance!
    bookedAt: '2026-11-03T09:30:00Z'
  },
  {
    id: 'APT-WL-3012',
    practitionerId: 'PRAC-002',
    practitionerName: 'Sunita Sharma, RYT 500',
    category: 'yoga',
    specialization: 'Therapeutic Hatha & Ashtanga Vinyasa',
    patientName: 'Alex Morgan',
    patientEmail: 'alex.morgan@example.com',
    patientPhone: '+91 98765 43210',
    date: '2026-11-10',
    timeSlot: '07:00 AM',
    consultationMode: 'Online 1-on-1 Video Session',
    duration: '60 mins',
    price: 850,
    notes: 'Lower back stiffness relief posture focus.',
    status: 'Confirmed',
    bookedAt: '2026-11-02T11:15:00Z'
  }
];

// Initial property enquiries (Separate from ticket bookings!)
const INITIAL_ENQUIRIES = [
  {
    id: 'ENQ-9921',
    propertyId: 'PROP-501',
    propertyTitle: 'Serene Glasshouse Villa with Private Zen Pool',
    propertyLocation: 'Siolim, North Goa',
    purpose: 'buy',
    priceDisplay: '₹3.85 Cr',
    clientName: 'Alex Morgan',
    clientEmail: 'alex.morgan@example.com',
    clientPhone: '+91 98765 43210',
    enquiryType: 'Site Visit & Inspection Request',
    preferredDate: '2026-11-22',
    preferredTime: 'Morning (10:00 AM)',
    message: 'We are flying down to Goa and would love an in-person site walk-through with our architect.',
    agentEmail: 'elena@primeestates.com',
    agentName: 'Elena Vance - Prime Estates Realty',
    status: 'Under Review',
    createdAt: '2026-11-03T14:40:00Z'
  }
];

// Initial partner registrations for admin verification workflow
const INITIAL_PARTNERS = [
  {
    id: 'PTR-801',
    businessName: 'Vayu Himalaya Air Charters',
    category: 'travel',
    categoryLabel: 'Aviation & Flight Partner',
    contactPerson: 'Capt. R. K. Kapoor',
    email: 'contact@vayuhimalaya.com',
    phone: '+91 98101 44556',
    licenseNumber: 'DGCA-OPR-94821',
    yearsInBusiness: 6,
    address: 'Terminal 1D Plaza, New Delhi',
    appliedDate: '2026-11-02',
    status: 'Pending Verification', // Admin can approve/reject
    documentsUploaded: ['DGCA Certificate.pdf', 'Tax Compliance.pdf']
  },
  {
    id: 'PTR-802',
    businessName: 'Nirvana Holistics Retreat & Spa',
    category: 'wellness',
    categoryLabel: 'Wellness Practitioner / Retreat',
    contactPerson: 'Dr. Kavita Namboodiri',
    email: 'info@nirvanaholistics.in',
    phone: '+91 97451 90876',
    licenseNumber: 'AYUSH-NAT-2023-881',
    yearsInBusiness: 8,
    address: 'Kumarakom Backwaters, Kerala',
    appliedDate: '2026-11-01',
    status: 'Pending Verification',
    documentsUploaded: ['AYUSH Board Registration.pdf', 'Clinic Permit.pdf']
  },
  {
    id: 'PTR-803',
    businessName: 'Zingbus Fleet Operations',
    category: 'bus',
    categoryLabel: 'Bus Operator Partner',
    contactPerson: 'Vikram Malhotra',
    email: 'fleet@zingbus.com',
    phone: '+91 98991 12233',
    licenseNumber: 'STA-DL-2020-552',
    yearsInBusiness: 5,
    address: 'Kashmere Gate, New Delhi',
    appliedDate: '2026-10-25',
    status: 'Approved',
    documentsUploaded: ['Fleet Insurance.pdf', 'Permit.pdf']
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-1',
    userId: 'USR-CUST-1',
    title: 'Flight Booking Confirmed! ✈️',
    message: 'Your flight AS-402 from New Delhi to Mumbai on Nov 12 is confirmed. Ref: FL-AS402-9921',
    type: 'success',
    timestamp: '2026-11-01T10:15:00Z',
    read: false
  },
  {
    id: 'NOTIF-2',
    userId: 'USR-CUST-1',
    title: 'Wellness Request Submitted 🌿',
    message: 'Appointment request sent to Dr. Aarav Patel for Nov 8 at 11:30 AM. Status is Pending acceptance.',
    type: 'info',
    timestamp: '2026-11-03T09:31:00Z',
    read: false
  }
];

// Helpers for window event dispatching to ensure reactive UI
function notifyStorageChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auralife_storage_update'));
  }
}

// Initialize seed data if not present
export function initializeStorage() {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(DEMO_USERS.customer));
  }
  if (!localStorage.getItem(STORAGE_KEYS.BOOKINGS)) {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(INITIAL_BOOKINGS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.WELLNESS)) {
    localStorage.setItem(STORAGE_KEYS.WELLNESS, JSON.stringify(INITIAL_WELLNESS_APPOINTMENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.ENQUIRIES)) {
    localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(INITIAL_ENQUIRIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PARTNERS)) {
    localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(INITIAL_PARTNERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
  }
}

// Authentication / User Session Helpers
export function getCurrentUser() {
  if (typeof window === 'undefined') return DEMO_USERS.customer;
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  return user ? JSON.parse(user) : DEMO_USERS.customer;
}

export function switchRole(roleKey) {
  if (typeof window === 'undefined') return;
  const targetUser = DEMO_USERS[roleKey] || DEMO_USERS.customer;
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(targetUser));
  notifyStorageChange();
  return targetUser;
}

export function setCurrentUser(userObj) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userObj));
  notifyStorageChange();
}

// Bookings (Flights, Buses, Hotels)
export function getBookings() {
  if (typeof window === 'undefined') return INITIAL_BOOKINGS;
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
  return raw ? JSON.parse(raw) : INITIAL_BOOKINGS;
}

export function saveBooking(bookingData) {
  if (typeof window === 'undefined') return null;
  initializeStorage();
  const bookings = getBookings();
  const newBooking = {
    ...bookingData,
    id: bookingData.id || `BKG-${Date.now().toString(36).toUpperCase()}`,
    bookedAt: new Date().toISOString(),
    status: bookingData.status || 'Confirmed'
  };
  const updated = [newBooking, ...bookings];
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));

  // Also push a notification
  addNotification({
    userId: bookingData.userId || 'USR-CUST-1',
    title: `${bookingData.categoryTitle || 'Service'} Confirmed! 🎉`,
    message: `Reference: ${newBooking.reference}. Total: ₹${newBooking.totalAmount?.toLocaleString()}`,
    type: 'success'
  });

  notifyStorageChange();
  return newBooking;
}

export function cancelBooking(bookingId) {
  if (typeof window === 'undefined') return false;
  const bookings = getBookings();
  const updated = bookings.map((b) => {
    if (b.id === bookingId) {
      return { ...b, status: 'Cancelled', cancelledAt: new Date().toISOString() };
    }
    return b;
  });
  localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(updated));
  notifyStorageChange();
  return true;
}

// Wellness Appointments
export function getWellnessAppointments() {
  if (typeof window === 'undefined') return INITIAL_WELLNESS_APPOINTMENTS;
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.WELLNESS);
  return raw ? JSON.parse(raw) : INITIAL_WELLNESS_APPOINTMENTS;
}

export function saveWellnessAppointment(aptData) {
  if (typeof window === 'undefined') return null;
  initializeStorage();
  const appointments = getWellnessAppointments();

  // Prevent duplicate demo appointments for same practitioner and slot
  const isDuplicate = appointments.some(
    (a) =>
      a.practitionerId === aptData.practitionerId &&
      a.date === aptData.date &&
      a.timeSlot === aptData.timeSlot &&
      a.status !== 'Declined' &&
      a.status !== 'Cancelled'
  );

  if (isDuplicate) {
    throw new Error('This time slot is already booked for this practitioner. Please select another slot.');
  }

  const newApt = {
    ...aptData,
    id: aptData.id || `APT-WL-${Date.now().toString(36).toUpperCase()}`,
    status: 'Pending', // Mandatory initial status
    bookedAt: new Date().toISOString()
  };

  const updated = [newApt, ...appointments];
  localStorage.setItem(STORAGE_KEYS.WELLNESS, JSON.stringify(updated));

  addNotification({
    userId: aptData.patientId || 'USR-CUST-1',
    title: 'Wellness Request Sent 🌿',
    message: `Request for ${newApt.practitionerName} on ${newApt.date} at ${newApt.timeSlot} is Pending acceptance.`,
    type: 'info'
  });

  notifyStorageChange();
  return newApt;
}

export function updateWellnessAppointmentStatus(aptId, newStatus) {
  if (typeof window === 'undefined') return false;
  const list = getWellnessAppointments();
  let updatedApt = null;
  const updated = list.map((a) => {
    if (a.id === aptId) {
      updatedApt = { ...a, status: newStatus, respondedAt: new Date().toISOString() };
      return updatedApt;
    }
    return a;
  });
  localStorage.setItem(STORAGE_KEYS.WELLNESS, JSON.stringify(updated));

  if (updatedApt) {
    addNotification({
      userId: updatedApt.patientId || 'USR-CUST-1',
      title: `Wellness Appointment ${newStatus}! ${newStatus === 'Confirmed' ? '✅' : '❌'}`,
      message: `${updatedApt.practitionerName} has ${newStatus.toLowerCase()} your session for ${updatedApt.date} at ${updatedApt.timeSlot}.`,
      type: newStatus === 'Confirmed' ? 'success' : 'warning'
    });
  }

  notifyStorageChange();
  return true;
}

// Property Enquiries (Kept strictly separate from ticket bookings)
export function getPropertyEnquiries() {
  if (typeof window === 'undefined') return INITIAL_ENQUIRIES;
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.ENQUIRIES);
  return raw ? JSON.parse(raw) : INITIAL_ENQUIRIES;
}

export function savePropertyEnquiry(enqData) {
  if (typeof window === 'undefined') return null;
  initializeStorage();
  const enquiries = getPropertyEnquiries();
  const newEnq = {
    ...enqData,
    id: enqData.id || `ENQ-${Math.floor(10000 + Math.random() * 90000)}`,
    status: 'Received',
    createdAt: new Date().toISOString()
  };
  const updated = [newEnq, ...enquiries];
  localStorage.setItem(STORAGE_KEYS.ENQUIRIES, JSON.stringify(updated));

  addNotification({
    userId: 'USR-CUST-1',
    title: 'Property Enquiry Submitted 🏡',
    message: `Reference: ${newEnq.id} for "${newEnq.propertyTitle}". The agent will contact you shortly.`,
    type: 'info'
  });

  notifyStorageChange();
  return newEnq;
}

// Partner Registrations & Admin Approval
export function getPartners() {
  if (typeof window === 'undefined') return INITIAL_PARTNERS;
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.PARTNERS);
  return raw ? JSON.parse(raw) : INITIAL_PARTNERS;
}

export function savePartnerApplication(partnerData) {
  if (typeof window === 'undefined') return null;
  initializeStorage();
  const partners = getPartners();
  const newPartner = {
    ...partnerData,
    id: `PTR-${Math.floor(1000 + Math.random() * 9000)}`,
    appliedDate: new Date().toISOString().split('T')[0],
    status: 'Pending Verification'
  };
  const updated = [newPartner, ...partners];
  localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(updated));
  notifyStorageChange();
  return newPartner;
}

export function updatePartnerStatus(partnerId, newStatus) {
  if (typeof window === 'undefined') return false;
  const partners = getPartners();
  const updated = partners.map((p) => {
    if (p.id === partnerId) {
      return { ...p, status: newStatus, decisionDate: new Date().toISOString() };
    }
    return p;
  });
  localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(updated));
  notifyStorageChange();
  return true;
}

// Notifications
export function getNotifications() {
  if (typeof window === 'undefined') return INITIAL_NOTIFICATIONS;
  initializeStorage();
  const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  return raw ? JSON.parse(raw) : INITIAL_NOTIFICATIONS;
}

export function addNotification({ userId, title, message, type = 'info' }) {
  if (typeof window === 'undefined') return;
  const notifs = getNotifications();
  const newNotif = {
    id: `NOTIF-${Date.now()}`,
    userId,
    title,
    message,
    type,
    timestamp: new Date().toISOString(),
    read: false
  };
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([newNotif, ...notifs]));
  notifyStorageChange();
}

export function markNotificationRead(id) {
  if (typeof window === 'undefined') return;
  const notifs = getNotifications();
  const updated = notifs.map((n) => (n.id === id ? { ...n, read: true } : n));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
  notifyStorageChange();
}
