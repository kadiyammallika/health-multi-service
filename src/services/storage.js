// Unified Storage and Demo Database Engine for OneConnect
// Provides localStorage persistence, real-time sync across components, and realistic seed data

const STORAGE_KEYS = {
  CURRENT_USER: 'oneconnect_current_user',
  LEGACY_CURRENT_USER: 'auralife_current_user',
  USERS: 'oneconnect_users',
  REMEMBER_EMAIL: 'oneconnect_remember_email',
  BOOKINGS: 'auralife_bookings',
  WELLNESS: 'auralife_wellness',
  ENQUIRIES: 'auralife_enquiries',
  PARTNERS: 'auralife_partners',
  NOTIFICATIONS: 'auralife_notifications',
};

// No dummy data — all data comes from the Supabase database

// Helpers for window event dispatching to ensure reactive UI
function notifyStorageChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auralife_storage_update'));
  }
}

// Initialize storage (minimal - just migrate legacy session)
export function initializeStorage() {
  if (typeof window === 'undefined') return;

  // Migrate legacy session key if present
  const legacyUser = localStorage.getItem(STORAGE_KEYS.LEGACY_CURRENT_USER);
  if (legacyUser && !localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, legacyUser);
  }
}

// Authentication & Account Dashboard Session Helpers

export function getDashboardUrl(accountType) {
  switch (accountType) {
    case 'provider':
      return '/dashboard/provider';
    case 'admin':
      return '/dashboard/admin';
    case 'customer':
    default:
      return '/dashboard/customer';
  }
}

export function getUsers() {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEYS.USERS);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  initializeStorage();
  if (localStorage.getItem('oneconnect_logged_out') === 'true') {
    return null;
  }
  const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || localStorage.getItem(STORAGE_KEYS.LEGACY_CURRENT_USER);
  if (!user) return null;
  try {
    return JSON.parse(user);
  } catch {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.LEGACY_CURRENT_USER);
    return null;
  }
}

export async function authenticateUser(email, password) {
  return await loginWithApi(email, password);
}

export async function registerUser({ name, email, password, phone }) {
  return await registerCustomerWithApi({ name, email, phone, password });
}

export function logoutUser() {
  if (typeof window === 'undefined') return;
  try {
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  } catch (e) {}
  localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  localStorage.removeItem(STORAGE_KEYS.LEGACY_CURRENT_USER);
  localStorage.setItem('oneconnect_logged_out', 'true');
  notifyStorageChange();
}

/**
 * Common Login API Call - Connects to Supabase / Backend
 * The backend automatically determines if the account is Customer, Provider, or Admin.
 */
export async function loginWithApi(email, password) {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        isPendingProvider: data.isPendingProvider || false,
        isRejectedProvider: data.isRejectedProvider || false,
        status: data.status || null,
        error: data.error || 'Authentication failed. Please verify your credentials.',
      };
    }

    const appUser = {
      ...data.user,
      role: data.user.accountType, // Ensure compatibility with existing dashboard views
      roles: data.user.roles || [data.user.accountType],
    };

    localStorage.removeItem('oneconnect_logged_out');
    setCurrentUser(appUser);

    return {
      success: true,
      user: appUser,
      redirectUrl: data.redirectUrl || getDashboardUrl(data.user.accountType),
    };
  } catch (err) {
    console.error('API login error:', err);
    return {
      success: false,
      error: 'Unable to connect to authentication backend. Please check server status.',
    };
  }
}

/**
 * Real-World Customer Registration API
 */
export async function registerCustomerWithApi({ name, email, phone, password }) {
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Registration failed.',
      };
    }

    const appUser = {
      ...data.user,
      role: data.user.accountType,
      roles: data.user.roles || [data.user.accountType],
    };

    localStorage.removeItem('oneconnect_logged_out');
    setCurrentUser(appUser);

    return {
      success: true,
      user: appUser,
      redirectUrl: data.redirectUrl || '/dashboard/customer',
    };
  } catch (err) {
    console.error('API register error:', err);
    return {
      success: false,
      error: 'Unable to reach backend registration service.',
    };
  }
}

/**
 * Real-World Provider Registration API
 */
export async function registerProviderWithApi(providerData) {
  try {
    const res = await fetch('/api/auth/provider-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(providerData),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Provider registration failed.',
      };
    }

    return {
      success: true,
      applicationStatus: data.applicationStatus || 'pending',
      provider: data.provider,
      message: data.message,
    };
  } catch (err) {
    console.error('API provider register error:', err);
    return {
      success: false,
      error: 'Unable to reach backend provider registration service.',
    };
  }
}

/**
 * Verifies current session token against /api/users/me with automatic refresh on token expiry
 */
export async function syncSessionFromBackend() {
  if (typeof window === 'undefined') return null;
  try {
    let res = await fetch('/api/users/me');

    // If access token is expired (401), attempt to rotate refresh token
    if (res.status === 401) {
      const refreshRes = await fetch('/api/auth/refresh', { method: 'POST' });
      if (refreshRes.ok) {
        res = await fetch('/api/users/me');
      }
    }

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data.success && data.user) {
      const appUser = {
        ...data.user,
        role: data.user.accountType,
        roles: data.user.roles || [data.user.accountType],
      };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(appUser));
      localStorage.removeItem('oneconnect_logged_out');
      notifyStorageChange();
      return appUser;
    }
    return null;
  } catch (e) {
    return null;
  }
}

export function setCurrentUser(userObj) {
  if (typeof window === 'undefined') return;
  if (!userObj) {
    logoutUser();
    return;
  }
  localStorage.removeItem('oneconnect_logged_out');
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(userObj));
  notifyStorageChange();
}

export function switchRole(newRole) {
  if (typeof window === 'undefined') return null;
  const user = getCurrentUser();
  if (!user || !user.roles || !user.roles.includes(newRole)) return null;
  const updatedUser = { ...user, role: newRole, accountType: newRole };
  localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
  notifyStorageChange();
  return updatedUser;
}

export function getRememberedEmail() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEYS.REMEMBER_EMAIL) || '';
}

export function setRememberedEmail(email, shouldRemember) {
  if (typeof window === 'undefined') return;
  if (shouldRemember && email) {
    localStorage.setItem(STORAGE_KEYS.REMEMBER_EMAIL, email.trim());
  } else {
    localStorage.removeItem(STORAGE_KEYS.REMEMBER_EMAIL);
  }
}

// Auto-refreshing fetch: retries once on 401 after refreshing the access token
export async function authFetch(url, options = {}) {
  let res = await fetch(url, options);
  if (res.status === 401) {
    const refreshRes = await fetch('/api/auth/refresh', { method: 'POST' });
    if (refreshRes.ok) {
      res = await fetch(url, options);
    }
  }
  return res;
}

// Bookings — Save to database via API
export async function saveBooking(bookingData) {
  try {
    const res = await authFetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reference: bookingData.reference || `BKG-${Date.now().toString(36).toUpperCase()}`,
        type: bookingData.type || 'flight',
        categoryTitle: bookingData.categoryTitle || bookingData.type,
        serviceName: bookingData.airline || bookingData.operator || bookingData.hotelName || bookingData.serviceName || '',
        fromLocation: bookingData.fromCity || bookingData.from || null,
        toLocation: bookingData.toCity || bookingData.to || null,
        travelDate: bookingData.date || bookingData.checkInDate || null,
        travelTime: bookingData.time || null,
        details: bookingData,
        totalAmount: bookingData.totalAmount || 0,
        fareBreakdown: bookingData.fareBreakdown || {},
        paymentMethod: bookingData.paymentMethod || 'Online Payment',
        providerId: bookingData.providerId || null,
        listingId: bookingData.listingId || null,
        displayCurrency: bookingData.displayCurrency || 'INR',
        exchangeRate: bookingData.exchangeRate || 1.0,
        originalCurrency: 'INR',
      }),
    });
    const data = await res.json();
    if (data.success) {
      notifyStorageChange();
      return { ...bookingData, id: data.booking.id, ...data.booking };
    }
    console.error('Save booking API error:', data.error);
    alert('Booking save failed: ' + (data.error || 'Unknown error'));
    return bookingData;
  } catch (err) {
    console.error('Save booking error:', err);
    alert('Booking save failed: ' + err.message);
    return bookingData;
  }
}

export async function cancelBooking(bookingId) {
  try {
    await authFetch('/api/bookings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, status: 'Cancelled' }),
    });
    notifyStorageChange();
    return true;
  } catch {
    return false;
  }
}

// Wellness Appointments — Save to database via API
export async function saveWellnessAppointment(aptData) {
  try {
    const res = await authFetch('/api/wellness', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        practitionerName: aptData.practitionerName,
        specialization: aptData.specialization,
        date: aptData.date,
        timeSlot: aptData.timeSlot,
        consultationMode: aptData.consultationMode,
        duration: aptData.duration,
        price: aptData.price,
        patientName: aptData.patientName,
        patientEmail: aptData.patientEmail,
        patientPhone: aptData.patientPhone,
        notes: aptData.notes,
      }),
    });
    const data = await res.json();
    if (data.success) {
      // Also create a booking entry so provider sees it in their Bookings tab
      try {
        await saveBooking({
          type: 'wellness',
          categoryTitle: 'Wellness Appointment',
          reference: `WEL-${Date.now().toString(36).toUpperCase()}`,
          serviceName: aptData.practitionerName || '',
          travelDate: aptData.date,
          time: aptData.timeSlot,
          totalAmount: aptData.price || 0,
          paymentMethod: 'Online Payment',
          providerId: aptData.providerId || null,
          listingId: aptData.listingId || null,
          contactEmail: aptData.patientEmail || '',
          contactName: aptData.patientName || '',
        });
      } catch (bookingErr) {
        console.error('Wellness booking entry error:', bookingErr);
      }
      notifyStorageChange();
      return { ...aptData, id: data.appointment.id };
    }
    throw new Error(data.error || 'Failed to save appointment');
  } catch (err) {
    throw err;
  }
}

export async function updateWellnessAppointmentStatus(aptId, newStatus) {
  try {
    await authFetch('/api/wellness', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId: aptId, status: newStatus }),
    });
    notifyStorageChange();
    return true;
  } catch {
    return false;
  }
}

// Property Enquiries — Save to database via API
export async function savePropertyEnquiry(enqData) {
  try {
    const res = await authFetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        propertyTitle: enqData.propertyTitle,
        propertyLocation: enqData.propertyLocation,
        purpose: enqData.purpose,
        priceDisplay: enqData.priceDisplay,
        enquiryType: enqData.enquiryType,
        preferredDate: enqData.preferredDate,
        preferredTime: enqData.preferredTime,
        message: enqData.message,
        agentName: enqData.agentName,
        agentEmail: enqData.agentEmail,
      }),
    });
    const data = await res.json();
    if (data.success) {
      notifyStorageChange();
      return { ...enqData, id: data.enquiry.id };
    }
    return enqData;
  } catch (err) {
    console.error('Save enquiry error:', err);
    return enqData;
  }
}

// Partners — fetched from API (admin dashboard handles this)
export function getPartners() {
  return [];
}

export function savePartnerApplication() {
  // No longer saving to localStorage — partner registration goes through API
  return null;
}

export function updatePartnerStatus() {
  return false;
}

// Notifications — kept in localStorage (lightweight, session-specific)
export function getNotifications() {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function addNotification({ userId, title, message, type = 'info' }) {
  if (typeof window === 'undefined') return;
  const notifs = getNotifications();
  const newNotif = {
    id: `NOTIF-${Date.now()}`,
    userId, title, message, type,
    timestamp: new Date().toISOString(),
    read: false
  };
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([newNotif, ...notifs]));
  notifyStorageChange();
}

export function markNotificationRead(id) {
  if (typeof window === 'undefined') return;
  const notifs = getNotifications();
  const updated = notifs.map(n => (n.id === id ? { ...n, read: true } : n));
  localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
  notifyStorageChange();
}

// Legacy getters for backward compatibility (return empty arrays)
export function getBookings() { return []; }
export function getWellnessAppointments() { return []; }
export function getPropertyEnquiries() { return []; }
